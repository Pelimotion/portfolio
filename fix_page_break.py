import os

files = [
    'Curriculum/index.html',
    'Curriculum/private/app.html',
    'Curriculum/private/cv.html',
    'Curriculum/private/near.html',
    'Curriculum/private/cl.html'
]

# We want to add overflow: hidden !important; to body, html in the dynamic print style
# And add a tiny buffer to h just in case.

for path in files:
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update the buffer
    if 'const h = Math.ceil(rect.height);' in content:
        content = content.replace('const h = Math.ceil(rect.height);', 'const h = Math.ceil(rect.height) + 10;')
    
    # 2. Add overflow hidden to the dynamic style
    old_style = "body, html { min-height: auto !important; height: auto !important; }"
    new_style = "body, html { min-height: auto !important; height: auto !important; overflow: hidden !important; }"
    content = content.replace(old_style, new_style)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Patched", path)
