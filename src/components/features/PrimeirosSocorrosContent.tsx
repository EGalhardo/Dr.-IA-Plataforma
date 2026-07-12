/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Scissors, Activity, AlertCircle, Heart, ShieldAlert, ChevronRight, ArrowLeft, CheckCircle2, AlertTriangle, PhoneCall, HelpCircle, Eye, Bug } from 'lucide-react';
import { FirstAidTopic } from '../../types/dria';
import { MOCK_FIRST_AID } from '../../constants/driaMocks';
import { useLanguage } from '../../hooks/useLanguage';
import { LazyImage } from '../ui/LazyImage';

export function PrimeirosSocorrosContent() {
  const { t } = useLanguage();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const selectedTopic = MOCK_FIRST_AID.find(t => t.id === selectedTopicId);

  const getIconComponent = (iconName: string, customSize = 24) => {
    switch (iconName) {
      case 'Flame': return <Flame className="text-orange-500" size={customSize} />;
      case 'Scissors': return <Scissors className="text-blue-500" size={customSize} />;
      case 'Activity': return <Activity className="text-purple-500" size={customSize} />;
      case 'AlertCircle': return <AlertCircle className="text-red-500" size={customSize} />;
      case 'ShieldAlert': return <ShieldAlert className="text-yellow-600" size={customSize} />;
      case 'Heart': return <Heart className="text-rose-500" size={customSize} />;
      case 'Bug': return <Bug className="text-red-600" size={customSize} />;
      default: return <HelpCircle className="text-slate-500" size={customSize} />;
    }
  };

  const getTopicColorTheme = (id: string) => {
    switch (id) {
      case 'fa-burn': return { bg: 'bg-orange-50', border: 'border-orange-100', icon: 'text-orange-500', accent: 'from-orange-500 to-red-500' };
      case 'fa-cuts': return { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-500', accent: 'from-blue-500 to-cyan-500' };
      case 'fa-seizure': return { bg: 'bg-purple-50', border: 'border-purple-100', icon: 'text-purple-500', accent: 'from-purple-500 to-violet-500' };
      case 'fa-choking': return { bg: 'bg-red-50', border: 'border-red-100', icon: 'text-red-500', accent: 'from-red-500 to-rose-500' };
      case 'fa-stroke': return { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-yellow-600', accent: 'from-amber-500 to-yellow-500' };
      case 'fa-heart': return { bg: 'bg-rose-50', border: 'border-rose-100', icon: 'text-rose-500', accent: 'from-rose-500 to-pink-500' };
      case 'fa-malaria': return { bg: 'bg-red-50', border: 'border-red-100', icon: 'text-red-600', accent: 'from-red-500 to-rose-600' };
      default: return { bg: 'bg-slate-50', border: 'border-slate-100', icon: 'text-slate-500', accent: 'from-slate-500 to-slate-600' };
    }
  };

  const stepCardColors = [
    { bg: 'bg-[#F0F4FF]', text: 'text-blue-800', border: 'border-blue-100', accent: 'text-blue-600' }, // Light Blue
    { bg: 'bg-[#F2F9F2]', text: 'text-green-800', border: 'border-green-100', accent: 'text-green-600' }, // Light Green
    { bg: 'bg-[#F5F0FF]', text: 'text-purple-800', border: 'border-purple-100', accent: 'text-purple-600' }, // Light Purple
    { bg: 'bg-[#FFF9E6]', text: 'text-amber-800', border: 'border-amber-100', accent: 'text-amber-600' } // Light Yellow
  ];

  return (
    <div className="space-y-6 text-left font-sans">
      
      <AnimatePresence mode="wait">
        {!selectedTopic ? (
          
          /* VIEW 1: GRID OF TOPICS */
          <motion.div
            key="grid-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Banner */}
            <div className="bg-gradient-to-r from-[#0E2B64] to-indigo-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 top-0 w-1/4 opacity-10 flex items-center justify-center">
                <Heart size={140} />
              </div>
              <div className="max-w-xl space-y-2 relative z-10">
                <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase">Apoio de Emergência</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">Guias Rápidos de Primeiros Socorros</h2>
                <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                  Manuais ilustrados e simplificados para apoio imediato em acidentes domésticos ou emergências agudas, antes da chegada da assistência médica.
                </p>
              </div>
            </div>

            {/* Emergency Quick Call Bar */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-bounce">
                  <PhoneCall size={20} />
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-xs font-black text-slate-900 uppercase leading-none">Contacto de Emergência Nacional (Angola)</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Ligue de imediato para o INEMA ou Bombeiros em caso de perigo de vida.</p>
                </div>
              </div>
              <a
                href="tel:112"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
              >
                Ligar 112 / 116
              </a>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_FIRST_AID.map((topic) => {
                const c = getTopicColorTheme(topic.id);
                return (
                  <motion.div key={topic.id} whileHover={{ y: -3 }}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden group flex flex-col justify-between">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className="space-y-3">
                      <div className={`w-12 h-12 rounded-2xl ${c.bg} ${c.icon} border ${c.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        {getIconComponent(topic.icon, 20)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1 group-hover:text-red-600 transition-colors">{topic.title}</h4>
                        <p className="text-[10.5px] text-slate-500 leading-relaxed font-semibold line-clamp-2">{topic.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black text-indigo-600 uppercase tracking-wider pt-4 group-hover:gap-2 transition-all border-t border-slate-50 mt-2">
                      <span>Ver Instruções</span> <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          
          /* VIEW 2: DETAILED MANUAL STEP-BY-STEP (Adapting layout to the requested model) */
          <motion.div
            key="details-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 w-full bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm"
          >
            {/* Top Back Nav Button - Aligned with the image: blue text, hover effect */}
            <button
              onClick={() => setSelectedTopicId(null)}
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-all cursor-pointer border-none bg-transparent p-0 outline-none"
            >
              ← Voltar para Educação
            </button>

            {/* Header Title with Custom Red Bug Icon (as shown in the image) */}
            <div className="flex items-center gap-2.5 pt-1">
              <div className="p-1 rounded-xl bg-red-50/50">
                {getIconComponent(selectedTopic.icon, 28)}
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                {selectedTopic.title}
              </h1>
            </div>

            {/* "O que é..." Section */}
            <div className="space-y-2 pt-2">
              <h2 className="text-base md:text-lg font-bold text-slate-900">
                {selectedTopic.id === 'fa-malaria' ? 'O que é a Malária?' : `O que é: ${selectedTopic.title}?`}
              </h2>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                {selectedTopic.description}
              </p>
            </div>

            {/* "Sintomas Principais" Section */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base md:text-lg font-bold text-slate-900">
                {selectedTopic.id === 'fa-malaria' ? 'Sintomas Principais' : 'Sinais de Alarme & Sintomas'}
              </h2>
              <ul className="space-y-2.5 pl-2">
                {selectedTopic.dangerSignals.map((sig, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700 font-semibold leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0 mt-2" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* "Como Prevenir / Como Proceder" Grid of Cards with Soft Colors */}
            <div className="space-y-4 pt-3">
              <h2 className="text-base md:text-lg font-bold text-slate-900">
                {selectedTopic.id === 'fa-malaria' ? 'Como Prevenir' : 'Como Proceder / Conduta'}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedTopic.steps.slice(0, 4).map((step, idx) => {
                  const hasColon = step.includes(':');
                  const cardTitle = hasColon ? step.split(':')[0].trim() : `${t('Passo')} ${idx + 1}`;
                  const cardDesc = hasColon ? step.split(':').slice(1).join(':').trim() : step;
                  const style = stepCardColors[idx % stepCardColors.length];

                  return (
                    <div 
                      key={idx} 
                      className={`p-5 rounded-2xl ${style.bg} border ${style.border} text-left space-y-1.5 shadow-sm`}
                    >
                      <h4 className={`text-xs md:text-[13.5px] font-black ${style.accent}`}>
                        {cardTitle}
                      </h4>
                      <p className="text-[11.5px] md:text-xs text-slate-600 font-semibold leading-relaxed">
                        {cardDesc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* If there are more than 4 steps, show them in a neat continuation list */}
              {selectedTopic.steps.length > 4 && (
                <div className="pt-2 space-y-2">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Passos de Apoio Adicionais</span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {selectedTopic.steps.slice(4).map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 leading-relaxed text-xs font-semibold">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 5}
                        </span>
                        <p className="flex-1 font-semibold">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Full-width callout: "Quando Procurar Ajuda Médica" with red sidebar and light red background */}
            <div className="p-5 bg-[#FFF0F2] border-l-[3.5px] border-red-600 rounded-r-2xl text-left space-y-1.5 mt-8">
              <h4 className="text-xs md:text-sm font-black text-[#991B1B] uppercase tracking-wide">
                {selectedTopic.id === 'fa-malaria' ? 'Quando Procurar Ajuda Médica' : 'Quando Procurar Ajuda Médica Imediata'}
              </h4>
              <p className="text-[11.5px] md:text-xs text-slate-800 font-semibold leading-relaxed">
                {selectedTopic.id === 'fa-malaria' 
                  ? 'Procure imediatamente uma unidade de saúde se apresentar febre após visitar uma área endémica de malária, mesmo semanas depois da viagem.'
                  : `Se os sinais críticos acima persistirem, não hesite: procure imediatamente o serviço de atendimento permanente ou hospitalar mais próximo da sua residência.`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
