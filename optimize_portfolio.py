import os
import subprocess
import json
import hashlib
import urllib.request
import ssl
from urllib.parse import quote

# ─── CONFIGURATION ───
API_KEY = "9268ef2d-28c0-4827-a29127346d24-5d2b-47a1"
ZONE_NAME = "pelimotion-assets"
STORAGE_ENDPOINT = "https://storage.bunnycdn.com"
FFMPEG_PATH = "/opt/homebrew/bin/ffmpeg"
FFPROBE_PATH = "/opt/homebrew/bin/ffprobe"
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
    
    # Remote path on Bunny
    # e.g. Medias Portfolio/Client/Video.mp4 -> Medias Portfolio/Client/
    remote_dir_path = local_path.rsplit('/', 1)[0] if '/' in local_path else BASE_DIR

    # 1. Preview Video (Ultra lightweight)
    preview_filename = f"{base_name}_preview.mp4"
    preview_local = os.path.join(local_dir, preview_filename)
    print(f"    -> Generating Preview...")
    subprocess.run([
        FFMPEG_PATH, "-y", "-i", local_path,
        "-vf", "scale=480:-2", "-an", "-vcodec", "libx264", "-crf", "32", "-preset", "faster",
        preview_local
    ], capture_output=True)
    
    # 2. Mosaic Frames & Poster
    artifacts = [preview_local]
    frames = [15, 50, 85]
    for pct in frames:
        out_name = f"{base_name}_{pct}.jpg"
        out_path = os.path.join(local_dir, out_name)
        time = duration * (pct / 100)
        subprocess.run([
            FFMPEG_PATH, "-y", "-ss", str(time), "-i", local_path,
            "-vframes", "1", "-q:v", "5", out_path
        ], capture_output=True)
        artifacts.append(out_path)
        
    poster_name = f"{base_name}.jpg"
    poster_path = os.path.join(local_dir, poster_name)
    subprocess.run([FFMPEG_PATH, "-y", "-ss", str(duration/2), "-i", local_path, "-vframes", "1", poster_path], capture_output=True)
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
