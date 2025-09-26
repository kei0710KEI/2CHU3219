// /lib/supabaseClients.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database, RegionKey } from '@/types/supabase';

function fromEnv(prefix: 'JP' | 'US' | 'EU'): SupabaseClient<Database> {
  const url = process.env[`NEXT_PUBLIC_SUPABASE_URL_${prefix}`];
  const key = process.env[`NEXT_PUBLIC_SUPABASE_ANON_KEY_${prefix}`];
  if (!url || !key) {
    throw new Error(`Missing Supabase env for ${prefix}`);
  }
  // ★ ここが肝：Database 型をジェネリクスで渡す
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}

export const clients: Record<RegionKey, SupabaseClient<Database>> = {
  JP: fromEnv('JP'),
  US: fromEnv('US'),
  EU: fromEnv('EU'),
};

export type { RegionKey } from '@/types/supabase';

