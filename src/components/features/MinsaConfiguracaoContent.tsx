/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Shield, Plus, X, Globe, Save, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export function MinsaConfiguracaoContent() {
  const { t } = useLanguage();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Simple mock list of municipalities
  const [municipalities, setMunicipalities] = useState([
    'Viana', 'Cazenga', 'Cacuaco', 'Talatona', 'Belas', 'Maianga', 'Ingombota', 'Samba'
  ]);
  const [newMuni, setNewMuni] = useState('');

  const handleAddMuni = () => {
    if (newMuni.trim() && !municipalities.includes(newMuni.trim())) {
      setMunicipalities(prev => [...prev, newMuni.trim()]);
      setNewMuni('');
    }
  };

  const handleRemoveMuni = (m: string) => {
    setMunicipalities(prev => prev.filter(x => x !== m));
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 1200);
  };

  return (
    <div className="w-full space-y-6 text-left font-sans">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0E2B64] to-indigo-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 flex items-center justify-center">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </div>
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase">Administração do Sistema</span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">Configuração Ministerial</h2>
          <p className="text-xs text-indigo-200 leading-relaxed font-semibold">Parâmetros de segurança nacional, gestão de regiões sanitárias e integração de sistemas.</p>
        </div>
      </div>
      
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-wider"
        >
          <CheckCircle2 size={16} className="text-emerald-500" /> Configurações Ministeriais Gravadas com Sucesso
        </motion.div>
      )}

      <form onSubmit={handleSaveConfig} className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <Settings className="text-indigo-600 shrink-0" size={20} />
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase">Configuração Geral do Sistema</h2>
            <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5">Parâmetros de segurança, regiões e integração</p>
          </div>
        </div>

        {/* Regiões */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-800 uppercase">Regiões Sanitárias</h4>
          <div className="space-y-2">
            <span className="text-[9px] text-slate-400 font-bold">Municípios Ativos na Rede de Alerta</span>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border rounded-2xl">
              {municipalities.map(m => (
                <span key={m} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10.5px] font-bold flex items-center gap-1.5 shadow-sm">
                  <Globe size={11} className="text-indigo-600" />{m}
                  <button type="button" onClick={() => handleRemoveMuni(m)} className="text-red-500 hover:text-red-700 font-black ml-1 cursor-pointer">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <input type="text" placeholder="Novo município..." value={newMuni} onChange={e => setNewMuni(e.target.value)} className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm" />
              <button type="button" onClick={handleAddMuni} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer flex items-center gap-1 shrink-0"><Plus size={14} /> Adicionar</button>
            </div>
          </div>
        </div>

        {/* Segurança */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h4 className="text-xs font-black text-slate-800 uppercase">Segurança & Protocolo</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">Rácio de Vigilância Manchester</span>
              <select className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm">
                <option>Sensibilidade Estrita (Padrão)</option>
                <option>Sensibilidade Adaptativa</option>
                <option>Aviso Prévio — Prevenção de Surtos</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">Protocolo de Segurança</span>
              <select className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm">
                <option>SOC-AN-2026 — Criptografia 256-bit</option>
                <option>Padrão Nacional de Segurança Estatal</option>
                <option>Reforçado — Pós-Quântico Kyber-1024</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sistema */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h4 className="text-xs font-black text-slate-800 uppercase">Sistema & Integração</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">Intervalo de Sincronização (min)</span>
              <input type="number" defaultValue={15} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">Endpoint da API</span>
              <input type="text" defaultValue="https://api.dria.ao/minsa/v2" className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">Retenção de Dados (dias)</span>
              <input type="number" defaultValue={365} className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 shadow-sm" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">Modo de Manutenção</span>
              <label className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-amber-600" />
                <div><span className="text-[10px] font-black text-amber-800 block">Sistema Operacional</span><span className="text-[8px] text-amber-600 font-bold">Todos os serviços disponíveis</span></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[9px] text-slate-400 font-bold">Última alteração: {new Date().toLocaleDateString('pt-AO')}</span>
          <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-[#0E2B64] hover:bg-[#081a3d] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-70"><Save size={14} />{isSaving ? 'A Gravar...' : 'Gravar Parâmetros'}</button>
        </div>
      </form>

    </div>
  );
}
