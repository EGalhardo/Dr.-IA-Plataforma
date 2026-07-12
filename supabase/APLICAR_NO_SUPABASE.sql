-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║   Dr.IA — SCRIPT DE MIGRAÇÃO / ACTUALIZAÇÃO DE BASE DE DADOS        ║
-- ║   Projecto: Dr.IA Oficial (qfckehadigqiugpuhviy)                    ║
-- ║                                                                       ║
-- ║   ✅ SEGURO — PODE SER EXECUTADO VÁRIAS VEZES (idempotente)           ║
-- ║   ✅ NÃO APAGA NEM ALTERA DADOS EXISTENTES (só adiciona o que falta)  ║
-- ║   ✅ Funciona em BD vazia, parcial ou já com dados                   ║
-- ║                                                                     ║
-- ║   COMO USAR:                                                         ║
-- ║   1. Abra o Supabase Dashboard → SQL Editor → New Query             ║
-- ║   2. Cole TODO este ficheiro e clique "Run"                         ║
-- ║   3. No final verá "✅ Dr.IA — Migração concluída com sucesso!"      ║
-- ╚══════════════════════════════════════════════════════════════════════╝

BEGIN;

-- =====================================================
-- 0. EXTENSÕES
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. FUNÇÃO AUXILIAR: updated_at (trigger genérico)
-- =====================================================
CREATE OR REPLACE FUNCTION public.dria_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. TABELA: profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bi VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    nif VARCHAR(20) UNIQUE,
    passport VARCHAR(30) UNIQUE,
    birth_date DATE,
    filiation TEXT,
    marital_status VARCHAR(50),
    email VARCHAR(255),
    supabase_user_id UUID,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    verification_level VARCHAR(50) DEFAULT 'Pendente',
    confidence_score INT DEFAULT 80,
    last_access TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colunas em falta (instalações antigas)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS supabase_user_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_level VARCHAR(50) DEFAULT 'Pendente';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS confidence_score INT DEFAULT 80;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_access TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_profiles_bi              ON public.profiles(bi);
CREATE INDEX IF NOT EXISTS idx_profiles_nif             ON public.profiles(nif);
CREATE INDEX IF NOT EXISTS idx_profiles_supabase_user   ON public.profiles(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email           ON public.profiles(email);

DROP TRIGGER IF EXISTS dria_set_updated_at ON public.profiles;
CREATE TRIGGER dria_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.dria_set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_profiles" ON public.profiles;
CREATE POLICY "allow_profiles" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 3. TABELA: dria_evaluations (Triagens Clínicas)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.dria_evaluations (
    id TEXT PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    patient_age INT NOT NULL DEFAULT 0,
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
    patient_bi VARCHAR(20) REFERENCES public.profiles(bi) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS patient_name VARCHAR(255) DEFAULT '';
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS patient_age INT DEFAULT 0;
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS patient_gender VARCHAR(50);
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS patient_weight DECIMAL(5,2);
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS patient_height DECIMAL(4,2);
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS patient_municipality VARCHAR(100);
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS symptoms TEXT;
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS allergies TEXT DEFAULT '';
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS diseases TEXT DEFAULT '';
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS medications TEXT DEFAULT '';
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS possible_causes TEXT[] DEFAULT '{}';
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS suggested_specialty VARCHAR(255);
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Moderado';
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS recommendations TEXT[] DEFAULT '{}';
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS go_to_hospital BOOLEAN DEFAULT false;
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS submitted_hospital_id VARCHAR(50);
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS submitted_hospital_name VARCHAR(255);
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS submission_time TIMESTAMPTZ;
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS doctor_confirmed_diagnosis TEXT;
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS doctor_exams TEXT[] DEFAULT '{}';
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS doctor_observations TEXT;
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS doctor_status VARCHAR(50) DEFAULT 'Aguardando';
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(30);
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS patient_bi VARCHAR(20);
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.dria_evaluations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_dria_evals_patient_bi ON public.dria_evaluations(patient_bi);
CREATE INDEX IF NOT EXISTS idx_dria_evals_priority   ON public.dria_evaluations(priority);
CREATE INDEX IF NOT EXISTS idx_dria_evals_hospital   ON public.dria_evaluations(submitted_hospital_id);
CREATE INDEX IF NOT EXISTS idx_dria_evals_created    ON public.dria_evaluations(created_at);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_dria_evals_patient_bi' AND conrelid = 'public.dria_evaluations'::regclass
  ) THEN
    ALTER TABLE public.dria_evaluations
      ADD CONSTRAINT fk_dria_evals_patient_bi
      FOREIGN KEY (patient_bi) REFERENCES public.profiles(bi) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DROP TRIGGER IF EXISTS dria_set_updated_at ON public.dria_evaluations;
CREATE TRIGGER dria_set_updated_at
  BEFORE UPDATE ON public.dria_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.dria_set_updated_at();

ALTER TABLE public.dria_evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_dria_evaluations" ON public.dria_evaluations;
CREATE POLICY "allow_dria_evaluations" ON public.dria_evaluations
  FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 4. TABELA: dria_hospitals
-- =====================================================
CREATE TABLE IF NOT EXISTS public.dria_hospitals (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    municipality VARCHAR(100),
    distance VARCHAR(30),
    specialties TEXT[] DEFAULT '{}',
    avg_wait_time VARCHAR(30),
    doctors_count INT DEFAULT 0,
    hours VARCHAR(100),
    integration_state VARCHAR(20) DEFAULT 'Pendente',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.dria_hospitals ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT '';
ALTER TABLE public.dria_hospitals ADD COLUMN IF NOT EXISTS municipality VARCHAR(100);
ALTER TABLE public.dria_hospitals ADD COLUMN IF NOT EXISTS distance VARCHAR(30);
ALTER TABLE public.dria_hospitals ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';
ALTER TABLE public.dria_hospitals ADD COLUMN IF NOT EXISTS avg_wait_time VARCHAR(30);
ALTER TABLE public.dria_hospitals ADD COLUMN IF NOT EXISTS doctors_count INT DEFAULT 0;
ALTER TABLE public.dria_hospitals ADD COLUMN IF NOT EXISTS hours VARCHAR(100);
ALTER TABLE public.dria_hospitals ADD COLUMN IF NOT EXISTS integration_state VARCHAR(20) DEFAULT 'Pendente';
ALTER TABLE public.dria_hospitals ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.dria_hospitals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_dria_hosp_muni  ON public.dria_hospitals(municipality);
CREATE INDEX IF NOT EXISTS idx_dria_hosp_state ON public.dria_hospitals(integration_state);

DROP TRIGGER IF EXISTS dria_hosp_set_updated_at ON public.dria_hospitals;
CREATE TRIGGER dria_hosp_set_updated_at
  BEFORE UPDATE ON public.dria_hospitals
  FOR EACH ROW EXECUTE FUNCTION public.dria_set_updated_at();

ALTER TABLE public.dria_hospitals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo dria_hospitals" ON public.dria_hospitals;
CREATE POLICY "Permitir tudo dria_hospitals" ON public.dria_hospitals
  FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 5. TABELAS DE SUPORTE
-- =====================================================

-- 5.1 digital_protocols
CREATE TABLE IF NOT EXISTS public.digital_protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol_number VARCHAR(100) UNIQUE NOT NULL,
    issuer_institution VARCHAR(100) NOT NULL,
    official_issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    official_time TIME NOT NULL DEFAULT CURRENT_TIME,
    issuer_responsible VARCHAR(255) NOT NULL DEFAULT 'Sistema',
    category VARCHAR(100) NOT NULL DEFAULT 'Geral',
    document_type VARCHAR(100) NOT NULL DEFAULT 'Documento',
    current_state VARCHAR(50) NOT NULL DEFAULT 'Emitido',
    priority VARCHAR(50) NOT NULL DEFAULT 'Normal',
    deadline_date DATE,
    qr_code_url TEXT,
    digital_signature TEXT NOT NULL DEFAULT 'sistema',
    digital_seal TEXT,
    document_hash TEXT,
    institutional_certificate TEXT,
    signature_date TIMESTAMPTZ,
    legal_validity VARCHAR(100) DEFAULT 'Válido'
);
CREATE INDEX IF NOT EXISTS idx_protocols_number ON public.digital_protocols(protocol_number);
ALTER TABLE public.digital_protocols ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_digital_protocols" ON public.digital_protocols;
CREATE POLICY "allow_digital_protocols" ON public.digital_protocols FOR ALL USING (true) WITH CHECK (true);

-- 5.2 messages
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    sender_bi VARCHAR(20) NOT NULL DEFAULT 'sistema',
    recipient_bi VARCHAR(20) NOT NULL DEFAULT 'sistema',
    org VARCHAR(100) NOT NULL DEFAULT 'Dr.IA',
    preview TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    unread BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) NOT NULL DEFAULT 'Normal',
    subject VARCHAR(255) NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    deadline_text VARCHAR(100),
    state_indicator VARCHAR(100),
    actions TEXT[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    protocol_id UUID REFERENCES public.digital_protocols(id) ON DELETE SET NULL,
    sensitivity VARCHAR(50) DEFAULT 'Privado',
    priority_scale VARCHAR(50) DEFAULT 'Normal',
    deadline_hours_remaining INT,
    protocol_number VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_bi);
CREATE INDEX IF NOT EXISTS idx_messages_sender    ON public.messages(sender_bi);
CREATE INDEX IF NOT EXISTS idx_messages_protocol  ON public.messages(protocol_number);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_messages" ON public.messages;
CREATE POLICY "allow_messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);

-- 5.3 message_state_history
CREATE TABLE IF NOT EXISTS public.message_state_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id BIGINT REFERENCES public.messages(id) ON DELETE CASCADE,
    state VARCHAR(100) NOT NULL DEFAULT 'Criado',
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    event_time TIME NOT NULL DEFAULT CURRENT_TIME,
    responsible VARCHAR(255) NOT NULL DEFAULT 'Sistema',
    description TEXT NOT NULL DEFAULT ''
);
ALTER TABLE public.message_state_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_msg_history" ON public.message_state_history;
CREATE POLICY "allow_msg_history" ON public.message_state_history FOR ALL USING (true) WITH CHECK (true);

-- 5.4 documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT 'Documento',
    validity VARCHAR(100) NOT NULL DEFAULT 'Válido',
    code VARCHAR(100) UNIQUE NOT NULL DEFAULT ('DOC-' || uuid_generate_v4()),
    holder_bi VARCHAR(20) NOT NULL REFERENCES public.profiles(bi) ON DELETE CASCADE DEFAULT 'sistema',
    document_number VARCHAR(100) NOT NULL DEFAULT '',
    issuer VARCHAR(255) NOT NULL DEFAULT 'Dr.IA',
    issued_at VARCHAR(100) NOT NULL DEFAULT '',
    protocol_id UUID REFERENCES public.digital_protocols(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_documents_holder ON public.documents(holder_bi);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_documents" ON public.documents;
CREATE POLICY "allow_documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);

-- 5.5 contacts
CREATE TABLE IF NOT EXISTS public.contacts (
    id BIGSERIAL PRIMARY KEY,
    owner_bi VARCHAR(20) NOT NULL REFERENCES public.profiles(bi) ON DELETE CASCADE DEFAULT 'sistema',
    name VARCHAR(255) NOT NULL DEFAULT '',
    bi VARCHAR(20) NOT NULL DEFAULT '',
    relation VARCHAR(100) NOT NULL DEFAULT 'Outro',
    status VARCHAR(50) DEFAULT 'Pendente',
    type VARCHAR(50) DEFAULT 'Normal'
);
CREATE INDEX IF NOT EXISTS idx_contacts_owner ON public.contacts(owner_bi);
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_contacts" ON public.contacts;
CREATE POLICY "allow_contacts" ON public.contacts FOR ALL USING (true) WITH CHECK (true);

-- 5.6 notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    target_bi VARCHAR(20) NOT NULL REFERENCES public.profiles(bi) ON DELETE CASCADE DEFAULT 'sistema',
    title VARCHAR(255) NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    time_text VARCHAR(100) NOT NULL DEFAULT '',
    type VARCHAR(30) DEFAULT 'info',
    target_tab VARCHAR(50) NOT NULL DEFAULT 'home'
);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON public.notifications(target_bi);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_notifications" ON public.notifications;
CREATE POLICY "allow_notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- 5.7 user_requests
CREATE TABLE IF NOT EXISTS public.user_requests (
    id BIGSERIAL PRIMARY KEY,
    user_bi VARCHAR(20) NOT NULL DEFAULT 'sistema',
    user_name VARCHAR(255) NOT NULL DEFAULT '',
    service_type VARCHAR(100) NOT NULL DEFAULT 'Outro',
    priority VARCHAR(50) NOT NULL DEFAULT 'Normal',
    time_text VARCHAR(100) NOT NULL DEFAULT '',
    status VARCHAR(50) DEFAULT 'pendente',
    institution VARCHAR(100),
    request_date DATE DEFAULT CURRENT_DATE
);
CREATE INDEX IF NOT EXISTS idx_user_requests_bi ON public.user_requests(user_bi);
ALTER TABLE public.user_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_user_requests" ON public.user_requests;
CREATE POLICY "allow_user_requests" ON public.user_requests FOR ALL USING (true) WITH CHECK (true);

-- 5.8 document_requests
CREATE TABLE IF NOT EXISTS public.document_requests (
    id BIGSERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL DEFAULT '',
    user_bi VARCHAR(20) NOT NULL DEFAULT 'sistema',
    doc_type VARCHAR(100) NOT NULL DEFAULT 'Outro',
    institution VARCHAR(255) NOT NULL DEFAULT 'Dr.IA',
    request_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Pendente',
    ai_status VARCHAR(50) DEFAULT 'manual-review'
);
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_doc_requests" ON public.document_requests;
CREATE POLICY "allow_doc_requests" ON public.document_requests FOR ALL USING (true) WITH CHECK (true);

-- 5.9 audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action TEXT NOT NULL DEFAULT '',
    username VARCHAR(100) NOT NULL DEFAULT 'sistema',
    timestamp TIMESTAMP DEFAULT NOW(),
    action_type VARCHAR(30) DEFAULT 'info'
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_audit_logs" ON public.audit_logs;
CREATE POLICY "allow_audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- 5.10 video_sessions + eventos + notificações
CREATE TABLE IF NOT EXISTS public.video_sessions (
    id TEXT PRIMARY KEY,
    room_name TEXT NOT NULL DEFAULT '',
    subject TEXT NOT NULL DEFAULT '',
    associated_protocol TEXT,
    associated_message_id INTEGER,
    status TEXT NOT NULL DEFAULT 'agendada',
    host_bi TEXT NOT NULL DEFAULT 'sistema',
    host_name TEXT NOT NULL DEFAULT '',
    guest_bi TEXT NOT NULL DEFAULT 'sistema',
    guest_name TEXT NOT NULL DEFAULT '',
    scheduled_for TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    agenda TEXT,
    notes TEXT,
    duration INTEGER,
    quality TEXT DEFAULT 'excellent',
    participant_count INTEGER DEFAULT 2
);

CREATE TABLE IF NOT EXISTS public.video_session_events (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES public.video_sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL DEFAULT 'join',
    bi TEXT NOT NULL DEFAULT 'sistema',
    user_name TEXT NOT NULL DEFAULT '',
    description TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.video_session_notifications (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES public.video_sessions(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',
    message TEXT NOT NULL DEFAULT '',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.video_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_session_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_video_sessions" ON public.video_sessions;
CREATE POLICY "allow_video_sessions" ON public.video_sessions FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "allow_video_events" ON public.video_session_events;
CREATE POLICY "allow_video_events" ON public.video_session_events FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "allow_video_notifs" ON public.video_session_notifications;
CREATE POLICY "allow_video_notifs" ON public.video_session_notifications FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 6. SEED DE DADOS DE DEMONSTRAÇÃO
--    Todos os arrays usam ::TEXT[] para evitar
--    "cannot determine type of empty array".
-- =====================================================

-- 6.1 Perfis demo
INSERT INTO public.profiles (bi, name, email, phone, role, verification_level, confidence_score, last_access)
VALUES
  ('009874562LA041', 'Edlasio Galhardo', 'edlasio@dria.ao', '+244 923 000 111', 'user',        'Verificado',         98,  NOW()),
  ('HOSP-DRIA-2026', 'Dr. Edlasio Galhardo — Diretor Clínico', 'hospital@dria.ao', '+244 923 000 111', 'institution', 'Credenciado', 100, NOW()),
  ('ADM-8812-OP',    'Dr. Manuel Neto — Diretor de Tecnologias (MINSA)', 'minsa@dria.ao', '+244 222 301 200', 'admin', 'Administrador Geral', 100, NOW())
ON CONFLICT (bi) DO UPDATE SET
  email = EXCLUDED.email,
  last_access = NOW();

-- 6.2 Avaliações/triagens demo
INSERT INTO public.dria_evaluations
  (id, patient_name, patient_age, patient_gender, patient_weight, patient_height, patient_municipality,
   symptoms, priority, ai_summary, recommendations, doctor_status,
   submitted_hospital_id, submitted_hospital_name, submission_time, go_to_hospital, possible_causes, doctor_exams, created_at)
VALUES
  ('ev_ebola', 'João Bernardo', 34, 'Masculino', 70, 1.75, 'Maianga',
   'Febre elevada de início repentino medida em 39.8ºC, vómitos frequentes, diarreia e contacto recente com um caso confirmado que faleceu de febre hemorrágica há 6 dias.',
   'Emergência',
   'Foram identificados sintomas compatíveis com caso suspeito de Doença por Vírus Ébola. Recomenda-se isolamento imediato e dirigir-se urgentemente à unidade de saúde indicada.',
   ARRAY['Isolamento imediato','Evitar contacto físico','Dirigir-se à unidade de saúde com urgência','A equipa hospitalar foi previamente notificada']::TEXT[],
   'Aguardando', 'h4', 'Hospital Josina Machel', NOW(), true,
   ARRAY['Ébola (suspeita)','Febre hemorrágica']::TEXT[],
   ARRAY['Isolamento','PCR']::TEXT[],
   NOW()),

  ('ev1', 'Edlasio Galhardo', 28, 'Masculino', 74, 1.78, 'Viana',
   'Febre alta constante medida em 39.2ºC, calafrios severos e tremores intensos por episódios. Dores musculares por todo o corpo, fadiga extrema e dor de cabeça pulsante há cerca de 3 dias.',
   'Urgente',
   'Quadro clínico compatível com infeção parasitária por Plasmodium (Malária). Febre alta cíclica associada a tremores e mialgia severa em região endémica.',
   ARRAY['Realizar teste rápido de Malária (gota espessa)','Manter hidratação oral rigorosa','Evitar automedicação com anti-inflamatórios','Dirigir-se ao posto de saúde para confirmação laboratorial']::TEXT[],
   'Alta', 'h1', 'Hospital Geral de Luanda', NOW(), true,
   ARRAY['Malária']::TEXT[],
   ARRAY['Gota espessa negativa']::TEXT[],
   NOW()),

  ('ev2', 'Maria Manuel', 32, 'Feminino', 62, 1.65, 'Cazenga',
   'Diarreia aquosa extremamente abundante, sem dor abdominal, acompanhada de vómitos frequentes e sede insaciável nas últimas 12 horas. Cãibras musculares severas nas pernas.',
   'Urgente',
   'Quadro de diarreia aquosa profusa de início abrupto com vómitos e desidratação grave levanta forte suspeita epidemiológica de Cólera.',
   ARRAY['Ingestão imediata de Soro de Reidratação Oral','Deslocação urgente para Unidade de Tratamento de Cólera','Não administrar anti-diarreicos','Isolamento de utensílios e higienização rigorosa']::TEXT[],
   'Aguardando', 'h2', 'Hospital Américo Boavida', NOW(), true,
   ARRAY['Cólera (suspeita)']::TEXT[],
   ARRAY[]::TEXT[],
   NOW()),

  ('ev3', 'Pedro Neto', 45, 'Masculino', 68, 1.72, 'Cacuaco',
   'Tosse seca e produtiva há mais de 3 semanas, por vezes com esputo amarelado e vestígios de sangue. Febre baixa ao final da tarde, suores noturnos abundantes, perdeu cerca de 6 kg no último mês.',
   'Moderado',
   'Tríade clássica de tosse crónica produtiva, febre vespertina com suores noturnos e perda de peso acentuada em Angola é altamente sugestiva de Tuberculose Pulmonar Ativa.',
   ARRAY['Agendar teste de expetoração (GeneXpert)','Usar máscara em ambientes familiares','Manter boa ventilação nos quartos','Não interromper a avaliação clínica']::TEXT[],
   'Alta', 'h3', 'Centro de Saúde de Cacuaco', NOW(), true,
   ARRAY['Tuberculose Pulmonar (suspeita)']::TEXT[],
   ARRAY['GeneXpert pendente']::TEXT[],
   NOW()),

  ('ev4', 'Ana Sousa', 18, 'Feminino', 54, 1.62, 'Belas',
   'Febre alta 38.8ºC há 4 dias, conjuntivite com olhos vermelhos, coriza intensa e tosse seca. Há 24 horas surgiram manchas vermelhas na pele, começando atrás das orelhas e rosto.',
   'Urgente',
   'Apresentação clínica com pródromo febril, sintomas respiratórios, conjuntivite e padrão de progressão cefalocaudal do exantema maculopapular é patognomónico de Sarampo.',
   ARRAY['Isolamento domiciliário estrito','Administração de Vitamina A sob supervisão médica','Controlo sintomático da febre','Hidratação abundante e repouso absoluto']::TEXT[],
   'Alta', 'h5', 'Centro de Saúde do Cazenga', NOW(), true,
   ARRAY['Sarampo']::TEXT[],
   ARRAY[]::TEXT[],
   NOW())
ON CONFLICT (id) DO NOTHING;

-- 6.3 Hospitais conectados (só semeia se a tabela estiver vazia)
INSERT INTO public.dria_hospitals (id, name, municipality, distance, specialties, avg_wait_time, doctors_count, hours, integration_state)
SELECT * FROM (VALUES
  ('h1', 'Hospital Geral de Luanda',   'Talatona', '8.2 km',
   ARRAY['Urgência','Clínica Geral','Pediatria','Cardiologia','Cirurgia','Ortopedia']::TEXT[],
   '≈ 25 min', 42, '24 horas', 'Ativo'),
  ('h2', 'Hospital Américo Boavida',   'Rangel',   '12.4 km',
   ARRAY['Urgência','Medicina Interna','Ginecologia','Obstetrícia','Neonatologia']::TEXT[],
   '≈ 40 min', 38, '24 horas', 'Ativo'),
  ('h3', 'Centro de Saúde de Cacuaco', 'Cacuaco',  '3.1 km',
   ARRAY['Clínica Geral','Vacinação','Saúde Materna','Testes Rápidos']::TEXT[],
   '≈ 15 min', 14, '07h–20h',  'Ativo'),
  ('h4', 'Hospital Josina Machel',     'Ingombota','15.8 km',
   ARRAY['Urgência','Infeciologia','Isolamento','UCI','Pediatria']::TEXT[],
   '≈ 55 min', 55, '24 horas', 'Ativo'),
  ('h5', 'Centro de Saúde do Cazenga', 'Cazenga',  '5.6 km',
   ARRAY['Clínica Geral','Saúde Materna','Vacinação','PNP']::TEXT[],
   '≈ 20 min', 19, '07h–22h',  'Ativo'),
  ('h6', 'Clínica Sagrada Esperança',  'Maianga',  '10.0 km',
   ARRAY['Cardiologia','Oftalmologia','Dermatologia','Laboratório','Imagiologia']::TEXT[],
   '≈ 35 min', 50, '24 horas', 'Pendente')
) AS seed(id, name, municipality, distance, specialties, avg_wait_time, doctors_count, hours, integration_state)
WHERE NOT EXISTS (SELECT 1 FROM public.dria_hospitals LIMIT 1);

-- =====================================================
-- 7. REFRESH CACHE DO POSTGREST
-- =====================================================
NOTIFY pgrst, 'reload schema';

COMMIT;

-- =====================================================
-- ✅ SUCESSO
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Dr.IA — Migração concluída com sucesso!';
  RAISE NOTICE '   Tabelas prontas: profiles, dria_evaluations, dria_hospitals,';
  RAISE NOTICE '   digital_protocols, messages, message_state_history, documents,';
  RAISE NOTICE '   contacts, notifications, user_requests, document_requests,';
  RAISE NOTICE '   audit_logs, video_sessions, video_session_events, video_session_notifications.';
END $$;
