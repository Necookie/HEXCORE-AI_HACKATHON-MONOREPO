import { useRef, useState } from 'react';
import { Ic, Btn } from '../../ui';
import { MAX_FILE_BYTES, MAX_FILE_MB } from '../../../types/project.types';

interface UploadStepProps {
  file:         File | null;
  onFileSelect: (file: File) => void;
  error:        string | null;
  onNext:       () => void;
}

function validateFile(f: File): string | null {
  if (f.type !== 'application/pdf') return 'Only PDF files are accepted.';
  if (f.size === 0)                 return 'The selected file is empty.';
  if (f.size > MAX_FILE_BYTES)
    return `File exceeds the ${MAX_FILE_MB} MB limit (${(f.size / 1024 / 1024).toFixed(1)} MB).`;
  return null;
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: 'rgba(245,107,107,0.08)',
      border: '1px solid rgba(245,107,107,0.28)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px', marginBottom: 14,
    }}>
      <Ic n="x" size={15} color="var(--red)" />
      <span style={{ fontSize: 13, color: 'var(--red)', lineHeight: 1.5 }}>{message}</span>
    </div>
  );
}

export function UploadStep({ file, onFileSelect, error, onNext }: UploadStepProps) {
  const [drag,      setDrag]      = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = (f: File) => {
    const err = validateFile(f);
    if (err) { setFileError(err); }
    else     { setFileError(null); onFileSelect(f); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) accept(f);
  };

  const displayError = fileError ?? error;
  const hasError     = !!displayError && !file;

  return (
    <div className="fade-in">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        style={{
          border: `2px dashed ${
            drag      ? 'var(--purple)'
            : file    ? 'var(--green)'
            : hasError? 'rgba(245,107,107,0.5)'
            : 'var(--border)'
          }`,
          borderRadius: 'var(--radius-xl)', padding: '48px 32px', textAlign: 'center',
          background: drag    ? 'rgba(123,92,245,0.05)'
            : file            ? 'rgba(74,222,128,0.04)'
            : hasError        ? 'rgba(245,107,107,0.03)'
            : 'var(--bg-elevated)',
          cursor: file ? 'default' : 'pointer',
          transition: 'all 0.22s ease', marginBottom: 16,
        }}
      >
        <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
          {file
            ? <Ic n="file"   size={40} color="var(--green)" />
            : <Ic n="upload" size={40}
                color={drag ? 'var(--purple-light)' : hasError ? 'var(--red)' : 'var(--text-muted)'} />
          }
        </div>

        {file ? (
          <>
            <div style={{
              fontFamily: 'var(--font-heading)', fontWeight: 600,
              color: 'var(--green)', fontSize: 15, marginBottom: 6,
              wordBreak: 'break-all',
            }}>{file.name}</div>
            <div style={{
              color: 'var(--text-secondary)', fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <button
                onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                className="no-3d"
                style={{
                  background: 'none', border: 'none', color: 'var(--purple-light)',
                  cursor: 'pointer', fontSize: 13, padding: 0, fontFamily: 'var(--font-body)',
                }}
              >Change file</button>
            </div>
          </>
        ) : (
          <>
            <div style={{
              fontFamily: 'var(--font-heading)', fontWeight: 600,
              fontSize: 16, marginBottom: 6, color: 'var(--text-primary)',
            }}>Drop your PDF here</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              PDF only · max {MAX_FILE_MB} MB · click to browse
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) accept(f);
          e.target.value = ''; // allow re-selecting same file
        }}
      />

      {displayError && <ErrorBanner message={displayError} />}

      <Btn v="primary" size="lg" disabled={!file} onClick={onNext}
        sx={{ width: '100%', justifyContent: 'center' }}>
        Continue <Ic n="right" size={16} color="#fff" />
      </Btn>
    </div>
  );
}
