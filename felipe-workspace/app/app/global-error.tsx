'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html>
      <body className="bg-background text-foreground">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold">
            P
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Pelimotion OS</h1>
            <h2 className="text-lg font-semibold text-destructive">Erro crítico</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              O sistema encontrou um erro inesperado.
              {error.digest ? ` Código: ${error.digest}` : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted/30 transition-colors"
            >
              Tentar novamente
            </button>
            <a
              href="/pelispace/logout"
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sair da conta
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            Ou acesse diretamente:{' '}
            <a href="/pelispace/login" className="underline underline-offset-2">
              /pelispace/login
            </a>
          </p>
        </div>
      </body>
    </html>
  )
}
