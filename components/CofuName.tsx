'use client';
import { useState } from 'react';
import { setCofundadoraName } from '@/lib/actions';

/** Título del chat con el nombre que la fundadora le puso a su Cofundadora, editable. */
export function CofuName({ orgId, initial }: { orgId: string; initial: string }) {
  const [name, setName] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [editing, setEditing] = useState(!initial);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!draft.trim()) return;
    setBusy(true);
    await setCofundadoraName(orgId, draft);
    setName(draft.trim()); setEditing(false); setBusy(false);
  };
  if (!editing) {
    return (
      <div className="cofu-name">
        <h1>{name}</h1>
        <button className="btn ghost sm" onClick={() => { setDraft(name); setEditing(true); }}>Cambiar nombre</button>
      </div>
    );
  }
  return (
    <form className="panel panel-pad cofu-name-form" onSubmit={(e) => { e.preventDefault(); void save(); }}>
      <b style={{ fontWeight: 500 }}>Ponle nombre a tu Cofundadora</b>
      <p className="muted small">Es tu socia: elige cómo quieres llamarla. Puedes cambiarlo cuando quieras.</p>
      <div className="row" style={{ gap: 8, marginTop: 10 }}>
        <input className="input grow" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={40} placeholder="Ej.: Aurora, Luna, Atenea…" autoFocus={!initial} />
        <button className="btn primary" disabled={busy || !draft.trim()}>{busy ? 'Guardando…' : 'Guardar'}</button>
        {initial && <button type="button" className="btn ghost" onClick={() => setEditing(false)}>Cancelar</button>}
      </div>
    </form>
  );
}
