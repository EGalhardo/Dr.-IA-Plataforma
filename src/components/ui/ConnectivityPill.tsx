/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dr.IA — Connectivity Pill
 * Badge de estado de conectividade (Online/Offline) em formato pílula,
 * design premium minimalista: fundo verde-esmeralda semitransparente,
 * borda sutil, ícone Wifi Lucide com onda expansiva (animate-ping)
 * e estado Offline âmbar com pulsação.
 */

import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { motion } from 'motion/react';

interface ConnectivityPillProps {
  /** Estado global de internet (navigator.onLine) vindo do App */
  isOnline: boolean;
  /** Se fornecido, a pílula comporta-se como botão (abre o Gestor de Conectividade) */
  onClick?: () => void;
  /** Texto de estado já traduzido; por omissão "Online" / "Offline" */
  label?: string;
  /** Nº de acções em espera na fila offline (badge) */
  badgeCount?: number;
}

export const ConnectivityPill: React.FC<ConnectivityPillProps> = ({
  isOnline,
  onClick,
  label,
  badgeCount = 0,
}) => {
  const statusLabel = label ?? (isOnline ? 'Online' : 'Offline');

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      aria-label={`Estado de conectividade: ${statusLabel}`}
      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all border ${
        isOnline
          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15'
          : 'bg-amber-500/10 text-amber-600 border-amber-500/15 animate-pulse'
      }`}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="relative flex items-center justify-center shrink-0">
        {isOnline ? (
          <div className="relative flex items-center justify-center">
            {/* Efeito de onda expansiva animada por trás do ícone */}
            <span className="absolute inline-flex h-5 w-5 rounded-full bg-emerald-500/20 scale-150 animate-ping opacity-75 pointer-events-none" />
            <Wifi size={13} className="text-emerald-600 relative z-10" />
          </div>
        ) : (
          <WifiOff size={13} className="text-amber-600" />
        )}
      </div>

      <span className="font-extrabold tracking-wider leading-none">
        {statusLabel}
      </span>

      {/* Badge de fila offline (se existir) */}
      {badgeCount > 0 && (
        <span className="bg-amber-500/90 text-white rounded-full min-w-[18px] h-[18px] text-[10px] font-bold flex items-center justify-center px-1 normal-case">
          {badgeCount}
        </span>
      )}
    </motion.button>
  );
};
