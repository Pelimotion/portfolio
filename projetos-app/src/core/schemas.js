// ============================================
// CORE SCHEMAS — Config-driven architecture
// Schemas reutilizáveis para toda a plataforma
// NÃO hardcode propriedades individuais
// ============================================

// ID fixo do Hub raiz de projetos
export const ROOT_HUB_ID = '00000000-0000-0000-0000-000000000000';


// Schema de propriedades padrão para PROJETOS
export const PROJECT_PROPERTY_SCHEMA = [
  {
    name: 'Status',
    property_type: 'status',
    position: 0,
    config: {
      options: [
        { id: 'briefing',  label: 'Briefing',   color: 'blue' },
        { id: 'producao',  label: 'Produção',    color: 'yellow' },
        { id: 'revisao',   label: 'Revisão',     color: 'purple' },
        { id: 'entregue',  label: 'Entregue',    color: 'green' },
        { id: 'arquivado', label: 'Arquivado',   color: 'gray' },
      ],
    },
  },
  {
    name: 'Cliente',
    property_type: 'text',
    position: 1,
    config: {},
  },
  {
    name: 'Prioridade',
    property_type: 'select',
    position: 2,
    config: {
      options: [
        { id: 'urgent', label: '🔴 Urgente', color: 'red' },
        { id: 'high',   label: '🟠 Alta',    color: 'orange' },
        { id: 'medium', label: '🟡 Média',   color: 'yellow' },
        { id: 'low',    label: '🟢 Baixa',   color: 'green' },
      ],
    },
  },
  {
    name: 'Deadline',
    property_type: 'date',
    position: 3,
    config: {},
  },
  {
    name: 'Drive',
    property_type: 'url',
    position: 4,
    config: {},
  },
];

// Schema de propriedades padrão para CENAS / pipeline cinematográfico
export const SCENE_PROPERTY_SCHEMA = [
  {
    name: 'Status',
    property_type: 'status',
    position: 0,
    config: {
      options: [
        { id: 'backlog',       label: 'Backlog',        color: 'gray' },
        { id: 'ai_gen',        label: 'AI Generation',  color: 'cyan' },
        { id: 'selects',       label: 'Selects',        color: 'blue' },
        { id: 'motion',        label: 'Motion',         color: 'purple' },
        { id: 'compositing',   label: 'Compositing',    color: 'pink' },
        { id: 'render',        label: 'Render',         color: 'orange' },
        { id: 'revisao',       label: 'Revisão',        color: 'yellow' },
        { id: 'approved',      label: 'Approved',       color: 'green' },
      ],
    },
  },
  {
    name: 'Tipo',
    property_type: 'select',
    position: 1,
    config: {
      options: [
        { id: 'hero',        label: 'Hero Shot',      color: 'blue' },
        { id: 'detail',      label: 'Detalhe',        color: 'purple' },
        { id: 'packshot',    label: 'Packshot',       color: 'green' },
        { id: 'transition',  label: 'Transição',      color: 'yellow' },
        { id: 'audio',       label: 'Audio/Music',    color: 'orange' },
      ],
    },
  },
  {
    name: 'Responsável',
    property_type: 'people',
    position: 2,
    config: {},
  },
  {
    name: 'Prioridade',
    property_type: 'select',
    position: 3,
    config: {
      options: [
        { id: 'urgent', label: '🔴 Urgente', color: 'red' },
        { id: 'high',   label: '🟠 Alta',    color: 'orange' },
        { id: 'medium', label: '🟡 Média',   color: 'yellow' },
        { id: 'low',    label: '🟢 Baixa',   color: 'green' },
      ],
    },
  },
  {
    name: 'Feito',
    property_type: 'checkbox',
    position: 4,
    config: {},
  },
  {
    name: 'Entrega',
    property_type: 'date',
    position: 4,
    config: {},
  },
  {
    name: 'Render Link',
    property_type: 'url',
    position: 5,
    config: {},
  },
  {
    name: 'Referência',
    property_type: 'url',
    position: 6,
    config: { is_visible_default: false },
  },
];

// Views padrão por tipo de database
export const DEFAULT_VIEWS = {
  projects: [
    { name: 'Board', view_type: 'kanban', position: 0 },
    { name: 'Table', view_type: 'table',  position: 1 },
    { name: 'List',  view_type: 'list',   position: 2 },
  ],
  scenes: [
    { name: 'Pipeline', view_type: 'kanban',   position: 0 },
    { name: 'Table',    view_type: 'table',    position: 1 },
    { name: 'Calendar', view_type: 'calendar', position: 2 },
  ],
};
