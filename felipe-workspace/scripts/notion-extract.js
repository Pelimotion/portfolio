/**
 * NOTION WORKSPACE EXTRACTOR
 * Fase 1: Discovery — mapeia toda a conta Notion via API oficial.
 *
 * Extrai recursivamente:
 * - Databases (schemas, propriedades, tipos, fórmulas, relações)
 * - Pages (hierarquia, títulos, parent)
 * - Relações entre databases
 *
 * Output: notion_architecture.json
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const RATE_LIMIT_MS = 350; // Notion rate limit: ~3 req/s
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─── State ──────────────────────────────────────────────────────────────────
const architecture = {
  extracted_at: new Date().toISOString(),
  summary: { databases: 0, pages: 0, relations: 0 },
  databases: {},    // id → { title, parent, properties, relation_targets }
  pages: {},        // id → { title, parent, type, children_ids }
  relations: [],    // { from_db, from_prop, to_db, type }
  hierarchy: {},    // tree structure
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractTitle(obj) {
  // Database title
  if (obj.title && Array.isArray(obj.title)) {
    return obj.title.map(t => t.plain_text).join('') || '(sem título)';
  }
  // Page title — look in properties
  if (obj.properties) {
    for (const [key, prop] of Object.entries(obj.properties)) {
      if (prop.type === 'title' && prop.title) {
        return prop.title.map(t => t.plain_text).join('') || '(sem título)';
      }
    }
  }
  return '(sem título)';
}

function extractParent(obj) {
  if (!obj.parent) return { type: 'workspace', id: 'workspace' };
  if (obj.parent.type === 'workspace') return { type: 'workspace', id: 'workspace' };
  if (obj.parent.type === 'page_id') return { type: 'page', id: obj.parent.page_id };
  if (obj.parent.type === 'database_id') return { type: 'database', id: obj.parent.database_id };
  if (obj.parent.type === 'block_id') return { type: 'block', id: obj.parent.block_id };
  return { type: 'unknown', id: null };
}

function extractPropertySchema(prop) {
  const schema = {
    name: prop.name || prop.id,
    type: prop.type,
  };

  switch (prop.type) {
    case 'select':
      schema.options = (prop.select?.options || []).map(o => ({ name: o.name, color: o.color }));
      break;
    case 'multi_select':
      schema.options = (prop.multi_select?.options || []).map(o => ({ name: o.name, color: o.color }));
      break;
    case 'relation':
      schema.relation = {
        database_id: prop.relation?.database_id,
        type: prop.relation?.type || 'single_property',
        synced_property_name: prop.relation?.synced_property_name || null,
        synced_property_id: prop.relation?.synced_property_id || null,
      };
      break;
    case 'rollup':
      schema.rollup = {
        relation_property_name: prop.rollup?.relation_property_name,
        relation_property_id: prop.rollup?.relation_property_id,
        rollup_property_name: prop.rollup?.rollup_property_name,
        rollup_property_id: prop.rollup?.rollup_property_id,
        function: prop.rollup?.function,
      };
      break;
    case 'formula':
      schema.formula = {
        expression: prop.formula?.expression || null,
      };
      break;
    case 'number':
      schema.number = { format: prop.number?.format || 'number' };
      break;
    case 'status':
      schema.status = {
        options: (prop.status?.options || []).map(o => ({ name: o.name, color: o.color })),
        groups: (prop.status?.groups || []).map(g => ({
          name: g.name,
          color: g.color,
          option_ids: g.option_ids,
        })),
      };
      break;
    case 'date':
    case 'checkbox':
    case 'url':
    case 'email':
    case 'phone_number':
    case 'rich_text':
    case 'title':
    case 'people':
    case 'files':
    case 'created_time':
    case 'created_by':
    case 'last_edited_time':
    case 'last_edited_by':
      // Simple types — no extra config needed
      break;
    default:
      schema._raw_type_config = prop[prop.type] || null;
  }

  return schema;
}

// ─── API Fetchers ───────────────────────────────────────────────────────────

async function fetchAllDatabases() {
  console.log('📊 Buscando databases...');
  const databases = [];
  let cursor;
  let page = 0;

  do {
    await sleep(RATE_LIMIT_MS);
    const response = await notion.search({
      filter: { value: 'data_source', property: 'object' },
      start_cursor: cursor,
      page_size: 100,
    });
    databases.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
    page++;
    console.log(`   → Página ${page}: ${response.results.length} databases (total: ${databases.length})`);
  } while (cursor);

  return databases;
}

async function fetchAllPages() {
  console.log('📄 Buscando pages...');
  const pages = [];
  let cursor;
  let page = 0;

  do {
    await sleep(RATE_LIMIT_MS);
    const response = await notion.search({
      filter: { value: 'page', property: 'object' },
      start_cursor: cursor,
      page_size: 100,
    });
    pages.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
    page++;
    console.log(`   → Página ${page}: ${response.results.length} pages (total: ${pages.length})`);
  } while (cursor);

  return pages;
}

async function fetchDatabaseSchema(dbId) {
  await sleep(RATE_LIMIT_MS);
  try {
    return await notion.databases.retrieve({ database_id: dbId });
  } catch (err) {
    console.warn(`   ⚠️ Não consegui ler schema de ${dbId}: ${err.message}`);
    return null;
  }
}

// ─── Processors ─────────────────────────────────────────────────────────────

function processDatabase(db) {
  const title = extractTitle(db);
  const parent = extractParent(db);
  const properties = {};
  const relationTargets = [];

  for (const [propName, prop] of Object.entries(db.properties || {})) {
    properties[propName] = extractPropertySchema(prop);

    // Track relations
    if (prop.type === 'relation' && prop.relation?.database_id) {
      relationTargets.push({
        from_db: db.id,
        from_db_title: title,
        from_prop: propName,
        to_db: prop.relation.database_id,
        type: prop.relation.type || 'single_property',
      });
    }
  }

  return {
    id: db.id,
    title,
    parent,
    icon: db.icon?.type === 'emoji' ? db.icon.emoji : (db.icon?.type || null),
    created_time: db.created_time,
    last_edited_time: db.last_edited_time,
    url: db.url,
    is_inline: db.is_inline || false,
    property_count: Object.keys(properties).length,
    properties,
    relation_targets: relationTargets,
  };
}

function processPage(pg) {
  const title = extractTitle(pg);
  const parent = extractParent(pg);

  return {
    id: pg.id,
    title,
    parent,
    icon: pg.icon?.type === 'emoji' ? pg.icon.emoji : (pg.icon?.type || null),
    created_time: pg.created_time,
    last_edited_time: pg.last_edited_time,
    url: pg.url,
  };
}

// ─── Hierarchy Builder ──────────────────────────────────────────────────────

function buildHierarchy() {
  const tree = { workspace: { children: [] } };

  // Add all databases and pages as nodes
  const allNodes = {};

  for (const [id, db] of Object.entries(architecture.databases)) {
    allNodes[id] = { id, title: db.title, type: 'database', icon: db.icon, children: [] };
  }
  for (const [id, pg] of Object.entries(architecture.pages)) {
    allNodes[id] = { id, title: pg.title, type: 'page', icon: pg.icon, children: [] };
  }

  // Build parent→child relationships
  const allItems = [
    ...Object.values(architecture.databases),
    ...Object.values(architecture.pages),
  ];

  for (const item of allItems) {
    const node = allNodes[item.id];
    if (!node) continue;

    if (item.parent.type === 'workspace') {
      tree.workspace.children.push(node);
    } else if (item.parent.id && allNodes[item.parent.id]) {
      allNodes[item.parent.id].children.push(node);
    } else {
      // Parent exists but wasn't shared with integration — attach to workspace
      tree.workspace.children.push(node);
    }
  }

  return tree;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  NOTION WORKSPACE EXTRACTOR — Fase 1: Discovery');
  console.log('═══════════════════════════════════════════════════\n');

  // 1. Fetch all databases
  const rawDatabases = await fetchAllDatabases();
  console.log(`\n✅ Total de databases encontrados: ${rawDatabases.length}\n`);

  // 2. Fetch full schemas (search sometimes returns incomplete props)
  console.log('🔍 Enriquecendo schemas...');
  for (let i = 0; i < rawDatabases.length; i++) {
    const db = rawDatabases[i];
    const fullDb = await fetchDatabaseSchema(db.id);
    const enriched = fullDb || db;
    const processed = processDatabase(enriched);
    architecture.databases[processed.id] = processed;

    // Collect relations
    architecture.relations.push(...processed.relation_targets);

    if ((i + 1) % 10 === 0 || i === rawDatabases.length - 1) {
      console.log(`   → Schemas processados: ${i + 1}/${rawDatabases.length}`);
    }
  }

  // 3. Fetch all pages
  const rawPages = await fetchAllPages();
  console.log(`\n✅ Total de pages encontrados: ${rawPages.length}\n`);

  for (const pg of rawPages) {
    const processed = processPage(pg);
    architecture.pages[processed.id] = processed;
  }

  // 4. Resolve relation target titles
  console.log('🔗 Resolvendo relações...');
  for (const rel of architecture.relations) {
    const targetDb = architecture.databases[rel.to_db];
    rel.to_db_title = targetDb ? targetDb.title : '(database não compartilhado)';
  }

  // 5. Build hierarchy
  console.log('🌳 Construindo hierarquia...');
  architecture.hierarchy = buildHierarchy();

  // 6. Summary
  architecture.summary = {
    databases: Object.keys(architecture.databases).length,
    pages: Object.keys(architecture.pages).length,
    relations: architecture.relations.length,
    top_level_items: architecture.hierarchy.workspace.children.length,
  };

  // 7. Save
  const outputPath = path.resolve(__dirname, '../notion_architecture.json');
  fs.writeFileSync(outputPath, JSON.stringify(architecture, null, 2), 'utf-8');

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  📊 RESULTADO DA EXTRAÇÃO');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Databases:  ${architecture.summary.databases}`);
  console.log(`  Pages:      ${architecture.summary.pages}`);
  console.log(`  Relações:   ${architecture.summary.relations}`);
  console.log(`  Top-level:  ${architecture.summary.top_level_items}`);
  console.log(`\n  ✅ Salvo em: ${outputPath}`);
  console.log('═══════════════════════════════════════════════════\n');

  // 8. Print relation map for quick review
  if (architecture.relations.length > 0) {
    console.log('🔗 MAPA DE RELAÇÕES:');
    console.log('─────────────────────────────────────────────────');
    for (const rel of architecture.relations) {
      console.log(`  ${rel.from_db_title} → [${rel.from_prop}] → ${rel.to_db_title}`);
    }
    console.log('');
  }

  // 9. Print top-level databases
  console.log('📊 DATABASES ENCONTRADOS:');
  console.log('─────────────────────────────────────────────────');
  const dbs = Object.values(architecture.databases)
    .sort((a, b) => a.title.localeCompare(b.title));
  for (const db of dbs) {
    const props = Object.keys(db.properties).length;
    const rels = db.relation_targets.length;
    console.log(`  ${db.icon || '📁'} ${db.title} — ${props} props, ${rels} relações`);
  }
}

main().catch(err => {
  console.error('❌ Erro fatal:', err.message);
  console.error(err.stack);
  process.exit(1);
});
