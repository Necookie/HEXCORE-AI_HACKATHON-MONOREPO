import { useState } from 'react';
import { ALL_DAYS, type ScheduleConfig, type StudyDay } from '../../../types/project.types';
import { Ic, Btn, Card } from '../../ui';

// ── Helpers ────────────────────────────────────────────────────────────────────
const MONTHS      = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEKDAYS    = ['Mo','Tu','We','Th','Fr','Sa','Su'];

function todayIso() { return new Date().toISOString().split('T')[0]; }
function toIso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
function formatDisplay(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTH_SHORT[m - 1]} ${d}, ${y}`;
}

// ── Field-level inline error ───────────────────────────────────────────────────
function FieldErr({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
      <Ic n="x" size={12} color="var(--red)" />
      <span style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>
        {msg}
      </span>
    </div>
  );
}

// ── Alert banner — error | warning ────────────────────────────────────────────
function AlertBanner({ message, type = 'error' }: { message: string; type?: 'error' | 'warning' }) {
  const cfg = {
    error: {
      bg:     'rgba(245,107,107,0.08)',
      border: 'rgba(245,107,107,0.25)',
      color:  'var(--red)',
      icon:   'x',
    },
    warning: {
      bg:     'rgba(240,160,48,0.08)',
      border: 'rgba(240,160,48,0.28)',
      color:  'var(--amber)',
      icon:   'zap',
    },
  }[type];

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 'var(--radius-md)',
      padding: '11px 14px', marginBottom: 14,
    }}>
      <div style={{ flexShrink: 0, marginTop: 1 }}>
        <Ic n={cfg.icon} size={14} color={cfg.color} />
      </div>
      <span style={{ fontSize: 13, color: cfg.color, lineHeight: 1.55 }}>{message}</span>
    </div>
  );
}

// ── Date Picker Modal ──────────────────────────────────────────────────────────
function DatePickerModal({
  value, onChange, onClose,
}: { value: string; onChange: (iso: string) => void; onClose: () => void }) {
  const today   = todayIso();
  const initDate = value ? new Date(value + 'T12:00:00') : new Date();
  const [view, setView]       = useState({ year: initDate.getFullYear(), month: initDate.getMonth() });
  const [hovered, setHovered] = useState<string | null>(null);

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstDay    = new Date(view.year, view.month, 1).getDay();
  const offset      = (firstDay + 6) % 7; // Monday-first

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const move = (dir: 1 | -1) => setView(v => {
    let m = v.month + dir, y = v.year;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    return { year: y, month: m };
  });

  const jumpToday = () => {
    const now = new Date();
    setView({ year: now.getFullYear(), month: now.getMonth() });
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        className="slide-up"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(123,92,245,0.28)',
          borderRadius: 'var(--radius-xl)',
          padding: 20,
          width: 308,
          boxShadow: '0 0 0 1px rgba(123,92,245,0.1), 0 28px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* ── Month navigation ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button
            onClick={() => move(-1)} className="no-3d"
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            }}
          >
            <div style={{ transform: 'rotate(180deg)', display: 'flex' }}>
              <Ic n="right" size={14} color="var(--text-secondary)" />
            </div>
          </button>

          <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
            <div style={{
              fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15,
              color: 'var(--text-primary)', letterSpacing: '-0.01em',
            }}>
              {MONTHS[view.month]}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {view.year}
            </div>
          </div>

          <button
            onClick={() => move(1)} className="no-3d"
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer',
            }}
          >
            <Ic n="right" size={14} color="var(--text-secondary)" />
          </button>
        </div>

        {/* ── Weekday labels ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {WEEKDAYS.map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 10, fontWeight: 700,
              color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
              paddingBottom: 6,
            }}>{d}</div>
          ))}
        </div>

        {/* ── Day grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const iso        = toIso(view.year, view.month, day);
            const isPast     = iso < today;
            const isToday    = iso === today;
            const isSelected = iso === value;
            const isHovered  = hovered === iso && !isPast && !isSelected;

            return (
              <button
                key={i}
                disabled={isPast}
                onClick={() => { onChange(iso); onClose(); }}
                onMouseEnter={() => !isPast && setHovered(iso)}
                onMouseLeave={() => setHovered(null)}
                className="no-3d"
                style={{
                  height: 36, width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 'var(--radius-sm)',
                  border: isToday && !isSelected
                    ? '1px solid rgba(123,92,245,0.5)'
                    : '1px solid transparent',
                  background: isSelected
                    ? 'var(--purple)'
                    : isHovered
                    ? 'rgba(123,92,245,0.14)'
                    : 'transparent',
                  color: isSelected
                    ? '#fff'
                    : isPast  ? 'var(--text-muted)'
                    : isToday ? 'var(--purple-light)'
                    : 'var(--text-primary)',
                  fontSize: 13,
                  fontWeight: isSelected || isToday ? 700 : 400,
                  fontFamily: 'var(--font-mono)',
                  cursor: isPast ? 'not-allowed' : 'pointer',
                  opacity: isPast ? 0.28 : 1,
                  transition: 'background 0.12s ease, color 0.12s ease',
                  boxShadow: isSelected ? '0 2px 10px rgba(123,92,245,0.45)' : 'none',
                }}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div style={{
          marginTop: 16, paddingTop: 14,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <button
            className="no-3d" onClick={jumpToday}
            style={{
              background: 'none', border: 'none',
              color: 'var(--purple-light)', cursor: 'pointer',
              fontSize: 12, fontFamily: 'var(--font-body)', padding: 0,
            }}
          >
            Jump to today
          </button>
          <Btn v="ghost" size="sm" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Schedule Step ──────────────────────────────────────────────────────────────
interface ScheduleStepProps {
  schedule: ScheduleConfig;
  onUpdate: (update: Partial<ScheduleConfig>) => void;
  error:    string | null;
  onBack:   () => void;
  onNext:   () => void;
}

interface FieldErrors {
  subjectName?: string;
  targetDate?:  string;
  studyDays?:   string;
}

export function ScheduleStep({ schedule, onUpdate, error, onBack, onNext }: ScheduleStepProps) {
  const [calOpen,   setCalOpen]   = useState(false);
  const [errs,      setErrs]      = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);

  const validate = (s: ScheduleConfig): boolean => {
    const e: FieldErrors = {};
    const name = s.subjectName.trim();
    if (!name)          e.subjectName = 'Subject name is required.';
    else if (name.length < 2) e.subjectName = 'Enter at least 2 characters.';
    if (!s.targetDate)  e.targetDate  = 'Pick a target completion date.';
    if (!s.studyDays.length) e.studyDays = 'Select at least one study day.';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    setAttempted(true);
    if (validate(schedule)) onNext();
  };

  const toggleDay = (day: StudyDay) => {
    const next = schedule.studyDays.includes(day)
      ? schedule.studyDays.filter(d => d !== day)
      : [...schedule.studyDays, day];
    onUpdate({ studyDays: next as StudyDay[] });
    if (attempted) validate({ ...schedule, studyDays: next as StudyDay[] });
  };

  const nameInvalid = attempted && !!errs.subjectName;
  const dateInvalid = attempted && !!errs.targetDate;

  return (
    <div className="fade-in">
      <Card sx={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 16 }}>

        {/* ── Hours per day ── */}
        <div>
          <label style={{
            fontSize: 13, color: 'var(--text-secondary)',
            display: 'block', marginBottom: 10, fontWeight: 500,
          }}>
            Daily Study Hours —{' '}
            <span style={{ color: 'var(--purple-light)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {schedule.hoursPerDay}h / day
            </span>
          </label>
          <input
            type="range" min={1} max={8} value={schedule.hoursPerDay}
            onChange={e => onUpdate({ hoursPerDay: +e.target.value })}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11, color: 'var(--text-muted)', marginTop: 5, fontFamily: 'var(--font-mono)',
          }}>
            <span>1h</span><span>4h</span><span>8h</span>
          </div>
        </div>

        {/* ── Subject name ── */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Subject Name{' '}
            <span style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Data Structures & Algorithms"
            value={schedule.subjectName}
            onChange={e => {
              onUpdate({ subjectName: e.target.value });
              if (attempted) validate({ ...schedule, subjectName: e.target.value });
            }}
            onBlur={() => { if (!attempted) { setAttempted(false); validate(schedule); } }}
            className="sb-input"
            style={{
              width: '100%', boxSizing: 'border-box',
              ...(nameInvalid
                ? { borderColor: 'rgba(245,107,107,0.55)', background: 'rgba(245,107,107,0.04)' }
                : {}),
            }}
          />
          <FieldErr msg={nameInvalid ? errs.subjectName : undefined} />
        </div>

        {/* ── Target date (custom picker) ── */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Target Completion Date{' '}
            <span style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>*</span>
          </label>
          <button
            type="button"
            onClick={() => setCalOpen(true)}
            className="no-3d"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: dateInvalid ? 'rgba(245,107,107,0.04)' : 'var(--bg-input)',
              border: `1px solid ${dateInvalid ? 'rgba(245,107,107,0.55)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', transition: 'border-color 0.18s ease, background 0.18s ease',
              color: schedule.targetDate ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: 14, fontFamily: 'var(--font-body)', textAlign: 'left',
            }}
          >
            <span>
              {schedule.targetDate ? formatDisplay(schedule.targetDate) : 'Pick a date…'}
            </span>
            <Ic
              n="calendar" size={16}
              color={schedule.targetDate ? 'var(--purple-light)' : 'var(--text-muted)'}
            />
          </button>
          <FieldErr msg={dateInvalid ? errs.targetDate : undefined} />
        </div>

        {/* ── Study days ── */}
        <div>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 10, fontWeight: 500 }}>
            Study Days
          </label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ALL_DAYS.map(d => {
              const on = schedule.studyDays.includes(d);
              return (
                <button
                  key={d} type="button" onClick={() => toggleDay(d)}
                  style={{
                    padding: '6px 13px', borderRadius: 'var(--radius-sm)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-body)', transition: 'all 0.15s ease',
                    background: on ? 'rgba(123,92,245,0.15)' : 'var(--bg-elevated)',
                    border: on ? '1px solid rgba(123,92,245,0.5)' : '1px solid var(--border)',
                    color: on ? 'var(--purple-light)' : 'var(--text-muted)',
                    boxShadow: on ? '0 0 12px rgba(123,92,245,0.18)' : 'none',
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
          {attempted && errs.studyDays && <FieldErr msg={errs.studyDays} />}
        </div>
      </Card>

      {/* Server-side error from parent hook */}
      {error && <AlertBanner message={error} />}

      <div style={{ display: 'flex', gap: 10 }}>
        <Btn v="ghost" onClick={onBack}>
          <div style={{ transform: 'rotate(180deg)', display: 'flex' }}>
            <Ic n="right" size={14} color="var(--text-secondary)" />
          </div>
          Back
        </Btn>
        <Btn v="primary" size="md" onClick={handleNext} sx={{ flex: 1, justifyContent: 'center' }}>
          <Ic n="zap" size={15} color="#fff" /> Generate Roadmap
        </Btn>
      </div>

      {calOpen && (
        <DatePickerModal
          value={schedule.targetDate}
          onChange={iso => {
            onUpdate({ targetDate: iso });
            if (attempted) validate({ ...schedule, targetDate: iso });
          }}
          onClose={() => setCalOpen(false)}
        />
      )}
    </div>
  );
}
