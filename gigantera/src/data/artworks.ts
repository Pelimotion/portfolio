import { Artwork, AudioTrackInfo, SectorInfo } from '../types/art';

export const SECTORS_CATALOG: SectorInfo[] = [
  {
    id: 'entrance-audio',
    sectorCode: '00',
    title: 'ACOUSTIC POV // ESTAÇÃO DE CD',
    medium: 'sound',
    zRange: 'Z: +24m → +18m',
    description: 'Estação física de áudio logo na entrada. Pegue o estojo acrílico de CD e folheie a contracapa com 17 faixas autorais.',
    accentColor: '#FF6B4A'
  },
  {
    id: 'still',
    sectorCode: '01',
    title: 'STILL // MATRIZ & ESCULTURA',
    medium: 'still',
    zRange: 'Z: +16m → -14m',
    description: 'Vitrines arquiteturais de vidro flutuante contendo impressos suspensos em papel mate giclée de alta densidade.',
    accentColor: '#E4C379'
  },
  {
    id: 'video',
    sectorCode: '02',
    title: 'VIDEO // CINÉTICA & MOTION',
    medium: 'video',
    zRange: 'Z: -18m → -50m',
    description: 'Vitrines cinéticas onde os impressos ganham vida em loops animados contínuos em tempo real.',
    accentColor: '#63E2B7'
  }
];

export const AUTHORIAL_TRACKS_CATALOG: AudioTrackInfo[] = [
  {
    id: 'track-01-automar',
    trackNumber: '01',
    title: 'Automar',
    series: 'Automotaço / Pelimotion',
    genre: 'DEEP DUB TECHNO',
    bpm: 124,
    duration: '04:15',
    previewSrc: '/gigantera/works/audio/previews/preview-01-automar.mp3',
    fullSrc: '/gigantera/works/audio/full/full-01-automar.mp3',
    coverImage: '/gigantera/works/espinhaco-registro-abissal.jpg',
    year: 2026,
    description: 'Linha de baixo subaquática profunda e texturas analógicas densas com compressão harmônica de fita.'
  },
  {
    id: 'track-02-danse',
    trackNumber: '02',
    title: 'Danse (v2)',
    series: 'Gigantera Acoustic Loops',
    genre: 'MODULAR TECHNO',
    bpm: 128,
    duration: '05:32',
    previewSrc: '/gigantera/works/audio/previews/preview-02-danse.mp3',
    fullSrc: '/gigantera/works/audio/full/full-02-danse.mp3',
    coverImage: '/gigantera/works/espinhaco-cinetica-prata.jpg',
    year: 2026,
    description: 'Percussão mecânica agressiva e osciladores FM modulados simulando cinemática de biomotores.'
  },
  {
    id: 'track-03-apenas',
    trackNumber: '03',
    title: 'Apenas (v2)',
    series: 'Gigantera Acoustic Loops',
    genre: 'AMBIENT MODULAR',
    bpm: 118,
    duration: '01:52',
    previewSrc: '/gigantera/works/audio/previews/preview-03-apenas.mp3',
    fullSrc: '/gigantera/works/audio/full/full-03-apenas.mp3',
    coverImage: '/gigantera/works/zimbro-estudo-espectral.jpg',
    year: 2026,
    description: 'Harmonias aveludadas flutuantes no campo estéreo com ecos analógicos de fita.'
  },
  {
    id: 'track-04-giant-mullets',
    trackNumber: '04',
    title: 'Giant Mullets (v2)',
    series: 'Giant Mullets Project',
    genre: 'SUB-BASS EXPERIMENTAL',
    bpm: 122,
    duration: '04:48',
    previewSrc: '/gigantera/works/audio/previews/preview-04-giant-mullets.mp3',
    fullSrc: '/gigantera/works/audio/full/full-04-giant-mullets.mp3',
    coverImage: '/gigantera/works/sedimento-litificacao-final.jpg',
    year: 2026,
    description: 'Síntese granular de sub-graves pesados que modulam a intensidade das luzes da galeria.'
  },
  {
    id: 'track-05-notalgia',
    trackNumber: '05',
    title: 'Notalgia (v2)',
    series: 'Notalgia Audio Research',
    genre: 'MINIMAL DOWNTEMPO',
    bpm: 115,
    duration: '03:40',
    previewSrc: '/gigantera/works/audio/previews/preview-05-notalgia.mp3',
    fullSrc: '/gigantera/works/audio/full/full-05-notalgia.mp3',
    coverImage: '/gigantera/works/notalgia-monolito-costeiro.jpg',
    year: 2026,
    description: 'Paisagem acústica melancólica inspirada na transição entre arquitetura bruta e horizonte costeiro.'
  },
  {
    id: 'track-06-un-disney',
    trackNumber: '06',
    title: 'Un-disney (v4)',
    series: 'Un-disney Explorations',
    genre: 'DARK ELECTRONIC',
    bpm: 126,
    duration: '03:15',
    previewSrc: '/gigantera/works/audio/previews/preview-06-un-disney.mp3',
    fullSrc: '/gigantera/works/audio/full/full-06-un-disney.mp3',
    coverImage: '/gigantera/works/espinhaco-vitrine-aquario.jpg',
    year: 2026,
    description: 'Rupturas rítmicas e sintetizadores ásperos desconstruindo melodias tradicionais.'
  },
  {
    id: 'track-07-sintetic-olive',
    trackNumber: '07',
    title: 'Sintetic Olive (v2)',
    series: 'Palestine Sessions',
    genre: 'JAZZY DEEP HOUSE',
    bpm: 120,
    duration: '03:25',
    previewSrc: '/gigantera/works/audio/previews/preview-07-sintetic-olive.mp3',
    fullSrc: '/gigantera/works/audio/full/full-07-sintetic-olive.mp3',
    coverImage: '/gigantera/works/zimbro-rastreamento-vetorial.jpg',
    year: 2026,
    description: 'Teclados Rhodes elétricos entrelaçados com batidas minimalistas e sub-graves quentes.'
  },
  {
    id: 'track-08-fisherman',
    trackNumber: '08',
    title: 'Fisherman (v2)',
    series: 'Fisherman Project',
    genre: 'BRAZILIAN SLAP MINIMAL',
    bpm: 125,
    duration: '04:10',
    previewSrc: '/gigantera/works/audio/previews/preview-08-fisherman.mp3',
    fullSrc: '/gigantera/works/audio/full/full-08-fisherman.mp3',
    coverImage: '/gigantera/works/espinhaco-relevo-neotribal.jpg',
    year: 2026,
    description: 'Vocais processados e slap bass orgânico com transientes nítidos de caixa.'
  },
  {
    id: 'track-09-talking-peoplr',
    trackNumber: '09',
    title: 'Talking Peoplr (v2)',
    series: 'Talking Peoplr Sessions',
    genre: 'VOCAL MICROHOUSE',
    bpm: 122,
    duration: '01:45',
    previewSrc: '/gigantera/works/audio/previews/preview-09-talking-peoplr.mp3',
    fullSrc: '/gigantera/works/audio/full/full-09-talking-peoplr.mp3',
    coverImage: '/gigantera/works/espinhaco-descida-crepuscular.jpg',
    year: 2026,
    description: 'Fragmentos de fala humana fatiados em micro-loops e síncopes percussivas.'
  },
  {
    id: 'track-10-feed-your-soul',
    trackNumber: '10',
    title: 'Feed Your Soul',
    series: 'Soul Vision',
    genre: 'ORGANIC DEEP GROOVE',
    bpm: 120,
    duration: '03:52',
    previewSrc: '/gigantera/works/audio/previews/preview-10-feed-your-soul.mp3',
    fullSrc: '/gigantera/works/audio/full/full-10-feed-your-soul.mp3',
    coverImage: '/gigantera/works/espinhaco-cinetica-prata.jpg',
    year: 2025,
    description: 'Batida aveludada com percussões acústicas gravadas e modulação sutil de filtro.'
  },
  {
    id: 'track-11-assuviu',
    trackNumber: '11',
    title: 'Assuviu',
    series: 'Assuviu Research',
    genre: 'EXPERIMENTAL TECH',
    bpm: 124,
    duration: '02:40',
    previewSrc: '/gigantera/works/audio/previews/preview-11-assuviu.mp3',
    fullSrc: '/gigantera/works/audio/full/full-11-assuviu.mp3',
    coverImage: '/gigantera/works/zimbro-estudo-espectral.jpg',
    year: 2025,
    description: 'Timbres agudos modulados por ressonância senoidal sobrepondo-se a graves secos.'
  },
  {
    id: 'track-12-bicho-malandro',
    trackNumber: '12',
    title: 'Bicho Malandro (v2)',
    series: 'Pelichakk Productions',
    genre: 'NEO-SAMBA BASS',
    bpm: 126,
    duration: '04:30',
    previewSrc: '/gigantera/works/audio/previews/preview-12-bicho-malandro.mp3',
    fullSrc: '/gigantera/works/audio/full/full-12-bicho-malandro.mp3',
    coverImage: '/gigantera/works/sedimento-litificacao-final.jpg',
    year: 2025,
    description: 'Fusão de rítmica brasileira tradicional com sintetizadores de alta potência.'
  },
  {
    id: 'track-13-calmaria',
    trackNumber: '13',
    title: 'Calmaria',
    series: 'Calmaria Tape Loops',
    genre: 'CHILLOUT ELECTRONIC',
    bpm: 110,
    duration: '03:10',
    previewSrc: '/gigantera/works/audio/previews/preview-13-calmaria.mp3',
    fullSrc: '/gigantera/works/audio/full/full-13-calmaria.mp3',
    coverImage: '/gigantera/works/espinhaco-vitrine-aquario.jpg',
    year: 2025,
    description: 'Repouso dinâmico com ambiência fluida, ideal para contemplação prolongada.'
  },
  {
    id: 'track-14-todas-linguas',
    trackNumber: '14',
    title: 'Todas Línguas (v2)',
    series: 'Languages Project',
    genre: 'POLYRHYTHMIC TECHNO',
    bpm: 127,
    duration: '04:20',
    previewSrc: '/gigantera/works/audio/previews/preview-14-todas-linguas.mp3',
    fullSrc: '/gigantera/works/audio/full/full-14-todas-linguas.mp3',
    coverImage: '/gigantera/works/notalgia-monolito-costeiro.jpg',
    year: 2025,
    description: 'Camadas de percussões de diferentes culturas sintetizadas em pulsação unificada.'
  },
  {
    id: 'track-15-tranca',
    trackNumber: '15',
    title: 'Trança (v3)',
    series: 'Trança Modular',
    genre: 'MICRO MODULAR LOOP',
    bpm: 122,
    duration: '01:10',
    previewSrc: '/gigantera/works/audio/previews/preview-15-tranca.mp3',
    fullSrc: '/gigantera/works/audio/full/full-15-tranca.mp3',
    coverImage: '/gigantera/works/espinhaco-relevo-neotribal.jpg',
    year: 2025,
    description: 'Loop percussivo cruzado com envelopes estritos de decaimento.'
  },
  {
    id: 'track-16-techno-1',
    trackNumber: '16',
    title: 'Techno 1',
    series: 'Cumbia Tech Studies',
    genre: 'HYPNOTIC CUMBIA TECHNO',
    bpm: 126,
    duration: '01:50',
    previewSrc: '/gigantera/works/audio/previews/preview-16-techno-1.mp3',
    fullSrc: '/gigantera/works/audio/full/full-16-techno-1.mp3',
    coverImage: '/gigantera/works/zimbro-rastreamento-vetorial.jpg',
    year: 2025,
    description: 'Balanço latino subterrâneo fundido com bumbo 4x4 rígido e palmas industriais.'
  },
  {
    id: 'track-17-sobnome',
    trackNumber: '17',
    title: 'Sobnome',
    series: 'Sobnome Sketches',
    genre: 'AMBIENT TECHNO',
    bpm: 119,
    duration: '01:40',
    previewSrc: '/gigantera/works/audio/previews/preview-17-sobnome.mp3',
    fullSrc: '/gigantera/works/audio/full/full-17-sobnome.mp3',
    coverImage: '/gigantera/works/espinhaco-descida-crepuscular.jpg',
    year: 2025,
    description: 'Variação espectral contemplativa com ecos sutis de sintetizador polifônico.'
  }
];

export const ARTWORKS_CATALOG: Artwork[] = [
  // ==========================================
  // SECTOR 01: STILL (6 Obras Físicas Únicas em Vitrines de Vidro com Pôster de Papel Mate)
  // ==========================================
  {
    id: 'espinhaco-cinetica-prata',
    title: 'Espinhaço I: Cinética de Prata',
    series: 'Espinhaço & Biomimética',
    medium: 'still',
    categoryLabel: 'IMPRESSO GICLÉE EM VIDRO',
    year: 2026,
    materials: 'Papel de algodão mate 310g/m², vitrine de vidro temperado e liga de prata',
    description: 'Estrutura vertebral articulada concebida a partir da biomecânica da ictiologia marinha. O impresso fosco flutua no centro da câmara vítrea.',
    imageSrc: '/gigantera/works/espinhaco-cinetica-prata.jpg',
    aspectRatio: '9 / 16',
    aspectRatioNum: 781 / 1400, // 0.557857 (Vertical)
    spatialCoords: { x: -3.8, y: 0.0, z: 12.0, rotY: 0.12 },
    curatorialNotes: 'Peça inaugural da série Espinhaço. A coluna vertebral em prata atua como interface entre anatomia fóssil e cinética computacional.'
  },
  {
    id: 'espinhaco-vitrine-aquario',
    title: 'Espinhaço: Contenção Vítrea',
    series: 'Espinhaço & Biomimética',
    medium: 'still',
    categoryLabel: 'IMPRESSO GICLÉE EM VIDRO',
    year: 2026,
    materials: 'Papel arquivístico mate sem brilho, vitrine de vidro óptico e titânio',
    description: 'O espécime biomecânico em repouso estático, isolado em volume vítreo de galeria antes da ativação do fluxo hidrodinâmico.',
    imageSrc: '/gigantera/works/espinhaco-vitrine-aquario.jpg',
    aspectRatio: '9 / 16',
    aspectRatioNum: 781 / 1400, // 0.557857 (Vertical)
    spatialCoords: { x: 3.8, y: 0.0, z: 6.5, rotY: -0.15 },
    curatorialNotes: 'A vitrine transparente funciona como câmara de contenção e pedestal arquitetural sem contato com o piso.'
  },
  {
    id: 'zimbro-estudo-espectral',
    title: 'Zimbro: Atlas Fotogramétrico',
    series: 'Zimbro Espinhaço',
    medium: 'still',
    categoryLabel: 'MURAL WIDESCREEN EM VIDRO',
    year: 2026,
    materials: 'Papel mate panorâmico de museu, coordenadas fotogramétricas e vitrine horizontal selada',
    description: 'Mapeamento integral do ciclo curatorial: da tapeçaria têxtil e prototipagem em ateliê aos modelos de submersão e análise algorítmica.',
    imageSrc: '/gigantera/works/zimbro-estudo-espectral.jpg',
    aspectRatio: '16 / 9',
    aspectRatioNum: 1400 / 787, // 1.778907 (Widescreen Horizontal Master Study)
    spatialCoords: { x: -4.0, y: 0.0, z: 1.0, rotY: 0.14 },
    curatorialNotes: 'Mural horizontal documentando as fases de gestação física e virtual dos protótipos em proporção cinematográfica 16:9.'
  },
  {
    id: 'sedimento-litificacao-final',
    title: 'Sedimentação & Litificação',
    series: 'Zimbro Espinhaço',
    medium: 'still',
    categoryLabel: 'IMPRESSO GICLÉE EM VIDRO',
    year: 2026,
    materials: 'Papel mate aveludado, silte basáltico e vitrine de vidro ultra-claro',
    description: 'Momento de repouso definitivo da peça contra o piso basáltico; a matéria inerte entra em contato com silte em processo de litificação.',
    imageSrc: '/gigantera/works/sedimento-litificacao-final.jpg',
    aspectRatio: '9 / 16',
    aspectRatioNum: 787 / 1400, // 0.562143 (Vertical)
    spatialCoords: { x: 3.8, y: 0.0, z: -4.5, rotY: -0.12 },
    curatorialNotes: 'Fase final do ciclo de decadência dos materiais escultóricos sob compressão basáltica.'
  },
  {
    id: 'notalgia-monolito-costeiro',
    title: 'Notalgia: O Monolito Terminal',
    series: 'Notalgia',
    medium: 'still',
    categoryLabel: 'IMPRESSO GICLÉE EM VIDRO',
    year: 2026,
    materials: 'Papel mate de alta gramatura, vitrine de vidro arquitetural e fiação industrial',
    description: 'Artefato monolítico concebido como relicário contemporâneo na fronteira entre a arquitetura bruta e o abismo natural.',
    imageSrc: '/gigantera/works/notalgia-monolito-costeiro.jpg',
    aspectRatio: '9 / 16',
    aspectRatioNum: 781 / 1400, // 0.557857 (Vertical)
    spatialCoords: { x: -3.8, y: 0.0, z: -10.0, rotY: 0.1 },
    curatorialNotes: 'Monólito escultural vertical com iluminação emissiva verde e contraste com geologia costeira.'
  },
  {
    id: 'espinhaco-registro-abissal',
    title: 'Espinhaço: Cartografia Abissal',
    series: 'Espinhaço & Biomimética',
    medium: 'still',
    categoryLabel: 'IMPRESSO GICLÉE EM VIDRO',
    year: 2026,
    materials: 'Papel de algodão fosco 310g/m², vitrine de vidro selada e pigmentos minerais',
    description: 'Registro visual submerso da coluna vertebral biomecânica em escala micrométrica, revelando texturas de compressão sedimentar marinha.',
    imageSrc: '/gigantera/works/espinhaco-registro-abissal.jpg',
    aspectRatio: '9 / 16',
    aspectRatioNum: 781 / 1400, // 0.557857 (Vertical)
    spatialCoords: { x: 3.8, y: 0.0, z: -15.5, rotY: -0.12 },
    curatorialNotes: 'Cartografia gráfica que detalha os pontos de flexão e fadiga de materiais no fundo oceânico.'
  },

  // ==========================================
  // SECTOR 02: VIDEO (3 Vitrines Cinéticas com Pôsteres Exclusivos e Sem Repetição)
  // ==========================================
  {
    id: 'video-espinhaco-cinetico',
    title: 'Espinhaço II: Flexão Biomecânica',
    series: 'Espinhaço Cinético',
    medium: 'video',
    categoryLabel: 'VITRINE CINÉTICA // LOOP',
    year: 2026,
    materials: 'Vitrine de vidro flutuante, simulação hidrodinâmica em tempo real e renderização volumétrica',
    description: 'Movimento ondular da coluna de prata em meio denso. Cada vértebra transmite torque desacelerado para a vértebra seguinte.',
    imageSrc: '/gigantera/works/espinhaco-descida-crepuscular.jpg',
    videoSrc: '/gigantera/works/video/video-01-kinetic-spine.mp4',
    duration: '00:06 (Loop Contínuo)',
    aspectRatio: '9 / 16',
    aspectRatioNum: 540 / 960, // 0.5625 (Vertical)
    spatialCoords: { x: -3.9, y: 0.0, z: -24.0, rotY: 0.16 },
    curatorialNotes: 'O pôster dentro da caixa de vidro ganha vida com a física computacional de viscosidade do meio.'
  },
  {
    id: 'video-stipples-particulas',
    title: 'Zimbro: Dispersão Estocástica',
    series: 'Zimbro & Física Granular',
    medium: 'video',
    categoryLabel: 'VITRINE CINÉTICA // ESTOCÁSTICA',
    year: 2026,
    materials: 'Vitrine de vidro flutuante, sistema estocástico de pontos (stippling) e ruído vetorial',
    description: 'Milhares de corpúsculos gráficos reagem a campos de força invisíveis, colidindo e recompondo a silhueta da escultura.',
    imageSrc: '/gigantera/works/zimbro-rastreamento-vetorial.jpg',
    videoSrc: '/gigantera/works/video/video-02-stipples-simulation.mp4',
    duration: '00:06 (Loop Contínuo)',
    aspectRatio: '9 / 16',
    aspectRatioNum: 540 / 960, // 0.5625 (Vertical)
    spatialCoords: { x: 3.8, y: 0.0, z: -32.0, rotY: -0.18 },
    curatorialNotes: 'Loop procedural que examina o limite entre o desenho de linha clássico e a computação estocástica de partículas.'
  },
  {
    id: 'video-espinha-metalica',
    title: 'Matriz Metálica: Ondulação Laminar',
    series: 'Espinhaço & Morfologia',
    medium: 'video',
    categoryLabel: 'VITRINE CINÉTICA // 3D',
    year: 2026,
    materials: 'Vitrine de vidro flutuante, liga cromo-níquel virtual e reflexão anisotrópica',
    description: 'Sequência em plano-sequência fechado destacando as reflexões metálicas de alta pureza enquanto a estrutura se curva em ciclo contínuo.',
    imageSrc: '/gigantera/works/espinhaco-relevo-neotribal.jpg',
    videoSrc: '/gigantera/works/video/video-03-metallic-spine.mp4',
    duration: '00:06 (Loop Contínuo)',
    aspectRatio: '9 / 16',
    aspectRatioNum: 540 / 960, // 0.5625 (Vertical)
    spatialCoords: { x: -3.8, y: 0.0, z: -40.0, rotY: 0.12 },
    curatorialNotes: 'Estudo de iluminação e materialidade em superfícies reflexivas curvas sob vidro.'
  }
];
