'use client';
import { useActionState } from 'react';
import { bulkCreateFundadoras } from '@/lib/actions';
import { SubmitButton } from './SubmitButton';

type R = { email: string; name: string; status: string; invited?: boolean; error?: string };

export function BulkImport() {
  const [state, action] = useActionState(bulkCreateFundadoras, { results: [] as R[] });
  const results = (state?.results ?? []) as R[];
  return (
    <form action={action} className="stack" style={{ gap: 14 }}>
      <label className="field">
        Pega la lista: una fundadora con su nombre y su email (puede ser tal cual está en Notion)
        <textarea className="input" name="list" rows={8} placeholder={'Romina Hendlin — Fotógrafa\n@rominahendlin\nromina@gmail.com\n\nGabriela Testa, gabriela@gmail.com'} required />
      </label>
      <label className="row" style={{ gap: 8 }}>
        <input type="checkbox" name="invite" defaultChecked /> <span className="small">Mandarles la invitación por email ahora</span>
      </label>
      <div><SubmitButton pendingLabel="Creando portales…">Crear portales</SubmitButton></div>
      {results.length > 0 && (
        <ul className="stack" style={{ gap: 6, listStyle: 'none', padding: 0 }}>
          {results.map((r) => (
            <li key={r.email} className="row between small" style={{ gap: 10 }}>
              <span>{r.name} <span className="muted">· {r.email}</span></span>
              <span className={`tag ${r.status === 'error' ? 'warn' : r.status === 'creada' ? 'ok' : ''}`}>
                {r.status === 'error' ? `Error: ${r.error}` : `${r.status}${r.invited ? ' · invitada' : ''}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
