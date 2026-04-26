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
    document.querySelectorAll('.reveal-mech, .reveal').forEach(el => {
        el.classList.add('visible', 'active');
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
    
    setTimeout(() => {
        const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        const w = window.innerWidth;
        
        let style = document.getElementById('dynamic-print-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'dynamic-print-style';
            document.head.appendChild(style);
        }
        
        // Exact screen width and height
        style.innerHTML = `@media print { @page { size: ${w}px ${h}px; margin: 0; } }`;
        
        window.print();
    }, 200);
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
    
    # split at the first generatePDF script start
    parts = content.split('<script>\nfunction generatePDF()')
    if len(parts) == 2:
        new_content = parts[0] + replacement
        with open(path, 'w') as f:
            f.write(new_content)
        print("Patched", path)
