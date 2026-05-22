'use client'

import { useState, useMemo } from 'react'
import type { ProjectExpense, Project } from '@/lib/supabase/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR')
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function FinanceiroSaidas({
  expenses,
  projects,
}: {
  expenses: ProjectExpense[]
  projects: Project[]
}) {
  const [search, setSearch] = useState('')
  const [filterPago, setFilterPago] = useState<'todos' | 'pago' | 'pendente'>('todos')

  const projectMap = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.id, p.name])),
    [projects]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return expenses.filter((e) => {
      const matchSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        (e.supplier ?? '').toLowerCase().includes(q)
      const matchPago =
        filterPago === 'todos' ||
        (filterPago === 'pago' && e.is_paid) ||
        (filterPago === 'pendente' && !e.is_paid)
      return matchSearch && matchPago
    })
  }, [expenses, search, filterPago])

  const totalFiltrado = filtered.reduce((s, e) => s + e.value, 0)

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Buscar por nome ou fornecedor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 rounded-md border bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring w-64"
        />
        <div className="flex rounded-md border overflow-hidden text-sm">
          {(['todos', 'pago', 'pendente'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilterPago(opt)}
              className={`px-3 py-1.5 capitalize transition-colors border-l first:border-l-0 ${
                filterPago === opt
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted/30 text-muted-foreground'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} itens · total {fmtBRL(totalFiltrado)}
        </span>
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Nenhuma saída encontrada.
        </p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20 text-muted-foreground text-xs">
                <th className="text-left px-4 py-2.5 font-medium">Descrição</th>
                <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">Fornecedor</th>
                <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Projeto</th>
                <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">Data</th>
                <th className="text-right px-4 py-2.5 font-medium">Valor</th>
                <th className="text-center px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr
                  key={e.id}
                  className={`border-b last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/5'}`}
                >
                  <td className="px-4 py-3 font-medium">{e.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {e.supplier ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {e.project_id ? (projectMap[e.project_id] ?? '—') : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {fmtDate(e.expense_date)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-red-400">
                    {fmtBRL(e.value)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                        e.is_paid
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                      }`}
                    >
                      {e.is_paid ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
