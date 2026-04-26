import os
import re

files_to_fix = [
    'Curriculum/index.html',
    'Curriculum/private/app.html',
    'Curriculum/private/cv.html',
    'Curriculum/private/near.html',
    'Curriculum/private/cl.html'
]

css_pattern = re.compile(r'@media print\s*\{.*?\n\s*\}', re.DOTALL)

new_print_css = """@media print{
  #priv-bar{display:none!important}
  @page { margin: 0; size: auto; }
  body {
    background-color: #050505 !important;
    color: #fff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .bg-black { background-color: #050505 !important; }
  .text-white { color: #ffffff !important; }
  .border-white\\/10 { border-color: rgba(255,255,255,0.1) !important; }
  .border-white\\/5 { border-color: rgba(255,255,255,0.05) !important; }
  .text-white\\/40 { color: rgba(255,255,255,0.4) !important; }
  .text-white\\/30 { color: rgba(255,255,255,0.3) !important; }
  .text-white\\/20 { color: rgba(255,255,255,0.2) !important; }
  .text-white\\/55 { color: rgba(255,255,255,0.55) !important; }
  .text-white\\/70 { color: rgba(255,255,255,0.7) !important; }
  
  /* Hide the progress bar on print */
  .progress-bar-container { display: none !important; }

  section, article, .skill-group { page-break-inside: avoid; }
}"""

for filepath in files_to_fix:
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the print media query
    content = css_pattern.sub(new_print_css, content)
    
    # Check if [PRIVATE_ACCESS] is there, let's make it clickable for PDF download too
    if '[PRIVATE_ACCESS]' in content and 'onclick="window.print()"' not in content.split('[PRIVATE_ACCESS]')[0][-50:]:
        content = content.replace('[PRIVATE_ACCESS]</span>', '[PRIVATE_ACCESS]</span>').replace(
            'class="font-mono text-[9px] tracking-[0.4em] uppercase text-white/30 mr-auto hidden sm:inline-block"',
            'class="font-mono text-[9px] tracking-[0.4em] uppercase text-white/30 mr-auto hidden sm:inline-block cursor-pointer hover:text-white/70 transition-colors" onclick="window.print()" title="Save as PDF"'
        )
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Patched {filepath}")

