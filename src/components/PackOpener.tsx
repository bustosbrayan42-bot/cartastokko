import React, { useState } from 'react';
import type { CardData } from '../types/card';
import { TcgCard } from './TcgCard';
import { RARITY_CONFIGS } from '../data/rarityConfigs';
import { playPackTearSound, playLegendaryRevealSound, playSparkleSound, playCardFlipSound } from '../utils/soundEffects';
import { resolveImageUrl } from '../utils/imageHelper';
import confetti from 'canvas-confetti';
import { Sparkles, Package, RotateCcw, X, Scissors, ChevronRight } from 'lucide-react';

interface PackOpenerProps {
  cards: CardData[];
  onClose: () => void;
  onInspectCard?: (card: CardData) => void;
}

export const PackOpener: React.FC<PackOpenerProps> = ({
  cards,
  onClose,
  onInspectCard,
}) => {
  const [packCardCount, setPackCardCount] = useState<number>(3);
  const [animState, setAnimState] = useState<'unopened' | 'tearing' | 'sliding' | 'revealing'>('unopened');
  const [pulledCards, setPulledCards] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);

  const getRandomCard = () => {
    return cards[Math.floor(Math.random() * cards.length)];
  };

  const handleOpenPack = () => {
    if (animState !== 'unopened') return;

    playPackTearSound();

    const newPulled: CardData[] = [];
    for (let i = 0; i < packCardCount; i++) {
      newPulled.push(getRandomCard());
    }

    setPulledCards(newPulled);
    setCurrentCardIndex(0);

    // Phase 1: Physical Sliced Tear (Top cap breaks off)
    setAnimState('tearing');

    // Phase 2: Cards Slide Out from the open slit
    setTimeout(() => {
      setAnimState('sliding');
      playSparkleSound();
    }, 600);

    // Phase 3: Transition to Card Reveal stage
    setTimeout(() => {
      setAnimState('revealing');
      const firstCard = newPulled[0];
      if (
        firstCard.rarity === 'super_rare' ||
        firstCard.rarity === 'ultra_rare' ||
        firstCard.rarity === 'secret_rare'
      ) {
        playLegendaryRevealSound();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.55 },
        });
      }
    }, 1350);
  };

  const handleNextCard = () => {
    if (currentCardIndex < pulledCards.length - 1) {
      playCardFlipSound();
      const nextIdx = currentCardIndex + 1;
      setCurrentCardIndex(nextIdx);

      const nextCard = pulledCards[nextIdx];
      if (
        nextCard.rarity === 'super_rare' ||
        nextCard.rarity === 'ultra_rare' ||
        nextCard.rarity === 'secret_rare'
      ) {
        playLegendaryRevealSound();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#f59e0b', '#ec4899', '#06b6d4', '#10b981', '#ffffff'],
        });
      }
    }
  };

  const handleReset = () => {
    setAnimState('unopened');
    setPulledCards([]);
    setCurrentCardIndex(0);
  };

  const activeCard = pulledCards[currentCardIndex];
  const activeRarityConfig = activeCard ? RARITY_CONFIGS[activeCard.rarity] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors shadow-lg"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center justify-center max-w-2xl w-full text-center relative">
        {/* ========================================================
            PHASE 1 & 2: PHYSICAL FOIL SLIT TEAR & SLIDE ANIMATION
           ======================================================== */}
        {animState !== 'revealing' ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/40 flex items-center justify-center gap-1.5 mx-auto w-fit">
                <Scissors className="w-3.5 h-3.5" />
                {animState === 'unopened' ? 'Toca para abrir' : '¡Abriendo sobre...!'}
              </span>
              <h2 className="text-3xl font-black text-white tracking-wide">
                Sobre de Cartas Tokkii
              </h2>

              {/* CARD COUNT SELECTOR BUTTONS (1, 3, 5) */}
              {animState === 'unopened' && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="text-xs font-bold text-slate-400 mr-1">Cartas por sobre:</span>
                  {[1, 3, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPackCardCount(count)}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all border ${
                        packCardCount === count
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {count} {count === 1 ? 'Carta' : 'Cartas'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* REALISTIC PHYSICAL SPLIT PACK CONTAINER (270px x 430px) */}
            <div
              onClick={handleOpenPack}
              className="relative w-68 h-[440px] select-none cursor-pointer"
            >
              {/* CARDS SLIDING OUT FROM THE OPEN MOUTH */}
              {pulledCards.length > 0 && (animState === 'sliding' || animState === 'tearing') && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 z-15 transition-all duration-700 ease-out"
                  style={{
                    width: '240px',
                    height: '340px',
                    top: animState === 'sliding' ? '-90px' : '90px',
                    opacity: animState === 'sliding' ? 1 : 0,
                    transform: animState === 'sliding'
                      ? 'translateX(-50%) scale(1.04) rotate(0deg)'
                      : 'translateX(-50%) scale(0.85) rotate(-2deg)',
                  }}
                >
                  <div className="w-full h-full rounded-[16px] overflow-hidden border-2 border-amber-400 shadow-[0_0_35px_rgba(234,179,8,0.6)] bg-slate-950 relative">
                    <img
                      src={resolveImageUrl('/cards/Card_Trasera.png')}
                      alt="Reverso de Carta"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-pulse" />
                    {packCardCount > 1 && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 border border-amber-400 text-[10px] font-black text-amber-300">
                        +{packCardCount} cartas
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 1. TOP SLICED FOIL PIECE (EXACT COMPLEMENTARY CLIP-PATH) */}
              <div
                className="absolute inset-0 z-30 transition-all duration-700 ease-in-out pointer-events-none"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 19%, 85% 23%, 70% 18%, 50% 24%, 35% 19%, 20% 23%, 0 18%)',
                  transform:
                    animState === 'tearing' || animState === 'sliding'
                      ? 'translateX(180px) translateY(-100px) rotate(42deg) scale(0.75)'
                      : 'translateX(0) translateY(0) rotate(0deg) scale(1)',
                  opacity: animState === 'tearing' || animState === 'sliding' ? 0 : 1,
                  filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.6))',
                }}
              >
                <div
                  className="w-full h-full rounded-t-3xl p-4 flex flex-col justify-between border-t-2 border-x-2 border-amber-400/80"
                  style={{
                    background: 'linear-gradient(135deg, #b45309 0%, #d97706 35%, #7e22ce 100%)',
                  }}
                >
                  <div className="w-full flex justify-between items-center text-[9px] font-mono text-amber-200 uppercase font-black">
                    <span>{packCardCount} {packCardCount === 1 ? 'CARTA' : 'CARTAS'}</span>
                    <span>★ TOKKII ★</span>
                  </div>
                </div>
              </div>

              {/* 2. BOTTOM FOIL BODY PIECE (EXACT CUT SLIT MOUTH) */}
              <div
                className="absolute inset-0 z-20 transition-all duration-700 ease-out"
                style={{
                  clipPath: 'polygon(0 18%, 20% 23%, 35% 19%, 50% 24%, 70% 18%, 85% 23%, 100% 19%, 100% 100%, 0 100%)',
                  transform:
                    animState === 'sliding'
                      ? 'translateY(110px) scale(0.85)'
                      : animState === 'tearing'
                      ? 'translateY(15px) scale(0.98)'
                      : 'translateY(0) scale(1)',
                  opacity: animState === 'sliding' ? 0.35 : 1,
                  filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.6))',
                }}
              >
                <div
                  className="w-full h-full rounded-b-3xl p-4 flex flex-col justify-between border-b-2 border-x-2 border-amber-400/80 relative"
                  style={{
                    background: 'linear-gradient(135deg, #b45309 0%, #7e22ce 50%, #312e81 100%)',
                  }}
                >
                  <div className="absolute top-[18%] left-0 right-0 h-8 bg-gradient-to-b from-black/90 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-foil-sweep pointer-events-none" />

                  <div className="my-auto flex flex-col items-center space-y-2 text-center z-10 pt-16">
                    <div className="w-16 h-16 rounded-full bg-slate-950/80 border border-amber-300 flex items-center justify-center shadow-xl">
                      <Package className="w-8 h-8 text-amber-300 animate-bounce" />
                    </div>
                    <div>
                      <div className="text-base font-black text-white">EDICIÓN GÉNESIS</div>
                      <div className="text-[11px] text-amber-300 font-bold">¡POSIBILIDAD DE SECRET RARE!</div>
                    </div>
                  </div>

                  <div className="w-full text-center border-t border-amber-300/40 pt-2 text-[10px] font-bold text-amber-200 uppercase">
                    {animState === 'unopened' ? '¡TOCA PARA ABRIR!' : 'ABRIENDO...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
              PHASE 3: SEQUENTIAL MULTI-CARD REVEAL & STACK
             ======================================================== */
          activeCard && (
            <div className="flex flex-col items-center space-y-5 animate-in zoom-in-95 duration-500 w-full">
              <div className="space-y-1.5">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border ${activeRarityConfig?.badgeBg}`}
                  >
                    {activeRarityConfig?.name}
                  </span>
                  <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                    Carta {currentCardIndex + 1} de {pulledCards.length}
                  </span>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {activeCard.title}
                </h2>
              </div>

              <div className="relative py-2">
                <TcgCard
                  card={activeCard}
                  scale={1.05}
                  interactive={true}
                  onClick={() => onInspectCard?.(activeCard)}
                />
              </div>

              <div className="flex flex-col items-center gap-3 w-full max-w-lg">
                {pulledCards.length > 1 && (
                  <div className="flex items-center justify-center gap-2 p-2 bg-slate-900/80 rounded-2xl border border-slate-800">
                    {pulledCards.map((c, idx) => {
                      const isCurrent = idx === currentCardIndex;
                      const isRevealed = idx <= currentCardIndex;
                      const r = RARITY_CONFIGS[c.rarity];
                      return (
                        <button
                          key={c.id || idx}
                          type="button"
                          onClick={() => {
                            playCardFlipSound();
                            setCurrentCardIndex(idx);
                          }}
                          className={`w-12 h-16 rounded-xl overflow-hidden border-2 transition-all relative ${
                            isCurrent
                              ? 'border-amber-400 scale-110 shadow-[0_0_12px_rgba(234,179,8,0.5)] z-10'
                              : isRevealed
                              ? 'border-slate-700 opacity-80 hover:opacity-100'
                              : 'border-slate-800 opacity-40'
                          }`}
                        >
                          <img
                            src={c.image}
                            alt={c.title}
                            className="w-full h-full object-cover"
                          />
                          <span
                            className="absolute bottom-0 inset-x-0 text-[7px] font-black text-center bg-black/80"
                            style={{ color: r.color }}
                          >
                            {r.shortName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {currentCardIndex < pulledCards.length - 1 ? (
                    <button
                      onClick={handleNextCard}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 transition-all transform hover:scale-105 active:scale-95"
                    >
                      <span>Siguiente Carta ({currentCardIndex + 2}/{pulledCards.length})</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 hover:border-amber-400 transition-all shadow"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-400" />
                      Abrir Otro Sobre
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onClose();
                      if (onInspectCard && activeCard) onInspectCard(activeCard);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-lg hover:shadow-amber-500/30"
                  >
                    Inspeccionar
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
