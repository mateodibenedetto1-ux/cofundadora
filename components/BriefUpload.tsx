'use client';
import { useActionState } from 'react';
import { uploadBrandBrief } from '@/lib/actions';
import { SubmitButton } from './SubmitButton';

/** Subir el Brand Brief al Segundo cerebro. */
export function BriefUpload({ orgId, current }: { orgId: string; current?: string | null }) {
  const [state, action] = useActionState(uploadBrandBrief.bind(null, orgId), { ok: true, msg: '' });
  return (
    <form action={action} className="panel panel-pad row between wrap brief-up" style={{ gap: 12 }}>
      <div className="grow" style={{ minWidth: 220 }}>
        <b style={{ fontWeight: 500 }}>¿Ya tienes tu Brand Brief?</b>
        <p className="muted small">Súbelo en PDF o Word: completo solo las respuestas del formulario que estén en tu brief, y tu Cofundadora y Visionaria lo usan como tu manual de marca.{current ? ` Actual: ${current}.` : ''}</p>
        {state.msg && <p className="small" style={{ color: state.ok ? 'var(--ok)' : 'var(--warn)', marginTop: 6 }}>{state.msg}</p>}
      </div>
      <div className="row wrap" style={{ gap: 8 }}>
        <input className="input" type="file" name="file" accept=".pdf,.docx,.txt,.md" required style={{ maxWidth: 260 }} />
        <SubmitButton pendingLabel="Leyendo y completando…" className="btn">{current ? 'Reemplazar' : 'Subir'}</SubmitButton>
      </div>
    </form>
  );
}
