/**
 * Dr.IA — Data Sync Service
 * Synchronizes clinical evaluations and hospitals between localStorage ↔ Supabase
 */
import { supabase } from '../lib/supabaseClient';
import { hasValidSupabaseKeys } from './supabaseService';
import { DriaEvaluation, DriaHospital } from '../types/dria';
import { INITIAL_EVALUATIONS, MOCK_HOSPITALS } from '../constants/driaMocks';

export const driaSyncService = {
  isAvailable(): boolean { return hasValidSupabaseKeys(); },

  // ──────────────── AVALIAÇÕES CLÍNICAS ────────────────
  async loadFromSupabase(): Promise<DriaEvaluation[]> {
    if (!this.isAvailable()) return [];
    const { data, error } = await supabase.from('dria_evaluations').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) { console.warn('Dr.IA Sync load error:', error.message); return []; }
    return (data || []).map((r: any) => mapRowToEval(r));
  },

  async save(evaluation: DriaEvaluation): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const row = mapEvalToRow(evaluation);
    const { error } = await supabase.from('dria_evaluations').upsert(row, { onConflict: 'id' });
    if (error) { console.warn('Dr.IA Sync save error:', error.message); return false; }
    return true;
  },

  async update(id: string, fields: Partial<DriaEvaluation>): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const { error } = await supabase.from('dria_evaluations').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { console.warn('Dr.IA Sync update error:', error.message); return false; }
    return true;
  },

  async remove(id: string): Promise<boolean> {
    if (!this.isAvailable()) return false;
    const { error } = await supabase.from('dria_evaluations').delete().eq('id', id);
    return !error;
  },

  async seedDemoData(): Promise<void> {
    if (!this.isAvailable()) return;
    const { count } = await supabase.from('dria_evaluations').select('*', { count: 'exact', head: true });
    if (count && count > 0) return;
    const rows = INITIAL_EVALUATIONS.map(ev => mapEvalToRow(ev));
    await supabase.from('dria_evaluations').upsert(rows, { onConflict: 'id' });
    console.log(`Dr.IA Sync: Seeded ${rows.length} demo evaluations`);
  },

  subscribeToChanges(onChange: (payload: any) => void) {
    if (!this.isAvailable()) return { unsubscribe: () => {} };
    return supabase.channel('dria_evals_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dria_evaluations' }, (p) => onChange(p))
      .subscribe();
  },

  // ──────────────── HOSPITAIS CONECTADOS ────────────────
  async loadHospitalsFromSupabase(): Promise<DriaHospital[]> {
    if (!this.isAvailable()) return [];
    try {
      const { data, error } = await supabase.from('dria_hospitals').select('*').order('name', { ascending: true });
      if (error) { return []; }
      return (data || []).map((r: any) => mapRowToHospital(r));
    } catch { return []; }
  },

  async saveHospital(hospital: DriaHospital): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      const row = mapHospitalToRow(hospital);
      const { error } = await supabase.from('dria_hospitals').upsert(row, { onConflict: 'id' });
      if (error) { console.warn('Dr.IA hospital save error:', error.message); return false; }
      return true;
    } catch { return false; }
  },

  subscribeToHospitalChanges(onChange: (payload: any) => void) {
    if (!this.isAvailable()) return { unsubscribe: () => {} };
    return supabase.channel('dria_hosp_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dria_hospitals' }, (p) => onChange(p))
      .subscribe();
  },
};

// ─── Mappers ────────────────────────────────────────────
function mapRowToEval(r: any): DriaEvaluation {
  return {
    id: r.id, patientName: r.patient_name || '', patientAge: r.patient_age || 0, patientGender: r.patient_gender || '',
    patientWeight: r.patient_weight || 0, patientHeight: r.patient_height || 0, patientMunicipality: r.patient_municipality || '',
    symptoms: r.symptoms || '', photos: r.photos || [], allergies: r.allergies || '', diseases: r.diseases || '',
    medications: r.medications || '', aiSummary: r.ai_summary || '', possibleCauses: r.possible_causes || [],
    suggestedSpecialty: r.suggested_specialty || '', priority: r.priority || 'Moderado', recommendations: r.recommendations || [],
    goToHospital: r.go_to_hospital || false, submittedHospitalId: r.submitted_hospital_id || null,
    submittedHospitalName: r.submitted_hospital_name || null, submissionTime: r.submission_time || null,
    doctorConfirmedDiagnosis: r.doctor_confirmed_diagnosis || null, doctorExams: r.doctor_exams || [],
    doctorObservations: r.doctor_observations || null, doctorStatus: r.doctor_status || 'Aguardando', emergencyContact: r.emergency_contact || '',
  };
}

function mapEvalToRow(ev: DriaEvaluation): any {
  return {
    id: ev.id, patient_name: ev.patientName, patient_age: ev.patientAge, patient_gender: ev.patientGender,
    patient_weight: ev.patientWeight, patient_height: ev.patientHeight, patient_municipality: ev.patientMunicipality,
    symptoms: ev.symptoms, photos: ev.photos || [], allergies: ev.allergies || '', diseases: ev.diseases || '',
    medications: ev.medications || '', ai_summary: ev.aiSummary || '', possible_causes: ev.possibleCauses || [],
    suggested_specialty: ev.suggestedSpecialty || '', priority: ev.priority || 'Moderado', recommendations: ev.recommendations || [],
    go_to_hospital: ev.goToHospital || false, submitted_hospital_id: ev.submittedHospitalId || null,
    submitted_hospital_name: ev.submittedHospitalName || null, submission_time: ev.submissionTime || null,
    doctor_confirmed_diagnosis: ev.doctorConfirmedDiagnosis || null, doctor_exams: ev.doctorExams || [],
    doctor_observations: ev.doctorObservations || null, doctor_status: ev.doctorStatus || 'Aguardando',
    emergency_contact: ev.emergencyContact || '', patient_bi: (ev as any).patientBI || null,
    updated_at: new Date().toISOString(),
  };
}

// ─── Mappers de Hospitais ─────────────────────────────────────
function mapRowToHospital(r: any): DriaHospital {
  return {
    id: r.id, name: r.name || '', municipality: r.municipality || '',
    distance: r.distance || '', specialties: r.specialties || [],
    avgWaitTime: r.avg_wait_time || '—', doctorsCount: r.doctors_count || 0,
    hours: r.hours || '24h', integrationState: r.integration_state || 'Pendente',
  };
}
function mapHospitalToRow(h: DriaHospital): any {
  return {
    id: h.id, name: h.name, municipality: h.municipality,
    distance: h.distance, specialties: h.specialties || [],
    avg_wait_time: h.avgWaitTime, doctors_count: h.doctorsCount,
    hours: h.hours, integration_state: h.integrationState || 'Pendente',
    updated_at: new Date().toISOString(),
  };
}
