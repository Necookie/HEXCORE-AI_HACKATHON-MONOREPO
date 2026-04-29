import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

function json(body: object, status: number): Response {
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

export const GET: APIRoute = async ({ request, cookies, params }) => {
  const supabase = makeSupabase(request, cookies);

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

  const { id } = params;
  if (!id) return json({ error: 'Missing document id' }, 400);

  const { data, error } = await supabase
    .from('documents')
    .select('status, error_message, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) return json({ error: 'Document not found' }, 404);

  // ── Stuck-workflow detection ───────────────────────────────────────────────
  // If n8n fails without updating the DB, the status stays 'processing' forever.
  // We detect this by checking: still processing after 5 min with no sessions created.
  if (data.status === 'processing') {
    const ageMs = Date.now() - new Date(data.created_at).getTime();
    const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

    if (ageMs > TIMEOUT_MS) {
      // Check whether any study_sessions were created for this document
      const { count } = await supabase
        .from('study_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('document_id', id)
        .eq('user_id', user.id);

      if (!count || count === 0) {
        // Persist the error state so subsequent polls return quickly
        await supabase
          .from('documents')
          .update({ status: 'error', error_message: 'Processing timed out. The AI workflow did not complete.' })
          .eq('id', id)
          .eq('user_id', user.id);

        return json({
          status: 'error',
          errorMessage: 'Processing timed out. The AI workflow did not complete.',
        }, 200);
      }
    }
  }

  return json({ status: data.status, errorMessage: data.error_message ?? null }, 200);
};
