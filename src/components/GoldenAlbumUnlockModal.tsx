import React, { useEffect } from 'react';
import { Crown, Sparkles, Trophy, BookOpen, X, CheckCircle2, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CardData } from '../types/card';
import { TcgCard } from './TcgCard';
import { playLegendaryRevealSound, playSparkleSound } from '../utils/soundEffects';

interface GoldenAlbumUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardData | null;
  userName?: string;
  editionName?: string;
  totalUnlockedCount?: number;
  onGoToBinder?: () => void;
}

export const GoldenAlbumUnlockModal: React.FC<GoldenAlbumUnlockModalProps> = ({
  isOpen,
  onClose,
  card,
  userName = 'Coleccionista',
  editionName = 'Génesis',
  totalUnlockedCount = 140,
  onGoToBinder,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Fanfare and dual gold confetti bursts
    playLegendaryRevealSound();

    const end = Date.now() + 2500;
    const colors = ['#ffd700', '#f59e0b', '#fbbf24', '#ffffff', '#fef08a', '#d97706'];

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    const timer = setTimeout(() => {
      playSparkleSound();
    }, 1200);

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      {/* Golden Aura Glow Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/20 via-yellow-400/25 to-amber-600/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div
        className="relative w-full max-w-2xl bg-gradient-to-b from-[#1c1404] via-[#0d0901] to-[#171003] border-2 border-[#ffd700] rounded-3xl p-5 sm:p-7 text-white shadow-[0_0_80px_rgba(255,215,0,0.35)] overflow-hidden flex flex-col items-center max-h-[92vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 60px rgba(255, 215, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
        }}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#ffd700]/70 rounded-tl-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#ffd700]/70 rounded-tr-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#ffd700]/70 rounded-bl-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#ffd700]/70 rounded-br-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-[#fef08a] border border-[#ffd700]/40 flex items-center justify-center transition-colors cursor-pointer"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border border-[#ffd700]/60 text-[#fef08a] text-xs font-mono uppercase tracking-widest mb-3 shadow-sm">
          <Crown className="w-3.5 h-3.5 text-[#ffd700] animate-bounce" />
          <span>¡Desbloqueo Legendario Supremo!</span>
          <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
        </div>

        {/* Big Golden Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-center tracking-wide bg-gradient-to-r from-[#fff3b0] via-[#ffd700] to-[#f59e0b] bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(255,215,0,0.5)]">
          ¡CARTA DORADA ÉPICA OBTENIDA!
        </h2>

        <p className="text-xs sm:text-sm text-center text-[#fef08a]/90 font-medium mt-1 max-w-lg">
          ¡Felicidades, <span className="font-bold text-white underline decoration-[#ffd700]">{userName}</span>!
          Has obtenido la codiciada reliquia de canje único oficial.
        </p>

        {/* Card and Achievement Showcase */}
        <div className="my-5 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-7 w-full">
          {/* Card Preview with Golden Ring Glow */}
          <div className="relative group shrink-0">
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600 rounded-3xl opacity-75 blur-md group-hover:opacity-100 transition duration-500 animate-pulse" />
            <div className="relative transform hover:scale-105 transition-transform duration-300">
              <TcgCard card={card} scale={0.76} interactive={true} />
            </div>
          </div>

          {/* Golden Unlock Details */}
          <div className="flex flex-col gap-3 text-left max-w-sm">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-yellow-950/20 to-black/60 border border-[#ffd700]/40 space-y-2">
              <div className="flex items-center gap-2 text-[#ffd700] font-black text-xs uppercase tracking-wider">
                <Trophy className="w-4 h-4 text-[#ffd700]" />
                <span>Recompensa Suprema de Colección</span>
              </div>
              <p className="text-[12px] text-[#fef9c3] leading-relaxed">
                Al poseer la Carta Dorada, <strong className="text-[#ffd700]">has desbloqueado automáticamente todas las {totalUnlockedCount} cartas</strong> (desde la #001 hasta la #140) de la <span className="text-white font-bold">{editionName}</span>.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-1.5 text-xs text-[#fef08a]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ffd700] shrink-0" />
                <span>Álbum completo al 100% (140/140 cartas registradas)</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#ffd700] shrink-0" />
                <span>Carta de canje oficial guardada en tu inventario</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#ffd700] shrink-0" />
                <span>Rango Supremo de Coleccionista Maestro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-1">
          {onGoToBinder && (
            <button
              onClick={() => {
                onClose();
                onGoToBinder();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-[#ffd700] to-amber-500 hover:from-amber-300 hover:via-yellow-300 hover:to-amber-400 text-black font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-yellow-200"
            >
              <BookOpen className="w-4 h-4 text-black" />
              <span>Explorar mi Álbum Completo (140 Cartas)</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-black/60 hover:bg-black/90 text-[#fef08a] hover:text-white font-bold text-xs border border-[#ffd700]/50 hover:border-[#ffd700] transition-all cursor-pointer"
          >
            <span>Continuar en el Sobre</span>
          </button>
        </div>
      </div>
    </div>
  );
};
