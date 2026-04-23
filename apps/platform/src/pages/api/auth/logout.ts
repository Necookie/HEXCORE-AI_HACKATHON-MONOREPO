import type { APIRoute } from 'astro';
import { supabaseClient } from '../../../lib/supabase';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const supabase = supabaseClient(cookies);
  
  // Sign out server-side
  await supabase.auth.signOut();
  
  // Delete the sb- access token and refresh token cookies if they exist
  // supabase-js handles this internally, but to be sure we can clear known auth cookies
  // Actually, supabase.auth.signOut() handles it for the specific cookies when using @supabase/ssr.

  return redirect('http://localhost:4321/');
};
