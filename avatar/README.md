# 🛹 PS2 Avatar System — Tony Hawk Style
> WebGL 3D interactive bust avatar com random seed visual + wardrobe system

---

## Visão Geral

Sistema de avatar 3D no estilo dos jogos **Tony Hawk Pro Skater (PS2 era)** — polígonos low-poly expressivos, cores saturadas, caricatura intencional. O avatar exibe apenas **rosto + busto** com animação idle sutil, e é 100% gerado proceduralmente via **dois seeds independentes**:

| Seed | Controla |
|------|----------|
| `FACE_SEED` | Formato do rosto, proporções, olhos, nariz, boca, tom de pele, exageros caricatos |
| `OUTFIT_SEED` | Roupas, acessórios, cores de peças, logos, piercings, óculos, bonés |

---

## Stack Técnica

```
Three.js (r160+)          → WebGL renderer, geometrias, materiais
@tweenjs/tween.js         → Animações idle suaves
Supabase JS v2            → Salvar/carregar seeds de usuários
Vite + React (ou Next.js) → Build/deploy no Vercel
```

---

## Estrutura de Arquivos

```
/avatar-system
  /src
    /avatar
      AvatarController.js      ← Orquestra tudo
      FaceGenerator.js         ← Gera geometria do rosto via FACE_SEED
      OutfitGenerator.js       ← Gera roupas/acessórios via OUTFIT_SEED
      IdleAnimator.js          ← Breathing, blink, head sway
      SeedEngine.js            ← PRNG determinístico (mulberry32)
      MaterialPalette.js       ← Paletas de cor por seed
    /geometry
      BaseHead.js              ← Mesh base subdivisível
      FaceFeatures.js          ← Olhos, nariz, boca como sub-meshes
      BustBase.js              ← Torso/ombros
      Accessories.js           ← Óculos, bonés, correntes, etc
    /scene
      SceneSetup.js            ← Renderer, câmera, luzes estilo PS2
      PostProcessing.js        ← Outline shader cel-shading opcional
  /public
    /textures                  ← Toon ramp textures, logos de marca mockup
  AvatarWidget.jsx             ← Componente React final
  avatar.worker.js             ← Web worker pra geração pesada (opcional)
```

---

## Fluxo de Funcionamento

```
User chega na página
        ↓
Carrega seeds do Supabase (ou gera aleatório se novo user)
        ↓
SeedEngine(FACE_SEED) → FaceGenerator → Mesh do rosto
SeedEngine(OUTFIT_SEED) → OutfitGenerator → Mesh de roupa
        ↓
Ambos montados no AvatarController → Three.js Scene
        ↓
IdleAnimator roda em requestAnimationFrame
        ↓
Usuário clica "Randomize Face" ou "Randomize Outfit"
        ↓
Novo seed gerado → Regenera apenas o mesh correspondente
        ↓
Supabase.upsert({ user_id, face_seed, outfit_seed })
```

---

## Integração Supabase

### Tabela necessária

```sql
-- Rodar no Supabase SQL Editor
create table avatar_seeds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  face_seed integer not null default 42,
  outfit_seed integer not null default 7,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: cada user só vê o próprio avatar
alter table avatar_seeds enable row level security;
create policy "own avatar" on avatar_seeds
  for all using (auth.uid() = user_id);
```

### Uso no componente

```js
// Salvar seed
await supabase.from('avatar_seeds').upsert({
  user_id: session.user.id,
  face_seed: currentFaceSeed,
  outfit_seed: currentOutfitSeed,
  updated_at: new Date().toISOString()
})

// Carregar seed
const { data } = await supabase
  .from('avatar_seeds')
  .select('face_seed, outfit_seed')
  .eq('user_id', session.user.id)
  .single()
```

---

## Deploy no Vercel

1. Push do repo para GitHub
2. Importar projeto no Vercel
3. Definir variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Build command: `npm run build`
5. Output directory: `.next` ou `dist`

> Three.js é client-side — sem SSR issues se usar `dynamic(() => import('./AvatarWidget'), { ssr: false })` no Next.js

---

## Documentos deste sistema

| Arquivo | Conteúdo |
|---------|----------|
| `01-face-generator.md` | Algoritmo completo de geração de rosto |
| `02-outfit-generator.md` | Sistema de roupas e acessórios |
| `03-animation-system.md` | Idle animation + blend system |
| `04-rendering-ps2-style.md` | Shader cel-shading, luzes, câmera |
| `05-seed-engine.md` | PRNG, geração de valores, exemplos |
| `06-react-component.md` | AvatarWidget.jsx completo |
| `07-supabase-schema.md` | Schema completo e RLS policies |
| `08-implementation-checklist.md` | Lista pra passar pro dev |
