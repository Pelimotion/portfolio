'use client'

import { useState } from 'react'
import { CrmKanban } from '@/components/pelimotion/crm-kanban'
import { FornecedoresList } from '@/components/pelimotion/fornecedores-list'
import type { CrmContact, Supplier } from '@/lib/supabase/types'

type Tab = 'crm' | 'fornecedores'

const TABS: { id: Tab; label: string }[] = [
  { id: 'crm', label: 'Pipeline CRM' },
  { id: 'fornecedores', label: 'Fornecedores' },
]

export function CrmView({
  contacts,
  suppliers,
}: {
  contacts: CrmContact[]
  suppliers: Supplier[]
}) {
  const [tab, setTab] = useState<Tab>('crm')

  const active = contacts.filter(c => c.crm_status !== 'concluido').length
  const hot = contacts.filter(c => c.lead_temp === 'quente').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">CRM</h1>
          <p className="text-muted-foreground text-sm mt-1">Pipeline de prospects e diretório de fornecedores</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold">{active}</div>
            <div className="text-xs text-muted-foreground">em prospecção</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-400">{hot}</div>
            <div className="text-xs text-muted-foreground">leads quentes</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <div className="text-xs text-muted-foreground">fornecedores</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border bg-muted/20 p-1 w-fit">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {tab === 'crm' && <CrmKanban contacts={contacts} />}
      {tab === 'fornecedores' && <FornecedoresList suppliers={suppliers} />}
    </div>
  )
}
