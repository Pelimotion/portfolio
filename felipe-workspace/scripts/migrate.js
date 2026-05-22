/**
 * FASE 9 — MIGRAÇÃO NOTION → SUPABASE
 *
 * Uso:
 *   node scripts/migrate.js           → migra tudo
 *   node scripts/migrate.js --dry-run → mostra o que seria migrado (sem gravar)
 *   node scripts/migrate.js crm       → migra só a seção especificada
 *
 * Seções disponíveis:
 *   crm | suppliers | projects | stages | tasks-plm | expenses-plm |
 *   cash-flow | income | products | personal-tasks | personal-expenses |
 *   investments | home | health | personal-projects
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Client } = require('@notionhq/client');
const { createClient } = require('@supabase/supabase-js');

// ─── Clientes ────────────────────────────────────────────────────────────────

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role ignora RLS
);

const DRY_RUN = process.argv.includes('--dry-run');
const ONLY_SECTION = process.argv.find(a => !a.startsWith('--') && a !== process.argv[0] && a !== process.argv[1]);
const RATE_MS = 350; // Notion: ~3 req/s
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Notion DB IDs ───────────────────────────────────────────────────────────

const DB = {
  // pelimotion
  PIPELINE:       '95479a5a-891c-46be-a95f-057a0b727a1c',
  CRONOGRAMA:     '23401aae-692b-8164-bfac-000b3fa11603',
  TASKS_PLM:      '8ae038a8-0279-4c5d-b9a9-973d793ec34e',
  SAIDAS_PLM:     'a9160e4a-f73d-4c87-b39a-c76d47c25e4a',
  CAIXA:          '7db0f506-db87-45aa-839e-d6d15c84623f',
  ENTRADAS:       '35201aae-692b-81c5-9a9a-000bce7c200e',
  PRODUTOS:       'd0185ee1-2360-49ee-b99f-8db388b8af16',
  CRM:            '20d01aae-692b-807e-8fb3-000b64a89f9d',
  PRODUTORAS_RJ:  '1fc01aae-692b-8150-9bf6-000b38e5eeda',
  PRODUTORAS_BH:  '1fc01aae-692b-819c-aa8c-000b5b097c85',
  PRODUTORAS_SP:  '1fc01aae-692b-8104-999b-000be02fe6ad',
  // personal
  TASKS_PESSOAL:  '26201aae-692b-80af-a36a-000b3a70e58f',
  SAIDAS_PESSOAL: '35201aae-692b-8020-b661-000b1e9cbbcd',
  INVESTIMENTO:   '2e001aae-692b-81b0-8cbd-000bfec44b82',
  CASA:           '2fe01aae-692b-8045-8e53-000b5f8099be',
  SAUDE:          '2ef01aae-692b-80e7-a87b-000bce1997bd',
  PROJ_PESSOAL:   'cedb2b50-0670-444c-8bc0-919aad69d485',
};

// ─── Extratores de propriedades Notion ──────────────────────────────────────

const p = {
  text: (props, key) => {
    const prop = props[key];
    if (!prop) return null;
    if (prop.type === 'title')      return prop.title?.map(t => t.plain_text).join('') || null;
    if (prop.type === 'rich_text')  return prop.rich_text?.map(t => t.plain_text).join('') || null;
    return null;
  },
  number: (props, key) => props[key]?.number ?? null,
  checkbox: (props, key) => props[key]?.checkbox ?? false,
  select: (props, key) => props[key]?.select?.name ?? null,
  multiSelect: (props, key) => (props[key]?.multi_select ?? []).map(o => o.name),
  date: (props, key) => props[key]?.date?.start ?? null,
  url: (props, key) => props[key]?.url ?? null,
  phone: (props, key) => props[key]?.phone_number ?? null,
  status: (props, key) => props[key]?.status?.name ?? null,
  // relation: retorna array de IDs Notion
  relation: (props, key) => (props[key]?.relation ?? []).map(r => r.id),
};

// ─── Queries Notion ──────────────────────────────────────────────────────────

async function queryAll(databaseId, filter = undefined) {
  const pages = [];
  let cursor;
  do {
    await sleep(RATE_MS);
    const res = await notion.dataSources.query({
      data_source_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
      filter,
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return pages;
}

// ─── Detecção de schema (notion_id existe?) ──────────────────────────────────

const schemaCache = {}; // 'schema.table' → { hasNotionId: bool }

async function detectNotionId(schema, table) {
  const key = `${schema}.${table}`;
  if (schemaCache[key] !== undefined) return schemaCache[key];
  const { error } = await supabase
    .schema(schema)
    .from(table)
    .select('notion_id')
    .limit(1);
  const has = !error || !error.message.includes('does not exist');
  schemaCache[key] = has;
  if (!has) {
    console.log(`  ℹ️  ${key}: coluna notion_id ausente — usando INSERT (idempotência limitada)`);
    console.log(`     → Para habilitar upsert: rode supabase/migrations/004_add_notion_ids.sql`);
  }
  return has;
}

// ─── Upsert Supabase ─────────────────────────────────────────────────────────

async function upsert(schema, table, rows, conflictCol = 'notion_id') {
  if (rows.length === 0) return { count: 0, errors: 0 };
  if (DRY_RUN) {
    console.log(`  [dry-run] ${schema}.${table}: ${rows.length} linhas`);
    if (rows.length > 0) console.log('  ex:', JSON.stringify(rows[0]).slice(0, 200));
    return { count: rows.length, errors: 0 };
  }

  const hasNotionId = await detectNotionId(schema, table);

  let errors = 0;
  // Lotes de 50 para evitar payload grande
  for (let i = 0; i < rows.length; i += 50) {
    let batch = rows.slice(i, i + 50);
    let result;

    if (hasNotionId) {
      // Upsert idempotente via notion_id
      result = await supabase
        .schema(schema)
        .from(table)
        .upsert(batch, { onConflict: conflictCol, ignoreDuplicates: false });
    } else {
      // notion_id não existe: strip do campo e faz INSERT ignorando duplicatas de PK
      batch = batch.map(({ notion_id, ...rest }) => rest);
      result = await supabase
        .schema(schema)
        .from(table)
        .insert(batch);
    }

    if (result.error) {
      console.error(`  ⚠️ Erro em ${schema}.${table} (lote ${i / 50 + 1}):`, result.error.message);
      errors++;
    }
  }
  return { count: rows.length, errors };
}

// ─── Normalizadores de enum ──────────────────────────────────────────────────

const STAGE_MAP = {
  'Negociação': 'negociacao', 'Negociacao': 'negociacao',
  'Briefing':   'briefing',
  'Debriefing': 'debriefing',
  'Roteiro':    'roteiro',
  'Storyboard': 'storyboard',
  'Montagem':   'montagem',
  'Criação':    'criacao',   'Criacao': 'criacao',
  'Animação':   'animacao',  'Animacao': 'animacao',
  'Aprovação 1':'aprovacao_1',
  'Alteração':  'alteracao',
  'Finalização':'finalizacao',
  'Espera':     'espera',
  'Concluído':  'concluido', 'Concluido': 'concluido',
  'Fixo':       'fixo',
  'Pagamento':  'pagamento',
};

const CRM_STATUS_MAP = {
  'Não Iniciada': 'nao_iniciada', 'Nao Iniciada': 'nao_iniciada',
  'Prospecção':   'prospeccao',   'Prospeccao': 'prospeccao',
  'Follow-up 1':  'follow_up_1',
  'Follow-up 2':  'follow_up_2',
  'Follow-up 3':  'follow_up_3',
  'Proposta Enviada': 'proposta_enviada',
  'Relacionamento':   'relacionamento',
  'Concluído':        'concluido', 'Concluido': 'concluido',
};

const LEAD_TEMP_MAP = {
  'Frio': 'frio', 'Morno': 'morno', 'Quente': 'quente',
  'frio': 'frio', 'morno': 'morno', 'quente': 'quente',
};

const SECTOR_MAP = {
  'Entreterimento': 'entretenimento', 'Entretenimento': 'entretenimento',
  'Produtora': 'produtora',
  'Jornal': 'jornal',
  'Tech': 'tech',
  'Agencia': 'agencia', 'Agência': 'agencia',
  'Imobiliario': 'imobiliario', 'Imobiliário': 'imobiliario',
  'Outro': 'outro',
};

const PAYMENT_MAP = {
  'Débito C6': 'debito_c6',
  'Crédito C6': 'credito_c6',
  'Crédito Mercado Pago': 'credito_mercado_pago',
  'Débito Mercado Pago': 'debito_mercado_pago',
  'Débito Viacredi': 'debito_viacredi',
  'Pix': 'pix',
  'Dinheiro': 'dinheiro',
  'Transferência': 'transferencia',
};

const EXPENSE_TYPE_MAP = {
  'Pessoal Variavel': 'pessoal_variavel', 'Pessoal Variável': 'pessoal_variavel',
  'Pessoal Fixo': 'pessoal_fixo',
  'Pelimotion Projeto': 'pelimotion_projeto',
  'Pelimotion Fixo': 'pelimotion_fixo',
};

const TASK_AREA_MAP = {
  'Casa': 'casa', 'Rua': 'rua', 'PC': 'pc',
  'Comprar': 'comprar', 'Compromisso': 'compromisso',
};

const HEALTH_TYPE_MAP = {
  'Diário': 'diario',   'Diario': 'diario',
  'Condição': 'condicao', 'Condicao': 'condicao',
  'Médico': 'medico',   'Medico': 'medico',
  'Tarefa': 'tarefa',
};

const HEALTH_STATUS_MAP = {
  'Investigando': 'investigando',
  'Em Tratamento': 'em_tratamento',
  'Pendente': 'pendente',
  'Concluido': 'concluido', 'Concluído': 'concluido',
  'Acompanhando': 'acompanhando',
};

const HEALTH_SPHERE_MAP = {
  'Corpo': 'corpo', 'Mente': 'mente', 'Geral': 'geral',
};

const HOME_PRIORITY_MAP = {
  '1 - Máxima': 'maxima', '1 - Maxima': 'maxima',
  '2 - Alta': 'alta',
  '3 - Média': 'media', '3 - Media': 'media',
  '4 - Baixa': 'baixa',
};

const HOME_SPHERE_MAP = {
  'Geral': 'geral', 'Banheiro': 'banheiro', 'Cozinha': 'cozinha',
  'Lavanderia': 'lavanderia', 'Quarto': 'quarto',
  'Entrada': 'entrada', 'Sala': 'sala', 'Ferramenta': 'ferramenta',
};

const PERSONAL_PROJECT_STATUS_MAP = {
  'Planejando': 'planejando', 'Pausado': 'pausado',
  'Executando': 'executando', 'Arquivado': 'arquivado',
};

const INVEST_AREA_MAP = {
  'Mercado': 'mercado', 'Casa': 'casa', 'Internet': 'internet',
  'Carro': 'carro', 'Pelimotion': 'pelimotion',
};

function mapEnum(map, value, fallback = null) {
  if (!value) return fallback;
  return map[value] ?? fallback;
}

// ─── SEÇÕES DE MIGRAÇÃO ──────────────────────────────────────────────────────

// Armazena notion_id → supabase_uuid para links entre tabelas
const notionToSupabase = { projects: {} };

// Após migrar projetos, popula notionToSupabase.projects
async function loadProjectMap() {
  const { data } = await supabase
    .schema('pelimotion')
    .from('projects')
    .select('id, notion_id')
    .not('notion_id', 'is', null);
  for (const row of data ?? []) {
    notionToSupabase.projects[row.notion_id] = row.id;
  }
  console.log(`  → ${Object.keys(notionToSupabase.projects).length} projetos carregados para linkagem`);
}

// ── 1. CRM ────────────────────────────────────────────────────────────────────
async function migrateCrm() {
  console.log('\n📋 CRM → pelimotion.crm_contacts');
  const pages = await queryAll(DB.CRM);
  console.log(`  ${pages.length} registros encontrados`);

  const rows = pages.map(pg => {
    const props = pg.properties;
    return {
      notion_id:    pg.id,
      name:         p.text(props, 'Nome') || '(sem nome)',
      role_title:   p.text(props, 'Decisor 1'),
      role_title_2: p.text(props, 'Decisor 2'),
      phone_1:      p.phone(props, 'Cel 1'),
      phone_2:      p.phone(props, 'Cel 2'),
      contact_url_1: p.url(props, 'Ctt 1'),
      contact_url_2: p.url(props, 'Ctt 2'),
      website:      p.url(props, 'Link empresa'),
      sector:       mapEnum(SECTOR_MAP, p.status(props, 'Setor/nicho') ?? p.select(props, 'Setor/nicho')),
      revenue_brl:  p.number(props, 'Faturamento'),
      main_events:  p.text(props, 'Principais Eventos'),
      main_info:    p.text(props, 'Principais Infos'),
      crm_status:   mapEnum(CRM_STATUS_MAP, p.status(props, 'Status'), 'nao_iniciada'),
      lead_temp:    mapEnum(LEAD_TEMP_MAP, p.status(props, 'Procedência'), 'frio'),
    };
  });

  return upsert('pelimotion', 'crm_contacts', rows);
}

// ── 2. Suppliers ──────────────────────────────────────────────────────────────
async function migrateSuppliers() {
  console.log('\n🏭 Produtoras → pelimotion.suppliers');
  const allPages = [];

  for (const [dbKey, state] of [['PRODUTORAS_RJ', 'RJ'], ['PRODUTORAS_BH', 'BH'], ['PRODUTORAS_SP', 'SP']]) {
    await sleep(RATE_MS);
    const pages = await queryAll(DB[dbKey]);
    console.log(`  ${state}: ${pages.length} registros`);
    allPages.push(...pages.map(pg => ({ pg, state })));
  }

  const rows = allPages.map(({ pg, state }) => {
    const props = pg.properties;
    // Os campos variam por DB (nomes com espaço, sem acento, etc.) — tenta vários
    const nome = p.text(props, 'Nome') || p.text(props, ' Nome') || p.text(props, 'ID') || '(sem nome)';
    const bairro = p.text(props, 'Bairro') || p.text(props, ' Bairro');
    const cidade = p.multiSelect(props, ' Cidade').join(', ') || p.text(props, ' Cidade') || p.text(props, 'Cidade');
    const endereco = p.text(props, 'Endereco') || p.text(props, ' Endereco') || p.text(props, ' Endereço');
    const telefone = p.text(props, 'Telefone') || p.text(props, ' Telefone');
    const site = p.text(props, 'Site') || p.text(props, ' Site');
    const notaRaw = p.text(props, 'Nota') || p.select(props, ' Nota');
    const votosRaw = p.text(props, 'Votos') || p.text(props, ' Votos');

    const rating = notaRaw ? parseFloat(notaRaw.replace(',', '.')) || null : null;
    const votes = votosRaw ? parseInt(votosRaw.replace(/[^0-9]/g, '')) || null : null;

    return {
      notion_id:    pg.id,
      name:         nome,
      city:         cidade || null,
      state,
      neighborhood: bairro || null,
      address:      endereco || null,
      phone:        telefone || null,
      website:      site || null,
      rating:       rating,
      votes:        votes,
    };
  });

  return upsert('pelimotion', 'suppliers', rows);
}

// ── 3. Projects ───────────────────────────────────────────────────────────────
async function migrateProjects() {
  console.log('\n📦 Pipeline Pelimotion → pelimotion.projects');
  const pages = await queryAll(DB.PIPELINE);
  console.log(`  ${pages.length} registros encontrados`);

  const rows = pages.map(pg => {
    const props = pg.properties;
    const stageRaw = p.select(props, 'Etapa');
    return {
      notion_id:          pg.id,
      name:               p.text(props, 'Name') || '(sem nome)',
      client:             p.select(props, 'Cliente'),
      stage:              mapEnum(STAGE_MAP, stageRaw, 'negociacao'),
      total_value:        p.number(props, 'Valor Total'),
      cost_value:         p.number(props, 'Valor Custo'),
      cost_paid:          p.number(props, 'Custo Pago'),
      received_value:     p.number(props, 'Valor Recebido'),
      next_payment_value: p.number(props, 'Prox. Valor'),
      is_delivered:       p.checkbox(props, 'Entregue'),
      is_paid:            p.checkbox(props, 'Pago'),
      next_delivery_at:   p.date(props, 'Próxima Entrega'),
      next_payment_at:    p.date(props, 'Prox. Pgto'),
      closed_at:          p.date(props, 'Encerramento'),
      suppliers:          p.multiSelect(props, 'Fornecedores'),
    };
  });

  const result = await upsert('pelimotion', 'projects', rows);
  // Recarrega o mapa para seções dependentes
  if (!DRY_RUN) await loadProjectMap();
  return result;
}

// ── 4. Project Stages (Cronograma) ────────────────────────────────────────────
async function migrateStages() {
  console.log('\n📅 Cronograma → pelimotion.project_stages');
  if (!DRY_RUN) await loadProjectMap();
  const pages = await queryAll(DB.CRONOGRAMA);
  console.log(`  ${pages.length} registros encontrados`);

  const rows = pages.flatMap(pg => {
    const props = pg.properties;
    const name = p.text(props, 'Nome da Tarefa') || '(sem nome)';
    const dateStart = p.date(props, 'Data');
    if (!dateStart) return []; // date é required no schema

    // Notion date pode ser range; se não, usa a mesma data para início e fim
    const dateEnd = pg.properties['Data']?.date?.end ?? dateStart;

    const stageRaw = p.select(props, 'Status');
    // Tenta linkar ao projeto via parent (Cronograma é inline em páginas de projeto)
    const parentId = pg.parent?.page_id ?? null;
    const projectId = parentId ? notionToSupabase.projects[parentId] : null;

    return [{
      notion_id:              pg.id,
      project_id:             projectId,
      name,
      stage_type:             mapEnum(STAGE_MAP, stageRaw),
      description_for_client: p.text(props, 'Descrição para Cliente'),
      start_date:             dateStart,
      end_date:               dateEnd,
      estimate_days:          p.number(props, 'Estimativa (dias)'),
      is_done:                p.checkbox(props, 'Concluído'),
      sort_order:             0,
    }];
  });

  return upsert('pelimotion', 'project_stages', rows);
}

// ── 5. Tasks PLM ──────────────────────────────────────────────────────────────
async function migrateTasksPlm() {
  console.log('\n✅ Tasks Plm → pelimotion.tasks');
  if (!DRY_RUN) await loadProjectMap();
  const pages = await queryAll(DB.TASKS_PLM);
  console.log(`  ${pages.length} registros encontrados`);

  const AREA_MAP_PLM = { 'Casa': 'casa', 'Rua': 'rua', 'PC': 'pc', 'Comprar': 'comprar' };

  const rows = pages.map(pg => {
    const props = pg.properties;
    const relProjectIds = p.relation(props, 'Projetos PLM 1');
    const projectId = relProjectIds.length > 0 ? notionToSupabase.projects[relProjectIds[0]] : null;
    const areaStatus = p.status(props, 'Area');

    return {
      notion_id:  pg.id,
      name:       p.text(props, 'Nome') || '(sem nome)',
      project_id: projectId,
      area:       mapEnum(AREA_MAP_PLM, areaStatus),
      task_date:  p.date(props, 'Data'),
      is_done:    p.checkbox(props, 'Feito'),
      status:     p.checkbox(props, 'Feito') ? 'concluido' : 'nao_iniciada',
    };
  });

  return upsert('pelimotion', 'tasks', rows);
}

// ── 6. Project Expenses (Saídas PLM) ─────────────────────────────────────────
async function migrateExpensesPlm() {
  console.log('\n💸 Saídas PLM → pelimotion.project_expenses');
  if (!DRY_RUN) await loadProjectMap();
  const pages = await queryAll(DB.SAIDAS_PLM);
  console.log(`  ${pages.length} registros encontrados`);

  const rows = pages.map(pg => {
    const props = pg.properties;
    const relProjectIds = p.relation(props, 'Projetos PLM');
    const projectId = relProjectIds.length > 0 ? notionToSupabase.projects[relProjectIds[0]] : null;
    return {
      notion_id:    pg.id,
      name:         p.text(props, 'Name') || '(sem nome)',
      project_id:   projectId,
      value:        p.number(props, 'Valor') ?? 0,
      is_paid:      p.checkbox(props, 'Pago'),
      expense_date: p.date(props, 'Data Competência'),
    };
  });

  return upsert('pelimotion', 'project_expenses', rows);
}

// ── 7. Cash Flow (Caixa Pelimotion) ──────────────────────────────────────────
async function migrateCashFlow() {
  console.log('\n💰 Caixa Pelimotion → pelimotion.cash_flow');
  if (!DRY_RUN) await loadProjectMap();
  const pages = await queryAll(DB.CAIXA);
  console.log(`  ${pages.length} registros encontrados`);

  const AREA_CASH_MAP = {
    'Contabilidade': 'contabilidade', 'Tributo': 'tributo',
    'Escritório': 'escritorio', 'Escritorio': 'escritorio',
    'Workstation': 'workstation', 'Clientes': 'clientes',
  };

  const rows = pages.map(pg => {
    const props = pg.properties;
    const relProjectIds = p.relation(props, 'Projeto');
    const projectId = relProjectIds.length > 0 ? notionToSupabase.projects[relProjectIds[0]] : null;
    const areas = p.multiSelect(props, 'Área')
      .map(a => AREA_CASH_MAP[a])
      .filter(Boolean);

    return {
      notion_id:  pg.id,
      name:       p.text(props, 'Name') || '(sem nome)',
      project_id: projectId,
      areas:      areas.length > 0 ? areas : null,
      due_date:   p.date(props, 'Vencimento'),
    };
  });

  return upsert('pelimotion', 'cash_flow', rows);
}

// ── 8. Income Entries (Entradas simples) ─────────────────────────────────────
async function migrateIncome() {
  console.log('\n📈 Entradas → pelimotion.income_entries');
  const pages = await queryAll(DB.ENTRADAS);
  console.log(`  ${pages.length} registros encontrados`);

  const rows = pages.map(pg => ({
    notion_id: pg.id,
    name:      p.text(pg.properties, 'Nome') || '(sem nome)',
    value:     p.number(pg.properties, 'Valor') ?? 0,
  }));

  return upsert('pelimotion', 'income_entries', rows);
}

// ── 9. Products ───────────────────────────────────────────────────────────────
async function migrateProducts() {
  console.log('\n📦 Produtos → pelimotion.products');
  const pages = await queryAll(DB.PRODUTOS);
  console.log(`  ${pages.length} registros encontrados`);

  const rows = pages.map(pg => ({
    notion_id:    pg.id,
    name:         p.text(pg.properties, 'Name') || '(sem nome)',
    duration_sec: p.number(pg.properties, 'Duração'),
    complexity:   p.number(pg.properties, 'Complexidade'),
  }));

  return upsert('pelimotion', 'products', rows);
}

// ── 10. Personal Tasks ────────────────────────────────────────────────────────
async function migratePersonalTasks() {
  console.log('\n✅ Tasks pessoal → personal.tasks');
  const pages = await queryAll(DB.TASKS_PESSOAL);
  console.log(`  ${pages.length} registros encontrados`);

  const rows = pages.map(pg => {
    const props = pg.properties;
    const areaRaw = p.select(props, 'Area');
    return {
      notion_id: pg.id,
      name:      p.text(props, 'Nome') || '(sem nome)',
      description: p.text(props, 'Descrição'),
      area:      mapEnum(TASK_AREA_MAP, areaRaw),
      task_date: p.date(props, 'Data'),
      is_done:   p.checkbox(props, 'Feito'),
      status:    p.checkbox(props, 'Feito') ? 'concluido' : 'nao_iniciada',
    };
  });

  return upsert('personal', 'tasks', rows);
}

// ── 11. Personal Expenses (Saídas pessoal — simples) ─────────────────────────
async function migratePersonalExpenses() {
  console.log('\n💸 Saídas pessoal → personal.expenses');
  const pages = await queryAll(DB.SAIDAS_PESSOAL);
  console.log(`  ${pages.length} registros encontrados`);

  const rows = pages.map(pg => ({
    notion_id: pg.id,
    name:      p.text(pg.properties, 'Nome') || '(sem nome)',
    value:     p.number(pg.properties, 'Valor') ?? 0,
  }));

  return upsert('personal', 'expenses', rows);
}

// ── 12. Investments ───────────────────────────────────────────────────────────
async function migrateInvestments() {
  console.log('\n💼 Investimento → personal.investments');
  const pages = await queryAll(DB.INVESTIMENTO);
  console.log(`  ${pages.length} registros encontrados`);

  const rows = pages.map(pg => {
    const props = pg.properties;
    const areaRaw = p.status(props, 'Area');
    return {
      notion_id:   pg.id,
      name:        p.text(props, 'Nome') || '(sem nome)',
      description: p.text(props, 'Descrição'),
      area:        mapEnum(INVEST_AREA_MAP, areaRaw),
      price:       p.number(props, 'Preço'),
      invest_date: p.date(props, 'Data'),
      is_done:     p.checkbox(props, 'Feito'),
    };
  });

  return upsert('personal', 'investments', rows);
}

// ── 13. Home Items (Casa) ─────────────────────────────────────────────────────
async function migrateHome() {
  console.log('\n🏠 Casa → personal.home_items');
  const pages = await queryAll(DB.CASA);
  console.log(`  ${pages.length} registros encontrados`);

  const rows = pages.map(pg => {
    const props = pg.properties;
    const priorityRaw = p.select(props, 'Prioridade');
    const sphereRaw = p.select(props, 'Esfera');
    return {
      notion_id:       pg.id,
      name:            p.text(props, 'Nome (O que é isso?)') || '(sem nome)',
      sphere:          mapEnum(HOME_SPHERE_MAP, sphereRaw),
      priority:        mapEnum(HOME_PRIORITY_MAP, priorityRaw, 'media'),
      estimated_price: p.number(props, 'Preço Est. (ML/Saara)'),
      notes:           p.text(props, 'Anotações'),
      is_done:         p.checkbox(props, 'Status'),
    };
  });

  return upsert('personal', 'home_items', rows);
}

// ── 14. Health Log ────────────────────────────────────────────────────────────
async function migrateHealth() {
  console.log('\n🏥 Saúde → personal.health_log');
  const pages = await queryAll(DB.SAUDE);
  console.log(`  ${pages.length} registros encontrados`);

  const rows = pages.flatMap(pg => {
    const props = pg.properties;
    const logDate = p.date(props, 'Data');
    if (!logDate) return []; // log_date NOT NULL

    return [{
      notion_id:  pg.id,
      name:       p.text(props, 'Nome (O que é isso?)') || '(sem nome)',
      entry_type: mapEnum(HEALTH_TYPE_MAP, p.select(props, 'Tipo'), 'diario'),
      sphere:     mapEnum(HEALTH_SPHERE_MAP, p.select(props, 'Esfera'), 'geral'),
      status:     mapEnum(HEALTH_STATUS_MAP, p.select(props, 'Status'), 'investigando'),
      tags:       p.multiSelect(props, 'Tags'),
      notes:      p.text(props, 'Anotações'),
      log_date:   logDate,
    }];
  });

  return upsert('personal', 'health_log', rows);
}

// ── 15. Personal Projects ─────────────────────────────────────────────────────
async function migratePersonalProjects() {
  console.log('\n📁 Projetos Pessoais → personal.projects');
  const pages = await queryAll(DB.PROJ_PESSOAL);
  console.log(`  ${pages.length} registros encontrados`);

  const rows = pages.map(pg => {
    const props = pg.properties;
    const statusRaw = p.status(props, 'Status');
    return {
      notion_id:    pg.id,
      name:         p.text(props, 'Name') || '(sem nome)',
      status:       mapEnum(PERSONAL_PROJECT_STATUS_MAP, statusRaw, 'planejando'),
      total_value:  p.number(props, 'Valor Total'),
      project_date: p.date(props, 'Data'),
    };
  });

  return upsert('personal', 'projects', rows);
}

// ─── Orquestrador ────────────────────────────────────────────────────────────

const SECTIONS = {
  'crm':               migrateCrm,
  'suppliers':         migrateSuppliers,
  'projects':          migrateProjects,
  'stages':            migrateStages,
  'tasks-plm':         migrateTasksPlm,
  'expenses-plm':      migrateExpensesPlm,
  'cash-flow':         migrateCashFlow,
  'income':            migrateIncome,
  'products':          migrateProducts,
  'personal-tasks':    migratePersonalTasks,
  'personal-expenses': migratePersonalExpenses,
  'investments':       migrateInvestments,
  'home':              migrateHome,
  'health':            migrateHealth,
  'personal-projects': migratePersonalProjects,
};

// Ordem correta respeitando dependências (projects antes de stages/tasks/expenses)
const RUN_ORDER = [
  'crm', 'suppliers', 'projects', 'income', 'products',
  'stages', 'tasks-plm', 'expenses-plm', 'cash-flow',
  'personal-tasks', 'personal-expenses', 'investments',
  'home', 'health', 'personal-projects',
];

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  PELIMOTION OS — Fase 9: Migração Notion → Supabase');
  if (DRY_RUN) console.log('  ⚠️  DRY-RUN: nenhum dado será gravado');
  if (ONLY_SECTION) console.log(`  → Seção: ${ONLY_SECTION}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (!process.env.NOTION_TOKEN) {
    console.error('❌ NOTION_TOKEN não encontrado em .env');
    process.exit(1);
  }
  if (!DRY_RUN && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrado em .env');
    console.error('   Adicione ao .env: SUPABASE_SERVICE_ROLE_KEY=eyJ...');
    process.exit(1);
  }

  const toRun = ONLY_SECTION
    ? [ONLY_SECTION]
    : RUN_ORDER;

  const summary = [];
  for (const section of toRun) {
    const fn = SECTIONS[section];
    if (!fn) {
      console.error(`❌ Seção desconhecida: ${section}`);
      console.error('   Disponíveis:', Object.keys(SECTIONS).join(', '));
      process.exit(1);
    }
    try {
      const result = await fn();
      summary.push({ section, ...result });
    } catch (err) {
      console.error(`\n❌ Erro em [${section}]:`, err.message);
      summary.push({ section, count: 0, errors: 1, failed: true });
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RESUMO DA MIGRAÇÃO');
  console.log('═══════════════════════════════════════════════════════');
  let totalRows = 0, totalErrors = 0;
  for (const { section, count, errors, failed } of summary) {
    const icon = failed ? '❌' : errors > 0 ? '⚠️ ' : '✅';
    console.log(`  ${icon} ${section.padEnd(20)} ${count ?? 0} linhas, ${errors ?? 0} erros`);
    totalRows  += count ?? 0;
    totalErrors += errors ?? 0;
  }
  console.log('─────────────────────────────────────────────────────');
  console.log(`  Total: ${totalRows} linhas, ${totalErrors} erros`);
  if (DRY_RUN) console.log('\n  ⚠️  Dry-run — nenhum dado foi gravado');
  console.log('');
}

main().catch(err => {
  console.error('❌ Erro fatal:', err.message);
  console.error(err.stack);
  process.exit(1);
});
