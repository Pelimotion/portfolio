import os

files = [
    'Curriculum/index.html',
    'Curriculum/private/app.html',
    'Curriculum/private/cv.html',
    'Curriculum/private/near.html',
    'Curriculum/private/cl.html'
]

for fpath in files:
    if not os.path.exists(fpath): continue
    with open(fpath, 'r') as f:
        content = f.read()
        
    old_text = '<span class="hidden lg:inline text-white/20">— MT_PH_01.2025</span>'
    new_text = '<span class="hidden lg:inline text-white/20 hover:text-white transition-colors cursor-pointer" onclick="event.preventDefault(); window.print();" title="Save as PDF">— MT_PH_01.2025</span>'
    
    if old_text in content:
        content = content.replace(old_text, new_text)
    else:
        print(f"Could not find exact text in {fpath}")
        
    with open(fpath, 'w') as f:
        f.write(content)
        
    print(f"Updated {fpath}")

