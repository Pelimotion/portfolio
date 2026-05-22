'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import type { CrmContact } from '@/lib/supabase/types'

type CrmStatus =
  | 'nao_iniciada'
  | 'prospeccao'
  | 'follow_up_1'
  | 'follow_up_2'
  | 'follow_up_3'
  | 'proposta_enviada'
  | 'relacionamento'
  | 'concluido'

const COLUMNS: { id: CrmStatus; label: string; color: string }[] = [
  { id: 'nao_iniciada',    label: 'Não Iniciada',    color: 'bg-zinc-800' },
  { id: 'prospeccao',      label: 'Prospecção',      color: 'bg-blue-900' },
  { id: 'follow_up_1',     label: 'Follow-up 1',     color: 'bg-indigo-900' },
  { id: 'follow_up_2',     label: 'Follow-up 2',     color: 'bg-violet-900' },
  { id: 'follow_up_3',     label: 'Follow-up 3',     color: 'bg-purple-900' },
  { id: 'proposta_enviada',label: 'Proposta Enviada',color: 'bg-amber-900' },
  { id: 'relacionamento',  label: 'Relacionamento',  color: 'bg-teal-900' },
  { id: 'concluido',       label: 'Concluído',       color: 'bg-green-900' },
]

const TEMP_BADGE: Record<string, string> = {
  frio:   'bg-blue-500/20 text-blue-300 border-blue-500/30',
  morno:  'bg-amber-500/20 text-amber-300 border-amber-500/30',
  quente: 'bg-red-500/20 text-red-300 border-red-500/30',
}

const TEMP_LABEL: Record<string, string> = {
  frio: '🧊 Frio', morno: '🌤 Morno', quente: '🔥 Quente',
}

const SECTOR_LABEL: Record<string, string> = {
  entretenimento: 'Entretenimento',
  produtora: 'Produtora',
  jornal: 'Jornal',
  tech: 'Tech',
  agencia: 'Agência',
  imobiliario: 'Imobiliário',
  outro: 'Outro',
}

function ContactCard({ contact }: { contact: CrmContact }) {
  return (
    <div className="rounded-lg border bg-card p-3 space-y-2 text-sm">
      <div className="font-medium leading-tight">{contact.name}</div>
      {contact.company && (
        <div className="text-muted-foreground text-xs truncate">{contact.company}</div>
      )}
      <div className="flex flex-wrap gap-1">
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs border ${TEMP_BADGE[contact.lead_temp] ?? ''}`}>
          {TEMP_LABEL[contact.lead_temp] ?? contact.lead_temp}
        </span>
        {contact.sector && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs border border-border text-muted-foreground">
            {SECTOR_LABEL[contact.sector] ?? contact.sector}
          </span>
        )}
      </div>
      {contact.revenue_brl != null && (
        <div className="text-xs text-muted-foreground">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(contact.revenue_brl)}
        </div>
      )}
    </div>
  )
}

function KanbanColumn({ column, contacts }: { column: typeof COLUMNS[0]; contacts: CrmContact[] }) {
  return (
    <div className="flex-shrink-0 w-56">
      <div className={`rounded-t-lg px-3 py-2 flex items-center justify-between ${column.color}`}>
        <span className="text-xs font-semibold text-white/90">{column.label}</span>
        <Badge variant="secondary" className="text-xs h-5 px-1.5 bg-white/10 text-white/70 border-0">
          {contacts.length}
        </Badge>
      </div>
      <div className="rounded-b-lg border border-t-0 bg-muted/10 p-2 space-y-2 min-h-[120px]">
        {contacts.map(c => (
          <ContactCard key={c.id} contact={c} />
        ))}
        {contacts.length === 0 && (
          <div className="text-center text-xs text-muted-foreground/40 py-4">—</div>
        )}
      </div>
    </div>
  )
}

export function CrmKanban({ contacts }: { contacts: CrmContact[] }) {
  const [search, setSearch] = useState('')
  const [filterTemp, setFilterTemp] = useState<string>('todos')

  const filtered = contacts.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company ?? '').toLowerCase().includes(search.toLowerCase())
    const matchTemp = filterTemp === 'todos' || c.lead_temp === filterTemp
    return matchSearch && matchTemp
  })

  const byStatus = (status: CrmStatus) => filtered.filter(c => c.crm_status === status)

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nome ou empresa..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="flex gap-1 rounded-lg border bg-muted/20 p-1">
          {['todos', 'frio', 'morno', 'quente'].map(t => (
            <button
              key={t}
              onClick={() => setFilterTemp(t)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                filterTemp === t
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'todos' ? 'Todos' : TEMP_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban horizontal com scroll */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
          {COLUMNS.map(col => (
            <KanbanColumn key={col.id} column={col} contacts={byStatus(col.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}
