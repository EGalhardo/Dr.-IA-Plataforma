-- DR.IA — CLINICAL EVALUATIONS TABLE
-- NOTA: id é TEXT (não UUID) porque a app gera identificadores legíveis
-- como 'ev_ebola', 'ev1', 'ev_<timestamp>', etc.
CREATE TABLE IF NOT EXISTS dria_evaluations (
    id TEXT PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    patient_age INT NOT NULL,
    patient_gender VARCHAR(50),
    patient_weight DECIMAL(5,2),
    patient_height DECIMAL(4,2),
    patient_municipality VARCHAR(100),
    symptoms TEXT,
    photos TEXT[] DEFAULT '{}',
    allergies TEXT DEFAULT '',
    diseases TEXT DEFAULT '',
    medications TEXT DEFAULT '',
    ai_summary TEXT,
    possible_causes TEXT[] DEFAULT '{}',
    suggested_specialty VARCHAR(255),
    priority VARCHAR(50) NOT NULL DEFAULT 'Moderado',
    recommendations TEXT[] DEFAULT '{}',
    go_to_hospital BOOLEAN DEFAULT false,
    submitted_hospital_id VARCHAR(50),
    submitted_hospital_name VARCHAR(255),
    submission_time TIMESTAMPTZ,
    doctor_confirmed_diagnosis TEXT,
    doctor_exams TEXT[] DEFAULT '{}',
    doctor_observations TEXT,
    doctor_status VARCHAR(50) DEFAULT 'Aguardando',
    emergency_contact VARCHAR(30),
    patient_bi VARCHAR(20) REFERENCES profiles(bi) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dria_evals_bi ON dria_evaluations(patient_bi);
CREATE INDEX IF NOT EXISTS idx_dria_evals_priority ON dria_evaluations(priority);
CREATE INDEX IF NOT EXISTS idx_dria_evals_hospital ON dria_evaluations(submitted_hospital_id);
CREATE INDEX IF NOT EXISTS idx_dria_evals_created ON dria_evaluations(created_at);
ALTER TABLE dria_evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo dria_evaluations" ON dria_evaluations;
CREATE POLICY "Permitir tudo dria_evaluations" ON dria_evaluations FOR ALL USING (true) WITH CHECK (true);

-- Trigger para actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION dria_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dria_evals_set_updated_at ON dria_evaluations;
CREATE TRIGGER dria_evals_set_updated_at
BEFORE UPDATE ON dria_evaluations
FOR EACH ROW EXECUTE FUNCTION dria_set_updated_at();

-- Add auth fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS supabase_user_id UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_level VARCHAR(50) DEFAULT 'Pendente';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS confidence_score INT DEFAULT 80;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_access TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_profiles_supabase_user ON profiles(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

NOTIFY pgrst, 'reload schema';
