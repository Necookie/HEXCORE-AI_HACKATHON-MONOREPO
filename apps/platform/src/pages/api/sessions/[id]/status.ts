import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

function json(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function makeSupabase(request: Request, cookies: Parameters<APIRoute>[0]['cookies']) {
  return createServerClient(
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
            const name  = c.slice(0, eq).trim();
            const value = c.slice(eq + 1).trim();
            return name ? [{ name, value }] : [];
          });
        },
        setAll: (list) =>
          list.forEach(({ name, value, options }) => cookies.set(name, value, options)),
      },
    }
  );
}

const VALID_STATUSES = ['scheduled', 'completed', 'skipped'] as const;
type SessionStatus = (typeof VALID_STATUSES)[number];

/**
 * PATCH /api/sessions/:id/status
 * Body: { status: 'completed' | 'skipped' | 'scheduled' }
 */
export const PATCH: APIRoute = async ({ request, cookies, params }) => {
  const supabase = makeSupabase(request, cookies);

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

  const { id } = params;
  if (!id) return json({ error: 'Missing session id' }, 400);

  let body: { status?: string };
  try {
    body = await request.json() as { status?: string };
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const status = body.status as SessionStatus;
  if (!VALID_STATUSES.includes(status)) {
    return json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, 400);
  }

  const { error } = await supabase
    .from('study_sessions')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('[sessions/status] update error:', error.message);
    return json({ error: 'Failed to update session status' }, 500);
  }

  return json({ ok: true, id, status });
};
