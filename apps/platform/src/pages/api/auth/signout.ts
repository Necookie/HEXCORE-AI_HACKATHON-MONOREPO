// src/pages/api/auth/signout.ts – Server-side sign out handler
import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

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
          const cookieHeader = request.headers.get('cookie') ?? '';
          return cookieHeader.split(';').map(c => {
            const [name, ...value] = c.trim().split('=');
            return { name, value: value.join('=') };
          }).filter(c => c.name !== '');
        },
        setAll: (cookieList) =>
          cookieList.forEach(({ name, value, options }) => cookies.set(name, value, options)),
      },
    }
  );

  await supabase.auth.signOut();
  // Redirect to landing page after sign out
  return redirect('http://localhost:4321/', 302);
};
