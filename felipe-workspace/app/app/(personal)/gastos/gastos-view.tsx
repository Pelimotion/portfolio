'use client'

import { useState, useMemo } from 'react'
import type { Database } from '@/lib/supabase/types'

type Expense = Database['personal']['Tables']['expenses']['Row']

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR')
}

function getCompetenceMes(iso: string | null | undefined) {
  if (!iso) return ''
  return iso.slice(0, 7) // "YYYY-MM"
}

export function GastosView({ expenses }: { expenses: Expense[] }) {
  const now = new Date()
  const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [mesFiltro, setMesFiltro] = useState<string>(mesAtual)
  const [filterPago, setFilterPago] = useState<'todos' | 'pago' | 'pendente'>('todos')

  // Lista de meses disponíveis
  const meses = useMemo(() => {
    const set = new Set<string>()
    expenses.forEach((e) => {
      const m = getCompetenceMes(e.competence_date)
      if (m) set.add(m)
    })
    return Array.from(set).sort().reverse()
  }, [expenses])

  const filtered = useMemo(() =>
    expenses.filter((e) => {
      const matchMes = !mesFiltro || getCompetenceMes(e.competence_date) === mesFiltro
      const matchPago =
        filterPago === 'todos' ||
        (filterPago === 'pago' && e.is_paid) ||
        (filterPago === 'pendente' && !e.is_paid)
      return matchMes && matchPago
    }), [expenses, mesFiltro, filterPago])

  const totalPendente = filtered.filter((e) => !e.is_paid).reduce((s, e) => s + e.value, 0)
  const totalPago = filtered.filter((e) => e.is_paid).reduce((s, e) => s + e.value, 0)
  const totalGeral = filtered.reduce((s, e) => s + e.value, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Gastos</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Despesas pessoais</p>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: totalGeral, color: '' },
          { label: 'Pago', value: totalPago, color: 'text-emerald-400' },
          { label: 'Pendente', value: totalPendente, color: 'text-yellow-400' },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>{fmtBRL(c.value)}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={mesFiltro}
          onChange={(e) => setMesFiltro(e.target.value)}
          className="h-8 rounded-md border bg-transparent px-3 text-sm outline-none text-foreground"
        >
          <option value="">Todos os meses</option>
          {meses.map((m) => (
            <option key={m} value={m}>
              {new Date(m + '-01T00:00:00').toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
              })}
            </option>
          ))}
        </select>

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
          {filtered.length} itens
        </span>
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nenhum gasto encontrado.
        </p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20 text-muted-foreground text-xs">
                <th className="text-left px-4 py-2.5 font-medium">Descrição</th>
                <th className="text-left px-4 py-2.5 font-medium hidden sm:table-cell">Vencimento</th>
                <th className="text-left px-4 py-2.5 font-medium hidden md:table-cell">Tipo</th>
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
                  <td className="px-4 py-3 font-medium">
                    <span>{e.name}</span>
                    {e.is_recurring && (
                      <span className="ml-2 text-xs text-muted-foreground">↺</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {fmtDate(e.due_date)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell capitalize">
                    {e.expense_type?.replace('_', ' ') ?? '—'}
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
