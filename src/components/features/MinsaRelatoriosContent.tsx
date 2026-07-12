/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Calendar, ArrowRight, ShieldCheck, CheckCircle2, FileSpreadsheet, FileArchive } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export function MinsaRelatoriosContent() {
  const { t } = useLanguage();

  const mockReports = [
    { id: 'rep1', title: 'Boletim Epidemiológico Mensal - Junho 2026', size: '2.4 MB', format: 'PDF', date: '01/06/2026' },
    { id: 'rep2', title: 'Relatório Nacional de Triagens Autónomas (Q2)', size: '4.8 MB', format: 'Excel', date: '15/05/2026' },
    { id: 'rep3', title: 'Plano de Contingência de Cólera Luanda 2026', size: '1.2 MB', format: 'PDF', date: '10/04/2026' },
    { id: 'rep4', title: 'Estatísticas de Morbidade por Malária em Viana', size: '840 KB', format: 'CSV', date: '05/04/2026' }
  ];

  const handleDownload = (title: string, format: string) => {
    alert(`A preparar o ficheiro "${title}.${format.toLowerCase()}" para descarga...`);
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0E2B64] to-indigo-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 flex items-center justify-center">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase">Exportação de Dados</span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">Relatórios Oficiais</h2>
          <p className="text-xs text-indigo-200 leading-relaxed font-semibold">Gere e descarregue compilações estruturadas de indicadores sanitários para apoio à decisão ministerial.</p>
        </div>
      </div>
      
      {/* Exporter Board */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 space-y-4 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-slate-900 font-black text-xs md:text-sm uppercase leading-none">Exportar Indicadores Sanitários</h3>
          <p className="text-[11px] text-slate-500 leading-normal">
            Gere e descarregue instantaneamente compilações estruturadas do banco de dados DR.IA.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleDownload('Boletim_Geral_Nacional_Epidemiologico', 'PDF')} aria-label="Descarregar relatório"
            className="p-4 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-200 hover:border-indigo-400 text-indigo-700 rounded-2xl text-left space-y-2 transition-all cursor-pointer"
          >
            <FileArchive size={20} />
            <div className="text-xs font-black uppercase">Gerar Relatório PDF</div>
            <p className="text-[10px] text-slate-500">Compilado executivo com gráficos e metas.</p>
          </button>

          <button
            onClick={() => handleDownload('Base_Dados_Triage_Nacional', 'XLSX')} aria-label="Descarregar relatório"
            className="p-4 bg-teal-50/50 hover:bg-teal-50 border border-teal-200 hover:border-teal-400 text-teal-700 rounded-2xl text-left space-y-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet size={20} />
            <div className="text-xs font-black uppercase">Exportar Planilha Excel</div>
            <p className="text-[10px] text-slate-500">Listagem de triagens e tempos de resposta.</p>
          </button>

          <button
            onClick={() => handleDownload('Dados_Morbidade_Municipios', 'CSV')} aria-label="Descarregar relatório"
            className="p-4 bg-slate-100 hover:bg-slate-200 border border-slate-300 hover:border-slate-400 text-slate-700 rounded-2xl text-left space-y-2 transition-all cursor-pointer"
          >
            <FileText size={20} />
            <div className="text-xs font-black uppercase">Exportar Matriz CSV</div>
            <p className="text-[10px] text-slate-500">Dados puros de prevalência por município.</p>
          </button>
        </div>
      </div>

      {/* List of Archived reports */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-indigo-600" /> Histórico de Publicações Oficiais ({mockReports.length})
          </h3>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase">Arquivo de Relatórios</span>
        </div>

        <div className="divide-y divide-slate-100">
          {mockReports.map(rep => (
            <div
              key={rep.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/5040 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border flex items-center justify-center text-slate-500 shrink-0">
                  <FileText size={18} />
                </div>
                <div className="text-left space-y-0.5">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">{rep.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                    <Calendar size={11} /> {rep.date} · Tamanho: {rep.size}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownload(rep.title, rep.format)} aria-label="Descarregar relatório"
                className="px-4 py-2 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              >
                <Download size={12} /> Descarregar ({rep.format})
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
