import os
import re
import urllib.request
import json
import ssl
from urllib.parse import quote

# Bunny Storage API details
API_KEY = os.environ.get("BUNNY_API_KEY")

if not API_KEY:
    print("Erro: A variável de ambiente BUNNY_API_KEY não está configurada.")
    exit(1)

ZONE_NAME = "pelimotion-assets"
BASE_URL = f"https://storage.bunnycdn.com/{ZONE_NAME}/Medias Portfolio/"
CDN_BASE = "https://pelimotion.b-cdn.net/Medias%20Portfolio"

# HTML_FILE = "index.html"
# Use the correct path for the V1 portfolio's index.html
HTML_FILE = os.path.join(os.path.dirname(__file__), "index.html") 

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
    context = ssl._create_unverified_context() # Consider security implications for production
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
        clients[client_name] = {"root": [], "categories": {}, "total": 0}
        
        # Scan client root
        client_path = f"/Medias Portfolio/{client_folder['ObjectName']}/"
        client_items = api_get(client_path)
        
        def process_item(item, parent_list, base_cdn_path, folder_items):
            name = item["ObjectName"]
            ext = os.path.splitext(name)[1].lower()
            
            # Only process video files, and exclude preview files from main entry
            if ext in ['.mp4', '.webm', '.mov'] and not name.lower().endswith('_preview.mp4'):
                fmt_class, aspect = detect_format(name)
                vid_url = f"{base_cdn_path}/{quote(name)}"
                poster = vid_url.rsplit('.', 1)[0] + ".jpg"
                
                # Detect preview video
                preview_filename = name.rsplit('.', 1)[0] + "_preview.mp4"
                preview_url = None
                # Check if preview file exists in the *current* folder_items list
                if any(i["ObjectName"] == preview_filename for i in folder_items):
                    preview_url = f"{base_cdn_path}/{quote(preview_filename)}"
                
                parent_list.append({
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
                })
                return True
            return False

        for item in client_items:
            if item.get("IsDirectory"):
                cat_name = item["ObjectName"]
                if cat_name not in clients[client_name]["categories"]:
                    clients[client_name]["categories"][cat_name] = []
                
                cat_path = f"{client_path}{cat_name}/"
                cat_cdn = f"{CDN_BASE}/{quote(client_folder['ObjectName'])}/{quote(cat_name)}"
                cat_items = api_get(cat_path)
                for cat_item in cat_items:
                    if not cat_item.get("IsDirectory"):
                        if process_item(cat_item, clients[client_name]["categories"], cat_cdn, cat_items):
                            clients[client_name]["total"] += 1
            else:
                root_cdn = f"{CDN_BASE}/{quote(client_folder['ObjectName'])}"
                if process_item(item, clients[client_name]["root"], root_cdn, client_items):
                    clients[client_name]["total"] += 1
                    
    return clients

if __name__ == "__main__":
    clients_data = scan_bunny()
    
    try:
        with open(HTML_FILE, 'r', encoding='utf-8') as f:
            html = f.read()
    except FileNotFoundError:
        print(f"Error: HTML file not found at {HTML_FILE}")
        exit(1)
        
    # Replace clientsData safely using match method
    json_data = json.dumps(clients_data, separators=(',', ':'))
    def _repl(match):
        # Ensure the JS variable is correctly assigned
        return f'const clientsData = {json_data};'
    
    # Use a regex that accounts for potential whitespace and existing data
    new_html = re.sub(r'const clientsData = .*?;' , _repl, html, flags=re.DOTALL)

    # Additional check: If the substitution didn't happen, maybe the structure is different
    if 'const clientsData =' not in new_html:
        print("Warning: Could not find 'const clientsData = ...;' pattern in HTML. Attempting to inject.")
        # Basic injection attempt if regex fails (less robust)
        # This might need adjustment based on the actual HTML structure
        injection_point = "</body>"
        if injection_point in new_html:
            new_html = new_html.replace(injection_point, f'<script>const clientsData = {json_data};</script>\n    {injection_point}')
        else:
            print("Error: Could not find a suitable injection point in HTML.")
            exit(1)

    
    try:
        with open(HTML_FILE, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f"Successfully updated {HTML_FILE} with data for {len(clients_data)} clients.")
    except IOError as e:
        print(f"Error writing to HTML file: {e}")
        exit(1)
