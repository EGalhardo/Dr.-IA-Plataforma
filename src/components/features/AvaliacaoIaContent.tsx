/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, User, Calendar, Scale, Ruler, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Upload, Paperclip, Activity, FileText, ArrowLeft, Hospital, RefreshCw, Sparkles, AlertCircle, Mic, Mic2, Volume2, VolumeX, X, Loader2 } from 'lucide-react';
import { DriaEvaluation, DriaHospital } from '../../types/dria';
import { MOCK_HOSPITALS } from '../../constants/driaMocks';
import { useLanguage } from '../../hooks/useLanguage';
import { supabaseService, hasValidSupabaseKeys } from '../../services/supabaseService';

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
    text: `Bom dia! Seja bem-vindo ao Dr.IA, uma plataforma de Saúde. Em que posso ser útil?`,
    time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
  };
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([INITIAL_CHAT_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);

  // Result State
  const [evaluationResult, setEvaluationResult] = useState<DriaEvaluation | null>(null);
  const [isSendingToHospital, setIsSendingToHospital] = useState(false);
  const [sentHospitalName, setSentHospitalName] = useState<string | null>(null);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('h1');

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        transcribeAudio();
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
      
      mediaRecorder.start(100);
      setIsRecording(true);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAudioLevel(Math.min(average / 128, 1));
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'pt');
    
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.text) {
        setInputText(data.text);
        handleSendMessage();
      } else if (data.error) {
        console.error('Erro na transcrição:', data.error);
        alert('Erro na transcrição: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao transcrever áudio:', error);
      alert('Erro ao conectar com o serviço de transcrição.');
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    setPhase('chat');
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && attachedFiles.length === 0 && uploadedPhotos.length === 0) return;

    const userMsgText = inputText.trim() || "Anexos enviados para análise clínica.";
    const userMsg = {
      sender: 'user' as const,
      text: userMsgText,
      time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setUserMessageCount(prev => prev + 1);
    setIsLoading(true);

    try {
      // Build message history for API
      const apiMessages = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));
      apiMessages.push({ role: 'user', content: userMsgText });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          isGovMode: false,
          currentPage: 'avaliacao-ia',
          pageContext: `Triagem clínica do cidadão ${profileName} (BI: ${bi}, Idade: ${age}, Género: ${gender}, Município: ${municipality}). Alergias: ${allergies || 'Nenhuma'}. Doenças crónicas: ${diseases || 'Nenhuma'}. Medicação: ${medications || 'Nenhuma'}. Contacto emergência: ${emergencyContact}`,
          language: 'pt'
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.message) {
        const aiMsg = {
          sender: 'ai' as const,
          text: data.message,
          time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);

        // After 3 user messages, trigger triage analysis (allows proper conversation)
        if (userMessageCount >= 3) {
          setTimeout(() => {
            triggerAnalysis(userMsgText);
          }, 1500);
        }
      } else {
        throw new Error(data.error || 'Falha na resposta da IA');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg = {
        sender: 'ai' as const,
        text: 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.',
        time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-170px)] lg:h-[calc(100vh-130px)] min-h-[460px] lg:min-h-[560px]">
      {/* Header Banner - Conditionally shown depending on phase */}
      {phase !== 'chat' ? (
        <div className="bg-gradient-to-r from-[#0E2B64] to-indigo-900 p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <Activity className="text-emerald-400" size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight leading-none flex items-center gap-1">
                Avaliação IA Clínica <Sparkles size={12} className="text-emerald-400 animate-pulse" />
              </h2>
              <p className="text-[9px] text-indigo-200 font-extrabold uppercase tracking-widest mt-0.5">Triagem Autónoma Inteligente</p>
            </div>
          </div>
          <div className="px-2.5 py-1 bg-indigo-850 border border-indigo-700 rounded-full text-[8px] font-bold text-indigo-100 flex items-center gap-1">
            <ShieldCheck size={10} className="text-emerald-400" /> Protocolo Manchester
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#A855F7]/15 flex items-center justify-center text-[#A855F7] shrink-0">
            <Bot size={18} className="stroke-[2.5]" />
          </div>
          <h2 className="text-sm md:text-base font-black text-slate-800 tracking-tight">
            Assistente de Triagem IA
          </h2>
        </div>
      )}

      <div className={`flex-1 flex flex-col bg-slate-50/30 min-h-0 ${phase === 'chat' ? 'p-0 overflow-hidden' : 'overflow-y-auto p-3 md:p-4'}`}>
        <AnimatePresence mode="wait">

          {/* PHASE 1: VITALS FORM */}
          {phase === 'vitals' && (
            <motion.form
              key="vitals-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleStartChat}
              className="space-y-3.5 max-w-2xl mx-auto w-full py-1.5"
            >
              <div className="text-center max-w-md mx-auto space-y-1.5 mb-3">
                <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Vantagens do Rastreio Virtual</h3>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Insira as suas informações fisiológicas atuais. Elas serão integradas na análise da IA para calcular a prioridade de atendimento clínico de forma exata.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-0.5 text-left">
                  <label className="text-[9.5px] text-slate-500 font-black uppercase tracking-wider">Idade</label>
                  <div className="flex items-center gap-1.5 border border-slate-200 focus-within:border-indigo-600 rounded-lg px-2.5 py-1.5 bg-slate-50/50">
                    <Calendar size={13} className="text-indigo-600 shrink-0" />
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={e => setAge(Number(e.target.value))}
                      className="w-full bg-transparent outline-none text-slate-800 text-[10px] font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 text-left">
                  <label className="text-[9.5px] text-slate-500 font-black uppercase tracking-wider">Género</label>
                  <div className="flex items-center gap-1.5 border border-slate-200 focus-within:border-indigo-600 rounded-lg px-2.5 py-1.5 bg-slate-50/50">
                    <User size={13} className="text-indigo-600 shrink-0" />
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="w-full bg-transparent outline-none text-slate-800 text-[10px] font-bold border-none"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 text-left">
                  <label className="text-[9.5px] text-slate-500 font-black uppercase tracking-wider">Peso (Kg)</label>
                  <div className="flex items-center gap-1.5 border border-slate-200 focus-within:border-indigo-600 rounded-lg px-2.5 py-1.5 bg-slate-50/50">
                    <Scale size={13} className="text-indigo-600 shrink-0" />
                    <input
                      type="number"
                      required
                      value={weight}
                      onChange={e => setWeight(Number(e.target.value))}
                      className="w-full bg-transparent outline-none text-slate-800 text-[10px] font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 text-left">
                  <label className="text-[9.5px] text-slate-500 font-black uppercase tracking-wider">Altura (m)</label>
                  <div className="flex items-center gap-1.5 border border-slate-200 focus-within:border-indigo-600 rounded-lg px-2.5 py-1.5 bg-slate-50/50">
                    <Ruler size={13} className="text-indigo-600 shrink-0" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={height}
                      onChange={e => setHeight(Number(e.target.value))}
                      className="w-full bg-transparent outline-none text-slate-800 text-[10px] font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-0.5 text-left col-span-2 sm:col-span-2">
                  <label className="text-[9.5px] text-slate-500 font-black uppercase tracking-wider">Contacto de Emergência</label>
                  <div className="flex items-center gap-1.5 border border-slate-200 focus-within:border-indigo-600 rounded-lg px-2.5 py-1.5 bg-slate-50/50">
                    <User size={13} className="text-indigo-600 shrink-0" />
                    <input
                      type="text"
                      required
                      value={emergencyContact}
                      onChange={e => setEmergencyContact(e.target.value)}
                      className="w-full bg-transparent outline-none text-slate-800 text-[10px] font-bold"
                      placeholder="+244 9..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50/30 p-3 rounded-xl border border-indigo-100/50 text-left space-y-2">
                <h4 className="text-[9.5px] font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                  <Activity size={12} className="text-indigo-600" /> Antecedentes Médicos (Opcional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Alergias</label>
                    <textarea
                      value={allergies}
                      onChange={e => setAllergies(e.target.value)}
                      placeholder="Penicilina, paracetamol, etc."
                      className="w-full h-10 bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-semibold outline-none resize-none focus:border-indigo-500 mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Doenças Crónicas</label>
                    <textarea
                      value={diseases}
                      onChange={e => setDiseases(e.target.value)}
                      placeholder="Hipertensão, Diabetes, Asma..."
                      className="w-full h-10 bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-semibold outline-none resize-none focus:border-indigo-500 mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Medicamentos Atuais</label>
                    <textarea
                      value={medications}
                      onChange={e => setMedications(e.target.value)}
                      placeholder="Lista de medicamentos ativos..."
                      className="w-full h-10 bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-semibold outline-none resize-none focus:border-indigo-500 mt-0.5"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="submit" aria-label="Submeter formulário"
                  className="px-6 py-2.5 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-100/50 transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
                >
                  Iniciar Chat Diagnóstico <ChevronRight size={13} />
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
              className="w-full flex-1 flex flex-col text-left bg-slate-50/30 overflow-hidden"
            >
              {/* Chat Messages */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-0">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} gap-2 items-start`}
                  >
                    {m.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-lg bg-[#A855F7]/10 flex items-center justify-center shrink-0 text-[#A855F7]">
                        <Bot size={13} />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-[11px] md:text-[12px] leading-relaxed shadow-sm whitespace-pre-line ${
                        m.sender === 'user'
                          ? 'bg-[#2979FF] text-white rounded-tr-none font-semibold'
                          : 'bg-[#EBF3FC] text-slate-800 rounded-tl-none font-semibold border border-blue-50/40'
                      }`}
                    >
                      <p>{m.text}</p>
                      <span className={`block text-[7.5px] mt-0.5 text-right ${m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {m.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Attachments preview */}
              {(uploadedPhotos.length > 0 || attachedFiles.length > 0) && (
                <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-1.5">
                  {uploadedPhotos.map((p, i) => (
                    <div key={i} className="px-2 py-0.5 bg-violet-50 border border-violet-200 text-violet-700 rounded-lg text-[9px] font-bold flex items-center gap-1">
                      📸 Foto: {p} <button type="button" onClick={() => setUploadedPhotos([])} className="text-red-500 font-bold ml-1">×</button>
                    </div>
                  ))}
                  {attachedFiles.map((f, i) => (
                    <div key={i} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-[9px] font-bold flex items-center gap-1">
                      📎 Ficheiro: {f} <button type="button" onClick={() => setAttachedFiles([])} className="text-red-500 font-bold ml-1">×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Chat Input controls */}
              <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => simulateAttachment('photo')}
                  className="w-10 h-10 rounded-xl bg-[#A855F7] text-white hover:bg-[#9333EA] active:scale-95 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
                  title="Simular foto de sintoma"
                >
                  <Paperclip size={16} />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite seus sintomas ou fale..."
                  className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] md:text-sm font-semibold outline-none focus:border-[#2979FF] text-slate-800 placeholder-slate-400/90 shadow-4xs"
                />

                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  disabled={isRecording && audioChunksRef.current.length === 0}
                  className={`w-10 h-10 rounded-xl transition-all cursor-pointer shrink-0 shadow-sm flex items-center justify-center ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-[#00D254] text-white hover:bg-[#00B849] active:scale-95'
                  }`}
                  title={isRecording ? "Parar gravação" : "Iniciar gravação de voz"}
                >
                  {isRecording ? <Mic2 size={16} /> : <Mic size={16} />}
                </button>

                {isRecording && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-100 rounded-lg text-red-700">
                    <div className="flex items-end gap-0.5 h-5">
                      {[1,2,3,4,5].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [`${Math.max(10, audioLevel * 100 * (0.3 + i * 0.15))}%`, `${Math.max(10, audioLevel * 100 * (0.5 + i * 0.1))}%`] }}
                          transition={{ duration: 0.15, repeat: Infinity, ease: "easeInOut" }}
                          className="w-1 rounded-full bg-red-500"
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold">Gravando...</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={isLoading || (!inputText.trim() && attachedFiles.length === 0 && uploadedPhotos.length === 0)}
                  className={`px-4 h-10 transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5 shadow-sm ${
                    isLoading || (!inputText.trim() && attachedFiles.length === 0 && uploadedPhotos.length === 0)
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-[#2979FF] hover:bg-[#1A68FF] active:scale-95 text-white font-extrabold text-[10px] md:text-sm uppercase tracking-wider rounded-xl'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span className="text-[10px]">A processar...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} /> Enviar
                    </>
                  )}
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
              className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-3"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-100 rounded-full blur-xl scale-125 animate-pulse" />
                <div className="w-14 h-14 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin flex items-center justify-center relative z-10">
                  <Bot size={22} className="text-indigo-600" />
                </div>
              </div>
              <div className="space-y-0.5 max-w-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Cálculo Clínico em Curso...</h3>
                <p className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5 animate-pulse">A aplicar algoritmo de Manchester</p>
                <div className="pt-1.5 text-[9.5px] text-slate-500 leading-normal space-y-0.5">
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 text-left max-w-3xl mx-auto w-full py-0.5"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-slate-50 border border-slate-100 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <FileText className="text-indigo-600 shrink-0" size={18} />
                  <div>
                    <h3 className="text-[11px] font-black text-slate-900 uppercase leading-none">Relatório Clínico de Triagem</h3>
                    <p className="text-[8.5px] text-slate-400 font-extrabold uppercase mt-0.5">Nº ID: {evaluationResult.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPhase('vitals');
                    setEvaluationResult(null);
                    setMessages([{ ...INITIAL_CHAT_MESSAGE, time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' }) }]);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-700 cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <RefreshCw size={10} /> Nova Avaliação
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 items-start">
                {/* Left Side: Report Details */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm bg-white">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">Prioridade de Triagem</span>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1 ${getPriorityColor(evaluationResult.priority)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(evaluationResult.priority)} animate-pulse`} />
                      {evaluationResult.priority}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Resumo da Avaliação</span>
                    <p className="text-[10px] text-slate-700 leading-relaxed font-semibold bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      {evaluationResult.aiSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-indigo-50/20 p-2.5 rounded-lg border border-indigo-100/30">
                    <div>
                      <span className="text-[8.5px] text-indigo-900 font-black uppercase tracking-wider block">Sugestão de Especialidade</span>
                      <span className="text-[10px] font-extrabold text-slate-800 mt-0.5 block">{evaluationResult.suggestedSpecialty}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] text-indigo-900 font-black uppercase tracking-wider block">Causas Prováveis</span>
                      <span className="text-[10px] font-bold text-slate-600 mt-0.5 block">
                        {evaluationResult.possibleCauses.join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Recomendações Médicas IA</span>
                    <ul className="space-y-1.5">
                      {evaluationResult.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px] font-semibold text-slate-600 leading-normal">
                          <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Side: Hospital Forwarding */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-55/30 flex flex-col justify-between space-y-3">
                  {sentHospitalName ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-2 bg-white rounded-lg border border-emerald-100 shadow-sm h-full"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm">
                        <CheckCircle2 size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">Enviado com Sucesso</span>
                        <h4 className="text-sm font-black text-slate-900 leading-tight uppercase mt-0.5">{sentHospitalName}</h4>
                        <p className="text-[10px] text-slate-500 leading-normal mt-1.5">
                          O relatório clínico foi integrado no prontuário do hospital. Quando der entrada, os médicos já estarão cientes da sua triagem preliminar!
                        </p>
                      </div>
                      <button
                        onClick={() => setTab('historico')}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] uppercase tracking-wider rounded-lg cursor-pointer shadow-sm mt-1.5"
                      >
                        Ver no meu Histórico
                      </button>
                    </motion.div>
                  ) : (
                    <div className="space-y-3 text-left flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1">
                          <Hospital size={12} className="text-indigo-600 animate-pulse" /> Encaminhar Relatório
                        </h4>
                        <p className="text-[10.5px] text-slate-500 leading-normal font-semibold">
                          Ao escolher e enviar este relatório, o hospital recebe o seu histórico de triagem de imediato, adiantando o seu acolhimento e poupando tempo na admissão física.
                        </p>
                      </div>

                      <div className="space-y-2.5 pt-1">
                        <label className="text-[9.5px] text-slate-500 font-black uppercase tracking-wider block">Selecionar Posto de Saúde / Hospital</label>
                        <select
                          value={selectedHospitalId}
                          onChange={e => setSelectedHospitalId(e.target.value)}
                          className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-800 focus:border-indigo-500 outline-none shadow-sm"
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
                            <div className="bg-white border border-slate-100 rounded-lg p-2.5 text-[10px] space-y-1 font-bold shadow-sm text-slate-600">
                              <p className="text-slate-800 font-extrabold uppercase text-[9px] tracking-tight">{h.name}</p>
                              <div className="flex flex-wrap gap-1">
                                {h.specialties.slice(0, 2).map((sp, i) => (
                                  <span key={i} className="px-1 py-0.5 bg-slate-100 text-slate-600 rounded text-[8px] uppercase tracking-wider">
                                    {sp}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center justify-between text-[8px] text-slate-400 uppercase font-black pt-1 border-t border-slate-50">
                                <span>Tempo de espera: <b className="text-indigo-600 font-extrabold">{h.avgWaitTime}</b></span>
                                <span>Distância: <b className="text-slate-700">{h.distance}</b></span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="pt-3 border-t border-slate-200">
                        <button
                          type="button"
                          disabled={isSendingToHospital}
                          onClick={handleSendToHospital}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9.5px] uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {isSendingToHospital ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" /> A Enviar Dados...
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