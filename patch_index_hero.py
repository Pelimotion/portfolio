import os

index_path = 'index.html'

if not os.path.exists(index_path):
    print("No index.html")
    exit()

with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the CSS
old_css = ".hero-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.55}"
new_css = """.hero-video-wrapper {
  position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden;
  clip-path: inset(0 100% 0 100%);
  transition: clip-path 1.5s cubic-bezier(0.85, 0, 0.15, 1);
}
.hero-video-wrapper.loaded { clip-path: inset(0 0 0 0); }
.hero-video {
  position: absolute; inset: -5%; width: 110%; height: 110%; object-fit: cover; opacity: .55;
  transform: scale(1.1); transition: transform 2s ease-out;
}
.hero-video-wrapper.loaded .hero-video { transform: scale(1); }"""

if old_css in content:
    content = content.replace(old_css, new_css)
else:
    print("old_css not found")

# 2. Update the HTML
old_html = """  <video class="hero-video" autoplay loop muted playsinline>
    <source src="Medias Portfolio/Pelimotion - Reel 2021.mp4" type="video/mp4">
  </video>"""
new_html = """  <div class="hero-video-wrapper" id="hero-reel-wrap">
    <video class="hero-video" id="hero-reel" loop muted playsinline preload="auto">
      <source src="https://pelimotion.b-cdn.net/Medias%20Portfolio/Pelimotion%20-%20Reel%202021.mp4" type="video/mp4">
    </video>
  </div>"""

if old_html in content:
    content = content.replace(old_html, new_html)
else:
    print("old_html not found")

# 3. Add the Javascript logic at the end of the script block (before </script> at the bottom)
js_logic = """
// ── HERO VIDEO REEEL LOGIC ──
document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById('hero-reel');
    const wrap = document.getElementById('hero-reel-wrap');
    if(!video || !wrap) return;
    
    let isLoaded = false;
    const playAndReveal = () => {
        if(isLoaded) return;
        isLoaded = true;
        video.play().then(() => { wrap.classList.add('loaded'); }).catch(e => { wrap.classList.add('loaded'); });
    };

    video.addEventListener('canplaythrough', playAndReveal);
    video.addEventListener('loadeddata', () => { setTimeout(playAndReveal, 500); });
    setTimeout(playAndReveal, 2000); // Fallback

    window.addEventListener('scroll', () => {
        const scroll = window.scrollY;
        const heroHeight = window.innerHeight;
        if(wrap.classList.contains('loaded')) {
            if (scroll > 10) {
                const maxInset = window.innerWidth > 768 ? 3 : 1.5;
                const progress = Math.min(scroll / (heroHeight * 0.6), 1);
                const currentInset = progress * maxInset;
                const currentRadius = progress * 16;
                wrap.style.clipPath = `inset(${currentInset}% ${currentInset}% ${currentInset}% ${currentInset}% round ${currentRadius}px)`;
                video.style.transform = `translateY(${scroll * 0.25}px)`;
            } else {
                wrap.style.clipPath = `inset(0 0 0 0 round 0px)`;
                video.style.transform = `translateY(0)`;
            }
        }
    });
});
"""

# Let's find the bottom of the script block.
if '<!-- Google Translate Integration -->' in content:
    content = content.replace('<!-- Google Translate Integration -->', js_logic + '\n<!-- Google Translate Integration -->')
else:
    content = content.replace('</body>', '<script>' + js_logic + '</script>\n</body>')

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched hero logic in index.html")
