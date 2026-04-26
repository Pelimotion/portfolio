import os
import re

files_to_fix = [
    'Curriculum/index.html',
    'Curriculum/private/app.html',
    'Curriculum/private/cv.html',
    'Curriculum/private/near.html',
    'Curriculum/private/cl.html'
]

for filepath in files_to_fix:
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Fix the "skills" visibility by adding 'visible' class
    content = re.sub(
        r'<div class="skill-group reveal-mech \$\{borders\[i\]\|\|',
        r'<div class="skill-group reveal-mech visible ${borders[i]||',
        content
    )
    # Also fix education visibility
    content = re.sub(
        r'<div class="edu-item reveal-mech grid',
        r'<div class="edu-item reveal-mech visible grid',
        content
    )
    
    # 2. Make the contact section cards dynamic
    # Find the col-span-12 lg:col-span-4 grid grid-cols-2 block inside contact section
    contact_block_pattern = re.compile(
        r'<div class="col-span-12 lg:col-span-4 grid grid-cols-2">.*?</div>\s*</div>\s*</section>',
        re.DOTALL
    )
    new_contact_html = """<div id="dyn-contact-cards" class="col-span-12 lg:col-span-4 grid grid-cols-2">
                    <!-- Injected by JS -->
                </div>
            </div>
        </section>"""
    content = contact_block_pattern.sub(new_contact_html, content)
    
    # 3. Add JS injection for contact cards in the script block
    # Find the // ── Contact ── block
    contact_js_pattern = re.compile(
        r'// ── Contact ──\s+const emailEl = document\.getElementById\(\'dyn-email\'\);\s+if\(emailEl && C\.contactEmail\)\{\s+emailEl\.href = \'mailto:\'\+C\.contactEmail;\s+emailEl\.textContent = C\.contactEmail;\s+\}',
        re.DOTALL
    )
    
    new_contact_js = """// ── Contact ──
  const emailEl = document.getElementById('dyn-email');
  if(emailEl && C.contactEmail){
    emailEl.href = 'mailto:'+C.contactEmail;
    emailEl.textContent = C.contactEmail;
  }
  const ccEl = document.getElementById('dyn-contact-cards');
  if(ccEl){
    let cards = [];
    cards.push(`<a href="/" class="contact-card border-t border-white/10 group transition-colors hover:bg-white/5">
        <div class="label-tiny">Portfolio</div>
        <div class="tag-label mt-3">pelimotion.com</div></a>`);
    cards.push(`<div class="contact-card border-t border-l border-white/10">
        <div class="label-tiny">City</div>
        <div class="tag-label mt-3">${C.basedIn || 'Rio de Janeiro'}</div></div>`);
    if(C.socialLinkedIn){
      const un = C.socialLinkedIn.split('/').filter(Boolean).pop();
      cards.push(`<a href="${C.socialLinkedIn.startsWith('http')?C.socialLinkedIn:'https://'+C.socialLinkedIn}" target="_blank" class="contact-card border-t ${cards.length%2===1?'border-l':''} border-white/10 group transition-colors hover:bg-white/5">
          <div class="label-tiny">LinkedIn</div>
          <div class="tag-label mt-3">/${un}</div></a>`);
    }
    if(C.socialInstagram){
      const un = C.socialInstagram.split('/').filter(Boolean).pop();
      cards.push(`<a href="${C.socialInstagram.startsWith('http')?C.socialInstagram:'https://'+C.socialInstagram}" target="_blank" class="contact-card border-t ${cards.length%2===1?'border-l':''} border-white/10 group transition-colors hover:bg-white/5">
          <div class="label-tiny">Instagram</div>
          <div class="tag-label mt-3">@${un}</div></a>`);
    }
    ccEl.innerHTML = cards.join('');
  }"""
    content = contact_js_pattern.sub(new_contact_js, content)
    
    # 4. Fix social links next to email
    # Look for the gap-6 mt-12 div in contact
    social_links_pattern = re.compile(
        r'<div class="flex gap-6">\s*<a href="#" class="nav-link[^"]*">\[INSTAGRAM\]</a>\s*<a href="#" class="nav-link[^"]*">\[LINKEDIN\]</a>\s*</div>',
        re.DOTALL
    )
    new_social_html = """<div id="dyn-social-links" class="flex gap-6">
                            <!-- Injected by JS -->
                        </div>"""
    content = social_links_pattern.sub(new_social_html, content)
    
    # Add JS for dyn-social-links
    social_js = """
  const slEl = document.getElementById('dyn-social-links');
  if(slEl){
    let sl = [];
    if(C.socialInstagram) sl.push(`<a href="${C.socialInstagram.startsWith('http')?C.socialInstagram:'https://'+C.socialInstagram}" target="_blank" class="nav-link font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">[INSTAGRAM]</a>`);
    if(C.socialLinkedIn) sl.push(`<a href="${C.socialLinkedIn.startsWith('http')?C.socialLinkedIn:'https://'+C.socialLinkedIn}" target="_blank" class="nav-link font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">[LINKEDIN]</a>`);
    slEl.innerHTML = sl.join('');
  }"""
    
    # Inject social js right after ccEl block
    if 'const slEl = document.getElementById(\'dyn-social-links\');' not in content:
        content = content.replace('ccEl.innerHTML = cards.join(\'\');\n  }', 'ccEl.innerHTML = cards.join(\'\');\n  }\n' + social_js)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Patched {filepath}")

