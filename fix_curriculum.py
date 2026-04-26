import json

def fix_encoding(text):
    if not isinstance(text, str):
        return text
    try:
        return text.encode('latin1').decode('utf8')
    except Exception:
        # Fallback manual replaces for common issues just in case
        return text.replace('Ã§', 'ç').replace('Ã£', 'ã').replace('Ã¡', 'á').replace('â€”', '—').replace('Â·', '·').replace('â†’', '→').replace('âˆž', '∞').replace('Ã©', 'é')

def recursively_fix(data):
    if isinstance(data, dict):
        return {k: recursively_fix(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [recursively_fix(item) for item in data]
    elif isinstance(data, str):
        return fix_encoding(data)
    else:
        return data

with open('site-content.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Fix encoding globally
data = recursively_fix(data)

# 1. Name fix just in case there's the "aaaaa" typo
if "Felipe Concei" in data['curriculum']['name']:
    data['curriculum']['name'] = "Felipe Conceição"

# 2. Update stats: Remove 'infinitos frames per second'
data['curriculum']['stats'] = [s for s in data['curriculum']['stats'] if 'Frames' not in s['label']]

# 3. Modify Experience
new_exp = []
for exp in data['curriculum']['experience']:
    if 'Rockset' in exp['company']:
        # Rockset: remove clients
        exp['items'] = [
            "Owned post-production pipeline for aesthetic excellence.",
            "Broadcast / Digital Signage assets for financial sectors."
        ]
        new_exp.append(exp)
    elif 'Sirius' in exp['role']:
        # Duo Sirius
        exp['items'] = [
            "Focused on high-ticket events, blending painting and video art."
        ]
        new_exp.append(exp)
    elif 'Pelimotion' in exp['company']:
        # Combine with Freelance
        exp['company'] = "Pelimotion"
        exp['period'] = "2018 — Now"
        exp['role'] = "Creative Director & Motion Designer"
        exp['items'] = [
            "Systems lead for modular motion pipelines (digital/retail).",
            "AI-integrated generative video workflow R&D.",
            "Immersive artistic direction (light/projection).",
            "Brand strategy alignment for high-ticket positioning.",
            "Strategic brands: Suzano, O Boticário, Colcci, FG and Embraed."
        ]
        exp['tags'] = list(set(exp['tags'] + ["RETAIL", "SOCIAL", "EVENTS"]))
        new_exp.append(exp)
    elif 'Freelance' in exp['role']:
        # Skip, it's combined into Pelimotion
        pass
    else:
        new_exp.append(exp)

data['curriculum']['experience'] = new_exp

# 4. Update Stack
data['curriculum']['skills']['Motion & Post'] = [
    "After Effects",
    "DaVinci Resolve",
    "Blender",
    "Photoshop",
    "Illustrator",
    "Ableton",
    "Premiere"
]
if 'Design & 3D' in data['curriculum']['skills']:
    del data['curriculum']['skills']['Design & 3D']

# 5. AI Pipeline
if 'Code & AI' in data['curriculum']['skills']:
    data['curriculum']['skills']['Code & AI'] = [
        "Nano Banana",
        "GPT 2",
        "Seedance"
    ]
else:
    data['curriculum']['skills']['AI Pipeline'] = [
        "Nano Banana",
        "GPT 2",
        "Seedance"
    ]

# 6. Team Leadership -> Team Manager
if 'Strategy' in data['curriculum']['skills']:
    data['curriculum']['skills']['Strategy'] = [
        "Team Manager" if x == "Team Leadership" else x for x in data['curriculum']['skills']['Strategy']
    ]

with open('site-content.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Updated site-content.json")
