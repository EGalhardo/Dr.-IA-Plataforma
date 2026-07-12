/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Citizen QR Code — Cartão de Saúde Digital
 * O cidadão apresenta este QR Code na recepção do hospital.
 * O profissional de saúde lê o código e obtém toda a informação clínica.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, User, ShieldCheck, Clock, AlertCircle, Download, RefreshCw, Activity, MapPin, Phone, Calendar, Heart, AlertTriangle } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { DriaEvaluation } from '../../types/dria';
import { useLanguage } from '../../hooks/useLanguage';

interface CitizenQrCodeContentProps {
  profileName: string;
  bi: string;
  age?: number;
  gender?: string;
  municipality?: string;
  phone?: string;
  allergies?: string;
  diseases?: string;
  medications?: string;
  emergencyContact?: string;
  evaluations: DriaEvaluation[];
  setTab: (tab: string) => void;
}

interface CitizenQrData {
  v: number;
  name: string;
  bi: string;
  age: number;
  gender: string;
  municipality: string;
  phone: string;
  allergies: string;
  diseases: string;
  medications: string;
  emergency: string;
  lastTriage?: {
    symptoms: string;
    priority: string;
    date: string;
  };
  triageCount: number;
}

export function CitizenQrCodeContent({
  profileName, bi, age = 28, gender = 'Masculino',
  municipality = 'Viana', phone = '+244 923 000 111',
  allergies = 'Nenhuma', diseases = 'Nenhuma', medications = 'Nenhuma',
  emergencyContact = '+244 923 000 111', evaluations, setTab
}: CitizenQrCodeContentProps) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Seleciona a triagem mais recente submetida/com submissionTime; fallback para a mais recente da lista.
  const latestEval = useMemo<DriaEvaluation | null>(() => {
    if (!evaluations.length) return null;
    const submitted = evaluations.filter(ev => ev.submissionTime);
    return submitted[0] || evaluations[0];
  }, [evaluations]);

  const qrData: CitizenQrData = useMemo(() => ({
    v: 1,
    name: profileName,
    bi: bi,
    age: age,
    gender: gender,
    municipality: municipality,
    phone: phone,
    allergies: allergies,
    diseases: diseases,
    medications: medications,
    emergency: emergencyContact,
    lastTriage: latestEval ? {
      symptoms: latestEval.symptoms,
      priority: latestEval.priority,
      date: latestEval.submissionTime || new Date().toLocaleDateString('pt-AO'),
    } : undefined,
    triageCount: evaluations.length,
  }), [profileName, bi, age, gender, municipality, phone, allergies, diseases, medications, emergencyContact, latestEval, evaluations.length]);

  const generateQr = async () => {
    if (!canvasRef.current) return;
    try {
      const jsonStr = JSON.stringify(qrData);
      await QRCodeLib.toCanvas(canvasRef.current, jsonStr, {
        width: 280,
        margin: 2,
        color: { dark: '#0E2B64', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
      setQrGenerated(true);
    } catch (err) {
      console.error('QR generation error:', err);
    }
  };

  // Regenera o QR sempre que os dados de saúde/perfil mudam (sincronização automática)
  useEffect(() => {
    generateQr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrData.name, qrData.bi, qrData.age, qrData.triageCount, qrData.lastTriage?.priority]);

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      generateQr();
      setRegenerating(false);
    }, 600);
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `dria-qrcode-${bi}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="space-y-6 text-left font-sans">

      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0E2B64] to-indigo-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 flex items-center justify-center">
          <QrCode size={130} />
        </div>
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-bold tracking-widest uppercase">Cartão de Saúde Digital</span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">O Meu QR Code Dr.IA</h2>
          <p className="text-xs text-indigo-200 leading-relaxed font-semibold">Apresente este código na recepção do hospital. O profissional de saúde irá ler o código e aceder instantaneamente a toda a sua informação clínica.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-start">

        {/* LEFT: QR Code + Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center space-y-4 shrink-0">
          
          {/* QR Canvas */}
          <motion.div
            key={String(regenerating)}
            initial={{ opacity: 0.8, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white p-4 rounded-2xl border-2 border-dashed border-slate-200"
          >
            <canvas ref={canvasRef} className="w-[200px] h-[200px]" />
            {!qrGenerated && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                <RefreshCw size={24} className="animate-spin text-indigo-600" />
              </div>
            )}
            {/* DR.IA watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-lg border-2 border-[#0E2B64] flex items-center justify-center shadow-sm pointer-events-none">
              <ShieldCheck size={16} className="text-[#0E2B64]" />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full">
            <button onClick={handleRegenerate} aria-label="Actualizar código QR" disabled={regenerating}
              className="flex-1 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-xl hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-1.5">
              <RefreshCw size={13} className={regenerating ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <button onClick={handleDownload} aria-label="Descarregar QR Code como imagem"
              className="flex-1 py-2.5 bg-[#0E2B64] hover:bg-[#081a3d] text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
              <Download size={13} />
              Guardar
            </button>
          </div>

          <p className="text-[8px] text-slate-400 font-bold text-center leading-relaxed">
            Código válido para apresentação em qualquer unidade hospitalar integrada na rede Dr.IA
          </p>
        </div>

        {/* RIGHT: Patient Card */}
        <div className="space-y-4">
          
          {/* ID Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <User size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase leading-none">{profileName}</h3>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5">BI: {bi}</p>
              </div>
              <div className="ml-auto">
                <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase ${qrGenerated ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {qrGenerated ? 'QR Activo' : 'A gerar...'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-slate-400 shrink-0" />
                <div><span className="text-[8px] text-slate-400 font-black uppercase block">Idade</span><span className="font-bold text-slate-800">{age} anos • {gender}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <div><span className="text-[8px] text-slate-400 font-black uppercase block">Município</span><span className="font-bold text-slate-800">{municipality}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-slate-400 shrink-0" />
                <div><span className="text-[8px] text-slate-400 font-black uppercase block">Contacto</span><span className="font-bold text-slate-800">{phone}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-slate-400 shrink-0" />
                <div><span className="text-[8px] text-slate-400 font-black uppercase block">Triagens</span><span className="font-bold text-slate-800">{evaluations.length} registos</span></div>
              </div>
            </div>
          </div>

          {/* Clinical Info Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
              <Heart size={14} className="text-rose-500" /> Informação Clínica
            </h4>
            <div className="grid grid-cols-1 gap-2 text-[10px]">
              <div className="flex justify-between bg-slate-50 px-3 py-2 rounded-lg">
                <span className="font-black text-slate-400 uppercase text-[9px]">Alergias</span>
                <span className="font-bold text-slate-700 text-right">{allergies || 'Nenhuma'}</span>
              </div>
              <div className="flex justify-between bg-slate-50 px-3 py-2 rounded-lg">
                <span className="font-black text-slate-400 uppercase text-[9px]">Doenças Crónicas</span>
                <span className="font-bold text-slate-700 text-right">{diseases || 'Nenhuma'}</span>
              </div>
              <div className="flex justify-between bg-slate-50 px-3 py-2 rounded-lg">
                <span className="font-black text-slate-400 uppercase text-[9px]">Medicação</span>
                <span className="font-bold text-slate-700 text-right">{medications || 'Nenhuma'}</span>
              </div>
              <div className="flex justify-between bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
                <span className="font-black text-rose-600 uppercase text-[9px] flex items-center gap-1"><AlertCircle size={11} /> Emergência</span>
                <span className="font-extrabold text-rose-700 text-right">{emergencyContact}</span>
              </div>
            </div>
          </div>

          {/* Latest Triage */}
          {latestEval && (
            <div className={`border rounded-2xl p-4 shadow-sm ${
              latestEval.priority === 'Emergência' ? 'bg-red-50 border-red-200' :
              latestEval.priority === 'Urgente' ? 'bg-rose-50 border-rose-200' :
              'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                  <Activity size={14} className="text-indigo-600" /> Última Triagem
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                  latestEval.priority === 'Emergência' ? 'bg-red-600 text-white animate-pulse' :
                  latestEval.priority === 'Urgente' ? 'bg-rose-100 text-rose-700' :
                  latestEval.priority === 'Moderado' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>{latestEval.priority}</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed line-clamp-3 font-medium">{latestEval.symptoms}</p>
              <button onClick={() => setTab('historico-consultas')} aria-label="Ver histórico completo"
                className="mt-2 text-[9px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-wider cursor-pointer">
                Ver Histórico Completo →
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Info footer */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
          <ShieldCheck size={18} />
        </div>
        <div>
          <h4 className="text-[11px] font-black text-slate-800 uppercase">Como usar na recepção</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            <b>1.</b> Abra o QR Code no seu telemóvel • <b>2.</b> Mostre ao profissional de saúde • <b>3.</b> O hospital lê o código e acede a todos os seus dados clínicos instantaneamente. Não é necessário cartão físico.
          </p>
        </div>
      </div>

    </div>
  );
}
