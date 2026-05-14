import { createClient } from '@supabase/supabase-js';

// No ambiente Vercel, o ideal é usar as variáveis de ambiente importadas pelo Vite:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gfaqnkmmbozmhroicqyc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYXFua21tYm96bWhyb2ljcXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2OTcxNDQsImV4cCI6MjA5NDI3MzE0NH0.vYhdQjfr1d92t_uhU504XyP2UxkANUO96X1hKOu3e-g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
