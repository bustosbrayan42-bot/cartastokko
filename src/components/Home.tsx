import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  ShieldCheck,
  Heart,
  Crown,
  Trophy,
  Star,
} from 'lucide-react';
import { resolveImageUrl } from '../utils/imageHelper';
import type { CardData } from '../types/card';
import { TcgCard } from './TcgCard';
import { DEFAULT_CARDS } from '../data/defaultCards';

interface HomeProps {
  cardCount: number;
  goldenCard?: CardData;
  onNavigateToPacks?: () => void;
  onNavigateToBinder?: () => void;
}

export const Home: React.FC<HomeProps> = ({
  cardCount,
  goldenCard,
}) => {
  // 0: Vista Sobre GoodTokkii | 1: Vista Descriptiva Carta Dorada | 2: Vista TokkiiPass Premium
  const [currentSlide, setCurrentSlide] = useState<0 | 1 | 2>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Active Golden Card reference
  const activeGoldenCard: CardData =
    goldenCard ||
    DEFAULT_CARDS.find((c) => c.rarity === 'golden_epic') ||
    DEFAULT_CARDS[DEFAULT_CARDS.length - 1];

  // ----------------------------------------------------
  // PARÁMETROS DEFINITIVOS DE TOKKIIPASS PREMIUM
  // ----------------------------------------------------
  const passScale = 2;
  const passOffsetX = -43;
  const passOffsetY = 245;
  const passRotation = -4;

  const cropTop = 0;
  const cropBottom = 48;
  const cropRight = 0;

  const fadeTop = 16;
  const fadeBottom = 6;
  const fadeRight = 11;

  // Cálculo de máscaras definitivas
  const vStartSolid = Math.min(100, cropTop + fadeTop);
  const vEndSolid = Math.max(vStartSolid, 100 - cropBottom - fadeBottom);
  const vEndFade = Math.max(vEndSolid, 100 - cropBottom);
  const verticalMask = `linear-gradient(to bottom, transparent 0%, black ${vStartSolid}%, black ${vEndSolid}%, transparent ${vEndFade}%, transparent 100%)`;

  const hEndSolid = Math.max(0, 100 - cropRight - fadeRight);
  const hEndFade = Math.max(hEndSolid, 100 - cropRight);
  const horizontalMask = `linear-gradient(to right, black 0%, black ${hEndSolid}%, transparent ${hEndFade}%, transparent 100%)`;

  // Transición constante e ininterrumpida cada 8 segundos rotando entre las 3 vistas
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => ((prev + 1) % 3 as 0 | 1 | 2));
    }, 8000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSlideChange = (index: 0 | 1 | 2) => {
    setCurrentSlide(index);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => ((prev + 1) % 3 as 0 | 1 | 2));
      }, 8000);
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-8 py-1 sm:py-2 flex flex-col items-center justify-center flex-1 my-auto">
      {/* ========================================================
          SLIDER CONTAINER: Grid overlay with smooth 700ms cross-fade & soft offset
         ======================================================== */}
      <div className="relative z-10 w-full grid grid-cols-1 items-center">
        {/* ----------------------------------------------------
            SLIDE 0: VISTA SOBRE OFICIAL GOODTOKKII
            (Visual a la izquierda col-5 / Contenido a la derecha col-7)
           ---------------------------------------------------- */}
        <div
          className={`col-start-1 row-start-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center transition-all duration-700 ease-in-out ${
            currentSlide === 0
              ? 'opacity-100 translate-x-0 pointer-events-auto blur-0'
              : 'opacity-0 -translate-x-6 pointer-events-none blur-xs'
          }`}
        >
          {/* LEFT COLUMN: BIG INCLINED BOOSTER PACK WITH BACKGROUND GLOWING STAR */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative select-none pointer-events-none">
            <div className="relative flex items-center justify-center">
              {/* Ambient Star Glow */}
              <div className="absolute w-72 sm:w-88 md:w-96 h-72 sm:h-88 md:h-96 rounded-full bg-gradient-to-tr from-[#F50B8C]/35 via-[#610F4E]/40 to-[#290A30]/50 blur-2xl animate-pulse" />

              {/* Giant Geometric Star SVG */}
              <svg
                viewBox="0 0 200 200"
                className="w-68 sm:w-88 md:w-[400px] h-68 sm:h-88 md:h-[400px] text-[#F50B8C]/25 animate-[spin_60s_linear_infinite] drop-shadow-[0_0_35px_rgba(245,11,140,0.4)]"
              >
                <polygon
                  points="100,5 125,75 195,100 125,125 100,195 75,125 5,100 75,75"
                  fill="url(#starGradient1)"
                  stroke="rgba(245, 11, 140, 0.4)"
                  strokeWidth="1.5"
                />
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

              {/* THE TILTED BOOSTER PACK IMAGE */}
              <div className="absolute z-20 transform -rotate-6 select-none pointer-events-none">
                <div className="relative w-[230px] sm:w-[260px] md:w-[290px] aspect-[2/3] filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] drop-shadow-[0_0_30px_rgba(245,11,140,0.35)]">
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
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            {/* Header Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#610F4E]/80 border border-[#F50B8C]/50 shadow-inner">
              <Sparkles className="w-4 h-4 text-[#F50B8C]" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#F9F1F9]">
                Bienvenido al Coleccionable Oficial
              </span>
              <Sparkles className="w-4 h-4 text-[#F50B8C]" />
            </div>

            {/* Main Title */}
            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#F9F1F9] tracking-tight leading-tight">
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
            <div className="relative bg-[#290A30]/85 backdrop-blur-md border border-[#610F4E] rounded-2xl p-5 sm:p-6 shadow-xl space-y-3.5 w-full">
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
                  <span className="text-xs sm:text-sm font-black text-[#F9F1F9]">7 Rarezas</span>
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
              <span>Creado con dedicación para toda la comunidad de EvilTokkii</span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------
            SLIDE 1: VISTA DESCRIPTIVA DE LA CARTA DORADA ÉPICA
            (Posición invertida: Contenido a la izquierda col-7 / Carta a la derecha col-5)
           ---------------------------------------------------- */}
        <div
          className={`col-start-1 row-start-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center transition-all duration-700 ease-in-out ${
            currentSlide === 1
              ? 'opacity-100 translate-x-0 pointer-events-auto blur-0'
              : 'opacity-0 translate-x-6 pointer-events-none blur-xs'
          }`}
        >
          {/* LEFT COLUMN: DESCRIPCIÓN Y FUNCIONALIDAD (Exact same dimensions and structure as Slide 0 right column) */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            {/* Header Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 border border-[#ffd700]/70 shadow-inner">
              <Crown className="w-4 h-4 text-[#ffd700] animate-bounce" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#fef08a]">
                Reliquia Suprema • Dorada Épica
              </span>
              <Sparkles className="w-4 h-4 text-[#ffd700]" />
            </div>

            {/* Main Golden Title */}
            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#F9F1F9] tracking-tight leading-tight">
                La Carta Dorada de{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#ffe066] to-[#f59e0b] drop-shadow-[0_0_25px_rgba(255,215,0,0.5)]">
                  Canje Único
                </span>
              </h1>
              <p className="text-sm sm:text-base font-semibold text-[#ffd700] font-mono flex items-center justify-center lg:justify-start gap-1.5">
                <Star className="w-4 h-4 text-[#ffd700] fill-current" />
                <span>1 Sola Carta por Edición • Desbloqueo Supremo del Álbum</span>
                <Star className="w-4 h-4 text-[#ffd700] fill-current" />
              </p>
            </div>

            {/* Descriptive & Functionality Box (Exact same padding & height as Slide 0) */}
            <div className="relative bg-gradient-to-b from-[#1c1404]/90 via-[#100b02]/95 to-[#1c1404]/90 backdrop-blur-md border border-[#ffd700]/60 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3.5 w-full">
              <p className="text-sm sm:text-base text-[#fef9c3] leading-relaxed">
                Forjada en oro puro con lámina holográfica metálica resplandeciente, la{' '}
                <strong className="text-[#ffd700] font-bold">GoodTokkii Dorada Épica (#141)</strong> es la joya máxima y más exclusiva de toda la colección oficial Tokkii TCG.
              </p>

              <p className="text-xs sm:text-sm text-[#fef08a] leading-relaxed italic border-l-2 border-[#ffd700] pl-3.5 py-0.5">
                &ldquo;Al salir en un sobre de 5 cartas, su poder áureo desbloquea automáticamente todas las 140 cartas (001 a 140) de la edición directamente en el álbum de cartas del usuario.&rdquo;
              </p>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
                <div className="bg-[#241a05]/90 border border-[#ffd700]/40 rounded-xl p-2.5 flex flex-col items-center text-center">
                  <Trophy className="w-5 h-5 text-[#ffd700] mb-1" />
                  <span className="text-xs sm:text-sm font-black text-white">100% Álbum</span>
                  <span className="text-[10px] text-[#fef08a]">Desbloqueo Total</span>
                </div>

                <div className="bg-[#241a05]/90 border border-[#ffd700]/40 rounded-xl p-2.5 flex flex-col items-center text-center">
                  <Sparkles className="w-5 h-5 text-amber-300 mb-1" />
                  <span className="text-xs sm:text-sm font-black text-white">0.1% Drop</span>
                  <span className="text-[10px] text-[#fef08a]">1 en 1.000 (Sobres 5)</span>
                </div>

                <div className="bg-[#241a05]/90 border border-[#ffd700]/40 rounded-xl p-2.5 flex flex-col items-center text-center">
                  <Crown className="w-5 h-5 text-yellow-400 mb-1" />
                  <span className="text-xs sm:text-sm font-black text-white">Canje Único</span>
                  <span className="text-[10px] text-[#fef08a]">1 por Edición</span>
                </div>
              </div>
            </div>

            {/* Subtext info (Without buttons, matching Slide 0 cleanly) */}
            <div className="flex items-center gap-2 text-xs text-[#fef08a] pt-1">
              <Crown className="w-3.5 h-3.5 text-[#ffd700]" />
              <span>Pieza suprema de canje oficial para la comunidad de EvilTokkii</span>
            </div>
          </div>

          {/* RIGHT COLUMN: CARTA DORADA (Fixed angle, no hover tilt, exact same star & container footprint as Slide 0 left column) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative select-none pointer-events-none">
            <div className="relative flex items-center justify-center">
              {/* Ambient Golden Glow */}
              <div className="absolute w-72 sm:w-88 md:w-96 h-72 sm:h-88 md:h-96 rounded-full bg-gradient-to-tr from-[#ffd700]/30 via-amber-500/35 to-yellow-600/20 blur-2xl animate-pulse" />

              {/* Giant Geometric Star SVG (Gold Edition) */}
              <svg
                viewBox="0 0 200 200"
                className="w-68 sm:w-88 md:w-[400px] h-68 sm:h-88 md:h-[400px] text-[#ffd700]/25 animate-[spin_60s_linear_infinite] drop-shadow-[0_0_40px_rgba(255,215,0,0.4)]"
              >
                <polygon
                  points="100,5 125,75 195,100 125,125 100,195 75,125 5,100 75,75"
                  fill="url(#goldStarGradient1)"
                  stroke="rgba(255, 215, 0, 0.45)"
                  strokeWidth="1.5"
                />
                <polygon
                  points="100,25 140,85 175,100 140,115 100,175 60,115 25,100 60,85"
                  fill="url(#goldStarGradient2)"
                  opacity="0.6"
                />
                <defs>
                  <linearGradient id="goldStarGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffd700" stopOpacity="0.55" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#78350f" stopOpacity="0.3" />
                  </linearGradient>
                  <linearGradient id="goldStarGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Central Radiant Gold Light Burst */}
              <div className="absolute w-40 h-40 bg-[#ffd700]/25 rounded-full blur-xl" />

              {/* CARTA DORADA: Fixed rotation, non-interactive, exact same container footprint as Slide 0 */}
              <div className="absolute z-20 transform rotate-6 select-none pointer-events-none">
                <div className="relative w-[230px] sm:w-[260px] md:w-[290px] aspect-[2/3] flex items-center justify-center filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] drop-shadow-[0_0_35px_rgba(255,215,0,0.45)]">
                  <div className="transform scale-[0.70] sm:scale-[0.80] md:scale-[0.88] origin-center">
                    <TcgCard card={activeGoldenCard} interactive={false} showBackFlipBtn={false} />
                  </div>
                </div>

                {/* Floating Golden Badge */}
                <div className="absolute -bottom-3 -right-2 bg-gradient-to-r from-amber-400 via-[#ffd700] to-amber-500 text-black px-3.5 py-1 rounded-full text-xs font-black shadow-lg shadow-amber-500/40 border border-yellow-200 flex items-center gap-1.5 transform -rotate-3 z-30">
                  <Crown className="w-3.5 h-3.5 fill-current text-black" />
                  <span>CANJE ÚNICO</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------
            SLIDE 2: VISTA TOKKIIPASS PREMIUM
            (Visual a la izquierda col-5 / Contenido a la derecha col-7)
           ---------------------------------------------------- */}
        <div
          className={`col-start-1 row-start-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center transition-all duration-700 ease-in-out ${
            currentSlide === 2
              ? 'opacity-100 translate-x-0 pointer-events-auto blur-0'
              : 'opacity-0 -translate-x-6 pointer-events-none blur-xs'
          }`}
        >
          {/* LEFT COLUMN: TOKKIIPASS IMAGE (Upper half with soft gradient fade) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative select-none pointer-events-none">
            <div className="relative flex items-center justify-center">
              {/* Ambient Gold & Pink Glow */}
              <div className="absolute w-72 sm:w-88 md:w-96 h-72 sm:h-88 md:h-96 rounded-full bg-gradient-to-tr from-amber-500/35 via-[#610F4E]/40 to-yellow-500/25 blur-2xl animate-pulse" />

              {/* Giant Geometric Star SVG (VIP Gold Theme) */}
              <svg
                viewBox="0 0 200 200"
                className="w-68 sm:w-88 md:w-[400px] h-68 sm:h-88 md:h-[400px] text-amber-400/25 animate-[spin_60s_linear_infinite] drop-shadow-[0_0_35px_rgba(245,158,11,0.4)]"
              >
                <polygon
                  points="100,5 125,75 195,100 125,125 100,195 75,125 5,100 75,75"
                  fill="url(#passStarGradient1)"
                  stroke="rgba(245, 158, 11, 0.45)"
                  strokeWidth="1.5"
                />
                <polygon
                  points="100,25 140,85 175,100 140,115 100,175 60,115 25,100 60,85"
                  fill="url(#passStarGradient2)"
                  opacity="0.6"
                />
                <defs>
                  <linearGradient id="passStarGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.55" />
                    <stop offset="50%" stopColor="#610F4E" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#290A30" stopOpacity="0.4" />
                  </linearGradient>
                  <linearGradient id="passStarGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fde047" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Central Radiant Light Burst */}
              <div className="absolute w-40 h-40 bg-amber-400/25 rounded-full blur-xl" />

              {/* TOKKIIPASS IMAGE: Libre sin contenedor que recorte al escalar */}
              <div className="absolute z-20 flex flex-col items-center justify-center select-none pointer-events-none">
                <div
                  className="relative flex items-center justify-center transition-transform duration-75"
                  style={{
                    transform: `translate(${passOffsetX}px, ${passOffsetY}px) scale(${passScale}) rotate(${passRotation}deg)`,
                    transformOrigin: 'center center',
                  }}
                >
                  <div
                    style={{
                      maskImage: verticalMask,
                      WebkitMaskImage: verticalMask,
                    }}
                  >
                    <div
                      style={{
                        maskImage: horizontalMask,
                        WebkitMaskImage: horizontalMask,
                      }}
                    >
                      <img
                        src={resolveImageUrl('/cards/Tokkii_Pass_ultima.png')}
                        alt="TokkiiPass Premium"
                        className="w-[300px] sm:w-[350px] md:w-[400px] max-w-none h-auto object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] drop-shadow-[0_0_25px_rgba(245,158,11,0.5)] pointer-events-none select-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: WELCOME TEXT & TOKKIIPASS PREMIUM DESCRIPTION */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            {/* Header Tag Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/60 shadow-inner">
              <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300">
                Beneficio Exclusivo • Nivel VIP
              </span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>

            {/* Main Title */}
            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#F9F1F9] tracking-tight leading-tight">
                Membresía Oficial{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                  TokkiiPass Premium
                </span>
              </h1>
              <p className="text-sm sm:text-base font-semibold text-amber-300 font-mono flex items-center justify-center lg:justify-start gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <span>Recompensas Diarias Duplicadas • Domingos de 5 Sobres</span>
                <Star className="w-4 h-4 text-amber-400 fill-current" />
              </p>
            </div>

            {/* Descriptive Box (Exact same padding & height as Slide 0 and Slide 1) */}
            <div className="relative bg-[#290A30]/85 backdrop-blur-md border border-amber-500/50 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3.5 w-full">
              <p className="text-sm sm:text-base text-amber-100 leading-relaxed">
                Multiplica tus recompensas al máximo con el <strong className="text-amber-300 font-bold">TokkiiPass Premium</strong>. Al activarlo por 30 días continuos, duplicas cada entrega diaria de sobres y ruletas de lunes a sábado, llevando tu colección al siguiente nivel.
              </p>

              <p className="text-xs sm:text-sm text-amber-200 leading-relaxed italic border-l-2 border-amber-400 pl-3.5 py-0.5">
                &ldquo;Y cada domingo recibe un cargamento legendario de 5 sobres de 5 cartas garantizados (25 cartas adicionales) para asegurar todas las cartas del álbum.&rdquo;
              </p>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
                <div className="bg-[#241704]/90 border border-amber-500/40 rounded-xl p-2.5 flex flex-col items-center text-center">
                  <Sparkles className="w-5 h-5 text-amber-300 mb-1" />
                  <span className="text-xs sm:text-sm font-black text-[#F9F1F9]">Doble Recompensa</span>
                  <span className="text-[10px] text-amber-200">Lunes a Sábado</span>
                </div>

                <div className="bg-[#241704]/90 border border-amber-500/40 rounded-xl p-2.5 flex flex-col items-center text-center">
                  <Trophy className="w-5 h-5 text-yellow-300 mb-1" />
                  <span className="text-xs sm:text-sm font-black text-[#F9F1F9]">5 Sobres x 5</span>
                  <span className="text-[10px] text-amber-200">Cada Domingo</span>
                </div>

                <div className="bg-[#241704]/90 border border-amber-500/40 rounded-xl p-2.5 flex flex-col items-center text-center">
                  <Crown className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="text-xs sm:text-sm font-black text-[#F9F1F9]">30 Días VIP</span>
                  <span className="text-[10px] text-amber-200">Activación Directa</span>
                </div>
              </div>
            </div>

            {/* Subtext info */}
            <div className="flex items-center gap-2 text-xs text-amber-300 pt-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Activación directa para la comunidad tras confirmar medio de pago</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          BOTTOM SLIDER INDICATOR PILLS & DOTS
         ======================================================== */}
      <div className="relative z-30 flex items-center justify-center gap-3 pt-3 sm:pt-4">
        <button
          type="button"
          onClick={() => handleSlideChange(0)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border ${
            currentSlide === 0
              ? 'bg-[#F50B8C] text-white border-[#ff6ebb] shadow-md shadow-[#F50B8C]/40 scale-105'
              : 'bg-[#290A30]/80 text-[#B894B3] border-[#610F4E] hover:text-[#F9F1F9] hover:border-[#F50B8C]/50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Sobre GoodTokkii</span>
        </button>

        <button
          type="button"
          onClick={() => handleSlideChange(1)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border ${
            currentSlide === 1
              ? 'bg-gradient-to-r from-amber-400 via-[#ffd700] to-amber-500 text-black border-yellow-200 shadow-md shadow-amber-500/40 scale-105 font-black'
              : 'bg-[#290A30]/80 text-[#fef08a] border-[#ffd700]/50 hover:text-white hover:border-[#ffd700]'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-black" />
          <span>Carta Dorada Épica</span>
        </button>

        <button
          type="button"
          onClick={() => handleSlideChange(2)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer border ${
            currentSlide === 2
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black border-yellow-200 shadow-md shadow-amber-500/40 scale-105 font-black'
              : 'bg-[#290A30]/80 text-amber-300 border-amber-500/50 hover:text-white hover:border-amber-400'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-black" />
          <span>TokkiiPass Premium</span>
        </button>
      </div>

      </div>
  );
};
