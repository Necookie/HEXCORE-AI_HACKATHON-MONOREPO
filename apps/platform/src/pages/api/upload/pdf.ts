/*
 * ─────────────────────────────────────────────────────────────────────────────
 * SUPABASE SETUP — run this SQL once in your Supabase SQL editor
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * -- 1. Documents table
 * create table if not exists public.documents (
 *   id            uuid primary key default gen_random_uuid(),
 *   user_id       uuid not null references auth.users(id) on delete cascade,
 *   filename      text not null,
 *   storage_path  text not null,
 *   file_size     bigint not null,
 *   subject_name  text,
 *   target_date   date,
 *   hours_per_day integer,
 *   study_days    text[],
 *   status        text not null default 'processing'
 *                 check (status in ('processing', 'ready', 'error')),
 *   created_at    timestamptz not null default now()
 * );
 *
 * create index if not exists documents_user_id_idx
 *   on public.documents(user_id);
 *
 * alter table public.documents enable row level security;
 *
 * create policy "documents: user owns row"
 *   on public.documents for all
 *   using  (auth.uid() = user_id)
 *   with check (auth.uid() = user_id);
 *
 * -- 2. Storage bucket (or create via Dashboard → Storage → New bucket)
 * insert into storage.buckets (id, name, public)
 * values ('study-pdfs', 'study-pdfs', false)
 * on conflict (id) do nothing;
 *
 * create policy "study-pdfs: authenticated upload"
 *   on storage.objects for insert to authenticated
 *   with check (
 *     bucket_id = 'study-pdfs'
 *     and (storage.foldername(name))[1] = auth.uid()::text
 *   );
 *
 * create policy "study-pdfs: owner read"
 *   on storage.objects for select to authenticated
 *   using (
 *     bucket_id = 'study-pdfs'
 *     and (storage.foldername(name))[1] = auth.uid()::text
 *   );
 *
 * create policy "study-pdfs: owner delete"
 *   on storage.objects for delete to authenticated
 *   using (
 *     bucket_id = 'study-pdfs'
 *     and (storage.foldername(name))[1] = auth.uid()::text
 *   );
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';

interface ScheduleConfig {
  subjectName:     string;
  targetDate:      string;
  hoursPerDay:     number;
  studyDays:       string[];
  startTime:       string;   // "HH:MM" in user's local time, e.g. "19:00"
  timezoneOffset:  number;   // new Date().getTimezoneOffset() — minutes behind UTC
}

const MAX_BYTES   = 25 * 1024 * 1024; // 25 MB
const PDF_MAGIC   = '%PDF';
const BUCKET      = 'study-pdfs';

function json(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  // ── 1. Authenticated Supabase server client ───────────────────────────────
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

  // ── 2. Auth guard ─────────────────────────────────────────────────────────
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return json({ error: 'Unauthorised' }, 401);
  }

  // ── 3. Parse multipart form ───────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: 'Invalid multipart body.' }, 400);
  }

  const fileField   = formData.get('file');
  const scheduleRaw = formData.get('schedule');

  if (!(fileField instanceof File)) {
    return json({ error: 'Missing file field.' }, 422);
  }
  if (typeof scheduleRaw !== 'string') {
    return json({ error: 'Missing schedule field.' }, 422);
  }

  // ── 4. Schedule validation ────────────────────────────────────────────────
  let schedule: ScheduleConfig;
  try {
    schedule = JSON.parse(scheduleRaw) as ScheduleConfig;
    if (!schedule.targetDate || !Array.isArray(schedule.studyDays) || !schedule.studyDays.length) {
      throw new Error('invalid shape');
    }
  } catch {
    return json({ error: 'Invalid schedule data.' }, 422);
  }

  // ── 5. File type validation ───────────────────────────────────────────────
  if (fileField.type !== 'application/pdf') {
    return json({ error: 'File must be a PDF.' }, 422);
  }

  // ── 6. File size validation ───────────────────────────────────────────────
  if (fileField.size > MAX_BYTES) {
    return json({ error: 'File exceeds the 25 MB limit.' }, 422);
  }

  if (fileField.size === 0) {
    return json({ error: 'File is empty.' }, 422);
  }

  // ── 7. Magic bytes check (%PDF) ───────────────────────────────────────────
  const headerBytes = new Uint8Array(await fileField.slice(0, 4).arrayBuffer());
  const magic = String.fromCharCode(...headerBytes);
  if (magic !== PDF_MAGIC) {
    return json({ error: 'File does not appear to be a valid PDF.' }, 422);
  }

  // ── 8. Build storage path ─────────────────────────────────────────────────
  const docId       = crypto.randomUUID();
  const safeFilename = fileField.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath  = `${user.id}/${docId}/${safeFilename}`;

  // ── 9. Upload to Supabase Storage ─────────────────────────────────────────
  const fileBuffer = await fileField.arrayBuffer();

  const { error: storageErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (storageErr) {
    console.error('[upload/pdf] storage error:', storageErr.message);
    return json({ error: 'Storage upload failed. Please try again.' }, 500);
  }

  // ── 10. Insert document record ────────────────────────────────────────────
  const { data: doc, error: dbErr } = await supabase
    .from('documents')
    .insert({
      id:            docId,
      user_id:       user.id,
      filename:      safeFilename,
      storage_path:  storagePath,
      file_size:     fileField.size,
      subject_name:  (schedule.subjectName ?? '').trim() || null,
      target_date:   schedule.targetDate,
      hours_per_day: schedule.hoursPerDay,
      study_days:    schedule.studyDays,
      status:        'processing',
    })
    .select('id')
    .single();

  if (dbErr || !doc) {
    // Storage succeeded but DB failed — clean up the orphaned object (best-effort)
    await supabase.storage.from(BUCKET).remove([storagePath]).catch(() => {});
    console.error('[upload/pdf] db error:', dbErr?.message);
    return json({ error: 'Failed to save document. Please try again.' }, 500);
  }

  // ── 11. Fire n8n webhook (non-blocking, best-effort) ─────────────────────
  const webhookUrl = import.meta.env.N8N_WEBHOOK_URL;
  if (webhookUrl) {
    // Convert study_days abbreviations → full names expected by n8n
    const DAY_MAP: Record<string, string> = {
      Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
      Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
    };
    const preferredDays = schedule.studyDays.map(d => DAY_MAP[d] ?? d);

    // Convert user's local start time → UTC hour + minute.
    // timezoneOffset = getTimezoneOffset() = (UTC - local) in minutes.
    // So: utcMinutes = localMinutes + timezoneOffset (+ wrap to [0,1440)).
    const [localH, localM] = (schedule.startTime || '19:00').split(':').map(Number);
    const localMins = localH * 60 + (localM || 0);
    const utcTotalMins = ((localMins + (schedule.timezoneOffset ?? 0)) % 1440 + 1440) % 1440;
    const startUtcHour   = Math.floor(utcTotalMins / 60);
    const startUtcMinute = utcTotalMins % 60;

    // Generate a 1-hour signed URL so n8n can download the PDF
    const { data: signedData } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 3600);
    const fileUrl = signedData?.signedUrl ?? '';

    // Calculate total_study_hours = hoursPerDay × studyDaysPerWeek × weeksUntilTarget
    const msPerDay         = 86_400_000;
    const daysUntilTarget  = Math.max(1, Math.ceil(
      (new Date(schedule.targetDate).getTime() - Date.now()) / msPerDay
    ));
    const weeksUntilTarget  = Math.ceil(daysUntilTarget / 7);
    const totalStudyHours   = schedule.hoursPerDay * schedule.studyDays.length * weeksUntilTarget;

    if (fileUrl) {
      const payload = {
        user_id:               user.id,
        study_plan_id:         docId,
        file_url:              fileUrl,
        title:                 (schedule.subjectName ?? '').trim() || 'Untitled Subject',
        hours_per_day:         schedule.hoursPerDay,
        start_utc_hour:        startUtcHour,
        start_utc_minute:      startUtcMinute,
        total_study_hours:     totalStudyHours,
        target_completion_date: schedule.targetDate,
        preferred_days:        preferredDays,
      };

      // Fire and forget — don't block the 200 response on n8n
      fetch(webhookUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
        signal:  AbortSignal.timeout(10_000),
      }).catch(err => console.error('[upload/pdf] n8n webhook error:', err));
    }
  }

  // ── 12. Success ───────────────────────────────────────────────────────────
  return json({ ok: true, documentId: docId, storagePath }, 200);
};
