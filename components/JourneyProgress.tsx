import type { JourneyView } from '@/lib/journey-view';

/** Avance del método MAGNA por hitos (sin semanas). */
export function JourneyProgress({ view, compact }: { view: JourneyView; compact?: boolean }) {
  const current = view.stages.find((s) => s.k === view.current);
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="row between" style={{ gap: 10 }}>
        <div>
          <div className="muted small">Hito actual</div>
          <div style={{ fontWeight: 500, fontSize: compact ? 15 : 17 }}>{current ? `${current.n} · ${current.title}` : 'Método MAGNA completo'}</div>
        </div>
        <span className="muted small">Hito {view.index} de {view.total}</span>
      </div>
      <div className="bar"><span style={{ width: `${view.pct}%` }} /></div>
      {!compact && current && <p className="muted small">{current.about}</p>}
    </div>
  );
}
