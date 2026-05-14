import os
import subprocess
import json
import shutil
import datetime

media_dir = "/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio/Medias Portfolio"
workspace_dir = "/Volumes/PLM SSD 01/Pipeline SSD 01/Pelimotion/Portfolio"

logo_path = "logo.png"
if os.path.exists(os.path.join(workspace_dir, "logo.svg")):
    logo_path = "logo.svg"
elif os.path.exists(os.path.join(workspace_dir, "logo.webp")):
    logo_path = "logo.webp"

# ─── Client & Category Descriptions ───
CLIENT_DESC = {
    "BC MAPPING FESTIVAL": "Visual identity and motion system for BC Mapping Festival — a large-scale projection mapping event celebrating art, light, and urban architecture.",
    "EQI": "Behind the scenes content production for EQI Investimentos' exclusive activation at Cirque du Soleil.",
    "FAST SHIPPING": "Living rebranding concept — a dynamic visual identity system that breathes, evolves, and adapts across digital touchpoints.",
    "FUNKY ROOM": "Full creative direction and motion branding for Funky Room, a recurring underground party series. Six editions of visual identity, campaign material, and brand animation.",
    "FURB": "Broadcast and institutional campaign work for FURB university — motion design for TV, digital, and event formats including accessible LIBRAS versions.",
    "HEO": "Complete rebranding motion package for HEO — logo animation, visual system, and brand guidelines in motion.",
    "ISLA": "Motion branding, manifesto films, and campaign material for Isla — a beachside venue blending gastronomy, nightlife, and coastal aesthetics.",
    "LSLA": "Motion branding, manifesto films, and campaign material for Isla — a beachside venue blending gastronomy, nightlife, and coastal aesthetics.",
    "NEXTRON": "Logo animation and brand signature update for Nextron — clean, technical motion design for a tech brand.",
    "PIANISSIMO": "Stage visuals and real-time visualizers for Pianissimo — ambient, generative motion for live performance environments.",
    "PLAYA": "Comprehensive motion branding for Playa Beach Club — manifesto films, weekly campaigns, event promos, and seasonal visual identity across 40+ deliverables.",
    "RIO CARNAVAL": "App visualizer and release film for Rio Carnaval — capturing the kinetic energy of Brazil's biggest cultural event through motion design.",
    "SUZANO": "Institutional and event motion design for Suzano — including innovation center presentations, award ceremonies, and internal culture films.",
    "VARIADOS": "Selected personal and experimental motion work — reels, explorations, and cross-discipline projects.",
}

CATEGORY_DESC = {
    "Media Kit": "Brand assets in motion — color palettes, patterns, and transitions for digital and print application.",
    "Motion Campaign": "Campaign-ready deliverables — social media, OOH, digital ads, and event-specific motion pieces.",
    "FUNKY 6 - FUNKED UP": "Edition 06 — Funked Up. A rawer, grittier take on the Funky Room identity with conceptual slogans and BTS content.",
    "FUNKY ROOM 1": "Edition 01 — The original. First Room, After Party, and the birth of the visual language.",
    "FUNKY ROOM 2": "Edition 02 — Drop culture meets nightlife. Ticket reveals, headline animations, and urgency-driven promos.",
    "FUNKY ROOM 3": "Edition 03 — Full social media campaign. Multi-format content for feed, stories, and OOH.",
    "FUNKY ROOM 4": "Edition 04 — Blue Edition. Turntable visuals, headline reveals, and artist-specific content.",
    "FUNKY ROOM 5": "Edition 05 — Evolved social media system with refined grid and content hierarchy.",
    "Broadcast Campaign - FURB": "TV-ready spots and institutional films — multi-format broadcast campaign with LIBRAS accessibility.",
    "ETEVI": "Event-specific campaign for ETEVI — multi-resolution adaptations for screens, social, and outdoor.",
    "Motion Campaign - ETEVI": "Extended motion deliverables for the ETEVI event series.",
    "MANIFESTO": "Brand manifesto and concept films — high-production narrative pieces that define the brand's soul.",
    "IA Genenerated": "AI-assisted visual explorations — experimental food and lifestyle content generated with creative AI tools.",
}

html_template = f"""<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PLM — Pelimotion</title>
    <meta name="description" content="Pelimotion — Premium motion design studio by Felipe Conceição. Kinetic visual experiences.">
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg: #f5f5f5; --fg: #050505; --fg2: #444; --fg3: #999;
            --border: #050505; --card-bg: #ececec;
            --overlay: rgba(245,245,245,0.94); --modal-bg: rgba(245,245,245,0.97);
            --img-filter: grayscale(100%) contrast(1.1);
            --img-hover-filter: grayscale(0%) contrast(1);
            --pattern-bg: #fff; --pattern-fg: #000;
        }}
        [data-theme="dark"] {{
            --bg: #080808; --fg: #f0f0f0; --fg2: #999; --fg3: #444;
            --border: #2a2a2a; --card-bg: #111;
            --overlay: rgba(8,8,8,0.94); --modal-bg: rgba(8,8,8,0.97);
            --img-filter: grayscale(100%) brightness(.65) contrast(1.15);
            --img-hover-filter: grayscale(0%) brightness(1) contrast(1);
            --pattern-bg: #000; --pattern-fg: #fff;
        }}
        *,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
        html{{background:var(--bg);color:var(--fg);transition:background .4s,color .4s}}
        body{{
            background:var(--bg);color:var(--fg);
            font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
            margin:0;cursor:none;overscroll-behavior:none;
            -webkit-tap-highlight-color:transparent;
            transition:background .4s,color .4s;
            overflow:hidden;height:100vh;width:100vw;
        }}
        @media(max-width:767px){{body{{cursor:auto;overflow-x:hidden;overflow-y:auto;height:auto}}}}
        a,button,.interactive{{cursor:none;text-decoration:none;color:inherit}}
        @media(max-width:767px){{a,button,.interactive{{cursor:auto}}}}
        
        /* ═══ CURSOR ═══ */
        #cursor-dot{{position:fixed;top:0;left:0;width:6px;height:6px;background:var(--fg);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .15s,height .15s}}
        #cursor-ring{{position:fixed;top:0;left:0;width:14px;height:14px;border:1.5px solid var(--fg);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:width .12s,height .12s}}
        body.is-hovering #cursor-ring{{width:11px;height:11px}}
        body.is-hovering #cursor-dot{{width:6.6px;height:6.6px}}
        body.is-moving #cursor-ring{{width:15.4px;height:15.4px}}

        /* ═══ STRIPS ═══ */
        .ca-stripe{{position:fixed;top:0;height:100vh;width:24px;pointer-events:none;z-index:800;overflow:hidden;filter:url(#turing-thresh);background:var(--pattern-bg)}}
        .ca-stripe canvas{{display:block;width:100%;height:100%;filter:blur(3px)}}
        .ca-stripe-left{{left:0;border-right:1.5px solid var(--border)}}
        .ca-stripe-right{{right:0;border-left:1.5px solid var(--border)}}
        @media(max-width:900px){{.ca-stripe{{display:none}}}}

        /* ═══ THEME TOGGLE ═══ */
        .theme-toggle{{position:fixed;top:1.6rem;right:1.6rem;z-index:960;width:34px;height:34px;border:1.5px solid var(--fg);background:transparent;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:var(--fg);transition:background .2s,color .2s}}
        .theme-toggle:hover{{background:var(--fg);color:var(--bg)}}
        @media(max-width:767px){{.theme-toggle{{top:1rem;right:1rem}}}}

        /* ═══ CONTACT BUTTON ═══ */
        .contact-trigger{{
            position:fixed;top:1.6rem;right:4.2rem;z-index:960;
            padding:6px 14px;border:1.5px solid var(--fg);background:transparent;
            font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size:9px;font-weight:900;letter-spacing:.35em;text-transform:uppercase;
            color:var(--fg);transition:background .2s,color .2s;
        }}
        .contact-trigger:hover{{background:var(--fg);color:var(--bg)}}
        @media(max-width:767px){{.contact-trigger{{top:1rem;right:3.6rem;padding:7px 10px;font-size:8px;letter-spacing:.2em}}}}

        /* ═══ CONTACT POPOVER ═══ */
        .contact-popover{{
            position:fixed;top:4.4rem;right:1.6rem;z-index:970;
            background:var(--bg);border:1.5px solid var(--border);
            padding:0;width:280px;
            opacity:0;visibility:hidden;transform:translateY(-8px);
            transition:opacity .3s,visibility .3s,transform .3s;
            box-shadow:0 8px 32px rgba(0,0,0,.08);
        }}
        .contact-popover.open{{opacity:1;visibility:visible;transform:translateY(0)}}
        .contact-popover-header{{
            padding:16px 20px 12px;border-bottom:1.5px solid var(--border);
            font-size:8px;font-weight:900;letter-spacing:.4em;text-transform:uppercase;color:var(--fg3);
        }}
        .contact-popover a{{
            display:flex;align-items:center;gap:12px;
            padding:16px 20px;border-bottom:1px solid var(--border);
            font-size:13px;font-weight:500;color:var(--fg);
            transition:background .2s,padding-left .2s;
        }}
        .contact-popover a:last-child{{border-bottom:none}}
        .contact-popover a:hover{{background:var(--fg);color:var(--bg);padding-left:26px}}
        .contact-popover a span.contact-icon{{font-size:18px;flex-shrink:0;width:24px;text-align:center}}
        .contact-popover a span.contact-label{{font-size:9px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:var(--fg2)}}
        .contact-popover a:hover span.contact-label{{color:var(--bg)}}

        /* ═══ VIEW SYSTEM ═══ */
        .view-wrapper{{
            position:fixed;top:0;left:0;width:100%;height:100%;
            overflow-y:auto;overflow-x:hidden;
            opacity:0;pointer-events:none;visibility:hidden;z-index:10;
            transition:opacity .6s,visibility .6s;
            -webkit-overflow-scrolling:touch;
            scrollbar-width:none;-ms-overflow-style:none;
        }}
        .view-wrapper::-webkit-scrollbar{{display:none}}
        .view-wrapper.active{{opacity:1;pointer-events:all;visibility:visible;z-index:20}}
        @media(max-width:767px){{
            .view-wrapper{{position:relative;display:none;height:auto;overflow:visible}}
            .view-wrapper.active{{display:block;opacity:1;pointer-events:all;visibility:visible}}
        }}

        /* ═══ FLOATING NAV ═══ */
        .floating-nav{{
            position:fixed;z-index:990;opacity:0;pointer-events:none;
            transition:opacity .4s,transform .4s;
            background:var(--overlay);backdrop-filter:blur(12px);
            padding:9px 20px;border:1.5px solid var(--border);
            font-size:9px;font-weight:900;letter-spacing:.35em;
            text-transform:uppercase;color:var(--fg);
            display:flex;align-items:center;gap:8px;
        }}
        .floating-nav.active{{opacity:1;pointer-events:all}}
        .floating-nav:hover{{background:var(--fg);color:var(--bg)}}
        @media(min-width:768px){{
            .floating-nav{{top:1.6rem;left:1.6rem;transform:translateY(-16px)}}
            .floating-nav.active{{transform:translateY(0)}}
        }}
        @media(max-width:767px){{
            .floating-nav{{bottom:1.5rem;left:50%;transform:translateX(-50%) translateY(16px)}}
            .floating-nav.active{{transform:translateX(-50%) translateY(0)}}
        }}

        /* ═══ HERO ═══ */
        .hero-section{{position:relative;width:100%;height:100vh;overflow:hidden;background:#000}}
        .hero-mosaic{{position:absolute;inset:0;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(2,1fr);gap:0;will-change:transform}}
        .hero-mosaic img{{width:100%;height:100%;object-fit:cover;filter:contrast(1.2) saturate(1.1)}}
        .hero-overlay-left{{position:absolute;top:0;left:0;width:50%;height:100%;background:var(--bg);z-index:2;pointer-events:none;transition:background .4s}}
        .hero-overlay-right{{position:absolute;top:0;right:0;width:50%;height:100%;background:transparent;z-index:2;pointer-events:none}}
        .hero-content{{position:relative;z-index:3;width:100%;height:100%;padding:0 8vw;display:flex;flex-direction:column;justify-content:center;align-items:flex-start}}

        /* Logo */
        .plm-master-logo{{position:relative;width:min(50vw,440px);aspect-ratio:1;transform-origin:left center;animation:initialZoom 3s cubic-bezier(.9,0,0,1) forwards;will-change:transform,opacity;margin-bottom:3vh}}
        @keyframes initialZoom{{0%{{transform:scale(1);opacity:0}}8%{{opacity:1}}100%{{transform:scale(.66);opacity:1}}}}
        .logo-part{{position:absolute;top:0;left:0;width:100%;height:100%;background-image:url('{logo_path}');background-size:contain;background-repeat:no-repeat;background-position:left center;will-change:transform,opacity}}
        [data-theme="light"] .logo-part{{filter:none}}
        [data-theme="dark"] .logo-part{{filter:invert(1) brightness(2)}}
        #logo-p{{clip-path:polygon(0% 0%,50% 0%,50% 62%,0% 62%)}}
        #logo-l{{clip-path:polygon(50% 0%,100% 0%,100% 62%,50% 62%)}}
        #logo-m{{clip-path:polygon(0% 62%,100% 62%,100% 100%,0% 100%)}}

        /* Hero Typography — Brutalist hierarchy */
        .hero-text{{max-width:520px;will-change:transform,opacity}}
        .hero-text .hero-name{{
            font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size:clamp(28px,5vw,56px);font-weight:900;
            letter-spacing:-.04em;line-height:.95;
            text-transform:uppercase;color:var(--fg);
            margin-bottom:6px;
        }}
        .hero-text .hero-role{{
            font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size:clamp(11px,1.4vw,16px);font-weight:400;
            letter-spacing:.15em;text-transform:uppercase;
            color:var(--fg2);margin-bottom:24px;
        }}
        .hero-text .hero-body{{
            font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
            font-size:clamp(13px,1.2vw,16px);font-weight:400;
            line-height:1.65;color:var(--fg2);
        }}
        .hero-text .hero-tagline{{
            display:block;margin-top:16px;
            font-size:clamp(10px,1vw,13px);font-weight:900;
            letter-spacing:.2em;text-transform:uppercase;
            color:var(--fg);
        }}

        .scroll-hint{{position:absolute;bottom:3vh;left:8vw;z-index:4;font-size:9px;font-weight:900;letter-spacing:.3em;text-transform:uppercase;color:var(--fg3);animation:fadeBlink 2s ease-in-out infinite}}
        @keyframes fadeBlink{{0%,100%{{opacity:.4}}50%{{opacity:1}}}}

        /* ═══ CONTENT ═══ */
        .content-section{{padding:7vw 96px 20vh 96px}}
        @media(max-width:1100px){{.content-section{{padding:7vw 60px 20vh 60px}}}}
        @media(max-width:767px){{.content-section{{padding:48px 18px 90px 18px}}}}

        .section-label{{font-size:8px;font-weight:900;letter-spacing:.55em;text-transform:uppercase;color:var(--fg3);margin-bottom:48px;padding-bottom:12px;border-bottom:1.5px solid var(--border);transition:color .4s,border-color .4s}}

        /* ═══ GRID ═══ */
        .grid-brutal{{display:grid;grid-template-columns:1fr;gap:40px}}
        @media(min-width:768px){{.grid-brutal{{grid-template-columns:repeat(2,1fr);gap:4vw;align-items:start}}.grid-brutal>:nth-child(even){{margin-top:10vw}}}}
        .card-float{{will-change:transform}}
        .card-size-lg .client-card-img{{aspect-ratio:16/10}}
        .card-size-md .client-card-img{{aspect-ratio:4/3}}
        .card-size-tall .client-card-img{{aspect-ratio:3/4}}
        .client-card-wrap{{border:1.5px solid var(--border);background:var(--card-bg);transition:background .4s,border-color .4s;overflow:clip}}
        .client-card-img-wrap{{position:relative;overflow:hidden}}
        .client-card-img{{width:100%;display:block;object-fit:cover;filter:var(--img-filter);transition:filter .7s,transform .55s}}
        .card-float:hover .client-card-img{{filter:var(--img-hover-filter);transform:scale(1.04)}}
        .card-hover-tagline{{position:absolute;inset:0;padding:18px 22px;font-size:11px;color:var(--fg2);line-height:1.65;opacity:0;transform:translateY(-6px);transition:opacity .4s,transform .4s;pointer-events:none;background:linear-gradient(to bottom,rgba(245,245,245,.88) 0%,transparent 60%)}}
        [data-theme="dark"] .card-hover-tagline{{background:linear-gradient(to bottom,rgba(8,8,8,.88) 0%,transparent 60%)}}
        .card-float:hover .card-hover-tagline{{opacity:1;transform:translateY(0)}}
        @media(max-width:767px){{.card-hover-tagline{{position:static;opacity:1;transform:none;background:none}}}}
        .client-card-footer{{padding:18px 22px;border-top:1.5px solid var(--border);display:flex;align-items:center;justify-content:space-between;transition:border-color .4s,background .25s;background:var(--card-bg)}}
        .client-name{{font-size:clamp(20px,3.2vw,40px);font-weight:900;text-transform:uppercase;letter-spacing:-.02em;line-height:1.1;color:var(--fg);transition:color .25s;word-break:break-word;flex:1;padding-right:10px}}
        .client-count{{font-size:8px;font-weight:900;letter-spacing:.3em;text-transform:uppercase;color:var(--fg3);white-space:nowrap;border:1.5px solid var(--border);padding:3px 7px;transition:color .25s,border-color .25s;flex-shrink:0}}
        .card-float:hover .client-card-footer{{background:var(--fg)}}
        .card-float:hover .client-name,.card-float:hover .client-count{{color:var(--bg);border-color:var(--bg)}}

        .entrance-mask{{opacity:0;transform:translateY(40px);transition:opacity .8s,transform .8s}}
        .entrance-mask.visible{{opacity:1;transform:translateY(0)}}

        /* ═══ GALLERY INNER ═══ */
        .gallery-hero{{margin-bottom:60px}}
        .gallery-title{{font-size:clamp(36px,8vw,120px);font-weight:900;text-transform:uppercase;letter-spacing:-.025em;line-height:.9;color:var(--fg);word-break:break-word}}
        .gallery-desc{{font-size:14px;line-height:1.7;color:var(--fg2);max-width:560px;margin-top:20px}}
        .gallery-meta{{font-size:8px;font-weight:900;letter-spacing:.45em;text-transform:uppercase;color:var(--fg3);margin-top:16px;padding-top:14px;border-top:1.5px solid var(--border);max-width:260px}}

        /* Featured hero video */
        .gallery-featured{{
            display:grid;grid-template-columns:1fr;gap:2px;margin-bottom:48px;
        }}
        @media(min-width:768px){{.gallery-featured{{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}}}}
        .gallery-featured .work-card-wrap{{border-width:2px}}
        .gallery-featured .work-card-img{{aspect-ratio:16/9}}

        /* Category section */
        .category-section{{margin-top:64px}}
        .category-header{{
            display:flex;align-items:baseline;gap:16px;
            margin-bottom:6px;padding-bottom:8px;
            border-bottom:1.5px solid var(--border);
        }}
        .category-name{{font-size:clamp(14px,2vw,22px);font-weight:900;text-transform:uppercase;letter-spacing:-.01em;color:var(--fg)}}
        .category-count{{font-size:8px;font-weight:900;letter-spacing:.3em;color:var(--fg3);text-transform:uppercase}}
        .category-desc{{font-size:12px;line-height:1.6;color:var(--fg3);margin-bottom:20px;max-width:480px}}

        .grid-works{{display:grid;grid-template-columns:1fr;gap:2px}}
        @media(min-width:768px){{.grid-works{{grid-template-columns:1fr 1fr}}}}
        .work-card-wrap{{border:1.5px solid var(--border);overflow:hidden;transition:border-color .4s}}
        .work-card-img{{width:100%;aspect-ratio:16/10;object-fit:cover;display:block;filter:var(--img-filter);transition:filter .7s,transform .5s}}
        .work-card-wrap:hover .work-card-img{{filter:var(--img-hover-filter);transform:scale(1.03)}}
        .work-card-foot{{padding:12px 16px;border-top:1.5px solid var(--border);transition:border-color .4s}}
        .work-title{{font-size:8px;font-weight:900;letter-spacing:.35em;text-transform:uppercase;color:var(--fg)}}

        /* ═══ MODAL ═══ */
        #modal{{display:none;position:fixed;inset:0;background:var(--modal-bg);backdrop-filter:blur(20px);z-index:1000;align-items:center;justify-content:center;opacity:0;transition:opacity .4s}}
        #modal.active{{display:flex;opacity:1}}
        .player-container{{position:relative;width:88vw;height:49.5vw;max-width:1400px;max-height:86vh;resize:both;overflow:hidden;border:1.5px solid var(--border)}}
        @media(min-width:768px){{.player-container{{width:78vw;height:43.9vw;min-width:320px;min-height:480px}}}}
        .player-container iframe{{position:absolute;inset:0;width:100%;height:100%;border:none}}
        .close-modal{{position:absolute;top:1.6rem;right:1.6rem;z-index:1010;font-size:8px;font-weight:900;letter-spacing:.4em;text-transform:uppercase;color:var(--fg);border:1.5px solid var(--border);padding:7px 14px;background:var(--bg);transition:all .2s}}
        .close-modal:hover{{background:var(--fg);color:var(--bg)}}
        .return-btn{{display:inline-block;font-size:8px;font-weight:900;letter-spacing:.4em;text-transform:uppercase;color:var(--fg);border:1.5px solid var(--border);padding:10px 26px;transition:all .2s}}
        .return-btn:hover{{background:var(--fg);color:var(--bg)}}

        .skip-link{{position:fixed;top:-100px;left:1rem;z-index:9999;background:var(--fg);color:var(--bg);padding:8px 16px;font-size:9px;font-weight:900;letter-spacing:.2em;transition:top .2s}}
        .skip-link:focus{{top:1rem}}
    </style>
</head>
<body data-theme="light">
    <svg style="position:absolute;width:0;height:0" aria-hidden="true">
        <filter id="turing-thresh"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"/></filter>
    </svg>
    <a class="skip-link" href="#clients-container">Skip to content</a>
    <div id="cursor-dot" style="display:none"></div>
    <div id="cursor-ring" style="display:none"></div>
    <div class="ca-stripe ca-stripe-left"><canvas id="ca-left"></canvas></div>
    <div class="ca-stripe ca-stripe-right"><canvas id="ca-right"></canvas></div>

    <button class="theme-toggle interactive" onclick="toggleTheme()" aria-label="Toggle light/dark mode">◧</button>
    <button class="contact-trigger interactive" id="contact-btn" onclick="toggleContact()" aria-label="Contact">CONTACT</button>
    <div class="contact-popover" id="contact-popover">
        <div class="contact-popover-header">Get in touch</div>
        <a href="https://wa.me/5547999664274" target="_blank" rel="noopener" class="interactive">
            <span class="contact-icon">💬</span>
            <div><strong>WhatsApp</strong><br><span class="contact-label">Chat now</span></div>
        </a>
        <a href="mailto:conceicao.felipe@gmail.com" class="interactive">
            <span class="contact-icon">✉</span>
            <div><strong>Email</strong><br><span class="contact-label">conceicao.felipe@gmail.com</span></div>
        </a>
    </div>

    <nav class="floating-nav" id="floating-back" role="navigation" aria-label="Back to home">
        <span onclick="goHome()" tabindex="0" role="button" aria-label="Go to home" class="interactive">← BACK</span>
    </nav>

    <div id="view-home" class="view-wrapper active" role="main">
        <section class="hero-section" id="hero-section" aria-label="Hero">
            <div class="hero-mosaic" id="hero-mosaic" aria-hidden="true"><!-- MOSAIC_PLACEHOLDER --></div>
            <div class="hero-overlay-left"></div>
            <div class="hero-overlay-right"></div>
            <div class="hero-content">
                <div class="plm-master-logo" id="hero-logo-wrap" aria-label="Pelimotion PLM logo">
                    <div class="logo-part" id="logo-p" aria-hidden="true"></div>
                    <div class="logo-part" id="logo-l" aria-hidden="true"></div>
                    <div class="logo-part" id="logo-m" aria-hidden="true"></div>
                </div>
                <div class="hero-text" id="hero-release">
                    <div class="hero-name">Felipe<br>Conceição</div>
                    <div class="hero-role">Motion Branding &amp; Creative Direction</div>
                    <p class="hero-body">A creative hub focused on giving body and movement to bold ideas. We blend design, technology, and narrative to build rhythmic identities and high-impact content across diverse industries.</p>
                    <span class="hero-tagline">If your brand moves, we design the system.</span>
                </div>
            </div>
            <div class="scroll-hint" aria-hidden="true">SCROLL ↓</div>
        </section>
        <div class="content-section">
            <p class="section-label entrance-mask" aria-label="Section: Select Collection">SELECT COLLECTION</p>
            <div class="grid-brutal" id="clients-container" role="list">
"""

html_tail = r"""
            </div>
        </div>
    </div>

    <div id="view-gallery" class="view-wrapper" aria-label="Project gallery">
        <div class="content-section" id="gallery-content"></div>
    </div>

    <div id="modal" role="dialog" aria-modal="true" aria-label="Video player">
        <button class="close-modal interactive" onclick="closeModal()" aria-label="Close video">CLOSE ✕</button>
        <div class="player-container">
            <div id="modal-content" style="width:100%;height:100%;position:relative"></div>
        </div>
    </div>

    <script>
    let isMobile = window.innerWidth < 768;

    /* ─── THEME ─── */
    function toggleTheme(){const r=document.documentElement;const n=r.getAttribute('data-theme')==='light'?'dark':'light';r.setAttribute('data-theme',n);localStorage.setItem('plm-theme',n)}
    (function(){const s=localStorage.getItem('plm-theme')||'light';document.documentElement.setAttribute('data-theme',s)})();

    /* ─── CONTACT ─── */
    function toggleContact(){document.getElementById('contact-popover').classList.toggle('open')}
    document.addEventListener('click',e=>{
        const pop=document.getElementById('contact-popover');
        const btn=document.getElementById('contact-btn');
        if(pop.classList.contains('open')&&!pop.contains(e.target)&&e.target!==btn) pop.classList.remove('open');
    });

    /* ─── CURSOR ─── */
    const cDot=document.getElementById('cursor-dot'),cRing=document.getElementById('cursor-ring');let moveTimer=null;
    if(!isMobile){cDot.style.display='block';cRing.style.display='block'}
    window.addEventListener('mousemove',e=>{if(isMobile)return;cDot.style.left=e.clientX+'px';cDot.style.top=e.clientY+'px';cRing.style.left=e.clientX+'px';cRing.style.top=e.clientY+'px';document.body.classList.add('is-moving');clearTimeout(moveTimer);moveTimer=setTimeout(()=>document.body.classList.remove('is-moving'),120)});
    document.body.addEventListener('mouseover',e=>{if(e.target.closest('.interactive,a,button,[role="button"]'))document.body.classList.add('is-hovering')});
    document.body.addEventListener('mouseout',e=>{if(e.target.closest('.interactive,a,button,[role="button"]'))document.body.classList.remove('is-hovering')});

    /* ═══ REACTION-DIFFUSION ═══ */
    const CELL=4;let caGrid=[],caW=0,caH=0,currentScrollY=0;
    function generateNoiseGrid(){caW=Math.ceil(24/CELL);caH=Math.ceil(window.innerHeight/CELL)+12;caGrid=[];for(let r=0;r<caH;r++){const row=[];for(let c=0;c<caW;c++)row.push(Math.random()>.45?1:0);caGrid.push(row)}}
    function evolveNoise(){for(let i=0;i<caW*2;i++){const r=Math.floor(Math.random()*caH),c=Math.floor(Math.random()*caW);if(caGrid[r])caGrid[r][c]=caGrid[r][c]===1?0:1}}
    function drawRD(id){const cv=document.getElementById(id);if(!cv)return;const W=24,H=window.innerHeight;if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}const ctx=cv.getContext('2d');ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--pattern-bg').trim();ctx.fillRect(0,0,W,H);ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--pattern-fg').trim();const sr=Math.floor(currentScrollY/CELL)%Math.max(1,caH);for(let r=0;r<caH;r++){const s=(r+sr)%caH;if(!caGrid[s])continue;for(let c=0;c<caW;c++){if(caGrid[s][c])ctx.fillRect(c*CELL,r*CELL,CELL,CELL)}}}
    function rafP(){drawRD('ca-left');drawRD('ca-right');requestAnimationFrame(rafP)}
    generateNoiseGrid();rafP();setInterval(evolveNoise,150);

    /* ═══ SCROLL PARALLAX ═══ */
    const viewHome=document.getElementById('view-home'),viewGallery=document.getElementById('view-gallery');
    const maskObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');maskObs.unobserve(e.target)}})},{threshold:.08});

    function applyParallax(el){
        const sY=el.scrollTop;currentScrollY=sY;
        if(el===viewHome){
            const r=Math.min(sY/window.innerHeight,1);
            const lp=document.getElementById('logo-p'),ll=document.getElementById('logo-l'),lm=document.getElementById('logo-m');
            const mo=document.getElementById('hero-mosaic'),re=document.getElementById('hero-release');
            if(lp&&ll&&lm){const lift=r*150,sp=r*10,o=Math.max(0,1-r*1.5);lp.style.transform=`translate3d(${-sp}%,${-lift}px,0)`;lp.style.opacity=o;ll.style.transform=`translate3d(${sp}%,${-lift}px,0)`;ll.style.opacity=o;lm.style.transform=`translate3d(0,${-lift*1.2}px,0)`;lm.style.opacity=o}
            if(mo)mo.style.transform=`translate3d(0,${sY*.22}px,0)`;
            if(re){re.style.transform=`translate3d(0,${-sY*.65}px,0)`;re.style.opacity=`${Math.max(0,1-r*2.5)}`}
        }
        el.querySelectorAll('.card-float').forEach(c=>{const sp=parseFloat(c.getAttribute('data-speed')||'0');const rect=c.getBoundingClientRect();const d=(rect.top+rect.height/2-window.innerHeight/2)/window.innerHeight;c.style.transform=`translate3d(0,${d*sp*80}px,0)`});
        el.querySelectorAll('.entrance-mask:not(.visible)').forEach(m=>{if(m.getBoundingClientRect().top<window.innerHeight*.9)m.classList.add('visible')});
    }
    viewHome.addEventListener('scroll',()=>applyParallax(viewHome),{passive:true});
    viewGallery.addEventListener('scroll',()=>applyParallax(viewGallery),{passive:true});
    viewHome.querySelectorAll('.entrance-mask').forEach(m=>maskObs.observe(m));

    /* ─── DATA ─── */
    const clientsData = {CLIENTS_JSON_DATA};
    const clientDescriptions = {CLIENT_DESC_JSON};
    const categoryDescriptions = {CATEGORY_DESC_JSON};
    const floatingBack=document.getElementById('floating-back');
    const galleryContent=document.getElementById('gallery-content');

    function openClient(name){
        viewHome.classList.remove('active');floatingBack.classList.add('active');
        const client=clientsData[name];if(!client)return;
        
        let html='<div class="gallery-hero entrance-mask"><h1 class="gallery-title">'+name+'</h1>';
        if(clientDescriptions[name])html+='<p class="gallery-desc">'+clientDescriptions[name]+'</p>';
        html+='<p class="gallery-meta"><span>'+String(client.total).padStart(2,'0')+'</span> EXECUTIONS</p></div>';
        
        // Featured / root videos
        if(client.root&&client.root.length>0){
            html+='<div class="gallery-featured entrance-mask">';
            client.root.forEach(w=>{
                const th=w.drive_id?`https://drive.google.com/thumbnail?id=${w.drive_id}&sz=w1200`:'';
                html+=`<div class="interactive" onclick="openModal('${w.drive_id}')" tabindex="0" onkeydown="if(event.key==='Enter')openModal('${w.drive_id}')">
                    <div class="work-card-wrap"><img class="work-card-img" src="${th}" alt="${w.title}" loading="lazy"><div class="work-card-foot"><div class="work-title">${w.title}</div></div></div></div>`;
            });
            html+='</div>';
        }
        
        // Categories
        if(client.categories){
            Object.keys(client.categories).sort().forEach(cat=>{
                const works=client.categories[cat];
                html+='<div class="category-section entrance-mask">';
                html+='<div class="category-header"><span class="category-name">'+cat+'</span><span class="category-count">'+String(works.length).padStart(2,'0')+' pieces</span></div>';
                if(categoryDescriptions[cat])html+='<p class="category-desc">'+categoryDescriptions[cat]+'</p>';
                html+='<div class="grid-works">';
                works.forEach(w=>{
                    const th=w.drive_id?`https://drive.google.com/thumbnail?id=${w.drive_id}&sz=w1200`:'';
                    html+=`<div class="interactive" onclick="openModal('${w.drive_id}')" tabindex="0" onkeydown="if(event.key==='Enter')openModal('${w.drive_id}')">
                        <div class="work-card-wrap"><img class="work-card-img" src="${th}" alt="${w.title}" loading="lazy"><div class="work-card-foot"><div class="work-title">${w.title}</div></div></div></div>`;
                });
                html+='</div></div>';
            });
        }
        
        html+='<div style="margin-top:80px;text-align:center" class="entrance-mask"><button class="return-btn interactive" onclick="goHome()">RETURN</button></div>';
        galleryContent.innerHTML=html;
        
        setTimeout(()=>{
            if(isMobile){viewHome.style.display='none';viewGallery.style.display='block';window.scrollTo(0,0)}
            viewGallery.classList.add('active');viewGallery.scrollTop=0;
            viewGallery.querySelectorAll('.entrance-mask').forEach(m=>maskObs.observe(m));
        },460);
    }

    function goHome(){
        viewGallery.classList.remove('active');floatingBack.classList.remove('active');
        setTimeout(()=>{
            if(isMobile){viewGallery.style.display='none';viewHome.style.display='block';window.scrollTo(0,0)}
            viewHome.classList.add('active');
        },460);
    }

    const modal=document.getElementById('modal'),modalContent=document.getElementById('modal-content');
    function openModal(id){
        if(!id||id==='None')return;
        modalContent.innerHTML=`<iframe src="https://drive.google.com/file/d/${id}/preview" allow="autoplay" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:none"></iframe>`;
        modal.style.display='flex';setTimeout(()=>{modal.classList.add('active')},10);
        document.querySelector('.close-modal').focus();
    }
    function closeModal(){
        modal.classList.remove('active');
        setTimeout(()=>{modal.style.display='none';modalContent.innerHTML=''},420);
    }
    </script>
</body>
</html>
"""

def get_drive_id(path):
    try:
        result = subprocess.run(['xattr', '-p', 'com.google.drivefs.item-id#S', path], capture_output=True, text=True)
        if result.returncode == 0: 
            return result.stdout.strip()
    except Exception: 
        pass
    return None

def clean_title(filename):
    name = filename.rsplit('.', 1)[0]
    name = name.replace('_', ' ')
    # Collapse multiple spaces
    while '  ' in name:
        name = name.replace('  ', ' ')
    return name.strip().upper()

def generate_html():
    output_path = os.path.join(workspace_dir, "index.html")
    if os.path.exists(output_path):
        ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        shutil.copy2(output_path, os.path.join(workspace_dir, f"index_backup_{ts}.html"))

    if not os.path.exists(media_dir):
        print(f"ERROR: Media directory '{media_dir}' does not exist.")
        return

    # Build structured client data: { "CLIENT": { "root": [...], "categories": { "Cat": [...] }, "total": N } }
    clients = {}
    
    for root_dir, dirs, files in os.walk(media_dir):
        dirs.sort()
        for f in sorted(files):
            if f.lower().endswith(('.mp4', '.mov')) and not f.startswith('.'):
                path = os.path.join(root_dir, f)
                rel_path = os.path.relpath(path, media_dir)
                parts = rel_path.split(os.sep)
                drive_id = get_drive_id(path)
                entry = {'title': clean_title(f), 'drive_id': drive_id}
                
                if len(parts) == 1:
                    # Root-level file like "Pelimotion - Reel 2021.mp4"
                    clients.setdefault("VARIADOS", {"root": [], "categories": {}, "total": 0})
                    clients["VARIADOS"]["root"].append(entry)
                    clients["VARIADOS"]["total"] += 1
                elif len(parts) == 2:
                    # Direct client file: Client/video.mp4 → root (featured)
                    client_name = parts[0].upper()
                    clients.setdefault(client_name, {"root": [], "categories": {}, "total": 0})
                    clients[client_name]["root"].append(entry)
                    clients[client_name]["total"] += 1
                else:
                    # Nested: Client/Category/.../video.mp4
                    client_name = parts[0].upper()
                    # Category is the second-level folder name
                    category = parts[1]
                    clients.setdefault(client_name, {"root": [], "categories": {}, "total": 0})
                    clients[client_name]["categories"].setdefault(category, []).append(entry)
                    clients[client_name]["total"] += 1

    sorted_client_names = sorted(clients.keys())

    # Background mosaic from specific clients
    target_bg = ["FUNKY ROOM", "PLAYA", "LSLA", "SUZANO"]
    hero_ids = []
    for tc in target_bg:
        if tc in clients:
            for w in clients[tc]["root"]:
                if w['drive_id'] and w['drive_id'] not in hero_ids:
                    hero_ids.append(w['drive_id'])
                if len(hero_ids) >= 8: break
            if len(hero_ids) >= 8: break
            for cat_works in clients[tc]["categories"].values():
                for w in cat_works:
                    if w['drive_id'] and w['drive_id'] not in hero_ids:
                        hero_ids.append(w['drive_id'])
                    if len(hero_ids) >= 8: break
                if len(hero_ids) >= 8: break
        if len(hero_ids) >= 8: break
    # Fallback
    if len(hero_ids) < 8:
        for c in sorted_client_names:
            if c not in target_bg:
                for w in clients[c]["root"]:
                    if w['drive_id'] and w['drive_id'] not in hero_ids:
                        hero_ids.append(w['drive_id'])
                    if len(hero_ids) >= 8: break
            if len(hero_ids) >= 8: break

    mosaic_html = ''.join(f'<img src="https://drive.google.com/thumbnail?id={did}&sz=w600" alt="" loading="eager">\n' for did in hero_ids) if hero_ids else ''.join('<div style="width:100%;height:100%;background:#222"></div>' for _ in range(8))
    html = html_template.replace('<!-- MOSAIC_PLACEHOLDER -->', mosaic_html)

    size_cycle = ['card-size-lg', 'card-size-md', 'card-size-tall', 'card-size-lg']
    speed_cycle = [-0.5, 0.4, -0.3, 0.45, -0.4, 0.35]

    clients_html = ""
    for idx, cname in enumerate(sorted_client_names):
        cdata = clients[cname]
        # Cover: first root video, or first from any category
        cover_id = next((w['drive_id'] for w in cdata['root'] if w['drive_id']), None)
        if not cover_id:
            for cat_works in cdata['categories'].values():
                cover_id = next((w['drive_id'] for w in cat_works if w['drive_id']), None)
                if cover_id: break
        
        thumb = f"https://drive.google.com/thumbnail?id={cover_id}&sz=w1200" if cover_id else ""
        count = cdata['total']
        cjs = cname.replace("'", "\\'")
        desc = CLIENT_DESC.get(cname, "")
        
        img_tag = f'<img class="client-card-img" src="{thumb}" alt="{cname}" loading="lazy">' if thumb else '<div class="client-card-img" style="background:#444;width:100%;aspect-ratio:16/9"></div>'

        clients_html += f"""
                <div role="listitem" class="card-float {size_cycle[idx % len(size_cycle)]} interactive entrance-mask" data-speed="{speed_cycle[idx % len(speed_cycle)]}"
                     onclick="openClient('{cjs}')" tabindex="0" onkeydown="if(event.key==='Enter')openClient('{cjs}')">
                    <div class="client-card-wrap">
                        <div class="client-card-img-wrap">
                            {img_tag}
                            <div class="card-hover-tagline" aria-hidden="true">{desc[:120] + '…' if len(desc) > 120 else desc}</div>
                        </div>
                        <div class="client-card-footer">
                            <span class="client-name">{cname}</span>
                            <span class="client-count">{str(count).zfill(2)} WORKS</span>
                        </div>
                    </div>
                </div>"""

    if not clients_html:
        clients_html = "<p style='padding:2vw'>No media found.</p>"

    html += clients_html + html_tail
    html = html.replace("{CLIENTS_JSON_DATA}", json.dumps(clients))
    html = html.replace("{CLIENT_DESC_JSON}", json.dumps(CLIENT_DESC))
    html = html.replace("{CATEGORY_DESC_JSON}", json.dumps(CATEGORY_DESC))

    with open(output_path, "w", encoding="utf-8") as f: 
        f.write(html)
    print(f"Site generated → {output_path}")

if __name__ == "__main__": 
    generate_html()
