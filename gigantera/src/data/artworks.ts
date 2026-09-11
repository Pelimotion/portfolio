import { StratumInfo } from '../types/art';

/**
 * Catálogo Autoral de Obras de gigantera
 * Seleção curatorial do acervo real do artista (Espinhaço, Zimbro e Notalgia).
 * Distribuído pelas 3 camadas físicas da coluna estratigráfica oceânica.
 */
export const STRATA_CATALOG: StratumInfo[] = [
  {
    id: 'epipelagic',
    title: 'Estrato Epipelágico',
    depthRange: '0m — 200m (Zona Fótica & Luz)',
    description: 'A camada onde os fótons solares sofrem refração e dispersão. As esculturas de prata polida e liga de titânio interagem com a lâmina superficial e o fluxo laminar.',
    resonanceFreqHz: 174,
    nodalMode: { n: 2, m: 2 },
    artworks: [
      {
        id: 'espinhaco-cinetica-prata',
        title: 'Espinhaço I: Cinética de Prata',
        series: 'Espinhaço & Hidrodinâmica',
        stratum: 'epipelagic',
        year: 2026,
        materials: 'Escultura cinética em liga de prata e titânio, mecânica ondulatória submersa',
        description: 'Estrutura articulada concebida a partir da biomecânica da ictiologia marinha. O movimento responde ao fluxo de água com desaceleração inercial calculada.',
        depthMeters: 12,
        imageSrc: '/gigantera/works/espinhaco-cinetica-prata.jpg',
        imageAlt: 'Escultura de coluna vertebral em prata brilhante ondulando sob refrações e folhas de lótus em água rasa cristalina'
      },
      {
        id: 'espinhaco-vitrine-aquario',
        title: 'Espinhaço: Contenção Vítrea',
        series: 'Espinhaço & Hidrodinâmica',
        stratum: 'epipelagic',
        year: 2026,
        materials: 'Escultura de prata polida suspensa em câmara de vidro óptico temperado de alta transparência',
        description: 'O espécime biomecânico em repouso estático, isolado em volume vítreo cristalino antes da descida oceânica.',
        depthMeters: 45,
        imageSrc: '/gigantera/works/espinhaco-vitrine-aquario.jpg',
        imageAlt: 'Escultura espinhal de prata suspensa verticalmente dentro de aquário monolítico de vidro em galeria minimalista'
      },
      {
        id: 'zimbro-estudo-espectral',
        title: 'Zimbro: Atlas Fotogramétrico',
        series: 'Zimbro Espinhaço',
        stratum: 'epipelagic',
        year: 2026,
        materials: 'Atlas composicional, estudos fotogramétricos, coordenadas tridimensionais e tapeçaria acústica',
        description: 'Mapeamento integral do ciclo de criação: da tapeçaria têxtil e prototipagem em ateliê aos modelos de submersão e análise computacional.',
        depthMeters: 140,
        imageSrc: '/gigantera/works/zimbro-estudo-espectral.jpg',
        imageAlt: 'Composição de múltiplos painéis fotográficos mostrando ateliê, tapeçaria, peças 3D e renderizações submersas do projeto Zimbro'
      }
    ]
  },
  {
    id: 'mesopelagic',
    title: 'Estrato Mesopelágico',
    depthRange: '200m — 1000m (Zona Crepuscular & Ressonância)',
    description: 'A luz solar dissipa-se. O espaço é dominado pela atenuação de comprimentos de onda, filamentos bioluminescentes e rastreamento cinemático por coordenadas vetoriais.',
    resonanceFreqHz: 396,
    nodalMode: { n: 4, m: 3 },
    artworks: [
      {
        id: 'espinhaco-descida-crepuscular',
        title: 'Espinhaço II: Descida Crepuscular',
        series: 'Espinhaço & Hidrodinâmica',
        stratum: 'mesopelagic',
        year: 2026,
        materials: 'Coluna biomecânica em liga cromo-níquel, filamentos bioluminescentes sob atenuação de profundidade',
        description: 'A transição na qual a luz solar residual é substituída pela escuridão compressiva e o arrasto fluido se estabiliza.',
        depthMeters: 380,
        imageSrc: '/gigantera/works/espinhaco-descida-crepuscular.jpg',
        imageAlt: 'Vértebras metálicas texturizadas descendo pelo oceano escuro envoltas em micro-filamentos de luz bioluminescente'
      },
      {
        id: 'zimbro-rastreamento-vetorial',
        title: 'Zimbro: Vetor Nodal & Coordenadas',
        series: 'Zimbro Espinhaço',
        stratum: 'mesopelagic',
        year: 2026,
        materials: 'Rastreamento fotogramétrico tridimensional em tempo real, nuvem de vetores de posição',
        description: 'Inspeção cinemática da articulação óssea em meio denso com marcadores computacionais de deslocamento angular.',
        depthMeters: 620,
        imageSrc: '/gigantera/works/zimbro-rastreamento-vetorial.jpg',
        imageAlt: 'A coluna de prata flutuando na escuridão marinha com pontos e coordenadas cartesianas x e y sobrepostas'
      },
      {
        id: 'espinhaco-relevo-neotribal',
        title: 'Matriz Óssea Neotribal',
        series: 'Espinhaço & Morfologia',
        stratum: 'mesopelagic',
        year: 2026,
        materials: 'Fundição em liga de prata e osso sintético sinterizado em alta densidade',
        description: 'Detalhe macroscópico da tessitura de nervuras e filamentos de tração da escultura, estruturada para suportar pressões diferenciais extremas.',
        depthMeters: 890,
        imageSrc: '/gigantera/works/espinhaco-relevo-neotribal.jpg',
        imageAlt: 'Fotografia macro de alta textura da coluna esculpida com filamentos ósseos entrelaçados em fundo preto'
      }
    ]
  },
  {
    id: 'bathypelagic',
    title: 'Estrato Batipelágico',
    depthRange: '1000m — 4000m (Tempo Geológico & Sedimento)',
    description: 'Escuridão e pressão colossal de até 400 bar. O silte e a matéria inerte entram em litificação; a escultura atinge o repouso dinâmico no assoalho abissal.',
    resonanceFreqHz: 528,
    nodalMode: { n: 5, m: 5 },
    artworks: [
      {
        id: 'espinhaco-registro-abissal',
        title: 'Espinhaço III: Registro Abissal',
        series: 'Espinhaço & Hidrodinâmica',
        stratum: 'bathypelagic',
        year: 2026,
        materials: 'Matéria inerte sob pressão hidrostática de 180 bar, presença bioluminescente pelágica',
        description: 'O esqueleto metálico em repouso dinâmico no vácuo fotônico batipelágico, cercado pela fauna de profundidade.',
        depthMeters: 1850,
        imageSrc: '/gigantera/works/espinhaco-registro-abissal.jpg',
        imageAlt: 'Coluna de prata no abismo mais escuro, com olhos fosforescentes brilhando suavemente na penumbra'
      },
      {
        id: 'sedimento-litificacao-final',
        title: 'Sedimentação & Litificação Final',
        series: 'Zimbro Espinhaço',
        stratum: 'bathypelagic',
        year: 2026,
        materials: 'Impacto de leito marinho, decantação de silte e nuvem de partículas rastreadas computacionalmente',
        description: 'O momento de impacto da escultura contra o assoalho oceânico; o silte milenar é carreado e precipita-se em litificação.',
        depthMeters: 2800,
        imageSrc: '/gigantera/works/sedimento-litificacao-final.jpg',
        imageAlt: 'A escultura óssea colidindo contra o fundo de areia e silte, levantando nuvens densas de sedimento com bounding boxes'
      },
      {
        id: 'notalgia-monolito-costeiro',
        title: 'Notalgia: O Monolito Terminal',
        series: 'Notalgia',
        stratum: 'bathypelagic',
        year: 2026,
        materials: 'Painel emissivo de LED monolítico, fiação industrial exposta e rocha vulcânica basáltica',
        description: 'O artefato tecnológico enterrado no sedimento como relicário final da civilização na fronteira entre a terra e o abismo.',
        depthMeters: 3950,
        imageSrc: '/gigantera/works/notalgia-monolito-costeiro.jpg',
        imageAlt: 'Painel LED vertical verde erguido sobre rochas escuras e areia molhada sob céu nublado dramático'
      }
    ]
  }
];
