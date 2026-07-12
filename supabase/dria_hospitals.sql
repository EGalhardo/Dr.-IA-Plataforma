-- DR.IA — HOSPITAIS CONECTADOS (opcional)
-- A app usa localStorage como fonte principal de verdade para driaHospitals;
-- esta tabela permite sincronizacao multi-dispositivo da lista de hospitais.

CREATE TABLE IF NOT EXISTS dria_hospitals (
    id TEXT PRIMARY KEY,                      -- ex: 'h1', 'h2', ...
    name VARCHAR(255) NOT NULL,
    municipality VARCHAR(100),
    distance VARCHAR(30),
    specialties TEXT[] DEFAULT '{}',
    avg_wait_time VARCHAR(30),
    doctors_count INT DEFAULT 0,
    hours VARCHAR(100),
    integration_state VARCHAR(20) DEFAULT 'Pendente', -- 'Ativo' | 'Pendente' | 'Inativo'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dria_hosp_muni ON dria_hospitals(municipality);
CREATE INDEX IF NOT EXISTS idx_dria_hosp_state ON dria_hospitals(integration_state);

ALTER TABLE dria_hospitals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo dria_hospitals" ON dria_hospitals;
CREATE POLICY "Permitir tudo dria_hospitals" ON dria_hospitals FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION dria_hosp_set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dria_hosp_set_updated_at ON dria_hospitals;
CREATE TRIGGER dria_hosp_set_updated_at BEFORE UPDATE ON dria_hospitals
FOR EACH ROW EXECUTE FUNCTION dria_hosp_set_updated_at();

NOTIFY pgrst, 'reload schema';
