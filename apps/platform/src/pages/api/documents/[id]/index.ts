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

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  const supabase = makeSupabase(request, cookies);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

  const documentId = params.id;
  if (!documentId) return json({ error: 'Missing document ID' }, 400);

  // ── 1. Fetch document (verify ownership + get storage path) ────────────────
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .select('id, storage_path, user_id')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single();

  if (docErr || !doc) return json({ error: 'Document not found' }, 404);

  // ── 2. Collect calendar event IDs before deleting sessions ────────────────
  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('calendar_event_id')
    .eq('document_id', documentId)
    .eq('user_id', user.id);

  const calendarEventIds = (sessions ?? [])
    .map(s => s.calendar_event_id)
    .filter((id): id is string => Boolean(id));

  // ── 3. Fire-and-forget: ask n8n to delete Google Calendar events ───────────
  const deleteWebhookUrl = import.meta.env.N8N_DELETE_WEBHOOK_URL;
  if (deleteWebhookUrl && calendarEventIds.length > 0) {
    fetch(deleteWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ calendar_event_ids: calendarEventIds }),
      signal: AbortSignal.timeout(5_000),
    }).catch(err => console.error('[delete] n8n calendar delete webhook error:', err));
  }

  // ── 4. Delete PDF from Supabase Storage (best-effort, don't block) ─────────
  if (doc.storage_path) {
    const { error: storageErr } = await supabase.storage
      .from('study-pdfs')
      .remove([doc.storage_path]);
    if (storageErr) {
      console.warn('[delete] storage remove failed (continuing):', storageErr.message);
    }
  }

  // ── 5. Delete document row — FK cascade removes study_sessions too ─────────
  const { error: deleteErr } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('user_id', user.id);

  if (deleteErr) {
    console.error('[delete] db delete error:', deleteErr.message);
    return json({ error: 'Failed to delete document' }, 500);
  }

  return json({ success: true }, 200);
};
