import os

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
        // --- PRINT SIMULATION FOR PERFECT HEIGHT ---
        // Hide elements that are hidden in @media print
        const privBar = document.getElementById('priv-bar');
        const progBar = document.querySelector('.progress-bar-container');
        const mainEl = document.querySelector('main');
        
        if (privBar) privBar.style.display = 'none';
        if (progBar) progBar.style.display = 'none';
        
        // Temporarily remove min-h-screen to avoid 100vh stretching to full page height during print
        if (mainEl) mainEl.classList.remove('min-h-screen');
        
        // Force layout recalculation
        void document.body.offsetHeight;
        
        // Measure exact rendered dimensions
        const rect = document.documentElement.getBoundingClientRect();
        const w = Math.ceil(rect.width);
        // Reduce the height by 2 pixels to guarantee no empty fractional spillover
        const h = Math.ceil(rect.height);
        
        let style = document.getElementById('dynamic-print-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'dynamic-print-style';
            document.head.appendChild(style);
        }
        
        // Inject the precise physical size and kill all browser margins
        style.innerHTML = `@media print { 
            @page { size: ${w}px ${h}px !important; margin: 0 !important; } 
            body, html { min-height: auto !important; height: auto !important; }
        }`;
        
        window.print();
        
        // --- CLEANUP ---
        setTimeout(() => {
            styleBlock.remove();
            if (privBar) privBar.style.display = '';
            if (progBar) progBar.style.display = '';
            if (mainEl) mainEl.classList.add('min-h-screen');
        }, 1000);
    }, 50);
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
    
    parts = content.split('<script>\nfunction generatePDF()')
    if len(parts) == 2:
        new_content = parts[0] + replacement
        with open(path, 'w') as f:
            f.write(new_content)
        print("Patched", path)
