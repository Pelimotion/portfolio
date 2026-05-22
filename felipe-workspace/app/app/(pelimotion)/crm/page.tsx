import { createSupabaseServer } from '@/lib/supabase/server'
import { CrmView } from './crm-view'
import type { CrmContact, Supplier } from '@/lib/supabase/types'

export default async function CrmPage() {
  const supabase = await createSupabaseServer()

  const [{ data: contacts }, { data: suppliers }] = await Promise.all([
    supabase
      .schema('pelimotion')
      .from('crm_contacts')
      .select('*')
      .order('updated_at', { ascending: false }),
    supabase
      .schema('pelimotion')
      .from('suppliers')
      .select('*')
      .order('name'),
  ])

  return (
    <CrmView
      contacts={(contacts ?? []) as CrmContact[]}
      suppliers={(suppliers ?? []) as Supplier[]}
    />
  )
}
