import json

with open('site-content.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

if 'contactText' not in data['curriculum']:
    data['curriculum']['contactText'] = "Open to direction,<br>\n<span class=\"serif text-white/70\">collaborations</span> and<br>\nlong-form briefs<span class=\"text-white/30\">.</span>"

with open('site-content.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
