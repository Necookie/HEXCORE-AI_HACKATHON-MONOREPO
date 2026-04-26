import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

function getLandingUrl(request: Request): string {
  if (import.meta.env.PUBLIC_LANDING_URL) return import.meta.env.PUBLIC_LANDING_URL;
  const host = request.headers.get('host') ?? '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  return isLocal ? 'http://localhost:4321' : 'https://sb.necookie.dev';
}

export const POST: APIRoute = async ({ cookies, redirect, request }) => {
  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => {
          if (typeof cookies.getAll === 'function') {
            return cookies.getAll().map(c => ({ name: c.name, value: c.value }));
          }
          const header = request.headers.get('cookie') ?? '';
          return header.split(';').flatMap(c => {
            const eq = c.indexOf('=');
            if (eq === -1) return [];
            const name = c.slice(0, eq).trim();
            const value = c.slice(eq + 1).trim();
            return name ? [{ name, value }] : [];
          });
        },
        setAll: (list) =>
          list.forEach(({ name, value, options }) => cookies.set(name, value, options)),
      },
    }
  );

  await supabase.auth.signOut();

  // ?so=1 tells the landing page to clear stale localStorage and skip redirect
  return redirect(`${getLandingUrl(request)}/?so=1`, 302);
};
