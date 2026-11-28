import Anthropic from '@anthropic-ai/sdk';
import { getViewer } from '@/lib/data';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { clientContext, retrieve } from '@/lib/ai';
import { getOrgAiKey } from '@/lib/aikeys';
import { genByKey } from '@/lib/generators';

export const runtime = 'nodejs';
export const maxDuration = 120;

/** Visionaria: genera piezas con las instrucciones de VisionarIA, el Segundo cerebro de la fundadora y los frameworks de MAGNA. */
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
  const { VISIONARIA_INSTRUCTIONS, FRAMEWORK_CONTENIDO, FRAMEWORK_PAGINA_VENTA } = await import('@/lib/magna-docs');
  // Materiales que el equipo sumó después (Dropbox o Método), sin repetir los dos frameworks base
  const extra = (await retrieve(supabaseAdmin(), `${gen.label} ${values.tema ?? values.transformacion ?? values.oferta ?? ''} framework gancho cautivar conectar convertir`, 8))
    .filter((c) => !c.docId.startsWith('static:') && !/contenido magn|p.gina de venta/i.test(c.title));
  const vault = extra.map((c, i) => `<fuente n="${i + 1}" titulo="${c.title.replace(/"/g, "'")}">\n${c.text}\n</fuente>`).join('\n\n');
  const isSales = gen.k === 'venta';

  const frameworks = `<framework_contenido_magnifico>\n${FRAMEWORK_CONTENIDO}\n</framework_contenido_magnifico>\n\n<guia_pagina_de_venta_magna>\n${FRAMEWORK_PAGINA_VENTA}\n</guia_pagina_de_venta_magna>`;
  const rules = `${VISIONARIA_INSTRUCTIONS}

Cómo funciona aquí: la fundadora no escribe en un chat, completa un formulario de Visionaria (abajo). Toma ese formulario como su pedido. Si falta un dato indispensable, no preguntes: escribe la mejor propuesta y deja marcadores visibles como [PRECIO]. Entrega en Markdown.
Framework principal para este pedido: ${isSales ? 'la guía Página de Venta MAGNA' : 'el Framework de Contenido Magnífico'}.`;
  const dynamic = `Formato pedido: ${gen.title}. ${gen.guide}

<segundo_cerebro_de_la_fundadora>
${client.text.slice(0, 30000)}
</segundo_cerebro_de_la_fundadora>${vault ? `\n\n<otros_materiales_de_magna>\n${vault}\n</otros_materiales_de_magna>` : ''}`;
  // Las instrucciones y los frameworks no cambian: se cachean para que cada pieza cueste menos
  const system: Anthropic.TextBlockParam[] = [
    { type: 'text', text: `${rules}\n\n${frameworks}`, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: dynamic },
  ];

  const user = body.previous && body.tweak
    ? `Esta es la pieza que generaste:\n\n${body.previous.slice(0, 12000)}\n\nAjústala así: ${body.tweak}`
    : `Lo que completó la fundadora:\n${form}`;

  const anthropic = new Anthropic({ apiKey: key });
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      try {
        const s = anthropic.messages.stream({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 12000, system, messages: [{ role: 'user', content: user }] });
        for await (const ev of s) if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') ctrl.enqueue(enc.encode(ev.delta.text));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        ctrl.enqueue(enc.encode(/credit|billing|balance/i.test(msg) ? '\n\n⚠️ Tu cuenta de Anthropic no tiene saldo. Carga créditos en console.anthropic.com → Billing.' : /401|authentication|x-api-key/i.test(msg) ? '\n\n⚠️ Tu API key de Anthropic ya no es válida. Conecta una nueva.' : `\n\n⚠️ No pude generar la pieza: ${msg}`));
      } finally { ctrl.close(); }
    },
  });
  return new Response(stream, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });
}
