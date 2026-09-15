import { PressKitAsset, MasterWorkAsset } from '../types/art';
import { ARTWORKS_CATALOG, AUTHORIAL_TRACKS_CATALOG } from './artworks';

export const ARTIST_INFO = {
  name: 'Felipe Conceição',
  alias: 'Gigantera',
  role: 'Vídeo Arte, Mídia Generativa & Som Experimental',
  location: 'Brasil / Global',
  contactEmail: 'felipe@pelimotion.art',
  portfolioUrl: 'https://pelimotion.art',
  galleryUrl: 'https://pelimotion.art/gigantera',
  cloudDriveUrl: 'https://drive.google.com/drive/folders/1w7u6jDqj8r3l9m8s2?usp=sharing'
};

/**
 * Textos Institucionais Canônicos do Projeto GIGANTERA
 * Fonte: gigantera-textos.md
 * O pavilhão 3D é o portfólio imersivo do artista.
 * O projeto artístico substantivo é GIGANTERA.
 */
export const GIGANTERA_TEXTOS_CANONICOS = {
  tagline: 'Memória caiçara em atrito com máquina e som sintético.',

  miniBio: `Gigantera é o projeto artístico de Felipe Conceição, com atuação em vídeo, mídia generativa e som. No audiovisual desde 2015, no motion design desde 2018. A pesquisa nasce da herança caiçara do artista e investiga o atrito entre corpo e automação, tempo orgânico e aceleração, por meio de código, projeção e síntese modular.`,

  bioShort: `Gigantera é o projeto artístico de Felipe Conceição, dedicado a vídeo arte, mídia generativa e som experimental. Antes do código veio o baixo: a música é raiz da prática, hoje deslocada pra síntese modular e processos generativos. É uma escolha deliberada, o sintético como material e não só como técnica.\n\nDescendente de família caiçara (parte na pesca artesanal, parte já dentro da pesca industrial) e criado na Praia Brava, bairro que hoje abriga o Warung, Felipe viu de perto um território sendo absorvido por uma escala maior. Essa fricção atravessa a obra de Gigantera, que coloca o corpo contra a automação e a memória contra o espetáculo, dentro de um tempo cada vez mais acelerado. Com quase uma década na indústria audiovisual e publicitária, o artista usa as mesmas ferramentas que sustentam essa indústria (projeção, código, mídia generativa) pra questioná-la por dentro.`,

  bioInstitutional: `Gigantera é o projeto artístico de Felipe Conceição, um espaço à parte da carreira comercial dele em motion design e pós-produção, onde as mesmas ferramentas técnicas servem pra investigar questões que o mercado não dá espaço pra fazer.\n\nNo audiovisual desde 2015 e no motion design desde 2018, Felipe fundou a Pelimotion, hub que conecta profissionais do setor criativo. Essa trajetória o colocou, por quase uma década, dentro da máquina que produz o brilho publicitário, e é esse conhecimento de dentro que ele vira contra si mesmo em Gigantera.\n\nA pesquisa nasce de duas heranças territoriais. Uma é a família caiçara, parte pescadores artesanais, parte já absorvida pela pesca industrial, que carrega dentro de casa o mesmo conflito de escala que atravessa a obra. A outra é a Praia Brava, bairro onde cresceu e que hoje abriga o Warung, um dos points de música eletrônica mais conhecidos do mundo. Ali, desde criança, viu o turismo internacional e as elites tomando um território que era da comunidade.\n\nAs duas experiências alimentam a mesma questão, o que sobra de uma cultura local quando ela é engolida por uma escala maior, mais rica e mais rápida. Gigantera trabalha essa questão em vídeo, mídia generativa, projeção mapeada e som, usando código e processos algorítmicos pra colocar o gesto orgânico em atrito com o automatismo industrial.\n\nA música é raiz da prática, começou no baixo, e hoje se desloca pra síntese modular e eletrônica, escolhida por ser inteiramente sintética: o som, assim como a imagem, carrega essa tensão entre corpo e máquina. O foco do trabalho não é lamentar o que já foi perdido. É mostrar o mecanismo que segue causando a perda.`,

  artistStatement: `Minha prática como Gigantera nasce de um atrito que carrego de dentro: entre o corpo e a automação, entre o tempo orgânico e a aceleração de um sistema que não parece ter fora.\n\nUso mídia generativa, código, projeção e som pra colocar essas duas lógicas na mesma imagem, no mesmo espaço. Isso não vem de um lugar nostálgico, é mais um diagnóstico. Não me interessa lamentar o que a indústria apaga. Me interessa expor o mecanismo que continua apagando, e a facilidade com que qualquer cultura vira estética vendável assim que alguém sabe embalar direito.\n\nEssa questão dialoga com o realismo capitalista de Mark Fisher, a sensação de que não existe mais fora do sistema, só velocidade dentro dele. E dialoga também com uma leitura lacaniana do desejo: ele nunca é só nosso, é produzido e mantido em falta pra alimentar o próprio sistema.\n\nA música é onde tudo começou pra mim, antes do código ou da projeção. Hoje trabalho com síntese modular e eletrônica, deliberadamente sintética, sem instrumento acústico, porque o som também precisa carregar essa tensão entre o vivo e o fabricado.\n\nTrago pra dentro do trabalho duas heranças de território: uma família que viveu a pesca, dividida entre o artesanal e o industrial, e um bairro que virou destino turístico da noite eletrônica mundial. As duas me ensinaram, cedo demais, que escala vence. O resto é o que sobra.`,

  processNotes: `Trabalho com mídia generativa, creative coding, motion design, VFX e projeção mapeada pra construir a camada visual, muitas vezes a partir de objetos ou elementos físicos processados digitalmente e devolvidos em loop. O som segue a mesma lógica: síntese modular e generativa, sem instrumentação acústica, construída com fragmentos de internet, b-rolls e gravações de campo. Não busco conforto acústico nem resolução fácil. O ambiente sonoro é parte do diagnóstico, não trilha de apoio.`,

  cvSkeleton: `FELIPE CONCEIÇÃO (GIGANTERA)\nBaseado em Itajaí / Santa Catarina, Brasil\nContato: felipe@pelimotion.art · https://pelimotion.art\n\nTRAJETÓRIA\n- 2015 — Início no mercado audiovisual e cinema independente\n- 2018 — Início em motion design, arte procedural e direção de arte\n- Fundação da Pelimotion (hub e rede de pós-produção)\n\nSÉRIES & OBRAS EM ANDAMENTO\n- Espinhaço (2026) — Vídeo cinético, renderização volumétrica e estudos de escala\n- Zimbro (2026) — Sistemas estocásticos de partículas e ruído vetorial\n- Notalgia (2026) — Topografia costeira e litificação\n- Sedimento (2026) — Fósseis computacionais e mineralização\n- Gigantera LP (2026) — 17 faixas em síntese sonora modular e eletrônica experimental`
};

export const CURATORIAL_STATEMENTS = {
  tagline: GIGANTERA_TEXTOS_CANONICOS.tagline,
  miniBio: GIGANTERA_TEXTOS_CANONICOS.miniBio,
  bioPt: GIGANTERA_TEXTOS_CANONICOS.bioShort,
  bioShort: GIGANTERA_TEXTOS_CANONICOS.bioShort,
  bioInstitutional: GIGANTERA_TEXTOS_CANONICOS.bioInstitutional,
  bioEn: `Gigantera is the artistic project of Felipe Conceição, dedicated to video art, generative media, and experimental sound. Before code came the bass: music is the root of the practice, now displaced toward modular synthesis and generative processes. It is a deliberate choice: the synthetic as material, not just technique.\n\nDescended from a coastal caiçara family and raised in Praia Brava, Felipe witnessed up close a territory being swallowed by larger industrial scale. This friction crosses Gigantera's work, setting the body against automation and memory against spectacle within an accelerated economic system.`,
  statementPt: GIGANTERA_TEXTOS_CANONICOS.artistStatement,
  statementEn: `My practice as Gigantera stems from an internal friction: between the human body and automation, between organic time and the acceleration of a system that allows no outside.\n\nI use generative media, code, projection, and sound to bring both logics into the exact same image and space. This does not come from nostalgia; it is a diagnosis. I am interested in exposing the apparatus that erases, and how easily culture turns into a marketable aesthetic once packaged properly.\n\nMusic is where everything began for me. Today I work with modular and electronic synthesis, deliberately synthetic without acoustic instrumentation, so sound carries this exact tension between the living and the manufactured.`,
  processNotes: GIGANTERA_TEXTOS_CANONICOS.processNotes,
  cvSkeleton: GIGANTERA_TEXTOS_CANONICOS.cvSkeleton
};

/**
 * Tabela de Pesos e Resoluções Reais das Mídias
 * Eliminando estimativas genéricas e refletindo arquivos reais
 */
export const WORK_REAL_SIZES: Record<string, { webSize: string; masterSize: string }> = {
  'video-espinhaco-cinetico': { webSize: '514 KB', masterSize: '1.85 GB' },
  'video-stipples-particulas': { webSize: '894 KB', masterSize: '1.85 GB' },
  'video-espinha-metalica': { webSize: '1.0 MB', masterSize: '1.85 GB' },
  'video-mapping-led': { webSize: '250 KB', masterSize: '1.85 GB' },
  'video-onda-padroes': { webSize: '1.6 MB', masterSize: '1.85 GB' },
  'video-cores-spectrum': { webSize: '1.1 MB', masterSize: '1.85 GB' },
  'still-registro-abissal': { webSize: '192 KB', masterSize: '65 MB' },
  'still-cinetica-prata': { webSize: '385 KB', masterSize: '65 MB' },
  'still-relevo-neotribal': { webSize: '298 KB', masterSize: '65 MB' },
  'still-monolito-costeiro': { webSize: '456 KB', masterSize: '65 MB' },
  'still-litificacao-final': { webSize: '425 KB', masterSize: '65 MB' },
  'still-rastreamento-vetorial': { webSize: '290 KB', masterSize: '65 MB' },
};

export function getWorkRealSize(artId: string, isVideo: boolean): { webSize: string; masterSize: string; displaySize: string } {
  const found = WORK_REAL_SIZES[artId];
  if (found) {
    return {
      ...found,
      displaySize: `${found.webSize} (Web) · ${found.masterSize} (Master Drive)`
    };
  }
  return {
    webSize: isVideo ? '1.2 MB' : '350 KB',
    masterSize: isVideo ? '1.85 GB' : '65 MB',
    displaySize: isVideo ? '1.2 MB (Web) · 1.85 GB (Master Drive)' : '350 KB (Web) · 65 MB (Master Drive)'
  };
}

export const PRESS_KIT_ASSETS: PressKitAsset[] = [
  {
    id: 'press-tagline',
    category: 'bio',
    title: 'Tagline Oficial // GIGANTERA',
    description: 'Linha sintética para assinatura de e-mail, bio de redes e cabeçalho de apresentações.',
    format: 'TXT',
    resolutionOrSize: '1 linha · 54 chars',
    copyableContent: GIGANTERA_TEXTOS_CANONICOS.tagline,
    status: 'ready'
  },
  {
    id: 'press-bio-short',
    category: 'bio',
    title: 'Biografia Oficial (~150 palavras)',
    description: 'Padrão para editais, festivais, mostras coletivas e catálogos.',
    format: 'TXT / MD',
    resolutionOrSize: '150 palavras · 1.2 KB',
    copyableContent: GIGANTERA_TEXTOS_CANONICOS.bioShort,
    status: 'ready'
  },
  {
    id: 'press-bio-institutional',
    category: 'bio',
    title: 'Biografia Institucional Completa (~280 palavras)',
    description: 'Versão aprofundada para matérias de imprensa, catálogos extensos e inscrições de grande porte.',
    format: 'TXT / MD',
    resolutionOrSize: '280 palavras · 2.1 KB',
    copyableContent: GIGANTERA_TEXTOS_CANONICOS.bioInstitutional,
    status: 'ready'
  },
  {
    id: 'press-statement-gigantera',
    category: 'statement',
    title: 'Artist Statement Oficial (1ª Pessoa)',
    description: 'Declaração conceitual em primeira pessoa sobre a pesquisa artística de Gigantera.',
    format: 'TXT / MD',
    resolutionOrSize: '260 palavras · 1.8 KB',
    copyableContent: GIGANTERA_TEXTOS_CANONICOS.artistStatement,
    status: 'ready'
  },
  {
    id: 'press-process-notes',
    category: 'process',
    title: 'Nota de Processo & Materiais (Rider Técnico)',
    description: 'Especificação técnica sobre mídia generativa, creative coding, projeção e síntese sonora.',
    format: 'TXT / MD',
    resolutionOrSize: '110 palavras · 800 B',
    copyableContent: GIGANTERA_TEXTOS_CANONICOS.processNotes,
    status: 'ready'
  },
  {
    id: 'press-cv-skeleton',
    category: 'cv',
    title: 'Currículo / Trajetória Artística',
    description: 'Cronologia de atuação, lançamentos das séries e histórico profissional.',
    format: 'TXT / MD',
    resolutionOrSize: 'Estrutura Curatorial',
    copyableContent: GIGANTERA_TEXTOS_CANONICOS.cvSkeleton,
    status: 'ready'
  },
  {
    id: 'press-headshot-hi-res',
    category: 'photos',
    title: 'Retrato Oficial do Artista (300 DPI / Print)',
    description: 'Fotografia de estúdio em alta resolução para catálogos impressos e matérias jornalísticas.',
    format: 'JPG / TIFF',
    resolutionOrSize: '300 DPI · 4000x5000 px · 14.2 MB',
    fileUrl: '',
    previewUrl: '/avatar/avatar.png',
    status: 'pending'
  },
  {
    id: 'press-logos-vector',
    category: 'logos',
    title: 'Pack de Identidade Visual (Logos & Tipogramas)',
    description: 'Logotipos e assinaturas oficiais em vetor escalável e PNGs transparentes.',
    format: 'SVG / PNG',
    resolutionOrSize: 'Vetor Escalável',
    fileUrl: '/logo.svg',
    previewUrl: '/logo.svg',
    status: 'pending'
  },
  {
    id: 'press-exhibition-release',
    category: 'release',
    title: 'Press Release Oficial do Projeto GIGANTERA',
    description: 'Documento oficial com contextualização poética, herança caiçara e sinopses das séries.',
    format: 'PDF / TXT',
    resolutionOrSize: 'Documento Editorial',
    fileUrl: '',
    copyableContent: `# PRESS RELEASE // GIGANTERA\nArtista: Felipe Conceição\nAno: 2026\n\nTAGLINE:\n${GIGANTERA_TEXTOS_CANONICOS.tagline}\n\nBIOGRAFIA:\n${GIGANTERA_TEXTOS_CANONICOS.bioShort}\n\nARTIST STATEMENT:\n${GIGANTERA_TEXTOS_CANONICOS.artistStatement}\n\nPROCESSO & MATERIAIS:\n${GIGANTERA_TEXTOS_CANONICOS.processNotes}\n\nSÉRIES EM EXIBIÇÃO:\n- Espinhaço (Matriz Mineral & Cinética)\n- Notalgia (Topografia Costeira & Subaquático)\n- Sedimento (Litificação & Fósseis 3D)\n- Zimbro (Rastreamento Espectral & Vetores)\n- Discografia: 17 faixas autorais em Estação de Áudio física.`,
    status: 'ready'
  }
];

export const MASTER_WORKS_CATALOG: MasterWorkAsset[] = ARTWORKS_CATALOG
  .filter((art) => art.availableInMediaKit !== false)
  .map((art) => {
    const isVideo = art.medium === 'video';
    const masterFormat = isVideo
      ? 'Apple ProRes 422 HQ (4K UHD 60fps) + Master Áudio PCM'
      : 'TIFF 16-bit Não-Comprimido (300 DPI)';
    const dimensions = isVideo ? '3840x2160 UHD (16:9)' : '4000x5000 px (4:5) / 300 DPI';
    const colorSpace = isVideo ? 'Rec.709 / BT.1886' : 'Adobe RGB (1998) / sRGB';
    
    const sizeInfo = getWorkRealSize(art.id, isVideo);

    const citationCredit = `CONCEIÇÃO, Felipe. ${art.title}, ${art.year}. ${art.materials}. ${dimensions}. Coleção Gigantera. Disponível em: https://pelimotion.art/gigantera.`;

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
      fileSizeApprox: sizeInfo.displaySize,
      webFileSize: sizeInfo.webSize,
      masterFileSize: sizeInfo.masterSize,
      previewSrc: art.imageSrc,
      downloadUrl: art.videoSrc || art.imageSrc,
      cloudStorageUrl: ARTIST_INFO.cloudDriveUrl,
      citationCredit,
      curatorialStatement: art.description,
      availableInMediaKit: art.availableInMediaKit !== false
    };
  });

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
    fileSizeApprox: '4.8 MB (MP3) · 48.5 MB (WAV Master)',
    webFileSize: '4.8 MB',
    masterFileSize: '48.5 MB',
    previewSrc: track.coverImage,
    downloadUrl: track.fullSrc,
    cloudStorageUrl: ARTIST_INFO.cloudDriveUrl,
    citationCredit,
    curatorialStatement: track.description
  };
});
