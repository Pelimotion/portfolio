import os

files_to_fix = [
    'Curriculum/index.html',
    'Curriculum/private/app.html',
    'Curriculum/private/cv.html',
    'Curriculum/private/near.html',
    'Curriculum/private/cl.html'
]

script_to_add = """
<script>
// Intercept Cmd+P or Ctrl+P
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        generatePDF();
    }
});
</script>
"""

for filepath in files_to_fix:
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove 'section' from page-break-inside to fix A4 gaps
    content = content.replace('section, article, .skill-group { page-break-inside: avoid; }', 
                              'article, .skill-group, .edu-item, .exp-item { page-break-inside: avoid; }')
    
    # Add Cmd+P interceptor if not already present
    if '// Intercept Cmd+P' not in content:
        content = content.replace('</body>', script_to_add + '\n</body>')
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Patched {filepath}")

