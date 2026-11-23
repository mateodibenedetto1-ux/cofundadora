'use client';

import { useState, useTransition } from 'react';
import { connectAiKey, disconnectAiKey } from '@/lib/actions';

const STEPS: { title: string; body: React.ReactNode }[] = [
  {
    title: 'Crea tu cuenta en Anthropic',
    body: <>Entra a <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a> y regístrate con tu email (o inicia sesión si ya tienes cuenta). Anthropic es la empresa detrás de Claude, el modelo con el que funciona Visionaria.</>,
  },
  {
    title: 'Carga créditos',
    body: <>En <a href="https://console.anthropic.com/settings/billing" target="_blank" rel="noreferrer">Settings → Billing</a> agrega una tarjeta y carga saldo. Con 5 a 10 USD alcanza para empezar. Cada conversación descuenta de ese saldo, y en Settings → Limits puedes poner un tope de gasto mensual.</>,
  },
  {
    title: 'Crea una API key',
    body: <>Ve a <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">Settings → API Keys</a>, toca <b>Create Key</b> y ponle de nombre &ldquo;Visionaria&rdquo;.</>,
  },
  {
    title: 'Cópiala y pégala aquí abajo',
    body: <>La key empieza con <code>sk-ant-</code> y Anthropic la muestra una sola vez, así que cópiala completa antes de cerrar la ventana.</>,
  },
];

export function AiKeyConnect({ orgId, connected, hint, compact }: { orgId: string; connected: boolean; hint: string | null; compact?: boolean }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(!compact);
  const [pending, start] = useTransition();

  if (connected) {
    return (
      <div className="ai-key-ok">
        <span className="dot ok" aria-hidden="true" />
        <span className="small">API key de Anthropic conectada <span className="muted">(termina en {hint ?? '····'})</span></span>
        <button
          className="btn ghost sm"
          disabled={pending}
          onClick={() => { if (confirm('¿Desconectar la API key? Visionaria dejará de funcionar hasta que conectes otra.')) start(() => disconnectAiKey(orgId)); }}
        >
          {pending ? 'Desconectando…' : 'Desconectar'}
        </button>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await connectAiKey(orgId, key);
      if (!r.ok) setError(r.error ?? 'No se pudo conectar.');
      else setKey('');
    });
  };

  return (
    <div className="panel panel-pad ai-connect">
      <div className="row between">
        <div>
          <h2>Conecta a Visionaria</h2>
          <p className="muted">Visionaria funciona con tu propia cuenta de Anthropic: tú controlas el gasto y tus conversaciones quedan a tu nombre. Se configura una sola vez y toma unos 5 minutos.</p>
        </div>
        {compact && <button className="btn sm" onClick={() => setOpen(!open)}>{open ? 'Ocultar' : 'Ver cómo'}</button>}
      </div>

      {open && (
        <>
          <ol className="ai-steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="ai-step-n">{i + 1}</span>
                <div><b>{s.title}</b><p className="muted small">{s.body}</p></div>
              </li>
            ))}
          </ol>

          <form className="ai-key-form" onSubmit={submit}>
            <input
              className="input"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="sk-ant-…"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              aria-label="API key de Anthropic"
            />
            <button className="btn primary" disabled={pending || key.trim().length < 20}>{pending ? 'Verificando…' : 'Conectar'}</button>
          </form>
          {error && <p className="small" style={{ color: 'var(--warn)', marginTop: 8 }}>{error}</p>}
          <p className="muted small" style={{ marginTop: 10 }}>
            Tu key se guarda cifrada y solo se usa para tus conversaciones con Visionaria. Nadie del equipo puede verla. Puedes desconectarla aquí o revocarla desde Anthropic cuando quieras.
          </p>
        </>
      )}
    </div>
  );
}
