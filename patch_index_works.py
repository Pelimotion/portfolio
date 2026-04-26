import os

index_path = 'index.html'

if not os.path.exists(index_path):
    print("No index.html")
    exit()

with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_portfolio_link = """    <div class="section-header-row reveal">
      <div class="section-label">02 — Selected Work</div>
      <a href="V1/portfolio/index.html" class="section-link">Full Portfolio →</a>
    </div>
    <div class="port-inner">
      <a href="V1/portfolio/index.html" class="port-card port-full reveal" style="transition-delay:.05s">
        <video autoplay loop muted playsinline>
          <source src="Medias Portfolio/Pelimotion - Reel 2021.mp4" type="video/mp4">
        </video>
        <div class="port-card-overlay">
          <div class="port-card-content">
            <div class="port-tag">Motion Branding · CGI · Creative Direction</div>
            <div class="port-name">Full Portfolio Reel <span class="port-arrow">→</span></div>
          </div>
        </div>
      </a>
      <a href="V1/portfolio/index.html" class="port-card reveal" style="transition-delay:.1s">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,#111 0%,#1a1a1a 100%);display:flex;align-items:center;justify-content:center">
          <div style="font-size:3rem;font-weight:900;letter-spacing:-.04em;color:rgba(240,237,232,.08);text-transform:uppercase">BRAND</div>
        </div>
        <div class="port-card-overlay">
          <div class="port-card-content">
            <div class="port-tag">Identity · Motion Systems</div>
            <div class="port-name">Motion Branding <span class="port-arrow">→</span></div>
          </div>
        </div>
      </a>
      <a href="V1/portfolio/index.html" class="port-card reveal" style="transition-delay:.15s">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,#0d0d0d 0%,#161616 100%);display:flex;align-items:center;justify-content:center">
          <div style="font-size:3rem;font-weight:900;letter-spacing:-.04em;color:rgba(240,237,232,.08);text-transform:uppercase">CGI</div>
        </div>
        <div class="port-card-overlay">
          <div class="port-card-content">
            <div class="port-tag">CGI · Post-Production</div>
            <div class="port-name">Automotive &amp; CGI <span class="port-arrow">→</span></div>
          </div>
        </div>
      </a>
    </div>"""

new_portfolio_link = """    <div class="section-header-row reveal">
      <div class="section-label" data-en="02 — Selected Work" data-pt="02 — Trabalhos Selecionados">02 — Selected Work</div>
      <a href="V1/portfolio/index.html" class="section-link" data-en="View More Projects →" data-pt="Ver Mais Projetos →">View More Projects →</a>
    </div>
    <div class="port-inner">
      <a href="V1/portfolio/index.html" class="port-card port-full reveal" style="transition-delay:.05s">
        <video autoplay loop muted playsinline>
          <source src="https://pelimotion.b-cdn.net/Medias%20Portfolio/Funky%20Room/FUNKY%20ROOM%203%20-%20OVERVIEW.mp4" type="video/mp4">
        </video>
        <div class="port-card-overlay">
          <div class="port-card-content">
            <div class="port-tag">Visual Systems · Stage Direction</div>
            <div class="port-name">Funky Room <span class="port-arrow">→</span></div>
          </div>
        </div>
      </a>
      <a href="V1/portfolio/index.html" class="port-card reveal" style="transition-delay:.1s">
        <video autoplay loop muted playsinline>
          <source src="https://pelimotion.b-cdn.net/Medias%20Portfolio/Suzano/SUZANO_MANIFESTO.mp4" type="video/mp4">
        </video>
        <div class="port-card-overlay">
          <div class="port-card-content">
            <div class="port-tag">Motion Branding</div>
            <div class="port-name">Suzano <span class="port-arrow">→</span></div>
          </div>
        </div>
      </a>
      <a href="V1/portfolio/index.html" class="port-card reveal" style="transition-delay:.15s">
        <video autoplay loop muted playsinline>
          <source src="https://pelimotion.b-cdn.net/Medias%20Portfolio/FURB/Apresentac%CC%A7a%CC%83o_FURB_2021.mp4" type="video/mp4">
        </video>
        <div class="port-card-overlay">
          <div class="port-card-content">
            <div class="port-tag">Motion Systems</div>
            <div class="port-name">FURB <span class="port-arrow">→</span></div>
          </div>
        </div>
      </a>
    </div>"""

if old_portfolio_link in content:
    content = content.replace(old_portfolio_link, new_portfolio_link)
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched index.html works section")
else:
    print("old_portfolio_link not found")
