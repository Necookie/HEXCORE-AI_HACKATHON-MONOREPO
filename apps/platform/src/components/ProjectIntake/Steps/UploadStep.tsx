import { useRef, useState } from 'react';
import { Ic, Btn } from '../../ui';

interface UploadStepProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  error: string | null;
  onNext: () => void;
}

export function UploadStep({ file, onFileSelect, error, onNext }: UploadStepProps) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') {
      onFileSelect(f);
    }
  };

  return (
    <div className="fade-in">
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
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
      <input 
        ref={inputRef} 
        type="file" 
        accept="application/pdf" 
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFileSelect(f); }} 
      />
      {error && (
        <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Ic n="x" size={14} color="var(--red)" />{error}
        </p>
      )}
      <Btn v="primary" size="lg" disabled={!file} onClick={onNext} sx={{ width: '100%', justifyContent: 'center' }}>
        Continue <Ic n="right" size={16} color="#fff" />
      </Btn>
    </div>
  );
}
