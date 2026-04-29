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

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FlashcardRequest {
  sessionId: string;
  title: string;
  summary?: string;
  learningObjectives?: string[];
  subtopics?: string[];
}

export interface Flashcard {
  id: string;
  front: string;   // Term / question
  back: string;    // Definition / answer
  hint?: string;
}

export interface FlashcardDeck {
  cards: Flashcard[];
}

// ── Groq generation ───────────────────────────────────────────────────────────

async function generateFlashcards(req: FlashcardRequest): Promise<FlashcardDeck> {
  const groqKey = import.meta.env.GROQ_API_KEY;
  if (!groqKey) throw new Error('GROQ_API_KEY is not configured.');

  const systemPrompt = `You are StudyBearer's flashcard engine. Return ONLY raw JSON — no markdown fences, no explanation, nothing else.

Topic: ${req.title}
Overview: ${req.summary ?? ''}
Subtopics: ${(req.subtopics ?? []).join(', ')}
Learning Objectives: ${(req.learningObjectives ?? []).join('; ')}

Generate exactly 10 flashcards that drill key concepts, definitions, and applications.

Rules:
- front: a clear, concise question or term (max 120 chars)
- back: the precise answer or definition (max 200 chars)
- hint: optional short clue (max 60 chars) — include for harder cards
- Vary difficulty: 3 easy, 4 medium, 3 hard
- Test understanding, not rote recall — ask "why", "how", and application questions too
- IDs must be "f1" through "f10"

Return this exact JSON structure and nothing else:
{"cards":[{"id":"f1","front":"What is...","back":"It is...","hint":"Think about..."},{"id":"f2","front":"How does...","back":"It works by..."}]}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: 'Generate the flashcard deck now. Return only the JSON object.' },
      ],
      temperature: 0.6,
      max_tokens: 2048,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Groq API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const groqRes = await res.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const raw = groqRes.choices?.[0]?.message?.content ?? '';

  // Strip markdown fences if present
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Extract first {...} block
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI returned no JSON. Raw: ' + raw.slice(0, 200));

  let parsed: { cards?: unknown[] };
  try {
    parsed = JSON.parse(match[0]);
  } catch (e) {
    throw new Error('Failed to parse flashcard JSON: ' + (e as Error).message);
  }

  const cards: Flashcard[] = ((parsed.cards ?? []) as Flashcard[]).map((c, i) => ({
    id:    c.id    || `f${i + 1}`,
    front: c.front || '',
    back:  c.back  || '',
    ...(c.hint ? { hint: c.hint } : {}),
  })).filter(c => c.front && c.back);

  if (cards.length === 0) throw new Error('Flashcard generation returned no cards — please retry.');

  return { cards };
}

// ── Route ─────────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = makeSupabase(request, cookies);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

  let body: FlashcardRequest;
  try { body = await request.json() as FlashcardRequest; }
  catch { return json({ error: 'Invalid JSON body' }, 400); }

  if (!body.title?.trim()) return json({ error: 'title is required' }, 400);

  const isReal = !!body.sessionId && UUID_RE.test(body.sessionId);

  // ── 1. Check cache ────────────────────────────────────────────────────────
  if (isReal) {
    const { data: row } = await supabase
      .from('study_sessions')
      .select('flashcards')
      .eq('id', body.sessionId)
      .eq('user_id', user.id)
      .single();

    if (row?.flashcards) {
      return json({ deck: row.flashcards as FlashcardDeck, cached: true });
    }
  }

  // ── 2. Generate ───────────────────────────────────────────────────────────
  try {
    const deck = await generateFlashcards(body);

    // ── 3. Persist (fire-and-forget) ─────────────────────────────────────
    if (isReal) {
      supabase
        .from('study_sessions')
        .update({ flashcards: deck })
        .eq('id', body.sessionId)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) console.warn('[flashcards] cache write failed:', error.message);
        });
    }

    return json({ deck, cached: false });
  } catch (err) {
    console.error('[flashcards] generation error:', err);
    return json(
      { error: err instanceof Error ? err.message : 'Failed to generate flashcards.' },
      500,
    );
  }
};
