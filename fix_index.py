import os

filepath = 'Curriculum/private/index.html'

with open(filepath, 'r') as f:
    content = f.read()

# 1. Add id to grid
content = content.replace(
    '<div class="z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-6 reveal-mech visible" style="transition-delay: 100ms">',
    '<div id="doc-grid" class="z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-6 reveal-mech visible" style="transition-delay: 100ms">'
)

# 2. Remove the hardcoded near.html block
# We will use string manipulation
start_idx = content.find('<a href="near.html"')
end_idx = content.find('</a>', start_idx) + 4
if start_idx != -1:
    content = content[:start_idx] + content[end_idx:]

# 3. Add JS to fetch and render
script_inject = """        function navTo(e, file) {
            e.preventDefault();
            let p = window.location.pathname;
            if (p.endsWith('private')) p += '/';
            else if (!p.endsWith('/') && !p.endsWith('.html')) p = p.substring(0, p.lastIndexOf('/') + 1);
            else if (p.endsWith('.html')) p = p.substring(0, p.lastIndexOf('/') + 1);
            window.location.href = p + file;
        }

        // Fetch duplicated applications and inject into grid
        fetch('/site-content.json?v=' + Date.now())
            .then(res => res.json())
            .then(data => {
                if(data.applications && data.applications.length > 0) {
                    const grid = document.getElementById('doc-grid');
                    data.applications.forEach((app, idx) => {
                        const link = document.createElement('a');
                        link.href = `app.html?app=${app.id}`;
                        link.className = "group relative overflow-hidden border transition-all duration-500 p-10";
                        const cColor = app.accentColor || '#34d399';
                        
                        link.style.borderColor = cColor + '66'; // 40% opacity
                        link.style.backgroundColor = cColor + '05'; // 2% opacity
                        
                        link.onmouseenter = () => {
                            link.style.backgroundColor = cColor + '0D'; // 5% opacity
                            link.style.borderColor = cColor;
                        };
                        link.onmouseleave = () => {
                            link.style.backgroundColor = cColor + '05';
                            link.style.borderColor = cColor + '66';
                        };

                        const docNum = String(idx + 3).padStart(2, '0');
                        
                        link.innerHTML = `
                            <div class="font-mono text-[10px] tracking-widest mb-8" style="color:${cColor}b3">DOC_${docNum}_PRIVATE</div>
                            <h2 class="text-3xl font-medium mb-2 group-hover:-translate-y-1 transition-transform text-white">${app.companyName}</h2>
                            <p class="serif italic text-white/50 mb-10 group-hover:-translate-y-1 transition-transform">Custom curriculum and cover letter for ${app.companyName}.</p>
                            <div class="flex justify-between items-center font-mono text-[10px] uppercase tracking-widest" style="color:${cColor}">
                                <span>View Application</span>
                                <span class="group-hover:translate-x-2 transition-transform">→</span>
                            </div>
                        `;
                        
                        link.onclick = (e) => navTo(e, `app.html?app=${app.id}`);
                        
                        grid.appendChild(link);
                    });
                }
            })
            .catch(err => console.error('Failed to load applications:', err));
"""

content = content.replace("""        function navTo(e, file) {
            e.preventDefault();
            let p = window.location.pathname;
            if (p.endsWith('private')) p += '/';
            else if (!p.endsWith('/') && !p.endsWith('.html')) p = p.substring(0, p.lastIndexOf('/') + 1);
            else if (p.endsWith('.html')) p = p.substring(0, p.lastIndexOf('/') + 1);
            window.location.href = p + file;
        }""", script_inject)

with open(filepath, 'w') as f:
    f.write(content)
