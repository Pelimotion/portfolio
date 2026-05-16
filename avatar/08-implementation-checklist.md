# 08 — Implementation Checklist
> Lista completa para o dev implementar o sistema. Copiar e colar como tasks.

---

## Para o Dev (Anthropic/seu time)

Este sistema é um avatar 3D WebGL no estilo **PS2/Tony Hawk** com geração procedural via seeds. Dois seeds independentes controlam rosto e outfit. Stack: **Three.js + React/Next.js + Supabase**.

Leia os documentos nesta ordem:
1. `README.md` — visão geral
2. `05-seed-engine.md` — PRNG (base de tudo)
3. `01-face-generator.md` — geração do rosto
4. `02-outfit-generator.md` — roupas/acessórios
5. `03-animation-system.md` — idle animations
6. `04-rendering-ps2-style.md` — visual/shaders
7. `06-react-component.md` — componente React
8. `07-supabase-schema.md` — banco de dados

---

## Checklist de Implementação

### Fase 1 — Setup Base
- [ ] Instalar Three.js: `npm install three @types/three`
- [ ] Instalar Supabase: `npm install @supabase/supabase-js @supabase/ssr`
- [ ] Criar pasta `/src/avatar/` com os arquivos do sistema
- [ ] Configurar variáveis de ambiente (`.env.local`):
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  ```
- [ ] Rodar migration SQL no Supabase (arquivo `07-supabase-schema.md`)

### Fase 2 — SeedEngine
- [ ] Criar `src/avatar/SeedEngine.js` (código completo em `05-seed-engine.md`)
- [ ] Testar: `new SeedEngine(42).range(0,1)` deve retornar `0.65...` sempre
- [ ] Criar `src/hooks/useAvatarSeeds.js`

### Fase 3 — Rendering Setup
- [ ] Criar `src/avatar/SceneSetup.js` (código em `04-rendering-ps2-style.md`)
- [ ] Criar `src/avatar/AvatarController.js`
- [ ] Testar canvas WebGL renderizando cena vazia com fundo dark

### Fase 4 — Face Generator
- [ ] Criar `src/avatar/FaceGenerator.js`
- [ ] Implementar funções na ordem:
  - [ ] `generateFaceParams(seed)` — retorna objeto de parâmetros
  - [ ] `buildHeadBase(params)` — mesh da cabeça com deformação
  - [ ] `buildEyes(params)` — olhos com highlight
  - [ ] `buildNose(params)` — nariz
  - [ ] `buildMouth(params)` — boca + lábios
  - [ ] `buildEyebrows(params)` — sobrancelhas
  - [ ] `buildEars(params)` — orelhas
  - [ ] `buildHair(params)` — cabelo
  - [ ] `buildNeck()` — pescoço
  - [ ] `buildBust()` — busto/ombros
  - [ ] `buildFaceMesh(params)` — função principal que chama todas acima
- [ ] Testar com seed 42: deve gerar rosto visível

### Fase 5 — Outline PS2
- [ ] Criar `src/avatar/PostProcessing.js`
- [ ] Implementar `addOutlineToMesh(mesh, thickness)` usando BackSide
- [ ] Implementar `addOutlineToGroup(group)`
- [ ] Testar: silhueta preta ao redor do rosto

### Fase 6 — Outfit Generator
- [ ] Criar `src/avatar/OutfitGenerator.js`
- [ ] Criar `src/avatar/MaterialPalette.js` com as paletas
- [ ] Implementar funções:
  - [ ] `generateOutfitParams(seed)`
  - [ ] `buildTop(params)` — camiseta/top
  - [ ] `buildOuterLayer(params)` — moletom/jaqueta
  - [ ] `buildNeckAccessory(params)` — corrente/bandana
  - [ ] `buildHeadwear(params)` — boné/gorro
  - [ ] `buildGlasses(params)` — óculos
  - [ ] `buildPiercings(params)` — piercings
  - [ ] `buildOutfitMesh(params, skinTone)` — função principal

### Fase 7 — Idle Animator
- [ ] Criar `src/avatar/IdleAnimator.js`
- [ ] Implementar:
  - [ ] `_updateBreathing(t)` — oscilação vertical
  - [ ] `_updateHeadSway(t)` — balanço da cabeça
  - [ ] `_updateBlink(t, dt)` — piscar com timing variável
  - [ ] `_updateSubtle(t)` — micro-movimentos
- [ ] Testar: avatar deve ter movimento contínuo suave

### Fase 8 — React Component
- [ ] Criar `components/AvatarWidget.jsx` (código em `06-react-component.md`)
- [ ] Criar `components/AvatarWidget.module.css`
- [ ] Criar `src/utils/avatarTransitions.js` (squeezeTransition)
- [ ] Integrar no Next.js com `dynamic(() => ..., { ssr: false })`
- [ ] Testar botões "Randomize Face" e "Randomize Outfit"

### Fase 9 — Integração Supabase
- [ ] Criar `src/services/avatarService.ts`
- [ ] Testar `loadAvatarSeeds` — carrega ou cria seed inicial
- [ ] Testar `saveAvatarSeeds` — persiste após randomize
- [ ] Verificar RLS: user A não pode ver seed do user B

### Fase 10 — Polish
- [ ] Adicionar transição squish ao clicar randomize
- [ ] Testar URL sharing (`?f=...&o=...`)
- [ ] Testar em mobile (touch, performance)
- [ ] Verificar memory leaks: `geometry.dispose()` e `material.dispose()` no swap
- [ ] Testar cold start: Vercel Edge + Supabase < 2s

---

## Observações Técnicas Importantes

### Memory Management no Three.js
```js
// SEMPRE fazer isso ao trocar avatar:
oldMesh.traverse(child => {
  if (child.isMesh) {
    child.geometry.dispose()
    if (Array.isArray(child.material)) {
      child.material.forEach(m => m.dispose())
    } else {
      child.material.dispose()
    }
  }
})
scene.remove(oldMesh)
```

### Three.js com Next.js App Router
```jsx
// Nunca importar Three.js direto em Server Components
// Sempre usar dynamic import:
const AvatarWidget = dynamic(
  () => import('../components/AvatarWidget'),
  { ssr: false }
)
```

### Toon Material — Gradient Map
```js
// O gradientMap do MeshToonMaterial PRECISA de:
// minFilter: THREE.NearestFilter
// magFilter: THREE.NearestFilter
// Sem isso o shading fica blurry (não parece PS2)
const tex = new THREE.DataTexture(data, width, 1, THREE.RedFormat)
tex.minFilter = THREE.NearestFilter
tex.magFilter = THREE.NearestFilter
tex.needsUpdate = true
```

### Performance no Mobile
- Manter PixelRatio máximo em 2: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`
- Não criar geometrias novas a cada frame — sempre reusar ou fazer dispose correto
- Gradient maps em cache global (não recriar por avatar)
- Antialias: `false` — economiza GPU e combina com estética PS2

---

## Variações Futuras (backlog)

- **Modo espelho**: clicar no avatar espelha a câmera (rotação Y manual)
- **Exportar PNG**: `renderer.domElement.toDataURL()` pra download
- **Favoritos**: salvar seeds específicos com label customizado
- **Avatar card**: renderizar avatar como imagem estática pra preview em feed
- **Animações extras**: shrug, piscar duplo, olhar de lado ao hover
- **Body types**: expandir o busto com mais variações de largura de ombro
- **Tattoos**: texturas procedurais nas costas visíveis pelo decote
