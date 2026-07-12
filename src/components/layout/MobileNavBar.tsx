/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dr.IA — Premium Mobile Bottom Navigation (Medical Design System v2)
 */

import { motion } from 'motion/react';
import {
  Home, Brain, QrCode, Users, User, BarChart3, Shield, FileText,
  Building2, Settings, Bot, Activity, HeartPulse, Stethoscope
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Message, Document, AppMode, LanguageCode } from '../../types';
import { useSession } from '../../services/sessionStore';
import { useLanguage } from '../../hooks/useLanguage';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface MobileNavBarProps {
  tab: string;
  setTab: (id: string) => void;
  setSelectedMessage: (msg: Message | null) => void;
  setSelectedDoc: (doc: Document | null) => void;
  appMode: AppMode;
  currentLanguage?: LanguageCode;
}

const userItems: MenuItem[] = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'avaliacao-ia', label: 'Consulta IA', icon: Bot },
  { id: 'hospitais', label: 'Hospitais', icon: Building2 },
  { id: 'meu-qrcode', label: 'QR', icon: QrCode },
  { id: 'perfil', label: 'Perfil', icon: User },
];

const institutionItems: MenuItem[] = [
  { id: 'hospital-dashboard', label: 'Painel', icon: BarChart3 },
  { id: 'hospital-pacientes', label: 'Pacientes', icon: Users },
  { id: 'hospital-qr-scanner', label: 'Scanner', icon: QrCode },
  { id: 'hospital-historico', label: 'Histórico', icon: FileText },
  { id: 'hospital-conta', label: 'Conta', icon: User },
];

const adminItems: MenuItem[] = [
  { id: 'minsa-dashboard', label: 'Painel', icon: BarChart3 },
  { id: 'minsa-vigilancia', label: 'Vigilância', icon: Shield },
  { id: 'minsa-hospitals', label: 'Hospitais', icon: Building2 },
  { id: 'minsa-ia', label: 'IA', icon: Brain },
  { id: 'minsa-conta', label: 'Conta', icon: User },
];

export function MobileNavBar({
  tab, setTab, setSelectedMessage, setSelectedDoc,
  appMode: _propsAppMode, currentLanguage = 'pt'
}: MobileNavBarProps) {
  const { appMode } = useSession();
  const { t: translate } = useLanguage();

  const currentItems = appMode === 'admin' ? adminItems
                    : appMode === 'institution' ? institutionItems
                    : userItems;

  const handleNav = (id: string) => {
    setTab(id);
    if (id !== 'correspondencias' && id !== 'documentos' && id !== 'mensagem') setSelectedMessage(null);
    if (id !== 'documento') setSelectedDoc(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Center FAB action (for citizen: AI consult, for hospital: triage scanner, for admin: vigilance)
  const fabId = appMode === 'admin' ? 'minsa-vigilancia'
              : appMode === 'institution' ? 'hospital-qr-scanner'
              : 'avaliacao-ia';
  const FabIcon = appMode === 'admin' ? Shield
                : appMode === 'institution' ? QrCode
                : Bot;

  const items = currentItems;
  const mid = Math.floor(items.length / 2);
  const left = items.slice(0, mid);
  const right = items.slice(mid);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]"
      style={{ filter: 'drop-shadow(0 -4px 20px rgba(11,31,79,0.08))' }}
    >
      <div className="mx-2 mb-2 bg-white rounded-2xl border border-ink-100 flex items-stretch justify-between h-16 px-2 relative">
        {left.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => handleNav(id)} className="flex-1 flex flex-col items-center justify-center gap-0.5 relative">
              <Icon size={18} strokeWidth={active ? 2.4 : 1.8} className={active ? 'text-medic-600' : 'text-ink-400'} />
              <span className={`text-[8px] font-semibold tracking-tight ${active ? 'text-medic-700' : 'text-ink-400'}`}>
                {translate(label)}
              </span>
              {active && (
                <motion.div layoutId="mobileTab" className="absolute top-0 w-8 h-[3px] rounded-full bg-medic-600" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
              )}
            </button>
          );
        })}

        {/* Center FAB */}
        <button
          onClick={() => handleNav(fabId)}
          className="relative -mt-5 mx-1 w-14 h-14 rounded-full bg-gradient-to-br from-medic-500 to-medic-700 text-white shadow-lg shadow-medic-500/30 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Ação rápida"
        >
          <span className="absolute inset-0 rounded-full bg-medic-400/40 animate-ping" />
          <FabIcon size={20} className="relative z-10" strokeWidth={2.2} />
        </button>

        {right.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => handleNav(id)} className="flex-1 flex flex-col items-center justify-center gap-0.5 relative">
              <Icon size={18} strokeWidth={active ? 2.4 : 1.8} className={active ? 'text-medic-600' : 'text-ink-400'} />
              <span className={`text-[8px] font-semibold tracking-tight ${active ? 'text-medic-700' : 'text-ink-400'}`}>
                {translate(label)}
              </span>
              {active && (
                <motion.div layoutId="mobileTab" className="absolute top-0 w-8 h-[3px] rounded-full bg-medic-600" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
