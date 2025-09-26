// /lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const adminUrl = process.env.SUPABASE_SERVICE_ROLE_URL!;
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!adminUrl || !adminKey) {
  console.warn('[RLS DEMO] Service role env missing. Admin API will fail.');
}

export const supabaseAdmin = createClient<Database>(adminUrl, adminKey, {
  auth: { persistSession: false }
});
