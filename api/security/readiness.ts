import type { VercelRequest, VercelResponse } from '../_utils';
import { handleCors, getRuntimeFlags, getSupabaseAdmin } from '../_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

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
}