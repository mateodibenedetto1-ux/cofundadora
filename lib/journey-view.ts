import 'server-only';
import { supabaseServer } from './supabase/server';
import { BRAIN, MODULES, sectionPct, type BrainData } from './brain';
import { leadShort } from './journey';
import type { Org } from './types';
import { DEMO } from './env';

export interface StageTask { id: string; title: string; done: boolean; owner: string; due_date: string | null; source: string; why: string | null }
export interface Stage {
  k: string; n: string; title: string; about: string; lead: string;
  state: 'done' | 'now' | 'next';
  objective: string | null;
  sections: { k: string; n: number; title: string; pct: number }[];
  hitos: { id: string; title: string; date: string | null; detail: string | null }[];
  tasks: StageTask[];
}
export interface JourneyView { stages: Stage[]; index: number; total: number; pct: number; current: string | null; docId: string | null; classesUrl: string | null }

/** Un hito está cumplido cuando sus secciones del Segundo cerebro llegan al 80 % y sus tareas están hechas. */
export function stageDone(sections: { pct: number }[], tasks: { done: boolean }[]) {
  return sections.every((s) => s.pct >= 80) && tasks.every((t) => t.done) && (sections.length + tasks.length > 0);
}

/** Arma el recorrido por hitos con todo lo de cada uno. Null si la fundadora no tiene recorrido. */
export async function getJourneyView(org: Org): Promise<JourneyView | null> {
  if (DEMO) return demoJourney(org);
  const sb = await supabaseServer();
  const [{ data: ms }, { data: acts }, { data: brain }, { data: doc }] = await Promise.all([
    sb.from('milestones').select('id, title, detail, due_date, kind, brain_section, source, module').eq('org_id', org.id).order('position'),
    sb.from('action_items').select('id, title, done, owner, due_date, source, why, module, brain_section').eq('org_id', org.id).is('parent_id', null).in('source', ['recorrido', 'roadmap']).order('position'),
    sb.from('client_brain').select('data').eq('org_id', org.id).maybeSingle(),
    sb.from('documents').select('id').eq('org_id', org.id).eq('kind', 'estrategia').like('title', 'Tu roadmap personalizado%').order('created_at', { ascending: false }).limit(1),
  ]);
  const phases = (ms ?? []).filter((m) => m.kind === 'fase' && MODULES.some((x) => x.k === m.brain_section));
  if (!phases.length) return null;
  const data = (brain?.data ?? {}) as BrainData;

  return assemble(org, data, phases, ms ?? [], acts ?? [], doc?.[0]?.id ?? null);
}

type MsRow = { id: string; title: string; detail: string | null; due_date: string | null; kind: string | null; brain_section: string | null; module: string | null };
type ActRow = { id: string; title: string; done: boolean; owner: string; due_date: string | null; source: string; why: string | null; module: string | null };

function assemble(org: Org, data: BrainData, phases: MsRow[], ms: MsRow[], acts: ActRow[], docId: string | null): JourneyView {
  let foundCurrent = false;
  const stages: Stage[] = MODULES.map((m) => {
    const ph = phases.find((p) => p.brain_section === m.k);
    const sections = BRAIN.filter((s) => s.mod === m.k).map((s) => ({ k: s.k, n: s.n, title: s.title, pct: sectionPct(data, s) }));
    const tasks = acts.filter((a) => a.module === m.k)
      .map((a) => ({ id: a.id, title: a.title, done: a.done, owner: a.owner, due_date: a.due_date, source: a.source, why: a.why }));
    let state: Stage['state'] = 'next';
    if (stageDone(sections, tasks)) state = 'done';
    else if (!foundCurrent) { state = 'now'; foundCurrent = true; }
    return {
      k: m.k, n: m.n, title: m.title, about: m.about, lead: leadShort(m.lead), state,
      objective: ph?.detail ?? null, sections, tasks,
      hitos: ms.filter((x) => x.kind !== 'fase' && x.module === m.k).map((x) => ({ id: x.id, title: x.title, date: x.due_date, detail: x.detail })),
    };
  });

  const done = stages.filter((s) => s.state === 'done').length;
  const current = stages.find((s) => s.state === 'now');
  return {
    stages,
    index: current ? stages.indexOf(current) + 1 : stages.length,
    total: stages.length,
    pct: Math.round((done / stages.length) * 100),
    current: current?.k ?? null,
    docId,
    classesUrl: org.program_url ?? null,
  };
}

/** Modo demo: un recorrido a medio camino con los datos de ejemplo. */
async function demoJourney(org: Org): Promise<JourneyView | null> {
  if (org.segment !== 'consulting') return null;
  const { BRAIN_SAMPLE } = await import('./brain-sample');
  const keep = new Set(['partida', 'identidad', 'clienta', 'marca', 'mensaje', 'voz', 'ia', 'contenido']);
  const data = Object.fromEntries(Object.entries(BRAIN_SAMPLE).filter(([k]) => keep.has(k.split('.')[0])));
  const phases: MsRow[] = MODULES.map((m) => ({ id: `ph-${m.k}`, title: m.title, detail: m.about, due_date: null, kind: 'fase', brain_section: m.k, module: m.k }));
  const acts: ActRow[] = MODULES.map((m, i) => ({ id: `t-${m.k}`, title: `Ver las clases del método: ${m.title}`, done: i < 2, owner: 'cliente', due_date: null, source: 'recorrido', why: null, module: m.k }));
  return assemble(org, data, phases, phases, acts, null);
}

/** Resumen de recorrido de varias fundadoras a la vez (para el Home del panel). */
export async function journeySummaries(orgIds: string[]): Promise<Map<string, { index: number; total: number; title: string; pct: number }>> {
  const out = new Map<string, { index: number; total: number; title: string; pct: number }>();
  if (!orgIds.length || DEMO) return out;
  const sb = await supabaseServer();
  const [{ data: ms }, { data: acts }, { data: brains }] = await Promise.all([
    sb.from('milestones').select('org_id, brain_section').in('org_id', orgIds).eq('kind', 'fase').not('brain_section', 'is', null),
    sb.from('action_items').select('org_id, module, done').in('org_id', orgIds).is('parent_id', null).in('source', ['recorrido', 'roadmap']),
    sb.from('client_brain').select('org_id, data').in('org_id', orgIds),
  ]);
  for (const id of orgIds) {
    if (!(ms ?? []).some((m) => m.org_id === id)) continue;
    const data = ((brains ?? []).find((b) => b.org_id === id)?.data ?? {}) as BrainData;
    const states = MODULES.map((m) => stageDone(
      BRAIN.filter((s) => s.mod === m.k).map((s) => ({ pct: sectionPct(data, s) })),
      (acts ?? []).filter((a) => a.org_id === id && a.module === m.k).map((a) => ({ done: a.done })),
    ));
    const i = states.findIndex((d) => !d);
    const idx = i === -1 ? MODULES.length - 1 : i;
    out.set(id, { index: idx + 1, total: MODULES.length, title: i === -1 ? 'Método completo' : MODULES[idx].title, pct: Math.round((states.filter(Boolean).length / MODULES.length) * 100) });
  }
  return out;
}
