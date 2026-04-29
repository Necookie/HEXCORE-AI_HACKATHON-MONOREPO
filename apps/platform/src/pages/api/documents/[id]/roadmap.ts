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

  // Fetch document metadata
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .select('id, subject_name, target_date, hours_per_day, study_days, status, error_message')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (docErr || !doc) return json({ error: 'Document not found' }, 404);

  // Fetch all sessions for this document ordered by scheduled time
  const { data: sessions, error: sessErr } = await supabase
    .from('study_sessions')
    .select('id, document_id, module_number, title, summary, learning_objectives, subtopics, estimated_minutes, start_time, end_time, calendar_event_id, status')
    .eq('document_id', id)
    .eq('user_id', user.id)
    .order('start_time', { ascending: true });

  if (sessErr) return json({ error: 'Failed to load sessions' }, 500);

  const mappedSessions = (sessions ?? []).map(s => ({
    id:                 s.id,
    documentId:         s.document_id,
    moduleNumber:       s.module_number,
    title:              s.title,
    summary:            s.summary ?? null,
    learningObjectives: s.learning_objectives ?? [],
    subtopics:          s.subtopics ?? [],
    estimatedMinutes:   s.estimated_minutes,
    startTime:          s.start_time,
    endTime:            s.end_time,
    calendarEventId:    s.calendar_event_id ?? null,
    status:             s.status,
  }));

  return json({
    document: {
      id:           doc.id,
      subjectName:  doc.subject_name ?? null,
      targetDate:   doc.target_date,
      hoursPerDay:  doc.hours_per_day,
      studyDays:    doc.study_days ?? [],
      status:       doc.status,
      errorMessage: doc.error_message ?? null,
    },
    sessions: mappedSessions,
  }, 200);
};
