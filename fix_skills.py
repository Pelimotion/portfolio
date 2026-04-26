import json

with open('site-content.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['curriculum']['skills'] = {
  "Stack": [
    "After Effects",
    "DaVinci Resolve",
    "Blender",
    "Photoshop",
    "Illustrator",
    "Ableton",
    "Premiere"
  ],
  "AI Pipeline": [
    "Nano Banana",
    "GPT 2",
    "Seedance"
  ],
  "Strategy": [
    "Brand Systems",
    "Creative Direction",
    "Team Manager",
    "Client Relations"
  ]
}

with open('site-content.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Fixed skills in site-content.json")
