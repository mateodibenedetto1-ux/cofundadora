'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toggleAction } from '@/lib/actions';
import type { JourneyView, Stage } from '@/lib/journey-view';

/**
 * Roadmap del método MAGNA por hitos (sin semanas ni fechas): cada fundadora avanza a su ritmo.
 * Un hito se cumple cuando completa sus secciones del Segundo cerebro y sus tareas.
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
    const items = [...s.sections.map((x) => x.pct >= 80), ...s.tasks.map((t) => tasks[t.id])];
    return items.length ? Math.round((items.filter(Boolean).length / items.length) * 100) : 0;
  };

  return (
    <div className="jr">
      <div className="jr-top panel panel-pad">
        <div className="row between wrap" style={{ gap: 10 }}>
          <div>
            <div className="muted small">Hito actual</div>
            <div className="jr-now">{current ? `${current.n} · ${current.title}` : 'Método MAGNA completo'}</div>
          </div>
          <div className="jr-week">Hito {view.index} <span>de {view.total}</span></div>
        </div>
        <div className="bar" style={{ marginTop: 12 }}><span style={{ width: `${view.pct}%` }} /></div>
        <p className="muted small" style={{ marginTop: 10 }}>Avanzas a tu ritmo: no hay semanas ni nada que desbloquear. Las sesiones de MAGNA siguen en paralelo durante todo el año.</p>
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
          Hito {stage.n} · Lo guía {stage.lead}
          <span className={`tag ${stage.state === 'done' ? 'ok' : stage.state === 'now' ? 'brand' : ''}`}>
            {stage.state === 'done' ? 'Cumplido' : stage.state === 'now' ? 'En curso' : 'Próximo'}
          </span>
        </div>
        <h2>{stage.title}</h2>

        {(
          <>
            <p className="jr-objective">{stage.objective ?? stage.about}</p>
            <div className="bar" style={{ maxWidth: 280, margin: '4px 0 22px' }}><span style={{ width: `${stagePct(stage)}%` }} /></div>

            <div className="jr-grid">
              <div>
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
                {stage.hitos.length > 0 && (
                  <>
                    <h3>Logros de este hito</h3>
                    <ul className="jr-list">
                      {stage.hitos.map((h) => (
                        <li key={h.id} className="jr-hito">
                          <span className="jr-flag" aria-hidden="true">◆</span>
                          <div>
                            <div>{h.title}</div>
                            {h.detail && <div className="muted small">{h.detail}</div>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {view.classesUrl && <a href={view.classesUrl} target="_blank" rel="noreferrer" className="btn sm" style={{ marginTop: 6 }}>Ver las clases</a>}
              </div>

              <div>
                <h3>Tareas · {stage.tasks.filter((t) => tasks[t.id]).length}/{stage.tasks.length}</h3>
                <ul className="jr-list">
                  {stage.tasks.map((t) => (
                    <li key={t.id} className={`jr-task ${tasks[t.id] ? 'done' : ''}`}>
                      <input type="checkbox" className="check" checked={Boolean(tasks[t.id])} onChange={() => toggle(t.id)} aria-label={t.title} disabled={!staff && t.owner === 'fractal'} />
                      <div>
                        <div>{t.title}</div>
                        <div className="muted small">
                          {t.owner === 'fractal' ? 'Lo hace el equipo' : 'Lo haces tú'}{t.source === 'roadmap' ? ' · Personalizada' : ''}
                        </div>
                      </div>
                    </li>
                  ))}
                  {!stage.tasks.length && <li className="muted small">Sin tareas en este hito.</li>}
                </ul>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
