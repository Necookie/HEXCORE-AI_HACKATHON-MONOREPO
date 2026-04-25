import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export const supabaseBrowserClient = () => {
  if (client) return client;

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing! Check Cloudflare Environment Variables.');
    throw new Error('Supabase URL or Anon Key is missing.');
  }

  client = createClient(supabaseUrl, supabaseKey);
  return client;
};
