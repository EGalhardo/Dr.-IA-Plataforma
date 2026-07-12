/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * MINSA — Inteligência Artificial Nacional
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot, Brain, Save, CheckCircle2, Trash2,
  Database, Send, Upload, Globe, Search, Hospital,
  Activity, Shield, RefreshCw, Eye, MessageSquare,
  Building2, ToggleLeft, ToggleRight, Download, Sliders
} from 'lucide-react';
import { DriaHospital } from '../../types/dria';
import { MOCK_HOSPITALS } from '../../constants/driaMocks';
import { useLanguage } from '../../hooks/useLanguage';

interface MinsaIaContentProps {
  hospitals?: DriaHospital[];
  onUpdateHospital?: (updated: DriaHospital) => void;
}

export function MinsaIaContent({ hospitals = MOCK_HOSPITALS, onUpdateHospital }: MinsaIaContentProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'config' | 'hospitais' | 'conhecimento' | 'chat'>('config');

  const [model, setModel] = useState('Gemini 2.5 Flash');
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [instructions, setInstructions] = useState(
    'Você é o Assistente Nacional de IA do MINSA. Funções: Triagem Nacional, Vigilância Epidemiológica, Alertas automáticos, Recomendações estratégicas e Relatórios executivos.'
  );

  const [hospitalSearch, setHospitalSearch] = useState('');
  // IMPORTANTE: NÃO guardar cópia local de hospitals — quebraria a sincronização com o estado global.
  // Usamos directamente a prop `hospitals` (que vem reactivamente do App.tsx / Supabase).
  const toggleHospitalAI = (id: string) => {
    const target = hospitals.find(h => h.id === id);
    if (!target) return;
    const updated: DriaHospital = {
      ...target,
      integrationState: target.integrationState === 'Ativo' ? 'Inativo' : 'Ativo',
    };
    onUpdateHospital?.(updated);
  };
  const filteredHospitals = hospitals.filter(h => {
    const name = (h.name || '').toLowerCase();
    const muni = (h.municipality || '').toLowerCase();
    const q = hospitalSearch.toLowerCase();
    return name.includes(q) || muni.includes(q);
  });

  const [knowledgeFiles, setKnowledgeFiles] = useState([
    { id: '1', name: 'Plano_Nacional_Saude_2025-2030.pdf', size: '4.2 MB', date: '01/07/2026', type: 'PDF' },
    { id: '2', name: 'Protocolo_Vigilancia_Epidemiologica.pdf', size: '2.8 MB', date: '15/06/2026', type: 'PDF' },
    { id: '3', name: 'Guia_Manejo_Surtos_Ebola.pdf', size: '5.1 MB', date: '10/06/2026', type: 'PDF' },
    { id: '4', name: 'Diretrizes_Colera_OMS_Angola.docx', size: '1.7 MB', date: '05/06/2026', type: 'DOCX' },
    { id: '5', name: 'Manual_Triagem_Manchester_Nacional.pdf', size: '3.3 MB', date: '01/06/2026', type: 'PDF' },
    { id: '6', name: 'Plano_Contingencia_Malaria_2026.pdf', size: '2.1 MB', date: '20/05/2026', type: 'PDF' },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleDeleteFile = (id: string) => setKnowledgeFiles(prev => prev.filter(f => f.id !== id));
  const handleSimulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setKnowledgeFiles(prev => [...prev, {
        id: Date.now().toString(),
        name: 'Documento_Ministerial_2026.pdf',
        size: (Math.random() * 4 + 1).toFixed(1) + ' MB',
        date: 'Hoje', type: 'PDF'
      }]);
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
    }, 1500);
  };

  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'bot', text: 'Bom dia, Sr. Ministro. Sou o assistente IA nacional do MINSA. Preparado para analisar indicadores epidemiológicos, gerar relatórios e recomendar ações estratégicas.', time: '08:00' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const m = chatInput.trim();
    const now = new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
    setChatMessages(p => [...p, { sender: 'user', text: m, time: now }]);
    setChatInput('');
    setIsTyping(true);
    setTimeout(() => {
      let b = '';
      const l = m.toLowerCase();
      if (l.includes('surto') || l.includes('ébola'))
        b = '⚠️ ALERTA: Caso suspeito de Ébola em Maianga. Recomendo: ativar Equipa de Resposta Rápida, isolar contactos, notificar OMS e reforçar Hospital Josina Machel.';
      else if (l.includes('malária'))
        b = '📊 MALÁRIA: 11.560 triagens em 30 dias. Focos principais: Huambo (2.780), Malanje (2.100), Viana (2.150). Tendência +12%.';
      else if (l.includes('cólera'))
        b = '📊 CÓLERA: 68 casos. Foco ativo no Cazenga (+18% em 24h). Recomendo ativar UTC e distribuir SRO.';
      else if (l.includes('hospital') || l.includes('capacidade'))
        b = '🏥 6 hospitais integrados, 4 com IA ativa. Tempo médio de resposta: 22 minutos.';
      else if (l.includes('relatório'))
        b = '📄 Posso gerar: Boletim Epidemiológico Mensal, Relatório Nacional de Triagens, Plano de Contingência ou Estatísticas de Morbidade.';
      else
        b = 'Compreendido. Monitorizo 7 províncias e 20 municípios em tempo real. Posso fornecer análises detalhadas, relatórios ou recomendar ações.';
      setChatMessages(p => [...p, { sender: 'bot', text: b, time: now }]);
      setIsTyping(false);
    }, 1500);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => { setIsSaving(false); setSaveOk(true); setTimeout(() => setSaveOk(false), 2500); }, 1000);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0E2B64] to-indigo-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 flex items-center justify-center"><Brain size={130} /></div>
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase">Inteligência Artificial Nacional</span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">IA — Ministério da Saúde</h2>
          <p className="text-xs text-indigo-200 leading-relaxed font-semibold">Configure o assistente nacional, active a IA nos hospitais, faça upload da base de conhecimento e teste o modelo.</p>
        </div>
      </div>

      {saveOk && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider">
          <CheckCircle2 size={16} className="text-emerald-500" /> Configurações de IA Nacionais Gravadas
        </motion.div>
      )}

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex gap-1 shadow-sm">
        {[
          { id: 'config', label: 'Config. IA', icon: <Sliders size={14} /> },
          { id: 'hospitais', label: 'Hospitais IA', icon: <Building2 size={14} /> },
          { id: 'conhecimento', label: 'Base Conhecimento', icon: <Database size={14} /> },
          { id: 'chat', label: 'Teste IA', icon: <MessageSquare size={14} /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab.id ? 'bg-[#0E2B64] text-white shadow-md' : 'bg-transparent text-slate-500 hover:bg-slate-50'
            }`}>
            {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: CONFIG */}
        {activeTab === 'config' && (
          <motion.div key="config" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-5 shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Bot size={20} /></div>
              <div><h3 className="text-sm font-black text-slate-900 uppercase">Assistente Nacional — MINSA</h3><p className="text-[9px] text-slate-400 font-extrabold uppercase">Modelo, parâmetros e instruções</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5"><span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">Modelo de IA</span><select value={model} onChange={e => setModel(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm"><option>Gemini 2.5 Flash</option><option>Gemini 2.5 Pro</option><option>Llama 3.1 8B (Groq)</option></select></div>
              <div className="space-y-1.5"><span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">Temperatura</span><div className="flex items-center gap-3"><input type="range" min={0} max={100} value={temperature * 100} onChange={e => setTemperature(Number(e.target.value) / 100)} className="flex-1 accent-indigo-600" /><span className="text-xs font-black text-slate-800 w-8 text-right">{temperature.toFixed(1)}</span></div></div>
              <div className="space-y-1.5"><span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">Max Tokens</span><input type="number" value={maxTokens} onChange={e => setMaxTokens(Number(e.target.value))} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm" /></div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">Instruções do Sistema</span><span className="text-[8px] text-slate-400 font-bold">{instructions.length} caracteres</span></div>
              <textarea value={instructions} onChange={e => setInstructions(e.target.value)} className="w-full h-44 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 shadow-sm resize-none leading-relaxed font-mono" />
            </div>
            <button onClick={handleSave} aria-label="Guardar configuração de IA" disabled={isSaving} className="px-5 py-2.5 bg-[#0E2B64] hover:bg-[#081a3d] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer ml-auto"><Save size={14} />{isSaving ? 'A Gravar...' : 'Gravar Configuração'}</button>
          </motion.div>
        )}

        {/* TAB 2: HOSPITAIS */}
        {activeTab === 'hospitais' && (
          <motion.div key="hospitais" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Building2 size={16} className="text-indigo-600" /><h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Hospitais com IA Integrada</h3></div><span className="text-[9px] text-slate-400 font-extrabold uppercase">{hospitals.filter(h => h.integrationState === 'Ativo').length} de {hospitals.length} activos</span></div>
              <div className="flex items-center gap-2 border border-slate-200 focus-within:border-indigo-500 rounded-lg px-3 py-2 bg-white"><Search size={13} className="text-slate-400 shrink-0" /><input type="text" placeholder="Filtrar hospital..." value={hospitalSearch} onChange={e => setHospitalSearch(e.target.value)} className="w-full bg-transparent outline-none text-[10px] font-bold text-slate-800" /></div>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredHospitals.map(h => (
                <div key={h.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${h.integrationState === 'Ativo' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}><Hospital size={18} /></div>
                    <div className="text-left"><h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">{h.name}</h4><div className="flex items-center gap-2 mt-0.5"><span className="text-[9px] text-slate-400 font-bold">{h.municipality}</span><span className="text-[8px] text-slate-300">•</span><span className="text-[9px] text-slate-400 font-bold">{h.doctorsCount} médicos</span><span className="text-[8px] text-slate-300">•</span><span className="text-[9px] text-slate-400 font-bold">Espera: {h.avgWaitTime}</span></div><div className="flex flex-wrap gap-1 mt-1.5">{h.specialties.slice(0, 3).map((s, i) => (<span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-bold uppercase">{s}</span>))}</div></div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${h.integrationState === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>{h.integrationState === 'Ativo' ? 'IA Activa' : 'IA Inactiva'}</span>
                    <button onClick={() => toggleHospitalAI(h.id)} className={`p-2 rounded-xl cursor-pointer transition-all ${h.integrationState === 'Ativo' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{h.integrationState === 'Ativo' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 text-center text-[9px] text-slate-400 font-extrabold uppercase"><Globe size={12} className="inline mr-1 text-indigo-500" /> Sincronizado com o barramento nacional</div>
          </motion.div>
        )}

        {/* TAB 3: BASE DE CONHECIMENTO */}
        {activeTab === 'conhecimento' && (
          <motion.div key="conhecimento" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2"><Database size={16} className="text-indigo-600" /><div><h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Base de Conhecimento Nacional</h3><p className="text-[9px] text-slate-400 font-bold">{knowledgeFiles.length} documentos indexados</p></div></div>
              <button onClick={handleSimulateUpload} aria-label="Adicionar documento à base de conhecimento" disabled={isUploading} className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50">{isUploading ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}{isUploading ? 'A enviar...' : 'Adicionar Ficheiro'}</button>
            </div>
            {uploadSuccess && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Ficheiro enviado e indexado na base nacional!</motion.div>}
            <div className="divide-y divide-slate-100">
              {knowledgeFiles.map(f => (
                <div key={f.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${f.type === 'PDF' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>{f.type}</div>
                    <div className="text-left"><h4 className="text-[11px] font-extrabold text-slate-800">{f.name}</h4><div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold mt-0.5"><span>{f.size}</span><span>•</span><span>{f.date}</span></div></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400 hover:text-indigo-600"><Eye size={14} /></button>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-400 hover:text-indigo-600"><Download size={14} /></button>
                    <button onClick={() => handleDeleteFile(f.id)} className="p-1.5 hover:bg-red-50 rounded-lg cursor-pointer text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 text-center text-[9px] text-slate-400 font-extrabold uppercase"><Shield size={12} className="inline mr-1 text-indigo-500" /> Documentos encriptados nos servidores do Estado</div>
          </motion.div>
        )}

        {/* TAB 4: CHAT */}
        {activeTab === 'chat' && (
          <motion.div key="chat" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center"><Brain size={17} /></div><div><h4 className="text-[11px] font-black text-slate-800 uppercase">Teste do Assistente IA — MINSA</h4><p className="text-[8px] text-slate-400 font-bold">Modelo: {model} • Temp: {temperature}</p></div></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0"><Brain size={12} /></div>}
                  <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-[#0E2B64] text-white rounded-tr-none' : 'bg-slate-50 border text-slate-700 rounded-tl-none'}`}><span className="whitespace-pre-wrap">{msg.text}</span><div className={`text-[9px] mt-1.5 font-bold ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.time}</div></div>
                </div>
              ))}
              {isTyping && <div className="flex gap-3 justify-start"><div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0"><Brain size={12} /></div><div className="bg-slate-50 border rounded-2xl rounded-tl-none p-4 flex items-center gap-2"><RefreshCw size={14} className="animate-spin text-indigo-600" /><span className="text-[10px] text-slate-500 font-bold">A analisar dados nacionais...</span></div></div>}
            </div>
            <form onSubmit={handleSendChat} className="p-4 bg-white border-t shrink-0"><div className="flex gap-2"><input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Pergunte ao assistente nacional do MINSA..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm font-medium focus:border-indigo-500" /><button type="submit" disabled={isTyping || !chatInput.trim()} aria-label="Enviar mensagem" className="bg-[#0E2B64] hover:bg-[#081a3d] text-white p-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer"><Send size={17} /></button></div></form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
