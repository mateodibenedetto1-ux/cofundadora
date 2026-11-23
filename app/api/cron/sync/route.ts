import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { syncAllInstagram } from '@/lib/instagram';

export const runtime = 'nodejs';
export const maxDuration = 300;

/**
 * Sincronización diaria de las métricas de Instagram (Vercel Cron, ver vercel.json).
 * Protegida con CRON_SECRET si está configurado; si no, solo acepta el cron de Vercel.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');
  const fromVercel = (req.headers.get('user-agent') ?? '').startsWith('vercel-cron');
  if (secret ? auth !== `Bearer ${secret}` : !fromVercel) {
    return NextResponse.json({ error: 'no autorizado' }, { status: 401 });
  }
  const sb = supabaseAdmin();
  const instagram = await syncAllInstagram(sb);
  return NextResponse.json({ ok: true, instagram });
}
