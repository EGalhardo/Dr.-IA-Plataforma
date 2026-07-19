-- =============================================================
-- DR.IA — PATCH: COLUNAS EM FALTA NA TABELA messages
-- =============================================================
-- Contexto: a tabela messages na base de dados foi criada por um
-- script antigo. Como os ficheiros de setup usam CREATE TABLE IF
-- NOT EXISTS, as colunas adicionadas depois ao schema oficial
-- (supabase/schema.sql) nunca foram aplicadas à tabela existente.
--
-- Este patch é IDEMPOTENTE (ADD COLUMN IF NOT EXISTS): pode ser
-- executado várias vezes sem risco e NÃO altera nem apaga dados.
-- Executar UMA vez no SQL Editor do Supabase Dashboard.
--
-- Colunas adicionadas (cópia exata de supabase/schema.sql, tabela messages):
--   deadline_text, state_indicator, actions, attachments,
--   protocol_id, sensitivity, priority_scale, deadline_hours_remaining
-- =============================================================

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deadline_text VARCHAR(100);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS state_indicator VARCHAR(100);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS actions TEXT[] DEFAULT '{}';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS protocol_id UUID REFERENCES public.digital_protocols(id) ON DELETE SET NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sensitivity VARCHAR(50) DEFAULT 'Privado';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS priority_scale VARCHAR(50) DEFAULT 'Normal';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deadline_hours_remaining INT;

-- =============================================================
-- VERIFICAÇÃO (opcional): executar após o patch para confirmar
-- que as 8 colunas existem. Deve devolver 8 linhas.
-- =============================================================
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'messages'
--   AND column_name IN (
--     'deadline_text', 'state_indicator', 'actions', 'attachments',
--     'protocol_id', 'sensitivity', 'priority_scale', 'deadline_hours_remaining'
--   )
-- ORDER BY column_name;
