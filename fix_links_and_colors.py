import os

files = [
    'Curriculum/index.html',
    'Curriculum/private/app.html',
    'Curriculum/private/cv.html',
    'Curriculum/private/near.html',
    'Curriculum/private/cl.html'
]

for path in files:
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Inject accent color globally if it exists for CV
    if '// ── Name ──' in content and 'document.documentElement.style.setProperty' not in content:
        # Wait, for app.html we already injected it for APP.accentColor
        if path.endswith('app.html'):
            # It already has document.documentElement.style.setProperty('--accent-color', APP.accentColor || '#34d399'); inside the APP block
            pass
        elif path.endswith('cl.html'):
            content = content.replace('// ── Name ──', 
                "if(CL.accentColor) document.documentElement.style.setProperty('--accent-color', CL.accentColor);\n  // ── Name ──")
        else:
            # cv.html, near.html, index.html (which is cv)
            # They use C.accentColor
            content = content.replace('// ── Name ──', 
                "if(C.accentColor) document.documentElement.style.setProperty('--accent-color', C.accentColor);\n  // ── Name ──")

    # 2. Fix the links block in cl.html and app.html
    old_links_code = """      linksEl.innerHTML = [
        ['Portfolio','https://pelimotion.com'],
        C.socialLinkedIn ? ['LinkedIn','https://linkedin.com/in/'+C.socialLinkedIn] : null,
        C.socialInstagram ? ['Instagram','https://instagram.com/'+C.socialInstagram] : null,
        C.contactEmail ? ['Email','mailto:'+C.contactEmail] : null
      ].filter(Boolean).map(([l,h]) => 
        `<a href="${h}" target="_blank" class="flex items-center justify-between border-b border-white/10 pb-2 hover:border-white/50 transition-colors">` +
        `<span class="font-mono text-[10px] uppercase tracking-widest">${l}</span><span class="text-white/30">↗</span></a>`
      ).join('');"""

    new_links_code = """      const l_in = C.socialLinkedIn ? (C.socialLinkedIn.startsWith('http') ? C.socialLinkedIn : 'https://linkedin.com/in/'+C.socialLinkedIn.split('/').filter(Boolean).pop()) : null;
      const l_ig = C.socialInstagram ? (C.socialInstagram.startsWith('http') ? C.socialInstagram : 'https://instagram.com/'+C.socialInstagram.split('/').filter(Boolean).pop()) : null;
      linksEl.innerHTML = [
        ['Portfolio','https://pelimotion.com'],
        l_in ? ['LinkedIn', l_in] : null,
        l_ig ? ['Instagram', l_ig] : null,
        C.contactEmail ? ['Email','mailto:'+C.contactEmail] : null
      ].filter(Boolean).map(([l,h]) => 
        `<a href="${h}" target="_blank" class="flex items-center justify-between border-b border-white/10 pb-2 hover:border-white/50 transition-colors">` +
        `<span class="font-mono text-[10px] uppercase tracking-widest">${l}</span><span class="text-white/30">↗</span></a>`
      ).join('');"""

    if old_links_code in content:
        content = content.replace(old_links_code, new_links_code)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Patched", path)
