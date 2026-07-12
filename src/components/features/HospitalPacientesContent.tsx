/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Hospital — Fila de Pacientes (Protocolo de Manchester)
 * Lista + Workstation de atendimento com design premium.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Search, Filter, ChevronRight, FileText, Activity, Clock, CheckCircle2, ArrowLeft, Pill, AlertCircle, RefreshCw, Stethoscope, User, MapPin, Calendar, XCircle, ClipboardCheck, Sparkles } from 'lucide-react';
import { DriaEvaluation, DriaHospital } from '../../types/dria';
import { useLanguage } from '../../hooks/useLanguage';

interface HospitalPacientesContentProps {
  evaluations: DriaEvaluation[];
  hospital: DriaHospital;
  onUpdateEvaluation: (updated: DriaEvaluation) => void;
  selectedPatient: DriaEvaluation | null;
  setSelectedPatient: (patient: DriaEvaluation | null) => void;
}

const PRIORITY_CONFIG: Record<string, { cls: string; dot: string; label: string; maxWait: string; color: string }> = {
  'Emergência':   { cls: 'priority-emergency',  dot: 'bg-danger-500',  label: 'Emergência',   maxWait: '0 min',   color: 'danger'  },
  'Muito Urgente':{ cls: 'priority-very-urgent',dot: 'bg-orange-500', label: 'M. Urgente',  maxWait: '10 min',  color: 'orange'  },
  'Urgente':      { cls: 'priority-urgent',     dot: 'bg-warning-500', label: 'Urgente',     maxWait: '60 min',  color: 'warning' },
  'Moderado':     { cls: 'priority-moderate',   dot: 'bg-info-500',    label: 'Standard',    maxWait: '120 min', color: 'info'    },
  'Leve':         { cls: 'priority-light',      dot: 'bg-success-500', label: 'Não Urgente', maxWait: '240 min', color: 'success' },
};

const DEFAULT_EXAMS = [
  'Gota Espessa (Malária)',
  'Hemograma Completo',
  'Exame de Urina',
  'Pesquisa de BAAR (TB)',
  'GeneXpert PCR',
  'Teste Rápido Dengue',
  'Sorologia Hepática',
  'Ionograma Sanguíneo',
];

export function HospitalPacientesContent({
  evaluations,
  hospital,
  onUpdateEvaluation,
  selectedPatient,
  setSelectedPatient
}: HospitalPacientesContentProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState<'Aguardando'|'Em Atendimento'|'Alta'|'Todas'>('Aguardando');

  // Apenas avaliações encaminhadas para ESTE hospital (ou com hospital indefinido, para retrocompatibilidade).
  // Defensivo: aceita avaliações cujo submittedHospitalId corresponda ao id do hospital, ou cujo
  // submittedHospitalName case-insensitive coincida com o nome do hospital.
  const hospId = hospital?.id;
  const hospName = (hospital?.name || '').toLowerCase().trim();
  const hospitalEvals = evaluations.filter(ev => {
    if (!ev.symptoms || !ev.symptoms.trim()) return false;
    if (!hospId) return true;
    if (ev.submittedHospitalId === hospId) return true;
    if (hospName && ev.submittedHospitalName && ev.submittedHospitalName.toLowerCase().trim() === hospName) return true;
    // Retrocompatibilidade: quando hospital corrente é o único/fallback (mock), incluir todas.
    if (hospId === 'h-fallback' || hospId === 'h1') {
      if (!ev.submittedHospitalId) return true;
    }
    return false;
  });

  const filteredEvals = hospitalEvals.filter(ev => {
    const q = searchQuery.toLowerCase();
    const name = (ev.patientName || '').toLowerCase();
    const muni = (ev.patientMunicipality || '').toLowerCase();
    const symp = (ev.symptoms || '').toLowerCase();
    const matchesSearch = name.includes(q) || muni.includes(q) || symp.includes(q);
    const matchesPriority = priorityFilter === 'Todas' || ev.priority === priorityFilter;
    let matchesStatus = true;
    if (statusFilter === 'Aguardando') matchesStatus = ev.doctorStatus === 'Aguardando';
    else if (statusFilter === 'Em Atendimento') matchesStatus = ev.doctorStatus === 'Em Atendimento';
    else if (statusFilter === 'Alta') matchesStatus = ev.doctorStatus === 'Alta';
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Workstation form
  const [diagConfirmed, setDiagConfirmed] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('Urgente');
  const [examsChecked, setExamsChecked] = useState<string[]>([]);
  const [doctorObs, setDoctorObs] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (selectedPatient) {
      setDiagConfirmed(selectedPatient.doctorConfirmedDiagnosis || '');
      setSelectedPriority(selectedPatient.priority);
      setExamsChecked(selectedPatient.doctorExams || []);
      setDoctorObs(selectedPatient.doctorObservations || '');
      setSubmitSuccess(false);

      // Ao abrir um paciente que ainda está "Aguardando", transita automaticamente
      // para "Em Atendimento" em todos os ecrãs sincronizados.
      if (selectedPatient.doctorStatus === 'Aguardando') {
        const inCare: DriaEvaluation = {
          ...selectedPatient,
          doctorStatus: 'Em Atendimento',
        };
        onUpdateEvaluation(inCare);
      }
    }
  }, [selectedPatient]);

  const toggleExam = (exam: string) => {
    setExamsChecked(prev => prev.includes(exam) ? prev.filter(e => e !== exam) : [...prev, exam]);
  };

  const handleSubmitAtendimento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const updatedEval: DriaEvaluation = {
        ...selectedPatient,
        priority: selectedPriority as DriaEvaluation['priority'],
        doctorConfirmedDiagnosis: diagConfirmed || `Diagnóstico clínico para ${selectedPatient.patientName}`,
        doctorExams: examsChecked,
        doctorObservations: doctorObs || 'Alta com recomendações de vigilância.',
        doctorStatus: 'Alta',
      };
      onUpdateEvaluation(updatedEval);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => { setSelectedPatient(null); setSubmitSuccess(false); }, 1600);
    }, 1200);
  };

  const waitingCount = hospitalEvals.filter(ev => ev.doctorStatus === 'Aguardando').length;
  const inCareCount = hospitalEvals.filter(ev => ev.doctorStatus === 'Em Atendimento').length;
  const criticalCount = hospitalEvals.filter(ev => ['Emergência','Muito Urgente'].includes(ev.priority) && ev.doctorStatus !== 'Alta').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="page-header !mb-0">
        <div>
          <button onClick={() => setSelectedPatient(null)} className="inline-flex items-center gap-1 caption text-medic-600 hover:text-medic-700 mb-2 font-semibold">
            <ArrowLeft size={14} /> Voltar ao Dashboard
          </button>
          <h1 className="h1 flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-medic-100 text-medic-700 flex items-center justify-center"><Users size={22} /></span>
            Fila de Triagem · {hospital.name}
          </h1>
          <p className="body-lg mt-1">Consulte relatórios de triagem IA, confirme diagnósticos e emita altas digitais.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge badge-danger">{criticalCount} críticos</span>
          <span className="badge badge-primary">{waitingCount} em espera</span>
          {inCareCount > 0 && <span className="badge" style={{background:'var(--color-info-50)', color:'var(--color-info-700)', borderColor:'var(--color-info-200)'}}>{inCareCount} em atendimento</span>}
          <span className="badge badge-success"><CheckCircle2 size={12} /> Protocolo Manchester</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedPatient ? (
          <motion.div key="list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-5">
            {/* Filters */}
            <div className="card !p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input type="text" placeholder="Pesquisar paciente, sintoma ou município..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input input-icon w-full" />
                </div>
                <div className="flex gap-2">
                  <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="input !py-2 !w-auto">
                    <option value="Todas">Todas prioridades</option>
                    <option value="Emergência">Emergência</option>
                    <option value="Muito Urgente">M. Urgente</option>
                    <option value="Urgente">Urgente</option>
                    <option value="Moderado">Moderado</option>
                    <option value="Leve">Leve</option>
                  </select>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="input !py-2 !w-auto">
                    <option value="Aguardando">Em espera</option>
                    <option value="Em Atendimento">Em atendimento</option>
                    <option value="Alta">Com alta</option>
                    <option value="Todas">Todos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Patients list */}
            <div className="card !p-0 overflow-hidden">
              <div className="p-5 border-b border-ink-100 flex items-center justify-between">
                <h3 className="h5 flex items-center gap-2"><Users size={18} className="text-medic-600"/> Pacientes ({filteredEvals.length})</h3>
                <span className="caption">Ordenado por prioridade Manchester</span>
              </div>

              {filteredEvals.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><CheckCircle2 size={24} /></div>
                  <div className="text-sm font-semibold text-ink-700">Fila vazia</div>
                  <div className="caption mt-1">Os pacientes encaminhados pelo Dr.IA aparecerão aqui automaticamente.</div>
                </div>
              ) : (
                <div className="divide-y divide-ink-100">
                  {filteredEvals.map((ev, i) => {
                    const pc = PRIORITY_CONFIG[ev.priority] || PRIORITY_CONFIG['Moderado'];
                    const isDischarged = ev.doctorStatus === 'Alta';
                    return (
                      <motion.button key={ev.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedPatient(ev)}
                        className="w-full text-left p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-medic-50/50 transition-all group">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="avatar avatar-md shrink-0 !text-sm">{ev.patientName.charAt(0)}</div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-ink-900 text-sm">{ev.patientName}</span>
                              <span className="badge badge-default">{ev.patientAge ?? '?'}a · {ev.patientGender ?? '?'}</span>
                              <span className={`badge ${pc.cls}`}><span className={`w-1.5 h-1.5 rounded-full ${pc.dot} ${ev.priority === 'Emergência' ? 'animate-ping' : ''}`} />{pc.label}</span>
                              {isDischarged && <span className="badge badge-success">Alta</span>}
                            </div>
                            <p className="text-sm text-ink-600 mt-1 line-clamp-1">{ev.symptoms}</p>
                            <div className="flex items-center gap-3 mt-1 caption">
                              <span className="inline-flex items-center gap-1"><MapPin size={10} />{ev.patientMunicipality || '—'}</span>
                              <span className="inline-flex items-center gap-1"><Clock size={10} />Espera máx: {pc.maxWait}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {!isDischarged ? (
                            <span className="btn-primary btn-sm"><Activity size={12}/> Atender</span>
                          ) : (
                            <span className="btn-ghost btn-sm"><FileText size={12} /> Ver ficha</span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="workstation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 max-w-5xl mx-auto">
            {/* Workstation header */}
            <div className="card !p-4 flex items-center justify-between">
              <button onClick={() => setSelectedPatient(null)} className="btn-secondary btn-sm"><ArrowLeft size={13}/>Fechar</button>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="eyebrow-muted">Paciente em atendimento</div>
                  <div className="font-bold text-ink-900 text-sm">{selectedPatient.patientName}</div>
                </div>
                <div className="avatar avatar-lg">{selectedPatient.patientName.charAt(0)}</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 items-start">
              {/* Triage file */}
              <div className="card space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-ink-100">
                  <FileText size={18} className="text-medic-600"/>
                  <div>
                    <h3 className="h5 !text-sm">Ficha de Triagem</h3>
                    <div className="caption">Gerada por IA · Protocolo Manchester</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="card-flat !p-3">
                    <div className="cda-micro-label">Idade · Género</div>
                    <div className="text-sm font-semibold text-ink-900 mt-0.5">{selectedPatient.patientAge} anos · {selectedPatient.patientGender}</div>
                  </div>
                  <div className="card-flat !p-3">
                    <div className="cda-micro-label">Peso · Altura</div>
                    <div className="text-sm font-semibold text-ink-900 mt-0.5">{selectedPatient.patientWeight}kg · {selectedPatient.patientHeight}m</div>
                  </div>
                </div>

                <div>
                  <div className="cda-micro-label mb-1">Sintomas</div>
                  <div className="card-flat !p-3 text-sm text-ink-700 leading-relaxed max-h-32 overflow-y-auto">
                    {selectedPatient.symptoms}
                  </div>
                </div>

                <div className="card-flat !bg-medic-50/50 !border-medic-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-medic-600"/>
                    <span className="eyebrow">Parecer da IA</span>
                    <span className={`badge ${(PRIORITY_CONFIG[selectedPatient.priority] || PRIORITY_CONFIG.Moderado).cls} ml-auto`}>
                      {(PRIORITY_CONFIG[selectedPatient.priority] || PRIORITY_CONFIG.Moderado).label}
                    </span>
                  </div>
                  <p className="text-sm text-ink-700 leading-relaxed">{selectedPatient.aiSummary}</p>
                  <div className="text-xs font-semibold text-medic-700 pt-1 border-t border-medic-100">Especialidade: <b>{selectedPatient.suggestedSpecialty}</b></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  {[
                    { label: 'Alergias', v: selectedPatient.allergies || 'Nenhuma' },
                    { label: 'D. Crónicas', v: selectedPatient.diseases || 'Nenhuma' },
                    { label: 'Medicação', v: selectedPatient.medications || 'Nenhuma' },
                  ].map((x, i) => (
                    <div key={i} className="p-2 bg-ink-50 rounded-lg">
                      <div className="cda-micro-label">{x.label}</div>
                      <div className="font-semibold text-ink-800 mt-0.5 truncate">{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor Form */}
              <div className="card">
                {submitSuccess ? (
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring' }}
                      className="w-20 h-20 rounded-full bg-success-500 text-white flex items-center justify-center">
                      <CheckCircle2 size={40} />
                    </motion.div>
                    <div>
                      <h3 className="h3">Alta emitida!</h3>
                      <p className="body text-center mt-1 max-w-sm mx-auto">Prescrição e relatório digital enviados para o prontuário do cidadão.</p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmitAtendimento} className="space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-ink-100">
                      <ClipboardCheck size={18} className="text-success-600"/>
                      <div>
                        <h3 className="h5 !text-sm">Atendimento Clínico</h3>
                        <div className="caption">Diagnóstico, exames e alta digital</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="label-ds">Diagnóstico Clínico</label>
                        <input type="text" required placeholder="Ex: Malária por P. falciparum (gota espessa+)"
                          value={diagConfirmed} onChange={e => setDiagConfirmed(e.target.value)} className="input"/>
                      </div>
                      <div>
                        <label className="label-ds">Prioridade Manchester</label>
                        <select value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)} className="input">
                          <option value="Emergência">Emergência · Vermelho</option>
                          <option value="Muito Urgente">M. Urgente · Laranja</option>
                          <option value="Urgente">Urgente · Amarelo</option>
                          <option value="Moderado">Standard · Verde</option>
                          <option value="Leve">Não Urgente · Azul</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="label-ds">Exames Solicitados</label>
                      <div className="grid grid-cols-2 gap-2">
                        {DEFAULT_EXAMS.map(ex => {
                          const checked = examsChecked.includes(ex);
                          return (
                            <button type="button" key={ex} onClick={() => toggleExam(ex)}
                              className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                                checked ? 'bg-medic-50 border-medic-300 text-medic-700' : 'bg-white border-ink-200 text-ink-600 hover:border-ink-300'
                              }`}>
                              <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-medic-600 border-medic-600' : 'border-ink-300'}`}>
                                {checked && <CheckCircle2 size={10} className="text-white"/>}
                              </span>
                              <span className="truncate">{ex}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="label-ds">Prescrição e Observações</label>
                      <textarea required value={doctorObs} onChange={e => setDoctorObs(e.target.value)} rows={4}
                        placeholder="Medicamentos, dosagens, repouso, recomendações..." className="input resize-none"/>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full btn-lg">
                      {isSubmitting ? (<><RefreshCw size={16} className="animate-spin"/> A processar...</>) : (<>Assinar e Emitir Alta <CheckCircle2 size={16}/></>)}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

