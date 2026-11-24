import { notFound } from 'next/navigation';
import { getBrain, getBrainMeta, getMilestones, getOrgBySlug } from '@/lib/data';
import { fillBrainSample, startJourney } from '@/lib/actions';
import { SubmitButton } from '@/components/SubmitButton';
import { DEMO } from '@/lib/env';
import { BrainEditor } from '@/components/BrainEditor';

export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ s?: string; prueba?: string }> }) {
  const org = await getOrgBySlug((await params).slug);
  if (org.segment !== 'consulting') notFound();
  const [data, milestones, meta] = await Promise.all([getBrain(org.id), getMilestones(org.id), getBrainMeta(org.id)]);
  const started = milestones.some((m) => m.brain_section);
  const sp = await searchParams;
  return (
    <div className="stack" style={{ gap: 22 }}>
      {sp.prueba === '1' && (
        <form action={fillBrainSample.bind(null, org.id, org.slug)} className="panel panel-pad row between wrap" style={{ gap: 12 }}>
          <div className="grow"><b style={{ fontWeight: 500 }}>Modo prueba</b><p className="muted small">Completa todo el Segundo cerebro con una fundadora ficticia. Reemplaza lo que haya cargado.</p></div>
          <SubmitButton pendingLabel="Completando…">Completar con datos de prueba</SubmitButton>
        </form>
      )}
      <div className="panel panel-pad row between wrap" style={{ gap: 12 }}>
        <div className="grow" style={{ minWidth: 260 }}>
          <b style={{ fontWeight: 500 }}>{started ? 'Recorrido MAGNA creado' : 'Crear el Recorrido MAGNA'}</b>
          <p className="muted small" style={{ marginTop: 3 }}>
            {started
              ? 'Las 9 etapas de MAGNA son las fases de su roadmap, cada una con sus tareas: ver las clases, completar sus secciones y llevarlas a la sesión. Volver a crearlo reemplaza esas fases y tareas.'
              : 'Genera las 9 etapas de MAGNA como fases desde la fecha de inicio, con sus tareas. Las de completar se marcan solas cuando la sección llega al 80 %.'}
          </p>
        </div>
        <form action={startJourney.bind(null, org.id)}>
          <button className={`btn ${started ? '' : 'primary'}`}>{started ? 'Volver a crear' : 'Crear recorrido'}</button>
        </form>
      </div>
      <BrainEditor orgId={org.id} name={org.name} initial={data} demo={DEMO} roadmap={meta} initialSection={sp.s} staff roadmapHref={`/panel/clientes/${org.slug}/roadmap`} />
    </div>
  );
}
