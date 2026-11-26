'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toggleAction } from '@/lib/actions';
import type { JourneyView, Stage } from '@/lib/journey-view';
import { ALWAYS } from '@/lib/brain';

/**
 * Roadmap del método MAGNA: 5 fases sin semanas ni fechas. Cada fase dice qué clase ver,
 * qué material usar y qué pasos hacer; se cumple al marcar todos sus pasos.
 */
export function JourneyRoadmap({ view, base, staff }: { view: JourneyView; base: string; staff?: boolean }) {
  const [sel, setSel] = useState(view.current ?? view.stages[view.stages.length - 1].k);
  const [tasks, setTasks] = useState(() => Object.fromEntries(view.stages.flatMap((s) => s.tasks.map((t) => [t.id, t.done]))));
  const stage = view.stages.find((s) => s.k === sel)!;
  const current = view.stages.find((s) => s.k === view.current);

  const toggle = (id: string) => {
    const next = !tasks[id];
    setTasks((m) => ({ ...m, [id]: next }));
    toggleAction(id, next).catch(() => setTasks((m) => ({ ...m, [id]: !next })));
  };

  const stagePct = (s: Stage) => {
    const items = s.tasks.length ? s.tasks.map((t) => tasks[t.id]) : s.sections.map((x) => x.pct >= 80);
    return items.length ? Math.round((items.filter(Boolean).length / items.length) * 100) : 0;
  };

  return (
    <div className="jr">
      <div className="jr-top panel panel-pad">
        <div className="row between wrap" style={{ gap: 10 }}>
          <div>
            <div className="muted small">Estás en</div>
            <div className="jr-now">{current ? `Fase ${current.n} · ${current.title}` : 'Método MAGNA completo: de experta a fundadora'}</div>
          </div>
          <div className="jr-week">Fase {view.index} <span>de {view.total}</span></div>
        </div>
        <div className="bar" style={{ marginTop: 12 }}><span style={{ width: `${view.pct}%` }} /></div>
        <p className="muted small" style={{ marginTop: 10 }}>Identifica en qué fase estás y dónde accionar: mira la clase, descarga el material y avanza a tu ritmo.</p>
        {view.docId && (
          <Link href={`${base}/biblioteca/${view.docId}`} className="small jr-doc">Leer tu estrategia completa →</Link>
        )}
      </div>

      <ol className="jr-steps" aria-label="Etapas del recorrido">
        {view.stages.map((s) => (
          <li key={s.k}>
            <button className={`jr-step ${s.state} ${s.k === sel ? 'on' : ''}`} onClick={() => setSel(s.k)} aria-current={s.k === sel ? 'step' : undefined}>
              <span className="jr-dot">{s.state === 'done' ? '✓' : s.n}</span>
              <span className="jr-label">{s.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <section className={`panel panel-pad jr-stage ${stage.state}`} key={stage.k}>
        <div className="jr-kicker">
          Fase {stage.n}
          <span className={`tag ${stage.state === 'done' ? 'ok' : stage.state === 'now' ? 'brand' : ''}`}>
            {stage.state === 'done' ? 'Terminada' : stage.state === 'now' ? 'En curso' : 'Próxima'}
          </span>
        </div>
        <h2>{stage.title}</h2>
        <p className="jr-objective">{stage.about}</p>
        <div className="bar" style={{ maxWidth: 280, margin: '4px 0 22px' }}><span style={{ width: `${stagePct(stage)}%` }} /></div>

        {(stage.practical || stage.emotional) && (
          <div className="jr-outcomes">
            {stage.practical && <div><h3>Sales con</h3><p>{stage.practical}</p></div>}
            {stage.emotional && <div><h3>Lo que cambia en ti</h3><p>{stage.emotional}</p></div>}
          </div>
        )}

        <div className="jr-grid">
          <div>
            <h3>Pasos · {stage.tasks.filter((t) => tasks[t.id]).length}/{stage.tasks.length}</h3>
            <ul className="jr-list">
              {stage.tasks.map((t) => (
                <li key={t.id} className={`jr-task ${tasks[t.id] ? 'done' : ''}`}>
                  <input type="checkbox" className="check" checked={Boolean(tasks[t.id])} onChange={() => toggle(t.id)} aria-label={t.title} disabled={!staff && t.owner === 'fractal'} />
                  <div>
                    <div>{t.title}</div>
                    {t.source === 'roadmap' && <div className="muted small">Personalizado para ti</div>}
                  </div>
                </li>
              ))}
              {!stage.tasks.length && <li className="muted small">Sin pasos en esta fase.</li>}
            </ul>
            {stage.done && <p className="jr-done"><b>Terminas cuando</b> {stage.done.charAt(0).toLowerCase() + stage.done.slice(1)}</p>}
          </div>

          <div>
            {stage.materials && stage.materials.length > 0 && (
              <>
                <h3>Materiales</h3>
                <ul className="jr-list jr-mats">
                  {stage.materials.map((m) => <li key={m}>{m}</li>)}
                </ul>
                <div className="row wrap" style={{ gap: 8, marginBottom: 18 }}>
                  {view.classesUrl && <a href={view.classesUrl} target="_blank" rel="noreferrer" className="btn sm">Ver las clases</a>}
                  <Link href={`${base}/biblioteca`} className="btn ghost sm">Ir a la Biblioteca</Link>
                </div>
              </>
            )}
            <h3>En tu Segundo cerebro</h3>
            <ul className="jr-list">
              {stage.sections.map((s) => (
                <li key={s.k}>
                  <Link href={`${base}/cerebro?s=${s.k}`} className="jr-sec">
                    <span>{s.n}. {s.title}</span>
                    <em className={s.pct >= 80 ? 'ok' : ''}>{s.pct}%</em>
                  </Link>
                </li>
              ))}
            </ul>
            {stage.content && <p className="muted small">Contenido en esta fase: {stage.content.toLowerCase()}.</p>}
          </div>
        </div>
      </section>

      <section className="panel panel-pad jr-always">
        <h3>Durante todo el método</h3>
        <p><b>Contenido.</b> {ALWAYS.content}</p>
        <p><b>Identidad.</b> {ALWAYS.identity}</p>
      </section>
    </div>
  );
}
