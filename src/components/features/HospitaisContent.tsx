/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Stethoscope, Clock, ShieldCheck, Phone, CheckCircle2, Hospital, ArrowRight, Star, ExternalLink, Map as MapIcon, Plus, Minus, MessageSquare, AlertCircle } from 'lucide-react';
import { DriaHospital, DriaEvaluation } from '../../types/dria';
import { MOCK_HOSPITALS } from '../../constants/driaMocks';
import { useLanguage } from '../../hooks/useLanguage';

interface HospitaisContentProps {
  hospitals?: DriaHospital[];
  activeEvaluation?: DriaEvaluation | null;
  onSendToHospital?: (hospitalId: string, hospitalName: string) => void;
}

export function HospitaisContent({
  hospitals = MOCK_HOSPITALS,
  activeEvaluation,
  onSendToHospital
}: HospitaisContentProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todas');
  const [sentHospitalId, setSentHospitalId] = useState<string | null>(null);

  const [mapInitialized, setMapInitialized] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapMode, setMapMode] = useState<'streets' | 'satellite'>('streets');
  const tileLayerRef = useRef<any>(null);

  const scrollToHospital = (hId: string) => {
    const el = document.getElementById(`hospital-card-${hId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add temporary visual highlight glow
      el.classList.add('ring-4', 'ring-emerald-500/50', 'bg-emerald-50/20');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-emerald-500/50', 'bg-emerald-50/20');
      }, 2500);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Check if Leaflet is already loaded on window
    if ((window as any).L) {
      if (isMounted) {
        setTimeout(() => initMap(), 100);
      }
      return;
    }

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.crossOrigin = '';
    script.onload = () => {
      if (isMounted) {
        setTimeout(() => initMap(), 100);
      }
    };
    document.head.appendChild(script);

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const initMap = () => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current || mapRef.current) return;

    try {
      // Coordenadas aproximadas e realistas dos hospitais em Luanda
      const hospitalCoords: Record<string, [number, number]> = {
        h1: [-8.9220, 13.2114], // Hospital Geral de Luanda
        h2: [-8.8222, 13.2658], // Hospital Américo Boavida
        h3: [-8.7831, 13.3644], // Centro de Saúde de Cacuaco
        h4: [-8.8197, 13.2281], // Hospital Josina Machel
        h5: [-8.8111, 13.2844], // Centro de Saúde do Cazenga
        h6: [-8.8256, 13.2422], // Clínica Sagrada Esperança
      };

      // Inicializa o mapa focado em Luanda
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        scrollWheelZoom: true
      }).setView([-8.835, 13.245], 11.5);

      mapRef.current = map;

      // Adiciona o tile layer Voyager da CartoDB (muito limpo e moderno)
      const streetsLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      });
      streetsLayer.addTo(map);
      tileLayerRef.current = streetsLayer;

      // Adiciona escala ao canto inferior esquerdo
      L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

      // Adiciona os marcadores personalizados para cada hospital
      hospitals.forEach(h => {
        const coords = hospitalCoords[h.id];
        if (!coords) return;

        const waitMinutes = parseInt(h.avgWaitTime) || 15;
        // Cores de urgência/espera
        const colorClass = waitMinutes >= 35 ? 'bg-rose-500' : waitMinutes >= 20 ? 'bg-amber-500' : 'bg-emerald-500';

        const customIcon = L.divIcon({
          className: 'custom-leaflet-pin',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute -top-3 flex flex-col items-center">
                <!-- Pin Pulse Effect for Urgent -->
                ${waitMinutes >= 35 ? `<div class="absolute w-8 h-8 rounded-full bg-rose-500/20 -top-0.5 animate-ping"></div>` : ''}
                <!-- Main Pin Circle -->
                <div class="w-7 h-7 rounded-full ${colorClass} border-2 border-white flex items-center justify-center text-white shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19V5"/></svg>
                </div>
                <!-- Needle Point -->
                <div class="w-1.5 h-1.5 bg-slate-800 rotate-45 -mt-1 shadow-sm"></div>
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -32]
        });

        // Popup HTML limpo e responsivo
        const popupContent = document.createElement('div');
        popupContent.className = 'font-sans p-1.5 space-y-2 text-left text-slate-800';
        popupContent.innerHTML = `
          <div class="space-y-0.5">
            <h4 class="font-black text-xs uppercase tracking-tight text-slate-800 leading-tight">${h.name}</h4>
            <p class="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">${h.municipality}</p>
          </div>
          <div class="space-y-1 pt-1.5 border-t border-slate-100">
            <div class="flex items-center justify-between text-[10px] font-black">
              <span class="text-slate-500 uppercase tracking-wider text-[8px]">Espera Média:</span>
              <span class="px-2 py-0.5 rounded-md ${waitMinutes >= 35 ? 'bg-rose-50 text-rose-600' : waitMinutes >= 20 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}">${h.avgWaitTime}</span>
            </div>
            <div class="flex items-center justify-between text-[10px] font-black">
              <span class="text-slate-500 uppercase tracking-wider text-[8px]">Distância:</span>
              <span class="text-indigo-600 font-extrabold">${h.distance}</span>
            </div>
            <div class="flex items-center justify-between text-[10px] font-black">
              <span class="text-slate-500 uppercase tracking-wider text-[8px]">Especialistas:</span>
              <span class="text-slate-700">${h.doctorsCount} Médicos</span>
            </div>
          </div>
          <button type="button" aria-label="Ver detalhes do hospital" class="w-full mt-2.5 py-1.5 bg-[#0E2B64] hover:bg-[#153f8a] active:scale-95 text-white text-[9px] font-black uppercase tracking-wider rounded-lg text-center cursor-pointer border-none shadow-sm transition-all duration-200">
            Focar na Unidade ↓
          </button>
        `;

        popupContent.querySelector('button')?.addEventListener('click', () => {
          scrollToHospital(h.id);
        });

        L.marker(coords, { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent, { closeButton: false, minWidth: 200, className: 'custom-leaflet-popup' });
      });

      setMapInitialized(true);
    } catch (err) {
      console.error('Error initializing Leaflet map:', err);
    }
  };

  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const changeMapMode = (mode: 'streets' | 'satellite') => {
    if (!mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    let newLayer;
    if (mode === 'satellite') {
      newLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      });
    } else {
      newLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      });
    }

    newLayer.addTo(mapRef.current);
    tileLayerRef.current = newLayer;
    setMapMode(mode);
  };

  // Extract all unique specialties for the filter
  const allSpecialties = ['Todas', ...Array.from(new Set(hospitals.flatMap(h => h.specialties)))];

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.municipality.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'Todas' || h.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const handleSendReport = (hId: string, hName: string) => {
    if (onSendToHospital) {
      onSendToHospital(hId, hName);
      setSentHospitalId(hId);
      setTimeout(() => setSentHospitalId(null), 3000);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Banner Intro */}
      <div className="bg-gradient-to-r from-[#0E2B64] to-indigo-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center">
          <Hospital size={160} />
        </div>
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="px-2.5 py-1 bg-white/20 rounded-full text-[9px] font-bold tracking-widest uppercase">Rede Nacional de Saúde</span>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight italic">Hospitais & Centros Integrados</h2>
          <p className="text-xs text-emerald-100 leading-relaxed font-medium">
            Consulte a localização, as especialidades disponíveis e o tempo médio de atendimento atualizado de cada unidade médica na plataforma DR.IA de Angola.
          </p>
        </div>
      </div>

      {/* Mapa Interativo de Luanda */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 md:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-150 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <MapIcon size={16} />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                Hospitais em Luanda
              </h3>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Geolocalização Integrada</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-[9px] font-black uppercase rounded-full">
            6 Unidades Ativas
          </span>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner group h-[350px] md:h-[420px]">
          {/* Zoom Controls */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-500 shadow-sm rounded-lg overflow-hidden border border-slate-200">
            <button 
              type="button"
              onClick={zoomIn}
              className="w-8 h-8 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center cursor-pointer transition-colors border-none"
            >
              <Plus size={14} />
            </button>
            <button 
              type="button"
              onClick={zoomOut}
              className="w-8 h-8 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center cursor-pointer transition-colors border-none"
            >
              <Minus size={14} />
            </button>
          </div>

          {/* Map Mode Toggle (Satelite / Vetor) */}
          <div className="absolute top-3 right-3 z-500 shadow-md rounded-xl overflow-hidden border border-slate-200 flex bg-white p-1 gap-1">
            <button
              type="button"
              onClick={() => changeMapMode('streets')}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border-none flex items-center gap-1 ${
                mapMode === 'streets' ? 'bg-[#0E2B64] text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MapIcon size={11} /> Vetor
            </button>
            <button
              type="button"
              onClick={() => changeMapMode('satellite')}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border-none flex items-center gap-1 ${
                mapMode === 'satellite' ? 'bg-[#0E2B64] text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 15-6.7L18 5M21 12a9 9 0 0 1-15 6.7L6 19M12 3v18M3 12h18" />
              </svg>
              Satélite
            </button>
          </div>

          {/* Leaflet Dynamic Map Container */}
          <div ref={mapContainerRef} className="w-full h-full z-10"></div>
          
          {!mapInitialized && (
            <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-3 z-20">
              <div className="w-8 h-8 border-4 border-[#0E2B64] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Carregando Mapa Funcional de Luanda...</p>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="flex-1 flex items-center gap-2 border border-slate-200 focus-within:border-indigo-500 rounded-xl px-3 py-2 bg-slate-50/50">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar hospital, clínica ou município..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Especialidade:</span>
          <select
            value={selectedSpecialty}
            onChange={e => setSelectedSpecialty(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-indigo-500 outline-none"
          >
            {allSpecialties.map((spec, i) => (
              <option key={i} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hospital Triage Alert Hook */}
      {activeEvaluation && !activeEvaluation.submittedHospitalId && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="space-y-1">
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase rounded-lg tracking-wider">Triagem Ativa</span>
            <h3 className="text-xs font-extrabold text-slate-900 leading-tight">Deseja enviar o seu último relatório clínico autónomo para um hospital?</h3>
            <p className="text-[11px] text-slate-500">Selecione qualquer unidade listada abaixo para carregar as suas informações.</p>
          </div>
          <span className="text-[10.5px] font-bold text-indigo-600 flex items-center gap-1 shrink-0 bg-white border border-indigo-200 px-3 py-1.5 rounded-xl">
            Sintoma: {activeEvaluation.symptoms.substring(0, 20)}...
          </span>
        </div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHospitals.map(h => {
          const isSelectedForTriage = activeEvaluation && !activeEvaluation.submittedHospitalId;
          const hasReportSent = activeEvaluation && activeEvaluation.submittedHospitalId === h.id;

          return (
            <motion.div
              layout
              key={h.id}
              id={`hospital-card-${h.id}`}
              className="bg-white border border-slate-200/80 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-2xs transition-all duration-300 flex flex-col gap-4 group"
            >
              {/* Card Header row with Title and Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Hospital size={20} />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">{h.hours}</span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight leading-tight">
                      {h.name}
                    </h3>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  {isSelectedForTriage ? (
                    <button
                      onClick={() => handleSendReport(h.id, h.name)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-[#2979FF] hover:bg-[#2962FF] text-white font-extrabold text-[11px] md:text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      {sentHospitalId === h.id ? (
                        <>
                          <CheckCircle2 size={14} /> Enviado!
                        </>
                      ) : (
                        <>
                          Enviar Relatório <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  ) : hasReportSent ? (
                    <span className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 size={14} /> Relatório Enviado
                    </span>
                  ) : (
                    <>
                      <a
                        href={`https://wa.me/244923000${h.id.replace('h', '')}0`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-[#00E676] hover:bg-[#00c853] text-white font-extrabold text-[11px] md:text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        <MessageSquare size={14} className="fill-white/20" />
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${900000000 + parseInt(h.id.replace('h', ''))}`}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-[#2979FF] hover:bg-[#2962FF] text-white font-extrabold text-[11px] md:text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        <Phone size={14} />
                        Ligar
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Contact Information Details */}
              <div className="space-y-2 text-left text-xs md:text-[13px] font-semibold text-slate-600 pl-1">
                <div className="flex items-center gap-2.5">
                  <MapPin size={16} className="text-slate-400 shrink-0" />
                  <span>Município: <b className="text-slate-700 font-bold">{h.municipality}</b> ({h.distance})</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock size={16} className="text-slate-400 shrink-0" />
                  <span>Tempo de Espera: <b className="text-indigo-600 font-bold">{h.avgWaitTime}</b></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Stethoscope size={16} className="text-slate-400 shrink-0" />
                  <span>Corpo Clínico: <b className="text-teal-600 font-bold">{h.doctorsCount} Médicos</b></span>
                </div>
                
                <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Especialidades Integradas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {h.specialties.map((spec, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-50/50 text-[#0E2B64] rounded-lg text-[9.5px] font-bold border border-indigo-100/30">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Emergency Alert Row */}
              <div
                id={`hospital-emergency-${h.id}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 border border-red-700 rounded-2xl text-white text-xs font-bold mt-auto"
              >
                <AlertCircle size={15} className="text-white shrink-0" />
                <span>Emergência: 112</span>
              </div>
            </motion.div>
          );
        })}

        {filteredHospitals.length === 0 && (
          <div className="col-span-2 py-12 text-center text-slate-400 space-y-1 bg-white border border-slate-200 rounded-2xl">
            <Hospital size={36} className="mx-auto text-slate-300" />
            <p className="text-xs font-black uppercase tracking-wider">Nenhum hospital encontrado</p>
            <p className="text-[10px]">Tente redefinir a sua busca ou trocar de especialidade.</p>
          </div>
        )}
      </div>

    </div>
  );
}
