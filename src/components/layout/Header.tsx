/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dr.IA — Premium Header (Medical Design System v2)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic, Globe, ChevronDown, Check, Sun, Moon, Search, Bell, Menu,
  Activity, Wifi, WifiOff
} from 'lucide-react';
import { useSession } from '../../services/sessionStore';
import { AppNotification, AppMode, LanguageCode, LANGUAGE_OPTIONS } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { LazyImage } from '../ui/LazyImage';
import { hasPagePresentation } from '../../services/voicePresentations';
import { useTranslationContext } from '../../context/TranslationContext';
import type { JSX } from 'react';

interface HeaderProps {
  setTab: (id: string) => void;
  iaLiveActive: boolean;
  startIaVoice: () => void;
  stopIaVoice: () => void;
  notifications: AppNotification[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  userProfilePhoto?: string;
  NotificationDropdown: () => JSX.Element;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  appMode: AppMode;
  emergencyMode?: boolean;
  isOnline: boolean;
  onClickConnectivity: () => void;
  offlineQueueLength: number;
  tab?: string;
  currentLanguage: LanguageCode;
  setCurrentLanguage: (lang: LanguageCode) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onOpenMobileSidebar?: () => void;
}

/* ──────────────────────────────────────────────────────────────
   Language Selector
   ────────────────────────────────────────────────────────────── */
function LanguageSelectorDropdown({
  currentLanguage, setCurrentLanguage, onLanguageChange, variant = 'default'
}: {
  currentLanguage: LanguageCode;
  setCurrentLanguage: (lang: LanguageCode) => void;
  onLanguageChange: () => void;
  variant?: 'default' | 'compact';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeOption = LANGUAGE_OPTIONS.find(opt => opt.code === currentLanguage) || LANGUAGE_OPTIONS[0];

  const handleLanguageChange = useCallback((lang: LanguageCode) => {
    setCurrentLanguage(lang);
    setIsOpen(false);
    onLanguageChange();
  }, [setCurrentLanguage, onLanguageChange]);

  return (
    <div className="relative shrink-0 flex items-center" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary !py-2 !px-3 gap-1.5"
      >
        <Globe size={15} className="text-medic-600" strokeWidth={2} />
        <span className="text-xs font-bold uppercase tracking-wider">{activeOption.flagCode}</span>
        <ChevronDown size={12} className={`text-ink-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-xl shadow-lg border border-ink-100 p-2 z-[160]"
          >
            <div className="max-h-[340px] overflow-y-auto flex flex-col gap-0.5">
              {LANGUAGE_OPTIONS.map((option) => {
                const isSelected = option.code === currentLanguage;
                return (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => handleLanguageChange(option.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg text-sm transition-colors ${
                      isSelected ? 'bg-medic-50 text-medic-700 font-semibold' : 'text-ink-700 hover:bg-ink-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-9 h-7 flex items-center justify-center rounded-md text-[10px] font-bold tracking-wider ${
                        isSelected ? 'bg-white text-medic-600 shadow-sm' : 'bg-ink-100 text-ink-600'
                      }`}>
                        {option.flagCode}
                      </span>
                      <span className="truncate">
                        {option.code === 'pt' ? 'Português (AO)' : option.label}
                      </span>
                    </div>
                    {isSelected && <Check size={14} className="text-medic-600" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Header
   ────────────────────────────────────────────────────────────── */
export function Header({
  setTab, iaLiveActive, startIaVoice, stopIaVoice,
  notifications, showNotifications, setShowNotifications,
  NotificationDropdown, isChatOpen, setIsChatOpen,
  appMode, emergencyMode = false, isOnline, onClickConnectivity, offlineQueueLength,
  tab, currentLanguage, setCurrentLanguage, theme, setTheme, onOpenMobileSidebar
}: HeaderProps) {
  const { user, activeProfile } = useSession();
  const { t: translate } = useLanguage();
  const { refresh: refreshTranslations } = useTranslationContext();
  const isAdmin = appMode === 'admin';
  const isInst = appMode === 'institution';
  const hasEmergencyBanner = emergencyMode && appMode !== 'user';

  const getSectionLabel = (): string => {
    if (isAdmin) switch (tab) {
      case 'minsa-dashboard': return 'Visão Geral';
      case 'minsa-vigilancia': return 'Vigilância Epidemiológica';
      case 'minsa-hospitals': return 'Rede Hospitalar';
      case 'minsa-ia': return 'IA Preditiva Nacional';
      case 'minsa-estatisticas': return 'Indicadores de Saúde';
      case 'minsa-relatorios': return 'Relatórios';
      case 'minsa-configuracao': return 'Configuração';
      case 'minsa-trabalhadores': return 'Equipas do MINSA';
      case 'minsa-conta': return 'Conta Institucional';
      default: return 'Ministério da Saúde';
    }
    if (isInst) switch (tab) {
      case 'hospital-dashboard': return 'Visão Geral';
      case 'hospital-pacientes': return 'Fila de Triagem';
      case 'hospital-qr-scanner': return 'Validação QR do Utente';
      case 'hospital-historico': return 'Histórico Clínico';
      case 'hospital-perfil': return 'Assistente IA Clínico';
      case 'hospital-trabalhadores': return 'Corpo Clínico';
      case 'hospital-conta': return 'Conta do Hospital';
      default: return 'Painel Hospitalar';
    }
    switch (tab) {
      case 'home': return 'Início';
      case 'avaliacao-ia': return 'Consulta com IA';
      case 'hospitais': return 'Rede Hospitalar';
      case 'historico-consultas': return 'Histórico Clínico';
      case 'primeiros-socorros': return 'Primeiros Socorros';
      case 'meu-qrcode': return 'QR Code Pessoal';
      case 'perfil': return 'Perfil de Saúde';
      default: return 'Área do Cidadão';
    }
  };

  const getMainTitle = (): string => {
    if (isAdmin) return activeProfile?.institutionName || 'Ministério da Saúde';
    if (isInst) return activeProfile?.institutionName || `Bom dia, ${user.firstName}`;
    return `Bom dia, ${user.firstName}`;
  };

  const handleMicClick = () => {
    if (!isChatOpen) { setIsChatOpen(true); startIaVoice(); }
    else if (iaLiveActive) { stopIaVoice(); setIsChatOpen(false); }
    else startIaVoice();
  };

  const micDisabled = currentLanguage !== 'pt' || !hasPagePresentation(appMode, tab);
  const unreadCount = notifications.length; // notifications shown in dropdown are active items

  return (
    <>
      {/* ═══ Mobile AppBar ═══ */}
      <header
        style={{ top: hasEmergencyBanner ? 32 : 0 }}
        className="app-mobile-header lg:hidden fixed left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-ink-100 px-4 flex items-center justify-between z-40"
      >
        <div className="flex items-center gap-2">
          <button onClick={onOpenMobileSidebar} className="btn-icon -ml-2" aria-label={translate("Abrir menu")}>
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab(isAdmin ? 'minsa-dashboard' : 'home')}>
            <img 
              src="https://i.postimg.cc/pdXBS7sC/2.png" 
              alt="Dr.IA Logo" 
              referrerPolicy="no-referrer"
              className="w-8 h-8 object-contain rounded-lg"
            />
            <span className="text-base font-extrabold tracking-tight text-ink-900">
              Dr<span className="text-medic-600">.</span>IA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <LanguageSelectorDropdown currentLanguage={currentLanguage} setCurrentLanguage={setCurrentLanguage} onLanguageChange={refreshTranslations} variant="compact" />

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="btn-icon"
            aria-label={translate("Alternar tema")}
          >
            <AnimatePresence mode="wait">
              {theme === 'light' ? (
                <motion.div key="moon" initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 30, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Moon size={17} className="text-ink-600" />
                </motion.div>
              ) : (
                <motion.div key="sun" initial={{ rotate: 30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -30, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Sun size={17} className="text-amber-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <button
            disabled={micDisabled}
            onClick={!micDisabled ? handleMicClick : undefined}
            className={`relative btn-icon ${iaLiveActive ? '!bg-medic-50 !text-medic-600' : ''} ${micDisabled ? 'opacity-30' : ''}`}
            aria-label={translate("Assistente de voz")}
          >
            {iaLiveActive && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0.6 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-medic-500/30"
              />
            )}
            <Mic size={17} className="relative z-10" strokeWidth={2} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-icon relative"
              aria-label={translate("Notificações")}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] bg-danger-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1 ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationDropdown />
          </div>
        </div>
      </header>

      {/* ═══ Desktop Topbar ═══ */}
      <div
        style={{ top: hasEmergencyBanner ? 32 : 0 }}
        className="app-desktop-header hidden lg:flex sticky z-30 bg-white/85 backdrop-blur-xl border-b border-ink-100 px-6 py-3 items-center gap-4"
      >
        {/* Greeting / breadcrumb */}
        <div className="flex-1 min-w-0">
          <div className="breadcrumb mb-1">
            <span className="text-medic-600 font-semibold">Dr.IA</span>
            <ChevronDown size={12} className="rotate-[-90deg] text-ink-300" />
            <span>
              {translate(isAdmin ? 'MINSA' : isInst ? 'Hospital' : 'Cidadão')}
            </span>
            <ChevronDown size={12} className="rotate-[-90deg] text-ink-300" />
            <span className="breadcrumb-current">{translate(getSectionLabel())}</span>
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-ink-900 truncate">
            {translate(getMainTitle())}
          </h1>
        </div>

        {/* Search (visual placeholder for premium feel) */}
        <div className="hidden xl:flex items-center gap-2 bg-ink-50 border border-ink-100 rounded-xl px-2.5 py-1.5 w-[240px] hover:border-ink-200 transition-colors">
          <Search size={14} className="text-ink-400" />
          <input
            type="text"
            placeholder={translate(isAdmin ? 'Pesquisar hospitais, indicadores...' : isInst ? 'Pesquisar pacientes, triagens...' : 'Pesquisar consultas, documentos...')}
            className="bg-transparent outline-none text-xs text-ink-700 placeholder:text-ink-400 w-full"
          />
          <kbd className="hidden md:inline-flex text-[9px] font-semibold text-ink-400 bg-white border border-ink-200 rounded px-1.5 py-0.5">⌘K</kbd>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Connectivity */}
          <button
            onClick={onClickConnectivity}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              isOnline
                ? 'bg-success-50 text-success-600 hover:bg-success-50/70'
                : 'bg-warning-50 text-warning-600 animate-pulse'
            }`}
          >
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span className="uppercase tracking-wider">{translate(isOnline ? 'Online' : 'Offline')}</span>
            {offlineQueueLength > 0 && (
              <span className="bg-warning-600 text-white rounded-full min-w-[18px] h-[18px] text-[10px] font-bold flex items-center justify-center px-1">
                {offlineQueueLength}
              </span>
            )}
          </button>

          <LanguageSelectorDropdown currentLanguage={currentLanguage} setCurrentLanguage={setCurrentLanguage} onLanguageChange={refreshTranslations} />

          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="btn-icon" aria-label="Tema">
            <AnimatePresence mode="wait">
              {theme === 'light' ? (
                <motion.div key="moon" initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 30, opacity: 0 }}>
                  <Moon size={18} className="text-ink-600" />
                </motion.div>
              ) : (
                <motion.div key="sun" initial={{ rotate: 30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -30, opacity: 0 }}>
                  <Sun size={18} className="text-amber-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <button
            disabled={micDisabled}
            onClick={!micDisabled ? handleMicClick : undefined}
            className={`relative btn-icon ${iaLiveActive ? '!bg-medic-50 !text-medic-600' : ''} ${micDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
            aria-label="Voz IA"
          >
            {iaLiveActive && (
              <motion.span
                initial={{ scale: 0.6, opacity: 0.5 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-medic-500/30"
              />
            )}
            <Mic size={18} strokeWidth={2} className="relative z-10" />
          </button>

          <div className="w-px h-6 bg-ink-100 mx-1" />

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-icon relative"
              aria-label={translate("Notificações")}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] bg-danger-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1 ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationDropdown />
          </div>

          {/* Avatar */}
          <button
            onClick={() => setTab(isAdmin ? 'minsa-conta' : isInst ? 'hospital-conta' : 'perfil')}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-ink-50 transition-colors"
          >
            {user.avatarUrl ? (
              <LazyImage
                src={user.avatarUrl}
                alt="Perfil"
                priority={true}
                placeholder="skeleton"
                style={{ width: 36, height: 36, borderRadius: 9999, objectFit: 'cover' }}
                className="ring-2 ring-white shadow-sm"
              />
            ) : (
              <div className="avatar avatar-md">{user.name?.charAt(0) || 'D'}</div>
            )}
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-xs font-semibold text-ink-900 max-w-[140px] truncate">{user.name || 'Dr.IA'}</span>
              <span className="text-[10px] text-ink-500 uppercase tracking-wider">
                {translate(isAdmin ? 'MINSA' : isInst ? 'Hospital' : 'Cidadão')}
              </span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
