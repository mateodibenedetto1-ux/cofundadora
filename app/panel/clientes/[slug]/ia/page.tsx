import { notFound } from 'next/navigation';
import { getOrgBySlug } from '@/lib/data';
import { getAiKeyStatus } from '@/lib/aikeys';
import { DEMO } from '@/lib/env';
import { FractalChat } from '@/components/FractalChat';
import { AiKeyConnect } from '@/components/AiKeyConnect';

export const metadata = { title: 'Visionaria' };

export default async function ClientIa({ params }: { params: Promise<{ slug: string }> }) {
  const org = await getOrgBySlug((await params).slug);
  if (org.segment !== 'consulting') notFound();
  const key = DEMO ? { connected: false, hint: null, verified_at: null } : await getAiKeyStatus(org.id);

  // Sin su API key, Visionaria no se puede usar: solo se muestra la guía que ella ve en su portal.
  if (!key.connected) {
    return (
      <div className="stack" style={{ gap: 12 }}>
        <p className="muted small">
          {org.name} todavía no conectó su API key. Esto es lo que ve en su portal: cuando la conecte, Visionaria se activa acá y allá.
        </p>
        <AiKeyConnect orgId={org.id} connected={false} hint={null} preview />
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 12 }}>
      <AiKeyConnect orgId={org.id} connected hint={key.hint} />
      <FractalChat
        fixedClient={org.slug}
        mode="client"
        intro={`Respondo con el Segundo cerebro de ${org.name} y el método MAGNA. Lo que hables acá usa su API key.`}
      />
    </div>
  );
}
