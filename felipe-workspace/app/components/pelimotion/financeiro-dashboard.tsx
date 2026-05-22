'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { IncomeEntry, ProjectExpense } from '@/lib/supabase/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function monthKey(iso: string | null | undefined): string {
  if (!iso) return 'sem-data'
  return iso.slice(0, 7) // "2026-05"
}

function monthLabel(key: string): string {
  if (key === 'sem-data') return 'Sem data'
  const [year, month] = key.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

// Últimos N meses (chaves "YYYY-MM"), mais antigo → mais recente
function lastNMonths(n: number): string[] {
  const keys: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return keys
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface ChartRow {
  mes: string
  receita: number
  custo: number
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: 'green' | 'red' | 'yellow' | 'default'
}) {
  const colorClass =
    color === 'green'
      ? 'text-emerald-400'
      : color === 'red'
      ? 'text-red-400'
      : color === 'yellow'
      ? 'text-yellow-400'
      : 'text-foreground'

  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold mt-1 ${colorClass}`}>{value}</p>
    </div>
  )
}

// Tooltip customizado do Recharts
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {fmtBRL(p.value)}
        </p>
      ))}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function FinanceiroDashboard({
  incomeEntries,
  projectExpenses,
}: {
  incomeEntries: IncomeEntry[]
  projectExpenses: ProjectExpense[]
}) {
  // ── Totais ──────────────────────────────────────────────────────────────────
  const totalReceita = incomeEntries.reduce((s, e) => s + e.value, 0)
  const totalCusto = projectExpenses.reduce((s, e) => s + e.value, 0)
  const lucro = totalReceita - totalCusto
  const aPagar = projectExpenses
    .filter((e) => !e.is_paid)
    .reduce((s, e) => s + e.value, 0)

  // ── Dados do gráfico (últimos 6 meses) ────────────────────────────────────
  const chartData = useMemo<ChartRow[]>(() => {
    const months = lastNMonths(6)

    const receitaMap: Record<string, number> = {}
    const custoMap: Record<string, number> = {}

    for (const m of months) {
      receitaMap[m] = 0
      custoMap[m] = 0
    }

    for (const entry of incomeEntries) {
      const k = monthKey(entry.entry_date)
      if (k in receitaMap) receitaMap[k] += entry.value
    }

    for (const exp of projectExpenses) {
      const k = monthKey(exp.expense_date)
      if (k in custoMap) custoMap[k] += exp.value
    }

    return months.map((m) => ({
      mes: monthLabel(m),
      receita: receitaMap[m],
      custo: custoMap[m],
    }))
  }, [incomeEntries, projectExpenses])

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Receita total" value={fmtBRL(totalReceita)} color="green" />
        <SummaryCard label="Custo total" value={fmtBRL(totalCusto)} color="red" />
        <SummaryCard
          label="Lucro"
          value={fmtBRL(lucro)}
          color={lucro >= 0 ? 'green' : 'red'}
        />
        <SummaryCard label="A pagar (pendente)" value={fmtBRL(aPagar)} color="yellow" />
      </div>

      {/* Gráfico mensal */}
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-medium mb-4">Receita vs Custo — últimos 6 meses</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) =>
                v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
              }
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              formatter={(value: string) =>
                value === 'receita' ? 'Receita' : 'Custo'
              }
            />
            <Bar dataKey="receita" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="custo" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
