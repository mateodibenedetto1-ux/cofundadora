import { notFound } from 'next/navigation';
import { getBrain, getBrainMeta, getOrgBySlug } from '@/lib/data';
import { DEMO } from '@/lib/env';
import { BrainEditor } from '@/components/BrainEditor';
import { BriefUpload } from '@/components/BriefUpload';

export const metadata = { title: 'Segundo cerebro' };

export default async function Cerebro({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ s?: string }> }) {
  const org = await getOrgBySlug((await params).slug);
  if (org.segment !== 'consulting') notFound();
  const [data, meta] = await Promise.all([getBrain(org.id), getBrainMeta(org.id)]);
  return (
    <>
      <header className="ai-head">
        <h1>Tu Segundo cerebro</h1>
        <p className="muted small">Tu identidad, tu clienta, tu marca, tu método y tus ofertas. Escríbelo con tus palabras: de aquí aprenden tu Cofundadora y Visionaria.</p>
      </header>
      <div style={{ marginTop: 18 }}>
        <BriefUpload orgId={org.id} current={(data as Record<string, string>)._brief_name ?? null} />
      </div>
      <div style={{ marginTop: 18 }}>
        <BrainEditor orgId={org.id} name={org.name} initial={data} demo={DEMO} roadmap={meta} initialSection={(await searchParams).s} roadmapHref={`/c/${org.slug}/roadmap`} />
      </div>
    </>
  );
}
