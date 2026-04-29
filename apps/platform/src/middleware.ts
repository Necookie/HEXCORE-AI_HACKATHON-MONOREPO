import { defineMiddleware } from 'astro:middleware';
import { createServerClient } from '@supabase/ssr';

function getLandingUrl(request: Request): string {
  if (import.meta.env.PUBLIC_LANDING_URL) return import.meta.env.PUBLIC_LANDING_URL;
  const host = request.headers.get('host') ?? '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  return isLocal ? 'http://localhost:4321' : 'https://sb.necookie.dev';
}

export const onRequest = defineMiddleware(async ({ url, cookies, redirect, locals, request }, next) => {
  // Inject GROQ_API_KEY from Cloudflare runtime into locals for all API routes.
  // Must be done before the /platform auth guard so API routes under /api also benefit.
  // import.meta.env.GROQ_API_KEY is Vite build-time only — always undefined in
  // Cloudflare Workers at runtime. The actual value lives in locals.runtime.env.
  const cfRuntime = (locals as { runtime?: { env?: { GROQ_API_KEY?: string } } }).runtime;
  locals.groqApiKey =
    import.meta.env.GROQ_API_KEY ||   // local dev via .env file
    cfRuntime?.env?.GROQ_API_KEY ||   // Cloudflare Pages production binding
    '';

  if (!url.pathname.startsWith('/platform')) return next();

  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => {
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

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    const landingBase = getLandingUrl(request);
    const next = encodeURIComponent(url.pathname + url.search);
    return redirect(`${landingBase}/?auth=required&next=${next}`, 302);
  }

  locals.user = user;
  return next();
});
