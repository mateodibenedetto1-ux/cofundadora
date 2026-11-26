import Anthropic from '@anthropic-ai/sdk';
import { getViewer } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { clientContext, retrieve } from '@/lib/ai';
import { getOrgAiKey } from '@/lib/aikeys';
import { genByKey } from '@/lib/generators';

export const runtime = 'nodejs';
export const maxDuration = 120;

/** Visionaria: genera una pieza de contenido con el ADN de la fundadora y los frameworks de MAGNA. */
export async function POST(req: Request) {
  const v = await getViewer();
  if (!v) return new Response('No autorizado', { status: 401 });
  const body = (await req.json().catch(() => null)) as { client?: string; gen?: string; values?: Record<string, string>; tweak?: string; previous?: string } | null;
  const gen = genByKey(body?.gen ?? '');
  if (!body?.client || !gen) return new Response('Faltan datos', { status: 400 });

  const sb = await supabaseServer();
  const client = await clientContext(sb, body.client);
  if (!client) return new Response('Fundadora no encontrada', { status: 404 });
  if (!v.isStaff && !v.clientOrgIds.includes(client.id)) return new Response('No autorizado', { status: 403 });
  const key = await getOrgAiKey(client.id);
  if (!key) return new Response('Conecta tu API key de Anthropic para usar Visionaria.', { status: 402 });

  const values = body.values ?? {};
  const form = gen.fields.map((f) => `- ${f.label}: ${String(values[f.k] ?? '').trim() || '(sin completar)'}`).join('\n');
  const chunks = await retrieve(supabaseAdmin(), `${gen.label} ${values.tema ?? values.transformacion ?? values.oferta ?? ''} contenido magnífico framework gancho cautivar conectar convertir`, 12);
  const vault = chunks.map((c, i) => `<fuente n="${i + 1}" titulo="${c.title.replace(/"/g, "'")}">\n${c.text}\n</fuente>`).join('\n\n');

  const system = `Eres Visionaria, la generadora de contenido de MAGNA (Seres Magnéticos, la mentoría de Val Lollett). Conviertes las ideas de cada fundadora en piezas listas para publicar, usando los frameworks de Contenido Magnífico.

Reglas:
- Trabajas SIEMPRE con la esencia y el tono de voz de la fundadora, desde su Segundo cerebro (abajo): su clienta premium, su mensaje, su voz, las palabras que usa y las que evita. Si su voz pide un registro, úsalo; si no, español neutro latinoamericano con "tú".
- Usa los frameworks de Contenido Magnífico (fragmentos de abajo) como estructura. Son material interno: no los nombres ni copies sus textos.
- Cautivar atrae a personas nuevas, Conectar genera confianza con quien ya la sigue y Convertir lleva a la acción o a la venta. Ajusta el gancho, la profundidad y el CTA a eso.
- No inventes datos, cifras, testimonios ni resultados. Si falta algo, deja un marcador [completar].
- Sin entusiasmo artificial ni exceso de emojis. Concreta y con escenas antes que teoría.
- Entrega solo la pieza, en Markdown, sin introducciones ni explicaciones al final.

Formato pedido: ${gen.title}. ${gen.guide}

<fundadora>
${client.text.slice(0, 30000)}
</fundadora>
<frameworks>
${vault || '(Sin fragmentos: usa buenas prácticas de contenido y la voz de la fundadora.)'}
</frameworks>`;

  const user = body.previous && body.tweak
    ? `Esta es la pieza que generaste:\n\n${body.previous.slice(0, 12000)}\n\nAjústala así: ${body.tweak}`
    : `Lo que completó la fundadora:\n${form}`;

  const anthropic = new Anthropic({ apiKey: key });
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      try {
        const s = anthropic.messages.stream({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 4000, system, messages: [{ role: 'user', content: user }] });
        for await (const ev of s) if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') ctrl.enqueue(enc.encode(ev.delta.text));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        ctrl.enqueue(enc.encode(/credit|billing|balance/i.test(msg) ? '\n\n⚠️ Tu cuenta de Anthropic no tiene saldo. Carga créditos en console.anthropic.com → Billing.' : /401|authentication|x-api-key/i.test(msg) ? '\n\n⚠️ Tu API key de Anthropic ya no es válida. Conecta una nueva.' : `\n\n⚠️ No pude generar la pieza: ${msg}`));
      } finally { ctrl.close(); }
    },
  });
  return new Response(stream, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
}
