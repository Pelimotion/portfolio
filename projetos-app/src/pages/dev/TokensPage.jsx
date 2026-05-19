import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Toggle } from '@/components/ui/Toggle'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select'

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-eyebrow uppercase text-muted-foreground/50 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-3">
      <span className="text-caption text-muted-foreground/40 w-28 shrink-0">{label}</span>
      {children}
    </div>
  )
}

export default function TokensPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-h1 font-semibold text-foreground">Design Tokens</h1>
        <p className="text-body text-muted-foreground mt-1">Página de QA visual — todos os primitivos do design system.</p>
      </div>

      {/* TIPOGRAFIA */}
      <Section title="Escala Tipográfica">
        <div className="space-y-2 bg-surface-2 rounded-lg p-4 border border-subtle">
          <p className="text-display font-semibold">display — 36px</p>
          <p className="text-h1 font-semibold">h1 — 30px</p>
          <p className="text-h2 font-semibold">h2 — 24px</p>
          <p className="text-h3 font-medium">h3 — 20px</p>
          <p className="text-body">body — 15px — texto corrido e parágrafos</p>
          <p className="text-small text-muted-foreground">small — 14px — labels e metadados</p>
          <p className="text-caption text-muted-foreground/60">caption — 12px — timestamps e hints</p>
          <p className="text-eyebrow uppercase text-muted-foreground/40">eyebrow — 11px — sempre uppercase</p>
        </div>
      </Section>

      {/* SUPERFÍCIES */}
      <Section title="Superfícies">
        <div className="grid grid-cols-5 gap-2">
          {['bg-surface-0','bg-surface-1','bg-surface-2','bg-surface-3'].map(c => (
            <div key={c} className={`${c} border border-default rounded-lg p-3`}>
              <p className="text-caption text-foreground/60">{c.replace('bg-','')}</p>
            </div>
          ))}
          <div className="bg-surface-overlay border border-default rounded-lg p-3">
            <p className="text-caption text-foreground/60">overlay</p>
          </div>
        </div>
      </Section>

      {/* BORDAS */}
      <Section title="Bordas Semânticas">
        <div className="flex gap-4">
          {['subtle','default','strong'].map(b => (
            <div key={b} className={`border-2 border-${b} bg-surface-2 rounded-lg px-4 py-3 flex-1`}>
              <p className="text-caption text-foreground/60">border-{b}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* STATUS */}
      <Section title="Status de Produção">
        <Row label="badges">
          {['backlog','ai-gen','selects','motion','revisao','entregue'].map(v => (
            <Badge key={v} variant={v}>{v}</Badge>
          ))}
        </Row>
        <Row label="texto">
          {['backlog','ai-gen','selects','motion','revisao','entregue'].map(v => (
            <span key={v} className={`text-status-${v} text-small font-medium`}>{v}</span>
          ))}
        </Row>
      </Section>

      {/* BUTTON */}
      <Section title="Button">
        <Row label="variantes">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </Row>
        <Row label="tamanhos">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </Row>
        <Row label="estado">
          <Button disabled>Disabled</Button>
        </Row>
      </Section>

      {/* INPUT */}
      <Section title="Input">
        <Row label="normal">
          <Input className="max-w-xs" placeholder="Digite aqui..." />
        </Row>
        <Row label="disabled">
          <Input className="max-w-xs" placeholder="Desabilitado" disabled />
        </Row>
      </Section>

      {/* SELECT */}
      <Section title="Select">
        <Row label="normal">
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Opção A</SelectItem>
              <SelectItem value="b">Opção B</SelectItem>
              <SelectItem value="c">Opção C</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      </Section>

      {/* BADGE */}
      <Section title="Badge">
        <Row label="base">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </Row>
      </Section>

      {/* CARD */}
      <Section title="Card">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Título do Card</CardTitle>
            <CardDescription>Descrição opcional em text-small muted.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body text-muted-foreground">Conteúdo do card. Usa bg-surface-1 e border-subtle.</p>
          </CardContent>
        </Card>
      </Section>

      {/* SKELETON */}
      <Section title="Skeleton">
        <div className="space-y-2 max-w-sm">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full mt-2" />
        </div>
      </Section>

      {/* TABS */}
      <Section title="Tabs">
        <Tabs defaultValue="aba1">
          <TabsList>
            <TabsTrigger value="aba1">Overview</TabsTrigger>
            <TabsTrigger value="aba2">Detalhes</TabsTrigger>
            <TabsTrigger value="aba3">Histórico</TabsTrigger>
          </TabsList>
          <TabsContent value="aba1">
            <p className="text-body text-muted-foreground mt-3">Conteúdo da aba Overview.</p>
          </TabsContent>
          <TabsContent value="aba2">
            <p className="text-body text-muted-foreground mt-3">Conteúdo da aba Detalhes.</p>
          </TabsContent>
          <TabsContent value="aba3">
            <p className="text-body text-muted-foreground mt-3">Conteúdo da aba Histórico.</p>
          </TabsContent>
        </Tabs>
      </Section>

      {/* TOGGLE */}
      <Section title="Toggle">
        <Row label="variantes">
          <Toggle>Default</Toggle>
          <Toggle variant="outline">Outline</Toggle>
        </Row>
      </Section>
    </div>
  )
}
