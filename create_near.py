import re
import os

base_dir = '/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio/Curriculum/private'
cv_path = os.path.join(base_dir, 'cv.html')
near_path = os.path.join(base_dir, 'near.html')

with open(cv_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Update title and top bar references
html = html.replace('<title>Felipe Conceição — CV & Cover Letter (Private)</title>', '<title>Felipe Conceição — Application for Near</title>')
html = html.replace('Edition 01 / 2025', 'Application / Near')

cover_letter_html = """
        <!-- Cover Letter Section (Custom for Near) -->
        <section id="cover-letter" class="hairline border-b relative">
            <div class="section-header">
                <div class="container-custom flex items-end justify-between py-7">
                    <div class="flex items-end gap-6">
                        <span class="section-number">00</span>
                        <h2 class="section-title text-[#34d399]">Application: Near</h2>
                    </div>
                    <div class="serif text-white/55 italic">Cover Letter</div>
                </div>
                <div class="container-custom">
                    <div class="hairline border-b w-full"></div>
                </div>
            </div>

            <div class="container-custom grid grid-cols-12 py-14 sm:py-20 gap-10">
                <!-- 01. Opening -->
                <div class="col-span-12 lg:col-span-6 reveal-mech">
                    <div class="font-mono text-[10px] uppercase tracking-widest text-[#34d399]/70 mb-4">01. OPENING</div>
                    <p class="text-white/80 leading-relaxed text-sm sm:text-base">I'm Felipe Conceição — Creative Director and motion designer behind Pelimotion Hub in Rio de Janeiro. For eight years I've been building visual systems for brands across Latin America and beyond: from full motion branding campaigns to modular asset libraries that marketing teams keep using long after launch day.</p>
                </div>
                
                <!-- 02. What I Bring -->
                <div class="col-span-12 lg:col-span-6 reveal-mech">
                    <div class="font-mono text-[10px] uppercase tracking-widest text-[#34d399]/70 mb-4">02. WHAT I BRING</div>
                    <p class="text-white/80 leading-relaxed text-sm sm:text-base">My work lives at the intersection of strategy and execution. I concept, direct, and deliver — in After Effects, Illustrator, Premiere, and Figma — without needing a layer of translation between creative thinking and the timeline. I've produced CGI/motion content for BMW, Subaru, Hyundai, and Motul, and led the full motion branding for a brand relaunch that included both the launch film and a complete Motion Media Kit for ongoing marketing use.</p>
                </div>

                <!-- 03. Why Different -->
                <div class="col-span-12 lg:col-span-6 reveal-mech">
                    <div class="font-mono text-[10px] uppercase tracking-widest text-[#34d399]/70 mb-4">03. WHY DIFFERENT</div>
                    <p class="text-white/80 leading-relaxed text-sm sm:text-base">I approach motion the way a musician approaches rhythm — timing, weight, silence. That foundation, combined with AI-integrated workflows and a minimalist design philosophy, means I move fast without losing craft. Fluent in async-first communication, accustomed to U.S. client standards, English at professional level.</p>
                </div>

                <!-- 04. Why Near & Why Now -->
                <div class="col-span-12 lg:col-span-6 reveal-mech">
                    <div class="font-mono text-[10px] uppercase tracking-widest text-[#34d399]/70 mb-4">04. WHY NEAR & WHY NOW</div>
                    <p class="text-white/80 leading-relaxed text-sm sm:text-base">Near's model — connecting LatAm talent with high-growth U.S. companies — is exactly the move I've been building toward. Performance marketing demands motion that works, not just motion that looks good. That tension between aesthetics and results is where I'm most at home. Ready for full-time commitment and the pace this role requires.</p>
                </div>
            </div>
        </section>
"""

# Insert cover_letter_html before the profile section
html = html.replace('<!-- Profile Section -->', cover_letter_html + '\n        <!-- Profile Section -->')
# Wait, let's see if Profile Section exists. If not, insert before <section id="profile"
html = html.replace('<section id="profile"', cover_letter_html + '\n        <section id="profile"')

# Add Near to the nav menu
html = html.replace('<nav class="hidden md:flex flex-1 justify-center gap-10 nav-label text-white/55">',
                    '<nav class="hidden md:flex flex-1 justify-center gap-10 nav-label text-white/55">\n                    <a href="#cover-letter" class="nav-link text-[#34d399]">00.Intro</a>')

with open(near_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("Created near.html successfully.")
