import os

translator_script = """
<!-- Google Translate Integration -->
<style>
.goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon, .goog-te-gadget-simple { display: none !important; }
body { top: 0px !important; }
#google_translate_element { display: none !important; }
.lang-toggle { 
    font-family: monospace; font-size: 10px; cursor: pointer; 
    border: 1px solid rgba(255,255,255,0.2); background: transparent; 
    color: inherit; padding: 4px 8px; transition: all 0.3s; letter-spacing: 0.1em;
}
.lang-toggle:hover { background: var(--fg); color: var(--bg); }
font[style*="background-color"] { background-color: transparent !important; box-shadow: none !important; }
</style>
<div id="google_translate_element"></div>
<script>
function googleTranslateElementInit() {
  new google.translate.TranslateElement({pageLanguage: 'en', includedLanguages: 'en,pt', autoDisplay: false}, 'google_translate_element');
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

port_path = 'V1/portfolio/index.html'
if os.path.exists(port_path):
    with open(port_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'google_translate_element' not in content:
        content = content.replace('</body>', translator_script + '\n</body>')
        with open(port_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Patched Portfolio with Translator")
    else:
        print("Portfolio already has Translator")
