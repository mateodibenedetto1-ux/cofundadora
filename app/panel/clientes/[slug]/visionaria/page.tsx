import { notFound } from 'next/navigation';
import { getOrgBySlug } from '@/lib/data';
import { getAiKeyStatus } from '@/lib/aikeys';
import { DEMO } from '@/lib/env';
import { AiKeyConnect } from '@/components/AiKeyConnect';
import { VisionariaStudio } from '@/components/VisionariaStudio';

export const metadata = { title: 'Visionaria' };

export default async function PanelVisionaria({ params }: { params: Promise<{ slug: string }> }) {
  const org = await getOrgBySlug((await params).slug);
  if (org.segment !== 'consulting') notFound();
  const key = DEMO ? { connected: true, hint: null, verified_at: null } : await getAiKeyStatus(org.id);
  if (!key.connected) {
    return (
      <div className="stack" style={{ gap: 12 }}>
        <p className="muted small">{org.name} todavía no conectó su API key. Cuando la conecte, Visionaria se activa acá y en su portal.</p>
        <AiKeyConnect orgId={org.id} connected={false} hint={null} preview />
      </div>
    );
  }
  return (
    <div className="stack" style={{ gap: 12 }}>
      <p className="muted small">Lo que crees acá usa la API key de {org.name} y se escribe con su voz.</p>
      <VisionariaStudio slug={org.slug} orgId={org.id} />
    </div>
  );
}
