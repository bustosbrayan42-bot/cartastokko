import React, { useState } from 'react';
import {
  ScrollText,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Package,
  Percent,
  Award,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  HelpCircle,
} from 'lucide-react';
import type { Rarity } from '../types/card';

interface DropRateItem {
  rarity: Rarity;
  name: string;
  shortName: string;
  stars: number;
  percentage: string;
  fraction: string;
  color: string;
  bgBadge: string;
  borderColor: string;
  foilStyle: string;
  description: string;
}

const DROP_RATES: DropRateItem[] = [
  {
    rarity: 'common',
    name: 'Común',
    shortName: 'C',
    stars: 1,
    percentage: '55.0%',
    fraction: '~11 de cada 20 cartas',
    color: '#94a3b8',
    bgBadge: 'bg-slate-800/80 text-slate-300 border-slate-600',
    borderColor: '#64748b',
    foilStyle: 'Sin foil (Acabado mate)',
    description: 'Ilustración estándar con marco clásico equilibrado. Base fundamental de toda la colección.',
  },
  {
    rarity: 'uncommon',
    name: 'Poco Común',
    shortName: 'UC',
    stars: 2,
    percentage: '25.0%',
    fraction: '~1 de cada 4 cartas',
    color: '#38bdf8',
    bgBadge: 'bg-sky-950/80 text-sky-300 border-sky-500',
    borderColor: '#0284c7',
    foilStyle: 'Wave Refraction (65% foil, 28% glare)',
    description: 'Lámina holográfica con ondas concéntricas refractantes y brillo dinámico de agua.',
  },
  {
    rarity: 'rare',
    name: 'Rara',
    shortName: 'R',
    stars: 3,
    percentage: '12.0%',
    fraction: '~1 de cada 8 cartas',
    color: '#a855f7',
    bgBadge: 'bg-purple-950/80 text-purple-300 border-purple-500',
    borderColor: '#7e22ce',
    foilStyle: 'Holo Glitter Spark (100% foil, 18% glare)',
    description: 'Efecto holográfico glitter con destellos diagonales iridiscentes de alta saturación.',
  },
  {
    rarity: 'super_rare',
    name: 'Súper Rara',
    shortName: 'SR',
    stars: 4,
    percentage: '5.0%',
    fraction: '~1 de cada 20 cartas',
    color: '#e5c158',
    bgBadge: 'bg-amber-950/70 text-amber-200 border-amber-500/50',
    borderColor: '#b59346',
    foilStyle: 'Gold Starlight (80% foil, 28% glare)',
    description: 'Acabado dorado champán con microestrellas titilantes y marco metálico cálido.',
  },
  {
    rarity: 'ultra_rare',
    name: 'Ultra Rara',
    shortName: 'UR',
    stars: 5,
    percentage: '2.2%',
    fraction: '~1 de cada 45 cartas',
    color: '#ec4899',
    bgBadge: 'bg-pink-950/80 text-pink-300 border-pink-500',
    borderColor: '#db2777',
    foilStyle: 'Secret Gold Mythic (70% foil, 20% glare) • Full Art',
    description: 'Diseño sin marco (Full Art) con lámina dorada mística y aura fucsia reluciente.',
  },
  {
    rarity: 'secret_rare',
    name: 'Rara Secreta',
    shortName: 'SEC',
    stars: 6,
    percentage: '0.8%',
    fraction: '~1 de cada 125 cartas',
    color: '#10b981',
    bgBadge: 'bg-emerald-950/90 text-emerald-300 border-emerald-400',
    borderColor: '#059669',
    foilStyle: 'Prismatic Laser Masterpiece (90% foil, 20% glare) • Full Art',
    description: 'Máxima cúspide coleccionista. Formato Full Art con espectro láser arcoíris y partículas míticas.',
  },
];

export const PoliciesView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'probabilities' | 'packs' | 'exchange' | 'terms'>('probabilities');

  return (
    <div className="w-full max-w-[1550px] mx-auto px-2 sm:px-6 py-4 space-y-6 animate-in fade-in duration-300">
      {/* ========================================================
          HERO BANNER
         ======================================================== */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#290A30] via-[#31213D] to-[#290A30] border-2 border-[#610F4E] p-6 sm:p-8 shadow-2xl">
        {/* Glow ambient background effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F50B8C]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#610F4E]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#610F4E]/90 border border-[#F50B8C]/50 text-[#F9F1F9] text-xs font-bold shadow-sm">
              <ScrollText className="w-3.5 h-3.5 text-[#F50B8C]" />
              <span>Reglamento y Transparencia Oficial</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#F9F1F9] tracking-wide">
              Políticas, Normas & Probabilidades del TCG
            </h1>
            <p className="text-sm sm:text-base text-[#B894B3] max-w-3xl leading-relaxed">
              Conoce en detalle el funcionamiento del sistema de cartas coleccionables de EvilTokkii: tasas de drop garantizadas, reglas de canje de repetidas y directrices de juego limpio.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#290A30]/90 border border-[#610F4E] p-3 rounded-2xl shrink-0 shadow-lg">
            <ShieldCheck className="w-8 h-8 text-[#F50B8C]" />
            <div>
              <span className="text-xs font-bold text-[#F9F1F9] block">100% Auditado</span>
              <span className="text-[11px] text-[#B894B3] block">Generación Aleatoria Justa</span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="relative z-10 flex items-center gap-2 pt-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSection('probabilities')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border ${
              activeSection === 'probabilities'
                ? 'bg-gradient-to-r from-[#610F4E] to-[#F50B8C] text-white border-[#F50B8C] shadow-md shadow-[#F50B8C]/25 scale-105'
                : 'bg-[#31213D]/80 text-[#B894B3] hover:text-[#F9F1F9] border-[#610F4E]/80 hover:bg-[#610F4E]/40'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>Probabilidades de Drop</span>
          </button>

          <button
            onClick={() => setActiveSection('packs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border ${
              activeSection === 'packs'
                ? 'bg-gradient-to-r from-[#610F4E] to-[#F50B8C] text-white border-[#F50B8C] shadow-md shadow-[#F50B8C]/25 scale-105'
                : 'bg-[#31213D]/80 text-[#B894B3] hover:text-[#F9F1F9] border-[#610F4E]/80 hover:bg-[#610F4E]/40'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Obtención de Sobres</span>
          </button>

          <button
            onClick={() => setActiveSection('exchange')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border ${
              activeSection === 'exchange'
                ? 'bg-gradient-to-r from-[#610F4E] to-[#F50B8C] text-white border-[#F50B8C] shadow-md shadow-[#F50B8C]/25 scale-105'
                : 'bg-[#31213D]/80 text-[#B894B3] hover:text-[#F9F1F9] border-[#610F4E]/80 hover:bg-[#610F4E]/40'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Canje de Repetidas</span>
          </button>

          <button
            onClick={() => setActiveSection('terms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border ${
              activeSection === 'terms'
                ? 'bg-gradient-to-r from-[#610F4E] to-[#F50B8C] text-white border-[#F50B8C] shadow-md shadow-[#F50B8C]/25 scale-105'
                : 'bg-[#31213D]/80 text-[#B894B3] hover:text-[#F9F1F9] border-[#610F4E]/80 hover:bg-[#610F4E]/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Juego Limpio & Términos</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SECTION 1: PROBABILIDADES DE DROP (DROP RATES)
         ======================================================== */}
      {activeSection === 'probabilities' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#F9F1F9] tracking-wide flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F50B8C]" />
                Esquema de Probabilidades de Rareza
              </h2>
              <p className="text-xs sm:text-sm text-[#B894B3] mt-0.5">
                Tasas de aparición por carta individual al abrir cualquier sobre de la colección.
              </p>
            </div>
            <div className="px-3 py-1 rounded-xl bg-[#290A30] border border-[#610F4E] text-xs font-mono text-[#F50B8C] font-bold">
              Total Colección: 140 Cartas (Set Génesis)
            </div>
          </div>

          {/* Cards Grid of Drop Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DROP_RATES.map((item) => (
              <div
                key={item.rarity}
                className="bg-[#290A30]/90 border-2 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-xl flex flex-col justify-between group"
                style={{ borderColor: item.borderColor }}
              >
                {/* Background accent glow */}
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-15 filter blur-2xl pointer-events-none transition-opacity group-hover:opacity-30"
                  style={{ backgroundColor: item.color }}
                />

                <div className="space-y-3">
                  {/* Top Bar: Rarity badge & Percentage */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-1 rounded-xl text-xs font-black uppercase font-mono border"
                        style={{
                          backgroundColor: `${item.color}20`,
                          color: item.color,
                          borderColor: `${item.color}60`,
                        }}
                      >
                        {item.shortName} • {item.name}
                      </span>
                      <span className="text-xs tracking-tighter" style={{ color: item.color }}>
                        {'★'.repeat(item.stars)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black font-mono" style={{ color: item.color }}>
                        {item.percentage}
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div>
                    <div className="w-full h-2 bg-[#31213D] rounded-full overflow-hidden border border-[#610F4E]/60">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: item.percentage,
                          backgroundColor: item.color,
                          boxShadow: `0 0 10px ${item.color}`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-[#B894B3] mt-1 block">
                      Frecuencia estimada: <span className="text-[#F9F1F9] font-bold">{item.fraction}</span>
                    </span>
                  </div>

                  {/* Foil & Description */}
                  <div className="pt-2 border-t border-[#610F4E]/60 space-y-1.5">
                    <div className="text-[11px] font-mono text-[#F9F1F9] flex items-center gap-1.5">
                      <span className="text-[#B894B3]">Acabado:</span>
                      <span className="font-bold text-[#F50B8C]">{item.foilStyle}</span>
                    </div>
                    <p className="text-xs text-[#B894B3] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Guarantees Box */}
          <div className="p-5 rounded-2xl bg-[#31213D]/80 border border-[#610F4E] flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-[#610F4E] border border-[#F50B8C]/40 flex items-center justify-center text-[#F50B8C] shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#F9F1F9]">Garantía de Imparcialidad en Aperturas</h3>
              <p className="text-xs text-[#B894B3] leading-relaxed">
                Cada carta generada en un sobre se calcula de manera individual e independiente mediante algoritmos criptográficos en el servidor. La probabilidad no se altera en función del historial del usuario ni de compras previas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 2: OBTENCIÓN DE SOBRES (PACKS SYSTEM)
         ======================================================== */}
      {activeSection === 'packs' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F9F1F9] tracking-wide flex items-center gap-2">
              <Package className="w-5 h-5 text-[#F50B8C]" />
              Sistema de Sobres & Modalidades
            </h2>
            <p className="text-xs sm:text-sm text-[#B894B3] mt-0.5">
              Descubre los tipos de sobres disponibles y cómo conseguirlos durante las transmisiones y dinámicas.
            </p>
          </div>

          {/* 3 Pack Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pack 1 */}
            <div className="bg-[#290A30]/90 border border-[#610F4E] rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#610F4E] to-[#9146FF] flex items-center justify-center text-white shadow-md">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#B894B3] block">Nivel Básico</span>
                  <h3 className="text-xl font-black text-[#F9F1F9]">Sobre Individual</h3>
                  <span className="text-xs font-mono font-bold text-[#F50B8C]">1 Carta por sobre</span>
                </div>
                <p className="text-xs text-[#B894B3] leading-relaxed">
                  Ideal para participaciones rápidas, mini-juegos de chat en vivo y recompensas instantáneas de baja barrera.
                </p>
              </div>

              <div className="pt-3 border-t border-[#610F4E] text-[11px] text-[#F9F1F9] space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Obtención: Recompensas rápidas y drops de stream.</span>
                </div>
              </div>
            </div>

            {/* Pack 3 */}
            <div className="bg-[#290A30]/90 border-2 border-[#F50B8C]/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden ring-1 ring-[#F50B8C]/40">
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#F50B8C] text-white text-[10px] font-black uppercase tracking-wider shadow">
                Más Popular
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#610F4E] to-[#F50B8C] flex items-center justify-center text-white shadow-md">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#F50B8C] block">Nivel Estándar</span>
                  <h3 className="text-xl font-black text-[#F9F1F9]">Sobre Estándar</h3>
                  <span className="text-xs font-mono font-bold text-[#F50B8C]">3 Cartas por sobre</span>
                </div>
                <p className="text-xs text-[#B894B3] leading-relaxed">
                  El formato principal del juego. Es la recompensa oficial obtenida mediante el canje de cartas repetidas en el Álbum.
                </p>
              </div>

              <div className="pt-3 border-t border-[#610F4E] text-[11px] text-[#F9F1F9] space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Obtención: Canje de Repetidas + Eventos de Twitch.</span>
                </div>
              </div>
            </div>

            {/* Pack 5 */}
            <div className="bg-[#290A30]/90 border border-[#610F4E] rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#610F4E] via-[#F50B8C] to-amber-400 flex items-center justify-center text-white shadow-md">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 block">Nivel Coleccionista</span>
                  <h3 className="text-xl font-black text-[#F9F1F9]">Sobre Premium</h3>
                  <span className="text-xs font-mono font-bold text-amber-300">5 Cartas por sobre</span>
                </div>
                <p className="text-xs text-[#B894B3] leading-relaxed">
                  Paquete exclusivo reservado para hitos especiales, torneos de comunidad, metas de subs y grandes sorteos.
                </p>
              </div>

              <div className="pt-3 border-t border-[#610F4E] text-[11px] text-[#F9F1F9] space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Obtención: Metas globales y torneos especiales.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 3: CANJE DE CARTAS REPETIDAS (EXCHANGE)
         ======================================================== */}
      {activeSection === 'exchange' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F9F1F9] tracking-wide flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#F50B8C]" />
              Normativa del Sistema de Canje de Repetidas
            </h2>
            <p className="text-xs sm:text-sm text-[#B894B3] mt-0.5">
              Transforma tus cartas duplicadas en nuevos sobres de 3 cartas sin perder tu colección del álbum.
            </p>
          </div>

          {/* Safeguard Alert Rule */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#610F4E]/80 to-[#290A30] border-2 border-[#F50B8C]/60 flex items-start gap-4 shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-[#F50B8C] text-white flex items-center justify-center shrink-0 shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#F9F1F9] flex items-center gap-2">
                <span>Regla de Salvaguarda Coleccionista (Inviolable)</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#F9F1F9]/90 leading-relaxed">
                El sistema de canje está programado para <strong className="text-[#F50B8C]">NUNCA eliminar la última copia</strong> de una carta que poseas. Solo se toman las copias sobrantes (duplicados exactos: <code className="bg-black/40 px-1 py-0.5 rounded text-[#F50B8C] font-mono">cantidad - 1</code>), de modo que tu progreso en el Álbum permanecerá siempre al 100% protegido.
              </p>
            </div>
          </div>

          {/* Exchange Table */}
          <div className="bg-[#290A30]/90 border border-[#610F4E] rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-[#F9F1F9]">Tabla Oficial de Equivalencias de Canje</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Common Tier */}
              <div className="p-4 rounded-2xl bg-[#31213D]/80 border border-slate-600 flex flex-col items-center text-center space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-xs">
                  Comunes (C)
                </span>
                <span className="text-3xl font-black text-slate-300 font-mono">10</span>
                <span className="text-xs text-[#B894B3]">Cartas repetidas</span>
                <div className="w-full pt-2 border-t border-slate-700/60 flex items-center justify-center gap-1.5 text-xs font-bold text-[#F50B8C]">
                  <Package className="w-3.5 h-3.5" />
                  <span>1 Sobre de 3 Cartas</span>
                </div>
              </div>

              {/* Uncommon Tier */}
              <div className="p-4 rounded-2xl bg-[#31213D]/80 border border-sky-500 flex flex-col items-center text-center space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-300 font-bold text-xs">
                  Poco Comunes (UC)
                </span>
                <span className="text-3xl font-black text-sky-400 font-mono">8</span>
                <span className="text-xs text-[#B894B3]">Cartas repetidas</span>
                <div className="w-full pt-2 border-t border-sky-800/60 flex items-center justify-center gap-1.5 text-xs font-bold text-[#F50B8C]">
                  <Package className="w-3.5 h-3.5" />
                  <span>1 Sobre de 3 Cartas</span>
                </div>
              </div>

              {/* Rare Tier */}
              <div className="p-4 rounded-2xl bg-[#31213D]/80 border border-purple-500 flex flex-col items-center text-center space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 font-bold text-xs">
                  Raras (R)
                </span>
                <span className="text-3xl font-black text-purple-400 font-mono">6</span>
                <span className="text-xs text-[#B894B3]">Cartas repetidas</span>
                <div className="w-full pt-2 border-t border-purple-800/60 flex items-center justify-center gap-1.5 text-xs font-bold text-[#F50B8C]">
                  <Package className="w-3.5 h-3.5" />
                  <span>1 Sobre de 3 Cartas</span>
                </div>
              </div>

              {/* Super Rare Tier */}
              <div className="p-4 rounded-2xl bg-[#31213D]/80 border border-amber-500 flex flex-col items-center text-center space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 font-bold text-xs">
                  Súper Raras (SR)
                </span>
                <span className="text-3xl font-black text-amber-400 font-mono">5</span>
                <span className="text-xs text-[#B894B3]">Cartas repetidas</span>
                <div className="w-full pt-2 border-t border-amber-800/60 flex items-center justify-center gap-1.5 text-xs font-bold text-[#F50B8C]">
                  <Package className="w-3.5 h-3.5" />
                  <span>1 Sobre de 3 Cartas</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#B894B3] italic pt-2 text-center">
              * Nota: Las cartas Ultra Raras y Secretas no admiten canje automatizado debido a su estatus de pieza de colección única.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 4: JUEGO LIMPIO & TÉRMINOS (TERMS & FAIR PLAY)
         ======================================================== */}
      {activeSection === 'terms' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F9F1F9] tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#F50B8C]" />
              Términos de Uso, Propiedad & Juego Limpio
            </h2>
            <p className="text-xs sm:text-sm text-[#B894B3] mt-0.5">
              Directrices legales y de convivencia comunitaria para todos los participantes de EvilTokkii TCG.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* IP & Copyright */}
            <div className="bg-[#290A30]/90 border border-[#610F4E] rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2.5 text-[#F50B8C] font-black text-base">
                <Award className="w-5 h-5" />
                <span>Propiedad Intelectual & Derechos de Autor</span>
              </div>
              <p className="text-xs sm:text-sm text-[#B894B3] leading-relaxed">
                Todas las ilustraciones, artes, personajes (EvilTokkii), nombres de ataques, elementos gráficos y sonidos son creaciones exclusivas y están protegidos por las leyes de propiedad intelectual internacionales (Copyright © 2026).
              </p>
              <p className="text-xs text-[#B894B3] leading-relaxed">
                Queda estrictamente prohibida la comercialización no autorizada, reventa, impresión física comercial o uso con fines de lucro fuera de los canales oficiales de EvilTokkii.
              </p>
            </div>

            {/* Fair Play & Security */}
            <div className="bg-[#290A30]/90 border border-[#610F4E] rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2.5 text-amber-400 font-black text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Política Anti-Trampas & Fair Play</span>
              </div>
              <p className="text-xs sm:text-sm text-[#B894B3] leading-relaxed">
                El sistema cuenta con auditoría continua en base de datos. Se prohíbe taxativamente el uso de bots, scripts de apertura automática, explotación de errores (exploits) o creación de cuentas múltiples fraudulentas de Twitch.
              </p>
              <p className="text-xs text-[#B894B3] leading-relaxed">
                Cualquier cuenta detectada realizando acciones sospechosas será sometida a revisión y podrá ser descalificada, restableciendo su colección a cero.
              </p>
            </div>

            {/* Nature of Collectibles */}
            <div className="bg-[#290A30]/90 border border-[#610F4E] rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2.5 text-sky-400 font-black text-base">
                <Info className="w-5 h-5" />
                <span>Naturaleza del Coleccionable Digital</span>
              </div>
              <p className="text-xs sm:text-sm text-[#B894B3] leading-relaxed">
                Las cartas y sobres de EvilTokkii TCG son artículos virtuales de entretenimiento y fidelización comunitaria. No constituyen instrumentos financieros ni representan criptoactivos o inversiones monetarias.
              </p>
            </div>

            {/* Support & Community */}
            <div className="bg-[#290A30]/90 border border-[#610F4E] rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-400 font-black text-base">
                <HelpCircle className="w-5 h-5" />
                <span>Soporte & Asistencia</span>
              </div>
              <p className="text-xs sm:text-sm text-[#B894B3] leading-relaxed">
                Si experimentas cualquier anomalía durante la apertura de sobres, el registro de cartas o el canje de repetidas, puedes comunicarte directamente con el equipo de moderación a través de las transmisiones en vivo de Twitch o el servidor oficial de Discord.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
