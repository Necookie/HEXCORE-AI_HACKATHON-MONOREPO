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

  // Fetch all documents for the user
  const { data: docs, error: docsErr } = await supabase
    .from('documents')
    .select('id, subject_name, status, target_date')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (docsErr) return json({ error: 'Failed to load documents' }, 500);

  if (!docs || docs.length === 0) return json([], 200);

  // For each ready document, fetch session counts and next upcoming session
  const summaries = await Promise.all(
    docs.map(async (doc) => {
      if (doc.status !== 'ready') {
        return {
          id:               doc.id,
          subjectName:      doc.subject_name ?? null,
          status:           doc.status,
          targetDate:       doc.target_date,
          totalSessions:    0,
          completedSessions: 0,
          nextSessionDate:  null,
          nextSessionTitle: null,
        };
      }

      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('id, title, start_time, status')
        .eq('document_id', doc.id)
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      const allSessions = sessions ?? [];
      const totalSessions = allSessions.length;
      const completedSessions = allSessions.filter(s => s.status === 'completed').length;
      const nextSession = allSessions.find(s => s.status === 'scheduled');

      return {
        id:               doc.id,
        subjectName:      doc.subject_name ?? null,
        status:           doc.status,
        targetDate:       doc.target_date,
        totalSessions,
        completedSessions,
        nextSessionDate:  nextSession?.start_time ?? null,
        nextSessionTitle: nextSession?.title ?? null,
      };
    })
  );

  return json(summaries, 200);
};
