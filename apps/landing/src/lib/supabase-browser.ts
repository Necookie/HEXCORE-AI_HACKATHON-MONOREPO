import { createClient } from '@supabase/supabase-js';

// For static sites, we use the standard Supabase client.
// We use a getter function to ensure we don't throw an error 
// until the client is actually needed.
export const supabaseBrowserClient = () => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing! Check Cloudflare Environment Variables.');
    // Return a dummy client or throw a more descriptive error
    throw new Error('Supabase URL or Anon Key is missing.');
  }

  return createClient(supabaseUrl, supabaseKey);
};
