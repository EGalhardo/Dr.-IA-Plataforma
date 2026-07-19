/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dr.IA — Connectivity Status Indicator
 * Design fluido/dinâmico (padrão Correio Digital Angola):
 * cápsula pill semitransparente + batimento cardíaco (heartbeat)
 * + micro-espectro de sinal (soundwave de 3 barras) + fade entre estados.
 */

import { motion, AnimatePresence } from 'motion/react';

interface ConnectivityIndicatorProps {
  isOnline: boolean;
  /** Texto de estado já traduzido (ex: "Online" / "Offline") */
  label: string;
  /** Se fornecido, o indicador comporta-se como botão (abre o Gestor de Conectividade) */
  onClick?: () => void;
  /** Nº de acções em espera na fila offline (badge), apenas no modo botão */
  badgeCount?: number;
  /** 'light' para superfícies claras (Header) | 'dark' para fundos escuros (Modal) */
  tone?: 'light' | 'dark';
}

interface TonePalette {
  pill: string;
  ripple: string;
  badge: string;
}

const PALETTES: Record<'light' | 'dark', { online: TonePalette; offline: TonePalette }> = {
  light: {
    // ONLINE — azul/índigo suave, semitransparente e profissional
    online: {
      pill: 'bg-indigo-600/10 border-indigo-600/20 text-indigo-600 hover:bg-indigo-600/15',
      ripple: 'bg-indigo-600/40',
      badge: 'bg-indigo-600 text-white',
    },
    // OFFLINE (Modo de Escuta Ativa) — variação âmbar harmonizada, semitransparente
    offline: {
      pill: 'bg-amber-500/10 border-amber-500/20 text-amber-600 hover:bg-amber-500/15',
      ripple: 'bg-amber-500/40',
      badge: 'bg-amber-500/90 text-white',
    },
  },
  dark: {
    online: {
      pill: 'bg-indigo-400/15 border-indigo-400/30 text-indigo-300 hover:bg-indigo-400/20',
      ripple: 'bg-indigo-400/40',
      badge: 'bg-indigo-400 text-slate-900',
    },
    offline: {
      pill: 'bg-amber-400/15 border-amber-400/30 text-amber-300 hover:bg-amber-400/20',
      ripple: 'bg-amber-400/40',
      badge: 'bg-amber-400/90 text-slate-900',
    },
  },
};

// Micro-espectro de sinal: 3 barras arredondadas com alturas
// independentes e dessincronizadas (0.1s / 0.2s de delay).
const SPECTRUM_BARS: { heights: string[]; duration: number; delay: number }[] = [
  { heights: ['20%', '100%', '20%'], duration: 0.5, delay: 0 },
  { heights: ['40%', '80%', '40%'], duration: 0.6, delay: 0.1 },
  { heights: ['30%', '100%', '30%'], duration: 0.4, delay: 0.2 },
];

export function ConnectivityIndicator({
  isOnline,
  label,
  onClick,
  badgeCount = 0,
  tone = 'light',
}: ConnectivityIndicatorProps) {
  const palette = isOnline ? PALETTES[tone].online : PALETTES[tone].offline;

  const content = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={isOnline ? 'online' : 'offline'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="inline-flex items-center gap-2"
      >
        {/* Ponto pulsante — batimento cardíaco (heartbeat ripple) */}
        <span className="relative inline-flex w-2.5 h-2.5 shrink-0">
          <motion.span
            className={`absolute inset-0 rounded-full ${palette.ripple}`}
            animate={{ scale: [1, 2], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
          />
          <motion.span
            className="relative w-2.5 h-2.5 rounded-full bg-current"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          />
        </span>

        {/* Texto de estado */}
        <span className="text-xs font-black uppercase tracking-widest leading-none">
          {label}
        </span>

        {/* Micro-espectro de sinal / soundwave (3 barras) */}
        <span className="inline-flex items-end gap-[2px] h-3.5 shrink-0" aria-hidden="true">
          {SPECTRUM_BARS.map((bar, i) => (
            <motion.span
              key={i}
              className="w-[3px] rounded-full bg-current"
              style={{ height: bar.heights[0] }}
              animate={{ height: bar.heights }}
              transition={{ repeat: Infinity, duration: bar.duration, delay: bar.delay, ease: 'easeInOut' }}
            />
          ))}
        </span>

        {/* Badge de fila offline (se existir) */}
        {badgeCount > 0 && (
          <span className={`rounded-full min-w-[18px] h-[18px] text-[10px] font-bold flex items-center justify-center px-1 ${palette.badge}`}>
            {badgeCount}
          </span>
        )}
      </motion.span>
    </AnimatePresence>
  );

  const pillClass = `inline-flex items-center gap-2 rounded-full border px-4 py-2 shadow-sm transition-colors ${palette.pill}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Estado de conectividade: ${label}`}
        className={pillClass}
      >
        {content}
      </button>
    );
  }

  return (
    <div role="status" aria-label={`Estado de conectividade: ${label}`} className={pillClass}>
      {content}
    </div>
  );
}
