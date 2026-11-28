import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { BRAIN } from './brain';

/**
 * Lee el Brand Brief y devuelve respuestas para los campos del Segundo cerebro
 * que el documento responde de forma explícita. Solo campos vacíos; nunca inventa.
 */
export async function fillFromBrief(key: string, brief: string, current: Record<string, string>) {
  const empty = BRAIN.flatMap((s) => s.fields
    .filter((f) => !(current[`${s.k}.${f.k}`] ?? '').trim())
    .map((f) => ({ id: `${s.k}.${f.k}`, section: s.title, label: f.label, help: f.help ?? '' })));
  if (!empty.length) return {} as Record<string, string>;

  const anthropic = new Anthropic({ apiKey: key });
  const res = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
    max_tokens: 8000,
    system: 'Completas el Segundo cerebro de una fundadora a partir de su Brand Brief. Respondes solo con un objeto JSON válido, sin texto antes ni después.',
    messages: [{
      role: 'user',
      content: `<brand_brief>\n${brief.slice(0, 50000)}\n</brand_brief>\n\n<campos>\n${JSON.stringify(empty)}\n</campos>\n\nPara cada campo que el Brand Brief responda de forma clara, escribe la respuesta en primera persona, como la escribiría ella, en español neutro y con sus palabras cuando sea posible. Si el brief no lo dice, omite el campo: no inventes ni supongas. En campos de lista, un ítem por línea.\n\nDevuelve solo: {"id_del_campo": "respuesta", ...}`,
    }],
  });
  const text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  const parsed = JSON.parse(json) as Record<string, unknown>;
  const allowed = new Set(empty.map((e) => e.id));
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed)) {
    if (allowed.has(k) && typeof v === 'string' && v.trim()) out[k] = v.trim();
  }
  return out;
}
