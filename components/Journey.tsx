import Link from 'next/link';
import { MODULES, brainPct, modulePct, type BrainData } from '@/lib/brain';

/** Recorrido MAGNA: el avance de la fundadora etapa por etapa. */
export function JourneyCard({ data, href }: { data: BrainData; href: string }) {
  const total = brainPct(data);
  const current = MODULES.find((m) => modulePct(data, m) < 80) ?? MODULES[MODULES.length - 1];
  const done = MODULES.filter((m) => modulePct(data, m) >= 80).length;
  const msg =
    total === 0 ? 'Tu recorrido empieza por la etapa 01, Mujer Magna: cuéntanos dónde está tu negocio hoy y la fundadora que quieres ser.'
    : done === MODULES.length ? 'Completaste las 9 etapas. Tu Segundo cerebro ya guía cada paso.'
    : `Vas por la etapa ${current.n}: ${current.title}. ${current.about} Cada sección que completas le da más contexto a tu estrategia y a Visionaria.`;
  return (
    <Link href={href} className="panel journey">
      <div className="journey-head">
        <div>
          <span className="journey-kicker">Tu Recorrido MAGNA</span>
          <p>{msg}</p>
        </div>
        <span className="journey-pct">{total}<small>%</small></span>
      </div>
      <ol className="journey-steps">
        {MODULES.map((m) => {
          const p = modulePct(data, m);
          return (
            <li key={m.k} className={`${p >= 80 ? 'done' : ''} ${m.k === current.k ? 'now' : ''}`} title={`${m.n} · ${m.title} · ${p}%`}>
              <i style={{ ['--p' as string]: `${p}%` }} />
              <span>{m.n} {m.title}</span>
            </li>
          );
        })}
      </ol>
      <span className="journey-cta">{total === 0 ? 'Empezar' : 'Seguir completando'} →</span>
    </Link>
  );
}
