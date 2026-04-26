import os
import re

files_to_fix = [
    'Curriculum/index.html',
    'Curriculum/private/app.html',
    'Curriculum/private/cv.html',
    'Curriculum/private/near.html',
    'Curriculum/private/cl.html'
]

script_to_add = """<script>
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
        
        // Match exact screen width so text doesn't reflow and change height!
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
</script>"""

for filepath in files_to_fix:
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Fix sticky header in print mode
    if 'header { position: relative !important; }' not in content:
        content = content.replace('/* Hide the progress bar on print */',
                                  'header { position: relative !important; top: auto !important; }\n  /* Hide the progress bar on print */')
    
    # 2. Replace generatePDF function and Cmd+P interceptor entirely
    # The previous script started with <script>\nfunction generatePDF()
    # Let's remove the old one with regex
    content = re.sub(r'<script>\nfunction generatePDF\(\) \{.*?</script>\n\n<script>\n// Intercept Cmd\+P.*?</script>', script_to_add, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Patched {filepath}")
