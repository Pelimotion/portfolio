import os
import re
import urllib.request
import json
import ssl
from urllib.parse import quote

# Bunny Storage API details
API_KEY = "9268ef2d-28c0-4827-a29127346d24-5d2b-47a1"
ZONE_NAME = "pelimotion-assets"
BASE_URL = f"https://storage.bunnycdn.com/{ZONE_NAME}/Medias Portfolio/"
CDN_BASE = "https://pelimotion.b-cdn.net/Medias%20Portfolio"

HTML_FILE = "index.html"

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
        clients[client_name] = {"root": [], "categories": {}, "total": 0}
        
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
                        if process_item(cat_item, clients[client_name]["categories"][cat_name], cat_cdn, cat_items):
                            clients[client_name]["total"] += 1
            else:
                root_cdn = f"{CDN_BASE}/{quote(client_folder['ObjectName'])}"
                if process_item(item, clients[client_name]["root"], root_cdn, client_items):
                    clients[client_name]["total"] += 1
                    
    return clients

if __name__ == "__main__":
    clients_data = scan_bunny()
    with open(HTML_FILE, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # Replace clientsData safely using match method
    json_data = json.dumps(clients_data, separators=(',', ':'))
    
    client_desc = {
        "BC MAPPING FESTIVAL": "Visual identity and motion system for BC Mapping Festival — a large-scale projection mapping event celebrating art, light, and urban architecture.",
        "EQI": "Behind the scenes content production for EQI Investimentos' exclusive activation at Cirque du Soleil.",
        "FAST SHIPPING": "Living rebranding concept — a dynamic visual identity system that breathes, evolves, and adapts across digital touchpoints.",
        "FUNKY ROOM": "Full creative direction and motion branding for Funky Room, a recurring underground party series. Six editions of visual identity, campaign material, and brand animation.",
        "FURB": "Broadcast and institutional campaign work for FURB university — motion design for TV, digital, and event formats including accessible LIBRAS versions.",
        "HEO": "Complete rebranding motion package for HEO — logo animation, visual system, and brand guidelines in motion.",
        "ISLA": "Motion branding, manifesto films, and campaign material for Isla — a beachside venue blending gastronomy, nightlife, and coastal aesthetics.",
        "LSLA": "Motion branding, manifesto films, and campaign material for Isla — a beachside venue blending gastronomy, nightlife, and coastal aesthetics.",
        "NEXTRON": "Logo animation and brand signature update for Nextron — clean, technical motion design for a tech brand.",
        "PIANISSIMO": "Stage visuals and real-time visualizers for Pianissimo — ambient, generative motion for live performance environments.",
        "PLAYA": "Comprehensive motion branding for Playa Beach Club — manifesto films, weekly campaigns, event promos, and seasonal visual identity across 40+ deliverables.",
        "RIO CARNAVAL": "App visualizer and release film for Rio Carnaval — capturing the kinetic energy of Brazil's biggest cultural event through motion design.",
        "SUZANO": "Institutional and event motion design for Suzano — including innovation center presentations, award ceremonies, and internal culture films.",
        "VARIADOS": "Selected personal and experimental motion work — reels, explorations, and cross-discipline projects.",
    }

    category_desc = {
        "Media Kit": "Brand assets in motion — color palettes, patterns, and transitions for digital and print application.",
        "Motion Campaign": "Campaign-ready deliverables — social media, OOH, digital ad, and event-specific motion pieces.",
        "FUNKY 6 - FUNKED UP": "Edition 06 — Funked Up. A rawer, grittier take on the Funky Room identity with conceptual slogans and BTS content.",
        "FUNKY ROOM 1": "Edition 01 — The original. First Room, After Party, and the birth of the visual language.",
        "FUNKY ROOM 2": "Edition 02 — Drop culture meets nightlife. Ticket reveals, headline animations, and urgency-driven promos.",
        "FUNKY ROOM 3": "Edition 03 — Full social media campaign. Multi-format content for feed, stories, and OOH.",
        "FUNKY ROOM 4": "Edition 04 — Blue Edition. Turntable visuals, headline reveals, and artist-specific content.",
        "FUNKY ROOM 5": "Edition 05 — Evolved social media system with refined grid and content hierarchy.",
        "Broadcast Campaign - FURB": "TV-ready spots and institutional films — multi-format broadcast campaign with LIBRAS accessibility.",
        "OOH Campaign - ETEVI": "Event-specific campaign for ETEVI — multi-resolution adaptations for screens, social, and outdoor.",
        "MANIFESTO": "Brand manifesto and concept films — high-production narrative pieces that define the brand's soul.",
        "IA Genenerated": "AI-assisted visual explorations — experimental food and lifestyle content generated with creative AI tools.",
    }

    client_desc_json  = json.dumps(client_desc,    separators=(',', ':'))
    cat_desc_json     = json.dumps(category_desc,  separators=(',', ':'))
    replacement_block = (
        f'const clientDescriptions = {client_desc_json};\n'
        f'    const categoryDescriptions = {cat_desc_json};\n'
        f'    const clientsData = {json_data};'
    )

    # Pattern 1: pre-hub format (clientDescriptions, categoryDescriptions, clientsData)
    pat1 = re.compile(
        r'const clientDescriptions = \{.*?\};\s*'
        r'const categoryDescriptions = \{.*?\};\s*'
        r'const clientsData = \{.*?\};',
        re.DOTALL
    )
    new_html = pat1.sub(lambda m: replacement_block, html, count=1)

    # Pattern 2: old format (clientsData only or clientsData + clientDescriptions)
    if new_html == html:
        pat2 = re.compile(
            r'const clientsData = \{.*?\};\s*(?:const clientDescriptions = \{.*?\};)?',
            re.DOTALL
        )
        simple_block = f'const clientsData = {json_data};\nconst clientDescriptions = {client_desc_json};'
        new_html = pat2.sub(lambda m: simple_block, html, count=1)

    if new_html != html:
        with open(HTML_FILE, 'w', encoding='utf-8') as f:
            f.write(new_html)
        print(f"Updated {HTML_FILE} with {len(clients_data)} clients.")
    else:
        print(f"No data changes for {HTML_FILE}. Skipping write.")
