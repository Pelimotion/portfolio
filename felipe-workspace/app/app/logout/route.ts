import { createSupabaseServer } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServer()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/pelispace/login', req.url))
}
