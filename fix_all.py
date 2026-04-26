import json

with open('site-content.json', 'r', encoding='utf-8') as f:
    text = f.read()

replaces = {
    'ConceiÃŠÂ§ÃŠÂ£o': 'Conceição',
    'ConceiÃ§Ã£o': 'Conceição',
    'ConceiÃƒÂ§ÃƒÂ£o': 'Conceição',
    'â€”': '—',
    'Ã¢Â€Â”': '—',
    'Â·': '·',
    'â†’': '→',
    'âˆž': '∞',
    'O BoticÃ¡rio': 'O Boticário',
    'ItajaÃ\xad': 'Itajaí',
    'ItajaÃ­': 'Itajaí'
}

for k, v in replaces.items():
    text = text.replace(k, v)

with open('site-content.json', 'w', encoding='utf-8') as f:
    f.write(text)

print("Cleaned!")
