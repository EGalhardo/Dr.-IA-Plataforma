/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Calendar, Clock, MapPin, Activity, ShieldCheck, ChevronDown, ChevronUp, CheckCircle, Award, Sparkles, User, AlertTriangle, MessageSquare, Pill } from 'lucide-react';
import { DriaEvaluation } from '../../types/dria';
import { useLanguage } from '../../hooks/useLanguage';

interface HistoricoConsultasContentProps {
  evaluations: DriaEvaluation[];
  setTab: (tab: string) => void;
}

export function HistoricoConsultasContent({ evaluations, setTab }: HistoricoConsultasContentProps) {
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Urgente' | 'Moderado' | 'Leve'>('Todos');

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getPriorityStyles = (p: string) => {
    switch (p) {
      case 'Emergência': return 'bg-red-50 border-red-200 text-red-700 font-extrabold animate-pulse';
      case 'Muito Urgente': return 'bg-orange-50 border-orange-200 text-orange-700 font-extrabold';
      case 'Urgente': return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'Moderado': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'Leve': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getPriorityDot = (p: string) => {
    switch (p) {
      case 'Emergência': return 'bg-red-500';
      case 'Muito Urgente': return 'bg-orange-500';
      case 'Urgente': return 'bg-rose-500';
      case 'Moderado': return 'bg-amber-500';
      case 'Leve': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  // Ordena do mais recente para o mais antigo (por submissionTime)
  const sortedEvaluations = [...evaluations].sort((a, b) => {
    const ta = a.submissionTime ? new Date(a.submissionTime.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3')).getTime() : 0;
    const tb = b.submissionTime ? new Date(b.submissionTime.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3')).getTime() : 0;
    return tb - ta;
  });

  // Mapeamento de prioridades — "Urgente" agrupa Emergência + Muito Urgente + Urgente (Protocolo vermelho/laranja/amarelo)
  const priorityGroup: Record<string, string[]> = {
    'Urgente': ['Emergência', 'Muito Urgente', 'Urgente'],
    'Moderado': ['Moderado'],
    'Leve': ['Leve'],
  };

  const filteredEvaluations = sortedEvaluations.filter(ev => {
    if (activeFilter === 'Todos') return true;
    return (priorityGroup[activeFilter] || [activeFilter]).includes(ev.priority);
  });

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-medic-900 to-medic-700 rounded-3xl p-6 text-white shadow-md flex items-center justify-between overflow-hidden relative">
        <div className="absolute right-0 bottom-0 top-0 w-1/4 opacity-10 flex items-center justify-center">
          <Activity size={120} />
        </div>
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase">Prontuário Médico Digital</span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">Histórico de Rastreios</h2>
          <p className="text-xs text-medic-100 leading-relaxed font-medium">
            Aceda centralizadamente a todas as suas triagens autónomas calculadas, relatórios remetidos a unidades de urgência e prescrições médicas ativas.
          </p>
        </div>
      </div>

      {/* Filtros de Urgência (Tabbar) */}
      <div className="bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-sm flex flex-wrap gap-1 md:gap-2">
        {(['Todos', 'Urgente', 'Moderado', 'Leve'] as const).map(filter => {
          const isActive = activeFilter === filter;
          const count = filter === 'Todos'
            ? sortedEvaluations.length
            : sortedEvaluations.filter(e => (priorityGroup[filter] || [filter]).includes(e.priority)).length;

          const getBadgeColor = (f: 'Todos' | 'Urgente' | 'Moderado' | 'Leve') => {
            if (f === 'Todos') return 'bg-slate-100 text-slate-700';
            if (f === 'Urgente') return 'bg-rose-100 text-rose-700';
            if (f === 'Moderado') return 'bg-amber-100 text-amber-700';
            return 'bg-emerald-100 text-emerald-700';
          };

          return (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setActiveFilter(filter);
                setExpandedId(null);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? filter === 'Todos' ? 'bg-medic-600 text-white shadow-sm' :
                    filter === 'Urgente' ? 'bg-danger-600 text-white shadow-sm' :
                    filter === 'Moderado' ? 'bg-warning-500 text-white shadow-sm' :
                    'bg-success-600 text-white shadow-sm'
                  : 'bg-transparent text-ink-600 hover:bg-ink-50'
              }`}
            >
              <span>
                {filter === 'Todos' ? 'Todos' :
                 filter === 'Urgente' ? 'Urgentes' :
                 filter === 'Moderado' ? 'Moderados' : 'Leves'}
              </span>
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold ${isActive ? 'bg-white/25 text-white' : getBadgeColor(filter)}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {sortedEvaluations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-12 px-6 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <FileText size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Histórico de consultas vazio</h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-normal">
                Ainda não efetuou nenhuma triagem clínica autónoma ou envio de prontuário para hospitais integrados.
              </p>
            </div>
            <button
              onClick={() => setTab('avaliacao-ia')}
              className="px-5 py-2 bg-medic-600 hover:bg-medic-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer shadow-sm mt-2"
            >
              Fazer Primeira Triagem IA
            </button>
          </div>
        ) : filteredEvaluations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-12 px-6 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <FileText size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Filtragem sem resultados</h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-normal">
                Não existem triagens classificadas como <b className="text-slate-700 uppercase">{activeFilter}</b> no seu histórico de rastreios.
              </p>
            </div>
          </div>
        ) : (
          filteredEvaluations.map((ev, i) => {
            const isExpanded = expandedId === ev.id;
            const formattedDate = ev.submissionTime ? ev.submissionTime.split(' ')[0] : '14/06/2026';

            return (
              <div
                key={ev.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-sm overflow-hidden transition-all"
              >
                {/* Header Summary Row */}
                <div
                  role="button"
                  onClick={() => toggleExpand(ev.id)}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/40"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                      <FileText size={18} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                          Triagem autónoma DR.IA
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1 ${getPriorityStyles(ev.priority)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(ev.priority)}`} />
                          {ev.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold truncate max-w-xs md:max-w-lg">
                        Sintoma: {ev.symptoms}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between border-t sm:border-0 pt-2 sm:pt-0 border-slate-50">
                    <div className="text-right flex items-center gap-3 sm:block">
                      <div className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-1 justify-end">
                        <Calendar size={11} /> {formattedDate}
                      </div>
                      <div className="text-[9.5px] text-slate-500 font-bold mt-0.5">
                        Estado: <span className={`font-black uppercase tracking-tight ${ev.doctorStatus === 'Alta' ? 'text-emerald-600' : 'text-blue-600 animate-pulse'}`}>{ev.doctorStatus}</span>
                      </div>
                    </div>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-slate-100 bg-slate-50/20"
                    >
                      <div className="p-5 space-y-5 text-xs font-bold text-slate-600 leading-relaxed">
                        
                        {/* 1. Clinical inputs / vitals */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 border border-slate-150 rounded-xl shadow-sm">
                          <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Idade / Género</span>
                            <span className="text-xs font-black text-slate-800 mt-0.5 block">{ev.patientAge} anos / {ev.patientGender}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Peso / Altura</span>
                            <span className="text-xs font-black text-slate-800 mt-0.5 block">{ev.patientWeight} Kg / {ev.patientHeight} m</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Município / Local</span>
                            <span className="text-xs font-black text-slate-800 mt-0.5 block">{ev.patientMunicipality}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Contacto Emergência</span>
                            <span className="text-xs font-black text-slate-800 mt-0.5 block">{ev.emergencyContact || 'Não informado'}</span>
                          </div>
                        </div>

                        {/* 2. Symptom breakdown */}
                        <div className="space-y-1">
                          <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider block">Descrição Sintomática</span>
                          <p className="p-3 bg-white border border-slate-150 rounded-xl font-semibold text-slate-700">
                            {ev.symptoms}
                          </p>
                        </div>

                        {/* 3. AI Triage Summary */}
                        <div className="space-y-3 p-4 bg-medic-50/60 border border-medic-100 rounded-xl">
                          <h4 className="text-[10px] text-medic-900 font-black uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles size={13} className="text-medic-600 animate-pulse" /> Parecer Autónomo Dr.IA
                          </h4>
                          <p className="text-ink-700 font-semibold bg-white p-3 rounded-xl border border-medic-100/50 shadow-sm">
                            {ev.aiSummary}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-bold">
                            <div>
                              <span className="text-[9px] text-medic-900 font-black uppercase block">Especialidade Recomendada</span>
                              <span className="text-ink-800 font-black">{ev.suggestedSpecialty}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-medic-900 font-black uppercase block">Principais Suspeitas</span>
                              <span className="text-ink-800 font-extrabold">{ev.possibleCauses.join(', ')}</span>
                            </div>
                          </div>
                        </div>

                        {/* 4. Submission hospital info */}
                        <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                          <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin size={13} className="text-red-500" /> Trânsito Hospitalar
                          </h4>
                          {ev.submittedHospitalId ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-700 font-extrabold">
                              <span>Prontuário integrado no <b className="text-slate-900 uppercase font-black">{ev.submittedHospitalName}</b></span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border rounded text-[10px] font-bold">
                                Transmitido: {ev.submissionTime}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-slate-500 font-semibold">
                              <span>Relatório mantido localmente. Não enviado para o hospital.</span>
                              <button
                                onClick={() => setTab('hospitais')}
                                className="px-3 py-1 bg-medic-600 hover:bg-medic-700 text-white font-black text-[9.5px] uppercase tracking-wider rounded-lg cursor-pointer"
                              >
                                Escolher Hospital
                              </button>
                            </div>
                          )}
                        </div>

                        {/* 5. Doctor Feedback Section (Dr.IA Hospital Connection!) */}
                        {ev.doctorStatus === 'Alta' || ev.doctorConfirmedDiagnosis || ev.doctorObservations ? (
                          <div className="p-4 bg-emerald-50/30 border border-emerald-200/80 rounded-xl space-y-3 shadow-sm">
                            <h4 className="text-[10.5px] text-emerald-800 font-black uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck size={14} className="text-emerald-600" /> Parecer Médico do Hospital (Prescrição e Diagnóstico)
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1 bg-white p-3 rounded-lg border border-emerald-100">
                                <span className="text-[9px] text-emerald-800 font-black uppercase block">Diagnóstico Clínico Confirmado</span>
                                <p className="text-xs font-extrabold text-slate-800">
                                  {ev.doctorConfirmedDiagnosis || 'Confirmado conforme triagem preliminar autónoma.'}
                                </p>
                              </div>

                              <div className="space-y-1 bg-white p-3 rounded-lg border border-emerald-100">
                                <span className="text-[9px] text-emerald-800 font-black uppercase block">Exames Complementares Efetuados</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {ev.doctorExams && ev.doctorExams.length > 0 ? (
                                    ev.doctorExams.map((ex, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9.5px] font-bold uppercase">
                                        {ex}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-slate-400 text-[10.5px]">Nenhum exame adicional associado.</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1 bg-white p-3 rounded-lg border border-emerald-100">
                              <span className="text-[9px] text-emerald-800 font-black uppercase block flex items-center gap-1">
                                <Pill size={12} className="text-emerald-600" /> Prescrição & Recomendações de Alta
                              </span>
                              <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                                {ev.doctorObservations || 'Paciente recebeu alta clínica. Recomenda-se repouso e hidratação oral contínua.'}
                              </p>
                            </div>
                          </div>
                        ) : ev.submittedHospitalId ? (
                          <div className="p-4 bg-blue-50/25 border border-blue-200 rounded-xl flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                            <div className="text-slate-700 font-semibold">
                              <span>Prontuário na fila de admissão hospitalar. Aguardando atendimento médico presencial no <b>{ev.submittedHospitalName}</b>.</span>
                            </div>
                          </div>
                        ) : null}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
