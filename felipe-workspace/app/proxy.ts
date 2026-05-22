import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cs) =>
          cs.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Com basePath '/pelispace', request.nextUrl.pathname já NÃO inclui o basePath.
  // Ex: usuário acessa /pelispace/projetos → pathname aqui é /projetos
  //     usuário acessa /pelispace/login   → pathname aqui é /login
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/pelispace/login', request.url))
  }

  return response
}

export const config = {
  // Exclui /login (sem basePath) além dos assets estáticos.
  // O basePath é stripado pelo Next.js antes de chegar aqui.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login).*)'],
}
