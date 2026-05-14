import { createClient } from '@supabase/supabase-js';

// No ambiente Vercel, o ideal é usar as variáveis de ambiente importadas pelo Vite:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'PREENCHER';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'PREENCHER';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
