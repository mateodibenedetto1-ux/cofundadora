'use client';
import { useActionState } from 'react';
import { uploadKbFiles } from '@/lib/actions';
import { SubmitButton } from './SubmitButton';

export function KbUpload() {
  const [state, action] = useActionState(uploadKbFiles, { done: [] as string[], failed: [] as string[] });
  return (
    <form action={action} className="stack" style={{ gap: 12 }}>
      <input className="input" type="file" name="files" multiple accept=".pdf,.docx,.txt,.md,.srt,.vtt" required />
      <div><SubmitButton pendingLabel="Leyendo archivos…">Subir</SubmitButton></div>
      {state.done.length > 0 && <p className="small" style={{ color: 'var(--ok)' }}>Listo: {state.done.join(', ')}</p>}
      {state.failed.length > 0 && <p className="small" style={{ color: 'var(--warn)' }}>No se pudo: {state.failed.join(', ')}</p>}
    </form>
  );
}
