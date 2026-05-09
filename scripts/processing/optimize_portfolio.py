import os
import subprocess
import json
import hashlib
import urllib.request
import ssl
from urllib.parse import quote
import cv2
import numpy as np
import sys

# Load local utils
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from utils.env_loader import load_env

load_env()

# ─── CONFIGURATION ───
API_KEY = os.getenv("BUNNY_API_KEY")
ZONE_NAME = os.getenv("BUNNY_STORAGE_ZONE")

if not API_KEY or not ZONE_NAME:
    print("❌ ERROR: BUNNY_API_KEY or BUNNY_STORAGE_ZONE not set in .env")
    sys.exit(1)

STORAGE_ENDPOINT = "https://storage.bunnycdn.com"
FFMPEG_PATH = os.getenv("FFMPEG_PATH", "/opt/homebrew/bin/ffmpeg")
FFPROBE_PATH = os.getenv("FFPROBE_PATH", "/opt/homebrew/bin/ffprobe")
MANIFEST_FILE = "media_manifest.json"
BASE_DIR = "Medias Portfolio"

# ─── CORE TOOLS ───
def get_file_hash(filepath):
    """Calculates SHA-256 for incremental tracking."""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        # Read in 4K blocks
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def api_call(path, method="PUT", data=None):
    """Uploads files to Bunny Storage."""
    url = f"{STORAGE_ENDPOINT}/{ZONE_NAME}/{quote(path.lstrip('/'))}"
    headers = {
        "AccessKey": API_KEY,
        "accept": "application/json",
        "content-type": "application/octet-stream"
    }
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    context = ssl._create_unverified_context()
    try:
        with urllib.request.urlopen(req, context=context) as response:
            return True
    except Exception as e:
        print(f"  [Error] API Upload Failed: {e}")
        return False

def get_video_duration(filepath):
    cmd = [FFPROBE_PATH, "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filepath]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    try:
        return float(result.stdout)
    except:
        return 0

def extract_smart_frame(video_path, out_path, target_time_sec):
    """Uses OpenCV to extract a frame near target_time_sec that has good brightness and variance (avoids black/empty frames)."""
    cap = cv2.VideoCapture(video_path)
    cap.set(cv2.CAP_PROP_POS_MSEC, target_time_sec * 1000)
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0: fps = 30
    
    max_frames_to_try = int(fps * 2) # check up to 2 seconds forward
    
    best_frame = None
    best_score = -1
    
    for _ in range(max_frames_to_try):
        ret, frame = cap.read()
        if not ret: break
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        mean = np.mean(gray)
        variance = np.var(gray)
        
        if 20 < mean < 235 and variance > 150:
            cv2.imwrite(out_path, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
            cap.release()
            return True
            
        score = variance
        if score > best_score:
            best_score = score
            best_frame = frame
            
    if best_frame is not None:
        cv2.imwrite(out_path, best_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
    
    cap.release()
    return True

# ─── OPTIMIZATION ENGINE ───
def process_video(local_path, manifest):
    """Generates preview, poster and frames locally then uploads."""
    file_id = local_path.replace("\\", "/") # normalize path
    current_hash = get_file_hash(local_path)
    
    # Check manifest for existing hash
    if manifest.get(file_id) == current_hash:
        print(f"  [Skipping] {local_path} (Hash matched)")
        return True

    print(f"  [Processing] {local_path}...")
    duration = get_video_duration(local_path)
    if duration <= 0:
        print(f"  [Error] Could not read duration for {local_path}")
        return False

    base_name = os.path.basename(local_path).rsplit('.', 1)[0]
    local_dir = os.path.dirname(local_path)
    
    # Remote path on Bunny (strip the local BASE_DIR prefix to upload to root)
    if local_path.startswith(BASE_DIR):
        remote_dir_path = os.path.dirname(local_path[len(BASE_DIR):].lstrip('/'))
    else:
        remote_dir_path = os.path.dirname(local_path)

    # 1. Preview Video (Ultra lightweight)
    preview_filename = f"{base_name}_preview.mp4"
    preview_local = os.path.join(local_dir, preview_filename)
    print(f"    -> Generating Preview...")
    subprocess.run([
        FFMPEG_PATH, "-y", "-i", local_path,
        "-vf", "scale=480:-2", "-an", "-vcodec", "libx264", "-crf", "32", "-preset", "faster",
        preview_local
    ], capture_output=True)
    
    # 2. Mosaic Frames & Poster (Using Smart OpenCV Extraction)
    artifacts = [preview_local]
    frames = [15, 50, 85]
    for pct in frames:
        out_name = f"{base_name}_{pct}.jpg"
        out_path = os.path.join(local_dir, out_name)
        time = duration * (pct / 100)
        extract_smart_frame(local_path, out_path, time)
        artifacts.append(out_path)
        
    poster_name = f"{base_name}.jpg"
    poster_path = os.path.join(local_dir, poster_name)
    extract_smart_frame(local_path, poster_path, duration / 2)
    artifacts.append(poster_path)

    # 3. Upload Artifacts + Main Video to Bunny
    success = True
    
    # Upload main video first
    main_name = os.path.basename(local_path)
    main_remote_path = f"{remote_dir_path}/{main_name}"
    print(f"    -> Uploading Main Video: {main_name}...")
    with open(local_path, "rb") as fd:
        if not api_call(main_remote_path, "PUT", data=fd.read()):
            success = False

    # Upload generated artifacts
    for artifact in artifacts:
        name = os.path.basename(artifact)
        remote_path = f"{remote_dir_path}/{name}"
        print(f"    -> Uploading {name}...")
        with open(artifact, "rb") as fd:
            if not api_call(remote_path, "PUT", data=fd.read()):
                success = False
        # Remove local artifact after upload to keep SSD clean (optional)
        if os.path.exists(artifact):
            os.remove(artifact)

    if success:
        manifest[file_id] = current_hash
        return True
    return False

def scan_local_media():
    print("\n--- Portfolio Incremental Optimizer ---")
    
    # Load manifest
    manifest = {}
    if os.path.exists(MANIFEST_FILE):
        try:
            with open(MANIFEST_FILE, 'r') as f:
                manifest = json.load(f)
        except:
            print("  [Warning] Manifest corrupted. Starting fresh.")

    # Walk local directory
    if not os.path.exists(BASE_DIR):
        print(f"  [Error] Local directory '{BASE_DIR}' not found.")
        return

    processed_count = 0
    for root, dirs, files in os.walk(BASE_DIR):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in ['.mp4', '.mov', '.avi'] and not file.endswith('_preview.mp4'):
                full_path = os.path.join(root, file)
                if process_video(full_path, manifest):
                    processed_count += 1
                    # Save manifest incrementally
                    with open(MANIFEST_FILE, 'w') as f:
                        json.dump(manifest, f, indent=2)

    print(f"\n--- Done. Processed {processed_count} files ---\n")

if __name__ == "__main__":
    scan_local_media()
