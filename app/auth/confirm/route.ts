import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * Links de los emails (invitación, link de acceso, recuperar contraseña).
 * Valida el token en el servidor y deja la sesión iniciada; invitación y recuperación van a crear contraseña.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token_hash = url.searchParams.get('token_hash');
  const type = (url.searchParams.get('type') ?? 'email') as EmailOtpType;
  const fallback = type === 'invite' || type === 'recovery' ? '/set-password' : '/';
  const next = url.searchParams.get('next') ?? fallback;
  if (token_hash) {
    const sb = await supabaseServer();
    const { error } = await sb.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(new URL(next.startsWith('/') ? next : fallback, url.origin));
  }
  return NextResponse.redirect(new URL('/login?link=vencido', url.origin));
}
