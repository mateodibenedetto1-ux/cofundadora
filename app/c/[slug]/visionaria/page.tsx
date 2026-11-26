import { notFound } from 'next/navigation';
import { getOrgBySlug } from '@/lib/data';
import { getAiKeyStatus } from '@/lib/aikeys';
import { DEMO } from '@/lib/env';
import { AiKeyConnect } from '@/components/AiKeyConnect';
import { VisionariaStudio } from '@/components/VisionariaStudio';

export const metadata = { title: 'Visionaria' };

export default async function PortalVisionaria({ params }: { params: Promise<{ slug: string }> }) {
  const org = await getOrgBySlug((await params).slug);
  if (org.segment !== 'consulting') notFound();
  const key = DEMO ? { connected: true, hint: null, verified_at: null } : await getAiKeyStatus(org.id);
  return (
    <>
      <header className="ai-head">
        <h1>Visionaria</h1>
        <p className="muted small">Tu generadora de contenido: elige el formato, cuéntale tu idea y recibe la pieza con tu voz.</p>
      </header>
      {key.connected ? <VisionariaStudio slug={org.slug} orgId={org.id} /> : <AiKeyConnect orgId={org.id} connected={false} hint={null} />}
    </>
  );
}
