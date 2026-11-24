import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { getDoc, getOrgBySlug } from '@/lib/data';
import { deleteDoc } from '@/lib/actions';
import { DocEditor } from '@/components/DocEditor';
import { renderMarkdown } from '@/lib/md';

export default async function Page({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const org = await getOrgBySlug(slug);
  const doc = await getDoc(org.id, id);
  return (
    <div className="stack" style={{ gap: 18 }}>
    <Link href={`/panel/clientes/${org.slug}/biblioteca`} className="back-link" style={{ alignSelf: 'flex-start' }}><Icon name="back" size={15} /> Volver a la biblioteca</Link>
    <div className="two">
      <div className="panel panel-pad">
        <DocEditor orgId={org.id} doc={doc} />
      </div>
      <aside className="stack" style={{ gap: 12 }}>
        <span className="muted small">Así lo ve el cliente</span>
        <div className="panel panel-pad prose" style={{ fontSize: 16 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(doc.body_md) }} />
        <div className="row">
          <form action={deleteDoc.bind(null, doc.id)}><button className="btn ghost">Borrar documento</button></form>
        </div>
      </aside>
    </div>
    </div>
  );
}
