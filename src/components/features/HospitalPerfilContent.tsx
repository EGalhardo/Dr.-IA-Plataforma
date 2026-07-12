/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  ArrowLeft, 
  Eye, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  FileText, 
  Plus, 
  Save, 
  Sliders, 
  Database, 
  History, 
  Send, 
  MessageSquare, 
  AlertCircle, 
  FileUp,
  Brain,
  ChevronRight,
  Globe,
  Gauge,
  Clock,
  User,
  Users,
  Search
} from 'lucide-react';
import { DriaHospital } from '../../types/dria';
import { useLanguage } from '../../hooks/useLanguage';

interface HospitalPerfilContentProps {
  hospital: DriaHospital;
  onUpdateHospital: (updated: DriaHospital) => void;
  setTab?: (tabId: string) => void;
}

export function HospitalPerfilContent({ hospital, onUpdateHospital, setTab }: HospitalPerfilContentProps) {
  const { t } = useLanguage();
  
  // Tabs: 'config' | 'chat' | 'knowledge' | 'history'
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'chat' | 'knowledge' | 'history'>('config');
  
  // Configuration Settings
  const [assistantName, setAssistantName] = useState('Assistente Clínico DR.IA - Luanda Geral');
  const [systemInstructions, setSystemInstructions] = useState(
`Você é o assistente virtual oficial do Hospital Geral de Luanda (DR.IA) de Angola. O DR.IA é uma plataforma de triagem inteligente e primeiros socorros que ajuda os cidadãos a receberem orientações médicas rápidas e a evitar deslocações desnecessárias a hospitais para casos simples.

Responda apenas sobre assuntos relacionados com:
- Orientação de Primeiros Socorros
- Triagem rápida de sintomas (febre, dor de cabeça, tosse, erupções cutâneas, etc.)
- Informações sobre especialidades médicas do Hospital Geral de Luanda
- Encaminhamento célere para urgências em casos graves
- Agendamento de consultas locais

REGRAS OPERATIVAS:
1. Seja altamente formal, empático, acolhedor e profissional.
2. Use termos oficiais de saúde de Angola.
3. Nunca prescreva medicamentos sujeitos a receita médica; recomende sempre a consulta de um clínico.
4. Caso detete sintomas graves (Ex: dor forte no peito, dificuldade respiratória severa, perda de consciência), indique imediatamente o envio do relatório de triagem para a urgência do hospital para atendimento sem esperas.`
  );
  const [selectedModel, setSelectedModel] = useState('Llama 3.1 8B (Groq)');
  const [temperature, setTemperature] = useState(0.3);
  
  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Knowledge Base State
  const [files, setFiles] = useState([
    { id: '1', name: "Regulamento_Triagem_HGL.pdf", size: "2.4 MB", date: "15/06/2026", type: "PDF" },
    { id: '2', name: "Manual_Atendimento_Clinico.docx", size: "1.1 MB", date: "15/06/2026", type: "DOCX" },
    { id: '3', name: "Politica_Privacidade_HGL.pdf", size: "890 KB", date: "14/06/2026", type: "PDF" },
    { id: '4', name: "Perguntas_Frequentes_Sintomas.txt", size: "320 KB", date: "14/06/2026", type: "TXT" },
    { id: '5', name: "Procedimentos_Urgencias_2026.pdf", size: "3.2 MB", date: "11/06/2026", type: "PDF" },
    { id: '6', name: "Guia_Sintomas_Epidemicos.pdf", size: "1.8 MB", date: "10/06/2026", type: "PDF" },
  ]);
  
  // Simulated File Upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Chat Test State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot', text: string, timestamp: string }>>([
    { sender: 'bot', text: 'Olá! Sou o Assistente Clínico DR.IA configurado para o Hospital Geral de Luanda. Pode fazer qualquer pergunta ou descrever sintomas para testar o meu comportamento operacional.', timestamp: '12:00' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Chat Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Simulated Historical Queries
  const [historyQueries] = useState([
    { id: 'h1', patientName: "Edlasio Galhardo", symptoms: "Febre alta e tosse seca", priority: "Alta", date: "Hoje, 10:15", status: "Relatório Enviado" },
    { id: 'h2', patientName: "Maria Manuel", symptoms: "Dor de estômago intensa", priority: "Média", date: "Ontem, 16:45", status: "Triada em Casa" },
    { id: 'h3', patientName: "Pedro Neto", symptoms: "Suspeita de torção no pé", priority: "Baixa", date: "29 Jun, 11:20", status: "Orientada" },
    { id: 'h4', patientName: "Ana Sousa", symptoms: "Dificuldade respiratória aguda", priority: "Muito Alta", date: "28 Jun, 09:12", status: "Relatório Enviado" },
    { id: 'h5', patientName: "Carlos André", symptoms: "Sintomas ligeiros de gripe", priority: "Baixa", date: "26 Jun, 14:30", status: "Triada em Casa" },
  ]);

  // Handle Save settings
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      
      // Call parent update optionally
      onUpdateHospital({
        ...hospital
      });
    }, 1000);
  };

  // Handle delete file
  const handleDeleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // Handle simulated file add
  const handleAddFileSimulated = () => {
    setIsUploading(true);
    setTimeout(() => {
      const fileNames = [
        "Diretivas_Primeiros_Socorros_2026.pdf",
        "Protocolo_Manejo_Dengue_Malaria.pdf",
        "Instrucoes_Atendimento_Rapido.docx",
        "Regulamento_Urgencias_Luanda.pdf"
      ];
      const randomName = fileNames[Math.floor(Math.random() * fileNames.length)];
      const randomSize = (Math.random() * 2 + 1).toFixed(1) + " MB";
      
      const newFile = {
        id: Date.now().toString(),
        name: randomName,
        size: randomSize,
        date: "Hoje mesmo",
        type: randomName.endsWith('.docx') ? 'DOCX' : 'PDF'
      };
      
      setFiles(prev => [...prev, newFile]);
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
    }, 1500);
  };

  // Handle interactive testing response
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = "";
      const msgLower = userMsg.toLowerCase();

      if (msgLower.includes('febre') || msgLower.includes('quente')) {
        botResponse = "Entendido. A febre é uma resposta de defesa do corpo. Se a temperatura for superior a 38.5°C, aplique compressas mornas na testa/axilas e beba bastantes líquidos. Evite cobrir-se em excesso. Se a febre persistir por mais de 3 dias, for acompanhada de rigidez no pescoço ou manchas na pele, dirija-se de imediato à triagem do Hospital Geral de Luanda.";
      } else if (msgLower.includes('dor de cabeça') || msgLower.includes('enxaqueca')) {
        botResponse = "Para dor de cabeça, repouse num local escuro e silencioso e mantenha-se bem hidratado. Evite usar ecrãs (telemóvel/computador). Se a dor for súbita e de intensidade extremamente forte (como nunca sentiu antes) ou vier acompanhada de formigueiro num braço ou dificuldade em falar, isso constitui uma urgência neurológica - ligue para a emergência.";
      } else if (msgLower.includes('dor no peito') || msgLower.includes('coração') || msgLower.includes('enfarte')) {
        botResponse = "⚠️ ATENÇÃO: Dor ou sensação de aperto no peito, especialmente se irradiar para o braço esquerdo, mandíbula ou costas, acompanhada de suores frios ou falta de ar, é um sinal de emergência cardiovascular! Acionámos o envio do pré-relatório e o seu estado de gravidade foi elevado. Dirija-se imediatamente à urgência do Hospital Geral de Luanda!";
      } else if (msgLower.includes('queimadura') || msgLower.includes('queimei')) {
        botResponse = "Para queimaduras térmicas ligeiras, coloque a área sob água fria corrente por 10 a 15 minutos. Não aplique produtos caseiros como pasta de dentes, óleos ou gelo direto. Se houver bolhas rompidas ou pele carbonizada (queimadura de 2º ou 3º grau), cubra com um pano limpo sem apertar e procure atendimento médico.";
      } else if (msgLower.includes('ola') || msgLower.includes('olá') || msgLower.includes('bom dia') || msgLower.includes('boa tarde')) {
        botResponse = `Olá! Sou o assistente clínico inteligente do Hospital Geral de Luanda. Estou pronto para ajudar a triar sintomas ou orientar sobre primeiros socorros. Como se sente hoje?`;
      } else {
        botResponse = `Agradeço o seu relato clínico. Com base nas instruções do Hospital Geral de Luanda, os seus sintomas sugerem a necessidade de repouso e monitorização cuidadosa de sinais de alarme. Lembre-se de não tomar medicamentos sem aconselhamento profissional. Caso os sintomas piorem, a nossa IA enviará o relatório diretamente para a equipa médica e indicaremos a deslocação à urgência.`;
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse, timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="w-full space-y-6 text-left font-sans">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0E2B64] to-indigo-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 flex items-center justify-center">
          <svg width="130" height="130" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2a4 4 0 0 1 4 4v1h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2V6a4 4 0 0 1 4-4z"/></svg>
        </div>
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase">Inteligência Artificial Hospitalar</span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">Assistente IA do Hospital</h2>
          <p className="text-xs text-indigo-200 leading-relaxed font-semibold">Configure o assistente clínico, carregue a base de conhecimento e teste o comportamento do modelo.</p>
        </div>
      </div>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">IA</h1>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full border border-indigo-100 uppercase">Configuração Assistente</span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">Configure e gerencie o assistente virtual da sua instituição médica.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Back Button */}
          <button aria-label="Voltar ao painel" 
            onClick={() => setTab && setTab('hospital-dashboard')}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft size={13} className="text-slate-500" />
            Voltar ao Painel
          </button>

          {/* Active Status Badge */}
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span>Integração IA Ativa</span>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION & PREVIEW ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'config', label: 'CONFIGURAÇÃO', icon: <Sliders size={12} /> },
            { id: 'chat', label: 'CHAT TESTE', icon: <MessageSquare size={12} /> },
            { id: 'knowledge', label: 'BASE DE CONHECIMENTO', icon: <Database size={12} /> },
            { id: 'history', label: 'HISTÓRICO', icon: <History size={12} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === tab.id 
                  ? 'bg-[#0E2B64] text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowPreviewModal(true)}
          className="px-4 py-1.5 bg-[#0E2B64] hover:bg-indigo-950 text-white font-black text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <Eye size={13} />
          Pré-Visualizar Assistente
        </button>
      </div>

      {/* RENDER ACTIVE TAB CONTENT */}
      <div className="space-y-6">
        
        {/* TAB 1: CONFIGURAÇÃO */}
        {activeSubTab === 'config' && (
          <div className="space-y-6">
            
            {/* ROW 1: PROFILE IDENTITY & STATS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Card 1: Assistente Identity (lg:col-span-5) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="w-16 h-16 bg-[#0E2B64] rounded-full shrink-0 flex flex-col items-center justify-center text-white border-4 border-slate-50 relative shadow-sm">
                    <span className="text-[14px] font-black tracking-tighter leading-none text-white">DR.IA</span>
                    <span className="text-[7px] font-black uppercase text-indigo-200 tracking-wider mt-0.5 leading-none">HGL</span>
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Assistente Clínico DR.IA</h3>
                      <button 
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('assistant-name-input');
                          if (input) input.focus();
                        }}
                        className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                        title="Editar Nome"
                      >
                        <Sliders size={12} className="text-slate-400 hover:text-[#0E2B64]" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      Assistente de saúde virtual do Hospital Geral de Luanda que ajuda os cidadãos com triagem pré-hospitalar, primeiros socorros e direcionamento médico seguro.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-50/70 rounded-lg flex items-center justify-center shrink-0 border border-indigo-100/30">
                      <Brain size={13} className="text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-[7.5px] text-slate-400 font-black uppercase block tracking-wider leading-none">Modelo IA</span>
                      <span className="text-[10px] text-slate-700 font-black block mt-0.5 leading-none truncate max-w-[70px]" title={selectedModel}>{selectedModel.replace(' (Groq)', '').replace(' (Google)', '').replace(' (OpenAI)', '')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-50/70 rounded-lg flex items-center justify-center shrink-0 border border-indigo-100/30">
                      <Globe size={13} className="text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-[7.5px] text-slate-400 font-black uppercase block tracking-wider leading-none">Idioma</span>
                      <span className="text-[10px] text-slate-700 font-black block mt-0.5 leading-none">Pt Angola</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-50/70 rounded-lg flex items-center justify-center shrink-0 border border-indigo-100/30">
                      <Sliders size={13} className="text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-[7.5px] text-slate-400 font-black uppercase block tracking-wider leading-none">Temp</span>
                      <span className="text-[10px] text-slate-700 font-black block mt-0.5 leading-none">{temperature}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0 border border-emerald-100/30">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    </div>
                    <div>
                      <span className="text-[7.5px] text-slate-400 font-black uppercase block tracking-wider leading-none">Estado</span>
                      <span className="text-[10px] text-emerald-600 font-black block mt-0.5 leading-none">Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Estatísticas do Assistente (lg:col-span-7) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Estatísticas do Assistente</h4>
                  <button 
                    type="button" 
                    onClick={() => {
                      // refresh animations
                    }}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                    title="Atualizar Estatísticas"
                  >
                    <RotateCcw size={12} className="animate-spin-slow" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Conversations */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center gap-2.5 shadow-sm hover:border-purple-200 transition-all">
                    <div className="w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center shrink-0">
                      <MessageSquare size={15} className="text-purple-600" />
                    </div>
                    <div>
                      <span className="text-[13px] font-black text-slate-900 block leading-none">1,248</span>
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">Conversas</span>
                    </div>
                  </div>

                  {/* Users */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center gap-2.5 shadow-sm hover:border-blue-200 transition-all">
                    <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                      <Users size={15} className="text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[13px] font-black text-slate-900 block leading-none">856</span>
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">Utentes</span>
                    </div>
                  </div>

                  {/* Resolutions */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center gap-2.5 shadow-sm hover:border-emerald-200 transition-all">
                    <div className="w-9 h-9 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[13px] font-black text-slate-900 block leading-none">94%</span>
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">Triagens</span>
                    </div>
                  </div>

                  {/* Medium Time */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center gap-2.5 shadow-sm hover:border-amber-200 transition-all">
                    <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                      <Clock size={15} className="text-amber-600" />
                    </div>
                    <div>
                      <span className="text-[13px] font-black text-slate-900 block leading-none">45s</span>
                      <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider block mt-1">T. Médio</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-2.5 flex items-center gap-2 hover:bg-emerald-50 transition-colors">
                    <Sparkles size={13} className="text-emerald-600" />
                    <span className="text-[8.5px] text-emerald-800 font-extrabold uppercase tracking-wider">Activos Hoje:</span>
                    <span className="text-xs font-black text-emerald-950 ml-auto">128</span>
                  </div>

                  <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-xl p-2.5 flex items-center gap-2 hover:bg-indigo-50 transition-colors">
                    <Database size={13} className="text-[#0E2B64]" />
                    <span className="text-[8.5px] text-indigo-900 font-extrabold uppercase tracking-wider">Docs Indexados:</span>
                    <span className="text-xs font-black text-indigo-950 ml-auto">{files.length} ficheiros</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ROW 2: FORM & KNOWLEDGE BASE SIDE BY SIDE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form (lg:col-span-6) */}
              <div className="lg:col-span-6">
                <form onSubmit={handleSaveConfig} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between h-full">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                      <Sliders className="text-indigo-600" size={14} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase">Configuração Geral</h3>
                      <p className="text-[8.5px] text-slate-400 font-extrabold uppercase">Configure as definições básicas do seu assistente.</p>
                    </div>
                  </div>

                  {saveSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-2"
                    >
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      Definições guardadas com sucesso!
                    </motion.div>
                  )}

                  <div className="space-y-4 flex-1">
                    {/* Name input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Nome do Assistente</label>
                      <input
                        id="assistant-name-input"
                        type="text"
                        required
                        value={assistantName}
                        onChange={e => setAssistantName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                      />
                    </div>

                    {/* System instruction prompt */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Descrição / Instrução do Sistema</label>
                      <textarea
                        required
                        rows={7}
                        value={systemInstructions}
                        onChange={e => setSystemInstructions(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium font-sans text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm leading-relaxed resize-none scrollbar-thin h-[180px]"
                      />
                    </div>

                    {/* Model & Temp select */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Modelo IA</label>
                        <select
                          value={selectedModel}
                          onChange={e => setSelectedModel(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
                        >
                          <option value="Llama 3.1 8B (Groq)">Llama 3.1 8B (Groq)</option>
                          <option value="Llama 3.1 70B (Groq)">Llama 3.1 70B (Groq)</option>
                          <option value="Gemini 1.5 Flash (Google)">Gemini 1.5 Flash (Google)</option>
                          <option value="GPT-4o mini (OpenAI)">GPT-4o mini (OpenAI)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Temperatura</label>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          required
                          value={temperature}
                          onChange={e => setTemperature(parseFloat(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-2.5 bg-[#0E2B64] hover:bg-indigo-950 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Save size={14} />
                      {isSaving ? 'A GUARDAR...' : 'GUARDAR CONFIGURAÇÃO'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Base de Conhecimento (lg:col-span-6) */}
              <div className="lg:col-span-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                        <Database className="text-[#0E2B64]" size={14} />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase">Base de Conhecimento</h3>
                        <p className="text-[8.5px] text-slate-400 font-extrabold uppercase">Repositório de suporte técnico-científico que instrui a IA.</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-indigo-100">
                      {files.length} ficheiros
                    </span>
                  </div>

                  {uploadSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      Novo manual clínico indexado!
                    </div>
                  )}

                  {/* Scrollable file list */}
                  <div className="space-y-2 h-[265px] overflow-y-auto pr-1 scrollbar-thin">
                    {files.map((file) => (
                      <div 
                        key={file.id} 
                        className="p-2.5 bg-slate-50/50 border border-slate-150 rounded-xl hover:border-indigo-100 hover:bg-slate-50/80 transition-all flex items-center justify-between shadow-sm"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center border border-red-100 shrink-0">
                            <FileText size={15} />
                          </div>
                          <div className="truncate">
                            <h4 className="text-[11px] font-black text-slate-800 truncate" title={file.name}>{file.name}</h4>
                            <div className="flex items-center gap-2 text-[8px] text-slate-400 font-black uppercase mt-0.5">
                              <span>{file.type}</span>
                              <span>•</span>
                              <span>{file.size}</span>
                              <span>•</span>
                              <span>{file.date}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors shrink-0 ml-2"
                          title="Remover ficheiro"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add File button */}
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleAddFileSimulated}
                      disabled={isUploading}
                      className="w-full py-2.5 bg-[#0E2B64] hover:bg-indigo-950 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus size={14} />
                      {isUploading ? 'A CARREGAR FICHEIRO...' : 'ADICIONAR FICHEIRO(S)'}
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: CHAT TESTE */}
        {activeSubTab === 'chat' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[550px]">
            {/* Chat header */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#0E2B64] rounded-full flex items-center justify-center text-white">
                  <Bot size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase">Consola de Teste de Conversação</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Simule consultas em tempo real para validar as diretivas clínicas.</p>
                </div>
              </div>
              
              <button 
                onClick={() => setChatMessages([{ sender: 'bot', text: 'Olá! Sou o Assistente Clínico DR.IA configurado para o Hospital Geral de Luanda. Pode fazer qualquer pergunta ou descrever sintomas para testar o meu comportamento operacional.', timestamp: '12:00' }])}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                title="Limpar Conversa"
              >
                <RotateCcw size={12} />
                Limpar
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30 scrollbar-thin">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#0E2B64] text-white rounded-br-none shadow-sm' 
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.sender === 'bot' && (
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">Dr.IA Clínico</span>
                        <span className="text-[8px] bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded border border-indigo-100 font-bold">Assistente</span>
                      </div>
                    )}
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span className={`text-[8.5px] block mt-1 text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                placeholder="Escreva uma mensagem de sintoma (ex: Estou com febre alta...)"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500 shadow-sm"
              />
              <button
                type="submit"
                className="px-4 bg-[#0E2B64] hover:bg-indigo-950 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors shadow-sm"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: BASE DE CONHECIMENTO */}
        {activeSubTab === 'knowledge' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="text-[#0E2B64] shrink-0" size={18} />
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase">Repositório de Conhecimento Clinico</h3>
                  <p className="text-[8.5px] text-slate-400 font-extrabold uppercase">Gerencie os ficheiros de suporte técnico-científico que instruem a sua IA.</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-indigo-100">
                {files.length} ficheiros indexados
              </span>
            </div>

            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                Ficheiro Carregado e Indexado com Sucesso! O conhecimento da IA foi enriquecido.
              </div>
            )}

            {/* Document list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  className="p-3 bg-slate-50/50 border border-slate-200/80 rounded-xl hover:border-indigo-200 transition-all flex items-start justify-between group shadow-sm"
                >
                  <div className="flex gap-2.5">
                    <div className="w-9 h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center border border-red-100 shrink-0">
                      <FileText size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 line-clamp-1">{file.name}</h4>
                      <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                        <span>{file.type}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.date}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                    title="Excluir ficheiro"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add document section */}
            <div className="p-6 border border-dashed border-slate-200 rounded-2xl text-center space-y-4 hover:border-indigo-400 transition-colors bg-slate-50/30">
              <div className="mx-auto w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                <FileUp size={20} />
              </div>
              <div className="max-w-xs mx-auto">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase">Carregar Manuais Clínicos</h4>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">
                  Arraste Manuais de Primeiros Socorros, cartilhas do MINSA ou PDFs de procedimentos clínicos. Tamanho máximo: 15MB.
                </p>
              </div>

              <button
                onClick={handleAddFileSimulated}
                disabled={isUploading}
                className="px-5 py-2.5 bg-[#0E2B64] hover:bg-indigo-950 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-sm flex items-center gap-1.5 mx-auto cursor-pointer"
              >
                <Plus size={14} />
                {isUploading ? 'A Carregar e Analisar...' : 'Adicionar Ficheiro(s)'}
              </button>
            </div>

          </div>
        )}

        {/* TAB 4: HISTÓRICO */}
        {activeSubTab === 'history' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-900 uppercase">Histórico de Atividade Dr.IA</h3>
              <p className="text-[8.5px] text-slate-400 font-extrabold uppercase">Sessões recentes de triagem inteligente efetuadas pelos pacientes associados a esta unidade.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[9.5px] text-slate-400 font-black uppercase tracking-wider">
                    <th className="py-2.5 px-3">Paciente</th>
                    <th className="py-2.5 px-3">Sintomas Detetados</th>
                    <th className="py-2.5 px-3">Prioridade</th>
                    <th className="py-2.5 px-3">Data/Hora</th>
                    <th className="py-2.5 px-3">Estado Triagem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyQueries.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3">
                        <span className="text-xs font-extrabold text-slate-800">{item.patientName}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs text-slate-600 font-medium">{item.symptoms}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase ${
                          item.priority === 'Alta' || item.priority === 'Muito Alta'
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : item.priority === 'Média'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-green-50 text-green-700 border border-green-100'
                        }`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[10.5px] text-slate-400 font-semibold">
                        {item.date}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          item.status === 'Relatório Enviado'
                            ? 'bg-red-50 text-red-600 font-bold'
                            : 'bg-indigo-50 text-indigo-600'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* DISCLAIMER / MOTOR IA NOTIFICATION */}
      <div className="bg-indigo-50/40 border border-indigo-100/50 p-4 rounded-xl flex items-start gap-3">
        <Brain className="text-indigo-600 shrink-0 mt-0.5" size={16} />
        <div>
          <span className="text-[10px] font-black uppercase text-indigo-950 tracking-wider block">Motor IA Operacional</span>
          <p className="text-[9.5px] text-slate-500 font-medium leading-relaxed mt-1">
            O assistente clínico utiliza o modelo <strong className="text-indigo-800 font-black">Llama-3.1-8b-instant</strong> da Groq via API Segura. As instruções configuradas neste painel institucional são enviadas dinamicamente ao modelo em cada início de triagem. A integração ativa garante respostas totalmente alinhadas às diretrizes do Ministério da Saúde de Angola.
          </p>
        </div>
      </div>

      {/* PREVIEW ASSISTANT MODAL */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden border border-slate-200 shadow-xl"
            >
              <div className="bg-[#0E2B64] p-5 text-white text-center relative">
                <button 
                  onClick={() => setShowPreviewModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white font-bold cursor-pointer text-sm"
                >
                  ✕
                </button>
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto border-2 border-white/20 mb-3 shadow">
                  <Bot size={28} />
                </div>
                <h4 className="text-sm font-black uppercase tracking-tight">{assistantName}</h4>
                <p className="text-[9.5px] text-indigo-100 font-medium mt-1">Simulador de Experiência do Utente (Cidadão)</p>
              </div>

              <div className="p-5 space-y-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 bg-[#0E2B64] text-white rounded-full flex items-center justify-center shrink-0">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                      <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                        Olá! Como posso ajudar na sua saúde hoje? Se necessário, farei um relatório rápido de triagem para os médicos de urgência do Hospital Geral.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2.5 justify-end">
                    <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[80%]">
                      <p className="text-[11px] leading-relaxed font-bold">
                        Estou com febre há dois dias e tosse.
                      </p>
                    </div>
                    <div className="w-7 h-7 bg-indigo-500 text-white rounded-full flex items-center justify-center shrink-0">
                      <User size={14} />
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button 
                    onClick={() => {
                      setShowPreviewModal(false);
                      setActiveSubTab('chat');
                    }}
                    className="px-4 py-2 bg-[#0E2B64] hover:bg-indigo-950 text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer shadow-sm w-full transition-colors"
                  >
                    Abrir Chat Interativo Completo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
