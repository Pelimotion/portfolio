import os
import subprocess
import glob
import math

source_root = "/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio/Medias Portfolio"
output_root = "/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio/contra_pipeline/drafts"

projects = {
    "Fast Shipping": "fast_shipping",
    "Funky Room": "funky_room",
    "Beleza na Web": "beleza_na_web",
    "Rio Carnaval": "rio_carnaval"
}

def get_video_duration(filepath):
    result = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                             "format=duration", "-of",
                             "default=noprint_wrappers=1:nokey=1", filepath],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT)
    try:
        return float(result.stdout)
    except ValueError:
        return 0

def create_gif(input_file, start_time, duration, output_file, fps=18, max_size_mb=4):
    cmd1 = [
        "ffmpeg", "-y", "-ss", str(start_time), "-t", str(duration), "-i", input_file,
        "-vf", "scale='min(1080,iw)':-2:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle",
        "-r", str(fps), "-loop", "0", output_file
    ]
    subprocess.run(cmd1, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    size_mb = os.path.getsize(output_file) / (1024 * 1024) if os.path.exists(output_file) else 0
    if size_mb > max_size_mb:
        subprocess.run(["gifsicle", "-O3", "--colors", "128", "-b", output_file])
        size_mb = os.path.getsize(output_file) / (1024 * 1024)
        
    if size_mb > max_size_mb:
        cmd2 = [
            "ffmpeg", "-y", "-ss", str(start_time), "-t", str(duration), "-i", input_file,
            "-vf", "scale='min(800,iw)':-2:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle",
            "-r", "15", "-loop", "0", output_file
        ]
        subprocess.run(cmd2, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    return os.path.getsize(output_file) / (1024 * 1024) if os.path.exists(output_file) else 0

def create_frame(input_file, start_time, output_file):
    cmd = [
        "ffmpeg", "-y", "-ss", str(start_time), "-i", input_file,
        "-vf", "scale='min(1920,iw)':-2",
        "-vframes", "1", "-q:v", "2", output_file
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def filter_files(files):
    bad_words = ["draft", "low", "proxy", "wip", "preview"]
    filtered = []
    for f in files:
        lname = os.path.basename(f).lower()
        if not any(bw in lname for bw in bad_words):
            filtered.append(f)
    if not filtered and files:
        return files
    return filtered

for proj_dir, slug in projects.items():
    proj_path = os.path.join(source_root, proj_dir)
    out_dir = os.path.join(output_root, slug)
    
    if not os.path.exists(proj_path):
        print(f"PROJECT: {proj_dir}\nMissing or inaccessible\n" + "-"*40)
        continue
        
    os.makedirs(out_dir, exist_ok=True)
    
    all_videos = []
    for root, dirs, files in os.walk(proj_path):
        for file in files:
            if file.lower().endswith(('.mp4', '.mov', '.avi', '.mkv')):
                all_videos.append(os.path.join(root, file))
                
    videos = filter_files(all_videos)
    
    if not videos:
        print(f"PROJECT: {proj_dir}\nNo video files found\n" + "-"*40)
        continue
        
    gifs_needed = 5
    frames_needed = 6
    
    gifs_per_video = [0] * len(videos)
    for i in range(gifs_needed):
        gifs_per_video[i % len(videos)] += 1
        
    frames_per_video = [0] * len(videos)
    for i in range(frames_needed):
        frames_per_video[i % len(videos)] += 1
        
    gif_count = 0
    total_gif_size = 0
    frame_count = 0
    used_files = set()
    
    print(f"Processing PROJECT: {proj_dir}...")
    
    for i, video in enumerate(videos):
        dur = get_video_duration(video)
        if dur < 1.0:
            continue
            
        used_files.add(os.path.basename(video))
        
        g_count = gifs_per_video[i]
        f_count = frames_per_video[i]
        
        if g_count > 0:
            step = max((dur - 4) / g_count, 1)
            for j in range(g_count):
                start_t = min(j * step + 1, max(dur - 3, 0))
                gif_count += 1
                out_name = os.path.join(out_dir, f"{slug}_gif_{gif_count:02d}.gif")
                duration = min(4, max(dur - start_t, 1))
                size = create_gif(video, start_t, duration, out_name)
                total_gif_size += size
                print(f"Created GIF: {out_name} ({size:.2f}MB)")
                
        if f_count > 0:
            step = max((dur - 1) / f_count, 1)
            for j in range(f_count):
                start_t = min(j * step + 0.5, max(dur - 0.5, 0))
                frame_count += 1
                out_name = os.path.join(out_dir, f"{slug}_frame_{frame_count:02d}.jpg")
                create_frame(video, start_t, out_name)
                print(f"Created Frame: {out_name}")
                
    avg_size = total_gif_size / gif_count if gif_count > 0 else 0
    print(f"PROJECT: {proj_dir}")
    print(f"GIFs generated: {gif_count} | avg size: {avg_size:.2f}MB")
    print(f"Frames generated: {frame_count}")
    print(f"Source files used: {', '.join(used_files)}")
    print(f"Output folder: {out_dir}")
    print("-" * 40)
