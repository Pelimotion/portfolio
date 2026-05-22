'use client'

import { useState } from 'react'
import { FinanceiroDashboard } from '@/components/pelimotion/financeiro-dashboard'
import { FinanceiroSaidas } from '@/components/pelimotion/financeiro-saidas'
import { FinanceiroCaixa } from '@/components/pelimotion/financeiro-caixa'
import type { IncomeEntry, ProjectExpense, CashFlow, Project } from '@/lib/supabase/types'

type Tab = 'dashboard' | 'saidas' | 'caixa'

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'saidas', label: 'Saídas' },
  { id: 'caixa', label: 'Caixa' },
]

export function FinanceiroView({
  incomeEntries,
  projectExpenses,
  cashFlow,
  projects,
}: {
  incomeEntries: IncomeEntry[]
  projectExpenses: ProjectExpense[]
  cashFlow: CashFlow[]
  projects: Pick<Project, 'id' | 'name'>[]
}) {
  const [tab, setTab] = useState<Tab>('dashboard')

  // Para FinanceiroSaidas e FinanceiroCaixa precisamos do tipo completo de Project,
  // mas só buscamos id + name — cast seguro pois os componentes só acessam esses campos
  const projectsFull = projects as Project[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground text-sm mt-1">Receitas, despesas e caixa Pelimotion</p>
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
      {tab === 'dashboard' && (
        <FinanceiroDashboard
          incomeEntries={incomeEntries}
          projectExpenses={projectExpenses}
        />
      )}
      {tab === 'saidas' && (
        <FinanceiroSaidas
          expenses={projectExpenses}
          projects={projectsFull}
        />
      )}
      {tab === 'caixa' && (
        <FinanceiroCaixa
          cashFlow={cashFlow}
          projects={projectsFull}
        />
      )}
    </div>
  )
}
