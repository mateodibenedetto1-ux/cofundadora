import 'server-only';
import { supabaseAdmin } from './supabase/admin';
import { APP_URL } from './env';

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'fundadora';

export interface NewFundadora { name: string; email: string; contact_name?: string | null; offer?: string | null; start_date?: string | null }
export interface ProvisionResult { email: string; name: string; status: 'creada' | 'ya existía' | 'error'; slug?: string; invited?: boolean; error?: string }

/**
 * Crea el portal de una fundadora (si no existe uno con ese email), arma su Recorrido MAGNA
 * y, si se pide, le manda la invitación por email. Se usa en la carga en bloque y desde Kajabi.
 */
export async function provisionFundadora(f: NewFundadora, opts: { invite: boolean }): Promise<ProvisionResult> {
  const admin = supabaseAdmin();
  const email = f.email.trim().toLowerCase();
  const name = f.name.trim();
  try {
    const { data: agency } = await admin.from('organizations').select('id').eq('kind', 'agency').limit(1).single();
    if (!agency) throw new Error('No se encontró la cuenta de Seres Magnéticos');

    let { data: org } = await admin.from('organizations').select('id, slug').eq('kind', 'client').eq('contact_email', email).maybeSingle();
    const existed = Boolean(org);
    if (!org) {
      let slug = slugify(name);
      const { data: clash } = await admin.from('organizations').select('id').eq('slug', slug).maybeSingle();
      if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      const start = f.start_date ?? new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
      const { data: created, error } = await admin.from('organizations').insert({
        parent_id: agency.id, kind: 'client', name, slug, status: 'onboarding', segment: 'consulting', vertical: null,
        offer: f.offer ?? 'MAGNA', contact_name: f.contact_name ?? name, contact_email: email, email_domains: [], start_date: start,
      }).select('id, slug').single();
      if (error || !created) throw new Error(error?.message ?? 'No se pudo crear');
      org = created;
      const { buildJourney } = await import('./journey');
      await buildJourney(admin, created.id, start, null);
    }

    let invited = false;
    if (opts.invite) {
      let userId: string | undefined;
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${APP_URL}/auth/callback?next=/set-password`,
        data: { full_name: f.contact_name ?? name },
      });
      if (data?.user) { userId = data.user.id; invited = true; }
      if (error) {
        const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
        userId = list.users.find((u) => u.email?.toLowerCase() === email)?.id;
        if (!userId) throw new Error(error.message);
      }
      await admin.from('memberships').upsert({ user_id: userId, org_id: org.id, role: 'client' }, { onConflict: 'user_id,org_id' });
    }
    return { email, name, status: existed ? 'ya existía' : 'creada', slug: org.slug, invited };
  } catch (e) {
    return { email, name, status: 'error', error: e instanceof Error ? e.message : String(e) };
  }
}

/** Lee una lista pegada: una fundadora por línea, con su nombre y su email en cualquier orden. */
export function parseFundadoras(text: string): NewFundadora[] {
  const out: NewFundadora[] = [];
  const blocks = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  let pendingName: string | null = null;
  for (const line of blocks) {
    const m = line.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/);
    const rest = line.replace(m?.[0] ?? '', '').replace(/[,;|\t<>()]+/g, ' ').replace(/\s+/g, ' ').trim();
    const nameHere = rest.replace(/^@\S+\s*/, '').replace(/\s[—–-]\s.*$/, '').trim();
    if (m) {
      const name = (nameHere && !nameHere.startsWith('@') ? nameHere : pendingName) ?? m[0].split('@')[0];
      out.push({ name, email: m[0] });
      pendingName = null;
    } else if (!line.startsWith('@')) {
      pendingName = line.replace(/\s[—–-]\s.*$/, '').trim();
    }
  }
  return out;
}
