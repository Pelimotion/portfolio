import os
import subprocess
import urllib.request

media_dir = "/Users/felipeconceicao/Library/CloudStorage/GoogleDrive-conceicao.felipe@gmail.com/.shortcut-targets-by-id/1RIVPhnxI0ekDx8OqHjUviIaL7iRe1Ksi/Pelimotion/Midias/Out"

def get_drive_id(path):
    try:
        res = subprocess.run(['xattr', '-p', 'com.google.drivefs.item-id#S', path], capture_output=True, text=True)
        if res.returncode == 0: return res.stdout.strip()
    except: pass
    return None

broken = []
for root, dirs, files in os.walk(media_dir):
    for f in files:
        if f.lower().endswith(('.mp4', '.mov')) and not os.path.basename(f).startswith('.'):
            path = os.path.join(root, f)
            d_id = get_drive_id(path)
            if not d_id:
                broken.append((f, "No Drive ID"))
                continue
            url = f"https://drive.google.com/thumbnail?id={d_id}&sz=w10"
            try:
                req = urllib.request.Request(url, method='HEAD')
                r = urllib.request.urlopen(req)
                if r.getcode() >= 400: broken.append((f, "HTTP " + str(r.getcode())))
            except urllib.error.HTTPError as e:
                broken.append((f, f"HTTP Error {e.code}"))
            except Exception as e:
                broken.append((f, str(e)))

print("BROKEN_LIST_START")
for b in broken:
    print(f"- {b[0]} ({b[1]})")
print("BROKEN_LIST_END")
