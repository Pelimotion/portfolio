import os
import subprocess

media_dir = "/Users/felipeconceicao/Library/CloudStorage/GoogleDrive-conceicao.felipe@gmail.com/.shortcut-targets-by-id/1RIVPhnxI0ekDx8OqHjUviIaL7iRe1Ksi/Pelimotion/Midias/Out"

def get_drive_id(path):
    try:
        result = subprocess.run(['xattr', '-p', 'com.google.drivefs.item-id#S', path], capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return None

c = 0
for root, dirs, files in os.walk(media_dir):
    for f in files:
        if f.lower().endswith(('.mp4', '.mov')):
            path = os.path.join(root, f)
            drive_id = get_drive_id(path)
            print(f"{f}: {drive_id}")
            c += 1
            if c > 5:
                break
    if c > 5:
        break
