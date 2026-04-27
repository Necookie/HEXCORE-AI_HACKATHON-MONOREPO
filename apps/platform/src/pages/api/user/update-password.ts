import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createServerClient(
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
    },
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorised' }), { status: 401 });
  }

  let body: { currentPassword?: string, newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const currentPassword = (body.currentPassword ?? '').trim();
  const newPassword     = (body.newPassword ?? '').trim();

  if (!currentPassword || !newPassword) {
    return new Response(JSON.stringify({ error: 'Both current and new passwords are required.' }), { status: 422 });
  }

  if (newPassword.length < 8) {
    return new Response(JSON.stringify({ error: 'New password must be at least 8 characters.' }), { status: 422 });
  }

  // ── SECURITY VERIFICATION ──────────────────────────────────────────
  // Re-authenticate to verify the current password
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (verifyError) {
    return new Response(JSON.stringify({ error: 'Incorrect current password.' }), { status: 401 });
  }

  // Verification successful, proceed with update
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
