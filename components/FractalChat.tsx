'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { marked } from 'marked';

type Source = { id: string; title: string };
type Msg = { role: 'user' | 'assistant'; content: string; sources?: Source[] };

const STAFF_SUGGESTIONS = [
  '¿En qué fase del método está y qué le toca ahora?',
  'Revisa su Oferta Exponencial con el método MAGNA',
  '¿Qué le falta completar de su Segundo cerebro?',
  '¿Qué debería priorizar esta semana?',
];

const CLIENT_SUGGESTIONS = [
  '¿En qué fase estoy y cuál es mi próximo paso?',
  'Tengo muchas ideas a la vez, ayúdame a elegir una para hoy',
  'Ayúdame a pensar a mi clienta premium',
  '¿Qué contenido me conviene publicar esta semana?',
];

marked.use({ renderer: { html: () => '' } }); // nunca renderizar HTML crudo del modelo

const KEY = 'fractal-ia-chat';


interface Props {
  clients?: { slug: string; name: string }[];
  initialClient?: string;
  /** Cliente fijo: oculta el selector (sección Fractal IA dentro de un cliente). */
  fixedClient?: string;
  /** "client": responde como consultor del cliente, con su API key, sin mostrar documentos internos. */
  mode?: 'staff' | 'client';
  intro?: string;
}

export function FractalChat({ clients = [], initialClient, fixedClient, mode = 'staff', intro }: Props) {
  const [client, setClient] = useState(fixedClient ?? initialClient ?? '');
  const SUGGESTIONS = mode === 'client' ? CLIENT_SUGGESTIONS : STAFF_SUGGESTIONS;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const stick = useRef(true); // seguir el final solo si la persona no subió a leer

  // El chat ocupa el alto que queda en pantalla: la página no se mueve, solo la conversación
  useLayoutEffect(() => {
    const fit = () => {
      const el = shell.current;
      if (!el) return;
      if (window.innerWidth < 640) { el.style.height = ''; return; }
      const top = el.getBoundingClientRect().top + window.scrollY;
      el.style.height = `${Math.max(420, window.innerHeight - top - 24)}px`;
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  const box = useRef<HTMLTextAreaElement>(null);

  // Conversación por cliente, guardada solo en este navegador
  useEffect(() => {
    try { setMsgs(JSON.parse(sessionStorage.getItem(`${KEY}:${mode}:${client}`) ?? '[]')); } catch { setMsgs([]); }
  }, [client]);
  useEffect(() => {
    if (busy) return;
    try { sessionStorage.setItem(`${KEY}:${mode}:${client}`, JSON.stringify(msgs.slice(-30))); } catch { /* sin storage */ }
  }, [msgs, busy, client, mode]);
  useEffect(() => {
    const el = log.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    stick.current = true;
    const next: Msg[] = [...msgs, { role: 'user', content: q }];
    setMsgs([...next, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ client: client || undefined, mode, messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      if (!res.ok || !res.body) throw new Error(await res.text());
      let sources: Source[] = [];
      try { sources = JSON.parse(decodeURIComponent(res.headers.get('x-sources') ?? '[]')); } catch { /* sin fuentes */ }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...next, { role: 'assistant', content: acc, sources }]);
      }
    } catch (e) {
      setMsgs([...next, { role: 'assistant', content: `⚠️ ${e instanceof Error && e.message ? e.message : 'No pude responder.'}` }]);
    } finally {
      setBusy(false);
      box.current?.focus({ preventScroll: true });
    }
  };

  const cited = (m: Msg) => (m.sources ?? []).filter((s) => m.content.includes(`[${s.title}`));

  return (
    <div className="ai" ref={shell}>
      <div className="ai-bar">
        {fixedClient ? <span className="muted small">{mode === 'client' ? 'Conoce tu Segundo cerebro, tu roadmap y tus tareas' : 'Con el contexto de esta fundadora'}</span> : (
          <label className="row" style={{ gap: 8 }}>
            <span className="muted small">Contexto</span>
            <select className="select" value={client} onChange={(e) => setClient(e.target.value)} disabled={busy}>
              <option value="">Solo el método MAGNA</option>
              {clients.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </label>
        )}
        {msgs.length > 0 && <button className="btn ghost sm" onClick={() => setMsgs([])} disabled={busy}>Nueva conversación</button>}
      </div>

      <div className="ai-log" ref={log} onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}>
        {!msgs.length && (
          <div className="ai-empty">
            <h2>¿En qué te ayudo?</h2>
            <p className="muted">{intro ?? `Respondo con el método MAGNA${client ? ' y el Segundo cerebro de la fundadora elegida' : ''}, y te digo de qué documento sale cada cosa.`}</p>
            <div className="ai-suggest">
              {SUGGESTIONS.map((s) => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role}`}>
            {m.role === 'user' ? <p>{m.content}</p> : m.content ? (
              <>
                <div className="ai-md" dangerouslySetInnerHTML={{ __html: marked.parse(m.content, { async: false }) as string }} />
                {!busy || i < msgs.length - 1 ? (cited(m).length ? cited(m) : m.sources ?? []).length > 0 && (
                  <div className="ai-sources">
                    <span className="muted small">{cited(m).length ? 'Fuentes' : 'Documentos consultados'}</span>
                    {(cited(m).length ? cited(m) : m.sources ?? []).map((s) => (
                      <Link key={s.id} href={`/panel/laboratorio/kb/${s.id}`} className="tag" target="_blank">{s.title}</Link>
                    ))}
                  </div>
                ) : null}
              </>
            ) : <p className="muted ai-typing">{mode === 'client' ? 'Pensando…' : 'Buscando en el método…'}</p>}
          </div>
        ))}
        <div ref={end} />
      </div>

      <form className="ai-input" onSubmit={(e) => { e.preventDefault(); void send(input); }}>
        <textarea
          ref={box}
          className="textarea"
          rows={2}
          placeholder={mode === 'client' ? 'Cuéntale a tu Cofundadora en qué estás…' : 'Pregunta algo o pide un entregable…'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(input); } }}
        />
        <button className="btn primary" disabled={busy || !input.trim()}>{busy ? 'Pensando…' : 'Enviar'}</button>
      </form>
    </div>
  );
}

/** Dictado por voz con el reconocimiento del navegador (Chrome, Safari y Edge). */
function VoiceButton({ onText, disabled }: { onText: (t: string) => void; disabled?: boolean }) {
  const [on, setOn] = useState(false);
  const [ok, setOk] = useState(false);
  const rec = useRef<{ stop: () => void } | null>(null);
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    setOk(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);
  if (!ok) return null;
  const toggle = () => {
    if (on) { rec.current?.stop(); return; }
    const w = window as unknown as Record<string, new () => {
      lang: string; continuous: boolean; interimResults: boolean;
      onresult: (e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void;
      onend: () => void; onerror: () => void; start: () => void; stop: () => void;
    }>;
    const R = w.SpeechRecognition || w.webkitSpeechRecognition;
    const r = new R();
    r.lang = 'es-419'; r.continuous = true; r.interimResults = false;
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) onText(e.results[i][0].transcript.trim());
    };
    r.onend = () => setOn(false);
    r.onerror = () => setOn(false);
    rec.current = r; r.start(); setOn(true);
  };
  return (
    <button type="button" className={`btn ghost mic ${on ? 'on' : ''}`} onClick={toggle} disabled={disabled} aria-label={on ? 'Detener dictado' : 'Hablar'} title={on ? 'Detener dictado' : 'Hablar'}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
    </button>
  );
}
