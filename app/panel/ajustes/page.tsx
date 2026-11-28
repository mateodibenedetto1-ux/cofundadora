import { SubmitButton } from '@/components/SubmitButton';
import { RemoveMember } from '@/components/RemoveMember';
import { getMembers, requireViewer } from '@/lib/data';
import { inviteClientUser, updateMyName } from '@/lib/actions';
import { DEMO } from '@/lib/env';
import { supabaseServer } from '@/lib/supabase/server';

export const metadata = { title: 'Ajustes' };

export default async function Settings({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  let agencyId = '';
  if (!DEMO) {
    const sb = await supabaseServer();
    const { data } = await sb.from('organizations').select('id').eq('kind', 'agency').limit(1).single();
    agencyId = data?.id ?? '';
  }
  const team = agencyId ? await getMembers(agencyId) : [];
  const me = await requireViewer();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Ajustes</h1>
          <p>El equipo de Seres Magnéticos ve y edita los portales de todas las fundadoras.</p>
        </div>
      </div>
      {sp.error && <p className="panel panel-pad small" style={{ color: 'var(--brand)', marginBottom: 20 }}>Algo no se guardó: {sp.error}</p>}
      <form action={updateMyName} className="panel panel-pad row wrap" style={{ marginBottom: 20, gap: 14, alignItems: 'flex-end' }}>
        <label className="field grow" style={{ minWidth: 220 }}>Tu nombre
          <input className="input" name="full_name" defaultValue={me.name} required />
        </label>
        <SubmitButton pendingLabel="Guardando…">Guardar nombre</SubmitButton>
      </form>
      <div className="two">
        <section>
          <h2 className="section-title">Equipo</h2>
          <ul className="list panel">
            {team.map((m) => (
              <li key={m.email} className="list-row">
                <div className="grow">
                  <div style={{ fontWeight: 500 }}>{m.name || m.email}</div>
                  <div className="muted small">{m.email}</div>
                </div>
                {m.pending && <span className="tag brand">Invitación pendiente</span>}
                <span className="tag">{m.role === 'owner' ? 'Dueño' : m.role === 'admin' ? 'Admin' : 'Equipo'}</span>
                {m.role !== 'owner' && m.userId !== me.id && <RemoveMember orgId={agencyId} userId={m.userId} pending={m.pending} />}
              </li>
            ))}
            {!team.length && <li className="empty">Sin miembros cargados.</li>}
          </ul>
        </section>
        <form action={inviteClientUser} className="panel panel-pad stack" style={{ gap: 14 }}>
          <b style={{ fontWeight: 600 }}>Sumar a alguien del equipo</b>
          <input type="hidden" name="org_id" value={agencyId} />
          <label className="field">Nombre<input className="input" name="name" /></label>
          <label className="field">Email<input className="input" name="email" type="email" required /></label>
          <label className="field">Rol
            <select className="select" name="role" defaultValue="member">
              <option value="admin">Admin: ve y edita todo, puede sumar gente</option>
              <option value="member">Equipo: ve y edita los portales</option>
            </select>
          </label>
          <div><SubmitButton pendingLabel="Enviando…">Enviar invitación</SubmitButton></div>
        </form>
      </div>
    </>
  );
}
