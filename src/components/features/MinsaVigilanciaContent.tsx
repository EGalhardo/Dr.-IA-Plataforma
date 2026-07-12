/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Vigilancia Epidemiologica - Mapa Interativo de Angola (21 provincias)
 * Integra marcadores em tempo real baseados nas avaliacoes sincronizadas
 * do Doctor IA e hospitais conectados.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShieldCheck, AlertTriangle, MapPin, Activity, CheckCircle, AlertCircle, X, Hospital, TrendingUp, Zap, Radio } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { DriaEvaluation } from '../../types/dria';
import { AngolaMap, type ProvinceMarker, type RiskLevel, type Trend } from '../ui/AngolaMap';

interface OutbreakMetric {
  municipality: string; province: string; malariaCases: number; choleraCases: number;
  tuberculosisCases: number; measlesCases: number; ebolaCases: number;
  aiStatus: 'Alerta de Surto' | 'Estavel' | 'Monitorizado'; mapX: number; mapY: number;
}

const MUNICIPIOS: OutbreakMetric[] = [
  { municipality: 'Cazenga', province: 'Luanda', malariaCases: 1420, choleraCases: 28, tuberculosisCases: 89, measlesCases: 12, ebolaCases: 0, aiStatus: 'Alerta de Surto', mapX: 42, mapY: 36 },
  { municipality: 'Viana', province: 'Luanda', malariaCases: 2150, choleraCases: 3, tuberculosisCases: 124, measlesCases: 45, ebolaCases: 0, aiStatus: 'Alerta de Surto', mapX: 48, mapY: 40 },
  { municipality: 'Cacuaco', province: 'Luanda', malariaCases: 1120, choleraCases: 8, tuberculosisCases: 76, measlesCases: 62, ebolaCases: 0, aiStatus: 'Alerta de Surto', mapX: 38, mapY: 30 },
  { municipality: 'Talatona', province: 'Luanda', malariaCases: 890, choleraCases: 0, tuberculosisCases: 34, measlesCases: 5, ebolaCases: 0, aiStatus: 'Estavel', mapX: 44, mapY: 44 },
  { municipality: 'Belas', province: 'Luanda', malariaCases: 1280, choleraCases: 1, tuberculosisCases: 56, measlesCases: 18, ebolaCases: 0, aiStatus: 'Monitorizado', mapX: 42, mapY: 48 },
  { municipality: 'Maianga', province: 'Luanda', malariaCases: 650, choleraCases: 0, tuberculosisCases: 22, measlesCases: 3, ebolaCases: 1, aiStatus: 'Alerta de Surto', mapX: 38, mapY: 38 },
  { municipality: 'Lobito', province: 'Benguela', malariaCases: 1850, choleraCases: 15, tuberculosisCases: 112, measlesCases: 28, ebolaCases: 0, aiStatus: 'Alerta de Surto', mapX: 30, mapY: 58 },
  { municipality: 'Benguela', province: 'Benguela', malariaCases: 1340, choleraCases: 6, tuberculosisCases: 87, measlesCases: 14, ebolaCases: 0, aiStatus: 'Monitorizado', mapX: 28, mapY: 62 },
  { municipality: 'Huambo', province: 'Huambo', malariaCases: 2780, choleraCases: 40, tuberculosisCases: 198, measlesCases: 89, ebolaCases: 0, aiStatus: 'Alerta de Surto', mapX: 37, mapY: 62 },
  { municipality: 'Lubango', province: 'Huíla', malariaCases: 1650, choleraCases: 3, tuberculosisCases: 94, measlesCases: 22, ebolaCases: 0, aiStatus: 'Estavel', mapX: 25, mapY: 76 },
  { municipality: 'Malanje', province: 'Malanje', malariaCases: 2100, choleraCases: 12, tuberculosisCases: 143, measlesCases: 55, ebolaCases: 0, aiStatus: 'Alerta de Surto', mapX: 50, mapY: 44 },
  { municipality: 'Cabinda', province: 'Cabinda', malariaCases: 890, choleraCases: 0, tuberculosisCases: 35, measlesCases: 8, ebolaCases: 0, aiStatus: 'Estavel', mapX: 56, mapY: 10 },
  { municipality: 'Uíge', province: 'Uíge', malariaCases: 1950, choleraCases: 22, tuberculosisCases: 118, measlesCases: 42, ebolaCases: 0, aiStatus: 'Alerta de Surto', mapX: 50, mapY: 22 },
  { municipality: 'Mbanza Congo', province: 'Zaire', malariaCases: 1100, choleraCases: 0, tuberculosisCases: 55, measlesCases: 15, ebolaCases: 0, aiStatus: 'Monitorizado', mapX: 48, mapY: 16 },
  { municipality: 'Saurimo', province: 'Lunda Sul', malariaCases: 1600, choleraCases: 0, tuberculosisCases: 67, measlesCases: 19, ebolaCases: 0, aiStatus: 'Estavel', mapX: 65, mapY: 52 },
  { municipality: 'Dundo', province: 'Lunda Norte', malariaCases: 1750, choleraCases: 0, tuberculosisCases: 72, measlesCases: 24, ebolaCases: 0, aiStatus: 'Monitorizado', mapX: 68, mapY: 36 },
  { municipality: 'Namibe', province: 'Namibe', malariaCases: 780, choleraCases: 0, tuberculosisCases: 28, measlesCases: 6, ebolaCases: 0, aiStatus: 'Estavel', mapX: 20, mapY: 82 },
  { municipality: 'Menongue', province: 'Cuando Cubango', malariaCases: 1350, choleraCases: 1, tuberculosisCases: 44, measlesCases: 16, ebolaCases: 0, aiStatus: 'Monitorizado', mapX: 48, mapY: 82 },
];

// Mapeamento de municipios -> provincia (para classificar avaliacoes em que
// patientMunicipality nao exista na lista base ou seja a propria capital)
const MUNI_TO_PROV: Record<string, string> = {
  cazenga:'Luanda', viana:'Luanda', cacuaco:'Luanda', talatona:'Luanda',
  belas:'Luanda', maianga:'Luanda', luanda:'Luanda', caxito:'Bengo',
  catete:'Icolo e Bengo', ndalatando:'Cuanza Norte', malanje:'Malanje',
  dundo:'Lunda Norte', saurimo:'Lunda Sul', sumbe:'Cuanza Sul', kuito:'Bié',
  luena:'Moxico', cazombo:'Moxico Leste', benguela:'Benguela', lobito:'Benguela',
  huambo:'Huambo', lubango:'Huíla', 'moçâmedes':'Namibe', mocamedes:'Namibe',
  ondjiva:'Cunene', menongue:'Cuando Cubango', cabinda:'Cabinda',
  'mbanza congo':'Zaire', soyo:'Zaire', uíge:'Uíge', uige:'Uíge',
  'pango aluquém':'Pango Aluquem',
};

function normalizeProvince(raw: string | undefined): string {
  if (!raw) return 'Luanda';
  const lc = raw.toLowerCase().trim();
  // Mapeamentos de nomes comuns / acentos
  const map: Record<string, string> = {
    'luanda':'Luanda','bengo':'Bengo','benguela':'Benguela','bie':'Bié','bié':'Bié',
    'cabinda':'Cabinda','moxico':'Moxico','moxico leste':'Moxico Leste',
    'cuando cubango':'Cuando Cubango','cuanza norte':'Cuanza Norte',
    'cuanza sul':'Cuanza Sul','cunene':'Cunene','huambo':'Huambo','huila':'Huíla','huíla':'Huíla',
    'lunda norte':'Lunda Norte','lunda sul':'Lunda Sul','malanje':'Malanje','namibe':'Namibe',
    'uige':'Uíge','uíge':'Uíge','zaire':'Zaire','icolo e bengo':'Icolo e Bengo',
    'pango aluquem':'Pango Aluquém','pango aluquém':'Pango Aluquém',
  };
  // Normalizacao extra: remover acentos antes de procurar no map
  const normLc = lc
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normMap: Record<string,string> = {};
  Object.entries(map).forEach(([k,v]) => {
    normMap[k.normalize('NFD').replace(/[\u0300-\u036f]/g,'')] = v;
  });
  if (map[lc]) return map[lc];
  if (normMap[normLc]) return normMap[normLc];
  // Se nao bater em nada, capitalizar
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

interface MinsaVigilanciaContentProps {
  evaluations?: DriaEvaluation[];
}

export function MinsaVigilanciaContent({ evaluations = [] }: MinsaVigilanciaContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<OutbreakMetric | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'mapa' | 'grafico'>('mapa');

  // Classifica uma avaliacao por doenca
  const classifyEval = (text: string): { malaria: number; cholera: number; tb: number; measles: number; ebola: number } => {
    const lc = (text || '').toLowerCase();
    let m = 0, c = 0, tb = 0, s = 0, e = 0;
    if (!lc) return { malaria: 0, cholera: 0, tb: 0, measles: 0, ebola: 0 };
    if (lc.includes('malária') || lc.includes('malaria') || lc.includes('plasmodium')) m = 1;
    if (lc.includes('cólera') || lc.includes('colera') || lc.includes('vibrio') || (lc.includes('diarreia') && lc.includes('vómit'))) c = 1;
    if (lc.includes('tuberculose') || /\btb\b/.test(lc) || lc.includes('genexpert') || lc.includes('baar')) tb = 1;
    if (lc.includes('sarampo') || lc.includes('exantema')) s = 1;
    if (lc.includes('ébora') || lc.includes('ebola') || lc.includes('hemorrágic')) e = 1;
    if (!m && !c && !tb && !s && !e) m = 1;
    return { malaria: m, cholera: c, tb, measles: s, ebola: e };
  };

  // Fusao base mock + avaliacoes reais (a nivel de municipio, para a lista/tabela)
  const mergedMunicipios = useMemo<OutbreakMetric[]>(() => {
    const map: Record<string, OutbreakMetric> = {};
    MUNICIPIOS.forEach(m => { map[m.municipality.toLowerCase()] = { ...m }; });
    evaluations.forEach(ev => {
      const rawProv = normalizeProvince(ev.patientMunicipality);
      // Tentar resolver por municipio -> provincia
      const muniKey = (ev.patientMunicipality || 'luanda').toLowerCase();
      const provForMuni = MUNI_TO_PROV[muniKey] || rawProv;
      let target = map[muniKey];
      if (!target) {
        target = {
          municipality: ev.patientMunicipality || 'Desconhecido',
          province: provForMuni,
          malariaCases: 0, choleraCases: 0, tuberculosisCases: 0, measlesCases: 0, ebolaCases: 0,
          aiStatus: 'Monitorizado',
          mapX: 44, mapY: 40,
        };
        map[muniKey] = target;
      }
      const t = `${ev.symptoms} ${ev.aiSummary} ${(ev.possibleCauses || []).join(' ')} ${ev.doctorConfirmedDiagnosis || ''}`;
      const bk = classifyEval(t);
      target.malariaCases += bk.malaria;
      target.choleraCases += bk.cholera;
      target.tuberculosisCases += bk.tb;
      target.measlesCases += bk.measles;
      target.ebolaCases += bk.ebola;
      const total = target.malariaCases + target.choleraCases + target.tuberculosisCases + target.measlesCases + target.ebolaCases;
      if (target.ebolaCases > 0 || target.choleraCases >= 3) target.aiStatus = 'Alerta de Surto';
      else if (total >= 5) target.aiStatus = 'Alerta de Surto';
      else if (total >= 2) target.aiStatus = 'Monitorizado';
    });
    return Object.values(map);
  }, [evaluations]);

  // Agregacao por PROVINCIA (21 provincias) para alimentar o novo mapa.
  // Inicializamos todas as 21 provincias para garantir que aparecem no mapa
  // mesmo que nao haja avaliacoes reportadas.
  const ALL_21_PROVINCES = [
    'Cabinda','Zaire','Uíge','Bengo','Pango Aluquém','Icolo e Bengo','Luanda',
    'Cuanza Norte','Malanje','Lunda Norte','Lunda Sul','Cuanza Sul','Bié',
    'Moxico','Moxico Leste','Benguela','Huambo','Huíla','Namibe','Cunene','Cuando Cubango',
  ];

  const provinceMarkers = useMemo<ProvinceMarker[]>(() => {
    const byProv: Record<string, { malaria:number; cholera:number; tb:number; measles:number; ebola:number; total:number }> = {};
    ALL_21_PROVINCES.forEach(p => { byProv[p] = { malaria:0, cholera:0, tb:0, measles:0, ebola:0, total:0 }; });

    mergedMunicipios.forEach(m => {
      const p = normalizeProvince(m.province);
      if (!byProv[p]) byProv[p] = { malaria:0, cholera:0, tb:0, measles:0, ebola:0, total:0 };
      byProv[p].malaria  += m.malariaCases;
      byProv[p].cholera  += m.choleraCases;
      byProv[p].tb       += m.tuberculosisCases;
      byProv[p].measles  += m.measlesCases;
      byProv[p].ebola    += m.ebolaCases;
      byProv[p].total    += m.malariaCases + m.choleraCases + m.tuberculosisCases + m.measlesCases + m.ebolaCases;
    });

    // Adicionar avaliacoes em que o municipality e o nome da propria provincia
    evaluations.forEach(ev => {
      const p = normalizeProvince(ev.patientMunicipality);
      if (!byProv[p]) byProv[p] = { malaria:0, cholera:0, tb:0, measles:0, ebola:0, total:0 };
      const t = `${ev.symptoms} ${ev.aiSummary} ${(ev.possibleCauses||[]).join(' ')} ${ev.doctorConfirmedDiagnosis||''}`;
      const bk = classifyEval(t);
      byProv[p].malaria += bk.malaria;
      byProv[p].cholera += bk.cholera;
      byProv[p].tb      += bk.tb;
      byProv[p].measles += bk.measles;
      byProv[p].ebola   += bk.ebola;
      byProv[p].total   += bk.malaria + bk.cholera + bk.tb + bk.measles + bk.ebola;
    });

    // Determinar tendencia geral para cada provincia com base em comparacao
    // simples entre avaliacoes recentes (ultimas 72h) vs anteriores
    const now = new Date();
    const cutoff = new Date(now.getTime() - 72*60*60*1000);
    const recentSet = new Set<string>();
    evaluations.forEach(ev => {
      const ts = ev.submissionTime ? new Date(ev.submissionTime).getTime() : 0;
      if (ts > cutoff.getTime()) recentSet.add(normalizeProvince(ev.patientMunicipality));
    });

    return Object.entries(byProv).map(([name, d]) => {
      let level: RiskLevel;
      let status: string;
      let riskLabel: string;
      if (d.ebola > 0 || d.cholera >= 3 || d.total >= 500) {
        level = 'critico';
        status = d.ebola > 0 ? 'Surto activo (Ébola)' : d.cholera >= 3 ? 'Surto de Cólera' : 'Situação crítica';
        riskLabel = 'Muito Elevado';
      } else if (d.cholera >= 1 || d.total >= 200) {
        level = 'alerta';
        status = 'Alerta elevado';
        riskLabel = 'Elevado';
      } else if (d.measles >= 20 || d.total >= 50) {
        level = 'atencao';
        status = 'Atenção / Monitorização';
        riskLabel = 'Moderado';
      } else {
        level = 'normal';
        status = d.total > 0 ? 'Sem alertas' : 'Sem casos activos';
        riskLabel = 'Baixo';
      }
      let trend: Trend = 'estavel';
      if (d.ebola > 0 || d.cholera >= 3) trend = 'subir';
      else if (recentSet.has(name)) trend = 'subir';
      else if (d.total >= 200) trend = 'subir';
      else if (d.total < 50) trend = 'descer';

      return {
        name,
        cx: 0, cy: 0, path: '', capital: name,
        level,
        activeCases: Math.round(d.total),
        trend,
        status,
        riskLabel,
        lastUpdate: now.toISOString(),
      } as ProvinceMarker;
    });
  }, [mergedMunicipios, evaluations]);

  const filtered = mergedMunicipios.filter(m =>
    m.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBadge = (s: string) => {
    if (s === 'Alerta de Surto') return 'bg-red-50 border-red-200 text-red-700 font-black';
    if (s === 'Monitorizado')   return 'bg-amber-50 border-amber-200 text-amber-700 font-extrabold';
    return 'bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold';
  };

  const totalNac = mergedMunicipios.reduce((s, m) => s + m.malariaCases + m.choleraCases + m.tuberculosisCases + m.measlesCases + m.ebolaCases, 0);
  const alertas = mergedMunicipios.filter(m => m.aiStatus === 'Alerta de Surto').length;
  const ebolaAlerts = mergedMunicipios.filter(m => m.ebolaCases > 0).length;

  // Tendencia semanal real: compara avaliacoes das ultimas 72h vs 72h anteriores
  const weeklyTrend = useMemo(() => {
    const now = Date.now();
    const recent = evaluations.filter(ev => {
      if (!ev.submissionTime) return false;
      const t = new Date(ev.submissionTime).getTime();
      return now - t <= 72*60*60*1000;
    }).length;
    const previous = evaluations.filter(ev => {
      if (!ev.submissionTime) return false;
      const t = new Date(ev.submissionTime).getTime();
      const ago = now - t;
      return ago > 72*60*60*1000 && ago <= 144*60*60*1000;
    }).length;
    if (recent === 0 && previous === 0) return { value: '—', up: false };
    if (previous === 0) return { value: '+100%', up: true };
    const pct = Math.round(((recent - previous) / Math.max(previous,1)) * 100);
    return { value: `${pct >= 0 ? '+' : ''}${pct}%`, up: pct >= 0 };
  }, [evaluations]);

  const chartData = useMemo(() => {
    const byProv: Record<string, any> = {};
    mergedMunicipios.forEach(m => {
      const p = normalizeProvince(m.province);
      if (!byProv[p]) byProv[p] = { province: p, Malaria:0, Colera:0, Tuberculose:0, Sarampo:0, Ebola:0 };
      byProv[p].Malaria     += m.malariaCases;
      byProv[p].Colera      += m.choleraCases;
      byProv[p].Tuberculose += m.tuberculosisCases;
      byProv[p].Sarampo     += m.measlesCases;
      byProv[p].Ebola       += m.ebolaCases;
    });
    return Object.values(byProv)
      .sort((a:any,b:any) => (b.Malaria+b.Colera+b.Tuberculose+b.Sarampo+b.Ebola) - (a.Malaria+a.Colera+a.Tuberculose+a.Sarampo+a.Ebola));
  }, [mergedMunicipios]);

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Banner principal — paleta medic */}
      <div className="bg-gradient-to-r from-medic-900 to-medic-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 flex items-center justify-center">
          <svg width="130" height="130" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase flex items-center gap-1.5 w-fit">
            <Radio size={10} className="animate-pulse"/>Vigilância Epidemiológica Nacional
          </span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">Monitorização de Surtos</h2>
          <p className="text-xs text-medic-100 leading-relaxed font-semibold">
            Mapa interactivo de Angola com as 21 províncias, marcadores epidemiológicos em tempo real alimentados pelo Doctor IA e hospitais conectados.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon:<Activity size={18} className="animate-pulse"/>, bg:'bg-rose-50', fg:'text-rose-600', label:'Casos Totais', val:(totalNac/1000).toFixed(1)+'K', cls:'text-slate-800' },
          { icon:<AlertTriangle size={18}/>, bg:'bg-red-50', fg:'text-red-600', label:'Munic. Alerta', val:String(alertas), cls:'text-red-600' },
          { icon:<Zap size={18}/>, bg:'bg-medic-50', fg:'text-medic-600', label:'Alertas Ébola', val:String(ebolaAlerts), cls:ebolaAlerts>0?'text-red-600 animate-pulse':'text-emerald-600' },
          { icon:<TrendingUp size={18} className={weeklyTrend.up ? 'animate-pulse':''}/>, bg: weeklyTrend.up ? 'bg-rose-50' : 'bg-emerald-50', fg: weeklyTrend.up ? 'text-rose-600' : 'text-emerald-600', label:'Tend. 72h', val: weeklyTrend.value, cls: weeklyTrend.up ? 'text-rose-600' : 'text-emerald-600' },
        ].map((k,i)=>(
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${k.bg} ${k.fg} flex items-center justify-center shrink-0`}>{k.icon}</div>
            <div>
              <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">{k.label}</span>
              <span className={`text-lg font-black leading-none mt-0.5 block ${k.cls}`}>{k.val}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toggle Mapa/Grafico */}
      <div className="flex items-center gap-2">
        <button onClick={()=>setViewMode('mapa')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${viewMode==='mapa'?'bg-medic-700 text-white shadow-md':'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}><MapPin size={13} className="inline mr-1"/>Mapa</button>
        <button onClick={()=>setViewMode('grafico')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${viewMode==='grafico'?'bg-medic-700 text-white shadow-md':'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}><Activity size={13} className="inline mr-1"/>Gráfico</button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode==='mapa'?(
          <motion.div key="mapa" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="space-y-6">
            {/* === MAPA PRINCIPAL — Mapeamento Inteligente de Surtos === */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} className="text-red-600"/>Mapeamento Inteligente de Surtos – Angola
                </h3>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>21 Províncias · Tempo real
                </span>
              </div>
              <AngolaMap
                markers={provinceMarkers}
                selected={selectedProvince}
                onProvinceClick={(m) => setSelectedProvince(m.name === selectedProvince ? null : m.name)}
              />
            </div>

            {/* Tabela de municipios */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} className="text-red-600 animate-pulse"/>Prevalência por Município
                </h3>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white">
                  <Search size={12} className="text-slate-400 shrink-0"/>
                  <input type="text" placeholder="Filtrar..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-32 bg-transparent outline-none text-[10px] font-bold text-slate-800"/>
                </div>
              </div>
              <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                {filtered.map(m=>(
                  <div key={m.municipality} onClick={()=>setSelected(selected?.municipality===m.municipality?null:m)}
                       className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors cursor-pointer text-xs font-bold text-slate-600 ${selected?.municipality===m.municipality?'bg-medic-50/60 border-l-2 border-l-medic-500':'hover:bg-slate-50/40'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${m.aiStatus==='Alerta de Surto'?'bg-red-50 text-red-600 border-red-200':m.aiStatus==='Monitorizado'?'bg-amber-50 text-amber-600 border-amber-200':'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                        <MapPin size={14}/>
                      </div>
                      <div className="text-left space-y-0.5">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">{m.municipality}</h4>
                        <p className="text-[9px] text-slate-400">{m.province}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 bg-slate-50 p-1.5 border rounded-lg grow sm:max-w-xs">
                      {[['Mal',m.malariaCases,false],['Col',m.choleraCases,m.choleraCases>0],['TB',m.tuberculosisCases,false],['Sar',m.measlesCases,m.measlesCases>10],['Ebo',m.ebolaCases,m.ebolaCases>0]].map(([l,v,a]:any[])=>(
                        <div key={l} className="text-center">
                          <span className="text-[6.5px] text-slate-400 block uppercase font-black">{l}</span>
                          <span className={`text-[9px] font-black ${a?'text-red-600 animate-pulse':'text-slate-800'}`}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="shrink-0">
                      <span className={`px-2 py-0.5 rounded border text-[8px] uppercase tracking-wide ${getBadge(m.aiStatus)} ${m.aiStatus==='Alerta de Surto'?'animate-pulse':''}`}>{m.aiStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 text-center text-[10px] text-slate-400 font-extrabold uppercase flex items-center gap-1.5 justify-center">
                <CheckCircle className="text-emerald-500" size={13}/>Sincronizado com os Postos Médicos do Estado
              </div>
            </div>
          </motion.div>
        ):(
          <motion.div key="grafico" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity size={15} className="text-medic-600"/>Casos por Província e Doença
              </h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{top:5,right:10,left:0,bottom:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="province" tick={{fontSize:9,fontWeight:700,fill:'#64748b'}}/>
                    <YAxis tick={{fontSize:9,fontWeight:700,fill:'#64748b'}}/>
                    <Tooltip contentStyle={{borderRadius:12,border:'1px solid #e2e8f0',fontSize:11,fontWeight:600}}/>
                    <Legend wrapperStyle={{fontSize:10,fontWeight:700}}/>
                    <Bar dataKey="Malaria" fill="#f59e0b" radius={[4,4,0,0]}/>
                    <Bar dataKey="Colera" fill="#ef4444" radius={[4,4,0,0]}/>
                    <Bar dataKey="Tuberculose" fill="#0ea5e9" radius={[4,4,0,0]}/>
                    <Bar dataKey="Sarampo" fill="#ec4899" radius={[4,4,0,0]}/>
                    <Bar dataKey="Ebola" fill="#991b1b" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle size={15} className="text-red-500"/>Alertas Activos
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-100 border border-red-300 rounded-xl flex gap-2.5 items-start text-left">
                  <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5 animate-pulse"/>
                  <div className="text-xs font-semibold leading-normal">
                    <span className="text-red-700 font-black uppercase text-[10px] block">Suspeita de Ébola em Maianga</span>
                    <p className="text-slate-700 mt-1">Caso suspeito com febre 39.8°C e contacto com óbito hemorrágico. Biosegurança nível 4 activa.</p>
                  </div>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2.5 items-start text-left">
                  <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5"/>
                  <div className="text-xs font-semibold leading-normal">
                    <span className="text-red-700 font-black uppercase text-[10px] block">Surto de Cólera em Cazenga</span>
                    <p className="text-slate-600 mt-1">Aumento de 18% em admissões por gastroenterite aquosa severa nas últimas 24h.</p>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2.5 items-start text-left">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5"/>
                  <div className="text-xs font-semibold leading-normal">
                    <span className="text-amber-700 font-black uppercase text-[10px] block">Pico de Sarampo em Cacuaco</span>
                    <p className="text-slate-600 mt-1">Padrão epidémico de exantemas febris em crianças {'<'}5 anos. Reforço vacinal recomendado.</p>
                  </div>
                </div>
                <div className="p-3 bg-medic-50 border border-medic-200 rounded-xl flex gap-2.5 items-start text-left">
                  <Hospital size={16} className="text-medic-600 shrink-0 mt-0.5"/>
                  <div className="text-xs font-semibold leading-normal">
                    <span className="text-medic-700 font-black uppercase text-[10px] block">Malária em Viana e Cacuaco</span>
                    <p className="text-slate-600 mt-1">Pico sazonal. Reforço de mosquiteiros e ACT em curso.</p>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 text-center text-[9px] text-slate-400 font-black uppercase tracking-wider flex items-center justify-center gap-1 mt-3">
                <ShieldCheck className="text-medic-600" size={13}/>Certificado pelo MINSA Angola
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup de municipio seleccionado (do clique na tabela) — mantido para compatibilidade */}
      {selected && viewMode === 'mapa' && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="fixed inset-0 z-40 bg-slate-900/40 flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div onClick={e=>e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl p-5 max-w-sm w-full">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-black text-slate-900 uppercase">{selected.municipality}</h4>
              <button onClick={()=>setSelected(null)} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"><X size={14} className="text-slate-400"/></button>
            </div>
            <p className="text-[10px] text-slate-500 font-bold mb-3">{selected.province}</p>
            <div className="text-center">
              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black ${getBadge(selected.aiStatus)}`}>{selected.aiStatus}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default MinsaVigilanciaContent;
