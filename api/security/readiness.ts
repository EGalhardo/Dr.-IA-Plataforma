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
    const blockers: string[] = [];
    const warnings: string[] = [];
    const tableHealth: Record<string, { ok: boolean; count?: number; error?: string }> = {};

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      warnings.push('SUPABASE_SERVICE_ROLE_KEY não configurada para operações administrativas.');
    }
    if (runtimeFlags.mock_fallback) {
      blockers.push('VITE_ENABLE_MOCK_FALLBACK=true — desativar antes de produção.');
    }
    if (runtimeFlags.supabase_auto_seed) {
      blockers.push('VITE_ENABLE_SUPABASE_AUTO_SEED=true — desativar antes de produção.');
    }
    if (runtimeFlags.local_bootstrap) {
      warnings.push('VITE_ENABLE_LOCAL_BOOTSTRAP=true — confirmar estratégia offline antes de produção.');
    }

    const adminSupabase = getSupabaseAdmin();
    if (!adminSupabase) {
      blockers.push('Credenciais do Supabase não configuradas no servidor.');
    } else {
      const tables = [
        'profiles',
        'messages',
        'message_state_history',
        'documents',
        'contacts',
        'notifications',
        'user_requests',
        'document_requests',
        'audit_logs',
        'digital_protocols',
      ];
      for (const table of tables) {
        try {
          const { count, error } = await adminSupabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          tableHealth[table] = {
            ok: !error,
            count: typeof count === 'number' ? count : undefined,
            error: error?.message,
          };
          if (error) blockers.push(`Tabela indisponível: ${table} (${error.message})`);
        } catch (e: any) {
          tableHealth[table] = { ok: false, error: e?.message };
          blockers.push(`Tabela indisponível: ${table} (${e?.message})`);
        }
      }
    }

    res.status(200).json({
      status: blockers.length === 0 ? 'production-candidate' : 'not-ready',
      blockers,
      warnings,
      runtime_flags: runtimeFlags,
      table_health: tableHealth,
    });
  } catch (err: any) {
    console.error('Security readiness error:', err);
    res.status(500).json({
      status: 'error',
      error: err?.message || 'Unknown error',
      stack: err?.stack,
    });
  }
}