/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dr.IA — Mini Connectivity
 * Indicador minimalista de estado de conectividade: transparente,
 * sem bordas nem sombras de container, bolinha brilhante de 8px com
 * onda expansiva (animate-ping) e texto ultra compacto. Mistura-se
 * organicamente com o Header.
 */

import React from 'react';
import { motion } from 'motion/react';

interface MiniConnectivityProps {
  /** Estado global de internet (navigator.onLine) vindo do App */
  isOnline: boolean;
  /** Se fornecido, o indicador continua clicável (abre o Gestor de Conectividade) */
  onClick?: () => void;
  /** Texto de estado já traduzido; por omissão "Online" / "Offline" */
  label?: string;
  /** Nº de acções em espera na fila offline (badge discreto, só visível se > 0) */
  badgeCount?: number;
}

export const MiniConnectivity: React.FC<MiniConnectivityProps> = ({
  isOnline,
  onClick,
  label,
  badgeCount = 0,
}) => {
  const statusLabel = label ?? (isOnline ? 'Online' : 'Offline');

  return (
    <motion.div
      role={onClick ? 'button' : 'status'}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      aria-label={`Estado de conectividade: ${statusLabel}`}
      className="inline-flex items-center gap-2.5 bg-transparent border-none p-0 select-none"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Container da Bolinha com Efeito Pulsante (Ping) */}
      <div className="relative flex h-2 w-2 items-center justify-center">
        {isOnline ? (
          <>
            {/* Onda expansiva de fundo */}
            <span className="absolute inline-flex h-4 w-4 rounded-full bg-emerald-500/30 scale-150 animate-ping pointer-events-none" />
            {/* Bolinha sólida central */}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          </>
        ) : (
          <>
            <span className="absolute inline-flex h-4 w-4 rounded-full bg-amber-500/30 scale-150 animate-ping pointer-events-none" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          </>
        )}
      </div>

      {/* Texto Lateral */}
      <span
        className={`text-[10px] font-black tracking-widest uppercase leading-none ${
          isOnline ? 'text-emerald-600' : 'text-amber-600'
        }`}
      >
        {statusLabel}
      </span>

      {/* Badge discreto da fila offline (apenas se existir) */}
      {badgeCount > 0 && (
        <span className="bg-amber-500/90 text-white rounded-full min-w-[16px] h-[16px] text-[9px] font-bold flex items-center justify-center px-1">
          {badgeCount}
        </span>
      )}
    </motion.div>
  );
};
