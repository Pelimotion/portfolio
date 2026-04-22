import sys
import os

sys.path.append(os.getcwd())
import sync_bunny

# Override to write to V1
sync_bunny.HTML_FILE = "V1/portfolio/index.html"
clients_data = sync_bunny.scan_bunny()

with open(sync_bunny.HTML_FILE, 'r', encoding='utf-8') as f:
    html = f.read()

import json
json_data = json.dumps(clients_data, separators=(',', ':'))

# Define clientDescriptions
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

# Inject script tag before </body>
script_content = f"<script>\nconst clientsData = {json_data};\nconst clientDescriptions = {json.dumps(client_desc)};\n</script>\n</body>"

import re
if 'const clientsData =' in html:
    html = re.sub(r'<script>\s*const clientsData = .*?</script>\s*</body>', script_content, html, flags=re.DOTALL)
else:
    html = html.replace('</body>', script_content)

with open(sync_bunny.HTML_FILE, 'w', encoding='utf-8') as f:
    f.write(html)
print("Injected clientsData and clientDescriptions into V1/portfolio/index.html")
