import os
import subprocess
import json
import math
from pathlib import Path

# --- CONFIGURATION ---
BASE_DIR = Path("/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio")
MEDIA_FOLDER = BASE_DIR / "Medias Portfolio"
OUTPUT_DIR = BASE_DIR / "contra_pipeline" / "drafts"
PROJECTS = ["Beleza na Web", "Fast Shipping", "Rio Carnaval", "Funky Room"]

# --- HELPER FUNCTIONS ---

def get_video_duration(video_path):
    """Returns duration in seconds using ffprobe."""
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(video_path)
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return float(result.stdout.strip())
    except Exception as e:
        print(f"Error getting duration for {video_path}: {e}")
        return 0

def extract_styleframes(video_path, output_prefix):
    """Extracts 3 scene-change based frames."""
    print(f"  > Extracting styleframes for {video_path.name}...")
    # Using scene detection filter. 0.3 is a common threshold.
    # We use -frames:v 3 to limit to 3 frames.
    # -vsync vfr is important for variable frame rate selection.
    cmd = [
        "ffmpeg", "-y", "-i", str(video_path),
        "-vf", "select='gt(scene,0.3)',scale=1920:-1",
        "-vsync", "vfr",
        "-frames:v", "3",
        str(OUTPUT_DIR / f"{output_prefix}_styleframe_%02d.png")
    ]
    subprocess.run(cmd, capture_output=True)

def generate_optimized_gif(video_path, output_prefix):
    """Generates a high-quality 4s GIF from the middle of the video."""
    duration = get_video_duration(video_path)
    if duration < 4:
        start_time = 0
        t_duration = duration
    else:
        start_time = (duration / 2) - 2
        t_duration = 4

    print(f"  > Generating GIF for {video_path.name} (Start: {start_time:.2f}s)...")
    
    # High quality GIF pipeline:
    # 1. Palette generation
    # 2. Palette application with lanczos scaling
    gif_path = OUTPUT_DIR / f"{output_prefix}.gif"
    
    # We do it in one complex filter chain for efficiency
    cmd = [
        "ffmpeg", "-y", "-ss", str(start_time), "-t", str(t_duration),
        "-i", str(video_path),
        "-vf", "fps=12,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
        str(gif_path)
    ]
    subprocess.run(cmd, capture_output=True)

def main():
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"🚀 Starting Contra Media Pipeline...")
    
    for project in PROJECTS:
        project_folder = MEDIA_FOLDER / project
        if not project_folder.exists():
            print(f"⚠️  Folder not found: {project_folder}")
            continue

        print(f"\n📂 Processing Project: {project}")
        
        # Get all .mp4 files that don't end in _preview.mp4
        videos = [f for f in project_folder.glob("*.mp4") if not f.name.endswith("_preview.mp4")]
        
        if not videos:
            print(f"   No valid videos found in {project}")
            continue

        for video in videos:
            # Create a clean prefix for files
            # Example: "Rio Carnaval_RIO_CARNAVAL_APP_RELEASE"
            clean_name = video.stem.replace(" ", "_")
            prefix = f"{project.replace(' ', '_')}_{clean_name}"
            
            extract_styleframes(video, prefix)
            generate_optimized_gif(video, prefix)

    print(f"\n✅ Done! Files saved in: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
