'use client';

import { useRef, useState } from 'react';
import { marked } from 'marked';
import { GENERATORS, type Generator } from '@/lib/generators';
import { saveGeneratedPiece } from '@/lib/actions';

/** Visionaria: generadores guiados. La fundadora elige el formato, completa el formulario y edita la pieza. */
export function VisionariaStudio({ slug, orgId }: { slug: string; orgId: string }) {
  const [gk, setGk] = useState(GENERATORS[0].k);
  const gen = GENERATORS.find((g) => g.k === gk)!;
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [out, setOut] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tweak, setTweak] = useState('');
  const [note, setNote] = useState('');
  const outRef = useRef<HTMLDivElement>(null);
  const vals = values[gk] ?? {};
  const set = (k: string, v: string) => setValues((m) => ({ ...m, [gk]: { ...(m[gk] ?? {}), [k]: v } }));
  const ready = gen.fields.every((f) => f.optional || String(vals[f.k] ?? '').trim());

  const run = async (extra?: { tweak: string; previous: string }) => {
    setBusy(true); setEditing(false); setNote(''); setOut('');
    outRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try {
      const r = await fetch('/api/ai/generate', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ client: slug, gen: gk, values: vals, ...(extra ?? {}) }),
      });
      if (!r.ok || !r.body) { setOut(`⚠️ ${await r.text()}`); return; }
      const rd = r.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      for (;;) {
        const { value, done } = await rd.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setOut(acc);
      }
    } catch {
      setOut('⚠️ No pude conectarme. Revisa tu conexión y vuelve a intentar.');
    } finally {
      setBusy(false); setTweak('');
    }
  };

  const title = () => {
    const base = String(vals.tema ?? vals.transformacion ?? vals.oferta ?? '').split('\n')[0].slice(0, 70);
    return `${gen.title}${base ? ` · ${base}` : ''}`;
  };

  return (
    <div className="vs">
      <div className="vs-tabs" role="tablist" aria-label="Formato">
        {GENERATORS.map((g) => (
          <button key={g.k} role="tab" aria-selected={g.k === gk} className={`chip ${g.k === gk ? 'on' : ''}`} onClick={() => { setGk(g.k); setOut(''); }}>{g.label}</button>
        ))}
      </div>

      <section className="panel panel-pad">
        <h2 className="serif" style={{ fontSize: 26 }}>{gen.label}</h2>
        <p className="muted small" style={{ marginBottom: 18 }}>{gen.about} Visionaria lo escribe con tu esencia y tu voz, desde tu Segundo cerebro.</p>
        <form className="stack" style={{ gap: 14 }} onSubmit={(e) => { e.preventDefault(); if (ready && !busy) void run(); }}>
          {gen.fields.map((f, i) => <Field key={`${gen.k}-${f.k}`} f={f} n={i + 1} value={vals[f.k] ?? ''} onChange={(v) => set(f.k, v)} />)}
          <div><button className="btn primary" disabled={!ready || busy}>{busy ? <><span className="spin" aria-hidden="true" />Escribiendo…</> : `Crear ${gen.title.toLowerCase()}`}</button></div>
        </form>
      </section>

      <div ref={outRef} />
      {(out || busy) && (
        <section className="panel panel-pad vs-out">
          <div className="row between wrap" style={{ gap: 8, marginBottom: 12 }}>
            <h3 className="serif" style={{ fontSize: 22 }}>{title()}</h3>
            {!busy && out && (
              <div className="row wrap" style={{ gap: 6 }}>
                <button className="btn ghost sm" onClick={() => setEditing((e) => !e)}>{editing ? 'Ver' : 'Editar'}</button>
                <button className="btn ghost sm" onClick={() => { void navigator.clipboard.writeText(out); setNote('Copiado'); }}>Copiar</button>
                <button className="btn sm" onClick={async () => { const r = await saveGeneratedPiece(orgId, title(), out); setNote(r.ok ? 'Guardado en tu Biblioteca' : 'No se pudo guardar'); }}>Guardar en Biblioteca</button>
              </div>
            )}
          </div>
          {note && <p className="small" style={{ color: 'var(--ok)', marginBottom: 10 }}>{note}</p>}
          {editing
            ? <textarea className="textarea vs-edit" value={out} onChange={(e) => setOut(e.target.value)} rows={18} />
            : out ? <div className="ai-md" dangerouslySetInnerHTML={{ __html: marked.parse(out, { async: false }) as string }} /> : <p className="muted ai-typing">Escribiendo con tu voz…</p>}
          {!busy && out && (
            <form className="row" style={{ gap: 8, marginTop: 16 }} onSubmit={(e) => { e.preventDefault(); if (tweak.trim()) void run({ tweak, previous: out }); }}>
              <input className="input grow" value={tweak} onChange={(e) => setTweak(e.target.value)} placeholder="Pídele un ajuste: más corto, otro gancho, más cercano…" />
              <button className="btn" disabled={!tweak.trim()}>Ajustar</button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}

function Field({ f, n, value, onChange }: { f: Generator['fields'][number]; n: number; value: string; onChange: (v: string) => void }) {
  const label = <span>{n}. {f.label}{f.optional ? <span className="muted"> (opcional)</span> : null}</span>;
  if (f.kind === 'select') {
    return (
      <div className="field">
        {label}
        <div className="vs-opts">
          {f.options!.map((o) => (
            <button type="button" key={o} className={`chip ${value === o ? 'on' : ''}`} onClick={() => onChange(o)}>{o}</button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <label className="field">
      {label}
      {f.kind === 'textarea'
        ? <textarea className="textarea" rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />
        : <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />}
    </label>
  );
}
