import os
import re
import urllib.request
import json
import ssl
import time
from urllib.parse import quote

# Bunny Storage API details
API_KEY = "864ea13e-6fa0-4de2-aedddb2e0480-84d2-439a"
ZONE_NAME = "pelimotion-portfolio"
BASE_URL = f"https://storage.bunnycdn.com/{ZONE_NAME}/"
CDN_BASE = f"https://{ZONE_NAME}.b-cdn.net"

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
    print(f"Scanning Bunny.net {ZONE_NAME} root...")
    root_items = api_get("/")
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
        client_path = f"/{client_folder['ObjectName']}/"
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
                
            elif ext in ['.jpg', '.png', '.jpeg', '.webp']:
                # Skip generated frames
                if name.endswith('_15.jpg') or name.endswith('_50.jpg') or name.endswith('_85.jpg'):
                    return False
                    
                # Skip if there's a video with the exact same base name
                base_name = name.rsplit('.', 1)[0]
                if any(i['ObjectName'].rsplit('.', 1)[0] == base_name and i['ObjectName'].lower().endswith(('.mp4', '.mov', '.webm')) for i in folder_items):
                    return False
                    
                fmt_class, aspect = detect_format(name)
                img_url = f"{base_cdn_path}/{quote(name)}"
                
                item_data = {
                    "title": clean_title(name),
                    "video_url": "",
                    "preview_url": "",
                    "poster_url": img_url,
                    "format": fmt_class,
                    "aspect": aspect,
                    "mosaic": [img_url, img_url, img_url] # Fallback to itself
                }
                parent_list.append(item_data)
                
                if not clients[client_name]["coverImage"]:
                    clients[client_name]["coverImage"] = img_url
                    
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

    # ─── SMART MERGE: site-content.json (v3 unified schema) ─────────────────
    # RULE: Fields owned by Bunny (auto-generated) are always refreshed.
    #       Fields owned by Admin (editorial) are NEVER overwritten.
    #
    # Bunny-owned (refreshed every sync):
    #   video_url, preview_url, poster_url, mosaic, format, aspect,
    #   media.total, syncedAt, coverImage (only if admin hasn't set one)
    #
    # Admin-owned (preserved forever):
    #   slug, displayName, description, description_pt, tags, services,
    #   since, externalUrl, status, order, mosaicAssets, seo,
    #   title_pt, description (per item), tags (per item), status (per item),
    #   createdAt, updatedAt
    # ─────────────────────────────────────────────────────────────────────────

    if os.path.exists('site-content.json'):
        try:
            with open('site-content.json', 'r', encoding='utf-8') as f:
                site_data = json.load(f)

            existing_clients = site_data.get('clients', {})
            sync_ts = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())

            merged_clients = {}

            for name, bunny_data in clients_data.items():
                existing = existing_clients.get(name)

                if existing:
                    # ── Merge media items (smart per-item merge) ──────────
                    def merge_media_list(bunny_items, existing_items):
                        """
                        Match new Bunny items to existing items by video_url.
                        Refresh Bunny-owned fields; preserve editorial fields.
                        Append new items; remove items no longer on Bunny.
                        """
                        existing_by_url = {
                            m.get('video_url') or m.get('poster_url'): m
                            for m in existing_items
                        }
                        merged = []
                        for idx, bunny_item in enumerate(bunny_items):
                            key = bunny_item.get('video_url') or bunny_item.get('poster_url')
                            old = existing_by_url.get(key, {})

                            merged.append({
                                # ── Identity ──
                                'id':    old.get('id')    or bunny_item.get('id', f'item-{idx}'),
                                'order': old.get('order', idx),

                                # ── Bunny-owned (always refreshed) ──
                                'title':       bunny_item.get('title', ''),
                                'video_url':   bunny_item.get('video_url', ''),
                                'preview_url': bunny_item.get('preview_url', ''),
                                'poster_url':  bunny_item.get('poster_url', ''),
                                'mosaic':      bunny_item.get('mosaic', []),
                                'format':      bunny_item.get('format', 'default'),
                                'aspect':      bunny_item.get('aspect', '16/9'),

                                # ── Admin-owned (preserved) ──
                                'title_pt':       old.get('title_pt', ''),
                                'description':    old.get('description', ''),
                                'description_pt': old.get('description_pt', ''),
                                'tags':           old.get('tags', []),
                                'status':         old.get('status', 'public'),
                                'updatedAt':      old.get('updatedAt', sync_ts),
                            })
                        return merged

                    # Merge root and categories media
                    merged_root = merge_media_list(
                        bunny_data['media'].get('root', []),
                        existing.get('media', {}).get('root', [])
                    )
                    merged_cats = {}
                    for cat_name, bunny_items in bunny_data['media'].get('categories', {}).items():
                        existing_cat_items = existing.get('media', {}).get('categories', {}).get(cat_name, [])
                        merged_cats[cat_name] = merge_media_list(bunny_items, existing_cat_items)

                    # ── Build merged client ───────────────────────────────
                    merged_clients[name] = {
                        # Admin-owned (always preserved)
                        'slug':         existing.get('slug', name.lower().replace(' ', '-')),
                        'displayName':  existing.get('displayName', name),
                        'description':  existing.get('description', ''),
                        'description_pt': existing.get('description_pt', ''),
                        'tags':         existing.get('tags', []),
                        'services':     existing.get('services', []),
                        'since':        existing.get('since', ''),
                        'externalUrl':  existing.get('externalUrl', ''),
                        'status':       existing.get('status', 'public'),
                        'order':        existing.get('order', 999),
                        'mosaicAssets': existing.get('mosaicAssets', []),
                        'seo':          existing.get('seo', {
                            'title': f'{name} — Pelimotion',
                            'description': '',
                            'ogImage': bunny_data.get('coverImage', ''),
                        }),
                        'createdAt':    existing.get('createdAt', sync_ts),
                        'updatedAt':    existing.get('updatedAt', sync_ts),

                        # Bunny-owned (refreshed)
                        'coverImage':   existing.get('coverImage') or bunny_data.get('coverImage', ''),
                        'syncedAt':     sync_ts,
                        'media': {
                            'root':       merged_root,
                            'categories': merged_cats,
                            'total':      bunny_data['media'].get('total', 0),
                        },
                    }
                else:
                    # ── New client discovered on Bunny ────────────────────
                    import re as _re
                    slug = _re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
                    merged_clients[name] = {
                        'slug':         slug,
                        'displayName':  name,
                        'description':  '',
                        'description_pt': '',
                        'tags':         [],
                        'services':     [],
                        'since':        '',
                        'externalUrl':  '',
                        'status':       'public',
                        'order':        999,
                        'mosaicAssets': [],
                        'seo': {
                            'title': f'{name} — Pelimotion',
                            'description': '',
                            'ogImage': bunny_data.get('coverImage', ''),
                        },
                        'coverImage':   bunny_data.get('coverImage', ''),
                        'createdAt':    sync_ts,
                        'updatedAt':    sync_ts,
                        'syncedAt':     sync_ts,
                        'media':        bunny_data['media'],
                    }
                    print(f"  🆕 New client: {name}")

            # Preserve existing clients NOT found on Bunny (private/archived)
            for name, existing in existing_clients.items():
                if name not in merged_clients:
                    merged_clients[name] = existing
                    print(f"  📦 Preserved (not on Bunny): {name}")

            site_data['clients']  = merged_clients
            site_data['lastSync'] = sync_ts

            with open('site-content.json', 'w', encoding='utf-8') as f:
                json.dump(site_data, f, indent=2, ensure_ascii=False)
            print(f"\n✅ site-content.json updated — {len(merged_clients)} clients (v3 smart merge).")

            # ─── Sync content.json (legacy portfolio source) ──────────────
            legacy_data = {
                "clients":     site_data['clients'],
                "categories":  site_data.get('categories', {}),
                "clientOrder": site_data.get('clientOrder', []),
            }
            with open('content.json', 'w', encoding='utf-8') as f:
                json.dump(legacy_data, f, indent=2, ensure_ascii=False)
            print("✅ content.json (legacy) updated.")

        except Exception as e:
            import traceback
            print(f"❌ Error during smart merge: {e}")
            traceback.print_exc()
    else:
        # Fallback: no site-content.json yet
        with open('content.json', 'w', encoding='utf-8') as f:
            json.dump({"clients": clients_data}, f, indent=2, ensure_ascii=False)
        print("⚠️  site-content.json not found. Wrote content.json only.")
