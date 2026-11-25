import 'server-only';
import { supabaseAdmin } from './supabase/admin';
import { decrypt, encrypt } from './secrets';
import { APP_URL } from './env';

// ---------- Texto de archivos ----------

const TEXT_EXT = ['pdf', 'docx', 'txt', 'md', 'srt', 'vtt'];
export const extOf = (name: string) => name.toLowerCase().split('.').pop() ?? '';
export const isReadable = (name: string) => TEXT_EXT.includes(extOf(name));

/** Saca el texto de un PDF, Word, TXT o subtítulos. */
export async function extractText(buf: ArrayBuffer, name: string): Promise<string> {
  const ext = extOf(name);
  if (ext === 'pdf') {
    const { extractText: pdf, getDocumentProxy } = await import('unpdf');
    const doc = await getDocumentProxy(new Uint8Array(buf));
    const { text } = await pdf(doc, { mergePages: true });
    return String(text);
  }
  if (ext === 'docx') {
    const mammoth = await import('mammoth');
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
    return value;
  }
  const raw = new TextDecoder('utf-8').decode(buf);
  if (ext === 'srt' || ext === 'vtt') return raw.replace(/^\d+$/gm, '').replace(/[\d:.,]+ --> [\d:.,]+.*$/gm, '').replace(/^WEBVTT.*$/m, '').replace(/\n{2,}/g, '\n');
  return raw;
}

/** El módulo de MAGNA según la carpeta o el nombre del archivo. */
export function moduleOf(path: string): string | null {
  const p = path.toLowerCase();
  if (p.includes('mujer magna')) return 'mujer-magna';
  if (p.includes('marca memorable')) return 'marca-memorable';
  if (p.includes('modelo maestro')) return 'modelo-maestro';
  if (p.includes('coaching')) return 'coaching';
  if (p.includes('producto principal') || p.includes('metodolog')) return 'metodo';
  if (p.includes('guia') || p.includes('recurso')) return 'guias';
  return null;
}

export async function saveKbDoc(d: { source_id: string; title: string; content: string; category?: string | null; module?: string | null; source_url?: string | null; kind?: string | null; note?: string | null }) {
  const content = d.content.replace(/\u0000/g, '').slice(0, 1_500_000);
  const { error } = await supabaseAdmin().from('kb_documents').upsert({
    source_id: d.source_id, title: d.title.slice(0, 300), category: d.category ?? null, module: d.module ?? null,
    source_url: d.source_url ?? null, kind: d.kind ?? null, content, status: content.trim().length > 40 ? 'ok' : 'sin_texto',
    note: d.note ?? null, updated_at: new Date().toISOString(),
  }, { onConflict: 'source_id' });
  if (error) throw new Error(error.message);
}

// ---------- Dropbox ----------
// El token de Dropbox se guarda cifrado en ai_keys (fila de la agencia, provider 'dropbox').
// Las carpetas a sincronizar se guardan en una fila de configuración de kb_documents.

const CONFIG_ID = 'config:dropbox';
export interface DropboxConfig { folders: { url: string; label: string }[]; lastSync?: string; lastResult?: string }

export const dropboxReady = () => Boolean(process.env.DROPBOX_APP_KEY && process.env.DROPBOX_APP_SECRET);
export const dropboxRedirect = () => `${APP_URL}/api/dropbox/callback`;

async function agencyId() {
  const { data } = await supabaseAdmin().from('organizations').select('id').eq('kind', 'agency').limit(1).single();
  return data!.id as string;
}

export async function getDropboxConfig(): Promise<DropboxConfig> {
  const { data } = await supabaseAdmin().from('kb_documents').select('content').eq('source_id', CONFIG_ID).maybeSingle();
  try { return { folders: [], ...JSON.parse(data?.content ?? '{}') }; } catch { return { folders: [] }; }
}

export async function setDropboxConfig(c: DropboxConfig) {
  await supabaseAdmin().from('kb_documents').upsert({ source_id: CONFIG_ID, title: 'Configuración de Dropbox', status: 'config', content: JSON.stringify(c), updated_at: new Date().toISOString() }, { onConflict: 'source_id' });
}

export async function dropboxConnected() {
  const { data } = await supabaseAdmin().from('ai_keys').select('key_hint').eq('org_id', await agencyId()).eq('provider', 'dropbox').maybeSingle();
  return data ? (data.key_hint ?? 'conectado') : null;
}

const basic = () => 'Basic ' + Buffer.from(`${process.env.DROPBOX_APP_KEY}:${process.env.DROPBOX_APP_SECRET}`).toString('base64');

export async function saveDropboxCode(code: string, userId: string) {
  const r = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST', headers: { Authorization: basic(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, grant_type: 'authorization_code', redirect_uri: dropboxRedirect() }),
  });
  const j = await r.json();
  if (!r.ok || !j.refresh_token) throw new Error(j.error_description ?? 'Dropbox no devolvió el permiso');
  let who = 'Dropbox';
  try {
    const a = await fetch('https://api.dropboxapi.com/2/users/get_current_account', { method: 'POST', headers: { Authorization: `Bearer ${j.access_token}` } });
    who = (await a.json())?.email ?? who;
  } catch { /* opcional */ }
  const { error } = await supabaseAdmin().from('ai_keys').upsert({
    org_id: await agencyId(), provider: 'dropbox', key_enc: encrypt(j.refresh_token), key_hint: who,
    verified_at: new Date().toISOString(), updated_at: new Date().toISOString(), updated_by: userId,
  });
  if (error) throw new Error(error.message);
}

export async function disconnectDropbox() {
  await supabaseAdmin().from('ai_keys').delete().eq('org_id', await agencyId()).eq('provider', 'dropbox');
}

async function accessToken(): Promise<string> {
  const { data } = await supabaseAdmin().from('ai_keys').select('key_enc').eq('org_id', await agencyId()).eq('provider', 'dropbox').maybeSingle();
  if (!data) throw new Error('Dropbox no está conectado');
  const r = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST', headers: { Authorization: basic(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: decrypt(data.key_enc) }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error_description ?? 'No se pudo renovar el acceso a Dropbox');
  return j.access_token;
}

type Entry = { '.tag': 'file' | 'folder'; name: string; id: string; rev?: string };

async function listShared(token: string, url: string, path: string): Promise<Entry[]> {
  const out: Entry[] = [];
  let r = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, shared_link: { url } }),
  });
  let j = await r.json();
  if (!r.ok) throw new Error(j.error_summary ?? 'No pude leer la carpeta');
  out.push(...j.entries);
  while (j.has_more) {
    r = await fetch('https://api.dropboxapi.com/2/files/list_folder/continue', {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ cursor: j.cursor }),
    });
    j = await r.json();
    out.push(...(j.entries ?? []));
  }
  return out;
}

/**
 * Recorre las carpetas compartidas de Dropbox y suma a la base de Visionaria los PDF, Word y transcripciones
 * nuevos o modificados. Los videos se saltean. Corta antes del límite de tiempo y sigue en la próxima vuelta.
 */
export async function syncDropbox(budgetMs = 45_000): Promise<{ added: number; updated: number; skipped: number; pending: boolean; error?: string }> {
  const t0 = Date.now();
  const res = { added: 0, updated: 0, skipped: 0, pending: false } as { added: number; updated: number; skipped: number; pending: boolean; error?: string };
  const cfg = await getDropboxConfig();
  try {
    if (!cfg.folders.length) throw new Error('Todavía no hay carpetas para sincronizar');
    const token = await accessToken();
    const { data: known } = await supabaseAdmin().from('kb_documents').select('source_id, note').like('source_id', 'dropbox:%');
    const revs = new Map((known ?? []).map((k) => [k.source_id as string, k.note as string | null]));
    for (const f of cfg.folders) {
      const queue = [''];
      while (queue.length) {
        if (Date.now() - t0 > budgetMs) { res.pending = true; break; }
        const path = queue.shift()!;
        for (const e of await listShared(token, f.url, path)) {
          const p = `${path}/${e.name}`;
          if (e['.tag'] === 'folder') { queue.push(p); continue; }
          if (!isReadable(e.name)) continue;
          const sid = `dropbox:${e.id}`;
          const prev = revs.get(sid);
          if (prev === e.rev) { res.skipped++; continue; }
          if (Date.now() - t0 > budgetMs) { res.pending = true; break; }
          const dl = await fetch('https://content.dropboxapi.com/2/sharing/get_shared_link_file', {
            method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Dropbox-API-Arg': JSON.stringify({ url: f.url, path: p }) },
          });
          if (!dl.ok) continue;
          const text = await extractText(await dl.arrayBuffer(), e.name).catch(() => '');
          await saveKbDoc({
            source_id: sid, title: e.name.replace(/\.[^.]+$/, '').replace(/_/g, ' '), content: text,
            category: f.label, module: moduleOf(`${f.label}${p}`), source_url: f.url, kind: extOf(e.name), note: e.rev ?? null,
          });
          if (prev === undefined) res.added++; else res.updated++;
        }
        if (res.pending) break;
      }
      if (res.pending) break;
    }
  } catch (e) {
    res.error = e instanceof Error ? e.message : String(e);
  }
  const summary = res.error ? `Error: ${res.error}` : `${res.added} nuevos, ${res.updated} actualizados${res.pending ? ' · quedan más, sigue en la próxima vuelta' : ''}`;
  await setDropboxConfig({ ...cfg, lastSync: new Date().toISOString(), lastResult: summary });
  return res;
}
