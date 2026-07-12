/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MINSA — Gestão e Registo de Hospitais Integrados
 * Substitui todo o conteúdo pelo painel de gestão institucional de hospitais.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Building2, MapPin, Clock, Stethoscope, ShieldCheck, 
  CheckCircle2, Globe, Activity, Plus, Cpu, Trash2, Edit3, 
  FolderOpen, Power, X, SlidersHorizontal, Filter, FileText, 
  Database, TrendingUp, Sparkles, PlusCircle, ArrowLeftRight, 
  ChevronLeft, ChevronRight, User, AlertCircle, RefreshCw
} from 'lucide-react';
import { DriaHospital } from '../../types/dria';
import { useLanguage } from '../../hooks/useLanguage';

interface MinsaHospitaisContentProps {
  hospitals?: DriaHospital[];
  evaluations?: any[];
  onToggleIntegration?: (hospitalId: string) => void;
}

interface ExtendedHospital {
  id: string;
  sigla: string;
  name: string;
  municipality: string;
  province: string;
  responsible: string;
  role: string;
  doctorsCount: number;
  triageVolume: string; // Correspondência ou volume de triagens
  aiUsage: number;
  integrationState: 'Ativo' | 'Pendente' | 'Inativo';
  specialties: string[];
  avgWaitTime: string;
  hours: string;
  category: 'Hospital Geral' | 'Hospital Central' | 'Hospital Provincial' | 'Hospital Pediátrico' | 'Centro de Saúde';
}

const INITIAL_EXTENDED_HOSPITALS: ExtendedHospital[] = [
  {
    id: 'HOSP-01',
    sigla: 'HGL',
    name: 'Hospital Geral de Luanda',
    municipality: 'Talatona',
    province: 'Luanda',
    responsible: 'Dr. João Sebastião',
    role: 'Director Geral',
    doctorsCount: 14,
    triageVolume: '54.208',
    aiUsage: 91,
    integrationState: 'Ativo',
    specialties: ['Pediatria', 'Medicina Geral', 'Cardiologia', 'Ginecologia'],
    avgWaitTime: '15 min',
    hours: '24h',
    category: 'Hospital Geral'
  },
  {
    id: 'HOSP-02',
    sigla: 'HJM',
    name: 'Hospital Josina Machel',
    municipality: 'Ingombota',
    province: 'Luanda',
    responsible: 'Dr. Francisco Manuel',
    role: 'Presidente do Conselho de Administração',
    doctorsCount: 45,
    triageVolume: '343.400',
    aiUsage: 74,
    integrationState: 'Ativo',
    specialties: ['Cirurgia Geral', 'Ortopedia', 'Urgências', 'Neurologia'],
    avgWaitTime: '25 min',
    hours: '24h',
    category: 'Hospital Central'
  },
  {
    id: 'HOSP-03',
    sigla: 'HPS',
    name: 'Hospital Pediátrico David Bernardino',
    municipality: 'Maianga',
    province: 'Luanda',
    responsible: 'Dr. António Fernando',
    role: 'Director Geral',
    doctorsCount: 32,
    triageVolume: '198.250',
    aiUsage: 88,
    integrationState: 'Ativo',
    specialties: ['Pediatria', 'Urgência Pediátrica', 'Pneumologia'],
    avgWaitTime: '10 min',
    hours: '24h',
    category: 'Hospital Pediátrico'
  },
  {
    id: 'HOSP-04',
    sigla: 'HPB',
    name: 'Hospital Provincial de Benguela',
    municipality: 'Lobito',
    province: 'Benguela',
    responsible: 'Dr. Manuel Rebelo',
    role: 'Administrador Executivo',
    doctorsCount: 18,
    triageVolume: '92.100',
    aiUsage: 74,
    integrationState: 'Ativo',
    specialties: ['Medicina Geral', 'Maternidade', 'Oftalmologia'],
    avgWaitTime: '30 min',
    hours: '24h',
    category: 'Hospital Provincial'
  },
  {
    id: 'HOSP-05',
    sigla: 'HGD',
    name: 'Hospital Geral do Dande',
    municipality: 'Caxito',
    province: 'Bengo',
    responsible: 'Engª. Maria da Luz',
    role: 'Directora de Operações',
    doctorsCount: 12,
    triageVolume: '84.300',
    aiUsage: 52,
    integrationState: 'Ativo',
    specialties: ['Clínica Geral', 'Urgência', 'Maternidade'],
    avgWaitTime: '45 min',
    hours: '24h',
    category: 'Hospital Geral'
  },
  {
    id: 'HOSP-06',
    sigla: 'HCH',
    name: 'Hospital Central da Huíla',
    municipality: 'Lubango',
    province: 'Huíla',
    responsible: 'Dr. Alberto António',
    role: 'Delegado Provincial',
    doctorsCount: 28,
    triageVolume: '104.200',
    aiUsage: 91,
    integrationState: 'Ativo',
    specialties: ['Medicina Interna', 'Cardiologia', 'Fisioterapia'],
    avgWaitTime: '20 min',
    hours: '24h',
    category: 'Hospital Central'
  },
  {
    id: 'HOSP-07',
    sigla: 'HCM',
    name: 'Hospital Central de Malanje',
    municipality: 'Malanje',
    province: 'Malanje',
    responsible: 'Dra. Isabel Cândida',
    role: 'Directora Clínica',
    doctorsCount: 22,
    triageVolume: '76.500',
    aiUsage: 81,
    integrationState: 'Inativo',
    specialties: ['Pediatria', 'Medicina Interna'],
    avgWaitTime: '35 min',
    hours: '24h',
    category: 'Hospital Central'
  }
];

export function MinsaHospitaisContent({ hospitals = [], evaluations = [], onToggleIntegration }: MinsaHospitaisContentProps) {
  const { t } = useLanguage();

  // Mapeamento dos dados mestres `hospitals` (ids h1..h6) para ExtendedHospital enriquecido.
  // Mantemos INITIAL_EXTENDED_HOSPITALS como base mas substituímos pelo estado real sincronizado.
  const enrichedBase: ExtendedHospital[] = useMemo(() => {
    const meta: Record<string, Partial<ExtendedHospital>> = {};
    INITIAL_EXTENDED_HOSPITALS.forEach((h, idx) => {
      const masterIdx = idx; // não usado; o matching é por nome.
      meta[h.name] = h;
    });
    const result: ExtendedHospital[] = hospitals.map((h, idx) => {
      const base = meta[h.name];
      const triageCount = evaluations.filter(
        (e: any) => e.submittedHospitalId === h.id || e.submittedHospitalName === h.name
      ).length;
      return {
        id: h.id,
        sigla: (h.name.split(' ').slice(0, 3).map(w => w[0]).join('')).toUpperCase().slice(0, 4) || `H${idx + 1}`,
        name: h.name,
        municipality: h.municipality,
        province: (base?.province) || 'Luanda',
        responsible: base?.responsible || 'Director Clínico',
        role: base?.role || 'Director Geral',
        doctorsCount: h.doctorsCount || base?.doctorsCount || 0,
        triageVolume: triageCount.toLocaleString('pt-AO'),
        aiUsage: base?.aiUsage || 75,
        integrationState: h.integrationState,
        specialties: h.specialties || base?.specialties || ['Clínica Geral'],
        avgWaitTime: h.avgWaitTime || base?.avgWaitTime || '20 min',
        hours: h.hours || base?.hours || '24h',
        category: (base?.category) || (h.name.startsWith('Centro') ? 'Centro de Saúde' : 'Hospital Geral') as any,
      };
    });
    // Caso o estado mestre esteja vazio (por exemplo, primeiro arranque), usamos os INITIAL com ids HOSP-0x
    if (result.length === 0) {
      return INITIAL_EXTENDED_HOSPITALS;
    }
    return result;
  }, [hospitals, evaluations]);

  // Primary list state
  const [hospitalsList, setHospitalsList] = useState<ExtendedHospital[]>(enrichedBase);

  // Sincroniza sempre que o estado mestre muda (toggle de integração, etc.)
  useEffect(() => {
    setHospitalsList(enrichedBase);
  }, [enrichedBase]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('Todas');
  const [selectedMunicipality, setSelectedMunicipality] = useState('Todos');
  const [selectedCategory, setSelectedCategory] = useState('Todas as Categorias');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativas' | 'Inativas'>('Todos');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState<ExtendedHospital | null>(null);
  const [showDossierModal, setShowDossierModal] = useState<ExtendedHospital | null>(null);

  // Form states for Register/Edit
  const [formName, setFormName] = useState('');
  const [formSigla, setFormSigla] = useState('');
  const [formProvince, setFormProvince] = useState('Luanda');
  const [formMunicipality, setFormMunicipality] = useState('');
  const [formResponsible, setFormResponsible] = useState('');
  const [formRole, setFormRole] = useState('Director Geral');
  const [formDoctorsCount, setFormDoctorsCount] = useState(10);
  const [formTriageVolume, setFormTriageVolume] = useState('15.000');
  const [formAiUsage, setFormAiUsage] = useState(80);
  const [formCategory, setFormCategory] = useState<'Hospital Geral' | 'Hospital Central' | 'Hospital Provincial' | 'Hospital Pediátrico' | 'Centro de Saúde'>('Hospital Geral');
  const [formIntegrationState, setFormIntegrationState] = useState<'Ativo' | 'Pendente' | 'Inativo'>('Ativo');
  const [formSpecialties, setFormSpecialties] = useState('Clínica Geral, Urgências');

  // Open modal for registration
  const handleOpenRegister = () => {
    setEditingHospital(null);
    setFormName('');
    setFormSigla('');
    setFormProvince('Luanda');
    setFormMunicipality('');
    setFormResponsible('');
    setFormRole('Director Geral');
    setFormDoctorsCount(15);
    setFormTriageVolume('12.500');
    setFormAiUsage(85);
    setFormCategory('Hospital Geral');
    setFormIntegrationState('Ativo');
    setFormSpecialties('Clínica Geral, Urgências');
    setShowRegisterModal(true);
  };

  // Open modal for editing
  const handleOpenEdit = (h: ExtendedHospital) => {
    setEditingHospital(h);
    setFormName(h.name);
    setFormSigla(h.sigla);
    setFormProvince(h.province);
    setFormMunicipality(h.municipality);
    setFormResponsible(h.responsible);
    setFormRole(h.role);
    setFormDoctorsCount(h.doctorsCount);
    setFormTriageVolume(h.triageVolume);
    setFormAiUsage(h.aiUsage);
    setFormCategory(h.category);
    setFormIntegrationState(h.integrationState);
    setFormSpecialties(h.specialties.join(', '));
    setShowRegisterModal(true);
  };

  // Toggle hospital status (Active/Inactive)
  const handleToggleStatus = (id: string) => {
    setHospitalsList(prev => prev.map(h => {
      if (h.id === id) {
        const nextState = h.integrationState === 'Ativo' ? 'Inativo' : 'Ativo';
        if (onToggleIntegration) {
          onToggleIntegration(h.id);
        }
        return {
          ...h,
          integrationState: nextState
        };
      }
      return h;
    }));
  };

  // Delete hospital
  const handleDeleteHospital = (id: string) => {
    if (confirm("Tem certeza que deseja remover esta instituição da plataforma Dr.IA?")) {
      setHospitalsList(prev => prev.filter(h => h.id !== id));
    }
  };

  // Handle Save
  const handleSaveHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSigla || !formMunicipality || !formResponsible) {
      alert("Por favor preencha todos os campos obrigatórios!");
      return;
    }

    const listSpecialties = formSpecialties.split(',').map(s => s.trim()).filter(Boolean);

    if (editingHospital) {
      // Editing
      setHospitalsList(prev => prev.map(h => {
        if (h.id === editingHospital.id) {
          return {
            ...h,
            name: formName,
            sigla: formSigla,
            province: formProvince,
            municipality: formMunicipality,
            responsible: formResponsible,
            role: formRole,
            doctorsCount: Number(formDoctorsCount),
            triageVolume: formTriageVolume,
            aiUsage: Number(formAiUsage),
            category: formCategory,
            integrationState: formIntegrationState,
            specialties: listSpecialties
          };
        }
        return h;
      }));
    } else {
      // New Hospital
      const newH: ExtendedHospital = {
        id: `HOSP-${Math.floor(10 + Math.random() * 90)}`,
        sigla: formSigla.toUpperCase(),
        name: formName,
        municipality: formMunicipality,
        province: formProvince,
        responsible: formResponsible,
        role: formRole,
        doctorsCount: Number(formDoctorsCount),
        triageVolume: formTriageVolume,
        aiUsage: Number(formAiUsage),
        integrationState: formIntegrationState,
        specialties: listSpecialties,
        avgWaitTime: '20 min',
        hours: '24h',
        category: formCategory
      };
      setHospitalsList(prev => [newH, ...prev]);
    }

    setShowRegisterModal(false);
    setEditingHospital(null);
  };

  // Test panel simulator trigger
  const handleTestPanelTrigger = () => {
    // Add random triages to a random active hospital
    const activeHospitals = hospitalsList.filter(h => h.integrationState === 'Ativo');
    if (activeHospitals.length === 0) {
      alert("Ative pelo menos uma instituição de saúde para rodar testes!");
      return;
    }
    const randomHospital = activeHospitals[Math.floor(Math.random() * activeHospitals.length)];
    
    setHospitalsList(prev => prev.map(h => {
      if (h.id === randomHospital.id) {
        // Parse current volume
        const currentNum = parseInt(h.triageVolume.replace(/\./g, ''), 10) || 12000;
        const nextNum = currentNum + Math.floor(Math.random() * 500) + 120;
        const formatted = nextNum.toLocaleString('pt-AO');
        return {
          ...h,
          triageVolume: formatted,
          aiUsage: Math.min(100, Math.max(40, h.aiUsage + (Math.random() > 0.5 ? 1 : -1)))
        };
      }
      return h;
    }));

    alert(`Simulação de Interoperabilidade Executada:\nNovas triagens Dr.IA foram sincronizadas no barramento do "${randomHospital.name}" com sucesso!`);
  };

  // Filter logic
  const filteredHospitals = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return hospitalsList.filter(h => {
      // Search — null-safety em todos os campos
      const name = (h.name || '').toLowerCase();
      const sigla = (h.sigla || '').toLowerCase();
      const resp = (h.responsible || '').toLowerCase();
      const matchesSearch = name.includes(q) || sigla.includes(q) || resp.includes(q);
      
      // Province
      const matchesProvince = selectedProvince === 'Todas' || h.province === selectedProvince;

      // Municipality
      const matchesMunicipality = selectedMunicipality === 'Todos' || h.municipality === selectedMunicipality;

      // Category
      const matchesCategory = selectedCategory === 'Todas as Categorias' || h.category === selectedCategory;

      // Status
      const matchesStatus = statusFilter === 'Todos' || 
                            (statusFilter === 'Ativas' && h.integrationState === 'Ativo') ||
                            (statusFilter === 'Inativas' && h.integrationState === 'Inativo');

      return matchesSearch && matchesProvince && matchesMunicipality && matchesCategory && matchesStatus;
    });
  }, [hospitalsList, searchQuery, selectedProvince, selectedMunicipality, selectedCategory, statusFilter]);

  // Paginated item slice
  const paginatedHospitals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHospitals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHospitals, currentPage]);

  const totalPages = Math.ceil(filteredHospitals.length / itemsPerPage) || 1;

  // Summary indicators — derivados dos dados reais sincronizados
  const totalIntegrated = hospitalsList.length;
  const activeCount = hospitalsList.filter(h => h.integrationState === 'Ativo').length;
  const totalTriages = evaluations.length;
  const averageAiUsage = Math.round(hospitalsList.reduce((acc, curr) => acc + curr.aiUsage, 0) / hospitalsList.length) || 75;
  // SLA real: percentagem de triagens que foram dadas alta ou atendidas
  const dischargedCount = evaluations.filter((e: any) => e.doctorStatus === 'Alta').length;
  const attendedCount = evaluations.filter((e: any) => e.doctorStatus === 'Em Atendimento').length;
  const slaPct = totalTriages > 0 ? Math.round(((dischargedCount + attendedCount) / totalTriages) * 100) : 98;

  return (
    <div className="w-full space-y-6 text-left font-sans">

      {/* 1. INSTITUTIONAL TITLE BAR (Matches top section of the image) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest block">GESTÃO INSTITUCIONAL</span>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Administrador de Sistemas Geral
          </h2>
          <p className="text-[10px] md:text-xs text-indigo-600 font-extrabold uppercase tracking-wide mt-1">
            CADASTRO ADMINISTRATIVO NACIONAL - PROVÍNCIAS E HOSPITAIS INTEGRADOS
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleTestPanelTrigger}
            className="flex-1 md:flex-initial px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            <Activity className="w-4.5 h-4.5" />
            Abrir Painel de Testes
          </button>
          
          <button
            onClick={handleOpenRegister}
            className="flex-1 md:flex-initial px-5 py-3 bg-[#0b1b3d] hover:bg-[#132c5e] text-white font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 transition-all shadow-md shadow-slate-900/10 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            Registar Instituição
          </button>
        </div>
      </div>

      {/* 2. FOUR KPI CARDS ROW (Matches visual cards in image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        
        {/* KPI 1: Instituições Integradas */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-3xs hover:shadow-2xs transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-black uppercase block tracking-wider">Instituições Integradas</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-800">{totalIntegrated}</span>
              <span className="text-[10px] text-blue-600 font-extrabold">({activeCount} Ativas)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Unidades operacionais</span>
          </div>
        </div>

        {/* KPI 2: Volume de Triagem (dados reais sincronizados) */}
        <div className="bg-white border border-ink-200/80 rounded-[24px] p-5 shadow-3xs hover:shadow-2xs transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-success-50 border border-success-100 flex items-center justify-center text-success-600 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] text-ink-400 font-black uppercase block tracking-wider">Triagens Registadas</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-ink-900">{totalTriages.toLocaleString('pt-PT')}</span>
              <span className="text-[10px] text-success-600 font-extrabold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> em tempo real
              </span>
            </div>
            <span className="text-[10px] text-ink-500 font-bold block mt-0.5">No sistema unificado</span>
          </div>
        </div>

        {/* KPI 3: Utilização de IA */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-3xs hover:shadow-2xs transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-black uppercase block tracking-wider">Utilização de IA</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-slate-800">{averageAiUsage}%</span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-black text-[8px] uppercase rounded-full tracking-wider">
                Inteligente
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Automação assistida</span>
          </div>
        </div>

        {/* KPI 4: Desempenho Geral (dados reais) */}
        <div className="bg-white border border-ink-200/80 rounded-[24px] p-5 shadow-3xs hover:shadow-2xs transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-warning-50 border border-warning-100 flex items-center justify-center text-warning-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] text-ink-400 font-black uppercase block tracking-wider">Resolução Clínica</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-ink-900">{slaPct}%</span>
              <span className="text-[10px] text-warning-600 font-extrabold font-mono">SLA</span>
            </div>
            <span className="text-[10px] text-ink-500 font-bold block mt-0.5">Atendidas + Altas</span>
          </div>
        </div>

      </div>

      {/* 3. GENERAL FILTERS PANEL (Matches section "PAINEL GERAL DE FILTROS E BUSCA") */}
      <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-3xs space-y-4">
        <div className="flex items-center gap-2 text-slate-700">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-800">Painel Geral de Filtros e Busca</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filter 1: Locate Institution */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-black uppercase block">Localizar Instituição (Sigla/Nome)</label>
            <div className="relative flex items-center bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Pesquisar hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Filter 2: Province */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-black uppercase block">Província</label>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="Todas">Todas</option>
              <option value="Luanda">Luanda</option>
              <option value="Benguela">Benguela</option>
              <option value="Huíla">Huíla</option>
              <option value="Bengo">Bengo</option>
              <option value="Malanje">Malanje</option>
            </select>
          </div>

          {/* Filter 3: Municipality */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-black uppercase block">Município</label>
            <select
              value={selectedMunicipality}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="Todos">Todos</option>
              <option value="Talatona">Talatona</option>
              <option value="Ingombota">Ingombota</option>
              <option value="Maianga">Maianga</option>
              <option value="Viana">Viana</option>
              <option value="Lobito">Lobito</option>
              <option value="Lubango">Lubango</option>
              <option value="Cazenga">Cazenga</option>
              <option value="Caxito">Caxito</option>
            </select>
          </div>

          {/* Filter 4: Category */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 font-black uppercase block">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="Todas as Categorias">Todas as Categorias</option>
              <option value="Hospital Geral">Hospital Geral</option>
              <option value="Hospital Central">Hospital Central</option>
              <option value="Hospital Provincial">Hospital Provincial</option>
              <option value="Hospital Pediátrico">Hospital Pediátrico</option>
              <option value="Centro de Saúde">Centro de Saúde</option>
            </select>
          </div>
        </div>

        {/* State Filter Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
          <span className="text-[9px] text-slate-400 font-black uppercase">Estado</span>
          <div className="flex gap-2">
            {(['Todos', 'Ativas', 'Inativas'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStatusFilter(mode)}
                className={`px-4 py-2 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  statusFilter === mode
                    ? 'bg-[#0b1b3d] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {mode === 'Ativas' ? 'Ativas' : mode === 'Inativas' ? 'Inativas' : 'Todos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. INSTITUTIONS LIST TABLE (Matches the dark-header, highly-detailed list table) */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] overflow-hidden shadow-3xs">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            {/* Dark Navy Table Header */}
            <thead>
              <tr className="bg-[#0b1b3d] text-white text-[10px] font-black uppercase tracking-wider">
                <th className="py-4 px-5">Instituição</th>
                <th className="py-4 px-5">Localização</th>
                <th className="py-4 px-5">Responsável</th>
                <th className="py-4 px-5 text-center">Trabalhadores</th>
                <th className="py-4 px-5 text-right">Correspondência</th>
                <th className="py-4 px-5">Utilização da IA</th>
                <th className="py-4 px-5 text-center">Estado</th>
                <th className="py-4 px-5 text-center">Ações</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              <AnimatePresence mode="popLayout">
                {paginatedHospitals.map((h) => (
                  <motion.tr
                    key={h.id}
                    layoutId={`row-${h.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Institution Column */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-xs text-indigo-700 shrink-0 shadow-3xs uppercase">
                          {h.sigla}
                        </div>
                        <div>
                          <h4 className="font-black text-indigo-900 leading-tight block uppercase">
                            {h.sigla} • {h.name.replace('Hospital ', '')}
                          </h4>
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-0.5 block">
                            {h.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Location Column */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <div>
                          <span className="block text-xs font-bold">{h.province}</span>
                          <span className="block text-[9px] text-slate-400 font-semibold">{h.municipality}</span>
                        </div>
                      </div>
                    </td>

                    {/* Responsible Column */}
                    <td className="py-4 px-5">
                      <div>
                        <span className="block font-black text-slate-800">{h.responsible}</span>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase">{h.role}</span>
                      </div>
                    </td>

                    {/* Workers/Doctors count */}
                    <td className="py-4 px-5 text-center font-mono font-black text-slate-800">
                      {h.doctorsCount}
                    </td>

                    {/* Correspondence / Triage count */}
                    <td className="py-4 px-5 text-right font-mono font-black text-slate-800">
                      {h.triageVolume}
                    </td>

                    {/* AI Usage stats */}
                    <td className="py-4 px-5">
                      <div className="w-24 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[10px] font-black text-indigo-600">{h.aiUsage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full" 
                            style={{ width: `${h.aiUsage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                        h.integrationState === 'Ativo'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${h.integrationState === 'Ativo' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {h.integrationState === 'Ativo' ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(h)}
                          title="Editar Instituição"
                          className="px-3 py-1.5 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-600 hover:text-indigo-700 font-extrabold text-[9px] uppercase tracking-wider rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          Editar
                        </button>

                        {/* Dossier Button */}
                        <button
                          onClick={() => setShowDossierModal(h)}
                          title="Abrir Dossiê Integrado"
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 font-extrabold text-[9px] uppercase tracking-wider rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <FolderOpen className="w-3 h-3" />
                          Dossiê
                        </button>

                        {/* Status Toggle / Power Button */}
                        <button
                          onClick={() => handleToggleStatus(h.id)}
                          title={h.integrationState === 'Ativo' ? "Desativar Integração" : "Ativar Integração"}
                          className={`p-1.5 border rounded-lg transition-all cursor-pointer ${
                            h.integrationState === 'Ativo'
                              ? 'border-red-100 hover:bg-red-50 text-red-500 hover:text-red-600'
                              : 'border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteHospital(h.id)}
                          title="Eliminar Instituição"
                          className="p-1.5 border border-slate-200 hover:border-red-200 hover:bg-red-50/50 text-slate-400 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </motion.tr>
                ))}

                {filteredHospitals.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-black uppercase">Nenhuma instituição encontrada com estes filtros.</p>
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedProvince('Todas');
                          setSelectedMunicipality('Todos');
                          setSelectedCategory('Todas as Categorias');
                          setStatusFilter('Todos');
                        }}
                        className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all"
                      >
                        Limpar Todos os Filtros
                      </button>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>

          </table>
        </div>

        {/* 5. TABLE FOOTER PAGINATION ROW (Matches bottom part of image) */}
        <div className="bg-slate-50/80 border-t border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-[11px] font-bold text-slate-500">
            Páginas <b className="text-slate-800 font-black">{currentPage} de {totalPages}</b> ({filteredHospitals.length} resultados)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-1 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none border border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-wider rounded-xl flex items-center gap-1 transition-all cursor-pointer"
            >
              Seguinte
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* 6. REGISTER / EDIT MODAL INTERACTION */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] border border-slate-200/80 shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="bg-[#0b1b3d] text-white p-5 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xs tracking-wider">
                      {editingHospital ? 'Editar Instituição de Saúde' : 'Registar Nova Instituição de Saúde'}
                    </h3>
                    <p className="text-[9px] text-indigo-200 font-semibold">MINSA • Sistema Integrado Dr.IA</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRegisterModal(false)}
                  className="w-7 h-7 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveHospital} className="p-6 space-y-4 text-xs font-semibold text-slate-700 max-h-[500px] overflow-y-auto">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Sigla do Hospital *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: HJM, HGL, HPS"
                      value={formSigla}
                      onChange={(e) => setFormSigla(e.target.value)}
                      className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Categoria *</label>
                    <select
                      value={formCategory}
                      onChange={(e: any) => setFormCategory(e.target.value)}
                      className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800 bg-white"
                    >
                      <option value="Hospital Geral">Hospital Geral</option>
                      <option value="Hospital Central">Hospital Central</option>
                      <option value="Hospital Provincial">Hospital Provincial</option>
                      <option value="Hospital Pediátrico">Hospital Pediátrico</option>
                      <option value="Centro de Saúde">Centro de Saúde</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-slate-400 font-black uppercase">Nome Oficial da Instituição *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Hospital Geral de Luanda"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Província *</label>
                    <select
                      value={formProvince}
                      onChange={(e) => setFormProvince(e.target.value)}
                      className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800 bg-white"
                    >
                      <option value="Luanda">Luanda</option>
                      <option value="Benguela">Benguela</option>
                      <option value="Huíla">Huíla</option>
                      <option value="Bengo">Bengo</option>
                      <option value="Malanje">Malanje</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Município *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Talatona, Maianga"
                      value={formMunicipality}
                      onChange={(e) => setFormMunicipality(e.target.value)}
                      className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Director/Responsável *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dr. João Sebastião"
                      value={formResponsible}
                      onChange={(e) => setFormResponsible(e.target.value)}
                      className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Cargo do Responsável *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Director Geral"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Médicos Activos</label>
                    <input
                      type="number"
                      placeholder="15"
                      value={formDoctorsCount}
                      onChange={(e) => setFormDoctorsCount(Number(e.target.value))}
                      className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Volume Triagem</label>
                    <input
                      type="text"
                      placeholder="50.000"
                      value={formTriageVolume}
                      onChange={(e) => setFormTriageVolume(e.target.value)}
                      className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-slate-400 font-black uppercase">Uso de IA (%)</label>
                    <input
                      type="number"
                      max={100}
                      min={0}
                      value={formAiUsage}
                      onChange={(e) => setFormAiUsage(Number(e.target.value))}
                      className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-slate-400 font-black uppercase">Especialidades Integradas (Separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="Pediatria, Medicina Geral, Cardiologia"
                    value={formSpecialties}
                    onChange={(e) => setFormSpecialties(e.target.value)}
                    className="w-full border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] text-slate-400 font-black uppercase">Estado Inicial de Integração</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="stateRadio"
                        checked={formIntegrationState === 'Ativo'}
                        onChange={() => setFormIntegrationState('Ativo')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Ativa (Canal operacional de triagem)
                    </label>
                    <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="stateRadio"
                        checked={formIntegrationState === 'Inativo'}
                        onChange={() => setFormIntegrationState('Inativo')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      Inativa (Canal desativado)
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#0b1b3d] text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#132c5e] transition-colors cursor-pointer shadow-md shadow-indigo-900/10"
                  >
                    Gravar Alterações
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. INTEGRATED DOSSIER INFO MODAL */}
      <AnimatePresence>
        {showDossierModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] border border-slate-200/80 shadow-2xl max-w-xl w-full overflow-hidden"
            >
              <div className="bg-[#0b1b3d] text-white p-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-xs text-white uppercase shrink-0">
                    {showDossierModal.sigla}
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xs tracking-wider">
                      {showDossierModal.name}
                    </h3>
                    <p className="text-[9px] text-indigo-200 font-semibold uppercase">
                      ID: {showDossierModal.id} • Dossiê Tecnológico & Clínico Integrado
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDossierModal(null)}
                  className="w-7 h-7 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 text-xs font-semibold text-slate-700 max-h-[500px] overflow-y-auto text-left">
                
                {/* Status bar */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-2xl">
                  <div>
                    <span className="text-[9px] text-slate-400 font-black uppercase">Estado do Canal Dr.IA</span>
                    <span className="block font-black text-slate-800 uppercase text-xs mt-0.5">
                      {showDossierModal.integrationState === 'Ativo' ? 'Canal Operacional Integrado' : 'Canal Temporariamente Inativo'}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                    showDossierModal.integrationState === 'Ativo'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {showDossierModal.integrationState === 'Ativo' ? 'ATIVO' : 'DESATIVADO'}
                  </span>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 border border-slate-150 rounded-xl bg-slate-50/20">
                    <span className="block text-[8px] text-slate-400 font-black uppercase">Médicos Activos</span>
                    <span className="block font-black text-slate-800 text-base mt-0.5">{showDossierModal.doctorsCount}</span>
                  </div>
                  <div className="p-3 border border-slate-150 rounded-xl bg-slate-50/20">
                    <span className="block text-[8px] text-slate-400 font-black uppercase">Média Espera</span>
                    <span className="block font-black text-slate-800 text-base mt-0.5">{showDossierModal.avgWaitTime}</span>
                  </div>
                  <div className="p-3 border border-slate-150 rounded-xl bg-slate-50/20">
                    <span className="block text-[8px] text-slate-400 font-black uppercase">Tempo de Serviço</span>
                    <span className="block font-black text-slate-800 text-base mt-0.5">{showDossierModal.hours}</span>
                  </div>
                </div>

                {/* Specialties list */}
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-400 font-black uppercase block">Especialidades Integradas no Barramento</span>
                  <div className="flex flex-wrap gap-1.5">
                    {showDossierModal.specialties.map((spec, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-50/45 text-indigo-700 rounded-xl text-[10px] font-black border border-indigo-100/30">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Infrastructure telemetry data */}
                <div className="border border-slate-150 rounded-2xl p-4 space-y-3.5 bg-slate-50/30">
                  <span className="text-[10px] text-slate-800 font-black uppercase flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-indigo-600" />
                    Parâmetros de Interoperabilidade
                  </span>

                  <div className="space-y-2.5 font-mono text-[10px] text-slate-600">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span>Provedor Cloud</span>
                      <span className="font-bold text-slate-800">MINSA-NODE-AO-WEST1</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span>Protocolo de Encriptação</span>
                      <span className="font-bold text-slate-800">AES-256-GCM / Dr.IA-Shield</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span>Consonância da IA</span>
                      <span className="font-bold text-slate-800">Modelo Llama 3.1 Pt-AO</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frequência de Sincronização</span>
                      <span className="font-bold text-slate-800">Tempo Real (SSE)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowDossierModal(null)}
                    className="w-full py-3 bg-slate-150 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                  >
                    Fechar Dossiê
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
