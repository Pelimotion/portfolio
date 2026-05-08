import os
import urllib.request

urls = [
    "https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js",
    "https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/814.ffmpeg.js",
    "https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js"
]

os.makedirs("ffmpeg_assets", exist_ok=True)

for url in urls:
    filename = url.split("/")[-1]
    if filename == 'index.js':
        filename = 'ffmpeg-util.js' # Rename index.js to ffmpeg-util.js for clarity in Bunny.net
    filepath = os.path.join("ffmpeg_assets", filename)
    print(f"Downloading {filename}...")
    urllib.request.urlretrieve(url, filepath)
    print(f"Saved to {filepath}")
