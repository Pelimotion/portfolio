const fs = require('fs');
const path = require('path');

const contentPath = path.resolve(__dirname, '../site-content.json');
const raw = fs.readFileSync(contentPath, 'utf8');
const data = JSON.parse(raw);

// 1. FUNKY ROOM
if (data.clients['FUNKY ROOM']) {
  const fr = data.clients['FUNKY ROOM'];
  const titles = [
    'MAKING OF // CENA 02',
    'LOGO REVEAL // 3D EMBLEM',
    'PROCESS & BTS // BEHIND THE SCENES',
    'TEASER 01 // 3D LOGO IDENT',
    'CAMPAIGN TEASER 01',
    'CAMPAIGN TEASER 02 // SLOGAN',
    'LINEUP REVEAL 02',
    'CONCEITO & SLOGAN 03',
    'MANIFESTO // IT ISN\'T JUST A PARTY',
    'TYPOGRAPHIC SLOGAN MOTION',
    '1ST ROOM // STAGE VISUALS 01',
    '1ST ROOM // STAGE VISUALS 02',
    'AFTER PARTY // OFFICIAL VISUALS',
    'STAGE DROP FX 01',
    'STAGE DROP FX 02',
    'DRIP & TICKETS // PROMO MOTION',
    'HEADLINE // ÚLTIMOS INGRESSOS',
    'TICKETING // 80% DO LOTE',
    'OOH // URBAN LED SCREEN',
    'SOCIAL MOTION // 20.09 TEASER',
    'SOCIAL MOTION // 19.09 LINEUP',
    'SOCIAL MOTION // 20.09 CALL',
    'EDITION 03 // FESTIVAL OVERVIEW',
    'EDITION 04 // HEADLINE TEASER',
    'EDITION 04 // MC CAVERINHA LIVE',
    'BLUE EDITION // STAGE SCREEN 01',
    '3D VINYL TURNTABLE // STAGE VISUAL',
    'EDITION 05 // FESTIVAL RECAP',
    'SOCIAL REEL 01 // EDITION 05',
    'SOCIAL REEL 02 // EDITION 05',
    'SOCIAL REEL 03 // STORIES',
    'SOCIAL REEL 04 // COUNTDOWN',
    'MEDIA KIT // FNKD UP SPECIAL EDITION',
    'FUNKY WEEKEND // PROMO REEL'
  ];
  fr.media.root.forEach((m, idx) => {
    if (titles[idx]) {
      m.title = titles[idx];
      m.title_pt = titles[idx];
    }
  });
  fr.media.categories = {
    "01 // FNKD UP (SPECIAL EDITION)": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 32],
    "02 // STAGE & EDIÇÕES (01 — 05)": [10, 11, 12, 13, 14, 15, 16, 17, 18, 22, 23, 24, 25, 26, 27],
    "03 // SOCIAL MEDIA & TEASERS": [19, 20, 21, 28, 29, 30, 31, 33]
  };
}

// 2. SUZANO
if (data.clients['SUZANO']) {
  const su = data.clients['SUZANO'];
  const titles = [
    'CENTRO DE INOVAÇÃO // TOUR 3D',
    'LETRAS QUE TRANSFORMAM // MASTER FILM',
    'PRÊMIO SUZANO 2022 // ABERTURA',
    'ROCK IN RIO // ABERTURA INSTITUCIONAL',
    'TEMPO DE CASA // KINETIC TYPOGRAPHY'
  ];
  su.media.root.forEach((m, idx) => {
    if (titles[idx]) {
      m.title = titles[idx];
      m.title_pt = titles[idx];
    }
  });
  su.media.categories = {
    "01 // BRANDING & GRANDES EVENTOS": [1, 2, 3],
    "02 // INSTITUCIONAL & INOVAÇÃO": [0, 4]
  };
}

// 3. BC MAPPING FESTIVAL
if (data.clients['BC MAPPING FESTIVAL']) {
  const bc = data.clients['BC MAPPING FESTIVAL'];
  const titles = [
    'COLOR SHADER // GREEN & BLUE',
    'COLOR SYSTEM // VARIATION 02',
    'COLOR SYSTEM // VARIATION 01',
    'ORGANIC WAVE PATTERNS',
    'CHROMATIC TRANSITION 02',
    'CHROMATIC TRANSITION 01',
    'FAÇADE MAPPING // ARCHITECTURAL BOARD',
    'LINEUP & SCHEDULE INFOS',
    'LED STAGE PROJECTION 01',
    'LED STAGE PROJECTION 02',
    'ARCHITECTURAL MESH // MARINE TEMPLATE'
  ];
  bc.media.root.forEach((m, idx) => {
    if (titles[idx]) {
      m.title = titles[idx];
      m.title_pt = titles[idx];
    }
  });
  bc.media.categories = {
    "01 // MEDIA KIT & GENERATIVE SHADERS": [0, 1, 2, 3, 4, 5],
    "02 // PROJEÇÃO MAPEADA & PALCO": [6, 7, 8, 9, 10]
  };
}

// 4. BELEZA NA WEB
if (data.clients['BELEZA NA WEB']) {
  const bn = data.clients['BELEZA NA WEB'];
  const titles = [
    'BELEZA EXPERIENCE // VINHETA DE ABERTURA',
    'BELEZA EXPERIENCE // REEL 01',
    'BELEZA EXPERIENCE // REEL 02 HORIZONTAL',
    'BELEZA EXPERIENCE // REEL 03',
    'BELEZA EXPERIENCE // HIGHLIGHTS',
    'BELEZA EXPERIENCE // SAVE THE DATE'
  ];
  bn.media.root.forEach((m, idx) => {
    if (titles[idx]) {
      m.title = titles[idx];
      m.title_pt = titles[idx];
    }
  });
  bn.media.categories = {
    "01 // IDENTIDADE & ABERTURA": [0, 5],
    "02 // SOCIAL CAMPAIGN & REELS": [1, 2, 3, 4]
  };
}

// 5. FURB
if (data.clients['FURB']) {
  const furb = data.clients['FURB'];
  const titles = [
    'VESTIBULAR // CARTÃO 10S TV',
    'CAMPANHA VERTICAL // ACESSIBILIDADE LIBRAS',
    'FILME INSTITUCIONAL // PONTO DE PARTIDA',
    'ETEVI // OUTDOOR DIGITAL 10S',
    'ETEVI // VERTICAL TOTEM 15S',
    'ETEVI // PAINEL HORIZONTAL 15S'
  ];
  furb.media.root.forEach((m, idx) => {
    if (titles[idx]) {
      m.title = titles[idx];
      m.title_pt = titles[idx];
    }
  });
  furb.media.categories = {
    "01 // BROADCAST & VESTIBULAR (FURB)": [0, 1, 2],
    "02 // OOH & PAINÉIS DIGITAIS (ETEVI)": [3, 4, 5]
  };
}

// 6. ISLA & PLAYA
if (data.clients['ISLA & PLAYA']) {
  const ip = data.clients['ISLA & PLAYA'];
  const titles = [
    'LÚCIO LIVE // TEASER',
    'GEN AI DRINKS // CONCEPT 01',
    'GEN AI DRINKS // CONCEPT 02',
    'GEN AI DRINKS // CONCEPT 03',
    'GEN AI GASTRONOMY // CONCEPT 04',
    'ISLA // OFFICIAL AFTERMOVIE',
    'BRAVA LUA // CONCEPT MANIFESTO',
    'CONCEPT FILM // NÃO VIRE O ROSTO',
    'MARÉ // MOTION POST',
    'CHELINA MANUHUTU // HEADLINE',
    'BEACH TENNIS // ARENA PLAYA',
    'CONCEPT // ACERTEI NA PLAYA',
    'BOIAS AO MAR // CINEMATOGRAPHY',
    'CARNAPLAYA // CONCEITO',
    'RESPIRE // VISUAL POETRY',
    'CAIPIRINHA // SUMMER REEL',
    'SURF & OCEAN // VIVA INTENSAMENTE',
    'URBAN OOH // JANEIRO AGENDA',
    'CARNAPLAYA // ABADÁS PROMO',
    'CARNAPLAYA // START TEASER'
  ];
  ip.media.root.forEach((m, idx) => {
    if (titles[idx]) {
      m.title = titles[idx];
      m.title_pt = titles[idx];
    }
  });
  ip.media.categories = {
    "01 // PLAYA (BEACH CLUB & MANIFESTO)": [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    "02 // ISLA (SUNSET, DRINKS & IA)": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  };
}

// 7. UNIBRASIL
if (data.clients['UNIBRASIL']) {
  const ub = data.clients['UNIBRASIL'];
  ub.media.categories = {
    "01 // FILMES & MASTER": [0, 1],
    "02 // DOOH & CIRCUITO EXTERIOR": [2, 3]
  };
}

// 8. VIDEOANIMATE
if (data.clients['VIDEOANIMATE']) {
  const va = data.clients['VIDEOANIMATE'];
  const titles = [
    'AGRICOLA LUSIA // PROMO CTA',
    'ASTE BUSINESS // REAL ESTATE 01',
    'ASTE BUSINESS // REAL ESTATE 02',
    'E-KILLER // APP DEMO CTA',
    'MADOUT // MOTION SPOTLIGHT'
  ];
  va.media.root.forEach((m, idx) => {
    if (titles[idx]) {
      m.title = titles[idx];
      m.title_pt = titles[idx];
    }
  });
}

// 9. LOGO REVEALS
if (data.clients['LOGO REVEALS']) {
  const lr = data.clients['LOGO REVEALS'];
  const titles = [
    'STUDIO 03 // 16:9 REVEAL',
    'DELIMA REBELO // ARCHITECTURE ID',
    'FUEL // KINETIC EMBLEM',
    'MESQUITA // MINIMAL IDENT',
    'ZAH // 9:16 VERTICAL REVEAL'
  ];
  lr.media.root.forEach((m, idx) => {
    if (titles[idx]) {
      m.title = titles[idx];
      m.title_pt = titles[idx];
    }
  });
}

// 10. Single/Few Items Projects Cleanups
const simpleUpdates = {
  'COLCCI': ['AMC TÊXTIL // FASHION FILM'],
  'COBLUE': ['COBLUE // INSTITUCIONAL & OKR'],
  'EQI': ['EQI INVESTIMENTOS // CIRQUE DU SOLEIL'],
  'BEIRAMAR SHOPPING': ['BEIRAMAR SHOPPING // DIA DOS PAIS TVC'],
  'FIREDOGS': ['FIREDOGS // ROCK AT THE BAR'],
  'FAST SHIPPING': ['FAST SHIPPING // LIVING REBRANDING'],
  'LUPA': ['STAGE // EPISÓDIO 02', 'STAGE // EPISÓDIO 03', 'STAGE // EPISÓDIO 07'],
  'PREFEITURA TIMBÓ': ['CAMPANHA IPTU // 16:9 TV', 'CAMPANHA IPTU // 9:16 VERTICAL'],
  'RIO CARNAVAL': ['RIO CARNAVAL // APP RELEASE', 'RIO CARNAVAL // 3D VISUALIZER'],
  'SULITA': ['SULITA // RENATA FAN CAMPANHA TV'],
  'UNIVALI': ['JUES // ABERTURA WEB & EVENTOS'],
  'WOLFGARTEN': ['WOLFGARTEN // ASSINATURA VISUAL', 'WOLFGARTEN // BRAND TEASER']
};

Object.entries(simpleUpdates).forEach(([cName, list]) => {
  if (data.clients[cName] && data.clients[cName].media?.root) {
    data.clients[cName].media.root.forEach((m, i) => {
      if (list[i]) {
        m.title = list[i];
        m.title_pt = list[i];
      }
    });
  }
});

fs.writeFileSync(contentPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully updated site-content.json with curated names and categories!');
