'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function PelimotionError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[PelimotionError]', error)
  }, [error])

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Erro ao carregar a página</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Ocorreu um erro no servidor.{error.digest ? ` (${error.digest})` : ''}
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          Tentar novamente
        </Button>
        <a
          href="/pelispace/logout"
          className="inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium hover:bg-muted hover:text-foreground transition-colors"
        >
          Sair
        </a>
      </div>
    </div>
  )
}
