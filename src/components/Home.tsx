import React from 'react';
import { Sparkles, Flame, Award, ShieldCheck, Heart } from 'lucide-react';
import { resolveImageUrl } from '../utils/imageHelper';

interface HomeProps {
  cardCount: number;
}

export const Home: React.FC<HomeProps> = ({ cardCount }) => {
  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 py-4 sm:py-8 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] overflow-hidden">
      {/* ========================================================
          MAIN HERO SECTION (GRID: PACK WITH STAR + WELCOME TEXT)
         ======================================================== */}
      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* LEFT COLUMN: BIG INCLINED BOOSTER PACK WITH BACKGROUND GLOWING STAR */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative select-none pointer-events-none">
          {/* GIANT GLOWING BACKGROUND STAR */}
          <div className="relative flex items-center justify-center">
            {/* Ambient Star Glow */}
            <div className="absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-gradient-to-tr from-[#F50B8C]/35 via-[#610F4E]/40 to-[#290A30]/50 blur-2xl animate-pulse" />
            
            {/* Giant Geometric Star SVG */}
            <svg
              viewBox="0 0 200 200"
              className="w-72 sm:w-96 md:w-[420px] h-72 sm:h-96 md:h-[420px] text-[#F50B8C]/25 animate-[spin_60s_linear_infinite] drop-shadow-[0_0_35px_rgba(245,11,140,0.4)]"
            >
              {/* Outer 8-Point Star */}
              <polygon
                points="100,5 125,75 195,100 125,125 100,195 75,125 5,100 75,75"
                fill="url(#starGradient1)"
                stroke="rgba(245, 11, 140, 0.4)"
                strokeWidth="1.5"
              />
              {/* Inner 4-Point Star Offset */}
              <polygon
                points="100,25 140,85 175,100 140,115 100,175 60,115 25,100 60,85"
                fill="url(#starGradient2)"
                opacity="0.6"
              />
              <defs>
                <linearGradient id="starGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F50B8C" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#610F4E" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#290A30" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="starGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff6ebb" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#610F4E" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>

            {/* Central Radiant Light Burst */}
            <div className="absolute w-40 h-40 bg-[#F50B8C]/25 rounded-full blur-xl" />

            {/* THE TILTED BOOSTER PACK IMAGE (Fixed inclination, no mouse hover tilt) */}
            <div className="absolute z-20 transform -rotate-6 select-none pointer-events-none">
              <div className="relative w-[240px] sm:w-[280px] md:w-[310px] aspect-[2/3] filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] drop-shadow-[0_0_30px_rgba(245,11,140,0.35)]">
                <img
                  src={resolveImageUrl('/cards/Imagen_Sobre_3.png')}
                  alt="Sobre Oficial EvilTokkii TCG"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-3 -right-2 bg-gradient-to-r from-[#F50B8C] to-[#b80869] text-white px-3.5 py-1 rounded-full text-xs font-black shadow-lg shadow-[#F50B8C]/40 border border-[#ff6ebb]/60 flex items-center gap-1.5 transform rotate-3">
                <Flame className="w-3.5 h-3.5 fill-current text-[#F9F1F9]" />
                <span>1ª EDICIÓN OFICIAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WELCOME TEXT & INSPIRATIONAL REVIEW */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5">
          
          {/* Header Tag Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#610F4E]/80 border border-[#F50B8C]/50 shadow-inner">
            <Sparkles className="w-4 h-4 text-[#F50B8C]" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#F9F1F9]">
              Bienvenido al Coleccionable Oficial
            </span>
            <Sparkles className="w-4 h-4 text-[#F50B8C]" />
          </div>

          {/* Main Title */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#F9F1F9] tracking-tight leading-tight">
              Primer Set de Cartas de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F50B8C] via-[#ff6ebb] to-[#e879f9] drop-shadow-[0_0_25px_rgba(245,11,140,0.4)]">
                EvilTokkii
              </span>
            </h1>
            <p className="text-sm sm:text-base font-semibold text-[#F50B8C] font-mono">
              ★ Edición GoodTokkii • Colección Exclusiva 2026 ★
            </p>
          </div>

          {/* Inspirational Review & Motivational Lore */}
          <div className="relative bg-[#290A30]/85 backdrop-blur-md border border-[#610F4E] rounded-2xl p-5 sm:p-6 shadow-xl space-y-3.5">
            <p className="text-sm sm:text-base text-[#F9F1F9] leading-relaxed">
              Adéntrate en el vibrante universo de <strong className="text-white font-bold">EvilTokkii</strong> con el lanzamiento histórico de su primera edición oficial. Cada sobre es un portal a momentos memorables, ilustraciones deslumbrantes y cartas cargadas de magia y poder.
            </p>

            <p className="text-xs sm:text-sm text-[#B894B3] leading-relaxed italic border-l-2 border-[#F50B8C] pl-3.5 py-0.5">
              &ldquo;No es solo un juego de cartas, es la emoción de abrir un sobre, sentir el brillo de un holograma legendario y ser de los primeros en forjar una colección que quedará en la historia.&rdquo;
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
              <div className="bg-[#31213D]/90 border border-[#610F4E] rounded-xl p-2.5 flex flex-col items-center text-center">
                <Award className="w-5 h-5 text-[#F50B8C] mb-1" />
                <span className="text-xs sm:text-sm font-black text-[#F9F1F9]">{cardCount}+ Cartas</span>
                <span className="text-[10px] text-[#B894B3]">Total en el Set</span>
              </div>
              
              <div className="bg-[#31213D]/90 border border-[#610F4E] rounded-xl p-2.5 flex flex-col items-center text-center">
                <Sparkles className="w-5 h-5 text-[#ff6ebb] mb-1" />
                <span className="text-xs sm:text-sm font-black text-[#F9F1F9]">6 Rarezas</span>
                <span className="text-[10px] text-[#B894B3]">Foil y Efectos</span>
              </div>

              <div className="bg-[#31213D]/90 border border-[#610F4E] rounded-xl p-2.5 flex flex-col items-center text-center">
                <ShieldCheck className="w-5 h-5 text-[#34d399] mb-1" />
                <span className="text-xs sm:text-sm font-black text-[#F9F1F9]">100% Original</span>
                <span className="text-[10px] text-[#B894B3]">Edición Especial</span>
              </div>
            </div>
          </div>

          {/* Subtext info */}
          <div className="flex items-center gap-2 text-xs text-[#B894B3] pt-1">
            <Heart className="w-3.5 h-3.5 text-[#F50B8C] fill-current" />
            <span>Creado con dedicación para toda la comunidad coleccionista de EvilTokkii</span>
          </div>

        </div>

      </div>
    </div>
  );
};
