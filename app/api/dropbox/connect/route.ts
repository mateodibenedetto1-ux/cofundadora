import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { requireStaff } from '@/lib/data';
import { dropboxReady, dropboxRedirect } from '@/lib/kb';

/** Manda a Dropbox para dar permiso de lectura a las carpetas de MAGNA. */
export async function GET(req: Request) {
  await requireStaff();
  if (!dropboxReady()) return NextResponse.redirect(new URL('/panel/metodo?error=Faltan+DROPBOX_APP_KEY+y+DROPBOX_APP_SECRET+en+Vercel', req.url));
  const state = randomBytes(16).toString('hex');
  (await cookies()).set('dbx_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' });
  const u = new URL('https://www.dropbox.com/oauth2/authorize');
  u.search = new URLSearchParams({ client_id: process.env.DROPBOX_APP_KEY!, response_type: 'code', token_access_type: 'offline', redirect_uri: dropboxRedirect(), state }).toString();
  return NextResponse.redirect(u);
}
