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

    # Fix Portfolio URL in ccEl (Contact Cards)
    old_ccel = """    cards.push(`<a href="/" class="contact-card border-t border-white/10 group transition-colors hover:bg-white/5">
        <div class="label-tiny">Portfolio</div>
        <div class="tag-label mt-3">pelimotion.com</div></a>`);"""
    new_ccel = """    const webUrl = C.contactWebsite && C.contactWebsite.startsWith('http') ? C.contactWebsite : (C.contactWebsite ? 'https://'+C.contactWebsite : 'https://pelimotion.com');
    cards.push(`<a href="${webUrl}" target="_blank" class="contact-card border-t border-white/10 group transition-colors hover:bg-white/5">
        <div class="label-tiny" data-en="Portfolio" data-pt="Portfólio">Portfolio</div>
        <div class="tag-label mt-3" data-en="visit website" data-pt="visite a página">visit website</div></a>`);"""
    
    if old_ccel in content:
        content = content.replace(old_ccel, new_ccel)

    # Fix Portfolio URL in cl-links
    old_cl_link = "['Portfolio','https://pelimotion.com'],"
    new_cl_link = "['Portfolio', C.contactWebsite && C.contactWebsite.startsWith('http') ? C.contactWebsite : (C.contactWebsite ? 'https://'+C.contactWebsite : 'https://pelimotion.com')],"
    
    if old_cl_link in content:
        content = content.replace(old_cl_link, new_cl_link)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Patched", path)
