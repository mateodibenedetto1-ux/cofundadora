import Link from 'next/link';
import { getAllMilestones, getAllOpenActions, getViewer, listClients } from '@/lib/data';
import { journeySummaries } from '@/lib/journey-view';
import { STATUS_LABEL } from '@/lib/format';
import { Cells } from '@/components/Cells';

export const metadata = { title: 'Home' };

export default async function PanelHome() {
  const [v, clients, open, milestones] = await Promise.all([getViewer(), listClients(), getAllOpenActions(), getAllMilestones()]);
  const journeys = await journeySummaries(clients.map((c) => c.id));
  void milestones;
  const active = clients.filter((c) => c.status === 'activo' || c.status === 'onboarding');
  const onboarding = clients.filter((c) => c.status === 'onboarding');
  const teamOwned = open.filter((a) => a.owner === 'fractal');

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Hola, {v?.name.split(' ')[0]}</h1>
          <p>Así van tus fundadoras hoy.</p>
        </div>
        <Link href="/panel/clientes#nueva" className="btn primary">Nueva fundadora</Link>
      </div>

      <div className="kpis">
        <div className="panel kpi"><b>{active.length}</b><span>fundadoras activas</span></div>
        <div className="panel kpi"><b>{onboarding.length}</b><span>en onboarding</span></div>
        <div className="panel kpi"><b>{open.length - teamOwned.length}</b><span>accionables abiertos de ellas</span></div>
        <div className="panel kpi"><b>{teamOwned.length}</b><span>pendientes del equipo</span></div>
      </div>

      <div className="two">
        <section>
          <h2 className="section-title">Fundadoras</h2>
          <ul className="list panel">
            {active.map((c) => (
              <li key={c.id}>
                <Link href={`/panel/clientes/${c.slug}`} className="list-row">
                  <div className="grow">
                    <div style={{ fontWeight: 500 }}>{c.name}</div>
                    {(() => {
                      const r = journeys.get(c.id);
                      return r ? (
                        <div className="small" style={{ color: 'var(--ink-2)', marginTop: 2 }}>
                          Hito {r.index} de {r.total} · {r.title}
                        </div>
                      ) : null;
                    })()}
                    <div className="muted small">{c.next_step ?? 'Sin próximo paso definido'}</div>
                  </div>
                  <div className="stack" style={{ alignItems: 'flex-end', gap: 6, maxWidth: 210 }}>
                    <Cells done={c.total - c.pending} total={c.total} />
                    <span className="muted small">{c.pending ? `${c.pending} pendientes` : 'Al día'}</span>
                  </div>
                </Link>
              </li>
            ))}
            {!active.length && <li className="empty">Todavía no hay fundadoras. Crea la primera desde Fundadoras.</li>}
          </ul>
        </section>
        <section>
          <h2 className="section-title">Estado del programa</h2>
          <div className="panel panel-pad stack" style={{ gap: 8 }}>
            {Object.entries(STATUS_LABEL).map(([k, label]) => (
              <div key={k} className="row between small">
                <span>{label}</span>
                <span className="muted">{clients.filter((c) => c.status === k).length}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
