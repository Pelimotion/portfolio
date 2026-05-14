import re

with open('/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio/Curriculum/index.html', 'r', encoding='utf-8') as f:
    orig_html = f.read()

with open('/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio/Curriculum/private/index.html', 'r', encoding='utf-8') as f:
    priv_html = f.read()

# Extract experience section from orig
exp_match = re.search(r'(<div class="container-custom-flush">.*?)(?=<!-- Education Section -->)', orig_html, re.DOTALL)
if exp_match:
    exp_html = exp_match.group(1).strip()
    # Replace id="dyn-exp" inner content
    priv_html = re.sub(r'<div class="container-custom-flush" id="dyn-exp">.*?</div>', 
                       f'<div class="container-custom-flush" id="dyn-exp">\n{exp_html}\n</div>', 
                       priv_html, flags=re.DOTALL)

# Add some padding to container-custom-flush via inline style to fix cutting
if '<style>' in priv_html:
    priv_html = priv_html.replace('<style>', '<style>\n.container-custom-flush { padding: 0 1.25rem; }\n@media (min-width: 640px) { .container-custom-flush { padding: 0 2rem; } }')

# Make sure Cover Letter button works. We'll explicitly re-attach it to window just in case scope was an issue
script_addition = """
  window.showCV = showCV;
  window.showCL = showCL;
"""
priv_html = priv_html.replace('function showCV(){', script_addition + '\nfunction showCV(){')

with open('/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio/Curriculum/private/index.html', 'w', encoding='utf-8') as f:
    f.write(priv_html)
print("Patched private/index.html successfully")
