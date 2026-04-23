import re
import os

base_dir = '/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio/Curriculum/private'
index_path = os.path.join(base_dir, 'index.html')

with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Extract CV HTML
cv_start = html.find('<div id="page-cv">')
cv_end = html.find('</div><!-- end page-cv -->') + len('</div><!-- end page-cv -->')
page_cv_html = html[cv_start:cv_end]
# Remove the wrapper div
page_cv_html = re.sub(r'^<div id="page-cv">\n?', '', page_cv_html)
page_cv_html = re.sub(r'\n?</div><!-- end page-cv -->$', '', page_cv_html)

# 2. Extract CL HTML
cl_start = html.find('<div id="page-cl"')
cl_end = html.find('</main>\n    </div>') + len('</main>\n    </div>')
page_cl_html = html[cl_start:cl_end]
# Remove the wrapper div
page_cl_html = re.sub(r'^<div id="page-cl"[^>]*>\n?', '', page_cl_html)
page_cl_html = re.sub(r'\n?</div>$', '', page_cl_html)

# Extract <head> and common structure
head_end = html.find('</head>') + 7
head_html = html[:head_end]

# Extract common scripts
script_start = html.find('<script src="/Curriculum/script.js">')
script_end = html.find('</html>')
script_html = html[script_start:script_end]

# --- Build cv.html ---
cv_file = head_html + '\n<body class="bg-black text-white selection:bg-white/20">\n' + page_cv_html + '\n' + script_html
# Remove CL specific JS from cv.html to keep it clean (or just leave it, it's harmless if elements don't exist)
# We can just leave the JS injection as is, `setText` fails silently if id not found.
# Let's remove the priv-bar from cv.html, or replace it with a back button
back_bar = """
    <div id="priv-bar" class="sticky top-0 z-[100] bg-black border-b border-white/10 flex items-center px-4 sm:px-8">
      <span class="font-mono text-[9px] tracking-[0.4em] uppercase text-white/30 mr-auto hidden sm:inline-block">[PRIVATE_ACCESS]</span>
      <div class="flex">
          <a href="./index.html" class="font-mono text-[10px] tracking-widest uppercase py-4 px-6 transition-colors text-white/40 border-b-2 border-transparent hover:text-white/70">← BACK</a>
      </div>
    </div>
"""
cv_file = cv_file.replace('<body class="bg-black text-white selection:bg-white/20">', '<body class="bg-black text-white selection:bg-white/20">\n' + back_bar)

with open(os.path.join(base_dir, 'cv.html'), 'w', encoding='utf-8') as f:
    f.write(cv_file)

# --- Build cl.html ---
cl_file = head_html + '\n<body class="bg-black text-white selection:bg-white/20">\n' + page_cl_html + '\n' + script_html
cl_file = cl_file.replace('<body class="bg-black text-white selection:bg-white/20">', '<body class="bg-black text-white selection:bg-white/20">\n' + back_bar)

with open(os.path.join(base_dir, 'cl.html'), 'w', encoding='utf-8') as f:
    f.write(cl_file)

# --- Build index.html (Gateway) ---
gateway_html = head_html + """
<body class="bg-black text-white selection:bg-white/20 min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
    <!-- Animated bg -->
    <div aria-hidden="true" class="absolute inset-0 pointer-events-none opacity-20">
        <div class="hero-bg-text left animate-drift-x">FC</div>
        <div class="hero-bg-text-cv right animate-float-slow">prv</div>
    </div>

    <div class="z-10 text-center mb-16 reveal-mech visible">
        <div class="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-6">[PRIVATE_ACCESS]</div>
        <h1 class="hero-title text-5xl sm:text-7xl">Select Document<span class="text-white/30">.</span></h1>
    </div>

    <div class="z-10 flex flex-col sm:flex-row gap-6 w-full max-w-3xl px-6 reveal-mech visible" style="transition-delay: 100ms">
        <a href="cv.html" class="flex-1 group relative overflow-hidden border border-white/20 bg-white/[0.02] p-10 hover:bg-white/[0.05] hover:border-white/50 transition-all duration-500">
            <div class="font-mono text-[10px] tracking-widest text-white/40 mb-8">DOC_01</div>
            <h2 class="text-3xl font-medium mb-2 group-hover:-translate-y-1 transition-transform">Curriculum Vitae</h2>
            <p class="serif italic text-white/50 mb-10 group-hover:-translate-y-1 transition-transform">Full professional experience, education, and toolkit.</p>
            <div class="flex justify-between items-center font-mono text-[10px] uppercase tracking-widest text-white/70">
                <span>View CV</span>
                <span class="group-hover:translate-x-2 transition-transform">→</span>
            </div>
        </a>

        <a href="cl.html" class="flex-1 group relative overflow-hidden border border-white/20 bg-white/[0.02] p-10 hover:bg-white/[0.05] hover:border-white/50 transition-all duration-500">
            <div class="font-mono text-[10px] tracking-widest text-white/40 mb-8">DOC_02</div>
            <h2 class="text-3xl font-medium mb-2 group-hover:-translate-y-1 transition-transform">Cover Letter</h2>
            <p class="serif italic text-white/50 mb-10 group-hover:-translate-y-1 transition-transform">Personal introduction and strategic alignment.</p>
            <div class="flex justify-between items-center font-mono text-[10px] uppercase tracking-widest text-white/70">
                <span>Read Letter</span>
                <span class="group-hover:translate-x-2 transition-transform">→</span>
            </div>
        </a>
    </div>
    
    <div class="absolute bottom-10 font-mono text-[9px] uppercase tracking-[0.3em] text-white/20">
        FC.PRV — Edition 01 / 2025
    </div>
    
    <script src="/Curriculum/script.js"></script>
    <script>
        document.querySelectorAll('.reveal-mech').forEach(el => setTimeout(() => el.classList.add('visible'), 50));
    </script>
</body>
</html>
"""

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(gateway_html)

print("Split completed successfully.")
