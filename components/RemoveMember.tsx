'use client';
import { useState, useTransition } from 'react';
import { removeMember } from '@/lib/actions';

/** Botón para cancelar una invitación o quitar un acceso. Pide un segundo clic para confirmar. */
export function RemoveMember({ orgId, userId, pending }: { orgId: string; userId: string; pending: boolean }) {
  const [sure, setSure] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, start] = useTransition();
  const label = pending ? 'Cancelar invitación' : 'Quitar acceso';
  return (
    <span className="row" style={{ gap: 6 }}>
      {msg && <span className="small" style={{ color: 'var(--warn)' }}>{msg}</span>}
      <button
        type="button"
        className="btn ghost sm"
        disabled={busy}
        onClick={() => {
          if (!sure) { setSure(true); setTimeout(() => setSure(false), 4000); return; }
          start(async () => { const r = await removeMember(orgId, userId); if (r && !r.ok) setMsg(r.msg ?? 'No se pudo'); setSure(false); });
        }}
      >
        {busy ? 'Quitando…' : sure ? '¿Segura? Toca de nuevo' : label}
      </button>
    </span>
  );
}
