/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, AlertCircle, CheckCircle, Clock, TrendingUp, ShieldAlert, ChevronRight, Activity, Hospital, Stethoscope, HeartPulse } from 'lucide-react';
import { DriaEvaluation, DriaHospital } from '../../types/dria';
import { useLanguage } from '../../hooks/useLanguage';
import { INST_HIGHLIGHT_SLIDES } from '../../constants/data';
import { LazyImage } from '../ui/LazyImage';

interface HospitalDashboardContentProps {
  evaluations: DriaEvaluation[];
  hospital: DriaHospital;
  setTab: (tab: string) => void;
  setSelectedPatient: (patient: DriaEvaluation | null) => void;
}

export function HospitalDashboardContent({
  evaluations,
  hospital,
  setTab,
  setSelectedPatient
}: HospitalDashboardContentProps) {
  const { t } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const slides = INST_HIGHLIGHT_SLIDES;
  const currentSlide = slides[activeSlide % slides.length];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % INST_HIGHLIGHT_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter evaluations submitted to this specific hospital (id + name fallback)
  const hospitalEvals = evaluations.filter(ev =>
    ev.submittedHospitalId === hospital.id ||
    (hospital.name && ev.submittedHospitalName === hospital.name)
  );

  const totalReceived = hospitalEvals.length;
  const awaitingCount = hospitalEvals.filter(ev => ev.doctorStatus === 'Aguardando').length;
  const attendingCount = hospitalEvals.filter(ev => ev.doctorStatus === 'Em Atendimento').length;
  const dischargedCount = hospitalEvals.filter(ev => ev.doctorStatus === 'Alta').length;

  const emergencyCount = hospitalEvals.filter(ev => ev.priority === "Emergência" && ev.doctorStatus !== "Alta").length;
  const newAlertsCount = 0;
  const urgentCount = hospitalEvals.filter(ev => ev.priority === 'Urgente' && ev.doctorStatus !== 'Alta').length;
  const inCareCount = attendingCount;

  // Casos críticos = Emergência + Muito Urgente + Urgente (Protocolo Vermelho/Amarelo)
  const urgentCases = hospitalEvals.filter(
    ev => ['Emergência', 'Muito Urgente', 'Urgente'].includes(ev.priority) && ev.doctorStatus !== 'Alta'
  );

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* 1. Hero Slideshow Hospitalar */}
      <section className="relative h-[340px] sm:h-[400px] md:h-[480px] rounded-3xl overflow-hidden shadow-xl border border-ink-100 bg-medic-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={`hospital-${activeSlide}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <LazyImage
              src={currentSlide.image}
              alt={t(currentSlide.title)}
              priority={true}
              placeholder="skeleton"
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center',
              }}
              className="w-full h-full"
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlays em azul-médico para harmonia */}
        <div className="absolute inset-0 bg-gradient-to-t from-medic-900/80 via-medic-900/25 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-medic-900/50 via-transparent to-transparent pointer-events-none" />

        {/* Badge topo */}
        <div className="absolute top-4 left-4 sm:top-5 sm:left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white">
          <Stethoscope size={13} className="text-medic-200" />
          <span className="text-[10px] font-black tracking-widest uppercase">Painel Hospitalar</span>
        </div>

        {/* Contador de slide */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-6 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md text-[10px] font-black text-white/90 tracking-wider">
          {String((activeSlide % slides.length) + 1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}
        </div>

        {/* Conteúdo sobreposto */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-9 text-white pointer-events-none">
          <motion.div key={`hosp-slide-text-${activeSlide}`} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger-500/90 text-[9px] font-black tracking-widest uppercase mb-3 shadow-md">
              <HeartPulse size={11} className="animate-pulse" />
              {activeSlide % 2 === 0 ? 'Operação em Tempo Real' : 'Sistema Dr.IA Activo'}
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase italic tracking-tight leading-tight drop-shadow-lg max-w-xl">
              {t(currentSlide.title)}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-white/85 leading-relaxed font-medium max-w-lg drop-shadow">
              {t(currentSlide.subtitle)}
            </p>
            {currentSlide.btn && currentSlide.action && (
              <button onClick={() => setTab(currentSlide.action!)}
                className="pointer-events-auto mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-medic-800 text-[11px] font-black uppercase tracking-wider shadow-lg hover:bg-medic-50 transition-all hover:scale-[1.02] active:scale-[0.98]">
                {t(currentSlide.btn)} <ChevronRight size={14} />
              </button>
            )}
          </motion.div>
        </div>

        {/* Indicadores (dots) */}
        <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-6 flex gap-1.5 items-center">
          {slides.map((_, i) => {
            const active = activeSlide % slides.length === i;
            return (
              <button key={i} onClick={() => setActiveSlide(i)} aria-label={`Slide ${i+1}`}
                className={`transition-all duration-500 rounded-full ${active ? 'w-7 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`} />
            );
          })}
        </div>
      </section>

      {/* Clinic Header Welcome */}

      {/* Clinic Header Welcome */}
      <div className="bg-gradient-to-r from-medic-900 to-medic-700 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="max-w-xl space-y-1.5 relative z-10">
          <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase">Canal Hospitalar DR.IA</span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">
            {hospital.name}
          </h2>
          <p className="text-xs text-medic-100 leading-relaxed font-semibold">
            Painel Geral de triagens de entrada. Monitorize e atenda admissões direcionadas por IA com base no Protocolo Clínico de Manchester.
          </p>
        </div>
        <div className="px-4 py-2.5 bg-medic-950/50 border border-medic-600/60 rounded-2xl flex items-center gap-3 shrink-0 relative z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-[10px] font-black uppercase tracking-wider text-medic-100">
            Sincronização DR.IA: <span className="text-emerald-300 font-extrabold">{hospital.integrationState}</span>
          </div>
        </div>
      </div>

      {/* KPI Indicators — 4 cartões sincronizados em tempo real */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Triagens Recebidas */}
        <div className="dria-lift bg-white border border-ink-200/80 rounded-2xl p-4 shadow-sm relative overflow-hidden group cursor-default">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-medic-600 to-medic-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-medic-50 text-medic-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Users size={20} />
            </div>
            <div>
              <span className="text-[8.5px] text-ink-400 font-black uppercase tracking-wider block">Triagens</span>
              <span className="text-xl font-black text-ink-900 leading-none mt-0.5 block">{totalReceived}</span>
            </div>
          </div>
        </div>

        {/* Em Atendimento */}
        <div className="dria-lift bg-white border border-ink-200/80 rounded-2xl p-4 shadow-sm relative overflow-hidden group cursor-default">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-info-500 to-info-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-info-50 text-info-600 flex items-center justify-center shrink-0 relative group-hover:scale-110 transition-transform duration-300">
              <Stethoscope size={20} />
            </div>
            <div>
              <span className="text-[8.5px] text-ink-400 font-black uppercase tracking-wider block">Em Atendimento</span>
              <span className="text-xl font-black text-info-600 leading-none mt-0.5 block">{inCareCount}</span>
            </div>
          </div>
        </div>

        {/* Urgências Pendentes */}
        <div className="dria-lift bg-white border border-ink-200/80 rounded-2xl p-4 shadow-sm relative overflow-hidden group cursor-default">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-danger-500 to-danger-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-danger-50 text-danger-600 flex items-center justify-center shrink-0 relative group-hover:scale-110 transition-transform duration-300">
              <AlertCircle size={20} />
              {emergencyCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger-500 rounded-full animate-ping" />}
            </div>
            <div>
              <span className="text-[8.5px] text-ink-400 font-black uppercase tracking-wider block">Urgências</span>
              <span className="text-xl font-black text-danger-600 leading-none mt-0.5 block">{urgentCount + emergencyCount}</span>
            </div>
          </div>
        </div>

        {/* Altas Emitidas */}
        <div className="dria-lift bg-white border border-ink-200/80 rounded-2xl p-4 shadow-sm relative overflow-hidden group cursor-default">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-success-500 to-success-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-success-50 text-success-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle size={20} />
            </div>
            <div>
              <span className="text-[8.5px] text-ink-400 font-black uppercase tracking-wider block">Altas</span>
              <span className="text-xl font-black text-success-600 leading-none mt-0.5 block">{dischargedCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-stretch">
        
        {/* Left Card: High Priority Queue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-rose-500" size={16} />
              <h3 className="text-slate-900 font-black text-xs md:text-sm italic tracking-tighter uppercase leading-none">
                Urgências Clínicas Críticas (Protocolo Vermelho)
              </h3>
            </div>
            <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 text-[8.5px] font-black rounded-lg">Prio Máxima</span>
          </div>

          <div className="flex-1 space-y-3 min-h-[180px] overflow-y-auto max-h-[250px] pr-1">
            {urgentCases.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400 text-center space-y-1.5">
                <CheckCircle size={28} className="text-emerald-500" />
                <p className="text-[10.5px] font-black uppercase tracking-wider text-slate-800">Sem urgências críticas pendentes</p>
                <p className="text-[10px]">Tudo sob controlo na fila de Manchester neste momento.</p>
              </div>
            ) : (
              urgentCases.map(uc => (
                <div
                  key={uc.id}
                  onClick={() => {
                    setSelectedPatient(uc);
                    setTab('hospital-pacientes');
                  }}
                  className="p-3 bg-rose-50/35 border border-rose-150 hover:bg-rose-50/60 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-black">
                      {uc.patientName[0]}
                    </div>
                    <div className="text-left space-y-0.5">
                      <h4 className="text-[11.5px] font-extrabold text-slate-900 uppercase tracking-tight">{uc.patientName}</h4>
                      <p className="text-[10.5px] text-slate-500 line-clamp-1">Sintoma: {uc.symptoms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-white text-rose-700 text-[8.5px] font-black uppercase rounded-lg border border-rose-100 shrink-0">
                      Viana
                    </span>
                    <ChevronRight size={14} className="text-rose-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setTab('hospital-pacientes')}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-xl border border-slate-200 text-center cursor-pointer mt-2"
          >
            Aceder à Lista Completa de Pacientes
          </button>
        </div>

        {/* Right Card: Clinical Guidelines or Stats */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-1.5">
            <h3 className="text-slate-900 font-black text-xs md:text-sm italic tracking-tighter uppercase leading-none">
              Instruções de Admissão DR.IA
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              O sistema automatiza a receção dos prontuários médicos. Quando um paciente de Luanda ou outra província preenche os sintomas no portal "Cidadão" e envia o relatório:
            </p>
          </div>

          <div className="space-y-3 pt-2 text-left text-xs text-ink-600 font-semibold leading-relaxed">
            <div className="flex gap-2.5 items-start">
              <div className="w-5 h-5 rounded-full bg-medic-100 text-medic-700 font-black text-[9.5px] flex items-center justify-center shrink-0">1</div>
              <p>O paciente aparece instantaneamente listado no separador de <b>Pacientes</b> sob triagem clínica.</p>
            </div>
            <div className="flex gap-2.5 items-start">
              <div className="w-5 h-5 rounded-full bg-medic-100 text-medic-700 font-black text-[9.5px] flex items-center justify-center shrink-0">2</div>
              <p>O médico visualiza o sumário gerado por IA, que cruza dados de canais epidemiológicos regionais.</p>
            </div>
            <div className="flex gap-2.5 items-start">
              <div className="w-5 h-5 rounded-full bg-medic-100 text-medic-700 font-black text-[9.5px] flex items-center justify-center shrink-0">3</div>
              <p>O médico confirma o diagnóstico, preenche as observações de prescrição, e emite a alta. O utente recebe tudo na hora!</p>
            </div>
          </div>

          <div className="pt-3 border-t border-ink-100 flex items-center gap-2 justify-center">
            <Activity className="text-medic-600 shrink-0" size={14} />
            <span className="text-[10px] text-medic-600 font-black uppercase tracking-widest">Atendimento Integrado Activo</span>
          </div>
        </div>

      </div>

    </div>
  );
}
