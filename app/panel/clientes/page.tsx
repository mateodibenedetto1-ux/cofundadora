import Link from 'next/link';
import { listClients } from '@/lib/data';
import { createClientAccount } from '@/lib/actions';
import { STATUS_LABEL } from '@/lib/format';
import { Cells } from '@/components/Cells';
import type { ClientSummary } from '@/lib/types';

export const metadata = { title: 'Fundadoras' };

export default async function Clients({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [everyone, sp] = await Promise.all([listClients(), searchParams]);
  const past = everyone.filter((c) => c.status === 'finalizado');
  const clients = everyone.filter((c) => c.status !== 'finalizado');
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Fundadoras</h1>
          <p>Cada fundadora de MAGNA tiene su propio portal: su segundo cerebro, Visionaria, su roadmap y todo lo que le compartes.</p>
        </div>
        <a href="#nueva" className="btn">Nueva fundadora</a>
      </div>

      <ul className="list panel" style={{ marginBottom: 32 }}>
        {clients.map((c) => <ClientRow key={c.id} c={c} />)}
        {!clients.length && <li className="empty">Todavía no hay fundadoras. Crea la primera abajo.</li>}
      </ul>

      {past.length > 0 && (
        <details className="past">
          <summary>Egresadas · {past.length}</summary>
          <p className="muted small" style={{ margin: '0 0 10px' }}>Fundadoras que terminaron el programa. Su portal queda guardado para consultarlo.</p>
          <ul className="list panel">
            {past.map((c) => <ClientRow key={c.id} c={c} />)}
          </ul>
        </details>
      )}

      <section id="nueva" className="panel panel-pad">
        <h2 className="serif" style={{ fontSize: 26, marginBottom: 4 }}>Nueva fundadora</h2>
        <p className="muted small" style={{ marginBottom: 18 }}>
          Al crearla se arma su portal. Desde la pestaña Accesos le envías la invitación por email.
        </p>
        {sp.error && <p className="small" style={{ color: 'var(--brand)', marginBottom: 14 }}>No se pudo crear: {sp.error}</p>}
        <form action={createClientAccount} className="stack" style={{ gap: 14 }}>
          <div className="form-grid">
            <label className="field">Nombre de la fundadora o de su marca<input className="input" name="name" required /></label>
            <label className="field">Nombre de contacto<input className="input" name="contact_name" /></label>
            <label className="field">Email<input className="input" name="contact_email" type="email" /></label>
            <label className="field">Programa
              <select className="select" name="offer" defaultValue="MAGNA">
                <option>MAGNA</option><option>Cofundadora</option>
              </select>
            </label>
            <label className="field">Estado
              <select className="select" name="status" defaultValue="onboarding">
                {Object.entries(STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </label>
            <label className="field">Fecha de inicio<input className="input" name="start_date" type="date" /></label>
          </div>
          <div><button className="btn primary">Crear fundadora</button></div>
        </form>
      </section>
    </>
  );
}

function ClientRow({ c }: { c: ClientSummary }) {
  return (
    <li>
      <Link href={`/panel/clientes/${c.slug}`} className="list-row">
        <div className="grow">
          <div className="row" style={{ gap: 8 }}>
            <span style={{ fontWeight: 500 }}>{c.name}</span>
            <span className={`tag ${c.status === 'activo' ? 'ok' : c.status === 'onboarding' ? 'brand' : ''}`}>{STATUS_LABEL[c.status]}</span>
          </div>
          <div className="muted small">
            {[c.offer, c.contact_name].filter(Boolean).join(' · ') || 'Sin datos'}
          </div>
        </div>
        <div className="stack" style={{ alignItems: 'flex-end', gap: 6, maxWidth: 180 }}>
          <Cells done={c.total - c.pending} total={c.total} />
          <span className="muted small">{c.pending ? `${c.pending} pendientes` : "Al día"}</span>
        </div>
      </Link>
    </li>
  );
}
