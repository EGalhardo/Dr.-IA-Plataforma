/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Mapa SVG vetorial de alta qualidade com as 21 provincias de Angola.
 *
 * As 21 provincias oficiais (apos a reforma administrativa de 2024 - Lei 14/24):
 *   Cabinda, Zaire, Uíge, Pango Aluquém, Bengo, Icolo e Bengo, Luanda,
 *   Cuanza Norte, Malanje, Lunda Norte, Lunda Sul, Cuanza Sul, Bié,
 *   Moxico, Moxico Leste, Benguela, Huambo, Huíla, Namibe, Cunene, Cuando Cubango.
 *
 * Cores dos marcadores (sistema epidemiologico):
 *   green  – Normal
 *   yellow – Atencao / monitorizacao
 *   orange – Alerta elevado
 *   red    – Critico / surto activo
 *
 * O SVG usa viewBox 0 0 800 760.  Suporta zoom (roda), pan (arrastar),
 * hover e click em marcadores com popup informativo.
 */

import { useState, useRef, useMemo, useCallback, useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ZoomIn, ZoomOut, Maximize2, AlertTriangle, TrendingUp, TrendingDown, Minus, Activity, MapPin } from 'lucide-react';

export type RiskLevel = 'normal' | 'atencao' | 'alerta' | 'critico';
export type Trend = 'subir' | 'estavel' | 'descer';

export interface ProvinceMarker {
  name: string;
  cx: number;
  cy: number;
  path: string;
  capital: string;
  level: RiskLevel;
  activeCases: number;
  trend: Trend;
  status: string;
  lastUpdate: string;
  riskLabel: string;
}

interface AngolaMapProps {
  markers: ProvinceMarker[];
  onProvinceClick?: (m: ProvinceMarker) => void;
  selected?: string | null;
}

// ---- Paths SVG das 21 provincias (viewBox 0 0 800 760) ----
// Estes paths foram desenhados manualmente como poligonos suaves para
// reproduzir reconhecidamente a forma de Angola e as 21 provincias.
// O enclave de Cabinda esta separado no topo; o resto forma o corpo principal.

type BaseProv = Omit<ProvinceMarker, 'level' | 'activeCases' | 'trend' | 'status' | 'lastUpdate' | 'riskLabel'>;

const BASE_PROVINCES: BaseProv[] = [
  // 1. CABINDA (enclave, ao norte)
  { name: 'Cabinda', cx: 200, cy: 80, capital: 'Cabinda',
    path: 'M110,35 L180,25 L240,40 L275,80 L265,120 L220,140 L170,145 L130,125 L100,80 Z' },

  // 2. ZAIRE
  { name: 'Zaire', cx: 170, cy: 180, capital: 'Mbanza Congo',
    path: 'M105,130 L170,145 L220,140 L245,165 L235,200 L200,225 L150,230 L110,210 L90,170 Z' },

  // 3. UIGE
  { name: 'Uíge', cx: 290, cy: 200, capital: 'Uíge',
    path: 'M200,225 L235,200 L245,165 L285,145 L355,155 L395,190 L385,235 L340,255 L270,260 L225,250 Z' },

  // 21. PANGO ALUQUEM – nova provincia desmembrada de Bengo/Cuanza Norte
  { name: 'Pango Aluquém', cx: 240, cy: 250, capital: 'Pango Aluquém',
    path: 'M200,225 L225,250 L270,260 L290,280 L260,300 L220,290 L195,265 Z' },

  // 4. BENGO (remanescente a oeste, depois da criacao de Icolo e Bengo/Pango Aluquem)
  { name: 'Bengo', cx: 135, cy: 275, capital: 'Caxito',
    path: 'M110,210 L150,230 L195,265 L220,290 L210,325 L180,350 L130,355 L95,325 L85,270 Z' },

  // 6. ICOLO E BENGO – a nova provincia entre Bengo e Luanda, capital Catete
  { name: 'Icolo e Bengo', cx: 200, cy: 330, capital: 'Catete',
    path: 'M180,350 L210,325 L220,290 L260,300 L295,300 L300,345 L270,375 L220,385 L175,380 Z' },

  // 7. LUANDA
  { name: 'Luanda', cx: 150, cy: 380, capital: 'Luanda',
    path: 'M95,325 L130,355 L175,380 L180,415 L150,440 L105,440 L70,410 L65,360 Z' },

  // 8. CUANZA NORTE
  { name: 'Cuanza Norte', cx: 300, cy: 325, capital: 'Ndalatando',
    path: 'M270,260 L340,255 L395,235 L420,280 L405,330 L350,355 L295,345 L290,300 L260,300 Z' },

  // 9. MALANJE
  { name: 'Malanje', cx: 430, cy: 295, capital: 'Malanje',
    path: 'M385,235 L395,190 L475,170 L555,205 L580,270 L550,340 L465,370 L405,330 L420,280 Z' },

  // 10. LUNDA NORTE
  { name: 'Lunda Norte', cx: 580, cy: 205, capital: 'Dundo',
    path: 'M555,125 L635,110 L700,150 L720,220 L695,280 L610,290 L580,270 L555,205 L550,160 Z' },

  // 15. LUNDA SUL
  { name: 'Lunda Sul', cx: 590, cy: 370, capital: 'Saurimo',
    path: 'M550,340 L610,290 L695,280 L720,350 L700,415 L630,430 L560,410 L535,370 Z' },

  // 11. CUANZA SUL
  { name: 'Cuanza Sul', cx: 230, cy: 455, capital: 'Sumbe',
    path: 'M70,410 L105,440 L150,440 L220,385 L270,375 L320,410 L310,475 L250,515 L170,515 L100,495 L60,455 Z' },

  // 18. BIE
  { name: 'Bié', cx: 385, cy: 445, capital: 'Kuito',
    path: 'M320,410 L350,355 L465,370 L505,425 L485,490 L405,520 L340,505 L310,475 Z' },

  // 16. MOXICO
  { name: 'Moxico', cx: 600, cy: 510, capital: 'Luena',
    path: 'M535,370 L560,410 L630,430 L700,415 L720,430 L735,520 L695,600 L610,635 L525,610 L485,540 L485,490 L505,425 Z' },

  // 17. MOXICO LESTE (Cazombo)
  { name: 'Moxico Leste', cx: 735, cy: 510, capital: 'Cazombo',
    path: 'M720,430 L700,415 L740,420 L785,460 L790,540 L765,610 L720,625 L695,600 L735,520 Z' },

  // 12. BENGUELA
  { name: 'Benguela', cx: 145, cy: 540, capital: 'Benguela',
    path: 'M35,480 L60,455 L100,495 L170,515 L210,560 L185,600 L120,615 L55,590 L20,530 Z' },

  // 19. HUAMBO
  { name: 'Huambo', cx: 295, cy: 530, capital: 'Huambo',
    path: 'M170,515 L250,515 L310,475 L340,505 L405,520 L390,565 L320,595 L245,590 L210,560 Z' },

  // 13. HUILA
  { name: 'Huíla', cx: 210, cy: 650, capital: 'Lubango',
    path: 'M55,590 L120,615 L185,600 L245,590 L290,645 L265,700 L190,720 L115,705 L60,660 L35,620 Z' },

  // 14. NAMIBE
  { name: 'Namibe', cx: 90, cy: 705, capital: 'Moçâmedes',
    path: 'M5,630 L35,620 L60,660 L115,705 L170,720 L160,755 L100,755 L40,735 L5,700 Z' },

  // 21. CUNENE
  { name: 'Cunene', cx: 295, cy: 725, capital: 'Ondjiva',
    path: 'M170,720 L265,700 L290,645 L375,660 L405,710 L385,755 L290,760 L200,755 L160,755 Z' },

  // 20. CUANDO CUBANGO
  { name: 'Cuando Cubango', cx: 495, cy: 670, capital: 'Menongue',
    path: 'M290,645 L375,660 L405,710 L470,730 L580,715 L640,660 L625,615 L610,635 L525,610 L485,540 L485,490 L405,520 L390,565 L320,595 L245,590 L290,645 Z' },
];

// Verificacao: 21 provincias
if (BASE_PROVINCES.length !== 21) {
  // eslint-disable-next-line no-console
  console.warn(`[AngolaMap] BASE_PROVINCES tem ${BASE_PROVINCES.length} provincias (esperado 21)`);
}

// Cores dos niveis de risco
const RISK_COLORS: Record<RiskLevel, { fill: string; stroke: string; ring: string; halo: string; label: string }> = {
  normal:  { fill: '#10b981', stroke: '#047857', ring: '#a7f3d0', halo: 'rgba(16,185,129,0.25)', label: 'Situação Normal' },
  atencao: { fill: '#f59e0b', stroke: '#b45309', ring: '#fde68a', halo: 'rgba(245,158,11,0.28)', label: 'Atenção / Monitorização' },
  alerta:  { fill: '#f97316', stroke: '#c2410c', ring: '#fed7aa', halo: 'rgba(249,115,22,0.32)', label: 'Alerta Elevado' },
  critico: { fill: '#ef4444', stroke: '#b91c1c', ring: '#fecaca', halo: 'rgba(239,68,68,0.40)', label: 'Situação Crítica / Surto' },
};

// Timestamp estavel para as provincias sem dados (evita re-renders infinitos)
const STABLE_NOW = new Date().toISOString();

const TREND_ICON = {
  subir:   { Icon: TrendingUp,  color: 'text-red-600 bg-red-50 border-red-200',     text: 'A aumentar' },
  estavel: { Icon: Minus,       color: 'text-amber-600 bg-amber-50 border-amber-200', text: 'Estável' },
  descer:  { Icon: TrendingDown, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', text: 'A diminuir' },
};

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('pt-PT', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  } catch { return iso; }
}

export function AngolaMap({ markers, onProvinceClick, selected }: AngolaMapProps) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragging = useRef<{ x: number; y: number; tx0: number; ty0: number } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ m: ProvinceMarker; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const resetView = useCallback(() => { setScale(1); setTx(0); setTy(0); }, []);
  const zoomIn = useCallback(() => setScale(s => Math.min(s * 1.25, 5)), []);
  const zoomOut = useCallback(() => setScale(s => Math.max(s / 1.25, 0.6)), []);

  // Wheel zoom com ponto focal
  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left - rect.width/2;
      const my = e.clientY - rect.top - rect.height/2;
      const delta = e.deltaY < 0 ? 1.15 : 1/1.15;
      const ns = Math.min(5, Math.max(0.6, scale * delta));
      const k = ns / scale;
      setTx(tx + (mx - tx) * (1 - k));
      setTy(ty + (my - ty) * (1 - k));
      setScale(ns);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [scale, tx, ty]);

  const onMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if ((e.target as SVGElement).closest('[data-marker]')) return;
    dragging.current = { x: e.clientX, y: e.clientY, tx0: tx, ty0: ty };
  };
  const onMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    setTx(dragging.current.tx0 + (e.clientX - dragging.current.x));
    setTy(dragging.current.ty0 + (e.clientY - dragging.current.y));
  };
  const onMouseUp = () => { dragging.current = null; };

  // Merge base com marcadores passados via props
  const merged = useMemo<ProvinceMarker[]>(() => {
    const byName: Record<string, ProvinceMarker> = {};
    markers.forEach(m => {
      // Match com e sem acentos
      byName[m.name.toLowerCase()] = m;
    });
    const norm = (s: string) => s.toLowerCase().replace(/[áàãâ]/g,'a').replace(/í/g,'i').replace(/éê/g,'e').replace(/óôõ/g,'o').replace(/ú/g,'u').replace(/ç/g,'c');
    const normMap: Record<string, ProvinceMarker> = {};
    markers.forEach(m => { normMap[norm(m.name)] = m; });

    return BASE_PROVINCES.map(p => {
      const given = byName[p.name.toLowerCase()] || normMap[norm(p.name)];
      if (given) return { ...p, ...given, cx: p.cx, cy: p.cy, path: p.path, capital: p.capital };
      return {
        ...p,
        level: 'normal' as RiskLevel,
        activeCases: 0,
        trend: 'estavel' as Trend,
        status: 'Sem alertas epidemiológicos',
        riskLabel: 'Baixo',
        lastUpdate: STABLE_NOW,
      };
    });
  }, [markers]);

  const selectedMarker = merged.find(m => m.name === selected) || null;

  const handleMarkerClick = (e: ReactMouseEvent<SVGGElement>, m: ProvinceMarker) => {
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Toggle popup se clicar na mesma provincia
    setPopup(prev => (prev && prev.m.name === m.name ? null : { m, x, y }));
    onProvinceClick?.(m);
  };

  return (
    <div
      className="relative w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-2xl overflow-hidden select-none"
      style={{ minHeight: '580px' }}
    >
      {/* Toolbar de zoom */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        <button onClick={zoomIn}  className="w-9 h-9 bg-white/95 hover:bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center text-slate-600 hover:text-medic-700 transition-colors cursor-pointer backdrop-blur" title="Aproximar"><ZoomIn size={16}/></button>
        <button onClick={zoomOut} className="w-9 h-9 bg-white/95 hover:bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center text-slate-600 hover:text-medic-700 transition-colors cursor-pointer backdrop-blur" title="Afastar"><ZoomOut size={16}/></button>
        <button onClick={resetView} className="w-9 h-9 bg-white/95 hover:bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center text-slate-600 hover:text-medic-700 transition-colors cursor-pointer backdrop-blur" title="Restabelecer vista"><Maximize2 size={16}/></button>
      </div>

      {/* Legenda */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-sm p-3 space-y-1.5">
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Legenda</div>
        {(Object.keys(RISK_COLORS) as RiskLevel[]).map(k => (
          <div key={k} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border-2" style={{ background: RISK_COLORS[k].fill, borderColor: RISK_COLORS[k].stroke, boxShadow: `0 0 0 3px ${RISK_COLORS[k].halo}` }} />
            <span className="text-[10px] font-semibold text-slate-700">{RISK_COLORS[k].label}</span>
          </div>
        ))}
      </div>

      {/* Header badge */}
      <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-sm px-3 py-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
          <span>21 Províncias · Tempo Real</span>
        </div>
      </div>

      {/* Área interactiva do mapa */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ minHeight: '580px' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={() => setPopup(null)}
      >
        <svg viewBox="0 0 800 760" className="w-full h-full" style={{ minHeight: '580px' }} preserveAspectRatio="xMidYMid meet" shapeRendering="geometricPrecision">
          <defs>
            <radialGradient id="dria-ang-ocean" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#f1f5f9"/>
              <stop offset="100%" stopColor="#e2e8f0"/>
            </radialGradient>
            <linearGradient id="dria-ang-land" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc"/>
              <stop offset="100%" stopColor="#eef2f7"/>
            </linearGradient>
            <filter id="dria-ang-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2.5"/>
              <feOffset dx="0" dy="2" result="off"/>
              <feComponentTransfer><feFuncA type="linear" slope="0.18"/></feComponentTransfer>
              <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <pattern id="dria-ang-fill" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="url(#dria-ang-land)"/>
              <path d="M0 10L10 0" stroke="#e2e8f0" strokeWidth="0.4"/>
            </pattern>
          </defs>

          <rect width="800" height="760" fill="url(#dria-ang-ocean)"/>

          <g transform={`translate(${tx},${ty}) scale(${scale})`} style={{ transformOrigin: 'center' }}>
            {/* Sombra e corpo das provincias */}
            <g filter="url(#dria-ang-shadow)">
              {merged.map(p => (
                <path
                  key={p.name}
                  d={p.path}
                  fill="url(#dria-ang-fill)"
                  stroke="#cbd5e1"
                  strokeWidth={1.4}
                  strokeLinejoin="round"
                />
              ))}
            </g>

            {/* Fronteiras com destaque no hover/select */}
            {merged.map(p => (
              <path
                key={`b-${p.name}`}
                d={p.path}
                fill="transparent"
                stroke={hovered === p.name || selected === p.name ? '#0369a1' : '#94a3b8'}
                strokeWidth={hovered === p.name || selected === p.name ? 2.2 : 0.9}
                strokeLinejoin="round"
                style={{ pointerEvents: 'none', transition: 'all 0.2s' }}
              />
            ))}

            {/* Etiquetas das provincias */}
            {merged.map(p => {
              const long = p.name.length > 12;
              return (
                <text
                  key={`l-${p.name}`}
                  x={p.cx}
                  y={p.cy - 16}
                  textAnchor="middle"
                  fontSize={long ? 9 : 10.5}
                  fontWeight={700}
                  fill="#475569"
                  fontFamily="Inter, system-ui, sans-serif"
                  style={{ pointerEvents: 'none', paintOrder: 'stroke', stroke: 'white', strokeWidth: 3, strokeLinejoin: 'round' }}
                >
                  {p.name}
                </text>
              );
            })}

            {/* Marcadores circulares */}
            {merged.map(m => {
              const c = RISK_COLORS[m.level];
              const isHover = hovered === m.name;
              const isSel = selected === m.name;
              const base = m.level === 'critico' ? 12 : m.level === 'alerta' ? 11 : m.level === 'atencao' ? 10 : 9;
              const r = isHover || isSel ? base + 3 : base;
              return (
                <g
                  key={`mk-${m.name}`}
                  data-marker
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(m.name)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={(e) => handleMarkerClick(e, m)}
                >
                  {/* Halo pulsante para alertas criticos/elevados */}
                  {(m.level === 'critico' || m.level === 'alerta') && (
                    <circle cx={m.cx} cy={m.cy} r={r + 6} fill="none" stroke={c.fill} strokeWidth={1.5} opacity={0.4}>
                      <animate attributeName="r" from={r + 4} to={r + 16} dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite"/>
                    </circle>
                  )}
                  <circle cx={m.cx} cy={m.cy} r={r + 3} fill={c.ring} opacity={isHover || isSel ? 0.9 : 0.55}/>
                  <circle cx={m.cx} cy={m.cy} r={r} fill={c.fill} stroke={c.stroke} strokeWidth={2}/>
                  {m.activeCases > 0 ? (
                    <text
                      x={m.cx} y={m.cy + 3.5}
                      textAnchor="middle"
                      fontSize={m.activeCases > 99 ? 8 : 10}
                      fontWeight={900}
                      fill="white"
                      style={{ pointerEvents: 'none', fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                      {m.activeCases > 99 ? '99+' : m.activeCases}
                    </text>
                  ) : (
                    <circle cx={m.cx} cy={m.cy} r={2.5} fill="white"/>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Popup principal (click) */}
      <AnimatePresence>
        {popup && (() => {
          const m = popup.m;
          const c = RISK_COLORS[m.level];
          const T = TREND_ICON[m.trend];
          // Posicionamento inteligente para nao sair do container
          const POPUP_W = 320;
          const POPUP_H = 260;
          const cw = containerRef.current?.clientWidth ?? 800;
          const ch = containerRef.current?.clientHeight ?? 580;
          let left = popup.x + 14;
          let top = popup.y - 20;
          if (left + POPUP_W > cw - 10) left = popup.x - POPUP_W - 14;
          if (top + POPUP_H > ch - 10) top = ch - POPUP_H - 10;
          left = Math.max(10, left);
          top = Math.max(10, top);
          return (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              className="absolute z-30 pointer-events-none"
              style={{ left, top, minWidth: '280px', maxWidth: '320px' }}
            >
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4 text-left">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2" style={{ background: c.fill, borderColor: c.stroke }}>
                    {m.level === 'critico'
                      ? <AlertTriangle size={18} className="text-white"/>
                      : m.level === 'alerta'
                      ? <Activity size={18} className="text-white"/>
                      : <MapPin size={18} className="text-white"/>}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-black text-slate-900 leading-tight">{m.name}</h5>
                    <p className="text-[10px] text-slate-500 font-semibold">Capital: {m.capital}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estado</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: c.ring, color: c.stroke }}>
                      {m.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nível de risco</span>
                    <span className="text-[11px] font-black text-slate-900">{m.riskLabel}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Casos activos</span>
                    <span className="text-[14px] font-black" style={{ color: c.stroke }}>{m.activeCases.toLocaleString('pt-PT')}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tendência</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-black ${T.color}`}>
                      <T.Icon size={11}/> {T.text}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Última actualização</span>
                    <span className="text-[10px] font-semibold text-slate-700">{formatTime(m.lastUpdate)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Mini-tooltip de hover */}
      <AnimatePresence>
        {hovered && !popup && (() => {
          const m = merged.find(x => x.name === hovered);
          if (!m) return null;
          const c = RISK_COLORS[m.level];
          return (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute z-30 pointer-events-none bg-slate-900/95 backdrop-blur text-white rounded-xl px-3 py-2 shadow-lg text-left"
              style={{ left: 16, bottom: 100 }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.fill }}/>
                <span className="text-[11px] font-black">{m.name}</span>
              </div>
              <div className="text-[10px] text-slate-300 font-semibold mt-0.5">{m.status} · {m.activeCases} casos activos</div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Dica de interacção */}
      <div className="absolute bottom-3 right-3 z-20 bg-white/90 backdrop-blur border border-slate-200 rounded-xl px-2.5 py-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        <span>Roda p/ zoom</span><span className="text-slate-300">·</span><span>Arrasta p/ mover</span><span className="text-slate-300">·</span><span>Clica nos marcadores</span>
      </div>

      {/* Provincia seleccionada em destaque */}
      {selectedMarker && (
        <div className="absolute top-16 left-3 z-20 bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-sm px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: RISK_COLORS[selectedMarker.level].fill }}/>
          {selectedMarker.name}
        </div>
      )}
    </div>
  );
}

export default AngolaMap;
