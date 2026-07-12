/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DriaEvaluation {
  id: string;
  patientName: string;
  /** BI do utente (chave de identidade oficial; usado para sincronização) */
  patientBI?: string;
  patientAge: number;
  patientGender: 'Masculino' | 'Feminino' | string;
  patientWeight: number;
  patientHeight: number;
  patientMunicipality: string;
  symptoms: string;
  photos: string[];
  allergies: string;
  diseases: string;
  medications: string;
  aiSummary: string;
  possibleCauses: string[];
  suggestedSpecialty: string;
  priority: 'Emergência' | 'Muito Urgente' | 'Urgente' | 'Moderado' | 'Leve' | string;
  recommendations: string[];
  goToHospital: boolean;
  submittedHospitalId: string | null;
  submittedHospitalName: string | null;
  submissionTime: string | null;
  doctorConfirmedDiagnosis: string | null;
  doctorExams: string[];
  doctorObservations: string | null;
  doctorStatus: 'Aguardando' | 'Em Atendimento' | 'Alta';
  emergencyContact?: string;
}

export interface DriaHospital {
  id: string;
  name: string;
  municipality: string;
  distance: string;
  specialties: string[];
  avgWaitTime: string;
  doctorsCount: number;
  hours: string;
  integrationState: 'Ativo' | 'Pendente' | 'Inativo';
}

export interface FirstAidTopic {
  id: string;
  title: string;
  icon: string;
  description: string;
  steps: string[];
  image: string;
  dangerSignals: string[];
}
