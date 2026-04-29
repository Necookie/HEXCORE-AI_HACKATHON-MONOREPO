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

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = makeSupabase(request, cookies);

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

  // Calculate today's date range using the server's local time.
  // getFullYear/Month/Date are local-timezone methods, so this matches
  // what the user sees on their clock rather than UTC midnight.
  const now   = new Date();
  const y = now.getFullYear(), mo = now.getMonth(), d = now.getDate();
  const start = new Date(y, mo, d,  0,  0,  0);
  const end   = new Date(y, mo, d, 23, 59, 59);

  const { data: sessions, error: sessErr } = await supabase
    .from('study_sessions')
    .select('id, document_id, title, estimated_minutes, start_time, status, documents(subject_name)')
    .eq('user_id', user.id)
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString())
    .order('start_time', { ascending: true });

  if (sessErr) return json({ error: 'Failed to load sessions' }, 500);

  const todaySessions = (sessions ?? []).map(s => ({
    id:               s.id,
    documentId:       s.document_id,
    subjectName:      (s.documents as { subject_name: string | null } | null)?.subject_name ?? null,
    title:            s.title,
    estimatedMinutes: s.estimated_minutes,
    startTime:        s.start_time,
    status:           s.status,
  }));

  return json(todaySessions, 200);
};
