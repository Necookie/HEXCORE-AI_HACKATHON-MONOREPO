import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const debugId = `delete-account:${Date.now().toString(36)}`;

  try {
    console.info(`[${debugId}] request received`);

    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(`[${debugId}] missing public Supabase env`, {
        hasUrl: Boolean(supabaseUrl),
        hasAnonKey: Boolean(supabaseAnonKey),
      });
      return json(
        {
          error: 'Server configuration error: Supabase public env is missing.',
          debugId,
        },
        500,
      );
    }

    // 1. Check if user is authenticated
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll: () => {
            if (typeof cookies.getAll === 'function') {
              try {
                return cookies.getAll().map(c => ({ name: c.name, value: c.value }));
              } catch (e) {
                console.warn(`[${debugId}] supabase client cookies.getAll failed`, e);
              }
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
      },
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      console.warn(`[${debugId}] auth lookup failed`, {
        message: authErr?.message,
        hasUser: Boolean(user),
      });
      return json({ error: 'Unauthorised', debugId }, 401);
    }

    const serviceRoleKey =
      import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error(`[${debugId}] SUPABASE_SERVICE_ROLE_KEY is not set.`);
      return json(
        {
          error: 'Server configuration error: Missing service role key.',
          debugId,
        },
        500,
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error(`[${debugId}] admin.deleteUser failed`, {
        userId: user.id,
        message: deleteError.message,
        status: deleteError.status,
        code: deleteError.code,
        name: deleteError.name,
      });
      return json(
        {
          error: deleteError.message,
          debugId,
        },
        500,
      );
    }

    // 3. Clear session cookies on server side
    // Clear every Supabase auth cookie variant created by SSR helpers.
    let allCookies: { name: string; value: string }[] = [];
    if (typeof cookies.getAll === 'function') {
      try {
        allCookies = cookies.getAll().map(c => ({ name: c.name, value: c.value }));
      } catch (e) {
        console.warn(`[${debugId}] cookies.getAll failed or not iterable`, e);
      }
    }

    if (allCookies.length === 0) {
      // Fallback: manual parse from headers
      const header = request.headers.get('cookie') ?? '';
      allCookies = header.split(';').flatMap(c => {
        const eq = c.indexOf('=');
        if (eq === -1) return [];
        const name = c.slice(0, eq).trim();
        const value = c.slice(eq + 1).trim();
        return name ? [{ name, value }] : [];
      });
    }

    for (const cookie of allCookies) {
      if (cookie.name.startsWith('sb-')) {
        cookies.delete(cookie.name, { path: '/' });
      }
    }

    console.info(`[${debugId}] account deleted`, { userId: user.id });
    return json({ ok: true, debugId }, 200);
  } catch (error) {
    console.error(`[${debugId}] unhandled exception`, error);
    return json(
      {
        error: 'Unexpected server error during account deletion.',
        debugId,
      },
      500,
    );
  }
};
