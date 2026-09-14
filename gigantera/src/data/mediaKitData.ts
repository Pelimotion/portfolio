import { PressKitAsset, MasterWorkAsset } from '../types/art';
import { ARTWORKS_CATALOG, AUTHORIAL_TRACKS_CATALOG } from './artworks';

export const ARTIST_INFO = {
  name: 'Felipe Conceição',
  alias: 'Pelimotion',
  role: 'Diretor de Arte, Artista 3D & Sound Designer',
  location: 'Brasil / Global',
  contactEmail: 'felipe@pelimotion.art',
  portfolioUrl: 'https://pelimotion.art',
  galleryUrl: 'https://pelimotion.art/gigantera',
  cloudDriveUrl: 'https://drive.google.com/drive/folders/1w7u6jDqj8r3l9m8s2?usp=sharing'
};

export const CURATORIAL_STATEMENTS = {
  bioPt: `Felipe Conceição (Pelimotion) é diretor de arte, artista 3D e sound designer brasileiro. Sua pesquisa visual explora a interseção entre o brutalismo digital contemporâneo, simulações físicas hiper-realistas, tipografia escultural e paisagens sonoras modulares imersivas. Com mais de uma década de atuação multidisciplinar, concebe ecossistemas estéticos que fundem arquitetura minimalista, cinemática de alta velocidade e design de áudio tátil.`,
  bioEn: `Felipe Conceição (Pelimotion) is a Brazilian art director, 3D artist, and sound designer. His visual research investigates the intersection of contemporary digital brutalism, hyper-realistic physical simulations, sculptural typography, and immersive modular soundscapes. With over a decade of multidisciplinary practice, he crafts aesthetic ecosystems fusing minimalist architecture, high-velocity cinematics, and tactile audio design.`,
  statementPt: `GIGANTERA é um manifesto espacial em brutalismo digital que rejeita a efemeridade das interfaces bidimensionais. Ao articular três matérias fundamentais — a rigidez escultural da imagem estática (Still), a cinemática fluida do vídeo em loop (Motion) e a materialidade analógica de um álbum físico em jewel case acrílico (Sound) —, a exposição propõe uma experiência contemplativa onde o espectador navega fisicamente pela densidade e pelo ritmo de cada obra.`,
  statementEn: `GIGANTERA is a spatial manifesto in digital brutalism rejecting the transience of flat 2D feeds. By articulating three core matters — the sculptural stillness of static prints, the fluid kinematics of looping video, and the analog materiality of a physical CD jewel case —, the exhibition delivers a contemplative environment where visitors physically navigate through the density and sonic weight of each creation.`
};

export const PRESS_KIT_ASSETS: PressKitAsset[] = [
  {
    id: 'press-bio-full',
    category: 'bio',
    title: 'Biografia Curatorial Oficial (PT & EN)',
    description: 'Versões completa e resumida em terceira pessoa para catálogos, editais e matérias de imprensa.',
    format: 'TXT / MD',
    resolutionOrSize: '2.4 KB',
    copyableContent: `${CURATORIAL_STATEMENTS.bioPt}\n\n---\n\n${CURATORIAL_STATEMENTS.bioEn}`
  },
  {
    id: 'press-statement-gigantera',
    category: 'statement',
    title: 'Declaração Conceitual — GIGANTERA (Artist Statement)',
    description: 'Texto curatorial integral sobre o conceito arquitetural, sonoro e cinético da exposição.',
    format: 'TXT / MD',
    resolutionOrSize: '1.8 KB',
    copyableContent: `${CURATORIAL_STATEMENTS.statementPt}\n\n---\n\n${CURATORIAL_STATEMENTS.statementEn}`
  },
  {
    id: 'press-headshot-hi-res',
    category: 'photos',
    title: 'Retrato Oficial do Artista (300 DPI / Print)',
    description: 'Fotografia de estúdio em alta resolução pronta para publicação impressa e digital.',
    format: 'JPG / TIFF',
    resolutionOrSize: '300 DPI · 4000x5000 px · 14.2 MB',
    fileUrl: 'https://pelimotion-portfolio.b-cdn.net/press/felipe-conceicao-headshot-300dpi.jpg',
    previewUrl: '/avatar/avatar.png'
  },
  {
    id: 'press-logos-vector',
    category: 'logos',
    title: 'Pack de Identidade Visual (Pelimotion & Gigantera)',
    description: 'Logotipos e tipogramas oficiais em vetor escalável e PNGs transparentes (Modo Claro & Escuro).',
    format: 'SVG / PNG',
    resolutionOrSize: 'Vetor Escalável · 1.2 MB',
    fileUrl: '/logo.svg',
    previewUrl: '/logo.svg'
  },
  {
    id: 'press-exhibition-release',
    category: 'release',
    title: 'Press Release Oficial da Exposição GIGANTERA',
    description: 'Documento completo com ficha técnica, datas, sinopses das 4 séries e lista das 17 faixas autorais.',
    format: 'PDF / MD',
    resolutionOrSize: 'Documento Editorial · 185 KB',
    fileUrl: 'https://pelimotion-portfolio.b-cdn.net/press/press-release-gigantera-2026.pdf',
    copyableContent: `# PRESS RELEASE // GIGANTERA — PELIMOTION\nExposição Espacial de Brutalismo Digital & Arquitetura Sonora\nArtista: Felipe Conceição (Pelimotion)\nAno: 2026\nCuradoria & Direção: Felipe Conceição\nURL Oficial: https://pelimotion.art/gigantera\n\nSÉRIES EM EXIBIÇÃO:\n- Espinhaço (Matriz Mineral & Cinética)\n- Notalgia (Topografia & Subaquático)\n- Sedimento (Litificação & Fósseis 3D)\n- Zimbro (Rastreamento Espectral & Vetores)\n- Discografia CD: 17 faixas autorais em Estojo Físico Jewel Case.`
  },
  {
    id: 'press-social-promo-pack',
    category: 'promopack',
    title: 'Pacote de Divulgação para Mídias Sociais & Telões',
    description: 'Crops padronizados em 16:9 (Landscape 4K), 1:1 (Feed HD) e 9:16 (Stories/Reels 1080x1920) das obras.',
    format: 'ZIP (JPG/MP4)',
    resolutionOrSize: 'Pacote Pronto · 128 MB',
    fileUrl: 'https://pelimotion-portfolio.b-cdn.net/press/gigantera-social-promo-pack-2026.zip'
  }
];

export const MASTER_WORKS_CATALOG: MasterWorkAsset[] = ARTWORKS_CATALOG.map((art) => {
  const isVideo = art.medium === 'video';
  const masterFormat = isVideo
    ? 'Apple ProRes 422 HQ (4K UHD 60fps) + Master Áudio PCM'
    : 'TIFF 16-bit Não-Comprimido (300 DPI)';
  const dimensions = isVideo ? '3840x2160 UHD (16:9)' : '4000x5000 px (4:5) / 300 DPI';
  const colorSpace = isVideo ? 'Rec.709 / BT.1886' : 'Adobe RGB (1998) / sRGB';
  const fileSizeApprox = isVideo ? '1.85 GB' : '64.2 MB';

  const citationCredit = `CONCEIÇÃO, Felipe (Pelimotion). ${art.title}, ${art.year}. ${art.materials}. ${dimensions}. Coleção Gigantera. Disponível em: https://pelimotion.art/gigantera.`;

  return {
    id: `master-${art.id}`,
    artworkId: art.id,
    title: art.title,
    series: art.series,
    medium: art.medium,
    year: art.year,
    materials: art.materials,
    masterFormat,
    dimensionsOrDuration: dimensions,
    colorSpace,
    fileSizeApprox,
    previewSrc: art.imageSrc,
    downloadUrl: art.videoSrc || art.imageSrc,
    cloudStorageUrl: `https://drive.google.com/drive/folders/1w7u6jDqj8r3l9m8s2?usp=sharing`,
    citationCredit,
    curatorialStatement: art.description
  };
});

// Adiciona também as faixas autorais ao catálogo de masters
export const MASTER_AUDIO_CATALOG: MasterWorkAsset[] = AUTHORIAL_TRACKS_CATALOG.map((track) => {
  const citationCredit = `CONCEIÇÃO, Felipe (Pelimotion). "${track.title}" [Faixa ${track.trackNumber}]. In: GIGANTERA (Álbum Original), ${track.year}. Síntese Modular e Sound Design, ${track.duration}, ${track.bpm} BPM. Disponível em: https://pelimotion.art/gigantera.`;

  return {
    id: `master-audio-${track.id}`,
    artworkId: track.id,
    title: `Faixa ${track.trackNumber}: ${track.title}`,
    series: track.series,
    medium: 'sound',
    year: track.year,
    materials: `Síntese Sonora Modular, ${track.genre}, ${track.bpm} BPM`,
    masterFormat: 'WAV 24-bit / 48 kHz Estéreo Não-Comprimido (Master Final)',
    dimensionsOrDuration: `${track.duration} min · ${track.bpm} BPM`,
    colorSpace: 'Áudio Linear PCM (L/R)',
    fileSizeApprox: '48.5 MB',
    previewSrc: track.coverImage,
    downloadUrl: track.fullSrc,
    cloudStorageUrl: `https://drive.google.com/drive/folders/1w7u6jDqj8r3l9m8s2?usp=sharing`,
    citationCredit,
    curatorialStatement: track.description
  };
});
