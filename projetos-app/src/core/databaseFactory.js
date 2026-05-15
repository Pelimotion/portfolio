import { propertyService } from '../services/propertyService';
import { viewService } from '../services/viewService';
import { pageService } from '../services/pageService';
import { PROJECT_PROPERTY_SCHEMA, SCENE_PROPERTY_SCHEMA, DEFAULT_VIEWS, ROOT_HUB_ID } from './schemas';
import { supabase } from '../lib/supabase';

// ============================================
// DATABASE FACTORY — Criar databases com
// schemas e views pré-configurados
// ============================================

async function ensureProperties(databaseId, schema) {
  const existing = await propertyService.fetchByDatabase(databaseId);
  if (existing.length > 0) return existing; // Já existe, não recriar

  const created = await Promise.all(
    schema.map((prop) =>
      propertyService.create({
        databaseId,
        name: prop.name,
        propertyType: prop.property_type,
        config: prop.config,
      })
    )
  );
  return created;
}

async function ensureViews(databaseId, viewConfigs) {
  const existing = await viewService.fetchByDatabase(databaseId);
  if (existing.length > 0) return existing;

  const created = await Promise.all(
    viewConfigs.map((v) =>
      viewService.create({
        databaseId,
        name: v.name,
        viewType: v.view_type,
        config: v.config || {},
      })
    )
  );
  return created;
}

// Garantir que o Projects Hub raiz existe e tem schema
export async function ensureRootHub() {
  // Tentar buscar o hub
  let hub = await pageService.fetchById(ROOT_HUB_ID);
  
  if (!hub) {
    // Criar se não existir
    hub = await pageService.create({
      id: ROOT_HUB_ID,
      title: 'Projects Hub',
      parentId: null,
      pageType: 'database',
    });
  }

  const [props, views] = await Promise.all([
    ensureProperties(hub.id, PROJECT_PROPERTY_SCHEMA),
    ensureViews(hub.id, DEFAULT_VIEWS.projects),
  ]);

  return { hub, props, views };
}

// Quando cria um projeto novo: garantir que ele tem
// um database filho "Pipeline" com schema de cenas
export async function bootstrapProjectPipeline(projectPageId) {
  // Verificar se já existe um Pipeline filho
  const children = await pageService.fetchChildren(projectPageId);
  const existing = children.find((c) => c.page_type === 'database' && c.title === 'Pipeline');
  if (existing) return existing;

  // Criar o database Pipeline
  const pipeline = await pageService.create({
    title: 'Pipeline',
    parentId: projectPageId,
    pageType: 'database',
  });

  // Criar propriedades e views de cenas em paralelo
  await Promise.all([
    ensureProperties(pipeline.id, SCENE_PROPERTY_SCHEMA),
    ensureViews(pipeline.id, DEFAULT_VIEWS.scenes),
    seedDefaultDriveSlots(projectPageId)
  ]);

  return pipeline;
}

// Quando cria um projeto novo: inicializar os 3 slots padrão de Drive
export async function seedDefaultDriveSlots(projectId) {
  // Verificar se já tem slots
  const { data } = await supabase.from('project_drive_slots').select('id').eq('project_id', projectId).limit(1);
  if (data && data.length > 0) return;

  const defaultSlots = [
    { slot_key: 'projeto', display_name: 'Projeto', slot_type: 'file', sort_order: 0 },
    { slot_key: 'render',  display_name: 'Render',  slot_type: 'folder', sort_order: 1 },
    { slot_key: 'still',   display_name: 'Still',   slot_type: 'folder', sort_order: 2 },
  ];
  
  await supabase
    .from('project_drive_slots')
    .insert(defaultSlots.map(s => ({ ...s, project_id: projectId })));
}
