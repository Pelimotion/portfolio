'use client'

import { useState, useMemo } from 'react'
import type { Supplier } from '@/lib/supabase/types'

function StarRating({ rating, votes }: { rating: number | null; votes: number | null }) {
  if (rating == null) return <span className="text-muted-foreground/40 text-xs">—</span>
  const full = Math.round(rating)
  return (
    <span className="flex items-center gap-1">
      <span className="text-amber-400 text-xs">{'★'.repeat(full)}{'☆'.repeat(5 - full)}</span>
      {votes != null && <span className="text-muted-foreground text-xs">({votes})</span>}
    </span>
  )
}

export function FornecedoresList({ suppliers }: { suppliers: Supplier[] }) {
  const [search, setSearch] = useState('')
  const [filterState, setFilterState] = useState<string>('todos')

  const states = useMemo(() => {
    const set = new Set(suppliers.map(s => s.state).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [suppliers])

  const filtered = useMemo(() => {
    return suppliers.filter(s => {
      const matchSearch = !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.city ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (s.neighborhood ?? '').toLowerCase().includes(search.toLowerCase())
      const matchState = filterState === 'todos' || s.state === filterState
      return matchSearch && matchState
    })
  }, [suppliers, search, filterState])

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nome, cidade ou bairro..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm w-72 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <select
          value={filterState}
          onChange={e => setFilterState(e.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="todos">Todos os estados</option>
          {states.map(st => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
        <span className="self-center text-sm text-muted-foreground">
          {filtered.length} fornecedor{filtered.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* Tabela */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Localização</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Avaliação</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contato</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Notas</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                  Nenhum fornecedor encontrado
                </td>
              </tr>
            )}
            {filtered.map((s, i) => (
              <tr
                key={s.id}
                className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/5'}`}
              >
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div>{[s.city, s.state].filter(Boolean).join(' — ')}</div>
                  {s.neighborhood && (
                    <div className="text-xs text-muted-foreground/70">{s.neighborhood}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StarRating rating={s.rating} votes={s.votes} />
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    {s.phone && (
                      <div className="text-xs text-muted-foreground">{s.phone}</div>
                    )}
                    {s.website && (
                      <a
                        href={s.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Site ↗
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs">
                  <div className="line-clamp-2">{s.notes ?? '—'}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
