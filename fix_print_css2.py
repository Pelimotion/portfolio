import os
import re

files_to_fix = [
    'Curriculum/index.html',
    'Curriculum/private/app.html',
    'Curriculum/private/cv.html',
    'Curriculum/private/near.html',
    'Curriculum/private/cl.html'
]

for filepath in files_to_fix:
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '.reveal-mech, .reveal { opacity: 1 !important;' not in content:
        content = content.replace('section, article, .skill-group { page-break-inside: avoid; }', 
        'section, article, .skill-group { page-break-inside: avoid; }\n  .reveal-mech, .reveal { opacity: 1 !important; transform: none !important; }')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Patched {filepath}")

