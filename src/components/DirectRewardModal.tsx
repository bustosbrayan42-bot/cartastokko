import React, { useEffect } from 'react';
import {
  Gift,
  X,
  CheckCircle2,
  Package,
  ArrowRight,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { resolveImageUrl } from '../utils/imageHelper';
import { playLegendaryRevealSound, playSparkleSound } from '../utils/soundEffects';
import type { DayRewardConfig } from '../services/dailyLoginService';

interface DirectRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardConfig: DayRewardConfig;
  dayName: string;
  dayNumber: number;
  monthName: string;
  onNavigateToPacks: () => void;
}

export const DirectRewardModal: React.FC<DirectRewardModalProps> = ({
  isOpen,
  onClose,
  rewardConfig,
  dayName,
  dayNumber,
  monthName,
  onNavigateToPacks,
}) => {
  useEffect(() => {
    if (isOpen) {
      if (rewardConfig.cardCount >= 3) {
        playLegendaryRevealSound();
        confetti({
          particleCount: 100,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#F50B8C', '#FBBF24', '#38BDF8', '#A855F7'],
        });
      } else {
        playSparkleSound();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#06B6D4', '#F50B8C', '#FFFFFF'],
        });
      }
    }
  }, [isOpen, rewardConfig]);

  if (!isOpen) return null;

  const isLegendary = rewardConfig.cardCount >= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#290A30] border border-[#610F4E] rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,11,140,0.35)] overflow-hidden text-center">
        {/* Ambient glow backgrounds */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#F50B8C]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#B894B3] hover:text-white hover:bg-[#610F4E]/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#F50B8C] to-purple-600 flex items-center justify-center shadow-lg shadow-[#F50B8C]/35">
            {isLegendary ? (
              <Trophy className="w-7 h-7 text-amber-300" />
            ) : (
              <Gift className="w-7 h-7 text-white" />
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] bg-[#610F4E] text-pink-300 font-bold font-mono px-2.5 py-0.5 rounded-full border border-[#F50B8C]/40 uppercase">
              {dayName} • Día {dayNumber} de {monthName}
            </span>
            {rewardConfig.isGuaranteedMonthEnd && (
              <span className="text-[10px] bg-amber-500/25 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/50">
                🌟 ¡FIN DE MES GARANTIZADO!
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase mt-1">
            ¡Recompensa TokkiiPass Reclamada!
          </h3>
        </div>

        {/* Central Pack Display Card */}
        <div
          className={`relative my-4 p-5 rounded-3xl bg-[#1F0724]/90 border-2 ${rewardConfig.borderColor} shadow-[0_0_30px_${rewardConfig.glowColor}] flex flex-col items-center justify-center`}
        >
          <div className="relative w-36 h-48 flex items-center justify-center my-2">
            <img
              src={resolveImageUrl(rewardConfig.image)}
              alt={rewardConfig.title}
              className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] animate-pulse"
            />
            {isLegendary && (
              <div className="absolute -top-2 bg-amber-400 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 animate-bounce">
                <Trophy className="w-3 h-3" />
                <span>5 CARTAS</span>
              </div>
            )}
          </div>

          <div className="mt-2 space-y-1">
            <div className="font-black text-lg text-white">
              1x {rewardConfig.title}
            </div>
            <div className={`text-xs font-bold ${rewardConfig.textColor}`}>
              Contiene {rewardConfig.cardCount} {rewardConfig.cardCount === 1 ? 'carta' : 'cartas'}
            </div>
          </div>
        </div>

        {/* Success message note */}
        <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold mb-6">
          <CheckCircle2 className="w-4 h-4" />
          <span>¡Sobre añadido instantáneamente a tu inventario!</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateToPacks();
            }}
            className="flex-1 min-w-[140px] px-5 py-3 rounded-2xl bg-gradient-to-r from-[#F50B8C] via-pink-600 to-[#C1076D] hover:from-[#F50B8C]/90 hover:to-[#A0055A] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[#F50B8C]/35 border border-[#F50B8C]/50 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Package className="w-4 h-4" />
            <span>Abrir Sobre</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-[#31213D] hover:bg-[#610F4E]/60 text-white text-xs font-bold border border-[#610F4E] cursor-pointer transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
