import { NextResponse } from 'next/server';
import { provisionFundadora } from '@/lib/provision';

export const maxDuration = 60;

/** Busca en el JSON de Kajabi el email y el nombre de quien compró, sin depender del formato exacto. */
function pick(obj: unknown): { email?: string; name?: string; first?: string; last?: string; offer?: string } {
  const out: { email?: string; name?: string; first?: string; last?: string; offer?: string } = {};
  const walk = (v: unknown, key = '') => {
    if (v && typeof v === 'object') { for (const [k, x] of Object.entries(v)) walk(x, k.toLowerCase()); return; }
    if (typeof v !== 'string') return;
    if (!out.email && key.includes('email') && /@/.test(v)) out.email = v;
    else if (!out.first && key.includes('first_name')) out.first = v;
    else if (!out.last && key.includes('last_name')) out.last = v;
    else if (!out.name && (key === 'name' || key.endsWith('_name')) && !key.includes('offer') && !key.includes('product')) out.name = v;
    else if (!out.offer && (key.includes('offer') || key.includes('title'))) out.offer = v;
  };
  walk(obj);
  return out;
}

/** Webhook de compra de Kajabi: crea el portal de la nueva fundadora y le manda la invitación. */
export async function POST(req: Request) {
  const secret = process.env.KAJABI_WEBHOOK_SECRET;
  if (!secret || new URL(req.url).searchParams.get('token') !== secret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  let body: unknown;
  try { body = await req.json(); } catch { body = Object.fromEntries((await req.formData()).entries()); }
  const p = pick(body);
  if (!p.email) return NextResponse.json({ error: 'No vino el email de la compradora' }, { status: 400 });
  const match = process.env.KAJABI_OFFER_MATCH;
  if (match && p.offer && !p.offer.toLowerCase().includes(match.toLowerCase())) {
    return NextResponse.json({ skipped: 'Otra oferta' });
  }
  const name = [p.first, p.last].filter(Boolean).join(' ') || p.name || p.email.split('@')[0];
  const r = await provisionFundadora({ name, email: p.email }, { invite: true });
  return NextResponse.json(r, { status: r.status === 'error' ? 500 : 200 });
}

/** Kajabi revisa la URL antes de guardarla: respondemos sin redirigir. */
export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
