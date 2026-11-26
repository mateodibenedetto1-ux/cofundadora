import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { MODULES } from './brain';

const iso = (d: Date) => d.toISOString().slice(0, 10);

export const leadShort = (lead: string) => lead;

/**
 * Crea el Recorrido MAGNA: las 5 fases del método con sus pasos como checklist, sin fechas.
 * No hay semanas ni desbloqueos: cada fundadora avanza a su ritmo. Reemplaza uno anterior.
 */
export async function buildJourney(sb: SupabaseClient, orgId: string, _start: string, programUrl: string | null) {
  await sb.from('action_items').delete().eq('org_id', orgId).eq('source', 'recorrido');
  await sb.from('milestones').delete().eq('org_id', orgId).not('brain_section', 'is', null);
  let pos = 0;
  for (const m of MODULES) {
    const ms = await sb.from('milestones').insert({
      org_id: orgId, title: `Fase ${m.n} — ${m.title}`, detail: m.about, due_date: null, kind: 'fase', position: Number(m.n), brain_section: m.k, module: m.k,
    });
    if (ms.error) throw new Error(ms.error.message);
    // El checklist de cada fase son los pasos del método MAGNA
    const rows = (m.steps ?? []).map((step, i) => ({
      org_id: orgId, title: step, why: i === 0 && programUrl ? `Clases y hojas de trabajo: ${programUrl}` : null,
      owner: 'cliente', due_date: null, position: pos++, source: 'recorrido', brain_section: null as string | null, module: m.k,
    }));
    if (rows.length) {
      const t = await sb.from('action_items').insert(rows);
      if (t.error) throw new Error(t.error.message);
    }
  }
}

/** Fecha de inicio del recorrido (se guarda como referencia; el recorrido no depende de fechas). */
export async function journeyStart(sb: SupabaseClient, orgId: string, fallback: string | null) {
  const { data } = await sb.from('milestones').select('id').eq('org_id', orgId).eq('kind', 'fase').not('brain_section', 'is', null).limit(1);
  return { start: fallback ?? iso(new Date(Date.now() - 3 * 3600e3)), exists: Boolean(data?.length) };
}
