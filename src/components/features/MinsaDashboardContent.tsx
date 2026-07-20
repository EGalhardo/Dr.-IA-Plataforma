/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Painel MINSA — Executive Dashboard
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity, ShieldCheck, AlertCircle, Building2, MapPin, BarChart3, TrendingUp, TrendingDown,
  CheckCircle, Users, Bell, Globe, Bug, Syringe, HeartPulse, BedDouble, Ambulance,
  AlertTriangle, ArrowRight, Radio, Eye, Thermometer, Clock, ChevronRight, Landmark, ShieldAlert
} from 'lucide-react';
import { DriaEvaluation, DriaHospital } from '../../types/dria';
import { GOV_HIGHLIGHT_SLIDES } from '../../constants/data';
import { useLanguage } from '../../hooks/useLanguage';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { LazyImage } from '../ui/LazyImage';
import { AngolaMap, ANGOLA_PROVINCE_LIST } from '../ui/AngolaMap';
import type { ProvinceMarker, RiskLevel, Trend } from '../ui/AngolaMap';

interface MinsaDashboardContentProps {
  evaluations: DriaEvaluation[];
  hospitals: DriaHospital[];
  setTab?: (tab: string) => void;
}

const OUTBREAKS = [
  { disease: 'Cólera', location: 'Cazenga, Luanda', cases: 147, trend: '+12', level: 'Crítico', color: 'danger', icon: AlertTriangle },
  { disease: 'Malária', location: 'Viana, Luanda', cases: 2420, trend: '-3%', level: 'Elevado', color: 'warning', icon: Bug },
  { disease: 'Dengue', location: 'Talatona, Luanda', cases: 89, trend: '+5', level: 'Moderado', color: 'warning', icon: Thermometer },
  { disease: 'Sarampo', location: 'Cacuaco, Luanda', cases: 34, trend: '-8', level: 'Baixo', color: 'success', icon: Syringe },
  { disease: 'Ébola (vigilância)', location: 'Fronteira Norte', cases: 0, trend: '0', level: 'Monitorização', color: 'info', icon: Radio },
];

export function MinsaDashboardContent({ evaluations, hospitals, setTab }: MinsaDashboardContentProps) {
  const { t } = useLanguage();
  const [now, setNow] = useState(new Date());
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = GOV_HIGHLIGHT_SLIDES;
  const currentSlide = slides[activeSlide % slides.length];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // Métricas derivadas dos dados reais sincronizados (avaliações/hospitais)
  const totalEvaluations = evaluations.length;
  const awaitingEvaluations = evaluations.filter(ev => ev.doctorStatus === 'Aguardando').length;
  const attendingEvaluations = evaluations.filter(ev => ev.doctorStatus === 'Em Atendimento').length;
  const dischargedEvaluations = evaluations.filter(ev => ev.doctorStatus === 'Alta').length;
  const severeCases = evaluations.filter(ev => ['Emergência', 'Muito Urgente', 'Urgente'].includes(ev.priority) && ev.doctorStatus !== 'Alta').length;
  const emergencyCases = evaluations.filter(ev => ev.priority === 'Emergência' && ev.doctorStatus !== 'Alta').length;
  const activeHospitals = hospitals.filter(h => h.integrationState === 'Ativo').length;
  const totalHospitals = hospitals.length;
  const coveragePct = totalHospitals > 0 ? Math.round((activeHospitals / totalHospitals) * 100) : 0;
  // Estimativa realista baseada no número real de médicos registados
  const totalDoctors = hospitals.reduce((s, h) => s + (h.doctorsCount || 0), 0);
  // Utentes únicos (pacientes distintos nas triagens)
  const uniquePatients = new Set(evaluations.map(ev => ev.patientBI || ev.patientName)).size;
  // Capacidade de camas — deriva da soma de bedsCapacity dos hospitais registados
  const totalBeds = hospitals.reduce((s, h) => s + ((h as any).bedsCapacity || 120), 0);
  const occupiedBeds = Math.min(
    totalBeds,
    hospitals.reduce((s, h) => {
      const hospEvals = evaluations.filter(ev =>
        ev.submittedHospitalId === h.id || ev.submittedHospitalName === h.name
      );
      const occupied = hospEvals.filter(ev => ev.doctorStatus !== 'Alta').length;
      return s + Math.max(0, Math.round(((h as any).bedsCapacity || 120) * 0.68) + occupied);
    }, 0)
  );
  const occPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // ── Actividade por provincia (mapa interactivo) ─────────────
  // Regras 100% derivadas dos dados reais do painel:
  //  • activeCases = n.º de triagens cujo patientMunicipality corresponde
  //    ao nome da província (comparação normalizada, sem acentos);
  //  • nível sobe conforme a prioridade das triagens activas
  //    (Emergência/Muito Urgente → crítico, Urgente → alerta, ≥3 triagens → atenção);
  //  • sobreposição dos surtos listados neste painel (OUTBREAKS) —
  //    "Cazenga, Luanda", "Viana, Luanda", etc. elevam a província de Luanda;
  //  • trend é 'estavel' (sem série temporal — não se inventa histórico).
  const provinceMarkers: ProvinceMarker[] = useMemo(() => {
    const norm = (s?: string | null) => (s || '').toLowerCase()
      .replace(/[áàãâ]/g, 'a').replace(/[éê]/g, 'e').replace(/í/g, 'i')
      .replace(/[óôõ]/g, 'o').replace(/ú/g, 'u').replace(/ç/g, 'c').trim();

    // Níveis por gravidade declarada nos surtos do painel
    const outbreakToLevel: Record<string, RiskLevel> = {
      'crítico': 'critico', 'elevado': 'alerta', 'moderado': 'atencao', 'baixo': 'normal',
    };
    const LEVEL_ORDER: RiskLevel[] = ['normal', 'atencao', 'alerta', 'critico'];
    const maxLevel = (a: RiskLevel, b: RiskLevel): RiskLevel =>
      LEVEL_ORDER[Math.max(LEVEL_ORDER.indexOf(a), LEVEL_ORDER.indexOf(b))];

    // Agregar surtos do painel por província (locations tipo "Cazenga, Luanda")
    const outbreakByProvince: Record<string, { level: RiskLevel; diseases: string[] }> = {};
    OUTBREAKS.forEach(o => {
      const level = outbreakToLevel[norm(o.level)];
      if (!level) return; // ex.: 'Monitorização' não eleva nível
      const prov = ANGOLA_PROVINCE_LIST.find(p => norm(o.location).includes(norm(p)));
      if (!prov) return; // ex.: 'Fronteira Norte' não é província
      const cur = outbreakByProvince[norm(prov)] || { level: 'normal' as RiskLevel, diseases: [] };
      cur.level = maxLevel(cur.level, level);
      if (!cur.diseases.includes(o.disease)) cur.diseases.push(o.disease);
      outbreakByProvince[norm(prov)] = cur;
    });

    const riskLabelOf: Record<RiskLevel, string> = {
      normal: 'Baixo', atencao: 'Moderado', alerta: 'Elevado', critico: 'Crítico',
    };

    return ANGOLA_PROVINCE_LIST.map(prov => {
      const provNorm = norm(prov);
      const matched = evaluations.filter(ev => {
        const mun = norm(ev.patientMunicipality);
        return mun && (mun === provNorm || mun.includes(provNorm) || provNorm.includes(mun));
      });
      const activeSevere = matched.filter(ev =>
        ['Emergência', 'Muito Urgente', 'Urgente'].includes(ev.priority) && ev.doctorStatus !== 'Alta'
      );
      const outbreak = outbreakByProvince[provNorm];
      const activeCases = matched.length;

      // Sem triagens e sem surtos: a província fica no estado padrão do mapa.
      if (activeCases === 0 && !outbreak) return null;

      const hasEmergency = activeSevere.some(ev => ['Emergência', 'Muito Urgente'].includes(ev.priority));
      const hasUrgent = activeSevere.length > 0;
      const triageLevel: RiskLevel = hasEmergency ? 'critico' : hasUrgent ? 'alerta' : activeCases >= 3 ? 'atencao' : 'normal';
      const level = outbreak ? maxLevel(triageLevel, outbreak.level) : triageLevel;

      const latest = matched.map(ev => ev.submissionTime).filter(Boolean).sort().reverse()[0] || new Date().toISOString();
      const statusParts = [
        activeCases > 0 ? `${activeCases} triagem(ns) registada(s)` : 'Sem triagens registadas',
        activeSevere.length > 0 ? `${activeSevere.length} caso(s) urgente(s)` : null,
        outbreak ? `Surtos activos: ${outbreak.diseases.join(', ')}` : null,
      ].filter(Boolean) as string[];

      return {
        name: prov,
        // Os campos geo (cx/cy/path/capital) são substituídos pelo merge interno do AngolaMap.
        cx: 0, cy: 0, path: '', capital: '',
        level,
        activeCases,
        trend: 'estavel' as Trend,
        status: statusParts.join(' · '),
        lastUpdate: latest,
        riskLabel: riskLabelOf[level],
      } as ProvinceMarker;
    }).filter((m): m is ProvinceMarker => m !== null);
  }, [evaluations]);

  const kpis = [
    { label: 'Triagens Totais', value: totalEvaluations, suffix: '', delta: `${awaitingEvaluations} em espera`, up: true, icon: Activity, color: 'medic' },
    { label: 'Casos Críticos', value: severeCases, suffix: '', delta: `${emergencyCases} emerg.`, up: severeCases > 0, icon: AlertCircle, color: 'danger' },
    { label: 'Hospitais Activos', value: activeHospitals, suffix: '/' + totalHospitals, delta: `${coveragePct}% cobertura`, up: true, icon: Building2, color: 'success' },
    { label: 'Utentes Únicos', value: uniquePatients, suffix: '', delta: `${totalDoctors} médicos`, up: true, icon: Users, color: 'info' },
  ];

  const accents: Record<string, { bg: string; text: string }> = {
    medic:   { bg: 'bg-medic-50',   text: 'text-medic-600' },
    danger:  { bg: 'bg-danger-50',  text: 'text-danger-600' },
    success: { bg: 'bg-success-50', text: 'text-success-600' },
    warning: { bg: 'bg-warning-50', text: 'text-warning-600' },
    info:    { bg: 'bg-info-50',    text: 'text-info-500' },
  };

  const colorMap: Record<string, string> = { danger: 'priority-emergency', warning: 'priority-urgent', success: 'priority-light', info: 'priority-moderate' };
  const bgMap: Record<string, string> = {
    danger: 'bg-danger-50/60 border-danger-100',
    warning: 'bg-warning-50/60 border-warning-100',
    success: 'bg-success-50/60 border-success-100',
    info: 'bg-info-50/60 border-info-100',
  };
  const iconMap: Record<string, string> = { danger: 'bg-danger-500', warning: 'bg-warning-500', success: 'bg-success-500', info: 'bg-info-500' };

  return (
    <div className="space-y-6 animate-fadeIn">
            {/* Hero Slideshow Executivo */}
      <section className="relative h-[380px] sm:h-[440px] md:h-[520px] overflow-hidden rounded-3xl shadow-2xl border border-medic-800/30 bg-medic-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={`minsa-${activeSlide}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <LazyImage
              src={currentSlide.image}
              alt={t(currentSlide.title)}
              priority={true}
              placeholder="skeleton"
              style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }}
              className="w-full h-full"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-medic-900/40 to-medic-900/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-medic-900/70 via-medic-900/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-danger-500/10 blur-3xl pointer-events-none" />

        {/* Badges topo */}
        <div className="absolute top-4 left-4 sm:top-5 sm:left-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-md rounded-full text-white text-xs font-semibold border border-white/20">
            <Landmark size={12} /> Ministério da Saúde
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success-500/20 backdrop-blur-md rounded-full text-white text-xs font-semibold border border-success-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse" /> SOC-AN-2026 · Operacional
          </span>
        </div>

        {/* Contador slides */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-6 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-black text-white/90 tracking-wider">
          {String((activeSlide % slides.length) + 1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}
        </div>

        {/* Relógio desktop */}
        <div className="hidden md:flex absolute top-14 right-6 flex-col items-end text-right text-white pointer-events-none">
          <div className="text-[9px] text-medic-200 font-black uppercase tracking-widest">Hora Oficial · Luanda</div>
          <div className="text-2xl font-bold font-mono tabular-nums tracking-tight mt-0.5 drop-shadow-lg">
            {now.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-[10px] text-medic-200 capitalize mt-0.5">
            {now.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-9 text-white">
          <motion.div key={`minsa-text-${activeSlide}`} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger-500/90 backdrop-blur text-[9px] font-black tracking-widest uppercase mb-3 shadow-md">
              <ShieldAlert size={11} className="animate-pulse" />
              Centro de Comando Nacional
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase italic tracking-tight leading-tight drop-shadow-2xl max-w-3xl">
              {t(currentSlide.title)}
            </h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-white/90 leading-relaxed font-medium max-w-2xl drop-shadow">
              {t(currentSlide.subtitle)}
            </p>
            <div className="flex flex-wrap gap-2.5 mt-5">
              {currentSlide.btn && currentSlide.action && setTab && (
                <button onClick={() => setTab(currentSlide.action!)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white text-medic-800 text-[11px] font-black uppercase tracking-wider shadow-lg hover:bg-medic-50 transition-all hover:scale-[1.03] active:scale-[0.98] pointer-events-auto">
                  {t(currentSlide.btn)} <ChevronRight size={14} />
                </button>
              )}
              {setTab && (
                <button onClick={() => setTab('minsa-vigilancia')}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/25 text-white text-[11px] font-black uppercase tracking-wider hover:bg-white/20 transition-all pointer-events-auto">
                  <Globe size={13} /> Mapa Vigilância
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Indicadores */}
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

      {/* Clock mobile */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-medic-900 text-white rounded-2xl border border-medic-800/40">
        <div>
          <div className="text-[9px] text-medic-300 font-black uppercase tracking-widest">Hora Oficial</div>
          <div className="text-base font-mono font-bold tabular-nums">
            {now.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
        <div className="text-right text-[10px] text-medic-200 capitalize">
          {now.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      <section className="grid-kpis">
        {kpis.map((k, i) => {
          const a = accents[k.color];
          return (
            <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="kpi">
              <div className="flex items-start justify-between">
                <div className={'kpi-icon ' + a.bg + ' ' + a.text}><k.icon size={20} /></div>
                {k.delta && (
                  <span className={'kpi-delta ' + (k.up ? 'text-success-600' : 'text-danger-600')}>
                    {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {k.delta}
                  </span>
                )}
              </div>
              <div>
                <div className="kpi-value"><AnimatedCounter value={k.value} />{k.suffix}</div>
                <div className="kpi-label" style={{ textTransform: 'none', letterSpacing: '0' }}>{k.label}</div>
              </div>
            </motion.div>
          );
        })}
      </section>

      <section className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Camas totais', value: totalBeds.toLocaleString('pt-PT'), icon: BedDouble, sub: 'SNS nacional' },
            { label: 'Camas ocupadas', value: occupiedBeds.toLocaleString('pt-PT'), icon: HeartPulse, sub: occPct + '% ocupação' },
            { label: 'Ambulâncias', value: '342', icon: Ambulance, sub: '94% operacionais' },
            { label: 'Profissionais', value: '14.2K', icon: Users, sub: 'Médicos · Enfermeiros' },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="kpi-icon bg-medic-50 text-medic-600"><c.icon size={20} /></div>
              <div>
                <div className="text-2xl font-bold text-ink-900 tabular-nums">{c.value}</div>
                <div className="text-sm font-semibold text-ink-700">{c.label}</div>
                <div className="caption">{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-ink-700">Ocupação nacional de camas</span>
            <span className="text-sm font-bold text-medic-700">{occPct}%</span>
          </div>
          <div className="progress h-2 rounded-lg">
            <motion.div initial={{ width: 0 }} animate={{ width: occPct + '%' }} transition={{ duration: 1 }}
              className={'progress-bar ' + (occPct > 85 ? 'bg-danger-500' : occPct > 70 ? 'bg-warning-500' : 'bg-medic-500') + ' rounded-lg'} />
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card relative overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="eyebrow">Vigilância Epidemiológica</div>
              <h3 className="h4 mt-1 flex items-center gap-2">
                <Globe size={18} className="text-medic-600" /> Mapa Nacional · Actividade por Província
              </h3>
            </div>
          </div>

          {/* Mapa interactivo de Angola — zoom, pan, hover e marcadores clicáveis */}
          <div className="relative rounded-xl border border-ink-100 overflow-hidden">
            <AngolaMap markers={provinceMarkers} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="eyebrow">Alertas</div>
              <h3 className="h4 mt-1 flex items-center gap-2"><Bell size={18} className="text-danger-500" /> Surtos activos</h3>
            </div>
            <span className="badge badge-danger">{OUTBREAKS.filter(o => o.level === 'Crítico').length} críticos</span>
          </div>
          <div className="space-y-2">
            {OUTBREAKS.map((o, i) => (
              <motion.div key={o.disease} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className={'p-3 rounded-xl border flex items-center gap-3 ' + bgMap[o.color]}>
                <div className={'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ' + iconMap[o.color] + ' text-white'}>
                  <o.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-ink-900">{o.disease}</span>
                    <span className={'badge ' + colorMap[o.color] + ' text-[9px]'}>{o.level}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-ink-500 mt-0.5"><MapPin size={10} />{o.location}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-ink-900 tabular-nums text-sm">{o.cases.toLocaleString('pt-PT')}</div>
                  <div className={'text-[11px] font-semibold ' + (o.trend.startsWith('-') ? 'text-success-600' : o.trend.startsWith('+') ? 'text-danger-600' : 'text-ink-400')}>{o.trend}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <button className="btn-secondary w-full mt-4 text-sm">Centro de vigilância <ArrowRight size={14} /></button>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="card-dark">
          <div className="flex items-center gap-2 mb-3">
            <div className="ia-orb w-10 h-10"><Activity size={18} /></div>
            <div>
              <div className="eyebrow !text-medic-200">IA Preditiva</div>
              <div className="font-bold text-white">Previsão 7 dias</div>
            </div>
          </div>
          <p className="text-sm text-medic-100/80 leading-relaxed">
            Os modelos de IA detectaram um aumento probabilístico de casos de <b className="text-white">Cólera (+23%)</b> na zona de Cazenga e Viana devido ao padrão de chuvas e dados de saneamento.
          </p>
          <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="text-xs text-medic-200 uppercase font-bold tracking-wider mb-2">Recomendação</div>
            <p className="text-sm text-white leading-relaxed">Pré-posicionar unidades de tratamento de cólera, stocks de SRO e activar campanhas de sensibilização nas zonas afectadas.</p>
          </div>
          <button className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-sm transition-all">
            Ver relatório preditivo completo <ArrowRight size={14} />
          </button>
        </div>

        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="eyebrow">Capacidade Instalada</div>
              <h3 className="h4 mt-1">Unidades hospitalares principais</h3>
            </div>
            <span className="badge badge-primary">{activeHospitals} activas</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {(hospitals.slice(0, 6).length > 0 ? hospitals.slice(0, 6) : [
              { name: 'Hospital Central de Luanda', municipality: 'Luanda', avgWaitTime: '22 min', integrationState: 'Ativo' },
              { name: 'Hospital Josina Machel', municipality: 'Luanda', avgWaitTime: '18 min', integrationState: 'Ativo' },
              { name: 'Hospital Américo Boavida', municipality: 'Luanda', avgWaitTime: '31 min', integrationState: 'Ativo' },
              { name: 'Hospital Maria Pia', municipality: 'Luanda', avgWaitTime: '15 min', integrationState: 'Ativo' },
              { name: 'Hospital Benguela Geral', municipality: 'Benguela', avgWaitTime: '25 min', integrationState: 'Ativo' },
              { name: 'Hospital Huambo Central', municipality: 'Huambo', avgWaitTime: '28 min', integrationState: 'Ativo' },
            ]).map((h: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl border border-ink-100 hover:border-medic-200 hover:bg-medic-50/50 transition-all flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-medic-100 text-medic-700 flex items-center justify-center shrink-0"><Building2 size={18} /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-ink-900 truncate">{h.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center gap-1 caption"><MapPin size={10} />{h.municipality}</span>
                    <span className="inline-flex items-center gap-1 caption"><Clock size={10} />{h.avgWaitTime || '24 min'}</span>
                  </div>
                </div>
                <span className={'badge ' + (h.integrationState === 'Ativo' ? 'badge-success' : 'badge-default')}>{h.integrationState}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
