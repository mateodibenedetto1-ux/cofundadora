import { getCalls, getDocs, getOrgBySlug, getResources } from '@/lib/data';
import { Library } from '@/components/Library';
import { Resources } from '@/components/Resources';

export const metadata = { title: 'Biblioteca' };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const org = await getOrgBySlug((await params).slug);
  const [all, items, calls] = await Promise.all([getDocs(org.id), getResources(org.id), getCalls(org.id)]);
  const docs = all.filter((d) => d.visible_to_client);
  return (
    <>
      <header className="hello" style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 38 }}>Biblioteca</h1>
        <p>Tus fundamentos, el contenido que creaste con Visionaria y los recursos de MAGNA: clases, guías y plantillas.</p>
      </header>
      {(org.program_url || items.length > 0) && (
        <section style={{ marginBottom: 32 }}>
          <div className="row between wrap" style={{ gap: 10, marginBottom: 12 }}>
            <h2 className="section-title" style={{ margin: 0 }}>Recursos de MAGNA</h2>
            {org.program_url && <a href={org.program_url} target="_blank" rel="noreferrer" className="btn sm">Ver las clases</a>}
          </div>
          {items.length > 0 && <Resources items={items} calls={calls} />}
        </section>
      )}
      <Library docs={docs} base={`/c/${org.slug}/biblioteca`} />
    </>
  );
}
