import os
import re

files = [
    'Curriculum/index.html',
    'Curriculum/private/app.html',
    'Curriculum/private/cv.html',
    'Curriculum/private/near.html',
    'Curriculum/private/cl.html'
]

# Regex to remove the orphaned CSS block that starts with body { background: #fff !important;
# and ends with the rogue }
stray_css_pattern_1 = re.compile(r'\s*body\s*\{\s*background:\s*#fff\s*!important;\s*color:\s*#000\s*!important\s*\}.*?page-break-inside:\s*avoid;\s*\}\s*\}', re.DOTALL)
stray_css_pattern_2 = re.compile(r'\s*body\{background:#fff!important;color:#000!important\}.*?page-break-inside: avoid; \}\n\}', re.DOTALL)

for path in files:
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Let's just find "body { background: #fff !important;" or similar
    # and remove up to the extra "}"
    idx = content.find('body {\n                background: #fff !important;\n                color: #000 !important\n            }')
    if idx != -1:
        end_idx = content.find('            }\n        }\n', idx)
        if end_idx != -1:
            content = content[:idx] + content[end_idx + 24:]
    else:
        # Minified version in some files
        idx2 = content.find('body{background:#fff!important;color:#000!important}')
        if idx2 != -1:
            end_idx2 = content.find('page-break-inside: avoid; }\n}', idx2)
            if end_idx2 != -1:
                content = content[:idx2] + content[end_idx2 + 30:]

    # Add accent color variable injection in app.html
    if path.endswith('app.html'):
        if 'document.documentElement.style.setProperty' not in content:
            content = content.replace("const clSections = document.getElementById('dyn-cl-sections');",
                                      "const clSections = document.getElementById('dyn-cl-sections');\n                    document.documentElement.style.setProperty('--accent-color', APP.accentColor || '#34d399');")
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Patched", path)
