import { getKbDocs } from '@/lib/data';
import { DEMO } from '@/lib/env';
import { dropboxConnected, dropboxReady, dropboxRedirect, getDropboxConfig } from '@/lib/kb';
import { addDropboxFolder, deleteKbDoc, disconnectDropboxAction, removeDropboxFolder, syncDropboxNow } from '@/lib/actions';
import { KbUpload } from '@/components/KbUpload';
import { SubmitButton } from '@/components/SubmitButton';
import { relative } from '@/lib/format';

export const metadata = { title: 'Método' };

const MOD: Record<string, string> = {
  metodo: 'Método', 'mujer-magna': 'Mujer Magna', 'marca-memorable': 'Marca memorable', 'modelo-maestro': 'Modelo maestro', coaching: 'Coaching', guias: 'Guías',
};

export default async function Metodo({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const sp = await searchParams;
  const [docs, cfg, conn] = DEMO
    ? [[], { folders: [] as { url: string; label: string }[], lastSync: undefined, lastResult: undefined }, null]
    : await Promise.all([getKbDocs(), getDropboxConfig(), dropboxConnected()]);
  const ok = docs.filter((d) => d.status === 'ok');
  const chars = ok.reduce((s, d) => s + d.chars, 0);

  return (
    <div className="page-enter stack" style={{ gap: 24 }}>
      <header className="hello">
        <h1>Método MAGNA</h1>
        <p>Todo lo que Visionaria sabe del método: clases, transcripciones y guías. Lo usa para responderles a las fundadoras como lo harías tú.</p>
      </header>
      {sp.error && <p className="panel panel-pad small" style={{ color: 'var(--warn)' }}>{sp.error}</p>}
      {sp.ok && <p className="panel panel-pad small" style={{ color: 'var(--ok)' }}>Dropbox conectado. Ahora suma las carpetas.</p>}

      <div className="kpis">
        <div className="panel kpi"><b>{ok.length}</b><span>documentos activos</span></div>
        <div className="panel kpi"><b>{Math.round(chars / 1000)}k</b><span>caracteres de método</span></div>
        <div className="panel kpi"><b>{cfg.lastSync ? relative(cfg.lastSync) : '—'}</b><span>última sincronización</span></div>
      </div>

      <section className="panel panel-pad stack" style={{ gap: 14 }}>
        <div className="row between wrap" style={{ gap: 10 }}>
          <div>
            <h2 className="serif" style={{ fontSize: 24 }}>Dropbox automático</h2>
            <p className="muted small">Cada día revisa las carpetas y suma lo nuevo: PDF, Word y transcripciones. Los videos se saltean.</p>
          </div>
          {conn ? (
            <div className="row" style={{ gap: 8 }}>
              <span className="tag ok">Conectado · {conn}</span>
              <form action={disconnectDropboxAction}><button className="btn ghost sm">Desconectar</button></form>
            </div>
          ) : dropboxReady() ? (
            <a href="/api/dropbox/connect" className="btn primary">Conectar Dropbox</a>
          ) : (
            <span className="tag">Falta configurar en Vercel</span>
          )}
        </div>
        {!dropboxReady() && (
          <p className="small muted">Para activarlo hay que crear una app en dropbox.com/developers y cargar DROPBOX_APP_KEY y DROPBOX_APP_SECRET en Vercel. Redirect URI: <code>{dropboxRedirect()}</code></p>
        )}
        {conn && (
          <>
            <ul className="stack" style={{ gap: 6, listStyle: 'none', padding: 0 }}>
              {cfg.folders.map((f) => (
                <li key={f.url} className="row between small" style={{ gap: 10 }}>
                  <span><b style={{ fontWeight: 500 }}>{f.label}</b> <span className="muted">· {f.url.slice(0, 60)}…</span></span>
                  <form action={removeDropboxFolder.bind(null, f.url)}><button className="btn ghost sm">Quitar</button></form>
                </li>
              ))}
              {!cfg.folders.length && <li className="muted small">Todavía no hay carpetas.</li>}
            </ul>
            <form action={addDropboxFolder} className="row wrap" style={{ gap: 8 }}>
              <input className="input" name="label" placeholder="Nombre (ej. Clases MAGNA)" style={{ maxWidth: 220 }} required />
              <input className="input grow" name="url" placeholder="Link de la carpeta compartida de Dropbox" required />
              <button className="btn">Sumar carpeta</button>
            </form>
            <form action={syncDropboxNow} className="row wrap" style={{ gap: 10 }}>
              <SubmitButton pendingLabel="Sincronizando…" className="btn">Sincronizar ahora</SubmitButton>
              {cfg.lastResult && <span className="muted small">{cfg.lastResult}</span>}
            </form>
          </>
        )}
      </section>

      <section className="panel panel-pad stack" style={{ gap: 12 }}>
        <h2 className="serif" style={{ fontSize: 24 }}>Subir archivos</h2>
        <p className="muted small">Para sumar algo a mano: la metodología, las preguntas frecuentes de Val o una guía. PDF, Word o TXT.</p>
        <KbUpload />
      </section>

      <section>
        <h2 className="section-title">Documentos ({docs.length})</h2>
        <ul className="list panel">
          {docs.map((d) => (
            <li key={d.id} className="list-row">
              <div className="grow">
                <div style={{ fontWeight: 500 }}>{d.title}</div>
                <div className="muted small">
                  {[d.category, d.module ? MOD[d.module] ?? d.module : null, `${Math.round(d.chars / 1000)}k caracteres`, relative(d.updated_at)].filter(Boolean).join(' · ')}
                  {d.status !== 'ok' && <span style={{ color: 'var(--warn)' }}> · sin texto legible</span>}
                </div>
              </div>
              <form action={deleteKbDoc.bind(null, d.id)}><button className="btn ghost sm">Quitar</button></form>
            </li>
          ))}
          {!docs.length && <li className="empty">Todavía no hay documentos del método. Sube la metodología o conecta Dropbox.</li>}
        </ul>
      </section>
    </div>
  );
}
