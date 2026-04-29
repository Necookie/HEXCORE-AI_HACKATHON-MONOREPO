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

export interface NotesRequest {
  sessionId?: string;           // UUID — used for DB caching; omit for mock sessions
  title: string;
  summary?: string;
  learningObjectives?: string[];
  subtopics?: string[];
}

export interface NoteConcept {
  title: string;
  explanation: string;
  example: string;
}

export interface NotesResult {
  tldr: string;
  concepts: NoteConcept[];
  keyTakeaways: string[];
  remember: string;
}

// ── Groq generation ───────────────────────────────────────────────────────────

async function generateNotes(req: NotesRequest, groqKey: string): Promise<NotesResult> {
  if (!groqKey) throw new Error('GROQ_API_KEY is not configured.');

  const objectiveLines = (req.learningObjectives ?? [])
    .map((o, i) => `${i + 1}. ${o}`)
    .join('\n');

  const prompt = `You are an expert educator creating study notes for a student.

Topic: ${req.title}
${req.summary ? `Overview: ${req.summary}` : ''}
${req.subtopics?.length ? `Subtopics: ${req.subtopics.join(', ')}` : ''}
${objectiveLines ? `Learning objectives:\n${objectiveLines}` : ''}

Write study notes that:
- Explain each concept in plain, accessible language — no jargon unless explained
- Use relatable real-world examples or analogies that make it genuinely click
- Are engaging and modern — not dry textbook paragraphs
- Preserve the real academic content and depth (do not oversimplify)
- Help the student understand WHY each concept matters

Return ONLY valid JSON with no markdown fences, no extra text, nothing else:
{
  "tldr": "2-3 sentence plain-English overview of what this session is really about",
  "concepts": [
    {
      "title": "Concept name (short)",
      "explanation": "Clear 2-3 sentence explanation using accessible language",
      "example": "A concrete, relatable example or analogy that makes it stick"
    }
  ],
  "keyTakeaways": [
    "Concise takeaway 1",
    "Concise takeaway 2",
    "Concise takeaway 3"
  ],
  "remember": "One memorable insight or perspective shift — the thing a student should never forget from this topic"
}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.65,
      max_tokens: 2048,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Groq API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const payload = await res.json() as { choices: { message: { content: string } }[] };
  const content = payload.choices[0]?.message?.content ?? '';

  // Strip any accidental markdown fences the model might add
  const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('AI returned an unexpected format — please retry.');

  return JSON.parse(jsonMatch[0]) as NotesResult;
}

// ── Route ─────────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const supabase = makeSupabase(request, cookies);

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

  let body: NotesRequest;
  try {
    body = await request.json() as NotesRequest;
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.title?.trim()) return json({ error: 'title is required' }, 400);

  // ── 1. Check DB cache (only for real UUID session IDs) ────────────────────
  const isRealSession = !!body.sessionId && UUID_RE.test(body.sessionId);

  if (isRealSession) {
    const { data: row } = await supabase
      .from('study_sessions')
      .select('notes')
      .eq('id', body.sessionId!)
      .eq('user_id', user.id)
      .single();

    if (row?.notes) {
      return json({ notes: row.notes as NotesResult, cached: true });
    }
  }
  // Note: for mock/non-UUID sessions the client uses localStorage as its cache,
  // so the API is only called once per browser session regardless.

  // ── 2. Generate ────────────────────────────────────────────────────────────
  // groqApiKey is injected by middleware from the Cloudflare runtime env binding.
  const groqKey = (locals as { groqApiKey?: string }).groqApiKey || '';

  try {
    const notes = await generateNotes(body, groqKey);

    // ── 3. Persist (fire-and-forget is fine here — notes are non-critical) ───
    if (isRealSession) {
      supabase
        .from('study_sessions')
        .update({ notes })
        .eq('id', body.sessionId!)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) console.warn('[notes] cache write failed:', error.message);
        });
    }

    return json({ notes, cached: false });
  } catch (err) {
    console.error('[notes] generation error:', err);
    return json(
      { error: err instanceof Error ? err.message : 'Failed to generate notes.' },
      500,
    );
  }
};
