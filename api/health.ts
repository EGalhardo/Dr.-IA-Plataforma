import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).json({});
    return true;
  }
  return false;
}

function getRuntimeFlags() {
  return {
    local_bootstrap: (process.env.VITE_ENABLE_LOCAL_BOOTSTRAP || 'true') !== 'false',
    mock_fallback: (process.env.VITE_ENABLE_MOCK_FALLBACK || 'true') !== 'false',
    supabase_auto_seed: (process.env.VITE_ENABLE_SUPABASE_AUTO_SEED || 'false') === 'true',
  };
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    '';
  if (url && serviceKey) {
    return createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
  }
  return null;
}

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