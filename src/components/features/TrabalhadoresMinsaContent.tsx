/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Mail, Phone, User, Edit, Trash, X, Check, Shield, Power, UserCheck, Briefcase, Building, Lock, CheckCircle2, AlertCircle, ChevronDown, IdCard } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  active: boolean;
  lastAccess: string;
}

const INITIAL_WORKERS: Worker[] = [
  {
    id: 'MINSA-0012',
    name: 'MANUEL NETO',
    email: 'm.neto@minsa.gov.ao',
    phone: '+244 923 301 200',
    role: 'Diretor de Tecnologias de Informação',
    department: 'GABINETE DE TI E COMUNICAÇÃO (GTIC)',
    active: true,
    lastAccess: 'Hoje, 10:22',
  },
  {
    id: 'MINSA-0045',
    name: 'KAMBANZA NETO',
    email: 'k.neto@minsa.gov.ao',
    phone: '+244 924 113 850',
    role: 'Técnico de Infraestrutura Cloud',
    department: 'DEPARTAMENTO DE SISTEMAS UNIFICADOS',
    active: true,
    lastAccess: 'Hoje, 08:30',
  },
  {
    id: 'MINSA-0022',
    name: 'DRA. MARTA VIANA',
    email: 'm.viana@minsa.gov.ao',
    phone: '+244 912 770 022',
    role: 'Diretora Nacional de Saúde Pública',
    department: 'DIRECÇÃO NACIONAL DE SAÚDE',
    active: true,
    lastAccess: 'Ontem, 15:44',
  },
  {
    id: 'MINSA-0099',
    name: 'VALERIANO LIMA',
    email: 'v.lima@minsa.gov.ao',
    phone: '+244 931 555 099',
    role: 'Técnico de Estatística Médica',
    department: 'SISTEMAS DE INFORMAÇÃO SANITÁRIA',
    active: true,
    lastAccess: 'Ontem, 09:12',
  },
];

export function TrabalhadoresMinsaContent() {
  const { t } = useLanguage();
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem('dria_minsa_workers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_WORKERS;
  });

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    active: true,
  });

  useEffect(() => {
    localStorage.setItem('dria_minsa_workers', JSON.stringify(workers));
  }, [workers]);

  const handleOpenAddModal = () => {
    const nextIdNum = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      id: `MINSA-${nextIdNum}`,
      name: '',
      email: '',
      phone: '+244 ',
      role: '',
      department: '',
      active: true,
    });
    setEditingWorker(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (worker: Worker) => {
    setEditingWorker(worker);
    setFormData({
      id: worker.id,
      name: worker.name,
      email: worker.email,
      phone: worker.phone,
      role: worker.role,
      department: worker.department,
      active: worker.active,
    });
    setShowModal(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (editingWorker) {
      // Edit
      setWorkers(prev =>
        prev.map(w =>
          w.id === editingWorker.id
            ? { ...w, ...formData, name: formData.name.toUpperCase() }
            : w
        )
      );
    } else {
      // Add
      const newWorker: Worker = {
        ...formData,
        name: formData.name.toUpperCase(),
        lastAccess: 'Nunca',
      };
      setWorkers(prev => [...prev, newWorker]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza de que deseja remover este trabalhador?')) {
      setWorkers(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setWorkers(prev =>
      prev.map(w => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.role.toLowerCase().includes(search.toLowerCase()) ||
    w.email.toLowerCase().includes(search.toLowerCase()) ||
    w.department.toLowerCase().includes(search.toLowerCase()) ||
    w.id.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Top Breadcrumb exactly like image 2 */}
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#0c2340]">
        <span className="opacity-60">Operadores do Sistema</span>
        <span>•</span>
        <span>Administração Geral</span>
      </div>

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#0c2340] tracking-tight uppercase italic leading-none">
            Gestão de Trabalhadores
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-2xl mt-2 leading-relaxed">
            Controle de administradores, moderadores e técnicos autorizados da plataforma central. Administre permissões, acessos e registe novos trabalhadores da plataforma.
          </p>
        </div>

        {/* Adicionar Trabalhador Button exactly like image 2 */}
        <button
          onClick={handleOpenAddModal}
          className="bg-[#0c2340] hover:bg-slate-800 text-white rounded-2xl px-5 py-3 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 cursor-pointer shadow-md shadow-indigo-900/10 active:scale-[0.98] transition-all shrink-0 self-start md:self-center border-none"
        >
          <Plus size={16} strokeWidth={2.5} />
          Adicionar Trabalhador
        </button>
      </div>

      {/* Metrics Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-3xs flex flex-col justify-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total de Trabalhadores</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900">{workers.length}</span>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Inscritos</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-3xs flex flex-col justify-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Plataforma Geral</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-900 italic uppercase">CDA</span>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Administração de Sistemas</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-xs">
        {/* Table Header area */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-[#0c2340] uppercase tracking-tight italic">
              Quadro de Trabalhadores
            </h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-0.5">
              Base de dados de técnicos e administradores com acesso operacional ao sistema
            </p>
          </div>

          {/* Search bar inside the table card */}
          <div className="flex items-center gap-2 border border-slate-200 focus-within:border-[#0c2340] rounded-xl px-3 py-2 bg-slate-50/50 w-full md:max-w-md">
            <Search size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Pesquisar por Nome, Cargo, Email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="bg-[#0c2340] text-white text-[10px] font-black uppercase tracking-widest">
                <th className="py-4.5 px-6 rounded-tl-[16px]">Colaborador / Trabalhador</th>
                <th className="py-4.5 px-6">E-mail / Contacto</th>
                <th className="py-4.5 px-6">Telefone</th>
                <th className="py-4.5 px-6">Função e Setor</th>
                <th className="py-4.5 px-6 text-center">Estado / Acesso Rápido</th>
                <th className="py-4.5 px-6">Último Acesso</th>
                <th className="py-4.5 px-6 text-right rounded-tr-[16px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold text-xs">
                    Nenhum colaborador encontrado.
                  </td>
                </tr>
              ) : (
                filteredWorkers.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50/40 transition-colors">
                    {/* User info */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0c2340]/10 text-[#0c2340] font-black text-xs flex items-center justify-center shrink-0">
                          {getInitials(w.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-[11.5px] text-slate-800 truncate uppercase leading-none">{w.name}</p>
                          <p className="text-[9.5px] text-slate-400 font-mono mt-1 leading-none uppercase">ID: {w.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                        <Mail size={13} className="text-slate-400" />
                        <span className="lowercase">{w.email}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                        <Phone size={13} className="text-slate-400" />
                        <span>{w.phone}</span>
                      </div>
                    </td>

                    {/* Function and department */}
                    <td className="py-4.5 px-6">
                      <div>
                        <p className="font-black text-[11px] text-slate-800 leading-none">{w.role}</p>
                        <p className="text-[9px] text-slate-450 font-black tracking-wider uppercase mt-1 leading-none">{w.department}</p>
                      </div>
                    </td>

                    {/* Switch Toggle */}
                    <td className="py-4.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleActive(w.id)}
                          className="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-transparent p-0 border-none"
                        >
                          <div
                            className={`pointer-events-none relative inline-block h-5 w-10 rounded-full transition-colors duration-200 ease-in-out ${
                              w.active ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none absolute top-0.5 left-0.5 inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                w.active ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </button>
                        <span className={`text-[9.5px] font-black uppercase tracking-wide ${w.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {w.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>

                    {/* Last access */}
                    <td className="py-4.5 px-6 text-slate-500 text-[11px] font-bold">
                      {w.lastAccess}
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-3.5">
                        <button
                          onClick={() => handleOpenEditModal(w)}
                          className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer border-none bg-transparent font-black uppercase text-[10px] tracking-wider flex items-center gap-1"
                        >
                          <Edit size={12} />
                          EDITAR
                        </button>
                        <button
                          onClick={() => handleDelete(w.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer border-none bg-transparent"
                          title="Remover Trabalhador"
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit Worker */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[40px] border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden text-left z-10 font-sans flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-white px-8 pt-8 pb-6 flex justify-between items-center relative border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#f0f4ff] rounded-full flex items-center justify-center text-[#3b82f6] border border-[#dbe4ff] shadow-sm">
                    <UserCheck size={26} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight uppercase text-[#0c2340] italic leading-tight">
                      {editingWorker ? 'EDITAR AGENTE DO MINISTÉRIO' : 'REGISTAR NOVO TRABALHADOR DO MINISTÉRIO'}
                    </h3>
                    <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest mt-1 leading-none">
                      CREDENCIAL OPERACIONAL DO MINISTÉRIO (MINSA)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all cursor-pointer border-0 text-slate-400 hover:text-slate-600 bg-transparent flex items-center justify-center"
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                
                {/* SECTION 1: DADOS PESSOAIS */}
                <div>
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-wider mb-4">
                    <User className="w-4 h-4 text-indigo-500" />
                    <span>DADOS PESSOAIS DO AGENTE MINSA</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Name */}
                    <div className="grid gap-2">
                      <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase">NOME DO AGENTE PÚBLICO *</span>
                      <div className="flex items-center gap-2.5 border border-slate-200 focus-within:border-blue-500 rounded-full px-4 py-3 bg-white h-12 shadow-2xs transition-all">
                        <User size={16} className="text-slate-400 shrink-0" />
                        <input
                          type="text"
                          required
                          placeholder="Ex: Dr. Francisco Manuel"
                          value={formData.name}
                          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 placeholder-slate-400"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                      <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase">EMAIL CORPORATIVO MINSA *</span>
                      <div className="flex items-center gap-2.5 border border-slate-200 focus-within:border-blue-500 rounded-full px-4 py-3 bg-white h-12 shadow-2xs transition-all">
                        <Mail size={16} className="text-slate-400 shrink-0" />
                        <input
                          type="email"
                          required
                          placeholder="Ex: f.manuel@minsa.gov.ao"
                          value={formData.email}
                          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 placeholder-slate-400 lowercase"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="grid gap-2">
                      <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase">TELEFONE CORPORATIVO *</span>
                      <div className="flex items-center gap-2.5 border border-slate-200 focus-within:border-blue-500 rounded-full px-4 py-3 bg-white h-12 shadow-2xs transition-all">
                        <Phone size={16} className="text-slate-400 shrink-0" />
                        <input
                          type="text"
                          required
                          placeholder="+244 923 000 000"
                          value={formData.phone}
                          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 placeholder-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200" />

                {/* SECTION 2: AFILIAÇÃO & FUNÇÕES DO TRABALHADOR */}
                <div>
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-wider mb-4">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    <span>CATEGORIA & DIRECÇÃO NO MINISTÉRIO</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Role */}
                    <div className="grid gap-2">
                      <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase">CATEGORIA FUNCIONAL *</span>
                      <div className="flex items-center gap-2.5 border border-slate-200 focus-within:border-blue-500 rounded-full px-4 py-3 bg-white h-12 shadow-2xs transition-all">
                        <IdCard size={16} className="text-slate-400 shrink-0" />
                        <input
                          type="text"
                          required
                          placeholder="Ex: Diretor de Tecnologias, Técnico Superior"
                          value={formData.role}
                          onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                          className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 placeholder-slate-400"
                        />
                      </div>
                    </div>

                    {/* Department */}
                    <div className="grid gap-2">
                      <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase">DIRECÇÃO / GABINETE MINSA *</span>
                      <div className="flex items-center gap-2.5 border border-slate-200 focus-within:border-blue-500 rounded-full px-4 py-3 bg-white h-12 shadow-2xs transition-all">
                        <Building size={16} className="text-slate-400 shrink-0" />
                        <input
                          type="text"
                          required
                          placeholder="Ex: Gabinete de TI e Comunicação (GTIC)"
                          value={formData.department}
                          onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 placeholder-slate-400"
                        />
                      </div>
                    </div>

                    {/* ID (Read Only / Pre-filled) */}
                    <div className="grid gap-2">
                      <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase">ID ÚNICO DE AGENTE MINSA (GERADO)</span>
                      <div className="flex items-center gap-2.5 border border-slate-200 bg-slate-50 rounded-full px-4 py-3 h-12 shadow-2xs transition-all">
                        <Lock size={16} className="text-slate-400 shrink-0" />
                        <input
                          type="text"
                          disabled
                          placeholder="MINSA-XXXX"
                          value={formData.id}
                          className="w-full bg-transparent outline-none text-xs font-bold text-slate-400 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200" />

                {/* SECTION 3: ESTÁGIO DE AUTORIZAÇÃO */}
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-wider mb-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>ESTÁGIO DE AUTORIZAÇÃO</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    {/* Active Select Dropdown */}
                    <div className="grid gap-2 md:col-span-5">
                      <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase">ESTADO DE ACESSO *</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                        className="w-full bg-white border border-slate-200 hover:border-blue-500 rounded-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-800 h-12 cursor-pointer shadow-2xs transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          {formData.active ? (
                            <>
                              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                              <span className="text-slate-800">Ativo (Permitido)</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle size={16} className="text-amber-500 shrink-0" />
                              <span className="text-slate-500">Inativo (Bloqueado)</span>
                            </>
                          )}
                        </div>
                        <ChevronDown size={14} className="text-slate-400" />
                      </button>
                    </div>

                    {/* Alert Box */}
                    <div className="md:col-span-7">
                      <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-3xl p-4 flex gap-3 text-[11px] text-emerald-800 leading-relaxed font-semibold">
                        <AlertCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                        <span>
                          Utilizadores com estado 'Desativado' ou 'Suspenso' verão o seu acesso dactiloscópico e barramento postal revogado preventivamente.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200" />

                {/* Footer Buttons */}
                <div className="pt-2 flex justify-between items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
                  >
                    <X size={15} />
                    <span>CANCELAR</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#0c2340] hover:bg-slate-800 rounded-full text-white font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Check size={15} className="stroke-[2.5]" />
                    <span>SUBMETER CADASTRO</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
