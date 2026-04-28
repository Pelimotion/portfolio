import os
import re
import urllib.request
import json
import ssl
import time
from urllib.parse import quote

# Bunny Storage API details
API_KEY = "9268ef2d-28c0-4827-a29127346d24-5d2b-47a1"
ZONE_NAME = "pelimotion-assets"
BASE_URL = f"https://storage.bunnycdn.com/{ZONE_NAME}/Medias Portfolio/"
CDN_BASE = "https://pelimotion.b-cdn.net/Medias%20Portfolio"

HTML_FILE = "V1/portfolio/index.html"

def clean_title(filename):
    """
    NLP/Regex logic to clean filenames into professional titles.
    Removes dates, versions, extensions, and standardizes casing.
    """
    # Remove extension
    name, _ = os.path.splitext(filename)
    
    # Remove dates (e.g. 2024-05-12, 12_05_2024, 2024_05, 12.05)
    name = re.sub(r'\b\d{4}[-_]\d{2}[-_]\d{2}\b', '', name)
    name = re.sub(r'\b\d{2}[-_]\d{2}[-_]\d{4}\b', '', name)
    name = re.sub(r'\b\d{2}[.]\d{2}[.]\d{2,4}\b', '', name)
    name = re.sub(r'\b\d{4}[-_]\d{2}\b', '', name)
    name = re.sub(r'\b\d{2}[-_]\d{2}\b', '', name)
    name = re.sub(r'\d{6,8}', '', name) # e.g. 20231024
    
    # Remove version tags (v1, v2, VFINAL, V3b)
    name = re.sub(r'\b[vV]\d+[a-zA-Z]?\b', '', name)
    name = re.sub(r'\bFINAL\d*\b', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\bALT\d*\b', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\bREVISAO\d*\b', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\bREV\d*\b', '', name, flags=re.IGNORECASE)
    
    # Replace underscores and hyphens with spaces
    name = name.replace('_', ' ').replace('-', ' ')
    
    # Remove extra spaces
    name = re.sub(r'\s+', ' ', name).strip()
    
    # Capitalize cleanly
    # Keeping uppercase style as per the portfolio's aesthetics
    return name.upper()

def api_get(path):
    url = f"https://storage.bunnycdn.com/{ZONE_NAME}{path}"
    # Quote the path but preserve slashes
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
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return []
        print(f"Error fetching {url}: {e.code}")
        return []
    except Exception as e:
        print(f"Error: {e}")
        return []

def detect_format(filename):
    """Detects if a video is vertical, wide, or square based on filename."""
    name = filename.lower()
    if any(k in name for k in ['vertical', '9x16', 'reels', 'shorts', 'portrait']):
        return 'vertical', '9/16'
    if any(k in name for k in ['wide', '16x9', 'landscape', '1920x1080']):
        return 'wide', '16/9'
    if 'square' in name or '1x1' in name:
        return 'square', '1/1'
    return 'default', '16/9'

def scan_bunny():
    print("Scanning Bunny.net Medias Portfolio...")
    root_items = api_get("/Medias Portfolio/")
    clients = {}
    
    for client_folder in root_items:
        if not client_folder.get("IsDirectory"):
            continue
            
        client_name = client_folder["ObjectName"].upper()
        clients[client_name] = {
            "media": {"root": [], "categories": {}, "total": 0},
            "coverImage": ""
        }
        
        # Scan client root
        client_path = f"/Medias Portfolio/{client_folder['ObjectName']}/"
        client_items = api_get(client_path)
        
        def process_item(item, parent_list, base_cdn_path, folder_items):
            name = item["ObjectName"]
            ext = os.path.splitext(name)[1].lower()
            
            if ext in ['.mp4', '.webm', '.mov'] and not name.endswith('_preview.mp4'):
                fmt_class, aspect = detect_format(name)
                vid_url = f"{base_cdn_path}/{quote(name)}"
                poster = vid_url.rsplit('.', 1)[0] + ".jpg"
                
                # Detect preview video
                preview_filename = name.rsplit('.', 1)[0] + "_preview.mp4"
                preview_url = None
                if any(i['ObjectName'] == preview_filename for i in folder_items):
                    preview_url = f"{base_cdn_path}/{quote(preview_filename)}"
                
                item_data = {
                    "title": clean_title(name),
                    "video_url": vid_url,
                    "preview_url": preview_url,
                    "poster_url": poster,
                    "format": fmt_class,
                    "aspect": aspect,
                    "mosaic": [
                        vid_url.rsplit('.', 1)[0] + "_15.jpg",
                        vid_url.rsplit('.', 1)[0] + "_50.jpg",
                        vid_url.rsplit('.', 1)[0] + "_85.jpg"
                    ]
                }
                parent_list.append(item_data)
                
                # Auto-assign cover image if none
                if not clients[client_name]["coverImage"]:
                    clients[client_name]["coverImage"] = item_data["mosaic"][1] # use the 50% frame
                
                return True
            return False

        for item in client_items:
            if item.get("IsDirectory"):
                cat_name = item["ObjectName"]
                if cat_name not in clients[client_name]["media"]["categories"]:
                    clients[client_name]["media"]["categories"][cat_name] = []
                
                cat_path = f"{client_path}{cat_name}/"
                cat_cdn = f"{CDN_BASE}/{quote(client_folder['ObjectName'])}/{quote(cat_name)}"
                cat_items = api_get(cat_path)
                for cat_item in cat_items:
                    if not cat_item.get("IsDirectory"):
                        if process_item(cat_item, clients[client_name]["media"]["categories"][cat_name], cat_cdn, cat_items):
                            clients[client_name]["media"]["total"] += 1
            else:
                root_cdn = f"{CDN_BASE}/{quote(client_folder['ObjectName'])}"
                if process_item(item, clients[client_name]["media"]["root"], root_cdn, client_items):
                    clients[client_name]["media"]["total"] += 1
                    
    return clients

if __name__ == "__main__":
    clients_data = scan_bunny()
    
    # ─── SYNC site-content.json (Admin & Site Source) ───
    if os.path.exists('site-content.json'):
        try:
            with open('site-content.json', 'r', encoding='utf-8') as f:
                site_data = json.load(f)
            
            existing_clients = site_data.get('clients', {})
            new_clients = {}
            
            for name, data in clients_data.items():
                if name in existing_clients:
                    # Preserve all manual metadata from existing client
                    existing = existing_clients[name]
                    # Update only the media part (from Bunny)
                    existing['media'] = data['media']
                    # Ensure coverImage is preserved if manual, or updated if new
                    if not existing.get('coverImage'): existing['coverImage'] = data.get('coverImage')
                    new_clients[name] = existing
                else:
                    # New client found on Bunny
                    data['status'] = 'public' # default status
                    new_clients[name] = data
            
            site_data['clients'] = new_clients
            site_data['lastSync'] = time.strftime('%Y-%m-%d %H:%M:%S')
            
            with open('site-content.json', 'w', encoding='utf-8') as f:
                json.dump(site_data, f, indent=2, ensure_ascii=False)
            print(f"✅ Updated site-content.json with {len(new_clients)} clients.")
            
            # ─── SYNC content.json (Legacy Portfolio Source) ───
            # content.json should be a subset of site-content.json (just clients and categories)
            legacy_data = {
                "clients": site_data['clients'],
                "categories": site_data.get('categories', {})
            }
            with open('content.json', 'w', encoding='utf-8') as f:
                json.dump(legacy_data, f, indent=4, ensure_ascii=False)
            print(f"✅ Updated content.json (Legacy).")

        except Exception as e:
            print(f"❌ Error syncing site-content.json: {e}")
    else:
        # Fallback if site-content.json missing
        final_data = {"clients": clients_data}
        with open('content.json', 'w', encoding='utf-8') as f:
            json.dump(final_data, f, indent=4, ensure_ascii=False)
        print(f"Updated content.json only (site-content.json not found).")
