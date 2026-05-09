import re

with open('/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio/Curriculum/private/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Fix style.css path for Vercel
html = html.replace('href="../style.css"', 'href="/Curriculum/style.css"')
html = html.replace('href="../../style.css"', 'href="/Curriculum/style.css"')

# 2. Make JS fully robust for showCL and showCV
js_funcs = """
window.showCV = function() {
    const pcv = document.getElementById('page-cv');
    const pcl = document.getElementById('page-cl');
    if(pcv) pcv.style.display = 'block';
    if(pcl) pcl.style.display = 'none';
    
    const bcv = document.getElementById('btn-cv');
    const bcl = document.getElementById('btn-cl');
    if(bcv) bcv.className = 'font-mono text-[10px] tracking-widest uppercase py-4 px-6 transition-colors text-white border-b-2 border-white';
    if(bcl) bcl.className = 'font-mono text-[10px] tracking-widest uppercase py-4 px-6 transition-colors text-white/40 border-b-2 border-transparent hover:text-white/70';
    window.scrollTo(0,0);
};

window.showCL = function() {
    const pcv = document.getElementById('page-cv');
    const pcl = document.getElementById('page-cl');
    if(pcv) pcv.style.display = 'none';
    if(pcl) pcl.style.display = 'block';
    
    const bcv = document.getElementById('btn-cv');
    const bcl = document.getElementById('btn-cl');
    if(bcl) bcl.className = 'font-mono text-[10px] tracking-widest uppercase py-4 px-6 transition-colors text-white border-b-2 border-white';
    if(bcv) bcv.className = 'font-mono text-[10px] tracking-widest uppercase py-4 px-6 transition-colors text-white/40 border-b-2 border-transparent hover:text-white/70';
    window.scrollTo(0,0);
};
"""

# Remove old showCV and showCL if they exist
html = re.sub(r'window\.showCV = showCV;.*', '', html)
html = re.sub(r'function showCV\(\)\{.*?\}', '', html, flags=re.DOTALL)
html = re.sub(r'function showCL\(\)\{.*?\}', '', html, flags=re.DOTALL)

# Insert robust functions before script close
html = html.replace('</script>\n</body>', js_funcs + '\n</script>\n</body>')

# 3. Restructure Cover Letter completely
new_cl = """
    <!-- Cover Letter Page (hidden by default) -->
    <div id="page-cl" style="display:none;" class="min-h-screen bg-black">
        <main class="min-h-screen">
            <header class="hairline border-b sticky top-0 z-50 bg-black/90 backdrop-blur-md">
                <div class="container-custom flex items-center justify-between py-3">
                    <div class="nav-label flex-1 font-mono hover:opacity-70 transition-opacity">
                        <span class="text-white/40">[</span>FC.CL<span class="text-white/40">]</span>
                        <span class="hidden lg:inline text-white/20">— PRIVATE_REQ</span>
                    </div>
                    <div class="nav-label flex-1 flex justify-end items-center gap-4 font-mono">
                        <div class="text-white/30 text-[9px] uppercase tracking-widest hidden sm:block">STATUS_IDLE</div>
                        <div class="flex items-center gap-2">
                            <span class="status-dot" style="background-color:#fff;box-shadow:0 0 10px #fff;"></span>
                            <span class="hidden sm:inline">READING</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Hero Section -->
            <section class="relative overflow-hidden hairline border-b">
                <div aria-hidden="true" class="absolute inset-0 pointer-events-none">
                    <div class="hero-bg-text left animate-drift-x">FC</div>
                    <div class="hero-bg-text-cv right animate-float-slow">cl</div>
                </div>

                <div class="container-custom grid grid-cols-12 pt-20 pb-10 sm:pt-28">
                    <div class="col-span-12 lg:col-span-8 reveal-mech visible">
                        <div class="label-tiny">Cover Letter — Edition 01 / 2025</div>
                        <h1 id="cl-name" class="hero-title mt-6">Felipe<br>Conceição<span class="text-white/30">.</span></h1>
                        <div class="mt-8 max-w-xl">
                            <p id="cl-subtitle" class="hero-sub">Creative Director, <span class="serif">motion branding</span> and artistic direction.</p>
                        </div>
                    </div>
                    <div class="col-span-12 lg:col-span-4 mt-12 lg:mt-0 flex flex-col justify-end reveal-mech visible">
                        <div class="grid grid-cols-2 gap-y-8 gap-x-4 border-l border-white/10 pl-6 sm:pl-10 h-full">
                            <div>
                                <div class="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-2">TARGET</div>
                                <div id="cl-role" class="text-sm font-medium">Creative / Motion Director</div>
                            </div>
                            <div>
                                <div class="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-2">BASED_IN</div>
                                <div id="cl-location" class="text-sm">Rio de Janeiro, BR</div>
                            </div>
                            <div>
                                <div class="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-2">DATE</div>
                                <div id="cl-date" class="text-sm">April 2026</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Letter Body Section -->
            <section class="hairline border-b relative">
                <div class="section-header">
                    <div class="container-custom flex items-end justify-between py-7">
                        <div class="flex items-end gap-6">
                            <span class="section-number">01</span>
                            <h2 class="section-title">The Letter</h2>
                        </div>
                        <div class="serif text-white/55 italic">Application</div>
                    </div>
                    <div class="container-custom">
                        <div class="hairline border-b w-full"></div>
                    </div>
                </div>

                <div class="container-custom grid grid-cols-12 py-14 sm:py-20 gap-10">
                    <div class="col-span-12 lg:col-span-8 reveal-mech visible">
                        <p id="cl-greeting" class="text-xl sm:text-2xl font-medium mb-10 text-white/90">Dear Hiring Team,</p>
                        <div class="space-y-8 text-white/70 text-base sm:text-lg leading-relaxed">
                            <p id="cl-opening">The most compelling brands today aren't just seen; they are felt. I have spent the last eight years operating at the intersection of strategy and motion, building kinetic visual systems that define how global brands move, scale, and connect with their audiences.</p>
                            <p id="cl-body1">As a Creative Director at Pelimotion Hub, I lead the development of high-end motion pipelines and immersive artistic experiences. My background as a musician heavily influences my approach: I treat motion design as a rhythmic discipline, where pacing, weight, and silence are just as critical as the visuals themselves.</p>
                            <p id="cl-body2">Modern brand direction requires more than aesthetic excellence; it demands scalable systems. I have pioneered AI-integrated generative video workflows, reducing friction in production pipelines while elevating the creative ceiling. Whether conceptualizing a global broadcast campaign or orchestrating a live projection mapping experience, I focus on delivering work that is both culturally resonant and structurally robust.</p>
                            <p id="cl-body3">I am looking to bring this systemic approach to motion branding to your team. I thrive in environments that challenge the status quo and demand a high degree of technical and conceptual rigor.</p>
                            <p id="cl-closing">I would welcome the opportunity to discuss how my vision for dynamic, rhythm-driven brand systems aligns with your upcoming objectives. Let's build something that moves.</p>
                        </div>
                        
                        <div class="mt-20 pt-10 border-t border-white/10">
                            <div id="cl-signoff" class="serif text-white/50 italic text-xl mb-4">Sincerely,</div>
                            <div id="cl-sname" class="text-2xl font-bold text-white">Felipe Conceição</div>
                            <div id="cl-stitle" class="font-mono text-[10px] uppercase tracking-widest text-white/40 mt-2">CREATIVE DIRECTOR</div>
                        </div>
                    </div>
                    
                    <div class="col-span-12 lg:col-span-4 lg:border-l border-white/10 lg:pl-10 mt-10 lg:mt-0 reveal-mech visible">
                        <div class="label-tiny mb-6">Liaise & Links</div>
                        <div id="cl-links" class="flex flex-col gap-4">
                            <a href="https://pelimotion.com" target="_blank" class="flex items-center justify-between border-b border-white/10 pb-2 hover:border-white/50 transition-colors">
                                <span class="font-mono text-[10px] uppercase tracking-widest">Portfolio</span>
                                <span class="text-white/30">↗</span>
                            </a>
                            <a href="mailto:conceicao.felipe@gmail.com" class="flex items-center justify-between border-b border-white/10 pb-2 hover:border-white/50 transition-colors">
                                <span class="font-mono text-[10px] uppercase tracking-widest">Email</span>
                                <span class="text-white/30">↗</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
"""

# Replace old page-cl with new page-cl
html = re.sub(r'<!-- Cover Letter Page \(hidden by default\) -->\s*<div id="page-cl".*?</div>\s*<script', new_cl + '\n    <script', html, flags=re.DOTALL)

with open('/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio/Curriculum/private/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Restructured Cover Letter and fixed JS.")
