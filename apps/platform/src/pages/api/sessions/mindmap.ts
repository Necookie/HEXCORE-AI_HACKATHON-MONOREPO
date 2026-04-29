import type { APIRoute } from 'astro';
import { GROQ_API_KEY } from 'astro:env/server';
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

export interface MindMapRequest {
  sessionId: string;
  title: string;
  summary?: string;
  learningObjectives?: string[];
  subtopics?: string[];
}

export interface MindMapNode {
  id: string;
  label: string;
  type: 'root' | 'branch' | 'leaf';
  parentId?: string;
}

export interface MindMapData {
  nodes: MindMapNode[];
}

// ── Groq generation ───────────────────────────────────────────────────────────

async function generateMindMap(req: MindMapRequest, groqKey: string): Promise<MindMapData> {
  if (!groqKey) throw new Error('GROQ_API_KEY is not configured.');

  const systemPrompt = `You are StudyBearer's mind map engine. Return ONLY raw JSON — no markdown fences, no explanation.

Topic: ${req.title}
Overview: ${req.summary ?? ''}
Subtopics: ${(req.subtopics ?? []).join(', ')}
Learning Objectives: ${(req.learningObjectives ?? []).join('; ')}

Generate a mind map tree with this exact structure:
- 1 root node (the main topic)
- 4 to 6 branch nodes (major themes/categories, each connected to root)
- 2 to 4 leaf nodes per branch (specific concepts, connected to their branch)

Rules:
- Root node: id="root", parentId omitted, type="root"
- Branch nodes: type="branch", parentId="root"
- Leaf nodes: type="leaf", parentId = their branch's id
- Labels must be short and clear (max 5 words for branches, max 6 words for leaves)
- IDs: use simple strings like "b1","b2","b3" for branches, "b1l1","b1l2" for leaves
- Total nodes: between 20 and 30
- Cover all key concepts from the subtopics and learning objectives

Return this exact JSON structure and nothing else:
{"nodes":[{"id":"root","label":"${req.title}","type":"root"},{"id":"b1","label":"First Major Theme","type":"branch","parentId":"root"},{"id":"b1l1","label":"Key concept here","type":"leaf","parentId":"b1"}]}`;

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
        { role: 'user',   content: 'Generate the mind map JSON now. Return only the JSON object.' },
      ],
      temperature: 0.5,
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

  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI returned no JSON. Raw: ' + raw.slice(0, 200));

  let parsed: { nodes?: unknown[] };
  try { parsed = JSON.parse(match[0]); }
  catch (e) { throw new Error('Failed to parse mind map JSON: ' + (e as Error).message); }

  const nodes: MindMapNode[] = ((parsed.nodes ?? []) as MindMapNode[])
    .filter(n => n.id && n.label && n.type)
    .map(n => ({
      id:       n.id,
      label:    String(n.label).trim(),
      type:     (['root', 'branch', 'leaf'].includes(n.type) ? n.type : 'leaf') as MindMapNode['type'],
      ...(n.parentId ? { parentId: n.parentId } : {}),
    }));

  const rootNode = nodes.find(n => n.type === 'root');
  if (!rootNode) throw new Error('Mind map has no root node.');
  if (nodes.length < 5) throw new Error('Mind map generation returned too few nodes — please retry.');

  return { nodes };
}

// ── Route ─────────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const supabase = makeSupabase(request, cookies);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

  let body: MindMapRequest;
  try { body = await request.json() as MindMapRequest; }
  catch { return json({ error: 'Invalid JSON body' }, 400); }

  if (!body.title?.trim()) return json({ error: 'title is required' }, 400);

  const isReal = !!body.sessionId && UUID_RE.test(body.sessionId);

  // ── 1. Cache check ────────────────────────────────────────────────────────
  if (isReal) {
    const { data: row } = await supabase
      .from('study_sessions')
      .select('mindmap')
      .eq('id', body.sessionId)
      .eq('user_id', user.id)
      .single();

    if (row?.mindmap) {
      return json({ mindmap: row.mindmap as MindMapData, cached: true });
    }
  }

  // ── 2. Generate ───────────────────────────────────────────────────────────
  // GROQ_API_KEY is read via astro:env/server — in Cloudflare Workers this is
  // backed by the runtime env binding (set in Pages dashboard), not build-time vars.
  const groqKey = GROQ_API_KEY ?? '';

  try {
    const mindmap = await generateMindMap(body, groqKey);

    if (isReal) {
      supabase
        .from('study_sessions')
        .update({ mindmap })
        .eq('id', body.sessionId)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) console.warn('[mindmap] cache write failed:', error.message);
        });
    }

    return json({ mindmap, cached: false });
  } catch (err) {
    console.error('[mindmap] generation error:', err);
    return json(
      { error: err instanceof Error ? err.message : 'Failed to generate mind map.' },
      500,
    );
  }
};
