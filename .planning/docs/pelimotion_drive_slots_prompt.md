# 🗂️ PELIMOTION OS — Drive Links: Sistema de Pastas/Arquivos Customizáveis
**Prompt de implementação para: Antigravity / Claude Sonnet**
**Feature**: Drive Links configuráveis por projeto + herança inteligente nas cenas
**Escopo**: Apenas esta feature — não alterar nada fora do AssetsPanel e das tabelas de storage relacionadas

---

## CONTEXTO VISUAL (leia antes de qualquer código)

### Tela atual — Projeto (`Assets` tab do projeto)
```
┌─────────────────────────────────────────────────────────────────┐
│  📦 Armazenamento do Projeto          [↺ Desconectar]           │
│  Conecte uma pasta raiz para indexação automática               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ✅ Google Drive conectado                            [↗]   │  │
│  │    1yuRB_rPY-U8kVTyO76tRJbLgmsWMF2Zv...                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  📂 PASTAS VINCULADAS          [↺ SINCRONIZAR ESTRUTURA]        │
│                                                                   │
│  [🗂 Pasta Raiz          →]    [🎞 Renders  03_OUTPUT  ↗]       │
│     Pasta principal do projeto      (linked)                     │
│                                                                   │
│  [📌 Referências  00_CLIENTE ↗]  [🎨 Assets                →]   │
│     (linked)                        Texturas, elementos, sources  │
│                                                                   │
│  [📤 Exportações               →]                                │
│     Arquivos entregues ao cliente                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tela atual — Cena (`Assets` tab de uma cena específica)
```
┌─────────────────────────────────────────────────────────────────┐
│  📂 PASTAS VINCULADAS                                            │
│                                                                   │
│  [🗂 Pasta Raiz           →]   [🎞 Renders                 →]   │
│     Pasta principal do projeto      Renders e outputs finais      │
│                                                                   │
│  [📌 Referências          →]   [🎨 Assets                  →]   │
│     Refs visuals, moodboards        Texturas, elementos, sources  │
│                                                                   │
│  [📤 Exportações          →]                                      │
│     Arquivos entregues ao cliente                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## O QUE PRECISA SER CONSTRUÍDO

### Regra de negócio central:
1. **No projeto**: o usuário configura quais pastas/arquivos do Drive quer expor, dá nome a cada um e escolhe o tipo (pasta ou arquivo)
2. **Na cena**: a cena **herda** a lista de itens configurada no projeto pai, mas pode **ter seu próprio link** para cada item (ex: a pasta de Renders do projeto é `03_OUTPUT/`, mas a cena 08 tem seus renders em `03_OUTPUT/CENA_08/`)
3. **Default**: ao criar um projeto, 3 itens já vêm pré-configurados: `Projeto` (arquivo), `Render` (pasta), `Still` (pasta)

---

## PARTE 1 — SCHEMA DO BANCO DE DADOS

### Tabela nova: `project_drive_slots`
Armazena a **configuração** de cada slot de Drive no nível do projeto.

```sql
CREATE TABLE project_drive_slots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  slot_key      TEXT NOT NULL,          -- identificador interno único, ex: "render", "still", "projeto"
  display_name  TEXT NOT NULL,          -- nome que o usuário vê, ex: "Render", "Still", "Projeto"
  slot_type     TEXT NOT NULL CHECK (slot_type IN ('folder', 'file')),
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, slot_key)
);

-- RLS: apenas membros do projeto podem ver/editar
ALTER TABLE project_drive_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_members_access" ON project_drive_slots
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_drive_slots.project_id
      AND project_members.user_id = auth.uid()
    )
  );

-- Seed dos 3 slots default ao criar projeto (via trigger ou no databaseFactory)
-- INSERT INTO project_drive_slots (project_id, slot_key, display_name, slot_type, sort_order)
-- VALUES 
--   ($projectId, 'projeto', 'Projeto', 'file', 0),
--   ($projectId, 'render', 'Render', 'folder', 1),
--   ($projectId, 'still', 'Still', 'folder', 2);
```

### Tabela nova: `drive_slot_links`
Armazena os **links reais do Drive** para cada slot, tanto no nível do projeto quanto no nível de cada cena.

```sql
CREATE TABLE drive_slot_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id       UUID NOT NULL REFERENCES project_drive_slots(id) ON DELETE CASCADE,
  page_id       UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  -- page_id pode ser o project_id (link do projeto) OU o scene_id (link da cena)
  drive_url     TEXT,                   -- URL completa do Drive
  drive_file_id TEXT,                   -- ID do arquivo/pasta no Drive (para API)
  drive_name    TEXT,                   -- nome do item no Drive (ex: "03_OUTPUT")
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(slot_id, page_id)             -- um link por slot por página
);

ALTER TABLE drive_slot_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_members_access" ON drive_slot_links
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      JOIN project_drive_slots pds ON pds.id = drive_slot_links.slot_id
      WHERE pds.project_id = pm.project_id
      AND pm.user_id = auth.uid()
    )
  );
```

### Modificação no `databaseFactory`
Ao criar um projeto, inserir os 3 slots default:

```typescript
// Em databaseFactory.ts — adicionar após criar o projeto
async function seedDefaultDriveSlots(projectId: string, supabase: SupabaseClient) {
  const defaultSlots = [
    { slot_key: 'projeto', display_name: 'Projeto', slot_type: 'file', sort_order: 0 },
    { slot_key: 'render',  display_name: 'Render',  slot_type: 'folder', sort_order: 1 },
    { slot_key: 'still',   display_name: 'Still',   slot_type: 'folder', sort_order: 2 },
  ]
  
  await supabase
    .from('project_drive_slots')
    .insert(defaultSlots.map(s => ({ ...s, project_id: projectId })))
}
```

---

## PARTE 2 — HOOK DE DADOS

### `useDriveSlots.ts`

```typescript
// hooks/useDriveSlots.ts

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface DriveSlot {
  id: string
  project_id: string
  slot_key: string
  display_name: string
  slot_type: 'folder' | 'file'
  sort_order: number
  // Link resolvido para esta página (projeto ou cena)
  link?: DriveSlotLink | null
  // Link herdado do projeto pai (preenchido apenas quando page é uma cena)
  inherited_link?: DriveSlotLink | null
}

export interface DriveSlotLink {
  id: string
  slot_id: string
  page_id: string
  drive_url: string | null
  drive_file_id: string | null
  drive_name: string | null
}

interface UseDriveSlotsOptions {
  projectId: string
  pageId: string          // pode ser o próprio projectId ou um sceneId
  isScene?: boolean       // true quando a página é uma cena
}

export function useDriveSlots({ projectId, pageId, isScene = false }: UseDriveSlotsOptions) {
  const [slots, setSlots] = useState<DriveSlot[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSlots = async () => {
    setLoading(true)
    
    // 1. Busca os slots configurados no projeto
    const { data: slotsData } = await supabase
      .from('project_drive_slots')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order')

    if (!slotsData) { setLoading(false); return }

    const slotIds = slotsData.map(s => s.id)

    // 2. Busca os links desta página (projeto ou cena)
    const { data: pageLinks } = await supabase
      .from('drive_slot_links')
      .select('*')
      .in('slot_id', slotIds)
      .eq('page_id', pageId)

    // 3. Se for cena, busca também os links do projeto pai (herança)
    let projectLinks: DriveSlotLink[] = []
    if (isScene) {
      const { data: pl } = await supabase
        .from('drive_slot_links')
        .select('*')
        .in('slot_id', slotIds)
        .eq('page_id', projectId)
      projectLinks = pl ?? []
    }

    // 4. Combina: slot + link próprio + link herdado
    const merged: DriveSlot[] = slotsData.map(slot => ({
      ...slot,
      link: pageLinks?.find(l => l.slot_id === slot.id) ?? null,
      inherited_link: isScene
        ? (projectLinks.find(l => l.slot_id === slot.id) ?? null)
        : null,
    }))

    setSlots(merged)
    setLoading(false)
  }

  useEffect(() => { fetchSlots() }, [projectId, pageId])

  // ── MUTATIONS ──────────────────────────────────────────────────

  /** Atualiza nome ou tipo de um slot (só funciona na view do projeto) */
  async function updateSlot(slotId: string, updates: Partial<Pick<DriveSlot, 'display_name' | 'slot_type'>>) {
    await supabase
      .from('project_drive_slots')
      .update(updates)
      .eq('id', slotId)
    await fetchSlots()
  }

  /** Adiciona novo slot ao projeto */
  async function addSlot(displayName: string, slotType: 'folder' | 'file') {
    const maxOrder = slots.length > 0 ? Math.max(...slots.map(s => s.sort_order)) : -1
    await supabase
      .from('project_drive_slots')
      .insert({
        project_id: projectId,
        slot_key: displayName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
        display_name: displayName,
        slot_type: slotType,
        sort_order: maxOrder + 1,
      })
    await fetchSlots()
  }

  /** Remove um slot e todos os links associados (CASCADE cuida do banco) */
  async function removeSlot(slotId: string) {
    await supabase
      .from('project_drive_slots')
      .delete()
      .eq('id', slotId)
    await fetchSlots()
  }

  /** Salva ou atualiza o link de Drive para um slot nesta página */
  async function upsertLink(slotId: string, linkData: Pick<DriveSlotLink, 'drive_url' | 'drive_file_id' | 'drive_name'>) {
    await supabase
      .from('drive_slot_links')
      .upsert({
        slot_id: slotId,
        page_id: pageId,
        ...linkData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slot_id,page_id' })
    await fetchSlots()
  }

  /** Remove o link de uma cena para um slot (volta a mostrar o herdado do projeto) */
  async function removeLink(slotId: string) {
    await supabase
      .from('drive_slot_links')
      .delete()
      .eq('slot_id', slotId)
      .eq('page_id', pageId)
    await fetchSlots()
  }

  return { slots, loading, updateSlot, addSlot, removeSlot, upsertLink, removeLink, refetch: fetchSlots }
}
```

---

## PARTE 3 — COMPONENTES DE UI

### 3.1 `DriveSlotCard.tsx` — Card individual de um slot

```tsx
// components/assets/DriveSlotCard.tsx
// Renderiza um único slot com seu link atual (ou herdado)

interface DriveSlotCardProps {
  slot: DriveSlot
  isProjectView: boolean   // true = estamos no projeto, false = estamos na cena
  onEditSlot?: () => void  // abre o modal de edição do slot (só no projeto)
  onLinkSlot: () => void   // abre o picker de Drive para linkar
  onRemoveLink?: () => void // remove override da cena (volta para herdado)
}

// ESTADOS VISUAIS POSSÍVEIS:

// Estado A — sem link (nem próprio nem herdado)
// ┌──────────────────────────────────┐
// │ 📁  Render                  [⋯] │
// │     Nenhum link vinculado        │
// │                        [+ Link]  │
// └──────────────────────────────────┘

// Estado B — link vinculado (projeto ou próprio da cena)
// ┌──────────────────────────────────┐
// │ 📁  Render            03_OUTPUT  │
// │     (nome do item no Drive)  [↗] │  ← abre no Drive
// └──────────────────────────────────┘

// Estado C — cena com link herdado do projeto (sem override)
// ┌──────────────────────────────────┐
// │ 📁  Render            03_OUTPUT  │
// │     Herdado do projeto    [↗][⋯] │
// └──────────────────────────────────┘

// Estado D — cena com override próprio
// ┌──────────────────────────────────┐
// │ 📁  Render       CENA_08/OUTPUT  │
// │     Link próprio desta cena  [↗] │  ← badge "próprio"
// └──────────────────────────────────┘

// ÍCONES por slot_type:
// folder → 📁 (FolderIcon do Lucide)
// file   → 📄 (FileIcon do Lucide)

// MENU (⋯) no card — aparece no hover:
// Contexto: Projeto
//   - Renomear
//   - Alterar tipo (Pasta / Arquivo)  
//   - Vincular arquivo/pasta
//   - Remover slot
// Contexto: Cena
//   - Vincular arquivo/pasta específico desta cena
//   - Remover link próprio (se tiver override)
//   - Abrir no Drive (se tiver link)
```

### 3.2 `DriveSlotEditModal.tsx` — Modal de edição de um slot (nível projeto)

```tsx
// components/assets/DriveSlotEditModal.tsx
// Abre quando o usuário quer renomear ou trocar o tipo de um slot

// UI:
// ┌──────────────────────────────────────────┐
// │  Editar slot de Drive               [✕]  │
// │                                          │
// │  Nome do slot                            │
// │  ┌──────────────────────────────────┐    │
// │  │  Render                          │    │
// │  └──────────────────────────────────┘    │
// │                                          │
// │  Tipo                                    │
// │  ○ 📁 Pasta    ● 📄 Arquivo              │
// │                                          │
// │             [Cancelar]  [Salvar]          │
// └──────────────────────────────────────────┘

interface DriveSlotEditModalProps {
  slot: DriveSlot
  open: boolean
  onClose: () => void
  onSave: (displayName: string, slotType: 'folder' | 'file') => Promise<void>
}
```

### 3.3 `DriveLinkPickerModal.tsx` — Modal para vincular arquivo/pasta do Drive

```tsx
// components/assets/DriveLinkPickerModal.tsx
// Picker para o usuário colar a URL do Drive ou navegar

// VERSÃO SIMPLES (v1 — sem picker visual do Drive):
// ┌──────────────────────────────────────────────────────┐
// │  Vincular [Render] ao Google Drive             [✕]   │
// │  Tipo: Pasta                                         │
// │                                                      │
// │  Cole a URL do Google Drive:                         │
// │  ┌────────────────────────────────────────────────┐  │
// │  │  https://drive.google.com/drive/folders/...    │  │
// │  └────────────────────────────────────────────────┘  │
// │                                                      │
// │  Nome de exibição (como aparece no card):            │
// │  ┌────────────────────────────────────────────────┐  │
// │  │  03_OUTPUT                                     │  │
// │  └────────────────────────────────────────────────┘  │
// │                                                      │
// │  ⚠️ Esta cena usará este link em vez do do projeto.  │
// │     (só aparece quando estamos em uma cena)          │
// │                                                      │
// │                    [Cancelar]  [Vincular]            │
// └──────────────────────────────────────────────────────┘

// LÓGICA DE PARSING DA URL:
// Google Drive pasta: https://drive.google.com/drive/folders/{FILE_ID}
// Google Drive arquivo: https://drive.google.com/file/d/{FILE_ID}/view
// → extrair o FILE_ID e salvar em drive_file_id

function extractDriveFileId(url: string): string | null {
  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/)
  const fileMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  return folderMatch?.[1] ?? fileMatch?.[1] ?? null
}
```

### 3.4 `AddDriveSlotButton.tsx` — Botão para adicionar novo slot (só no projeto)

```tsx
// components/assets/AddDriveSlotButton.tsx
// Aparece no final da grid de slots, só quando isProjectView = true

// UI:
// ┌─────────────────────────────────┐
// │  +  Adicionar pasta ou arquivo  │  ← botão dashed border
// └─────────────────────────────────┘
// → ao clicar: abre inline form ou mini-modal:
//   Nome: [___________]  Tipo: [📁 Pasta ▾]  [Adicionar]
```

### 3.5 `AssetsPanel.tsx` — Painel principal refatorado

```tsx
// components/assets/AssetsPanel.tsx
// Substitui a implementação atual do painel de Assets

interface AssetsPanelProps {
  projectId: string
  pageId: string           // projectId para a view do projeto, sceneId para a cena
  isScene?: boolean
}

export function AssetsPanel({ projectId, pageId, isScene = false }: AssetsPanelProps) {
  const { slots, loading, updateSlot, addSlot, removeSlot, upsertLink, removeLink } = 
    useDriveSlots({ projectId, pageId, isScene })

  // Estado dos modais
  const [editingSlot, setEditingSlot] = useState<DriveSlot | null>(null)
  const [linkingSlot, setLinkingSlot] = useState<DriveSlot | null>(null)

  return (
    <div className="assets-panel">
      {/* Seção de conexão do Google Drive (só na view do projeto) */}
      {!isScene && <DriveConnectionSection projectId={projectId} />}

      {/* Grid de slots */}
      <section className="drive-slots-section">
        <header className="slots-header">
          <FolderOpenIcon size={14} />
          <span>PASTAS VINCULADAS</span>
          {!isScene && <SyncButton projectId={projectId} />}
        </header>

        {loading ? (
          <DriveSlotsSkeletons count={3} />
        ) : (
          <div className="slots-grid">
            {slots.map(slot => (
              <DriveSlotCard
                key={slot.id}
                slot={slot}
                isProjectView={!isScene}
                onEditSlot={() => setEditingSlot(slot)}
                onLinkSlot={() => setLinkingSlot(slot)}
                onRemoveLink={isScene ? () => removeLink(slot.id) : undefined}
              />
            ))}
            
            {/* Botão adicionar — só no projeto */}
            {!isScene && (
              <AddDriveSlotButton onAdd={addSlot} />
            )}
          </div>
        )}
      </section>

      {/* Modais */}
      {editingSlot && (
        <DriveSlotEditModal
          slot={editingSlot}
          open={true}
          onClose={() => setEditingSlot(null)}
          onSave={async (name, type) => {
            await updateSlot(editingSlot.id, { display_name: name, slot_type: type })
            setEditingSlot(null)
          }}
        />
      )}

      {linkingSlot && (
        <DriveLinkPickerModal
          slot={linkingSlot}
          isScene={isScene}
          open={true}
          onClose={() => setLinkingSlot(null)}
          onLink={async (url, fileId, driveName) => {
            await upsertLink(linkingSlot.id, { drive_url: url, drive_file_id: fileId, drive_name: driveName })
            setLinkingSlot(null)
          }}
        />
      )}
    </div>
  )
}
```

---

## PARTE 4 — LÓGICA DE HERANÇA (regra mais importante)

A cena deve sempre mostrar **algum link** para cada slot — seja o próprio ou o herdado do projeto.

```typescript
// Função utilitária para resolver o link efetivo de um slot numa cena
export function resolveSlotLink(slot: DriveSlot): {
  link: DriveSlotLink | null
  source: 'own' | 'inherited' | 'none'
} {
  if (slot.link) {
    return { link: slot.link, source: 'own' }
  }
  if (slot.inherited_link) {
    return { link: slot.inherited_link, source: 'inherited' }
  }
  return { link: null, source: 'none' }
}

// USO no DriveSlotCard:
const { link: effectiveLink, source } = resolveSlotLink(slot)

// VISUAL baseado no source:
// 'own'       → badge azul "próprio" + ícone de override
// 'inherited' → texto "Herdado do projeto" em cinza, sutil
// 'none'      → estado vazio com botão para linkar
```

---

## PARTE 5 — CSS / DESIGN TOKENS

```css
/* assets-panel.css — seguindo os tokens do sistema Pelimotion */

.assets-panel {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.slots-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: var(--space-4);
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

/* Card do slot */
.drive-slot-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  position: relative;
  transition: background 0.15s ease, border-color 0.15s ease;
  min-height: 60px;
}

.drive-slot-card:hover {
  background: var(--surface-3);
  border-color: var(--border-default);
}

/* Ícone do slot */
.slot-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--surface-3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.5);
}

/* Conteúdo do slot */
.slot-content {
  flex: 1;
  min-width: 0;
}

.slot-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slot-drive-name {
  font-size: 11px;
  color: #22C55E;  /* verde = linkado */
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.slot-empty-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 2px;
}

/* Badge de herança */
.slot-inherited-badge {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.35);
  font-style: italic;
  margin-top: 2px;
}

/* Badge "próprio" (override da cena) */
.slot-own-badge {
  font-size: 10px;
  background: rgba(99, 102, 241, 0.2);
  color: #818CF8;
  border-radius: 3px;
  padding: 1px 5px;
  display: inline-block;
  margin-top: 2px;
}

/* Menu de três pontos — aparece no hover */
.slot-menu-trigger {
  opacity: 0;
  transition: opacity 0.15s ease;
  position: absolute;
  top: 8px;
  right: 8px;
}

.drive-slot-card:hover .slot-menu-trigger {
  opacity: 1;
}

/* Ação de abertura (seta →) */
.slot-arrow {
  color: rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
  transition: color 0.15s ease;
}

.drive-slot-card:hover .slot-arrow {
  color: rgba(255, 255, 255, 0.6);
}

/* Botão adicionar slot */
.add-slot-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-md);
  color: rgba(255, 255, 255, 0.35);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 60px;
  background: transparent;
}

.add-slot-button:hover {
  border-color: var(--border-strong);
  color: rgba(255, 255, 255, 0.7);
  background: var(--surface-2);
}
```

---

## PARTE 6 — PONTOS DE INTEGRAÇÃO COM O CÓDIGO EXISTENTE

### 6.1 Onde chamar `AssetsPanel`

```tsx
// Em ProjectPage.tsx (ou equivalente):
// Quando a tab "Assets" está ativa:
<AssetsPanel
  projectId={project.id}
  pageId={project.id}
  isScene={false}
/>

// Em SceneDetail.tsx (ou equivalente):
// Quando a tab "Assets" está ativa na cena:
<AssetsPanel
  projectId={scene.parent_id}   // ← o projeto pai da cena
  pageId={scene.id}             // ← a própria cena
  isScene={true}
/>
```

### 6.2 Remover código antigo
- Remover qualquer hardcode de "Pasta Raiz", "Renders", "Referências", "Assets", "Exportações" do front-end
- Remover qualquer tabela/coluna legada que armazenava esses links de forma fixa
- Manter a lógica de `DriveConnectionSection` (Google Drive conectado / Desconectar) — essa parte não muda

### 6.3 Migração de dados existentes
Se já existirem links salvos no formato antigo, criar uma migration SQL que:
1. Lê os links existentes do formato antigo
2. Cria os slots correspondentes em `project_drive_slots`
3. Move os links para `drive_slot_links`
4. (opcional) Marca os dados antigos como migrados em vez de deletar imediatamente

---

## PARTE 7 — EDGE CASES E REGRAS DE VALIDAÇÃO

```typescript
// Validações a implementar:

// 1. Nome do slot não pode ser vazio
if (!displayName.trim()) return { error: 'Nome é obrigatório' }

// 2. URL do Drive deve ser válida
function isValidDriveUrl(url: string): boolean {
  return url.includes('drive.google.com') || url.includes('docs.google.com')
}

// 3. Ao remover um slot do projeto, confirmar antes:
// "Remover o slot 'Render' vai apagar todos os links vinculados a ele em todas as cenas. Confirmar?"

// 4. Se a cena não tem link próprio nem herdado → mostrar slot com estado vazio
// (não esconder o slot — o usuário precisa saber que ele existe e pode linkar)

// 5. Máximo de slots por projeto: 10 (para não poluir a UI)
// Ao atingir o limite, desabilitar o "Adicionar" com tooltip explicativo

// 6. O slot_key deve ser único por projeto
// Geração: `${displayName.toLowerCase().replace(/\W+/g, '_')}_${Date.now()}`
// Isso evita colisão mesmo se o usuário criar dois slots com o mesmo nome
```

---

## PARTE 8 — ORDEM DE IMPLEMENTAÇÃO

Execute nesta sequência:

1. **Migration SQL** — criar `project_drive_slots` e `drive_slot_links` com RLS
2. **`databaseFactory`** — adicionar `seedDefaultDriveSlots` no fluxo de criação de projeto
3. **`useDriveSlots` hook** — toda a lógica de fetch + mutations
4. **`resolveSlotLink` util** — lógica de herança
5. **`DriveSlotCard`** — componente visual do card
6. **`DriveSlotEditModal`** — modal de edição de nome/tipo
7. **`DriveLinkPickerModal`** — modal de vincular URL
8. **`AddDriveSlotButton`** — botão de adicionar slot
9. **`AssetsPanel`** — painel refatorado juntando tudo
10. **Integração** — substituir o `AssetsPanel` antigo em `ProjectPage` e `SceneDetail`
11. **Migration de dados legados** (se necessário)

---

## CHECKLIST FINAL

- [ ] Projeto cria automaticamente 3 slots: Projeto (arquivo), Render (pasta), Still (pasta)
- [ ] Na view do projeto: renomear, trocar tipo e remover slots funcionam
- [ ] Na view do projeto: adicionar novos slots funciona (máx 10)
- [ ] Vincular URL do Drive funciona em projeto e cena
- [ ] Cena herda links do projeto quando não tem link próprio
- [ ] Cena pode ter override próprio por slot
- [ ] Visual diferencia: "herdado do projeto" vs "link próprio" vs "sem link"
- [ ] Three-dot menu em cada card com ações corretas por contexto
- [ ] RLS aplicado em ambas as tabelas
- [ ] Nenhum nome hardcoded de pasta no front-end
- [ ] `DriveConnectionSection` (seção de conectar o Drive raiz) permanece intacta

---

*Pelimotion OS — Drive Slots Feature v1.0 — Maio 2026*
