/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Search, Download, Calendar, Tag, ShieldCheck, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { DriaEvaluation, DriaHospital } from '../../types/dria';
import { useLanguage } from '../../hooks/useLanguage';

interface HospitalHistoricoContentProps {
  evaluations: DriaEvaluation[];
  hospital: DriaHospital;
}

export function HospitalHistoricoContent({ evaluations, hospital }: HospitalHistoricoContentProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Histórico: avaliações encaminhadas a ESTE hospital que já tiveram alta
  const hospId = hospital?.id;
  const hospName = (hospital?.name || '').toLowerCase().trim();
  const belongsToHospital = (ev: any) => {
    if (!hospId) return true;
    if (ev.submittedHospitalId === hospId) return true;
    if (hospName && ev.submittedHospitalName && ev.submittedHospitalName.toLowerCase().trim() === hospName) return true;
    if (hospId === 'h-fallback' || hospId === 'h1') return !ev.submittedHospitalId;
    return false;
  };

  const hospitalHistory = evaluations.filter(
    ev => ev.doctorStatus === 'Alta' && belongsToHospital(ev)
  );

  const q = searchQuery.toLowerCase().trim();
  const filteredHistory = hospitalHistory.filter(ev => {
    if (!q) return true;
    const name = (ev.patientName || '').toLowerCase();
    const diag = (ev.doctorConfirmedDiagnosis || '').toLowerCase();
    const muni = (ev.patientMunicipality || '').toLowerCase();
    return name.includes(q) || diag.includes(q) || muni.includes(q);
  });

  const triggerDownload = (patientName: string) => {
    alert(`Preparando a exportação do Relatório Clínico Digital para: ${patientName}. Descarregando PDF assinado digitalmente pelo Hospital.`);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-medic-900 to-medic-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 flex items-center justify-center">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase">Arquivo Clínico Hospitalar</span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">Histórico de Altas</h2>
          <p className="text-xs text-medic-100 leading-relaxed font-semibold">Prontuários arquivados e pacientes com alta clínica concluída nesta unidade hospitalar.</p>
        </div>
      </div>
      
      {/* Filters Search header */}
      <div className="bg-white border border-ink-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="flex-1 flex items-center gap-2 border border-ink-200 focus-within:border-medic-500 rounded-xl px-3 py-2 bg-ink-50/50">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar por paciente, diagnóstico ou município..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
          />
        </div>
      </div>

      {/* History Table/List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" /> Prontuários Arquivados ({filteredHistory.length})
          </h3>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Arquivo Histórico Médico</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredHistory.length === 0 ? (
            <div className="dria-empty bg-white">
              <div className="dria-empty-icon"><FileText size={32} /></div>
              <h4>Histórico Vazio</h4>
              <p>Não há pacientes com alta clínica arquivada. O histórico será preenchido à medida que os médicos emitirem altas.</p>
            </div>
          ) : (
            filteredHistory.map(ev => {
              const admissionDate = ev.submissionTime ? ev.submissionTime.split(' ')[0] : '14/06/2026';
              return (
                <div
                  key={ev.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/5040 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">
                          {ev.patientName}
                        </h4>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold">
                          {ev.patientAge} anos
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-wider">
                          Alta Concluída
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-bold">
                        <span className="text-slate-400 font-semibold uppercase text-[9.5px]">Diagnóstico:</span> {ev.doctorConfirmedDiagnosis}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                        Prescrição: {ev.doctorObservations}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-none pt-2 sm:pt-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-[9.5px] text-slate-400 font-extrabold uppercase flex items-center gap-1 justify-end">
                        <Calendar size={11} /> Tratado em: {admissionDate}
                      </div>
                      <div className="text-[10px] text-slate-500 font-black uppercase mt-1">
                        Origem: <b className="text-slate-700">{ev.patientMunicipality}</b>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => triggerDownload(ev.patientName)} aria-label="Exportar prontuário"
                      className="p-2 bg-ink-100 hover:bg-medic-50 border border-ink-200 hover:border-medic-300 text-ink-600 hover:text-medic-600 rounded-xl cursor-pointer transition-colors"
                      title="Exportar Prontuário Clínico"
                    >
                      <Download size={14} />
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
