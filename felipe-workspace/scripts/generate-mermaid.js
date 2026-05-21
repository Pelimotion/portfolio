/**
 * Gera diagrama Mermaid.js a partir do notion_architecture.json
 * Output: notion_architecture.md (com diagrama + análise)
 */
const fs = require('fs');
const path = require('path');

const data = require('../notion_architecture.json');

// ─── Domain classification ───────────────────────────────────────────────────
const PELIMOTION_DBS = [
  'Pipeline Pelimotion', 'Tasks Plm', 'Caixa Pelimotion', 'CRM',
  'Workflow', 'Cronograma', 'Produtos', 'Saídas', 'Entradas',
  'Relação produtoras BH', 'Relação Produtoras RJ', 'Relação produtoras SP',
  'NomedaEmpresa-Funcionrios-ReceitaR-ContatoPrincipal-WebsiteRedeSocial-Especialidades-LderComercialGestor',
  'Alto valor extraido perplexity',
];
const PERSONAL_DBS = ['Tasks', 'Investimento', 'Casa', 'Saúde', 'Projetos Pessoais'];
const SHARED_DBS = ['Saídas']; // the ☕ one with 12 props

function sanitizeName(name) {
  return name
    .replace(/[^a-zA-Z0-9À-ú\s_-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 40);
}

function getDomain(title) {
  if (PERSONAL_DBS.includes(title)) return 'personal';
  if (title === 'Saídas') return 'shared'; // both exist
  return 'pelimotion';
}

const dbs = Object.values(data.databases);
let nodeCount = {};

// Build unique node IDs (handle duplicates like 3x Workflow and 2x Saídas)
const nodeIds = {};
for (const db of dbs) {
  const key = sanitizeName(db.title);
  nodeCount[key] = (nodeCount[key] || 0) + 1;
  const idx = nodeCount[key];
  nodeIds[db.id] = idx > 1 ? `${key}_${idx}` : key;
}

// ─── Mermaid ERD ─────────────────────────────────────────────────────────────
let mermaid = `erDiagram\n`;

for (const db of dbs) {
  const nodeId = nodeIds[db.id];
  const props = Object.values(db.properties);
  if (props.length === 0) continue;

  mermaid += `\n    ${nodeId} {\n`;
  for (const p of props.slice(0, 15)) { // limit to 15 props for readability
    const safeName = p.name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^_+/, '').substring(0, 30) || 'field';
    mermaid += `        ${p.type} ${safeName}\n`;
  }
  if (props.length > 15) {
    mermaid += `        string _more_${props.length - 15}_props_\n`;
  }
  mermaid += `    }\n`;
}

// Relations
for (const rel of data.relations) {
  const fromId = nodeIds[rel.from_db];
  const toDbTitle = rel.to_db_title === '(database não compartilhado)' ? 'PROJETOS_PLM_missing' : sanitizeName(rel.to_db_title);
  if (fromId) {
    const safeProp = rel.from_prop.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 20);
    mermaid += `\n    ${fromId} }o--o{ ${toDbTitle} : "${safeProp}"\n`;
  }
}

// ─── Flowchart by domain ──────────────────────────────────────────────────────
let flowchart = `\n\n## Diagrama por Domínio\n\n\`\`\`mermaid\ngraph TB\n`;
flowchart += `    subgraph PLM["🎬 DOMÍNIO PELIMOTION"]\n`;
for (const db of dbs) {
  if (getDomain(db.title) === 'pelimotion') {
    const nodeId = nodeIds[db.id];
    const icon = db.icon || '📁';
    flowchart += `        ${nodeId}["${icon} ${db.title}\\n${Object.keys(db.properties).length} props"]\n`;
  }
}
flowchart += `    end\n\n`;

flowchart += `    subgraph PESSOAL["👤 DOMÍNIO PESSOAL"]\n`;
for (const db of dbs) {
  if (getDomain(db.title) === 'personal' || (db.title === 'Saídas' && Object.keys(db.properties).length > 2)) {
    const nodeId = nodeIds[db.id];
    const icon = db.icon || '📁';
    flowchart += `        ${nodeId}["${icon} ${db.title}\\n${Object.keys(db.properties).length} props"]\n`;
  }
}
flowchart += `    end\n\n`;

// Relations in flowchart
flowchart += `    %% Relações conhecidas\n`;
for (const rel of data.relations) {
  const fromId = nodeIds[rel.from_db];
  const toTitle = rel.to_db_title === '(database não compartilhado)' ? 'PROJETOS_PLM_MISSING' : sanitizeName(rel.to_db_title);
  if (fromId) {
    flowchart += `    ${fromId} -->|"${rel.from_prop}"| ${toTitle}\n`;
  }
}

flowchart += `\n    PROJETOS_PLM_MISSING(["⚠️ Projetos PLM\\nnão acessível"])\n`;
flowchart += `\`\`\`\n`;

// ─── Full markdown output ─────────────────────────────────────────────────────
const md = `# Notion Workspace Architecture
> Extraído em: ${data.extracted_at}

## Resumo
| Métrica | Valor |
|---------|-------|
| Databases | ${data.summary.databases} |
| Pages | ${data.summary.pages} |
| Relações mapeadas | ${data.summary.relations} |

## ⚠️ Database Crítico Não Acessível
O database **"Projetos PLM"** (ID: \`3e5c9ec2-779e-4211-a627-813df3778a92\`) aparece em 3 relações mas não está compartilhado com a integração. É o **núcleo do sistema de projetos** — conectar este database é prioritário antes da migração.

---

## Diagrama de Entidades (ERD)

\`\`\`mermaid
${mermaid}\`\`\`
${flowchart}

---

## Databases por Domínio

### 🎬 Pelimotion (Empresa/B2B)
| Database | Props | Função |
|----------|-------|--------|
| Pipeline Pelimotion | 22 | Core de projetos/pipeline comercial |
| Tasks Plm | 8 | Tarefas de produção (relação com Projetos) |
| Caixa Pelimotion | 5 | Fluxo de caixa empresarial |
| CRM | 14 | Relacionamento com clientes (prospects/ativos) |
| Workflow (×3) | 11 | Fluxo de produção — **3 duplicatas a consolidar** |
| Cronograma | 6 | Cronograma de etapas por projeto |
| Produtos | 4 | Catálogo de serviços/produtos |
| Saídas (simples) | 2 | Registro simples de saídas (legado?) |
| Entradas | 2 | Registro simples de entradas (legado?) |
| Relação Produtoras BH/RJ/SP | 9–23 | Diretórios de fornecedores por cidade |
| Empresas (nome longo) | 7 | Lista de empresas prospects |
| Alto valor Perplexity | 10 | Leads extraídos via IA |

### 👤 Pessoal
| Database | Props | Função |
|----------|-------|--------|
| Tasks | 7 | Tarefas pessoais |
| Saídas (☕) | 12 | Controle de gastos pessoais (fórmulas avançadas) |
| Investimento | 6 | Controle de investimentos |
| Casa | 7 | Lista de necessidades/melhorias domésticas |
| Saúde | 7 | Diário de saúde (sintomas, tratamentos) |
| Projetos Pessoais | 4 | Projetos pessoais em andamento |
`;

const outputPath = path.resolve(__dirname, '../notion_architecture.md');
fs.writeFileSync(outputPath, md, 'utf-8');
console.log('✅ Diagrama gerado em:', outputPath);
