import os
import re

files_to_fix = [
    'Curriculum/index.html',
    'Curriculum/private/app.html',
    'Curriculum/private/cv.html',
    'Curriculum/private/near.html'
]

for filepath in files_to_fix:
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace hardcoded h3 with dyn-contact-text
    pattern = re.compile(r'<h3 class="contact-cta">.*?</h3>', re.DOTALL)
    replacement = """<h3 id="dyn-contact-text" class="contact-cta">
                        Open to direction,<br>
                        <span class="serif text-white/70">collaborations</span> and<br>
                        long-form briefs<span class="text-white/30">.</span>
                    </h3>"""
    content = pattern.sub(replacement, content)
    
    # Inject logic in script to replace dyn-contact-text
    js_pattern = re.compile(r'// ── Contact ──\s+const emailEl')
    js_replacement = """// ── Contact ──
  const ctaEl = document.getElementById('dyn-contact-text');
  if(ctaEl && C.contactText) ctaEl.innerHTML = C.contactText;

  const emailEl"""
    content = js_pattern.sub(js_replacement, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Patched {filepath}")

