import os
import re

cv_files = [
    'Curriculum/index.html',
    'Curriculum/private/app.html',
    'Curriculum/private/cv.html',
    'Curriculum/private/near.html',
    'Curriculum/private/cl.html'
]

for path in cv_files:
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Let's use regex to find the button regardless of spacing
    if 'onclick="toggleTheme()"' not in content:
        content = re.sub(
            r'(<button id="custom-lang-toggle".*?>PT</button>)',
            r'<button class="lang-toggle" onclick="toggleTheme()" title="Toggle Theme" style="margin-right:8px;">◐</button>\n                        \1',
            content
        )
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Patched Theme toggle into", path)
