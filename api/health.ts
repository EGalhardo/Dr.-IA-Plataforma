import type { VercelRequest, VercelResponse } from './_utils';
import { handleCors, getRuntimeFlags, getSupabaseAdmin } from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  try {
    const runtimeFlags = getRuntimeFlags();
    const adminSupabase = getSupabaseAdmin();

    res.status(200).json({
      status: 'ok',
      ai_key_configured: !!process.env.GEMINI_API_KEY,
      groq_key_configured: !!process.env.GROQ_API_KEY,
      supabase_url_configured: !!(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
      supabase_anon_configured: !!(
        process.env.VITE_SUPABASE_ANON_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY
      ),
      supabase_service_role_configured: !!(
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SECRET_KEY
      ),
      runtime_flags: runtimeFlags,
      vercel: true,
    });
  } catch (err: any) {
    console.error('Health check error:', err);
    res.status(500).json({
      status: 'error',
      error: err?.message || 'Unknown error',
      stack: err?.stack,
    });
  }
}