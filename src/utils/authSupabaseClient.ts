import { createClient } from '@supabase/supabase-js';

// Supabase 2: Autenticación, Usuarios y Perfiles
export const AUTH_SUPABASE_URL =
  import.meta.env.VITE_AUTH_SUPABASE_URL || 'https://uawyiubcubczmujetczo.supabase.co';

export const AUTH_SUPABASE_ANON_KEY =
  import.meta.env.VITE_AUTH_SUPABASE_ANON_KEY || 'sb_publishable_mpnDW2dhMQv5706gNlxvQw_S4HmrPQD';

export const supabaseAuth = createClient(AUTH_SUPABASE_URL, AUTH_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
