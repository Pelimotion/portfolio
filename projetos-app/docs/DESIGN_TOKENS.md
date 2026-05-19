# DESIGN TOKENS — PROJETOS-APP
**Versão:** 1.0 | **Criado:** 2026-05-19 | **Status:** Ativo

Referência completa dos tokens visuais do sistema. Qualquer dúvida sobre "qual classe usar" começa aqui.

---

## Regras Fundamentais

1. **Apenas 2 pesos de fonte:** `font-medium` (500) ou `font-semibold` (600). `font-bold`, `font-black` e outros são proibidos.
2. **`uppercase tracking-wider` apenas com `text-eyebrow`.** Nunca usar `uppercase tracking-wider` avulso.
3. **Cores via tokens semânticos**, não valores hex diretos no JSX. Ex: `bg-surface-2`, não `bg-[#1A1A1E]`.
4. **Bordas via `border-subtle/default/strong`**, não `border-white/10` ou `border-border`.

---

## Superfícies (`surface`)

Hierarquia de fundos do mais escuro (0) ao mais claro (3).

| Classe Tailwind | CSS Var | Dark | Light | Uso |
|----------------|---------|------|-------|-----|
| `bg-surface-0` | `--surface-0` | `#09090B` | `#FFFFFF` | Fundo raiz do app |
| `bg-surface-1` | `--surface-1` | `#111113` | `#FAFAFA` | Sidebar, painel lateral |
| `bg-surface-2` | `--surface-2` | `#1A1A1E` | `#F5F5F5` | Cards, modais |
| `bg-surface-3` | `--surface-3` | `#242428` | `#EEEEEE` | Hover states, inputs |
| `bg-surface-overlay` | `--surface-overlay` | `rgba(9,9,11,0.85)` | `rgba(255,255,255,0.90)` | Overlays/backdrops |

---

## Bordas Semânticas

| Classe Tailwind | CSS Var | Uso |
|----------------|---------|-----|
| `border-subtle` | `--border-subtle` | Divisores internos, bordas de card |
| `border-default` | `--border-default` | Bordas de input, separadores visíveis |
| `border-strong` | `--border-strong` | Elementos em destaque, focus rings |

---

## Status de Produção

Cada status tem variante de `Badge` correspondente.

| Token | Classe BG | Classe Text | Valor | Badge variant |
|-------|-----------|-------------|-------|---------------|
| Backlog | `bg-status-backlog` | `text-status-backlog` | `#52525B` | `<Badge variant="backlog">` |
| AI Gen | `bg-status-ai-gen` | `text-status-ai-gen` | `#6366F1` | `<Badge variant="ai-gen">` |
| Selects | `bg-status-selects` | `text-status-selects` | `#3B82F6` | `<Badge variant="selects">` |
| Motion | `bg-status-motion` | `text-status-motion` | `#A855F7` | `<Badge variant="motion">` |
| Revisão | `bg-status-revisao` | `text-status-revisao` | `#F59E0B` | `<Badge variant="revisao">` |
| Entregue | `bg-status-entregue` | `text-status-entregue` | `#22C55E` | `<Badge variant="entregue">` |

---

## Escala Tipográfica

Sempre 2 pesos: `font-medium` (500) ou `font-semibold` (600).

| Classe | Tamanho | Line Height | Peso default | Uso |
|--------|---------|-------------|-------------|-----|
| `text-display` | 36px / 2.25rem | 1.1 | semibold | Hero titles, splash screens |
| `text-h1` | 30px / 1.875rem | 1.2 | semibold | Títulos de página |
| `text-h2` | 24px / 1.5rem | 1.25 | semibold | Títulos de seção |
| `text-h3` | 20px / 1.25rem | 1.3 | medium | Sub-seções, modal headers |
| `text-body` | 15px / 0.9375rem | 1.6 | — | Texto corrido, parágrafos |
| `text-small` | 14px / 0.875rem | 1.5 | — | Labels, metadados, botões |
| `text-caption` | 12px / 0.75rem | 1.5 | — | Timestamps, hints, tooltips |
| `text-eyebrow` | 11px / 0.6875rem | 1.4 | medium | Labels de seção uppercase |

### Regra eyebrow

`text-eyebrow` SEMPRE acompanha `uppercase`. Nunca usar `uppercase tracking-wider` sem `text-eyebrow`.

```jsx
// ✅ correto
<span className="text-eyebrow uppercase text-muted-foreground/40">Configurações</span>

// ❌ proibido — tracking-wider avulso
<span className="text-[10px] font-semibold uppercase tracking-wider">Configurações</span>
```

---

## Componentes Primitivos

Todos em `src/components/ui/`. Importar sempre de lá, nunca reimplementar.

### Button

```jsx
import { Button } from '@/components/ui/Button'

<Button variant="default">Salvar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="ghost">Ver mais</Button>
<Button variant="destructive">Excluir</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="default">Normal</Button>
<Button size="lg">Grande</Button>
<Button size="icon"><Icon /></Button>

// Como link (asChild)
<Button asChild variant="ghost">
  <a href="/rota">Link</a>
</Button>
```

### Input

```jsx
import { Input } from '@/components/ui/Input'

<Input placeholder="Digite aqui..." />
<Input type="password" />
```

### Select

```jsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select'

<Select>
  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Opção A</SelectItem>
    <SelectItem value="b">Opção B</SelectItem>
  </SelectContent>
</Select>
```

### Badge

```jsx
import { Badge } from '@/components/ui/Badge'

<Badge variant="default">Padrão</Badge>
<Badge variant="secondary">Secundário</Badge>
<Badge variant="outline">Contorno</Badge>

// Status
<Badge variant="backlog">Backlog</Badge>
<Badge variant="ai-gen">AI Gen</Badge>
<Badge variant="selects">Selects</Badge>
<Badge variant="motion">Motion</Badge>
<Badge variant="revisao">Revisão</Badge>
<Badge variant="entregue">Entregue</Badge>
```

### Card

```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição opcional</CardDescription>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
  <CardFooter>Rodapé</CardFooter>
</Card>
```

### Skeleton

```jsx
import { Skeleton } from '@/components/ui/Skeleton'

<Skeleton className="h-4 w-48" />
<Skeleton className="h-10 w-full" />
```

### Tabs

```jsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'

<Tabs defaultValue="aba1">
  <TabsList>
    <TabsTrigger value="aba1">Aba 1</TabsTrigger>
    <TabsTrigger value="aba2">Aba 2</TabsTrigger>
  </TabsList>
  <TabsContent value="aba1">Conteúdo da Aba 1</TabsContent>
  <TabsContent value="aba2">Conteúdo da Aba 2</TabsContent>
</Tabs>
```

### Toggle

```jsx
import { Toggle } from '@/components/ui/Toggle'

<Toggle>Label</Toggle>
<Toggle variant="outline">Outline</Toggle>
```

---

## Página de QA Visual

Acesse `/dev/tokens` no app (rota protegida) para ver todos os tokens e componentes renderizados.

---

## Regras que Ficam Fora deste Arquivo

- Schema do Supabase → `AI_AGENT_BRIEFING.md`
- Rotas de deploy → `vercel.json`
- Lógica de auth → `shared/auth.js`
- Próximas fases do design system → `docs/UX_AUDIT_2026-05-19.md`
