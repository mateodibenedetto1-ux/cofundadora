import { notFound } from 'next/navigation';
import { getOrgBySlug } from '@/lib/data';
import { getAiKeyStatus } from '@/lib/aikeys';
import { DEMO } from '@/lib/env';
import { FractalChat } from '@/components/FractalChat';
import { AiKeyConnect } from '@/components/AiKeyConnect';

export const metadata = { title: 'Visionaria' };

export default async function PortalIa({ params }: { params: Promise<{ slug: string }> }) {
  const org = await getOrgBySlug((await params).slug);
  if (org.segment !== 'consulting') notFound();
  const key = DEMO ? { connected: false, hint: null, verified_at: null } : await getAiKeyStatus(org.id);
  return (
    <>
      <header className="ai-head">
        <h1>Visionaria</h1>
        <p className="muted small">Tu cofundadora 24/7, con tu Segundo cerebro y el método MAGNA.</p>
      </header>
      <div className="stack" style={{ gap: 12 }}>
        <AiKeyConnect orgId={org.id} connected={key.connected} hint={key.hint} />
        {key.connected && (
          <FractalChat
            fixedClient={org.slug}
            mode="client"
            intro="Pregúntame lo que necesites sobre tu empresa. Mientras más completo esté tu Segundo cerebro, mejores serán mis respuestas."
          />
        )}
      </div>
    </>
  );
}
