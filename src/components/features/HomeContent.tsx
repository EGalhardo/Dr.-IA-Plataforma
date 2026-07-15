/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Painel do Cidadão — Layout Atraente
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Activity, Clock, Hospital, MapPin, Phone, MessageSquare, AlertCircle, ShieldCheck, ChevronRight, Heart, Stethoscope, Search } from 'lucide-react';
import { HIGHLIGHT_SLIDES } from '../../constants/data';
import { Message, LanguageCode } from '../../types';
import { DriaEvaluation } from '../../types/dria';
import { useLanguage } from '../../hooks/useLanguage';
import { LazyImage } from '../ui/LazyImage';

interface HomeContentProps {
  activeSlide: number;
  setActiveSlide: (slide: number) => void;
  isMobile: boolean;
  setTab: (tab: string) => void;
  unreadTotal: number;
  inbox: Message[];
  sentMessages: Message[];
  handleSelectMessage: (msg: Message) => void;
  onCreateRequest?: (type: string, priority: 'Alta' | 'Média' | 'Baixa') => void;
  isInst?: boolean;
  onDoubleClickInstitution?: (name: string) => void;
  currentLanguage?: LanguageCode;
  evaluations?: DriaEvaluation[];
}

const HOSPITAL_DATABASE = [
  // LUANDA
  {
    name: 'Hospital Central de Luanda',
    shortName: 'H. Central',
    address: 'Rua 17 de Setembro, Luanda',
    phone: '+244 222 334 455',
    whatsapp: '+244 923 000 111',
    cleanWa: '244923000111',
    cleanPhone: '+244222334455',
    color: '#0E2B64',
    province: 'Luanda'
  },
  {
    name: 'Hospital Josina Machel',
    shortName: 'H. Josina',
    address: 'Av. Lenine, Luanda',
    phone: '+244 222 445 566',
    whatsapp: '+244 923 000 222',
    cleanWa: '244923000222',
    cleanPhone: '+244222445566',
    color: '#1e40af',
    province: 'Luanda'
  },
  {
    name: 'Hospital Américo Boavida',
    shortName: 'H. Boavida',
    address: 'Bairro Operário, Luanda',
    phone: '+244 222 556 677',
    whatsapp: '+244 923 000 333',
    cleanWa: '244923000333',
    cleanPhone: '+244222556677',
    color: '#3730a3',
    province: 'Luanda'
  },
  {
    name: 'Hospital Maria Pia',
    shortName: 'H. Maria Pia',
    address: 'Marginal de Luanda',
    phone: '+244 222 667 788',
    whatsapp: '+244 923 000 444',
    cleanWa: '244923000444',
    cleanPhone: '+244222667788',
    color: '#4338ca',
    province: 'Luanda'
  },
  {
    name: 'Clínica Girassol',
    shortName: 'C. Girassol',
    address: 'Talatona, Luanda',
    phone: '+244 222 778 899',
    whatsapp: '+244 923 000 555',
    cleanWa: '244923000555',
    cleanPhone: '+244222778899',
    color: '#4f46e5',
    province: 'Luanda'
  },
  {
    name: 'Centro de Saúde do Cazenga',
    shortName: 'CS Cazenga',
    address: 'Cazenga, Luanda',
    phone: '+244 222 889 900',
    whatsapp: '+244 923 000 666',
    cleanWa: '244923000666',
    cleanPhone: '+244222889900',
    color: '#0d9488',
    province: 'Luanda'
  },
  {
    name: 'Centro de Saúde do Cacuaco',
    shortName: 'CS Cacuaco',
    address: 'Cacuaco, Luanda',
    phone: '+244 222 990 011',
    whatsapp: '+244 923 000 777',
    cleanWa: '244923000777',
    cleanPhone: '+244222990011',
    color: '#0891b2',
    province: 'Luanda'
  },
  {
    name: 'Hospital Geral de Luanda',
    shortName: 'H. Geral Luanda',
    address: 'Viana, Luanda',
    phone: '+244 222 112 233',
    whatsapp: '+244 923 000 888',
    cleanWa: '244923000888',
    cleanPhone: '+244222112233',
    color: '#4f46e5',
    province: 'Luanda'
  },
  // BENGUELA
  {
    name: 'Hospital Geral de Benguela',
    shortName: 'H. G. Benguela',
    address: 'Centro da Cidade, Benguela',
    phone: '+244 272 234 455',
    whatsapp: '+244 924 111 222',
    cleanWa: '244924111222',
    cleanPhone: '+244272234455',
    color: '#ea580c',
    province: 'Benguela'
  },
  {
    name: 'Hospital Municipal da Catumbela',
    shortName: 'H. Catumbela',
    address: 'Catumbela, Benguela',
    phone: '+244 272 345 566',
    whatsapp: '+244 924 222 333',
    cleanWa: '244924222333',
    cleanPhone: '+244272345566',
    color: '#d97706',
    province: 'Benguela'
  },
  {
    name: 'Centro de Saúde do Lobito',
    shortName: 'CS Lobito',
    address: 'Lobito, Benguela',
    phone: '+244 272 456 677',
    whatsapp: '+244 924 333 444',
    cleanWa: '244924333444',
    cleanPhone: '+244272456677',
    color: '#65a30d',
    province: 'Benguela'
  },
  // HUÍLA
  {
    name: 'Hospital Central do Lubango',
    shortName: 'H. C. Lubango',
    address: 'Lubango, Huíla',
    phone: '+244 261 224 455',
    whatsapp: '+244 925 111 222',
    cleanWa: '244925111222',
    cleanPhone: '+244261224455',
    color: '#be185d',
    province: 'Huíla'
  },
  {
    name: 'Hospital Dr. Agostinho Neto',
    shortName: 'H. Agos. Neto',
    address: 'Bairro Comercial, Lubango',
    phone: '+244 261 335 566',
    whatsapp: '+244 925 222 333',
    cleanWa: '244925222333',
    cleanPhone: '+244261335566',
    color: '#a21caf',
    province: 'Huíla'
  },
  // CABINDA
  {
    name: 'Hospital Geral de Cabinda',
    shortName: 'H. G. Cabinda',
    address: 'Rua Principal, Cabinda',
    phone: '+244 231 222 333',
    whatsapp: '+244 926 000 111',
    cleanWa: '244926000111',
    cleanPhone: '+244231222333',
    color: '#15803d',
    province: 'Cabinda'
  },
  {
    name: 'Centro de Saúde de Chiloango',
    shortName: 'CS Chiloango',
    address: 'Chiloango, Cabinda',
    phone: '+244 231 333 444',
    whatsapp: '+244 926 111 222',
    cleanWa: '244926111222',
    cleanPhone: '+244231333444',
    color: '#16a34a',
    province: 'Cabinda'
  },
  // HUAMBO
  {
    name: 'Hospital Geral do Huambo',
    shortName: 'H. G. Huambo',
    address: 'Av. da Independência, Huambo',
    phone: '+244 241 222 333',
    whatsapp: '+244 927 000 111',
    cleanWa: '244927000111',
    cleanPhone: '+244241222333',
    color: '#b91c1c',
    province: 'Huambo'
  },
  {
    name: 'Centro de Saúde da Caála',
    shortName: 'CS Caála',
    address: 'Caála, Huambo',
    phone: '+244 241 333 444',
    whatsapp: '+244 927 111 222',
    cleanWa: '244927111222',
    cleanPhone: '+244241333444',
    color: '#dc2626',
    province: 'Huambo'
  }
];

export function HomeContent({ activeSlide, setActiveSlide, isMobile, setTab, unreadTotal, inbox, sentMessages, handleSelectMessage, onCreateRequest, isInst, onDoubleClickInstitution, currentLanguage, evaluations = [], searchMail, setSearchMail }: HomeContentProps & { searchMail: string; setSearchMail: (v: string) => void }) {
  const { t } = useLanguage();
  const slides = HIGHLIGHT_SLIDES;
  const currentSlide = slides[activeSlide % slides.length];
  const [selectedProvince, setSelectedProvince] = useState<string>('Todas');

  const filteredHospitals = selectedProvince === 'Todas'
    ? HOSPITAL_DATABASE
    : HOSPITAL_DATABASE.filter(h => h.province === selectedProvince);

  return (
    <div className="grid gap-5 md:gap-6 text-left font-sans">

      {/* Slideshow */}
      <section className="relative h-[340px] sm:h-[400px] md:h-[480px] rounded-3xl overflow-hidden shadow-xl border border-slate-200/60 bg-medic-900">
        <AnimatePresence mode="wait">
          <motion.div key={`home-${activeSlide}`} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} className="absolute inset-0">
            <LazyImage src={currentSlide.image} alt={t(currentSlide.title)} priority={true} placeholder="skeleton"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              className="w-full h-full" />
          </motion.div>
        </AnimatePresence>
        {/* Gradiente suave para harmonia e legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-medic-900/70 via-medic-900/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-medic-900/40 via-transparent to-transparent pointer-events-none" />

        {/* Conteúdo sobreposto */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-9 text-white pointer-events-none">
          <motion.div key={`slide-text-${activeSlide}`} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-bold tracking-widest uppercase mb-3">
              <Heart size={11} className="text-red-300" />
              Dr.IA Angola
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase italic tracking-tight leading-tight drop-shadow-lg max-w-xl">{t(currentSlide.title)}</h2>
            <p className="mt-2 text-xs sm:text-sm text-white/85 leading-relaxed font-medium max-w-lg drop-shadow">{t(currentSlide.subtitle)}</p>
            {currentSlide.btn && currentSlide.action !== 'home' && (
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

        {/* Contador de slides */}
        <div className="absolute top-4 right-4 sm:top-5 sm:right-6 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md text-[10px] font-black text-white/90 tracking-wider">
          {String((activeSlide % slides.length) + 1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}
        </div>
      </section>

      {/* Banner Dr.IA */}
      <div className="bg-gradient-to-r from-[#0E2B64] to-indigo-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 flex items-center justify-center">
          <svg width="130" height="130" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
        </div>
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase">Painel do Cidadão</span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">Dr.IA — Triagem Clínica Inteligente</h2>
          <p className="text-xs text-indigo-200 leading-relaxed font-semibold">Aceda à avaliação clínica por IA, encontre hospitais integrados e consulte o seu histórico de saúde.</p>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Avaliação IA Card */}
        <motion.div whileHover={{ y: -3 }} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden group"
          onClick={() => setTab('avaliacao-ia')}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0E2B64] to-indigo-500" />
          <div className="space-y-2.5 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Bot size={20} />
              </div>
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-[8px] font-black uppercase tracking-wider">Inteligência Artificial</span>
            </div>
            <h4 className="text-sm md:text-base font-black uppercase tracking-tight text-slate-900">Avaliação Clínica IA</h4>
            <p className="text-[10.5px] text-slate-500 leading-relaxed font-semibold">Descreva os seus sintomas e receba uma triagem clínica preliminar instantânea baseada no Protocolo de Manchester.</p>
            <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-wider pt-1 group-hover:gap-2 transition-all">
              Iniciar Avaliação <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.div>

        {/* Histórico Card */}
        <motion.div whileHover={{ y: -3 }} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden group"
          onClick={() => setTab('historico-consultas')}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="space-y-2.5 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Activity size={20} />
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-wider">Portal do Cidadão</span>
            </div>
            <h4 className="text-sm md:text-base font-black uppercase tracking-tight text-slate-900">Histórico de Consultas</h4>
            <p className="text-[10.5px] text-slate-500 leading-relaxed font-semibold">Aceda a todas as suas triagens, prescrições eletrónicas e relatórios médicos assinados digitalmente.</p>
            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-wider pt-1 group-hover:gap-2 transition-all">
              Ver Histórico <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hospitais Conectados Bar */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h3 className="font-black italic uppercase text-slate-900 tracking-wider text-[10.5px]">Hospitais Conectados</h3>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Rede Integrada Dr.IA</p>
            </div>
          </div>
          {/* Province Filter Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Província:</span>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer shadow-sm"
            >
              <option value="Todas">Todas as Províncias</option>
              <option value="Bengo">Bengo</option>
              <option value="Benguela">Benguela</option>
              <option value="Bié">Bié</option>
              <option value="Cabinda">Cabinda</option>
              <option value="Cuando">Cuando</option>
              <option value="Cubango">Cubango</option>
              <option value="Cuanza Norte">Cuanza Norte</option>
              <option value="Cuanza Sul">Cuanza Sul</option>
              <option value="Cunene">Cunene</option>
              <option value="Huambo">Huambo</option>
              <option value="Huíla">Huíla</option>
              <option value="Icolo e Bengo">Icolo e Bengo</option>
              <option value="Luanda">Luanda</option>
              <option value="Lunda Norte">Lunda Norte</option>
              <option value="Lunda Sul">Lunda Sul</option>
              <option value="Malanje">Malanje</option>
              <option value="Moxico">Moxico</option>
              <option value="Moxico Leste">Moxico Leste</option>
              <option value="Namibe">Namibe</option>
              <option value="Uíge">Uíge</option>
              <option value="Zaire">Zaire</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filteredHospitals.map((h, idx) => {
            const elementId = `hospital-card-${h.shortName.replace(/[\s\.]+/g, '-').toLowerCase()}`;
            return (
              <button key={idx}
                onClick={() => {
                  const el = document.getElementById(elementId);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('ring-4', 'ring-indigo-500/30', 'bg-indigo-50/10');
                    setTimeout(() => el.classList.remove('ring-4', 'ring-indigo-500/30', 'bg-indigo-50/10'), 2000);
                  }
                }}
                className="px-2.5 py-1 bg-[#0E2B64] text-white hover:bg-[#153f8a] active:scale-95 font-black text-[7.5px] uppercase tracking-tight rounded-full shadow-sm transition-all duration-200 cursor-pointer whitespace-nowrap">
                {h.shortName}
              </button>
            );
          })}
          {filteredHospitals.length === 0 && (
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider italic">Nenhum hospital conectado nesta província.</span>
          )}
        </div>
      </section>

      {/* Contactos de Hospitais */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"><Heart size={16} /></div>
            <div>
              <h2 className="text-base font-black text-slate-800 tracking-tight uppercase">Contactos de Emergência</h2>
              <p className="text-[9px] text-slate-400 font-bold">Hospitais & Centros de Saúde</p>
            </div>
          </div>
          {selectedProvince !== 'Todas' && (
            <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-wider animate-fade-in">
              Província: {selectedProvince}
            </span>
          )}
        </div>

        <div className="grid gap-4">
          {filteredHospitals.map((hospital, idx) => {
            const cardId = `hospital-card-${hospital.shortName.replace(/[\s\.]+/g, '-').toLowerCase()}`;
            return (
              <motion.div key={idx} id={cardId} whileHover={{ y: -2 }}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 bottom-0 w-1" style={{ backgroundColor: hospital.color }} />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pl-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: hospital.color + '10', color: hospital.color }}>
                      <Hospital size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center flex-wrap gap-2">
                        {hospital.name}
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-full text-[8px] font-black uppercase tracking-wider">
                          {hospital.province}
                        </span>
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold"><MapPin size={11} /> {hospital.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`https://wa.me/${hospital.cleanWa}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#00E676] hover:bg-[#00c853] text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm">
                      <MessageSquare size={13} /> WhatsApp
                    </a>
                    <a href={`tel:${hospital.cleanPhone}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#2979FF] hover:bg-[#2962FF] text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-sm">
                      <Phone size={13} /> Ligar
                    </a>
                  </div>
                </div>
                <div className="mt-2 pl-2 flex flex-wrap gap-4 text-[10px] font-semibold text-slate-600">
                  <span className="flex items-center gap-1"><Phone size={11} className="text-slate-400" /> {hospital.phone}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={11} className="text-slate-400" /> {hospital.whatsapp}</span>
                </div>
                <div className="mt-3 pl-2 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-red-700 text-[10px] font-bold">
                  <AlertCircle size={13} className="text-red-500" /> Emergência: <b className="font-black">112</b>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
