import { defineMiddleware } from 'astro:middleware';
import { createServerClient } from '@supabase/ssr';

export const onRequest = defineMiddleware(async ({ url, cookies, redirect, locals, request }, next) => {
  if (!url.pathname.startsWith('/platform')) {
    return next();
  }

  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => {
          const header = request.headers.get('cookie') ?? '';
          return header.split(';').flatMap(c => {
            const [name, ...rest] = c.trim().split('=');
            return name ? [{ name: name.trim(), value: rest.join('=').trim() }] : [];
          });
        },
        setAll: (list) => list.forEach(({ name, value, options }) =>
          cookies.set(name, value, options)),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('http://localhost:4321/?auth=login', 302);
  }

  locals.user = user;
  return next();
});
