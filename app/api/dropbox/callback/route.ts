import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { requireStaff } from '@/lib/data';
import { saveDropboxCode } from '@/lib/kb';

export async function GET(req: Request) {
  const v = await requireStaff();
  const url = new URL(req.url);
  const back = (msg?: string) => NextResponse.redirect(new URL(`/panel/metodo${msg ? `?error=${encodeURIComponent(msg)}` : '?ok=dropbox'}`, req.url));
  const jar = await cookies();
  if (!url.searchParams.get('code') || url.searchParams.get('state') !== jar.get('dbx_state')?.value) return back('Dropbox no confirmó el permiso. Prueba de nuevo.');
  jar.delete('dbx_state');
  try { await saveDropboxCode(url.searchParams.get('code')!, v.id); } catch (e) { return back(e instanceof Error ? e.message : 'Error con Dropbox'); }
  return back();
}
