import os
import subprocess
import urllib.request
import json
import ssl
import re
from urllib.parse import quote

# Bunny Storage API details
API_KEY = "9268ef2d-28c0-4827-a29127346d24-5d2b-47a1"
ZONE_NAME = "pelimotion-assets"
STORAGE_ENDPOINT = "https://storage.bunnycdn.com"
FFMPEG_PATH = "/opt/homebrew/bin/ffmpeg" # or simply 'ffmpeg' if in path
FFPROBE_PATH = "/opt/homebrew/bin/ffprobe"

def api_call(path, method="GET", data=None):
    url = f"{STORAGE_ENDPOINT}/{ZONE_NAME}/{quote(path.lstrip('/'))}"
    headers = {
        "AccessKey": API_KEY,
        "accept": "application/json"
    }
    if method == "PUT":
        headers["content-type"] = "application/octet-stream"
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    context = ssl._create_unverified_context()
    try:
        with urllib.request.urlopen(req, context=context) as response:
            if method == "GET":
                return json.loads(response.read().decode('utf-8'))
            return True
    except Exception as e:
        print(f"API Error ({url}): {e}")
        return None

def get_video_duration(filepath):
    cmd = [FFPROBE_PATH, "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filepath]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    try:
        return float(result.stdout)
    except:
        return 0

def optimize_video(client_name, folder_name, filename):
    remote_path = f"Medias Portfolio/{client_name}/{folder_name}/{filename}" if folder_name else f"Medias Portfolio/{client_name}/{filename}"
    local_input = "temp_input.mp4"
    
    # Download file for processing
    print(f"  Downloading {filename}...")
    url = f"https://pelimotion.b-cdn.net/{quote(remote_path)}"
    urllib.request.urlretrieve(url, local_input)
    
    duration = get_video_duration(local_input)
    if duration <= 0:
        print(f"  Failed to get duration for {filename}")
        return

    base_name = filename.rsplit('.', 1)[0]
    
    # 1. Preview Video (Ultra lightweight)
    # 480px width, no audio, low bitrate
    preview_file = f"{base_name}_preview.mp4"
    print(f"  Generating {preview_file}...")
    subprocess.run([
        FFMPEG_PATH, "-y", "-i", local_input,
        "-vf", "scale=480:-2", "-an", "-vcodec", "libx264", "-crf", "32", "-preset", "faster",
        preview_file
    ], capture_output=True)
    
    # 2. Mosaic Frames (15%, 50%, 85%)
    frames = []
    for pct in [15, 50, 85]:
        out = f"{base_name}_{pct}.jpg"
        time = duration * (pct / 100)
        print(f"  Generating frame at {pct}% ({time:.2f}s)...")
        subprocess.run([
            FFMPEG_PATH, "-y", "-ss", str(time), "-i", local_input,
            "-vframes", "1", "-q:v", "5", out
        ], capture_output=True)
        frames.append(out)
    
    # 3. Standard Poster
    poster = f"{base_name}.jpg"
    subprocess.run([FFMPEG_PATH, "-y", "-ss", str(duration/2), "-i", local_input, "-vframes", "1", poster], capture_output=True)
    
    # Upload everything back
    base_remote_dir = remote_path.rsplit('/', 1)[0]
    for f in [preview_file, poster] + frames:
        if os.path.exists(f):
            print(f"  Uploading {f}...")
            with open(f, "rb") as fd:
                api_call(f"{base_remote_dir}/{f}", "PUT", data=fd.read())
            os.remove(f)
    
    os.remove(local_input)

def scan_and_optimize():
    print("Starting Portfolio Optimization...")
    root_items = api_call("/Medias Portfolio/")
    if not root_items: return

    for client in root_items:
        if not client.get("IsDirectory"): continue
        client_name = client["ObjectName"]
        print(f"\nScanning Client: {client_name}")
        
        client_path = f"/Medias Portfolio/{client_name}/"
        items = api_call(client_path)
        
        folders_to_scan = [("", items)] # (folder_name, items)
        
        for item in items:
            if item.get("IsDirectory"):
                folders_to_scan.append((item["ObjectName"], api_call(f"{client_path}{item['ObjectName']}/")))
        
        for folder_name, folder_items in folders_to_scan:
            # Check for existing previews to skip
            existing = [i["ObjectName"] for i in folder_items]
            
            for item in folder_items:
                name = item["ObjectName"]
                if name.endswith(('.mp4', '.mov')) and not name.endswith('_preview.mp4'):
                    preview_name = name.rsplit('.', 1)[0] + "_preview.mp4"
                    if preview_name not in existing:
                        print(f"Optimization needed for: {name}")
                        try:
                            optimize_video(client_name, folder_name, name)
                        except Exception as e:
                            print(f"  Error optimizing {name}: {e}")
                    else:
                        print(f"  [Skipping] {name} (Already optimized)")

if __name__ == "__main__":
    scan_and_optimize()
