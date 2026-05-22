'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { Project } from '@/lib/supabase/types'

// ─── Stage helpers ────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  negociacao: 'Negociação',
  briefing: 'Briefing',
  debriefing: 'Debriefing',
  roteiro: 'Roteiro',
  storyboard: 'Storyboard',
  montagem: 'Montagem',
  criacao: 'Criação',
  animacao: 'Animação',
  aprovacao_1: 'Aprovação',
  alteracao: 'Alteração',
  finalizacao: 'Finalização',
  espera: 'Espera',
  concluido: 'Concluído',
  fixo: 'Fixo',
  pagamento: 'Pagamento',
}

const STAGE_COLORS: Record<string, string> = {
  negociacao: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  briefing: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  debriefing: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  roteiro: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  storyboard: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  montagem: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  criacao: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  animacao: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  aprovacao_1: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  alteracao: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  finalizacao: 'bg-green-500/15 text-green-400 border-green-500/30',
  espera: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  concluido: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  fixo: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
  pagamento: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
}

function StageBadge({ stage }: { stage: string }) {
  const color = STAGE_COLORS[stage] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30'
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}>
      {STAGE_LABELS[stage] ?? stage}
    </span>
  )
}

function fmtBRL(value: number | null | undefined) {
  if (value == null) return '—'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

// ─── Columns ─────────────────────────────────────────────────────────────────

const COLUMNS: ColumnDef<Project>[] = [
  {
    accessorKey: 'name',
    header: 'Projeto',
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'client',
    header: 'Cliente',
    cell: ({ getValue }) => getValue<string | null>() ?? '—',
  },
  {
    accessorKey: 'stage',
    header: 'Stage',
    cell: ({ getValue }) => <StageBadge stage={getValue<string>()} />,
    filterFn: (row, columnId, filterValue) =>
      filterValue === '' || row.getValue(columnId) === filterValue,
  },
  {
    accessorKey: 'total_value',
    header: 'Valor Total',
    cell: ({ getValue }) => fmtBRL(getValue<number | null>()),
  },
  {
    accessorKey: 'profit',
    header: 'Lucro',
    cell: ({ row }) => {
      const profit = row.original.profit
      const color = profit == null ? '' : profit >= 0 ? 'text-emerald-400' : 'text-red-400'
      return <span className={color}>{fmtBRL(profit)}</span>
    },
  },
  {
    accessorKey: 'next_delivery_at',
    header: 'Próxima Entrega',
    cell: ({ getValue }) => fmtDate(getValue<string | null>()),
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

export function ProjetosTable({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [stageFilter, setStageFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (stageFilter && p.stage !== stageFilter) return false
      if (clientFilter && !(p.client ?? '').toLowerCase().includes(clientFilter.toLowerCase())) return false
      return true
    })
  }, [projects, stageFilter, clientFilter])

  const table = useReactTable({
    data: filtered,
    columns: COLUMNS,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const uniqueStages = useMemo(
    () => Array.from(new Set(projects.map((p) => p.stage))).sort(),
    [projects]
  )

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Filtrar por cliente..."
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="w-48"
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Todos os stages</option>
          {uniqueStages.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s] ?? s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b bg-muted/50">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && ' ↑'}
                      {header.column.getIsSorted() === 'desc' && ' ↓'}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum projeto encontrado.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => router.push(`/projetos/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} de {projects.length} projetos
      </p>
    </div>
  )
}
