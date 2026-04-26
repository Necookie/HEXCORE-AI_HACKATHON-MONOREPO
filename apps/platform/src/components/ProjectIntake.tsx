import { useState, useRef, useEffect, useCallback } from 'react';
import { Ic, Badge, Card, Btn } from './ui';

type StudyDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
interface ScheduleConfig {
  subjectName: string;
  targetDate: string;
  hoursPerDay: number;
  studyDays: StudyDay[];
}

const ALL_DAYS: StudyDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

async function UPLOAD_PDF(_f: File): Promise<string> {
  await new Promise(r => setTimeout(r, 800));
  return 'https://placeholder.example.com/doc.pdf';
}
async function TRIGGER_N8N(_p: { pdfUrl: string; schedule: ScheduleConfig }) {
  // TODO: fetch(import.meta.env.PUBLIC_N8N_WEBHOOK_URL, { method:'POST', body: JSON.stringify(_p) })
  await new Promise(r => setTimeout(r, 5000));
}

const PROC_STEPS = [
  'Parsing PDF content',
  'Chunking into study modules',
  'Scheduling calendar events',
  'Building quiz questions',
];

export default function ProjectIntake() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleConfig>({
    subjectName: '', targetDate: '', hoursPerDay: 2, studyDays: ['Mon', 'Wed', 'Fri'],
  });
  const [procStep, setProcStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step !== 3) return;
    let cancelled = false;
    (async () => {
      try {
        const pdfUrl = await UPLOAD_PDF(file!);
        if (cancelled) return;
        await Promise.all([
          TRIGGER_N8N({ pdfUrl, schedule }),
          new Promise<void>(res => {
            let i = 0;
            const t = setInterval(() => {
              i++;
              if (!cancelled) setProcStep(i);
              if (i >= PROC_STEPS.length) { clearInterval(t); res(); }
            }, 900);
          }),
        ]);
      } catch {
        // stay on step 3 with all steps shown
      }
    })();
    return () => { cancelled = true; };
  }, [step]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') { setFile(f); setError(null); }
    else setError('Only PDF files are accepted.');
  }, []);

  const toggleDay = (d: StudyDay) =>
    setSchedule(s => ({
      ...s,
      studyDays: s.studyDays.includes(d) ? s.studyDays.filter(x => x !== d) : [...s.studyDays, d],
    }));

  const goToStep2 = () => {
    if (!file) { setError('Upload a PDF first.'); return; }
    setError(null); setStep(2);
  };
  const goToStep3 = () => {
    if (!schedule.targetDate) { setError('Select a target completion date.'); return; }
    if (!schedule.studyDays.length) { setError('Select at least one study day.'); return; }
    setError(null); setStep(3);
  };

  const steps = ['Upload PDF', 'Set Schedule', 'AI Processing'];
  const done = procStep >= PROC_STEPS.length;

  return (
    <div className="content-scroll fade-in" style={{ padding: '24px 40px', flex: 1, maxWidth: 640, margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Badge color="purple" sm>New Subject</Badge>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginTop: 8, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Upload Study Material
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 13 }}>
          Drop your PDF and StudyBearer builds a personalized, AI-powered roadmap.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step > i + 1 ? 'var(--green)' : step === i + 1 ? 'var(--purple)' : 'var(--bg-elevated)',
                color: step > i + 1 ? '#061a0a' : step === i + 1 ? '#fff' : 'var(--text-muted)',
                border: step === i + 1 ? '2px solid rgba(123,92,245,0.5)' : '2px solid var(--border)',
                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, transition: 'all 0.3s ease',
              }}>
                {step > i + 1 ? <Ic n="check" size={15} color="#061a0a" /> : i + 1}
              </div>
              <span style={{ fontSize: 10, color: step === i + 1 ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: step > i + 1 ? 'var(--purple)' : 'var(--border)', margin: '0 10px', marginBottom: 20, transition: 'background 0.4s ease' }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1: Upload ── */}
      {step === 1 && (
        <div className="fade-in">
          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            onClick={() => !file && inputRef.current?.click()}
            style={{
              border: `2px dashed ${drag ? 'var(--purple)' : file ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-xl)', padding: '48px 32px', textAlign: 'center',
              background: drag ? 'rgba(123,92,245,0.05)' : file ? 'rgba(74,222,128,0.04)' : 'var(--bg-elevated)',
              cursor: file ? 'default' : 'pointer', transition: 'all 0.22s ease', marginBottom: 18,
            }}
          >
            <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
              {file ? <Ic n="file" size={40} color="var(--green)" /> : <Ic n="upload" size={40} color="var(--text-muted)" />}
            </div>
            {file ? (
              <>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--green)', fontSize: 15 }}>{file.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 6 }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB · <button onClick={() => inputRef.current?.click()} className="no-3d" style={{ background: 'none', border: 'none', color: 'var(--purple-light)', cursor: 'pointer', fontSize: 13, padding: 0, fontFamily: 'var(--font-body)' }}>Change file</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16, marginBottom: 6, color: 'var(--text-primary)' }}>Drop your PDF here</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Supports PDF up to 50MB · Click to browse</div>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="application/pdf" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setError(null); } }} />
          {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Ic n="x" size={14} color="var(--red)" />{error}</p>}
          <Btn v="primary" size="lg" disabled={!file} onClick={goToStep2} sx={{ width: '100%', justifyContent: 'center' }}>
            Continue <Ic n="right" size={16} color="#fff" />
          </Btn>
        </div>
      )}

      {/* ── Step 2: Schedule ── */}
      {step === 2 && (
        <div className="fade-in">
          <Card sx={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 16 }}>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 10, fontWeight: 500 }}>
                Daily Study Hours — <span style={{ color: 'var(--purple-light)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{schedule.hoursPerDay}h / day</span>
              </label>
              <input type="range" min={1} max={8} value={schedule.hoursPerDay}
                onChange={e => setSchedule(s => ({ ...s, hoursPerDay: +e.target.value }))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 5, fontFamily: 'var(--font-mono)' }}>
                <span>1h</span><span>4h</span><span>8h</span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, fontWeight: 500 }}>Subject Name</label>
              <input
                type="text"
                placeholder="e.g. Data Structures & Algorithms"
                value={schedule.subjectName}
                onChange={e => setSchedule(s => ({ ...s, subjectName: e.target.value }))}
                className="sb-input"
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, fontWeight: 500 }}>Target Completion Date</label>
              <input
                type="date"
                value={schedule.targetDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setSchedule(s => ({ ...s, targetDate: e.target.value }))}
                className="sb-input"
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 10, fontWeight: 500 }}>Study Days</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ALL_DAYS.map(d => {
                  const on = schedule.studyDays.includes(d);
                  return (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      style={{
                        padding: '5px 11px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.18s ease', fontFamily: 'var(--font-body)',
                        background: on ? 'rgba(123,92,245,0.15)' : 'var(--bg-elevated)',
                        border: on ? '1px solid rgba(123,92,245,0.5)' : '1px solid var(--border)',
                        color: on ? 'var(--purple-light)' : 'var(--text-muted)',
                      }}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Ic n="x" size={14} color="var(--red)" />{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn v="ghost" onClick={() => setStep(1)}>Back</Btn>
            <Btn v="primary" size="md" onClick={goToStep3} sx={{ flex: 1, justifyContent: 'center' }}>
              <Ic n="zap" size={15} color="#fff" /> Generate Roadmap
            </Btn>
          </div>
        </div>
      )}

      {/* ── Step 3: Processing ── */}
      {step === 3 && (
        <div className="fade-in" style={{ textAlign: 'center', paddingTop: 20 }}>
          <div className="float-anim" style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
            <Ic n="bot" size={52} color="var(--purple-light)" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            Building your roadmap…
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
            Chunking content · Scheduling sessions · Syncing Google Calendar
          </p>

          <Card sx={{ textAlign: 'left', marginBottom: 24 }}>
            {PROC_STEPS.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
                borderBottom: i < PROC_STEPS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i < procStep ? 'var(--green)' : i === procStep ? 'rgba(123,92,245,0.2)' : 'var(--bg-elevated)',
                  border: i === procStep ? '2px solid var(--purple)' : '2px solid var(--border)',
                  transition: 'all 0.4s ease',
                }}>
                  {i < procStep && <Ic n="check" size={12} color="#061a0a" />}
                  {i === procStep && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', animation: 'spin 0.8s linear infinite' }} />
                  )}
                </div>
                <span style={{ fontSize: 14, color: i < procStep ? 'var(--green)' : i === procStep ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'color 0.3s ease' }}>
                  {item}
                </span>
                {i < procStep && <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)' }}>done</span>}
                {i === procStep && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--purple-light)', opacity: 0.8 }}>working…</span>}
              </div>
            ))}
          </Card>

          {done && (
            <div className="slide-up">
              <div style={{ marginBottom: 16 }}>
                <Badge color="green"><Ic n="check" size={12} color="#4ADE80" /> Roadmap Ready</Badge>
              </div>
              <Btn v="primary" size="lg" onClick={() => window.location.href = '/platform/dashboard'} sx={{ justifyContent: 'center' }}>
                View Dashboard <Ic n="right" size={16} color="#fff" />
              </Btn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
