import os
import re

files_to_fix = [
    'Curriculum/index.html',
    'Curriculum/private/app.html',
    'Curriculum/private/cv.html',
    'Curriculum/private/near.html',
    'Curriculum/private/cl.html'
]

script_to_add = """
<script>
function generatePDF() {
    // Reveal all items so they are included in the height calculation
    document.querySelectorAll('.reveal-mech, .reveal').forEach(el => {
        el.classList.add('visible', 'active');
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
    
    // Give it a tiny bit of time to render the visibility changes
    setTimeout(() => {
        const h = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
        
        let style = document.getElementById('dynamic-print-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'dynamic-print-style';
            document.head.appendChild(style);
        }
        
        // 1400px width matches the max container size, height dynamically adjusts
        style.innerHTML = `@media print { @page { size: 1400px ${h + 10}px; margin: 0; } }`;
        
        window.print();
    }, 150);
}
</script>
"""

for filepath in files_to_fix:
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Remove @page { margin: 0; size: auto; }
    content = content.replace('@page { margin: 0; size: auto; }', '')
    
    # 2. Change onclick="window.print()" or onclick="event.preventDefault(); window.print();"
    content = content.replace('onclick="window.print()"', 'onclick="event.preventDefault(); generatePDF()"')
    content = content.replace('onclick="event.preventDefault(); window.print();"', 'onclick="event.preventDefault(); generatePDF();"')
    
    # 3. Add the script before </body>
    if 'function generatePDF()' not in content:
        content = content.replace('</body>', script_to_add + '\n</body>')
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Patched {filepath}")

