import re
import os

base_dir = '/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio/Curriculum/private'

script_block = """
<script>
function navTo(e, file) {
    e.preventDefault();
    let p = window.location.pathname;
    if (p.endsWith('private')) p += '/';
    else if (!p.endsWith('/') && !p.endsWith('.html')) p = p.substring(0, p.lastIndexOf('/') + 1);
    else if (p.endsWith('.html')) p = p.substring(0, p.lastIndexOf('/') + 1);
    window.location.href = p + file;
}
</script>
</body>
"""

for file_name in ['cv.html', 'cl.html']:
    file_path = os.path.join(base_dir, file_name)
    with open(file_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Update back button
    html = re.sub(r'<a href="\./index\.html" class="([^"]+)">← BACK</a>', 
                  r'<a href="index.html" onclick="navTo(event, \'index.html\')" class="\1">← BACK</a>', html)
    
    # Add script if not exists
    if 'function navTo' not in html:
        html = html.replace('</body>', script_block)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html)

print("Patched cv.html and cl.html")
