import os
import re

translator_script = """
<!-- Google Translate Integration -->
<style>
.goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon, .goog-te-gadget-simple { display: none !important; }
body { top: 0px !important; }
#google_translate_element { display: none !important; }
.lang-toggle { 
    font-family: monospace; font-size: 10px; cursor: pointer; 
    border: 1px solid rgba(255,255,255,0.2); background: transparent; 
    color: white; padding: 4px 8px; transition: all 0.3s; letter-spacing: 0.1em;
}
.lang-toggle:hover { background: white; color: black; }
/* Override Google translation background highlights */
font[style*="background-color"] { background-color: transparent !important; }
font[style*="background-color"] { box-shadow: none !important; }
</style>
<div id="google_translate_element"></div>
<script>
function googleTranslateElementInit() {
  new google.translate.TranslateElement({pageLanguage: 'en', includedLanguages: 'en,pt', autoDisplay: false}, 'google_translate_element');
  // Check cookie or local storage to set initial button state if needed
  setTimeout(updateLangButtonState, 1000);
}
function updateLangButtonState() {
  var select = document.querySelector('.goog-te-combo');
  var btn = document.getElementById('custom-lang-toggle');
  if(select && btn) {
      if(select.value === 'pt') btn.innerText = 'EN';
      else btn.innerText = 'PT';
  }
}
function toggleLanguage() {
    var select = document.querySelector('.goog-te-combo');
    if (!select) return;
    var currentLang = select.value || 'en';
    var targetLang = currentLang === 'en' ? 'pt' : 'en';
    select.value = targetLang;
    select.dispatchEvent(new Event('change'));
    var btn = document.getElementById('custom-lang-toggle');
    if(btn) btn.innerText = currentLang === 'en' ? 'EN' : 'PT';
}
</script>
<script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
"""

# Patch Index (Landing Page)
index_path = 'index.html'
if os.path.exists(index_path):
    with open(index_path, 'r', encoding='utf-8') as f:
        idx_content = f.read()
    
    if 'google_translate_element' not in idx_content:
        # Add script to body
        idx_content = idx_content.replace('</body>', translator_script + '\n</body>')
        # Add button to nav
        old_nav = '<a href="/Curriculum/index.html" class="nav-link cta">Curriculum</a>\n  </div>'
        new_nav = '<a href="/Curriculum/index.html" class="nav-link cta">Curriculum</a>\n    <button id="custom-lang-toggle" class="nav-link lang-toggle" onclick="toggleLanguage()" style="margin-left: 10px;">PT</button>\n  </div>'
        idx_content = idx_content.replace(old_nav, new_nav)
        
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(idx_content)
        print("Patched index.html with Translator")

# Patch Curriculum Pages
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
    
    if 'google_translate_element' not in content:
        content = content.replace('</body>', translator_script + '\n</body>')
        
        # Add button to nav-label flex-1 flex justify-end items-center gap-4 font-mono
        old_div = '<div class="nav-label flex-1 flex justify-end items-center gap-4 font-mono">'
        new_div = '<div class="nav-label flex-1 flex justify-end items-center gap-4 font-mono">\n                        <button id="custom-lang-toggle" class="lang-toggle" onclick="toggleLanguage()">PT</button>'
        
        # Some files use single quotes or different indentation, let's use regex
        content = re.sub(r'(<div class="nav-label flex-1 flex justify-end items-center gap-4 font-mono">)', 
                         r'\1\n                        <button id="custom-lang-toggle" class="lang-toggle" onclick="toggleLanguage()">PT</button>', 
                         content)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Patched", path, "with Translator")
