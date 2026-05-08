import os
import urllib.request

urls = [
    "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
    "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm"
]

os.makedirs("ffmpeg_assets", exist_ok=True)

for url in urls:
    filename = url.split("/")[-1]
    filepath = os.path.join("ffmpeg_assets", filename)
    print(f"Downloading {filename}...")
    urllib.request.urlretrieve(url, filepath)
    print(f"Saved to {filepath}")
