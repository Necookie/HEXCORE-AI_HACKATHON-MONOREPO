import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import type { StudySession, RoadmapDocument } from '../../../types/project.types';

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

export interface SessionContext {
  session:     StudySession;
  document:    RoadmapDocument;
  allSessions: StudySession[];
}

export const GET: APIRoute = async ({ request, cookies, params }) => {
  const supabase = makeSupabase(request, cookies);

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

  const { id } = params;
  if (!id) return json({ error: 'Missing session id' }, 400);

  // ── 1. Fetch the target session ───────────────────────────────────────────
  const { data: s, error: sErr } = await supabase
    .from('study_sessions')
    .select('id, document_id, module_number, title, summary, learning_objectives, subtopics, estimated_minutes, start_time, end_time, calendar_event_id, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (sErr || !s) return json({ error: 'Session not found' }, 404);

  // ── 2. Fetch parent document ──────────────────────────────────────────────
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .select('id, subject_name, target_date, hours_per_day, study_days, status, error_message')
    .eq('id', s.document_id)
    .eq('user_id', user.id)
    .single();

  if (docErr || !doc) return json({ error: 'Document not found' }, 404);

  // ── 3. Fetch all sibling sessions (for sidebar list + progress) ───────────
  const { data: siblings, error: sibErr } = await supabase
    .from('study_sessions')
    .select('id, document_id, module_number, title, summary, learning_objectives, subtopics, estimated_minutes, start_time, end_time, calendar_event_id, status')
    .eq('document_id', s.document_id)
    .eq('user_id', user.id)
    .order('start_time', { ascending: true });

  if (sibErr) return json({ error: 'Failed to load sessions' }, 500);

  const mapSession = (row: typeof s): StudySession => ({
    id:                 row.id,
    documentId:         row.document_id,
    moduleNumber:       row.module_number,
    title:              row.title,
    summary:            row.summary ?? null,
    learningObjectives: row.learning_objectives ?? [],
    subtopics:          row.subtopics ?? [],
    estimatedMinutes:   row.estimated_minutes,
    startTime:          row.start_time,
    endTime:            row.end_time,
    calendarEventId:    row.calendar_event_id ?? null,
    status:             row.status,
  });

  const context: SessionContext = {
    session:     mapSession(s),
    document: {
      id:           doc.id,
      subjectName:  doc.subject_name ?? null,
      targetDate:   doc.target_date,
      hoursPerDay:  doc.hours_per_day,
      studyDays:    doc.study_days ?? [],
      status:       doc.status,
      errorMessage: doc.error_message ?? null,
    },
    allSessions: (siblings ?? []).map(mapSession),
  };

  return json(context);
};
