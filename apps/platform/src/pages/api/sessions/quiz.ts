import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import type { NotesResult } from './notes';

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

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QuizRequest {
  sessionId?: string;
  title: string;
  summary?: string;
  learningObjectives?: string[];
  subtopics?: string[];
  notes?: NotesResult;           // Optional: feed in study notes for richer context
}

export interface MultipleChoiceQuestion {
  id: string;
  type: 'multiple_choice';
  question: string;
  options: string[];             // Always 4 options
  correctAnswer: string;         // Matches one of options[]
  explanation: string;
}

export interface IdentificationQuestion {
  id: string;
  type: 'identification';
  question: string;
  correctAnswer: string;
  hint?: string;
  explanation: string;
}

export type QuizQuestion = MultipleChoiceQuestion | IdentificationQuestion;

export interface QuizResult {
  questions: QuizQuestion[];
  passingScore: number;          // e.g. 70 (percent)
}

// ── n8n webhook call ──────────────────────────────────────────────────────────

async function generateQuizViaN8n(req: QuizRequest): Promise<QuizResult> {
  const webhookUrl = import.meta.env.N8N_QUIZ_WEBHOOK_URL;
  if (!webhookUrl) throw new Error('N8N_QUIZ_WEBHOOK_URL is not configured.');

  const payload = {
    session_id:          req.sessionId ?? null,
    title:               req.title,
    summary:             req.summary ?? '',
    learning_objectives: req.learningObjectives ?? [],
    subtopics:           req.subtopics ?? [],
  };

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60_000),   // n8n AI flows can take up to ~45s
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`n8n quiz webhook error ${res.status}: ${errText.slice(0, 300)}`);
  }

  // n8n Respond Success returns: JSON.stringify($json.quiz) → the raw QuizResult JSON string
  const raw = await res.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('n8n returned an unexpected response format — please retry.');
  }

  // Normalise: n8n might return the quiz wrapped or unwrapped
  const quizData = (parsed as Record<string, unknown>)?.quiz ?? parsed;

  const quiz = quizData as QuizResult;

  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    throw new Error('Quiz generation returned no questions — please retry.');
  }

  // Ensure all questions have IDs
  quiz.questions = quiz.questions.map((q, i) => ({
    ...q,
    id: q.id ?? `q${i + 1}`,
  }));

  quiz.passingScore = quiz.passingScore ?? 70;

  return quiz;
}

// ── Route ─────────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = makeSupabase(request, cookies);

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

  let body: QuizRequest;
  try {
    body = await request.json() as QuizRequest;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.title?.trim()) return json({ error: 'title is required' }, 400);

  const isRealSession = !!body.sessionId && UUID_RE.test(body.sessionId);

  // ── 1. Check DB cache ─────────────────────────────────────────────────────
  if (isRealSession) {
    const { data: row } = await supabase
      .from('study_sessions')
      .select('quiz')
      .eq('id', body.sessionId!)
      .eq('user_id', user.id)
      .single();

    if (row?.quiz) {
      return json({ quiz: row.quiz as QuizResult, cached: true });
    }
  }

  // ── 2. Generate via n8n ───────────────────────────────────────────────────
  try {
    const quiz = await generateQuizViaN8n(body);

    // ── 3. Persist to DB (fire-and-forget) ───────────────────────────────────
    if (isRealSession) {
      supabase
        .from('study_sessions')
        .update({ quiz })
        .eq('id', body.sessionId!)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) console.warn('[quiz] cache write failed:', error.message);
        });
    }

    return json({ quiz, cached: false });
  } catch (err) {
    console.error('[quiz] generation error:', err);
    return json(
      { error: err instanceof Error ? err.message : 'Failed to generate quiz.' },
      500,
    );
  }
};
