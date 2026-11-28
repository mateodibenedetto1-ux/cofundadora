import { notFound } from 'next/navigation';
import { getBrain, getOrgBySlug } from '@/lib/data';
import { CofuName } from '@/components/CofuName';
import { getAiKeyStatus } from '@/lib/aikeys';
import { DEMO } from '@/lib/env';
import { FractalChat } from '@/components/FractalChat';
import { AiKeyConnect } from '@/components/AiKeyConnect';

export const metadata = { title: 'Cofundadora' };

export default async function PortalIa({ params }: { params: Promise<{ slug: string }> }) {
  const org = await getOrgBySlug((await params).slug);
  if (org.segment !== 'consulting') notFound();
  const [key, brain] = await Promise.all([
    DEMO ? Promise.resolve({ connected: false, hint: null, verified_at: null }) : getAiKeyStatus(org.id),
    getBrain(org.id),
  ]);
  const cofu = String((brain as Record<string, string>)._cofu_name ?? '').trim();
  return (
    <>
      <header className="ai-head">
        <div>
          {cofu ? <CofuName orgId={org.id} initial={cofu} /> : <h1>Tu Cofundadora</h1>}
          <p className="muted small">Tu socia estratégica 24/7: piensa contigo, te ubica en tu fase y te dice qué priorizar hoy.</p>
        </div>
      </header>
      <div className="stack" style={{ gap: 12 }}>
        {!cofu && <CofuName orgId={org.id} initial="" />}
        <AiKeyConnect orgId={org.id} connected={key.connected} hint={key.hint} />
        {key.connected && (
          <FractalChat
            fixedClient={org.slug}
            mode="client"
            intro={`${cofu ? `Soy ${cofu}, tu Cofundadora. ` : ''}Cuéntame en qué estás hoy. Pensemos juntas qué priorizar y cuál es tu próximo paso. Mientras más completo esté tu Segundo cerebro, mejor te conozco.`}
          />
        )}
      </div>
    </>
  );
}
