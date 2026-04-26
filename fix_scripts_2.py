import os
import re

files = [
    'Curriculum/index.html',
    'Curriculum/private/app.html',
    'Curriculum/private/cv.html',
    'Curriculum/private/near.html',
    'Curriculum/private/cl.html'
]

replacement = """<script>
function generatePDF() {
    // Disable all transitions instantly
    const styleBlock = document.createElement('style');
    styleBlock.innerHTML = `* { transition: none !important; animation: none !important; }`;
    document.head.appendChild(styleBlock);

    // Reveal everything
    document.querySelectorAll('.reveal-mech, .reveal').forEach(el => {
        el.classList.add('visible', 'active');
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
    
    setTimeout(() => {
        // Use getBoundingClientRect for absolute pixel-perfect rendered dimensions
        const rect = document.documentElement.getBoundingClientRect();
        const w = Math.ceil(rect.width);
        const h = Math.ceil(rect.height);
        
        let style = document.getElementById('dynamic-print-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'dynamic-print-style';
            document.head.appendChild(style);
        }
        
        // Exact rendered dimensions with zero margin
        style.innerHTML = `@media print { @page { size: ${w}px ${h}px; margin: 0 !important; } }`;
        
        window.print();
        
        // Clean up after print dialog opens
        setTimeout(() => {
            styleBlock.remove();
        }, 1000);
    }, 50); // very short timeout since transitions are disabled
}

// Intercept Cmd+P or Ctrl+P
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        generatePDF();
    }
});
</script>
</body>"""

for path in files:
    if not os.path.exists(path): continue
    with open(path, 'r') as f:
        content = f.read()
    
    # replace the entire script block at the end
    parts = content.split('<script>\nfunction generatePDF()')
    if len(parts) == 2:
        new_content = parts[0] + replacement
        with open(path, 'w') as f:
            f.write(new_content)
        print("Patched", path)
