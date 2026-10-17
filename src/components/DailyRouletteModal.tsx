import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Gift,
  X,
  CheckCircle2,
  Package,
  ArrowRight,
  RefreshCw,
  Trophy,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  DAILY_ROULETTE_ITEMS,
  pickDailyRewardIndex,
  claimDailyReward,
  type DailyRewardItem
} from '../services/dailyLoginService';
import { resolveImageUrl } from '../utils/imageHelper';
import { playLegendaryRevealSound, playSparkleSound } from '../utils/soundEffects';
import type { UserProfile } from '../types/user';

interface DailyRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLastDayOfMonth: boolean;
  userProfile: UserProfile | null;
  onLoginTwitch?: () => void;
  onRewardClaimed: (item: DailyRewardItem) => void;
  onNavigateToPacks: () => void;
  todayNumber: number;
  dateKey?: string;
}

export const DailyRouletteModal: React.FC<DailyRouletteModalProps> = ({
  isOpen,
  onClose,
  isLastDayOfMonth,
  userProfile,
  onLoginTwitch,
  onRewardClaimed,
  onNavigateToPacks,
  todayNumber,
  dateKey,
}) => {
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedWinnerIndex, setSelectedWinnerIndex] = useState<number | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state whenever modal is opened, and clear timers on unmount
  useEffect(() => {
    if (isOpen) {
      setSelectedWinnerIndex(null);
      setIsSpinning(false);
      setClaimError(null);
      setActiveHighlightIndex(0);
    }
    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartSpin = () => {
    if (isSpinning) return;

    setClaimError(null);
    setIsSpinning(true);
    setSelectedWinnerIndex(null);

    // 1. Determine final winner in advance according to rules
    const targetWinnerIndex = pickDailyRewardIndex(isLastDayOfMonth);

    // 2. Animate roulette across the 4 packs: random jump phase then decelerating to winner
    let currentIdx = activeHighlightIndex;
    let step = 0;
    const fastSteps = 18; // 18 rapid random blinks across packs
    let totalSteps = fastSteps + 8;
    let currentDelay = 65;
    let isDecelerating = false;

    const runStep = () => {
      step++;

      if (step <= fastSteps) {
        // Random jump between the other 3 packs
        const candidates = [0, 1, 2, 3].filter((i) => i !== currentIdx);
        currentIdx = candidates[Math.floor(Math.random() * candidates.length)];
        currentDelay = 60 + Math.floor(Math.random() * 20);
      } else {
        if (!isDecelerating) {
          isDecelerating = true;
          // Calculate exact remaining steps to land on targetWinnerIndex with at least 8 steps of deceleration
          const dist = ((targetWinnerIndex - currentIdx) % 4 + 4) % 4;
          const k = dist + 8;
          totalSteps = step - 1 + k;
        }

        // Sequential step towards winner
        currentIdx = (currentIdx + 1) % 4;

        // Deceleration curve
        const stepsLeft = totalSteps - step;
        if (stepsLeft <= 2) {
          currentDelay += 110;
        } else if (stepsLeft <= 5) {
          currentDelay += 55;
        } else {
          currentDelay += 25;
        }
      }

      setActiveHighlightIndex(currentIdx);
      playSparkleSound();

      if (step < totalSteps) {
        animationTimerRef.current = setTimeout(runStep, currentDelay);
      } else {
        // LANDED ON WINNER!
        setActiveHighlightIndex(targetWinnerIndex);
        setSelectedWinnerIndex(targetWinnerIndex);
        setIsSpinning(false);

        const wonItem = DAILY_ROULETTE_ITEMS[targetWinnerIndex];

        // Process reward
        if (wonItem.cardCount > 0) {
          playLegendaryRevealSound();
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#F50B8C', '#FBBF24', '#38BDF8', '#A855F7'],
          });
        }

        // Claim immediately in database and memory
        if (userProfile) {
          claimDailyReward(userProfile.id, wonItem, dateKey).then((res) => {
            if (res.success) {
              onRewardClaimed(wonItem);
            } else {
              setClaimError(res.error || 'No se pudo registrar la recompensa.');
            }
          });
        } else {
          // Guest simulation mode (for local testing without login)
          if (dateKey) {
            localStorage.setItem(`tokkii_daily_login_guest_${dateKey}`, 'true');
          }
          onRewardClaimed(wonItem);
        }
      }
    };

    animationTimerRef.current = setTimeout(runStep, currentDelay);
  };

  const wonItem = selectedWinnerIndex !== null ? DAILY_ROULETTE_ITEMS[selectedWinnerIndex] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#290A30] border border-[#610F4E] rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(245,11,140,0.3)] overflow-hidden">
        {/* Glow ambient background circles */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#F50B8C]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-center justify-between pb-4 border-b border-[#610F4E]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F50B8C] to-purple-600 flex items-center justify-center shadow-lg shadow-[#F50B8C]/30 shrink-0">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-[#F9F1F9] tracking-wide leading-tight">
                  RULETA DE LOGIN DIARIO
                </h3>
                {isLastDayOfMonth ? (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold font-mono px-2 py-0.5 rounded-full border border-amber-400/50 animate-pulse">
                    🌟 ¡FIN DE MES! 5 CARTAS GARANTIZADO
                  </span>
                ) : (
                  <span className="text-[10px] bg-[#610F4E] text-pink-300 font-bold font-mono px-2 py-0.5 rounded-full border border-[#F50B8C]/40">
                    DÍA {todayNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#B894B3]">
                {isLastDayOfMonth
                  ? '¡Por ser el último día del mes, tu sobre de 5 cartas está 100% garantizado!'
                  : 'Prueba tu suerte y mira qué sobre se ilumina al final para reclamarlo gratis.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSpinning}
            className="p-1.5 rounded-xl text-[#B894B3] hover:text-[#F9F1F9] hover:bg-[#610F4E]/60 transition-colors cursor-pointer disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert if needed */}
        {claimError && (
          <div className="mt-4 p-3 rounded-2xl bg-red-950/70 border border-red-500/50 flex items-center justify-between gap-2 text-red-200 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{claimError}</span>
            </div>
            {!userProfile && onLoginTwitch && (
              <button
                type="button"
                onClick={onLoginTwitch}
                className="px-3 py-1 bg-[#9146FF] hover:bg-[#772CE8] text-white rounded-xl font-bold text-[11px]"
              >
                Conectar Twitch
              </button>
            )}
          </div>
        )}

        {/* 4 HORIZONTAL PACKS ROW */}
        <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          {DAILY_ROULETTE_ITEMS.map((item, index) => {
            const isHighlighted = activeHighlightIndex === index;
            const isWinner = selectedWinnerIndex === index;
            const isGuaranteedGolden = isLastDayOfMonth && item.id === 'pack_5';

            return (
              <div
                key={item.id}
                className={`relative rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-between border-2 transition-all duration-150 select-none overflow-hidden ${
                  isWinner
                    ? `bg-[#31213D] scale-105 shadow-[0_0_35px_${item.glowColor}] ${item.borderColor} z-20`
                    : isHighlighted
                    ? `bg-[#31213D] scale-[1.03] shadow-[0_0_25px_${item.glowColor}] ${item.borderColor} z-10`
                    : 'bg-[#1F0724]/80 border-[#610F4E]/60 opacity-60 scale-100'
                }`}
                style={{
                  minHeight: '260px',
                }}
              >
                {/* Flash neon ambient border */}
                {isHighlighted && (
                  <div
                    className="absolute inset-0 pointer-events-none rounded-3xl animate-pulse"
                    style={{
                      boxShadow: `inset 0 0 20px ${item.glowColor}`,
                    }}
                  />
                )}

                {/* Top Badge */}
                <div className="w-full flex items-center justify-between gap-1 z-10 mb-2">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      isHighlighted || isWinner
                        ? 'bg-black/60 text-white border-white/30'
                        : 'bg-black/40 text-slate-400 border-transparent'
                    }`}
                  >
                    {item.subtitle}
                  </span>

                  {isGuaranteedGolden ? (
                    <span className="text-[9px] bg-amber-500 text-black font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      ¡GARANTIZADO!
                    </span>
                  ) : (
                    <span className="text-[9px] text-slate-400 font-mono">
                      {item.weight}% rate
                    </span>
                  )}
                </div>

                {/* Booster Pack Image */}
                <div className="relative w-28 sm:w-32 h-40 sm:h-44 flex items-center justify-center my-1">
                  <img
                    src={resolveImageUrl(item.image)}
                    alt={item.title}
                    className={`w-full h-full object-contain filter transition-all duration-200 ${
                      item.id === 'empty'
                        ? 'grayscale contrast-125 brightness-75 opacity-70'
                        : ''
                    } ${isHighlighted || isWinner ? 'brightness-110 drop-shadow-xl' : 'brightness-90'}`}
                  />

                  {/* Empty pack cross / empty badge overlay */}
                  {item.id === 'empty' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl backdrop-blur-[1px]">
                      <span className="text-3xl">💨</span>
                      <span className="text-[10px] font-mono font-bold text-slate-300 mt-1 uppercase bg-black/60 px-2 py-0.5 rounded-lg border border-slate-700">
                        0 Cartas
                      </span>
                    </div>
                  )}

                  {/* Winner crown badge */}
                  {isWinner && item.cardCount > 0 && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 animate-bounce">
                      <Trophy className="w-3 h-3" />
                      <span>¡PREMIO!</span>
                    </div>
                  )}
                </div>

                {/* Pack Title & Subtitle */}
                <div className="text-center w-full z-10 mt-1">
                  <div className="font-black text-xs text-white leading-tight">
                    {item.title}
                  </div>
                  <div
                    className={`text-[10px] font-bold ${
                      item.cardCount > 0 ? 'text-[#F50B8C]' : 'text-slate-400'
                    }`}
                  >
                    {item.cardCount > 0
                      ? `Contiene ${item.cardCount} ${item.cardCount === 1 ? 'carta' : 'cartas'}`
                      : 'Sin sobre hoy'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM ACTION / RESULT PANEL */}
        <div className="relative mt-6 pt-4 border-t border-[#610F4E]/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          {wonItem ? (
            /* Result Banner & Actions */
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    wonItem.cardCount > 0
                      ? 'bg-gradient-to-tr from-[#F50B8C] to-purple-600 text-white shadow-lg'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {wonItem.cardCount > 0 ? '🎁' : '💨'}
                </div>
                <div>
                  <div className="font-black text-sm text-white flex items-center gap-1.5 justify-center sm:justify-start">
                    <span>
                      {wonItem.cardCount > 0
                        ? `¡Felicidades! Has ganado 1x ${wonItem.title}`
                        : '¡Casi! Te tocó sobre vacío de 0 cartas'}
                    </span>
                    {wonItem.cardCount > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-[#B894B3]">
                    {wonItem.cardCount > 0
                      ? 'El sobre se ha agregado instantáneamente a tu inventario.'
                      : '¡No te desanimes! Mañana tendrás otra oportunidad para reclamar sobres.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {wonItem.cardCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToPacks();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F50B8C] to-purple-600 hover:from-[#F50B8C]/90 hover:to-purple-500 text-white text-xs font-black shadow-md shadow-[#F50B8C]/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Package className="w-4 h-4" />
                    <span>Abrir Sobre</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-[#31213D] hover:bg-[#610F4E]/60 text-white text-xs font-bold transition-colors cursor-pointer border border-[#610F4E]"
                >
                  Aceptar
                </button>
              </div>
            </div>
          ) : (
            /* Spin Trigger Button */
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#B894B3] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F50B8C] shrink-0" />
                <span>
                  Presiona el botón para iniciar la ruleta y ver qué sobre obtienes hoy.
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartSpin}
                disabled={isSpinning}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#F50B8C] via-pink-600 to-[#C1076D] hover:from-[#F50B8C]/90 hover:to-[#A0055A] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#F50B8C]/35 border border-[#F50B8C]/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSpinning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Girando Ruleta...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isLastDayOfMonth
                        ? '¡Reclamar 5 Cartas Garantizado!'
                        : '¡Girar y Probar Suerte!'}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
