/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dr.IA — Premium Sidebar Navigation (Medical Design System v2)
 */

import {
  Home, Mail, QrCode, Users, User, LogOut, Landmark, BarChart3, Shield,
  Settings, FileText, Bot, Activity, Brain, Stethoscope, Building2, HeartPulse,
  ChevronRight, X
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Message, Document, AppMode, LanguageCode } from '../../types';
import { useSession } from '../../services/sessionStore';
import { useLanguage } from '../../hooks/useLanguage';
import { LazyImage } from '../ui/LazyImage';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

interface SidebarProps {
  tab: string;
  setTab: (id: string) => void;
  setSelectedMessage: (msg: Message | null) => void;
  setSelectedDoc: (doc: Document | null) => void;
  handleLogout: (clearAll?: boolean) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  setStage?: (stage: string) => void;
  currentLanguage?: LanguageCode;
  theme?: 'light' | 'dark';
  onCloseMobile?: () => void;
}

const userItems: MenuItem[] = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'avaliacao-ia', label: 'Consulta com IA', icon: Bot, badge: 'AI' },
  { id: 'hospitais', label: 'Hospitais', icon: Building2 },
  { id: 'historico-consultas', label: 'Histórico', icon: FileText },
  { id: 'primeiros-socorros', label: 'Primeiros Socorros', icon: HeartPulse },
  { id: 'meu-qrcode', label: 'QR Code', icon: QrCode },
  { id: 'perfil', label: 'A Minha Conta', icon: User },
];

const institutionItems: MenuItem[] = [
  { id: 'hospital-dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'hospital-pacientes', label: 'Pacientes', icon: Users },
  { id: 'hospital-qr-scanner', label: 'QR Scanner', icon: QrCode },
  { id: 'hospital-historico', label: 'Histórico Clínico', icon: FileText },
  { id: 'hospital-perfil', label: 'Assistente IA', icon: Brain, badge: 'AI' },
  { id: 'hospital-trabalhadores', label: 'Profissionais', icon: Stethoscope },
  { id: 'hospital-conta', label: 'Conta', icon: User },
];

const adminItems: MenuItem[] = [
  { id: 'minsa-dashboard', label: 'Dashboard Nacional', icon: BarChart3 },
  { id: 'minsa-vigilancia', label: 'Vigilância', icon: Shield },
  { id: 'minsa-hospitals', label: 'Hospitais', icon: Building2 },
  { id: 'minsa-ia', label: 'IA Preditiva', icon: Brain, badge: 'AI' },
  { id: 'minsa-estatisticas', label: 'Estatísticas', icon: Activity },
  { id: 'minsa-relatorios', label: 'Relatórios', icon: FileText },
  { id: 'minsa-configuracao', label: 'Configuração', icon: Settings },
  { id: 'minsa-trabalhadores', label: 'Equipas', icon: Users },
  { id: 'minsa-conta', label: 'Conta', icon: User },
];

const modeInfo: Record<AppMode, { title: string; sub: string; accent: string }> = {
  user:        { title: 'CIDADÃO',      sub: 'Dr.IA Cidadão',      accent: 'from-medic-500 to-medic-700' },
  institution: { title: 'HOSPITALAR',   sub: 'Dr.IA Hospitalar',   accent: 'from-medic-600 to-medic-800' },
  admin:       { title: 'MINISTÉRIO',   sub: 'Dr.IA Ministério',   accent: 'from-medic-700 to-medic-900' },
};

export function Sidebar({
  tab, setTab, setSelectedMessage, setSelectedDoc, handleLogout,
  appMode: _propsAppMode, setAppMode: _propsSetAppMode, setStage, currentLanguage = 'pt',
  theme = 'light', onCloseMobile
}: SidebarProps) {
  const { appMode, user } = useSession();
  const { t: translate } = useLanguage();

  const currentItems = appMode === 'admin' ? adminItems
                     : appMode === 'institution' ? institutionItems
                     : userItems;

  const info = modeInfo[appMode] || modeInfo.user;

  const handleNav = (id: string) => {
    setTab(id);
    if (id !== 'correspondencias' && id !== 'documentos' && id !== 'mensagem') setSelectedMessage(null);
    if (id !== 'documento') setSelectedDoc(null);
    onCloseMobile?.();
  };

  return (
    <aside
      className={onCloseMobile ? `
        flex flex-col
        w-full h-full
        bg-white
        px-4 py-4
      ` : `
        hidden lg:flex flex-col
        w-[260px] shrink-0
        bg-white
        border-r border-ink-100
        h-screen sticky top-0
        lg:py-6 lg:px-4
        px-4 py-4
      `}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-2 pb-5 mb-4 border-b border-ink-100">
        <div className="flex items-center gap-3">
          <img 
            src="https://i.postimg.cc/pdXBS7sC/2.png" 
            alt="Dr.IA Logo" 
            referrerPolicy="no-referrer"
            className="w-11 h-11 object-contain rounded-xl"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[17px] font-extrabold tracking-tight text-ink-900">Dr<span className="text-medic-600">.</span>IA</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-400">{info.title}</span>
          </div>
        </div>

        {onCloseMobile && (
          <button 
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-ink-400 hover:text-ink-600 hover:bg-ink-50 transition-colors"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Mode label */}
      <div className="px-2 mb-2">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
          {translate(info.sub)}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto pr-1">
        {currentItems.map(({ id, label, icon: Icon, badge }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={active ? 'nav-item-active' : 'nav-item'}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-medic-600" />
              )}
              <Icon
                size={16}
                strokeWidth={active ? 2.4 : 1.8}
                className={`nav-icon shrink-0 ${active ? '!text-medic-600' : ''}`}
              />
              <span className="truncate flex-1">{translate(label)}</span>
              {badge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wider ${active ? 'bg-medic-600 text-white' : 'bg-ink-100 text-ink-500'}`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User card + Logout */}
      <div className="mt-4 pt-4 border-t border-ink-100 space-y-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-ink-50">
          <div className="avatar avatar-md">
            {user.name?.trim().charAt(0) || 'D'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-ink-900 truncate">
              {user.name || 'Dr.IA Cidadão'}
            </div>
            <div className="text-[11px] text-ink-500 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500 inline-block" />
              Sessão segura
            </div>
          </div>
        </div>
        <button
          onClick={() => handleLogout(false)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-ink-600 hover:bg-danger-50 hover:text-danger-600 border border-ink-100 hover:border-danger-200 transition-all"
        >
          <LogOut size={14} strokeWidth={2} />
          <span className="uppercase tracking-wider text-xs">Terminar Sessão</span>
        </button>
      </div>
    </aside>
  );
}
