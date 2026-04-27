import { ALL_DAYS, type ScheduleConfig, type StudyDay } from '../../../types/project.types';
import { Ic, Btn, Card } from '../../ui';

interface ScheduleStepProps {
  schedule: ScheduleConfig;
  onUpdate: (update: Partial<ScheduleConfig>) => void;
  error: string | null;
  onBack: () => void;
  onNext: () => void;
}

export function ScheduleStep({ schedule, onUpdate, error, onBack, onNext }: ScheduleStepProps) {
  const toggleDay = (day: StudyDay) => {
    const days = new Set(schedule.studyDays);
    if (days.has(day)) {
      days.delete(day);
    } else {
      days.add(day);
    }
    onUpdate({ studyDays: Array.from(days) });
  };

  return (
    <div className="fade-in">
      <Card sx={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 10, fontWeight: 500 }}>
            Daily Study Hours — <span style={{ color: 'var(--purple-light)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{schedule.hoursPerDay}h / day</span>
          </label>
          <input 
            type="range" 
            min={1} 
            max={8} 
            value={schedule.hoursPerDay}
            onChange={e => onUpdate({ hoursPerDay: +e.target.value })} 
          />
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
            onChange={e => onUpdate({ subjectName: e.target.value })}
            className="sb-input"
          />
        </div>

        <div>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, fontWeight: 500 }}>Target Completion Date</label>
          <input
            type="date"
            value={schedule.targetDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => onUpdate({ targetDate: e.target.value })}
            className="sb-input"
          />
        </div>

        <div>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 10, fontWeight: 500 }}>Study Days</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ALL_DAYS.map(d => {
              const on = schedule.studyDays.includes(d);
              return (
                <button 
                  key={d} 
                  type="button" 
                  onClick={() => toggleDay(d)}
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

      {error && (
        <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Ic n="x" size={14} color="var(--red)" />{error}
        </p>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn v="ghost" onClick={onBack}>Back</Btn>
        <Btn v="primary" size="md" onClick={onNext} sx={{ flex: 1, justifyContent: 'center' }}>
          <Ic n="zap" size={15} color="#fff" /> Generate Roadmap
        </Btn>
      </div>
    </div>
  );
}
