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
    
    # Replace hardcoded h3 with dyn-contact-text
    content = content.replace('<h3 class="contact-cta">', '<h3 id="dyn-contact-text" class="contact-cta">')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Patched {filepath}")

