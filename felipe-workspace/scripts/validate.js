/**
 * FASE 9 — VALIDAÇÃO PÓS-MIGRAÇÃO
 *
 * Uso:
 *   node scripts/validate.js
 *
 * Verifica:
 * - Contagem de linhas por tabela vs. esperado
 * - Linhas sem notion_id (não deveriam existir)
 * - Linhas com project_id = null nas tabelas dependentes
 * - Exemplos de dados para inspeção visual
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Counts esperados (baseados no dry-run da Fase 9)
const EXPECTED = [
  { schema: 'pelimotion', table: 'crm_contacts',     expected: 18  },
  { schema: 'pelimotion', table: 'suppliers',         expected: 269 },
  { schema: 'pelimotion', table: 'projects',          expected: 106 },
  { schema: 'pelimotion', table: 'income_entries',    expected: 3   },
  { schema: 'pelimotion', table: 'products',          expected: 9   },
  { schema: 'pelimotion', table: 'project_stages',    expected: 13  },
  { schema: 'pelimotion', table: 'tasks',             expected: 116 },
  { schema: 'pelimotion', table: 'project_expenses',  expected: 170 },
  { schema: 'pelimotion', table: 'cash_flow',         expected: 5   },
  { schema: 'personal',   table: 'tasks',             expected: 68  },
  { schema: 'personal',   table: 'expenses',          expected: 11  },
  { schema: 'personal',   table: 'investments',       expected: 36  },
  { schema: 'personal',   table: 'home_items',        expected: 38  },
  { schema: 'personal',   table: 'health_log',        expected: 3   },
  { schema: 'personal',   table: 'projects',          expected: 16  },
];

// Tabelas que deveriam ter project_id preenchido (linkagem com projects)
const LINKED_TABLES = [
  { schema: 'pelimotion', table: 'project_stages',   note: 'Cronograma inline — null esperado para maioria' },
  { schema: 'pelimotion', table: 'tasks',            note: 'Tasks PLM com relation Projetos PLM 1' },
  { schema: 'pelimotion', table: 'project_expenses', note: 'Saídas PLM com relation Projetos PLM' },
  { schema: 'pelimotion', table: 'cash_flow',        note: 'Caixa com relation Projeto' },
];

async function countRows(schema, table) {
  const { count, error } = await supabase
    .schema(schema)
    .from(table)
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(`${schema}.${table}: ${error.message}`);
  return count ?? 0;
}

async function countNullNotionId(schema, table) {
  const { count, error } = await supabase
    .schema(schema)
    .from(table)
    .select('*', { count: 'exact', head: true })
    .is('notion_id', null);
  if (error) return null;
  return count ?? 0;
}

async function countNullProjectId(schema, table) {
  const { count, error } = await supabase
    .schema(schema)
    .from(table)
    .select('*', { count: 'exact', head: true })
    .is('project_id', null);
  if (error) return null;
  return count ?? 0;
}

async function sampleRows(schema, table, limit = 3) {
  const { data, error } = await supabase
    .schema(schema)
    .from(table)
    .select('*')
    .limit(limit);
  if (error) return [];
  return data ?? [];
}

function pad(str, len) {
  return String(str).padEnd(len);
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  PELIMOTION OS — Validação Pós-Migração');
  console.log('═══════════════════════════════════════════════════════\n');

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrado em .env');
    process.exit(1);
  }

  // ── 1. Contagem por tabela ──────────────────────────────────────────────────
  console.log('📊 CONTAGEM DE LINHAS POR TABELA');
  console.log('─────────────────────────────────────────────────────');
  console.log(pad('Tabela', 38) + pad('Atual', 8) + pad('Esperado', 10) + 'Status');
  console.log('─────────────────────────────────────────────────────');

  let totalActual = 0;
  let totalExpected = 0;
  let tableErrors = 0;
  const results = [];

  for (const { schema, table, expected } of EXPECTED) {
    try {
      const actual = await countRows(schema, table);
      const key = `${schema}.${table}`;
      const ok = actual === expected;
      const icon = actual === 0 ? '⚠️ ' : ok ? '✅' : actual > expected ? '⚠️ ' : '❌';
      const status = ok ? 'OK' : actual === 0 ? 'VAZIO — migração pendente?' : actual > expected ? `+${actual - expected} extras` : `-${expected - actual} faltando`;
      console.log(`${icon} ${pad(key, 36)} ${pad(actual, 8)} ${pad(expected, 10)} ${status}`);
      totalActual += actual;
      totalExpected += expected;
      if (!ok) tableErrors++;
      results.push({ schema, table, actual, expected, ok });
    } catch (err) {
      console.log(`❌ ${pad(`${schema}.${table}`, 36)} ERRO: ${err.message}`);
      tableErrors++;
    }
  }

  console.log('─────────────────────────────────────────────────────');
  const totalOk = totalActual === totalExpected;
  console.log(`${totalOk ? '✅' : '⚠️ '} ${pad('TOTAL', 36)} ${pad(totalActual, 8)} ${pad(totalExpected, 10)} ${totalOk ? 'OK' : `diferença: ${totalActual - totalExpected}`}`);

  // ── 2. Verificação de notion_id nulos ──────────────────────────────────────
  console.log('\n📋 VERIFICAÇÃO DE NOTION_ID (não devem ser nulos)');
  console.log('─────────────────────────────────────────────────────');
  for (const { schema, table } of EXPECTED) {
    const nullCount = await countNullNotionId(schema, table);
    if (nullCount === null) continue; // tabela sem notion_id
    if (nullCount > 0) {
      console.log(`⚠️  ${schema}.${table}: ${nullCount} linha(s) sem notion_id`);
    }
  }
  console.log('  (sem alertas = todos os registros têm notion_id)');

  // ── 3. Verificação de linkagem (project_id) ────────────────────────────────
  console.log('\n🔗 LINKAGEM COM PROJECTS (project_id)');
  console.log('─────────────────────────────────────────────────────');
  for (const { schema, table, note } of LINKED_TABLES) {
    const total = await countRows(schema, table);
    const nullProjId = await countNullProjectId(schema, table);
    if (total === 0) {
      console.log(`  ⚠️  ${schema}.${table}: tabela vazia`);
      continue;
    }
    const linked = total - (nullProjId ?? 0);
    const pct = total > 0 ? Math.round((linked / total) * 100) : 0;
    const icon = pct >= 50 ? '✅' : pct > 0 ? '⚠️ ' : '🔴';
    console.log(`  ${icon} ${schema}.${table}: ${linked}/${total} linkados (${pct}%) — ${note}`);
  }

  // ── 4. Amostra de dados por tabela ─────────────────────────────────────────
  console.log('\n🔍 AMOSTRAS (3 primeiros registros de tabelas-chave)');
  console.log('─────────────────────────────────────────────────────');

  const samplesToCheck = [
    { schema: 'pelimotion', table: 'crm_contacts',    fields: ['name', 'crm_status', 'lead_temp'] },
    { schema: 'pelimotion', table: 'projects',         fields: ['name', 'client', 'stage', 'total_value'] },
    { schema: 'pelimotion', table: 'suppliers',        fields: ['name', 'city', 'state', 'rating'] },
    { schema: 'pelimotion', table: 'project_expenses', fields: ['name', 'value', 'is_paid', 'project_id'] },
    { schema: 'personal',   table: 'tasks',            fields: ['name', 'area', 'is_done'] },
    { schema: 'personal',   table: 'health_log',       fields: ['name', 'entry_type', 'log_date'] },
    { schema: 'personal',   table: 'home_items',       fields: ['name', 'sphere', 'priority', 'estimated_price'] },
  ];

  for (const { schema, table, fields } of samplesToCheck) {
    const rows = await sampleRows(schema, table);
    if (rows.length === 0) {
      console.log(`\n  ${schema}.${table}: (vazia)`);
      continue;
    }
    console.log(`\n  ${schema}.${table}:`);
    for (const row of rows) {
      const preview = fields.map(f => `${f}=${JSON.stringify(row[f])}`).join('  ');
      console.log(`    • ${preview}`);
    }
  }

  // ── 5. Resumo final ────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RESUMO FINAL');
  console.log('═══════════════════════════════════════════════════════');

  const migrated = results.filter(r => r.actual > 0).length;
  const empty = results.filter(r => r.actual === 0).length;
  const exact = results.filter(r => r.ok).length;

  console.log(`  Tabelas com dados:   ${migrated}/15`);
  console.log(`  Tabelas vazias:      ${empty}/15`);
  console.log(`  Counts exatos:       ${exact}/15`);
  console.log(`  Total de linhas:     ${totalActual} / ${totalExpected} esperadas`);

  if (empty > 0) {
    console.log('\n  ⚠️  Tabelas ainda vazias:');
    results.filter(r => r.actual === 0).forEach(r => {
      console.log(`     → ${r.schema}.${r.table} (esperado: ${r.expected})`);
    });
    console.log('\n  Para migrar as tabelas vazias, rode:');
    console.log('    node scripts/migrate.js    (migra tudo)');
    console.log('    node scripts/migrate.js <seção>    (migra uma seção)');
  } else if (tableErrors === 0) {
    console.log('\n  ✅ Migração completa e validada!');
    console.log('\n  PRÓXIMO PASSO — Revogar acesso Notion:');
    console.log('  1. Notion → Settings → Connections');
    console.log('  2. Localizar integração "Framework"');
    console.log('  3. Clicar em Disconnect / Remove access');
    console.log('  4. Remover NOTION_TOKEN do .env');
  } else {
    console.log('\n  ⚠️  Verifique os alertas acima antes de revogar o Notion.');
  }
  console.log('');
}

main().catch(err => {
  console.error('❌ Erro fatal:', err.message);
  process.exit(1);
});
