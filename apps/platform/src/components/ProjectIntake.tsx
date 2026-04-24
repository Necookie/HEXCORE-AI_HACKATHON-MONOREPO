// ProjectIntake.tsx – REQ-2.1 + REQ-2.2 + REQ-NF-2
import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Calendar, Clock, CheckSquare, Zap, Loader2, X, CheckCircle } from 'lucide-react';

type StudyDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
interface ScheduleConfig {
  targetDate: string;
  windowStart: string;
  windowEnd: string;
  studyDays: StudyDay[];
}
const ALL_DAYS: StudyDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => ({
  label: `${i % 12 || 12}:00 ${i < 12 ? 'AM' : 'PM'}`,
  value: `${String(i).padStart(2, '0')}:00`,
}));

// ── Stubs: replace with Supabase Storage + n8n webhook calls ──
async function UPLOAD_PDF(_f: File): Promise<string> {
  await new Promise(r => setTimeout(r, 800));
  return 'https://placeholder.example.com/doc.pdf';
}
async function TRIGGER_N8N(_p: { pdfUrl: string; schedule: ScheduleConfig }) {
  // TODO: fetch(import.meta.env.PUBLIC_N8N_WEBHOOK_URL, { method:'POST', body: JSON.stringify(_p) })
  await new Promise(r => setTimeout(r, 5000));
}

export default function ProjectIntake() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    targetDate: '', windowStart: '20:00', windowEnd: '22:00', studyDays: ['Mon', 'Wed', 'Fri'],
  });
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    f?.type === 'application/pdf' ? (setFile(f), setError(null)) : setError('Only PDF files are accepted.');
  }, []);

  const toggleDay = (d: StudyDay) =>
    setSchedule(s => ({ ...s, studyDays: s.studyDays.includes(d) ? s.studyDays.filter(x => x !== d) : [...s.studyDays, d] }));

  const handleInit = async () => {
    if (!file) return setError('Upload a PDF first.');
    if (!schedule.targetDate) return setError('Select a target completion date.');
    if (!schedule.studyDays.length) return setError('Select at least one study day.');
    setError(null);
    try {
      setPhase('uploading');
      const pdfUrl = await UPLOAD_PDF(file);
      setPhase('processing');
      await TRIGGER_N8N({ pdfUrl, schedule });
      setPhase('done');
    } catch { setPhase('error'); }
  };

  const canSubmit = !!file && !!schedule.targetDate && schedule.studyDays.length > 0;

  return (
    <>
      {/* ── Orchestration Overlay (REQ-NF-2) ── */}
      {phase !== 'idle' && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xl flex items-center justify-center"
             style={{ animation: 'overlayFadeIn 0.4s ease' }}>
          <div className="flex flex-col items-center gap-6 text-center px-8">
            {phase === 'uploading' && (
              <><Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
              <p className="text-lg font-medium text-slate-200">Uploading document…</p></>
            )}
            {phase === 'processing' && (
              <><div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-cyan-400 flex items-center justify-center"
                     style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}>
                  <Zap className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping" />
              </div>
              <div>
                <p className="text-xl font-semibold text-cyan-400" style={{ textShadow: '0 0 18px rgba(34,211,238,0.45)' }}>
                  AI Orchestration Active
                </p>
                <p className="mt-1 text-sm text-slate-400">Analysing document and building your roadmap…</p>
                <p className="mt-3 text-xs text-slate-500">This may take up to 30 seconds.</p>
              </div></>
            )}
            {phase === 'done' && (
              <><CheckCircle className="w-14 h-14 text-cyan-400" />
              <p className="text-xl font-semibold text-cyan-400">Roadmap Ready</p>
              <a href="/platform/dashboard"
                 className="mt-2 px-6 py-3 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition-colors">
                Open Dashboard →
              </a></>
            )}
            {phase === 'error' && (
              <><X className="w-14 h-14 text-red-400" />
              <p className="text-lg font-medium text-slate-200">Something went wrong.</p>
              <button onClick={() => setPhase('idle')}
                      className="px-5 py-2 border border-slate-600 rounded-lg text-slate-300 text-sm hover:border-cyan-400/40 transition-colors">
                Try Again
              </button></>
            )}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">
            New Study <span className="text-cyan-400">Roadmap</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">Upload your study material and configure your schedule.</p>
        </div>

        {/* REQ-2.1: Document Intake */}
        <section className="bg-slate-950 border border-cyan-400/18 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Document Intake
          </h2>
          <div role="button" tabIndex={0} id="pdf-dropzone"
               onClick={() => inputRef.current?.click()}
               onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
               onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
               className={`rounded-xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300 border-2 border-dashed ${
                 isDragging ? 'border-cyan-400 bg-cyan-400/10 scale-[1.01]' : 'border-cyan-400/40 hover:border-cyan-400/70 hover:bg-cyan-400/5'
               }`}
               style={{ boxShadow: isDragging ? '0 0 20px rgba(34,211,238,0.3)' : undefined }}>
            <Upload className={`w-10 h-10 ${isDragging ? 'text-cyan-300' : 'text-cyan-400/70'}`} />
            {file
              ? <p className="text-sm text-slate-200 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />{file.name}
                  <span className="text-slate-500">({(file.size/1024/1024).toFixed(2)} MB)</span>
                </p>
              : <><p className="text-sm text-slate-300 font-medium">
                  Drag & drop PDF here, or <span className="text-cyan-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-500">PDF only · Max 50 MB</p></>
            }
          </div>
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" id="pdf-upload-input"
                 onChange={e => { const f = e.target.files?.[0]; if(f){setFile(f);setError(null);} }} />
        </section>

        {/* REQ-2.2: Schedule Configuration */}
        <section className="bg-slate-950 border border-cyan-400/18 rounded-2xl p-6 space-y-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Schedule Configuration
          </h2>
          <div className="space-y-1.5">
            <label htmlFor="target-date" className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
              Target Completion Date
            </label>
            <input id="target-date" type="date" value={schedule.targetDate}
                   min={new Date().toISOString().split('T')[0]}
                   onChange={e => setSchedule(s => ({ ...s, targetDate: e.target.value }))}
                   className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100
                              focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-colors [color-scheme:dark]" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
              <Clock className="inline w-3.5 h-3.5 mr-1" />Daily Study Window
            </label>
            <div className="flex items-center gap-3">
              {(['windowStart', 'windowEnd'] as const).map((key, i) => (
                <select key={key} id={key} value={schedule[key]}
                        onChange={e => setSchedule(s => ({ ...s, [key]: e.target.value }))}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100
                                   focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-colors">
                  {HOURS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, <span key="sep" className="text-slate-500 text-sm">to</span>, el], [] as React.ReactNode[])}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
              <CheckSquare className="inline w-3.5 h-3.5 mr-1" />Study Days
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Study days">
              {ALL_DAYS.map(d => (
                <button key={d} id={`day-${d}`} type="button" onClick={() => toggleDay(d)} aria-pressed={schedule.studyDays.includes(d)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all duration-200 ${
                          schedule.studyDays.includes(d)
                            ? 'bg-cyan-400/15 border-cyan-400 text-cyan-300'
                            : 'bg-transparent border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                        }`}>{d}</button>
              ))}
            </div>
          </div>
        </section>

        {error && <p className="text-sm text-red-400 flex items-center gap-1.5"><X className="w-4 h-4" />{error}</p>}

        <button id="initialize-roadmap-btn" onClick={handleInit} disabled={!canSubmit}
                className={`w-full py-3.5 rounded-xl text-base font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                  canSubmit ? 'bg-cyan-400 text-black hover:bg-cyan-300 hover:shadow-[0_0_28px_rgba(34,211,238,0.5)] cursor-pointer'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}>
          <Zap className="w-5 h-5" /> Initialize Roadmap
        </button>
      </div>
    </>
  );
}
