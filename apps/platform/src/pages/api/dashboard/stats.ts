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

// ── Helpers ───────────────────────────────────────────────────────────────────

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function computeStreak(sessions: Array<{ start_time: string }>): number {
  const datestrs = new Set(
    sessions.map(s => dateKey(new Date(s.start_time)))
  );

  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today.getTime() - i * 86_400_000);
    if (datestrs.has(dateKey(d))) {
      streak++;
    } else if (streak === 0 && i === 0) {
      // Today has no completed session — allow checking from yesterday
      continue;
    } else {
      break;
    }
  }

  return streak;
}

// ── ELO constants ─────────────────────────────────────────────────────────────
// 45 ELO per quiz passed. Iron → Bronze at 500.
export const ELO_PER_QUIZ = 45;

export interface DashboardStats {
  streak: number;
  elo: number;
  quizzesPassed: number;
  studyHours: number;
}

// ── Route ─────────────────────────────────────────────────────────────────────

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = makeSupabase(request, cookies);

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

  const { data: sessions, error: sessErr } = await supabase
    .from('study_sessions')
    .select('estimated_minutes, start_time')
    .eq('user_id', user.id)
    .eq('status', 'completed');

  if (sessErr) {
    console.error('[dashboard/stats] query error:', sessErr.message);
    return json({ error: 'Failed to load stats.' }, 500);
  }

  const list = sessions ?? [];

  const quizzesPassed = list.length;
  const totalMinutes  = list.reduce((sum, s) => sum + (s.estimated_minutes ?? 0), 0);
  const studyHours    = Math.round((totalMinutes / 60) * 10) / 10; // 1 decimal
  const elo           = quizzesPassed * ELO_PER_QUIZ;
  const streak        = computeStreak(list);

  return json({ streak, elo, quizzesPassed, studyHours } satisfies DashboardStats);
};
