import os

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
    
    if 'onclick="toggleTheme()"' not in content:
        old_btn = '<button id="custom-lang-toggle" class="lang-toggle" onclick="toggleLanguage()">PT</button>'
        new_btn = '<button class="lang-toggle" onclick="toggleTheme()" title="Toggle Theme" style="margin-right:8px; cursor:pointer; background:none; border:1px solid var(--border); padding:4px 8px; color:inherit;">◐</button>\n                        ' + old_btn
        if old_btn in content:
            content = content.replace(old_btn, new_btn)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Patched Theme toggle into", path)
        else:
            print("old_btn not found in", path)
