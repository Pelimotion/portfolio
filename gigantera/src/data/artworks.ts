import { StratumInfo } from '../types/art';

/**
 * Catálogo Autoral de Obras de gigantera
 * Cada peça reflete rigorosamente as leis físicas de refração, ressonância ou sedimentação.
 */
export const STRATA_CATALOG: StratumInfo[] = [
  {
    id: 'epipelagic',
    title: 'Estrato Epipelágico',
    depthRange: '0m — 200m (Zona Fótica)',
    description: 'A camada onde os fótons solares sofrem refração e dispersão espectral. As obras investigam a fronteira óptica entre dois meios de densidades distintas.',
    resonanceFreqHz: 174,
    nodalMode: { n: 2, m: 2 },
    artworks: [
      {
        id: 'refracao-1333',
        title: 'Índice de Refração 1.333',
        series: 'Fronteira Óptica',
        stratum: 'epipelagic',
        year: 2025,
        materials: 'Cálculo de traçado de raios em tempo real, matriz de dispersão de Cauchy',
        description: 'Um estudo numérico da lei de Snell-Descartes aplicada à interface de contato entre o ar e fluidos de viscosidade calculada. O padrão refratado nunca se repete.',
        depthMeters: 12,
        imageSrc: '/gigantera/works/refracao-1333.svg',
        imageAlt: 'Padrão refrativo de cáusticas em luz âmbar sobre fundo ardósia escuro'
      },
      {
        id: 'morfologia-atenuacao',
        title: 'Morfologia da Atenuação',
        series: 'Fronteira Óptica',
        stratum: 'epipelagic',
        year: 2024,
        materials: 'Simulação espectral e densidade coloidal em grade vetorial',
        description: 'Mapeamento do desaparecimento progressivo dos comprimentos de onda vermelhos nos primeiros metros de penetração luminosa.',
        depthMeters: 45,
        imageSrc: '/gigantera/works/morfologia-atenuacao.svg',
        imageAlt: 'Gradiente de densidade espectral esmaecendo em tons de verde-ardósia e ouro pálido'
      },
      {
        id: 'fronteira-incompressivel',
        title: 'Fronteira Incompressível',
        series: 'Fronteira Óptica',
        stratum: 'epipelagic',
        year: 2026,
        materials: 'Estudo dinâmico de tensão superficial e equilíbrio de Laplace',
        description: 'A lâmina invisível que separa a atmosfera do meio denso. A energia é dissipada em oscilações capilares de micro-frequência.',
        depthMeters: 110,
        imageSrc: '/gigantera/works/fronteira-incompressivel.svg',
        imageAlt: 'Linhas vetoriais de tensão superficial deformadas por forças de cisalhamento'
      }
    ]
  },
  {
    id: 'mesopelagic',
    title: 'Estrato Mesopelágico',
    depthRange: '200m — 1000m (Zona Crepuscular)',
    description: 'A luz solar cessa de sustentar a fotossíntese. O espaço é dominado pela propagação mecânica da pressão e frequências acústicas de baixa atenuação.',
    resonanceFreqHz: 396,
    nodalMode: { n: 4, m: 3 },
    artworks: [
      {
        id: 'no-harmonico-432',
        title: 'Nó Harmônico 432',
        series: 'Geometria Cimática',
        stratum: 'mesopelagic',
        year: 2025,
        materials: 'Partículas de quartzo sobre placa de titânio submetida a excitação eletroacústica',
        description: 'Registros fotogramétricos de grãos inertes se acumulando estritamente sobre as zonas de aceleração nula de uma membrana em vibração constante.',
        depthMeters: 340,
        imageSrc: '/gigantera/works/no-harmonico-432.svg',
        imageAlt: 'Padrão geométrico de Chladni com grânulos claros acumulados em curvas hiperbólicas simétricas'
      },
      {
        id: 'dispersao-helmholtz',
        title: 'Dispersão de Helmholtz',
        series: 'Geometria Cimática',
        stratum: 'mesopelagic',
        year: 2024,
        materials: 'Ressonador esférico de pressão hidrostática e interferometria laser',
        description: 'Investigação do aprisionamento de ondas acústicas em cavidades seladas sob pressões crescentes.',
        depthMeters: 620,
        imageSrc: '/gigantera/works/dispersao-helmholtz.svg',
        imageAlt: 'Círculos concêntricos de interferência acústica interagindo com eixos nodais ortogonais'
      },
      {
        id: 'matriz-nodal-b7',
        title: 'Matriz Nodal B-7',
        series: 'Geometria Cimática',
        stratum: 'mesopelagic',
        year: 2026,
        materials: 'Geração procedural de modos próprios de vibração bidimensional',
        description: 'Quando a frequência atinge a sétima harmônica, a distribuição de nós transita de simetria radial para labirintos fractais ortogonais.',
        depthMeters: 890,
        imageSrc: '/gigantera/works/matriz-nodal-b7.svg',
        imageAlt: 'Grid complexo de nós ressonantes com alta densidade em formato de labirinto acústico'
      }
    ]
  },
  {
    id: 'bathypelagic',
    title: 'Estrato Batipelágico',
    depthRange: '1000m — 4000m (Tempo Geológico & Sedimento)',
    description: 'Escuridão absoluta. O único movimento perceptível é a queda perpétua de partículas microscópicas — a neve marinha consolidando-se em pedra ao longo de éons.',
    resonanceFreqHz: 528,
    nodalMode: { n: 5, m: 5 },
    artworks: [
      {
        id: 'sedimentacao-continua-vii',
        title: 'Sedimentação Contínua VII',
        series: 'Tempo Profundo',
        stratum: 'bathypelagic',
        year: 2025,
        materials: 'Decantação de silte e argila esmectita sob pressão de 300 bar',
        description: 'Lâminas micrométricas de sedimento depositadas grão a grão, registrando séculos de inércia em cada milímetro de espessura.',
        depthMeters: 1450,
        imageSrc: '/gigantera/works/sedimentacao-continua-vii.svg',
        imageAlt: 'Camadas horizontais de sedimento mineral em tons de argila escura e ardósia densa'
      },
      {
        id: 'tempo-geologico-basalto',
        title: 'Tempo Geológico e Basalto',
        series: 'Tempo Profundo',
        stratum: 'bathypelagic',
        year: 2024,
        materials: 'Fratura concoidal de rocha magmática e erosão por fluxo laminar',
        description: 'A resistência final da matéria sólida contra a dissolução química em águas anóxicas profundas.',
        depthMeters: 2300,
        imageSrc: '/gigantera/works/tempo-geologico-basalto.svg',
        imageAlt: 'Fraturas angulares em rocha vulcânica preenchidas por micro-sedimentos refratados'
      },
      {
        id: 'materia-barionica-inerte',
        title: 'Matéria Bariônica Inerte',
        series: 'Tempo Profundo',
        stratum: 'bathypelagic',
        year: 2026,
        materials: 'Cálculo de meia-vida isotópica de carbonatos em repouso barométrico',
        description: 'O estágio no qual qualquer vestígio de turbulência cessa. O silêncio geológico como condição final da escultura.',
        depthMeters: 3800,
        imageSrc: '/gigantera/works/materia-barionica-inerte.svg',
        imageAlt: 'Composição de alta densidade mineral com textura granular fina e contraste abissal'
      }
    ]
  }
];
