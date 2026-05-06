import urllib.request
import json
import ssl
import os
from urllib.parse import quote

API_KEY = "864ea13e-6fa0-4de2-aedddb2e0480-84d2-439a"
ZONE_NAME = "pelimotion-portfolio"

def api_get(path):
    url = "https://storage.bunnycdn.com/" + quote(ZONE_NAME + path)
    headers = {
        "AccessKey": API_KEY,
        "accept": "application/json"
    }
    req = urllib.request.Request(url, headers=headers)
    context = ssl._create_unverified_context()
    try:
        with urllib.request.urlopen(req, context=context) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        return []

def audit_bunny_frames():
    root_items = api_get("/")
    clients_missing_frames = set()

    for client_folder in root_items:
        if not client_folder.get("IsDirectory"):
            continue

        client_name = client_folder["ObjectName"]
        client_path = f"/{client_name}/"
        client_items = api_get(client_path)

        # Helper to check items in a directory
        def check_items(items, folder_path):
            videos = [i["ObjectName"] for i in items if not i.get("IsDirectory") and i["ObjectName"].lower().endswith(('.mp4', '.webm', '.mov')) and not i["ObjectName"].endswith('_preview.mp4')]
            all_files = set([i["ObjectName"] for i in items if not i.get("IsDirectory")])
            
            missing_for_videos = []
            for v in videos:
                base = v.rsplit('.', 1)[0]
                frames = [f"{base}_15.jpg", f"{base}_50.jpg", f"{base}_85.jpg"]
                if not all(f in all_files for f in frames):
                    missing_for_videos.append(v)
            return missing_for_videos

        # Check root of client
        missing = check_items(client_items, client_path)
        if missing:
            clients_missing_frames.add(client_name)

        # Check subcategories
        for item in client_items:
            if item.get("IsDirectory"):
                cat_name = item["ObjectName"]
                cat_path = f"{client_path}{cat_name}/"
                cat_items = api_get(cat_path)
                missing_cat = check_items(cat_items, cat_path)
                if missing_cat:
                    clients_missing_frames.add(client_name)

    print("=== AUDIT RESULTS ===")
    if clients_missing_frames:
        print("Clients missing frames:")
        for c in clients_missing_frames:
            print(f"- {c}")
    else:
        print("All clients have their frames.")

if __name__ == "__main__":
    audit_bunny_frames()
