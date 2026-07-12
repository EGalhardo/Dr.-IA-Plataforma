/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, User, Calendar, Scale, Ruler, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Upload, Paperclip, Activity, FileText, ArrowLeft, Hospital, RefreshCw, Sparkles, AlertCircle, Mic } from 'lucide-react';
import { DriaEvaluation, DriaHospital } from '../../types/dria';
import { MOCK_HOSPITALS } from '../../constants/driaMocks';
import { useLanguage } from '../../hooks/useLanguage';

interface AvaliacaoIaContentProps {
  onAddTriage: (triage: DriaEvaluation) => void;
  hospitals?: DriaHospital[];
  bi: string;
  profileName: string;
  /** Idade inferida do perfil (data de nascimento) */
  initialAge?: number;
  /** Género do utente */
  initialGender?: string;
  /** Município de residência */
  initialMunicipality?: string;
  /** Contacto de emergência */
  initialEmergencyContact?: string;
  /** Alergias registadas no perfil */
  initialAllergies?: string;
  /** Doenças crónicas */
  initialDiseases?: string;
  /** Medicação crónica */
  initialMedications?: string;
  setTab: (tab: string) => void;
}

export function AvaliacaoIaContent({
  onAddTriage, hospitals = MOCK_HOSPITALS, bi, profileName,
  initialAge = 28, initialGender = 'Masculino', initialMunicipality = 'Luanda',
  initialEmergencyContact = '+244 923 000 111',
  initialAllergies = '', initialDiseases = '', initialMedications = '',
  setTab
}: AvaliacaoIaContentProps) {
  const { t } = useLanguage();

  // Vitals & Background Form States (inicializados a partir do perfil autenticado para sincronia)
  const [age, setAge] = useState<number>(initialAge);
  const [gender, setGender] = useState<string>(initialGender);
  const [weight, setWeight] = useState<number>(75);
  const [height, setHeight] = useState<number>(1.75);
  const [municipality, setMunicipality] = useState<string>(initialMunicipality);
  const [allergies, setAllergies] = useState<string>(initialAllergies);
  const [diseases, setDiseases] = useState<string>(initialDiseases);
  const [medications, setMedications] = useState<string>(initialMedications);
  const [emergencyContact, setEmergencyContact] = useState<string>(initialEmergencyContact);

  // App Phase: 'vitals' | 'chat' | 'analyzing' | 'result'
  const [phase, setPhase] = useState<'vitals' | 'chat' | 'analyzing' | 'result'>('chat');

  // Chat States
  const INITIAL_CHAT_MESSAGE = {
    sender: 'ai' as const,
    text: `Olá! Eu sou Dr.IA. Seja bem-vindo(a).\nEstou aqui para ouvir você e ajudar a avaliar seus sintomas por meio de algumas perguntas simples.\nO que está sentindo hoje?`,
    time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
  };
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([INITIAL_CHAT_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // Result State
  const [evaluationResult, setEvaluationResult] = useState<DriaEvaluation | null>(null);
  const [isSendingToHospital, setIsSendingToHospital] = useState(false);
  const [sentHospitalName, setSentHospitalName] = useState<string | null>(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('h1');

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    setPhase('chat');
  };

  const handleSendMessage = () => {
    if (!inputText.trim() && attachedFiles.length === 0 && uploadedPhotos.length === 0) return;

    const userMsgText = inputText.trim() || "Anexos enviados para análise clínica.";
    const userMsg = {
      sender: 'user' as const,
      text: userMsgText,
      time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Simulated AI response flow to guide user triage
    setTimeout(() => {
      // If user has only sent 1 message, ask for more details. If more, move to triage.
      if (messages.filter(m => m.sender === 'user').length === 0) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: 'Compreendi perfeitamente. Sente mais algum sintoma associado? Tem dores no corpo, dor de cabeça, vómitos ou falta de ar? Estas informações ajudam o sistema a classificar a prioridade clínica com precisão.',
          time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: 'Entendido. Estou a compilar todas as informações inseridas, o seu histórico clínico e os fatores regionais de Luanda. Por favor, aguarde uns segundos enquanto gero o seu Relatório Clínico de Triagem.',
          time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
        }]);

        // Automatically trigger evaluation analysis
        setTimeout(() => {
          triggerAnalysis(userMsgText);
        }, 1500);
      }
    }, 1000);
  };

  const simulateAttachment = (type: 'photo' | 'doc') => {
    if (type === 'photo') {
      setUploadedPhotos(['garganta_inflamada_exemplo.jpg']);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: '📸 Foto recebida com sucesso! Analisando padrões de vermelhidão e placas de pus na mucosa de forma simulada pela IA...',
        time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
      }]);
    } else {
      setAttachedFiles(['analises_sangue_maio.pdf']);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: '📎 Documento anexo recebido: "analises_sangue_maio.pdf". Extraindo indicadores hematológicos...',
        time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const triggerAnalysis = (lastInput: string) => {
    setPhase('analyzing');

    setTimeout(() => {
      // Formulate a beautiful, personalized triage based on inputs
      const lowerText = lastInput.toLowerCase();
      let diseaseSuspected = 'Malária por Plasmodium';
      let priorityLevel: string = 'Urgente';
      let specialty = 'Infectologia / Medicina Interna';
      let recommendations = [
        'Realizar gota espessa no hospital para confirmação laboratorial.',
        'Tomar soro de reidratação oral em pequenas quantidades.',
        'Controle a febre com Paracetamol se tolerado.'
      ];
      let causes = ['Malária', 'Dengue Crónica', 'Infeção viral aguda'];
      let goToHosp = true;

      if (lowerText.includes('ébola') || lowerText.includes('ebola') || lowerText.includes('sangramento') || lowerText.includes('hemorragia') || lowerText.includes('sangrar')) {
        diseaseSuspected = 'Suspeita de Doença por Vírus Ébola';
        priorityLevel = 'Emergência';
        specialty = 'Infectologia / Unidade de Isolamento de Biossegurança';
        recommendations = [
          'Isolamento imediato de forma a evitar qualquer contacto físico com outras pessoas.',
          'Evitar a partilha de utensílios, talheres, roupas ou instalações sanitárias.',
          'Dirigir-se de forma urgente à unidade de saúde indicada de forma segura.',
          'A equipa hospitalar e a equipa de resposta rápida (MINSA) foram previamente notificadas.'
        ];
        causes = ['Doença por Vírus Ébola (Suspeito)', 'Febre de Lassa', 'Malária Grave Hemorrágica'];
      } else if (lowerText.includes('diarreia') || lowerText.includes('vómito') || lowerText.includes('cólera')) {
        diseaseSuspected = 'Suspeita Epidemiológica de Cólera';
        priorityLevel = 'Urgente';
        specialty = 'Infectologia / Gastroenterologia';
        recommendations = [
          'Iniciar imediatamente terapia de hidratação oral em grandes volumes.',
          'Isolar utensílios de alimentação para prevenir infeção familiar.',
          'Dirigir-se de forma urgente para uma Unidade de Triagem de Cólera.'
        ];
        causes = ['Cólera', 'Gastroenterite Bacteriana Severa', 'Salmonelose'];
      } else if (lowerText.includes('tosse') || lowerText.includes('peito') || lowerText.includes('respirar')) {
        diseaseSuspected = 'Suspeita de Tuberculose ou Infeção Pulmonar';
        priorityLevel = 'Moderado';
        specialty = 'Pneumologia / Clínica Geral';
        recommendations = [
          'Agendar teste de expetoração (GeneXpert) no Centro de Saúde.',
          'Usar máscara em ambientes familiares para prevenção.',
          'Manter boa ventilação e entrada de luz solar nos quartos.'
        ];
        causes = ['Tuberculose Pulmonar', 'Bronquite Aguda', 'Pneumonia Bacteriana'];
      } else if (lowerText.includes('queimadura') || lowerText.includes('quente') || lowerText.includes('fogo')) {
        diseaseSuspected = 'Queimadura Térmica Cutânea';
        priorityLevel = 'Moderado';
        specialty = 'Cirurgia Geral / Dermatologia';
        recommendations = [
          'Arrefecer a lesão com água corrente limpa por 15 minutos.',
          'Não furar bolhas formadas para evitar infeções oportunistas.',
          'Cobrir suavemente a ferida com gaze estéril humedecida.'
        ];
        causes = ['Lesão Térmica Directa'];
      } else if (lowerText.includes('dor de cabeça') && !lowerText.includes('febre')) {
        diseaseSuspected = 'Cefaleia de Tensão / Enxaqueca';
        priorityLevel = 'Leve';
        specialty = 'Clínica Geral / Neurologia';
        recommendations = [
          'Repousar em ambiente silencioso e pouco iluminado.',
          'Manter hidratação regular e evitar cafeína em excesso.',
          'Se a dor persistir mais de 48h, consulte um clínico geral.'
        ];
        causes = ['Enxaqueca Clássica', 'Cefaleia Tensional', 'Fadiga Ocular'];
        goToHosp = false;
      }

      const newEval: DriaEvaluation = {
        id: 'ev_' + Date.now(),
        patientName: profileName || 'Utente Registado',
        patientBI: bi,
        patientAge: age,
        patientGender: gender,
        patientWeight: weight,
        patientHeight: height,
        patientMunicipality: municipality,
        symptoms: lastInput || 'Febre, fadiga e mal-estar geral relatados.',
        photos: uploadedPhotos,
        allergies: allergies || 'Nenhuma alergia relatada.',
        diseases: diseases || 'Sem histórico clínico relevante.',
        medications: medications || 'Sem medicação continuada.',
        aiSummary: `Paciente com sintomas expressivos analisados pelo assistente virtual. Com base na idade (${age} anos) e sintomas descritos, o perfil epidemiológico de ${municipality} sugere rastreio focado em ${diseaseSuspected}.`,
        possibleCauses: causes,
        suggestedSpecialty: specialty,
        priority: priorityLevel,
        recommendations: recommendations,
        goToHospital: goToHosp,
        submittedHospitalId: null,
        submittedHospitalName: null,
        submissionTime: null,
        doctorConfirmedDiagnosis: null,
        doctorExams: [],
        doctorObservations: null,
        doctorStatus: 'Aguardando',
        emergencyContact: emergencyContact
      };

      setEvaluationResult(newEval);
      setPhase('result');
    }, 2500);
  };

  const handleSendToHospital = () => {
    if (!evaluationResult) return;
    setIsSendingToHospital(true);

    const selectedHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];

    setTimeout(() => {
      const finalTriage: DriaEvaluation = {
        ...evaluationResult,
        submittedHospitalId: selectedHospital.id,
        submittedHospitalName: selectedHospital.name,
        submissionTime: new Date().toLocaleDateString('pt-AO') + ' ' + new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
      };

      onAddTriage(finalTriage);
      setEvaluationResult(finalTriage);
      setSentHospitalName(selectedHospital.name);
      setIsSendingToHospital(false);
    }, 1500);
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Emergência': return 'bg-red-50 border-red-200 text-red-700 font-extrabold animate-pulse';
      case 'Muito Urgente': return 'bg-orange-50 border-orange-200 text-orange-700 font-extrabold';
      case 'Urgente': return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'Moderado': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'Leve': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getPriorityDot = (p: string) => {
    switch (p) {
      case 'Emergência': return 'bg-red-500';
      case 'Muito Urgente': return 'bg-orange-500';
      case 'Urgente': return 'bg-rose-500';
      case 'Moderado': return 'bg-amber-500';
      case 'Leve': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col font-sans h-[calc(100vh-190px)] lg:h-[calc(100vh-150px)] min-h-[500px] lg:min-h-[620px]">
      
      {/* Header Banner - Conditionally shown depending on phase */}
      {phase !== 'chat' ? (
        <div className="bg-gradient-to-r from-[#0E2B64] to-indigo-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Activity className="text-emerald-400" size={20} />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight leading-none flex items-center gap-1.5">
                Avaliação IA Clínica <Sparkles size={14} className="text-emerald-400 animate-pulse" />
              </h2>
              <p className="text-[10px] text-indigo-200 font-extrabold uppercase tracking-widest mt-1">Triagem Autónoma Inteligente</p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-indigo-850 border border-indigo-700 rounded-full text-[9px] font-bold text-indigo-100 flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-400" /> Protocolo Manchester
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 px-6 pt-5 pb-3 border-b border-slate-100 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#A855F7]/15 flex items-center justify-center text-[#A855F7] shrink-0">
            <Bot size={20} className="stroke-[2.5]" />
          </div>
          <h2 className="text-base md:text-lg font-black text-slate-800 tracking-tight">
            Assistente de Triagem IA
          </h2>
        </div>
      )}

      <div className={`flex-1 flex flex-col bg-slate-50/50 min-h-0 ${phase === 'chat' ? 'p-0 overflow-hidden' : 'overflow-y-auto p-4 md:p-6'}`}>
        <AnimatePresence mode="wait">

          {/* PHASE 1: VITALS FORM */}
          {phase === 'vitals' && (
            <motion.form
              key="vitals-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              onSubmit={handleStartChat}
              className="space-y-5 max-w-2xl mx-auto w-full py-2"
            >
              <div className="text-center max-w-md mx-auto space-y-2 mb-4">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Vantagens do Rastreio Virtual</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Insira as suas informações fisiológicas atuais. Elas serão integradas na análise da IA para calcular a prioridade de atendimento clínico de forma exata.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10.5px] text-slate-500 font-black uppercase tracking-wider">Idade</label>
                  <div className="flex items-center gap-2 border border-slate-200 focus-within:border-indigo-600 rounded-xl px-3 py-2 bg-slate-50/50">
                    <Calendar size={15} className="text-indigo-600 shrink-0" />
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={e => setAge(Number(e.target.value))}
                      className="w-full bg-transparent outline-none text-slate-800 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10.5px] text-slate-500 font-black uppercase tracking-wider">Género</label>
                  <div className="flex items-center gap-2 border border-slate-200 focus-within:border-indigo-600 rounded-xl px-3 py-2 bg-slate-50/50">
                    <User size={15} className="text-indigo-600 shrink-0" />
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="w-full bg-transparent outline-none text-slate-800 text-xs font-bold border-none"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10.5px] text-slate-500 font-black uppercase tracking-wider">Peso (Kg)</label>
                  <div className="flex items-center gap-2 border border-slate-200 focus-within:border-indigo-600 rounded-xl px-3 py-2 bg-slate-50/50">
                    <Scale size={15} className="text-indigo-600 shrink-0" />
                    <input
                      type="number"
                      required
                      value={weight}
                      onChange={e => setWeight(Number(e.target.value))}
                      className="w-full bg-transparent outline-none text-slate-800 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10.5px] text-slate-500 font-black uppercase tracking-wider">Altura (m)</label>
                  <div className="flex items-center gap-2 border border-slate-200 focus-within:border-indigo-600 rounded-xl px-3 py-2 bg-slate-50/50">
                    <Ruler size={15} className="text-indigo-600 shrink-0" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={height}
                      onChange={e => setHeight(Number(e.target.value))}
                      className="w-full bg-transparent outline-none text-slate-800 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-left col-span-2">
                  <label className="text-[10.5px] text-slate-500 font-black uppercase tracking-wider">Contacto de Emergência</label>
                  <div className="flex items-center gap-2 border border-slate-200 focus-within:border-indigo-600 rounded-xl px-3 py-2 bg-slate-50/50">
                    <User size={15} className="text-indigo-600 shrink-0" />
                    <input
                      type="text"
                      required
                      value={emergencyContact}
                      onChange={e => setEmergencyContact(e.target.value)}
                      className="w-full bg-transparent outline-none text-slate-800 text-xs font-bold"
                      placeholder="+244 9..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/60 text-left space-y-3">
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-indigo-600" /> Antecedentes Médicos (Opcional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Alergias</label>
                    <textarea
                      value={allergies}
                      onChange={e => setAllergies(e.target.value)}
                      placeholder="Penicilina, paracetamol, etc."
                      className="w-full h-12 bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none resize-none focus:border-indigo-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Doenças Crónicas</label>
                    <textarea
                      value={diseases}
                      onChange={e => setDiseases(e.target.value)}
                      placeholder="Hipertensão, Diabetes, Asma..."
                      className="w-full h-12 bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none resize-none focus:border-indigo-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">Medicamentos Atuais</label>
                    <textarea
                      value={medications}
                      onChange={e => setMedications(e.target.value)}
                      placeholder="Lista de medicamentos ativos..."
                      className="w-full h-12 bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold outline-none resize-none focus:border-indigo-500 mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 text-center">
                <button
                  type="submit" aria-label="Submeter formulário"
                  className="px-8 py-3 bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 mx-auto cursor-pointer"
                >
                  Iniciar Chat Diagnóstico <ChevronRight size={15} />
                </button>
              </div>
            </motion.form>
          )}


          {/* PHASE 2: Symptom Chat Room */}
          {phase === 'chat' && (
            <motion.div
              key="chat-room"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex-1 flex flex-col text-left bg-slate-50/50 overflow-hidden"
            >
              {/* Chat Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} gap-2.5 items-start`}
                  >
                    {m.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-lg bg-[#A855F7]/10 flex items-center justify-center shrink-0 text-[#A855F7]">
                        <Bot size={15} />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3 text-xs md:text-[13.5px] leading-relaxed shadow-sm whitespace-pre-line ${
                        m.sender === 'user'
                          ? 'bg-[#2979FF] text-white rounded-tr-none font-semibold'
                          : 'bg-[#EBF3FC] text-slate-800 rounded-tl-none font-semibold border border-blue-50/40'
                      }`}
                    >
                      <p>{m.text}</p>
                      <span className={`block text-[8.5px] mt-1 text-right ${m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {m.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Attachments preview */}
              {(uploadedPhotos.length > 0 || attachedFiles.length > 0) && (
                <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-2">
                  {uploadedPhotos.map((p, i) => (
                    <div key={i} className="px-2.5 py-1 bg-violet-50 border border-violet-200 text-violet-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                      📸 Foto: {p} <button type="button" onClick={() => setUploadedPhotos([])} className="text-red-500 font-bold ml-1">×</button>
                    </div>
                  ))}
                  {attachedFiles.map((f, i) => (
                    <div key={i} className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                      📎 Ficheiro: {f} <button type="button" onClick={() => setAttachedFiles([])} className="text-red-500 font-bold ml-1">×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Input controls with exact layout of the image */}
              <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => simulateAttachment('photo')}
                  className="w-11 h-11 rounded-2xl bg-[#A855F7] text-white hover:bg-[#9333EA] active:scale-95 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                  title="Simular foto de sintoma"
                >
                  <Paperclip size={18} />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite seus sintomas ou fale..."
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs md:text-sm font-semibold outline-none focus:border-[#2979FF] text-slate-800 placeholder-slate-400/90 shadow-4xs"
                />

                <button
                  type="button"
                  onClick={() => {
                    setInputText("Sinto dor de cabeça constante, cansaço acumulado e calafrios há 2 dias.");
                  }}
                  className="w-11 h-11 rounded-2xl bg-[#00D254] text-white hover:bg-[#00B849] active:scale-95 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                  title="Falar"
                >
                  <Mic size={18} />
                </button>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="px-5 h-11 bg-[#2979FF] hover:bg-[#1A68FF] active:scale-95 text-white font-extrabold text-xs md:text-sm uppercase tracking-wider rounded-2xl transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send size={15} /> Enviar
                </button>
              </div>
            </motion.div>
          )}


          {/* PHASE 3: ANALYZING LOADER */}
          {phase === 'analyzing' && (
            <motion.div
              key="analyzing-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl scale-125 animate-pulse" />
                <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin flex items-center justify-center relative z-10">
                  <Bot size={24} className="text-indigo-600" />
                </div>
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Cálculo Clínico em Curso...</h3>
                <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5 animate-pulse">A aplicar algoritmo de Manchester</p>
                <div className="pt-2 text-xs text-slate-500 leading-normal space-y-1">
                  <p className="animate-fadeIn">✓ Mapeando fatores fisiológicos de idade e género...</p>
                  <p className="animate-fadeIn delay-100">✓ Analisando descrição sintomática por PLN...</p>
                  <p className="animate-fadeIn delay-200">✓ Verificando focos epidemiológicos no município de {municipality}...</p>
                </div>
              </div>
            </motion.div>
          )}


          {/* PHASE 4: TRIAGE REPORT VIEW & HOSPITAL SELECTOR */}
          {phase === 'result' && evaluationResult && (
            <motion.div
              key="result-report"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-left max-w-3xl mx-auto w-full py-1"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <div className="flex items-center gap-2.5">
                  <FileText className="text-indigo-600 shrink-0" size={20} />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase leading-none">Relatório Clínico de Triagem</h3>
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase mt-1">Nº ID: {evaluationResult.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPhase('vitals');
                    setEvaluationResult(null);
                    setMessages([{ ...INITIAL_CHAT_MESSAGE, time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }) }]);
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-700 cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <RefreshCw size={12} /> Nova Avaliação
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-5 items-stretch">
                
                {/* Left Side: Report Details */}
                <div className="border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm bg-white">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-[10.5px] text-slate-400 font-black uppercase tracking-wider">Prioridade de Triagem</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${getPriorityColor(evaluationResult.priority)}`}>
                      <span className={`w-2 h-2 rounded-full ${getPriorityDot(evaluationResult.priority)} animate-pulse`} />
                      {evaluationResult.priority}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">Resumo da Avaliação</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      {evaluationResult.aiSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-indigo-50/20 p-3 rounded-xl border border-indigo-100/30">
                    <div>
                      <span className="text-[9px] text-indigo-900 font-black uppercase tracking-wider block">Sugestão de Especialidade</span>
                      <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">{evaluationResult.suggestedSpecialty}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-indigo-900 font-black uppercase tracking-wider block">Causas Prováveis</span>
                      <span className="text-xs font-bold text-slate-600 mt-0.5 block">
                        {evaluationResult.possibleCauses.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider block">Recomendações Médicas IA</span>
                    <ul className="space-y-2">
                      {evaluationResult.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-600 leading-normal">
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Side: Hospital Forwarding */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-55/40 flex flex-col justify-between space-y-4">
                  {sentHospitalName ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 bg-white rounded-xl border border-emerald-100 shadow-sm h-full"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm">
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Enviado com Sucesso</span>
                        <h4 className="text-sm font-black text-slate-900 leading-tight uppercase mt-0.5">{sentHospitalName}</h4>
                        <p className="text-[11px] text-slate-500 leading-normal mt-2">
                          O relatório clínico foi integrado no prontuário do hospital. Quando der entrada, os médicos já estarão cientes da sua triagem preliminar!
                        </p>
                      </div>
                      <button
                        onClick={() => setTab('historico')}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer shadow-sm mt-2"
                      >
                        Ver no meu Histórico
                      </button>
                    </motion.div>
                  ) : (
                    <div className="space-y-4 text-left flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Hospital size={14} className="text-indigo-600 animate-pulse" /> Encaminhar Relatório
                        </h4>
                        <p className="text-[11.5px] text-slate-500 leading-normal font-semibold">
                          Ao escolher e enviar este relatório, o hospital recebe o seu histórico de triagem de imediato, adiantando o seu acolhimento e poupando tempo na admissão física.
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Selecionar Posto de Saúde / Hospital</label>
                        <select
                          value={selectedHospitalId}
                          onChange={e => setSelectedHospitalId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-indigo-500 outline-none shadow-sm"
                        >
                          {hospitals.map(h => (
                            <option key={h.id} value={h.id}>
                              {h.name} ({h.distance}) - {h.municipality}
                            </option>
                          ))}
                        </select>

                        {/* Selected Hospital Info */}
                        {(() => {
                          const h = hospitals.find(x => x.id === selectedHospitalId);
                          if (!h) return null;
                          return (
                            <div className="bg-white border border-slate-100 rounded-xl p-3 text-[11px] space-y-1.5 font-bold shadow-sm text-slate-600">
                              <p className="text-slate-800 font-extrabold uppercase text-[10px] tracking-tight">{h.name}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {h.specialties.slice(0, 2).map((sp, i) => (
                                  <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] uppercase tracking-wider">
                                    {sp}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center justify-between text-[9px] text-slate-400 uppercase font-black pt-1 border-t border-slate-50">
                                <span>Tempo de espera: <b className="text-indigo-600 font-extrabold">{h.avgWaitTime}</b></span>
                                <span>Distância: <b className="text-slate-700">{h.distance}</b></span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <button
                          type="button"
                          disabled={isSendingToHospital}
                          onClick={handleSendToHospital}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isSendingToHospital ? (
                            <>
                              <RefreshCw size={15} className="animate-spin" /> A Enviar Dados...
                            </>
                          ) : (
                            <>
                              Enviar Relatório ao Hospital
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
