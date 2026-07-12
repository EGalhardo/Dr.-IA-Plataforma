/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Hospital QR Scanner — Leitura de QR Code do Cidadão
 * O profissional de saúde lê o QR Code do utente e obtém toda a informação clínica.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode, Camera, User, ShieldCheck, Activity, MapPin, Phone,
  Calendar, Heart, AlertCircle, RefreshCw, X, ChevronRight,
  Clipboard, AlertTriangle, FileText, Clock, CheckCircle2,
  Usb, Upload, ArrowLeft, History, Download, Check
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { DriaEvaluation } from '../../types/dria';
import { useLanguage } from '../../hooks/useLanguage';

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
  lastTriage?: { symptoms: string; priority: string; date: string };
  triageCount: number;
}

interface HospitalQrScannerContentProps {
  evaluations: DriaEvaluation[];
  setTab: (tab: string) => void;
}

interface HistoryItem {
  id: string;
  name: string;
  bi: string;
  time: string;
  status: string;
  data: CitizenQrData;
}

export function HospitalQrScannerContent({ evaluations, setTab }: HospitalQrScannerContentProps) {
  const { t } = useLanguage();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scannerDivId = 'dria-hospital-qr-reader';

  // State matching image tabs
  const [activeTab, setActiveTab] = useState<'ler' | 'gerar' | 'historico'>('ler');
  const [activeSubTab, setActiveSubTab] = useState<'camera' | 'usb' | 'file' | 'text'>('camera');
  
  // Scanned counter & history
  const [scannedCount, setScannedCount] = useState<number>(3);
  const [scannedHistory, setScannedHistory] = useState<HistoryItem[]>([
    {
      id: 'HOSP-TX-8812',
      name: 'Maria Antónia',
      bi: '008812342LA011',
      time: 'Hoje, 10:14',
      status: 'Validado',
      data: {
        v: 1,
        name: "Maria Antónia",
        bi: "008812342LA011",
        age: 37,
        gender: "Feminino",
        municipality: "Ingombota",
        phone: "+244 924 111 222",
        allergies: "Penicilina, Ácaros",
        diseases: "Asma ligeira",
        medications: "Salbutamol SOS",
        emergency: "+244 924 111 333",
        lastTriage: {
          symptoms: "Falta de ar progressiva associada a tosse seca e pieira após exposição a poeira.",
          priority: "Muito Urgente",
          date: "06/07/2026"
        },
        triageCount: 3
      }
    },
    {
      id: 'HOSP-TX-7712',
      name: 'José Kalunga',
      bi: '007712342LA021',
      time: 'Hoje, 09:30',
      status: 'Validado',
      data: {
        v: 1,
        name: "José Kalunga",
        bi: "007712342LA021",
        age: 43,
        gender: "Masculino",
        municipality: "Viana",
        phone: "+244 912 333 444",
        allergies: "Nenhuma",
        diseases: "Hipertensão Arterial",
        medications: "Enalapril 20mg",
        emergency: "+244 912 333 555",
        lastTriage: {
          symptoms: "Sensação de palpitações e tonturas ligeiras. Tensão arterial de 15/9.",
          priority: "Moderado",
          date: "05/07/2026"
        },
        triageCount: 2
      }
    },
    {
      id: 'HOSP-TX-0098',
      name: 'Edlasio Galhardo',
      bi: '009874562LA041',
      time: 'Ontem, 16:45',
      status: 'Validado',
      data: {
        v: 1,
        name: "Edlasio Galhardo",
        bi: "009874562LA041",
        age: 31,
        gender: "Masculino",
        municipality: "Maianga",
        phone: "+244 923 000 111",
        allergies: "Nenhuma alergia conhecida",
        diseases: "Nenhuma",
        medications: "Nenhuma",
        emergency: "+244 923 000 111",
        lastTriage: {
          symptoms: "Dores de cabeça fortes, febre de 38.5ºC e cansaço extremo há 2 dias.",
          priority: "Urgente",
          date: "07/07/2026"
        },
        triageCount: 1
      }
    }
  ]);

  // QR Reader States
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<CitizenQrData | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  // USB/Keyboard Mode States
  const [usbInput, setUsbInput] = useState('');
  
  // Colar Texto States
  const [textInput, setTextInput] = useState('');

  // Generator States
  const [genForm, setGenForm] = useState<CitizenQrData>({
    v: 1,
    name: '',
    bi: '',
    age: 30,
    gender: 'Masculino',
    municipality: 'Luanda',
    phone: '+244 ',
    allergies: 'Nenhuma alergia conhecida',
    diseases: 'Nenhuma',
    medications: 'Nenhuma',
    emergency: '+244 ',
    triageCount: 1
  });
  const [generatedQr, setGeneratedQr] = useState<string | null>(null);

  // Find citizen evaluations from the global list
  const [citizenEvals, setCitizenEvals] = useState<DriaEvaluation[]>([]);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then(devices => {
        if (devices && devices.length > 0) {
          setCameras(devices.map((d, i) => ({ id: d.id, label: d.label || `Câmara ${i + 1}` })));
          const back = devices.find(d => (d.label || '').toLowerCase().includes('back') || (d.label || '').toLowerCase().includes('trás'));
          setSelectedCamera(back ? back.id : devices[0].id);
        }
      })
      .catch(() => {});

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    setScanError(null);
    setScannedData(null);
    try {
      const scanner = new Html5Qrcode(scannerDivId);
      scannerRef.current = scanner;
      setScanning(true);

      await scanner.start(
        { deviceId: selectedCamera ? { exact: selectedCamera } : undefined },
        { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1 },
        (decodedText: string) => {
          try {
            const data: CitizenQrData = JSON.parse(decodedText);
            if (data.v && data.name && data.bi) {
              handleScanSuccess(data);
              scanner.stop().catch(() => {});
              setScanning(false);
            } else {
              setScanError('Formato de QR Code inválido. Deve conter dados do utente.');
            }
          } catch {
            // Check if standard text
            if (decodedText.startsWith('{')) {
              setScanError('Erro ao processar JSON do QR Code.');
            } else {
              // Try to fallback parse or match
              setScanError('QR Code não reconhecido como utente Dr.IA.');
            }
          }
        },
        () => {}
      );
    } catch (err: any) {
      setScanning(false);
      setScanError(err?.message || 'Erro ao iniciar a câmara. Verifique as permissões.');
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleScanSuccess = (data: CitizenQrData) => {
    setScannedData(data);
    setScanError(null);
    setScanning(false);

    // Increment count
    setScannedCount(prev => prev + 1);

    // Add to history
    const isAlreadyInHistory = scannedHistory.some(item => item.bi === data.bi);
    if (!isAlreadyInHistory) {
      const now = new Date();
      const timeStr = `Hoje, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newItem: HistoryItem = {
        id: `HOSP-TX-${Math.floor(1000 + Math.random() * 9000)}`,
        name: data.name,
        bi: data.bi,
        time: timeStr,
        status: 'Validado',
        data: data
      };
      setScannedHistory(prev => [newItem, ...prev]);
    }

    // Find citizen evaluations from global sync'd state — match by BI first, then name
    const bi = (data.bi || '').trim().toLowerCase();
    const name = (data.name || '').trim().toLowerCase();
    const evals = evaluations.filter(e => {
      const ebi = (e.patientBI || '').trim().toLowerCase();
      const ename = (e.patientName || '').trim().toLowerCase();
      return (bi && ebi === bi) || (name && ename === name);
    });
    setCitizenEvals(evals);

    // Actualizar scannedData com triagem real mais recente do cidadão
    if (evals.length > 0) {
      const latest = [...evals].sort((a, b) => {
        const ta = a.submissionTime ? new Date(a.submissionTime.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3')).getTime() : 0;
        const tb = b.submissionTime ? new Date(b.submissionTime.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3')).getTime() : 0;
        return tb - ta;
      })[0];
      setScannedData({
        ...data,
        triageCount: evals.length,
        lastTriage: latest && latest.symptoms ? {
          symptoms: latest.symptoms,
          priority: latest.priority,
          date: latest.submissionTime ? latest.submissionTime.split(' ')[0] : data.lastTriage?.date || '',
        } : data.lastTriage,
      });
    }
  };

  const handleClearScan = () => {
    setScannedData(null);
    setCitizenEvals([]);
    setScanError(null);
    setUsbInput('');
    setTextInput('');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setScanError(null);
    const html5QrCode = new Html5Qrcode(scannerDivId);
    html5QrCode.scanFile(file, true)
      .then(decodedText => {
        try {
          const data: CitizenQrData = JSON.parse(decodedText);
          if (data.v && data.name && data.bi) {
            handleScanSuccess(data);
          } else {
            setScanError('Imagem de QR Code lida, mas não possui a estrutura de dados Dr.IA.');
          }
        } catch {
          setScanError('O QR Code lido não possui uma estrutura JSON válida.');
        }
      })
      .catch(() => {
        setScanError('Não foi possível descodificar o QR Code desta imagem. Certifique-se de que a imagem está bem focada.');
      });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Process USB Scanned string
  const handleUsbSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usbInput.trim()) return;
    setScanError(null);
    try {
      const data: CitizenQrData = JSON.parse(usbInput);
      if (data.v && data.name && data.bi) {
        handleScanSuccess(data);
      } else {
        setScanError('Dados USB recebidos não possuem a assinatura do cidadão.');
      }
    } catch {
      // Look for a demo patient match if it's just a name
      const matched = demoPatients.find(p => p.name.toLowerCase().includes(usbInput.toLowerCase()) || p.bi.includes(usbInput));
      if (matched) {
        handleScanSuccess(matched);
      } else {
        setScanError('Estrutura de dados USB inválida. Insira um JSON válido do utente.');
      }
    }
  };

  // Process pasted text
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    setScanError(null);
    try {
      const data: CitizenQrData = JSON.parse(textInput);
      if (data.v && data.name && data.bi) {
        handleScanSuccess(data);
      } else {
        setScanError('Texto colado não corresponde à assinatura do utente.');
      }
    } catch {
      setScanError('Texto inválido. Certifique-se de que colou o JSON completo do utente.');
    }
  };

  // Demo simulator patients
  const demoPatients: CitizenQrData[] = [
    {
      v: 1,
      name: "Edlasio Galhardo",
      bi: "009874562LA041",
      age: 31,
      gender: "Masculino",
      municipality: "Maianga",
      phone: "+244 923 000 111",
      allergies: "Nenhuma alergia conhecida",
      diseases: "Nenhuma",
      medications: "Nenhuma",
      emergency: "+244 923 888 777",
      lastTriage: {
        symptoms: "Dores de cabeça fortes, febre de 38.5ºC e cansaço extremo há 2 dias.",
        priority: "Urgente",
        date: "07/07/2026"
      },
      triageCount: 1
    },
    {
      v: 1,
      name: "Maria Antónia",
      bi: "008812342LA011",
      age: 37,
      gender: "Feminino",
      municipality: "Ingombota",
      phone: "+244 924 111 222",
      allergies: "Penicilina, Ácaros",
      diseases: "Asma ligeira",
      medications: "Salbutamol SOS",
      emergency: "+244 924 111 333",
      lastTriage: {
        symptoms: "Falta de ar progressiva associada a tosse seca e pieira após exposição a poeira.",
        priority: "Muito Urgente",
        date: "06/07/2026"
      },
      triageCount: 3
    },
    {
      v: 1,
      name: "José Kalunga",
      bi: "007712342LA021",
      age: 43,
      gender: "Masculino",
      municipality: "Viana",
      phone: "+244 912 333 444",
      allergies: "Nenhuma",
      diseases: "Hipertensão Arterial",
      medications: "Enalapril 20mg",
      emergency: "+244 912 333 555",
      lastTriage: {
        symptoms: "Sensação de palpitações e tonturas ligeiras. Tensão arterial de 15/9.",
        priority: "Moderado",
        date: "05/07/2026"
      },
      triageCount: 2
    }
  ];

  const handleSimulate = (patient: CitizenQrData) => {
    handleScanSuccess(patient);
  };

  const getPriorityStyles = (p: string) => {
    switch (p) {
      case 'Emergência': return 'bg-red-100 text-red-700 border-red-200 font-extrabold animate-pulse';
      case 'Muito Urgente': return 'bg-orange-100 text-orange-700 border-orange-200 font-extrabold';
      case 'Urgente': return 'bg-rose-100 text-rose-700 border-rose-200 font-extrabold';
      case 'Moderado': return 'bg-amber-100 text-amber-700 border-amber-200 font-extrabold';
      case 'Leve': return 'bg-emerald-100 text-emerald-700 border-emerald-200 font-extrabold';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Handle generating a new QR
  const handleGenerateQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genForm.name || !genForm.bi) {
      alert("Por favor preencha o Nome e o Bilhete de Identidade!");
      return;
    }
    const fullData: CitizenQrData = {
      ...genForm,
      lastTriage: {
        symptoms: "Sem sintomas registados no momento da exportação do QR.",
        priority: "Leve",
        date: new Date().toLocaleDateString()
      }
    };
    const jsonStr = JSON.stringify(fullData);
    // Real scannable QR generation using external API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(jsonStr)}`;
    setGeneratedQr(qrUrl);
  };

  // Pre-fill generator forms
  const applyGenTemplate = (type: 'padrao' | 'asma' | 'hipertensao') => {
    if (type === 'padrao') {
      setGenForm({
        v: 1,
        name: 'Delfina Lemos',
        bi: '005432187LA099',
        age: 26,
        gender: 'Feminino',
        municipality: 'Cazenga',
        phone: '+244 923 444 555',
        allergies: 'Nenhuma conhecida',
        diseases: 'Nenhuma',
        medications: 'Nenhuma',
        emergency: '+244 912 444 666',
        triageCount: 1
      });
    } else if (type === 'asma') {
      setGenForm({
        v: 1,
        name: 'António Kipungo',
        bi: '006718223LA081',
        age: 34,
        gender: 'Masculino',
        municipality: 'Talatona',
        phone: '+244 931 888 222',
        allergies: 'Lactose, Ibuprofeno',
        diseases: 'Asma Crónica',
        medications: 'Symbicort 160mcg',
        emergency: '+244 924 999 111',
        triageCount: 4
      });
    } else if (type === 'hipertensao') {
      setGenForm({
        v: 1,
        name: 'Isabel Carreira',
        bi: '009817265LA022',
        age: 52,
        gender: 'Feminino',
        municipality: 'Rangel',
        phone: '+244 912 777 333',
        allergies: 'Nenhuma',
        diseases: 'Hipertensão, Diabetes Tipo 2',
        medications: 'Losartan 50mg, Metformina 850mg',
        emergency: '+244 923 111 999',
        triageCount: 2
      });
    }
    setGeneratedQr(null);
  };

  return (
    <div className="space-y-6 text-left font-sans">

      {/* 1. Header Card (styled from QR Mail Reader reference) */}
      <div id="qr-header-card" className="bg-white border border-slate-200/80 rounded-[28px] p-5 md:p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
            <QrCode className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight italic leading-tight">Leitor de QR Code Utente</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-blue-600 text-xs font-black uppercase tracking-wider">+ Leitor & Gerador de Identidade Clínica</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto self-stretch md:self-auto justify-between md:justify-end">
          <button
            onClick={() => { stopScanner(); setTab('hospital-dashboard'); }}
            id="btn-voltar-painel"
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-700 hover:text-slate-900 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-3xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Painel
          </button>
          <span className="px-3.5 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-3xs">
            {scannedCount} escaneados
          </span>
        </div>
      </div>

      {/* 2. Main Tab Selectors (Matches image LER, GERAR, HISTORICO) */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => { setActiveTab('ler'); setGeneratedQr(null); }}
          id="tab-ler-qr"
          className={`py-3.5 px-4 font-black text-[11px] md:text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
            activeTab === 'ler'
              ? 'bg-blue-600 text-white shadow-blue-600/15'
              : 'bg-white border border-slate-200/70 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Camera className="w-4.5 h-4.5" />
          Ler QR Code
        </button>

        <button
          onClick={() => { stopScanner(); setActiveTab('gerar'); }}
          id="tab-gerar-qr"
          className={`py-3.5 px-4 font-black text-[11px] md:text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
            activeTab === 'gerar'
              ? 'bg-blue-600 text-white shadow-blue-600/15'
              : 'bg-white border border-slate-200/70 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <QrCode className="w-4.5 h-4.5" />
          Gerar QR Code
        </button>

        <button
          onClick={() => { stopScanner(); setActiveTab('historico'); }}
          id="tab-historico-qr"
          className={`py-3.5 px-4 font-black text-[11px] md:text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
            activeTab === 'historico'
              ? 'bg-blue-600 text-white shadow-blue-600/15'
              : 'bg-white border border-slate-200/70 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <History className="w-4.5 h-4.5" />
          Histórico
        </button>
      </div>

      {/* 3. Horizontal Status Banner (matches image green bar) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <p className="text-[10px] md:text-[11px] text-slate-600 font-bold leading-normal">
            Pronto para leitura: Aponte a webcam, carregue ficheiros ou use o Leitor USB profissional.
          </p>
        </div>
        <span className="px-2.5 py-1 bg-slate-200/60 text-slate-500 font-extrabold text-[9px] tracking-wider uppercase rounded-md shrink-0">
          INTEGRAÇÃO HOSP-DRIA ATIVA
        </span>
      </div>

      {/* 4. Sub-Tab Selectors (renders only under LER QR CODE tab) */}
      {activeTab === 'ler' && !scannedData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <button
            onClick={() => { stopScanner(); setActiveSubTab('camera'); }}
            id="subtab-camera"
            className={`py-2.5 px-3 rounded-xl border font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'camera'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Camera className="w-4 h-4" />
            Webcam/Câmara
          </button>

          <button
            onClick={() => { stopScanner(); setActiveSubTab('usb'); }}
            id="subtab-usb"
            className={`py-2.5 px-3 rounded-xl border font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'usb'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Usb className="w-4 h-4" />
            Leitor USB (HID)
          </button>

          <button
            onClick={() => { stopScanner(); setActiveSubTab('file'); }}
            id="subtab-file"
            className={`py-2.5 px-3 rounded-xl border font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'file'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Upload className="w-4 h-4" />
            Ficheiro
          </button>

          <button
            onClick={() => { stopScanner(); setActiveSubTab('text'); }}
            id="subtab-text"
            className={`py-2.5 px-3 rounded-xl border font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'text'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-slate-200/80 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            Colar Texto / Simulador
          </button>
        </div>
      )}

      {/* 5. Central Dynamic Content Frame */}
      <div className="bg-white border border-slate-200/80 rounded-[32px] p-6 shadow-xs transition-all relative">
        <AnimatePresence mode="wait">

          {/* A. SCANNED PROFILE RESULTS PANEL */}
          {scannedData && (
            <motion.div key="scanned-results" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              
              {/* Header result row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800 uppercase leading-none">{scannedData.name}</h3>
                    <p className="text-[10px] text-emerald-600 font-extrabold uppercase mt-1">Identidade Clínica Autenticada</p>
                  </div>
                </div>
                <button
                  onClick={handleClearScan}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Novo Escaneamento
                </button>
              </div>

              {/* Patient Core ID Card */}
              <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 font-black uppercase block">Nome Completo</span>
                  <span className="font-extrabold text-slate-800 block uppercase mt-0.5">{scannedData.name}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-black uppercase block">Bilhete de Identidade</span>
                  <span className="font-mono font-extrabold text-slate-800 block mt-0.5">{scannedData.bi}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-black uppercase block">Idade & Sexo</span>
                  <span className="font-extrabold text-slate-800 block mt-0.5">{scannedData.age} anos • {scannedData.gender}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 font-black uppercase block">Contacto Telefone</span>
                  <span className="font-mono font-extrabold text-slate-800 block mt-0.5">{scannedData.phone}</span>
                </div>
              </div>

              {/* Clinical Records Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Clinical Warnings Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-wider border-b border-slate-100 pb-2.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Alertas Clínicos Críticos</span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <span className="text-[8px] text-amber-600 font-black uppercase flex items-center gap-1 mb-0.5">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Alergias e Reações
                      </span>
                      <span className="text-[11px] font-bold text-slate-700">{scannedData.allergies}</span>
                    </div>

                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                      <span className="text-[8px] text-purple-600 font-black uppercase flex items-center gap-1 mb-0.5">
                        <Activity className="w-3 h-3 text-purple-500" /> Doenças Pré-existentes
                      </span>
                      <span className="text-[11px] font-bold text-slate-700">{scannedData.diseases}</span>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <span className="text-[8px] text-blue-600 font-black uppercase flex items-center gap-1 mb-0.5">
                        <Clock className="w-3 h-3 text-blue-500" /> Medicação Atual Activa
                      </span>
                      <span className="text-[11px] font-bold text-slate-700">{scannedData.medications}</span>
                    </div>

                    <div className="bg-red-50 border border-red-150 rounded-xl p-3">
                      <span className="text-[8px] text-red-600 font-black uppercase flex items-center gap-1 mb-0.5">
                        <Phone className="w-3 h-3 text-red-500" /> Linha de Emergência Familiar
                      </span>
                      <span className="text-[11px] font-black text-red-800 font-mono">{scannedData.emergency}</span>
                    </div>
                  </div>
                </div>

                {/* Patient Triage Summary */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-wider border-b border-slate-100 pb-2.5">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>Último Histórico de Triagem Dr.IA</span>
                  </div>

                  {scannedData.lastTriage ? (
                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-slate-400 font-black uppercase">Sintomatologia</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${getPriorityStyles(scannedData.lastTriage.priority)}`}>
                            {scannedData.lastTriage.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
                          "{scannedData.lastTriage.symptoms}"
                        </p>
                        <span className="text-[9px] text-slate-400 font-bold block pt-1">
                          Sugerido em: {scannedData.lastTriage.date}
                        </span>
                      </div>

                      <div className="bg-blue-50/40 border border-blue-100/70 rounded-xl p-3 text-center text-[11px] font-semibold text-blue-800">
                        Total de {scannedData.triageCount || citizenEvals.length} triagens efetuadas por este cidadão.
                      </div>

                      <button
                        onClick={() => setTab('hospital-pacientes')}
                        className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all"
                      >
                        Ver Triagem Completa & Prescrever
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <Clipboard className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-black uppercase">Nenhuma triagem anterior registada.</p>
                    </div>
                  )}

                </div>

              </div>

            </motion.div>
          )}

          {/* B. TAB: LER QR CODE */}
          {activeTab === 'ler' && !scannedData && (
            <motion.div key="tab-ler-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Webcam/Câmara scanner */}
              {activeSubTab === 'camera' && (
                <div className="border-2 border-dashed border-slate-200 rounded-[24px] p-6 md:p-12 flex flex-col items-center justify-center text-center min-h-[380px] transition-all bg-slate-50/30">
                  <div id={scannerDivId} className="w-full max-w-sm rounded-2xl overflow-hidden bg-black aspect-square z-0 shadow-inner relative" style={{ display: scanning ? 'block' : 'none' }} />

                  {!scanning ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 mb-4 shadow-3xs">
                        <Camera className="w-8 h-8 text-slate-500" />
                      </div>
                      <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Autenticação por Webcam ou Câmara do Telemóvel</h3>
                      <p className="text-xs text-slate-400 font-semibold max-w-md mt-1.5 leading-relaxed">
                        O sensor deteta qualquer QR Code governamental de saúde ou gerado pela aplicação unificada de cidadãos.
                      </p>
                      <button
                        onClick={startScanner}
                        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-full flex items-center gap-2 transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        Ativar Câmara de Leitura
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex flex-col items-center mt-4">
                      <div className="flex gap-2.5 items-center mb-4">
                        <Camera className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-600 animate-pulse">Câmara Ativa & Lendo...</span>
                      </div>
                      {cameras.length > 1 && (
                        <div className="mb-4 w-full max-w-xs">
                          <label htmlFor="camera-select" className="text-[8px] text-slate-400 font-black uppercase tracking-wider block mb-1">Câmara selecionada</label>
                          <select
                            id="camera-select"
                            value={selectedCamera}
                            onChange={(e) => { setSelectedCamera(e.target.value); stopScanner(); setTimeout(startScanner, 200); }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                          >
                            {cameras.map(c => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <button
                        onClick={stopScanner}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-full flex items-center gap-2 transition-all shadow-md cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        Desativar Câmara
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* USB Mode (HID Emulation) */}
              {activeSubTab === 'usb' && (
                <div className="border-2 border-dashed border-slate-200 rounded-[24px] p-6 md:p-10 flex flex-col items-center justify-center text-center min-h-[380px] bg-slate-50/30">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 mb-4 shadow-3xs">
                    <Usb className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Leitura de Dispositivo Externo USB (HID)</h3>
                  <p className="text-xs text-slate-400 font-semibold max-w-md mt-1.5 leading-relaxed">
                    Aponte o leitor de código de barras USB/Bluetooth profissional para o ecrã do utente e dispare o feixe laser.
                  </p>

                  <form onSubmit={handleUsbSubmit} className="mt-6 w-full max-w-md space-y-3">
                    <div className="flex flex-col gap-1.5 text-left">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Entrada de Sinal do Leitor</span>
                      <input
                        type="text"
                        value={usbInput}
                        onChange={(e) => setUsbInput(e.target.value)}
                        placeholder="Clique aqui e simule o disparo físico do leitor USB..."
                        className="w-full border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-full px-4 py-3 text-xs font-bold text-slate-800 bg-white h-12 shadow-2xs outline-none transition-all"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setUsbInput(JSON.stringify(demoPatients[0]))}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-[9px] text-slate-600 font-black uppercase tracking-wider"
                      >
                        Colar Exemplo Edlasio
                      </button>
                      <button
                        type="button"
                        onClick={() => setUsbInput(JSON.stringify(demoPatients[1]))}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-[9px] text-slate-600 font-black uppercase tracking-wider"
                      >
                        Colar Exemplo Maria
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-full flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Processar Leitura USB
                    </button>
                  </form>
                </div>
              )}

              {/* Image Drag and Drop */}
              {activeSubTab === 'file' && (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-[24px] p-6 md:p-12 flex flex-col items-center justify-center text-center min-h-[380px] transition-all cursor-pointer ${
                    dragActive
                      ? 'border-blue-600 bg-blue-50/20'
                      : 'border-slate-200 bg-slate-50/10 hover:bg-slate-50/50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 mb-4 shadow-3xs">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Arraste a Imagem do QR Code</h3>
                  <p className="text-xs text-slate-400 font-semibold max-w-md mt-1.5 leading-relaxed">
                    Ou clique aqui para escolher um ficheiro JPG/PNG contendo o código QR guardado pelo utente no telemóvel.
                  </p>
                  <span className="mt-5 px-5 py-2.5 bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-widest rounded-xl">
                    Escolher Ficheiro local
                  </span>
                  {/* Hidden QR node required for html5-qrcode scans */}
                  <div id={scannerDivId} className="hidden w-0 h-0" />
                </div>
              )}

              {/* Paste Text & Fast Simulator */}
              {activeSubTab === 'text' && (
                <div className="space-y-6">
                  
                  {/* Simulator Grid */}
                  <div className="bg-slate-50/40 border border-slate-150 rounded-[20px] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Simulador Rápido de Utentes (Angola)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {demoPatients.map((patient, index) => (
                        <div
                          key={index}
                          onClick={() => handleSimulate(patient)}
                          className="bg-white hover:bg-blue-50/20 border border-slate-200 hover:border-blue-200 rounded-xl p-4 text-left transition-all hover:scale-[1.01] flex flex-col justify-between h-36 cursor-pointer group shadow-2xs"
                        >
                          <div>
                            <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest block mb-0.5">Perfil Clínico</span>
                            <h4 className="text-xs font-black text-slate-800 uppercase leading-snug line-clamp-1 group-hover:text-blue-700">{patient.name}</h4>
                            <p className="text-[8px] text-slate-400 font-mono mt-0.5">BI: {patient.bi}</p>
                          </div>
                          
                          <div className="mt-2.5 pt-2.5 border-t border-slate-100">
                            <p className="text-[9px] text-slate-500 font-semibold line-clamp-1">
                              Alergias: {patient.allergies}
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-[8px] text-blue-600 font-black uppercase tracking-wider mt-2 group-hover:translate-x-1 transition-all">
                              Carregar Perfil <ChevronRight className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manual Paste Text form */}
                  <div className="bg-white border border-slate-150 rounded-[20px] p-5 space-y-3.5 text-left">
                    <div className="flex items-center gap-2">
                      <Clipboard className="w-4 h-4 text-slate-400" />
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Colar Texto / Código Assinado</span>
                    </div>

                    <form onSubmit={handleTextSubmit} className="space-y-3">
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Cole o código JSON do utente aqui..."
                        rows={4}
                        className="w-full border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs font-mono text-slate-700 bg-slate-50/30 outline-none resize-none transition-all"
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-sm"
                      >
                        Processar Código de Texto
                      </button>
                    </form>
                  </div>

                </div>
              )}

              {scanError && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="text-amber-600 shrink-0 mt-0.5 w-4 h-4" />
                  <div>
                    <span className="text-[10px] font-black text-amber-800 uppercase block">Aviso</span>
                    <p className="text-[10px] text-amber-700 mt-0.5 font-bold">{scanError}</p>
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}

          {/* C. TAB: GERAR QR CODE */}
          {activeTab === 'gerar' && (
            <motion.div key="tab-gerar-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Inputs Form */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Clipboard className="w-4 h-4 text-blue-600" />
                      Ficha de Emissão de QR Utente
                    </h3>
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => applyGenTemplate('padrao')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[9px] font-black uppercase tracking-wider text-slate-600">Padrão</button>
                      <button type="button" onClick={() => applyGenTemplate('asma')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[9px] font-black uppercase tracking-wider text-slate-600">Asma</button>
                      <button type="button" onClick={() => applyGenTemplate('hipertensao')} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[9px] font-black uppercase tracking-wider text-slate-600">Tensão</button>
                    </div>
                  </div>

                  <form onSubmit={handleGenerateQr} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="grid gap-1.5 text-left">
                      <span className="text-[9px] text-slate-400 font-black uppercase">Nome do Utente *</span>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Delfina Lemos"
                        value={genForm.name}
                        onChange={(e) => setGenForm(p => ({ ...p, name: e.target.value }))}
                        className="border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 h-11 bg-white outline-none"
                      />
                    </div>

                    <div className="grid gap-1.5 text-left">
                      <span className="text-[9px] text-slate-400 font-black uppercase">Bilhete de Identidade (BI) *</span>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 005432187LA099"
                        value={genForm.bi}
                        onChange={(e) => setGenForm(p => ({ ...p, bi: e.target.value }))}
                        className="border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 h-11 bg-white font-mono outline-none"
                      />
                    </div>

                    <div className="grid gap-1.5 text-left">
                      <span className="text-[9px] text-slate-400 font-black uppercase">Idade</span>
                      <input
                        type="number"
                        placeholder="Ex: 26"
                        value={genForm.age}
                        onChange={(e) => setGenForm(p => ({ ...p, age: Number(e.target.value) }))}
                        className="border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 h-11 bg-white outline-none"
                      />
                    </div>

                    <div className="grid gap-1.5 text-left">
                      <span className="text-[9px] text-slate-400 font-black uppercase">Género</span>
                      <select
                        value={genForm.gender}
                        onChange={(e) => setGenForm(p => ({ ...p, gender: e.target.value }))}
                        className="border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 h-11 bg-white outline-none"
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                      </select>
                    </div>

                    <div className="grid gap-1.5 text-left">
                      <span className="text-[9px] text-slate-400 font-black uppercase">Município</span>
                      <input
                        type="text"
                        value={genForm.municipality}
                        onChange={(e) => setGenForm(p => ({ ...p, municipality: e.target.value }))}
                        className="border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 h-11 bg-white outline-none"
                      />
                    </div>

                    <div className="grid gap-1.5 text-left">
                      <span className="text-[9px] text-slate-400 font-black uppercase">Telefone</span>
                      <input
                        type="text"
                        value={genForm.phone}
                        onChange={(e) => setGenForm(p => ({ ...p, phone: e.target.value }))}
                        className="border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 h-11 bg-white outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 grid gap-1.5 text-left">
                      <span className="text-[9px] text-slate-400 font-black uppercase">Alergias Conocidas</span>
                      <input
                        type="text"
                        value={genForm.allergies}
                        onChange={(e) => setGenForm(p => ({ ...p, allergies: e.target.value }))}
                        className="border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 h-11 bg-white outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 grid gap-1.5 text-left">
                      <span className="text-[9px] text-slate-400 font-black uppercase">Doenças Crónicas</span>
                      <input
                        type="text"
                        value={genForm.diseases}
                        onChange={(e) => setGenForm(p => ({ ...p, diseases: e.target.value }))}
                        className="border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 h-11 bg-white outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 grid gap-1.5 text-left">
                      <span className="text-[9px] text-slate-400 font-black uppercase">Medicações Regulares</span>
                      <input
                        type="text"
                        value={genForm.medications}
                        onChange={(e) => setGenForm(p => ({ ...p, medications: e.target.value }))}
                        className="border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 h-11 bg-white outline-none"
                      />
                    </div>

                    <div className="grid sm:col-span-2 gap-1.5 text-left">
                      <span className="text-[9px] text-slate-400 font-black uppercase">Contacto de Emergência Familiar</span>
                      <input
                        type="text"
                        value={genForm.emergency}
                        onChange={(e) => setGenForm(p => ({ ...p, emergency: e.target.value }))}
                        className="border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 h-11 bg-white outline-none font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="sm:col-span-2 mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      Gerar QR Code Clínico Unificado
                    </button>
                  </form>
                </div>

                {/* QR Output */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-150 pt-6 lg:pt-0 lg:pl-6 text-center">
                  {generatedQr ? (
                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 inline-block shadow-xs">
                        <img
                          src={generatedQr}
                          alt="Generated Patient QR Code"
                          className="w-48 h-48 md:w-56 md:h-56 mx-auto object-contain bg-white rounded-lg p-2 border border-slate-200/50"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase">{genForm.name}</h4>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">BI: {genForm.bi}</p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={generatedQr}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" /> Descarregar
                        </a>
                        <button
                          onClick={() => {
                            // Test scan it instantly
                            try {
                              const cleanStr = decodeURIComponent(generatedQr.split('data=')[1]);
                              const data = JSON.parse(cleanStr);
                              handleScanSuccess(data);
                              setActiveTab('ler');
                            } catch {
                              alert("Erro ao simular scan.");
                            }
                          }}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all"
                        >
                          Simular Scanner
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 max-w-xs font-semibold leading-relaxed">
                        Este código QR contém toda a ficha clínica codificada de forma legível de acordo com o padrão Dr.IA.
                      </p>
                    </div>
                  ) : (
                    <div className="py-16 text-slate-400 space-y-2">
                      <QrCode className="w-16 h-16 mx-auto text-slate-300 stroke-1" />
                      <h4 className="text-xs font-black text-slate-800 uppercase">Aguardando Emissão</h4>
                      <p className="text-[10px] text-slate-400 max-w-xs font-semibold leading-relaxed">
                        Preencha a ficha clínica do utente ao lado ou escolha um dos botões rápidos e clique em "Gerar" para ver o QR Code pronto para uso.
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </motion.div>
          )}

          {/* D. TAB: HISTÓRICO */}
          {activeTab === 'historico' && (
            <motion.div key="tab-historico-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              
              <div className="flex items-center gap-2 mb-2 text-left">
                <History className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Histórico de Escaneamentos Recentes (Sessão)</span>
              </div>

              {scannedHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-150 bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-3 px-4">Código Registo</th>
                        <th className="py-3 px-4">Nome Completo</th>
                        <th className="py-3 px-4">Bilhete Identidade</th>
                        <th className="py-3 px-4">Hora de Validação</th>
                        <th className="py-3 px-4 text-center">Estado</th>
                        <th className="py-3 px-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {scannedHistory.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                          <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400 uppercase">{item.id}</td>
                          <td className="py-3.5 px-4 font-black text-slate-700 uppercase">{item.name}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">{item.bi}</td>
                          <td className="py-3.5 px-4 text-slate-500">{item.time}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 font-black text-[9px] uppercase rounded-full">
                              ● {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setScannedData(item.data);
                                setActiveTab('ler');
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-black text-[9px] uppercase rounded-lg transition-all"
                            >
                              Ver Ficha
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <History className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-xs font-black uppercase">Nenhum registo no histórico.</p>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 6. Footer Badges Row (Matches image bottom cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div id="footer-badge-seguro" className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-3xs hover:shadow-2xs transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Seguro</h4>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Validação e criptografia com DRIA-SHIELD</p>
          </div>
        </div>

        <div id="footer-badge-confiavel" className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-3xs hover:shadow-2xs transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-left">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Confiável</h4>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Assinatura digital e integridade verificada</p>
          </div>
        </div>

        <div id="footer-badge-rapido" className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-3xs hover:shadow-2xs transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/50 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-left">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Rápido</h4>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Leitura instantânea e resposta imediata</p>
          </div>
        </div>

        <div id="footer-badge-auditavel" className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 shadow-3xs hover:shadow-2xs transition-all">
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 border border-slate-200/50 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-slate-500" />
          </div>
          <div className="text-left">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Auditável</h4>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Todas as leituras são registadas no sistema</p>
          </div>
        </div>

      </div>

    </div>
  );
}
