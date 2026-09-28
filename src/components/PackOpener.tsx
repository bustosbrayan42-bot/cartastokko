import React, { useState, useRef, useEffect } from 'react';
import type { CardData } from '../types/card';
import { TcgCard } from './TcgCard';
import { RARITY_CONFIGS } from '../data/rarityConfigs';
import { playPackTearSound, playLegendaryRevealSound, playSparkleSound, playCardFlipSound } from '../utils/soundEffects';
import { resolveImageUrl } from '../utils/imageHelper';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, X, Scissors } from 'lucide-react';

interface PackOpenerProps {
  cards: CardData[];
  onClose?: () => void;
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
  const [revealedCards, setRevealedCards] = useState<boolean[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);
  const [packId, setPackId] = useState<number>(1);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const getRandomCard = () => {
    return cards[Math.floor(Math.random() * cards.length)];
  };

  const handleOpenPack = () => {
    if (animState !== 'unopened') return;

    clearTimeouts();
    setPackId((prev) => prev + 1);
    playPackTearSound();

    const newPulled: CardData[] = [];
    for (let i = 0; i < packCardCount; i++) {
      newPulled.push(getRandomCard());
    }

    setPulledCards(newPulled);
    setRevealedCards(new Array(packCardCount).fill(false));
    setSelectedCardIndex(0);

    // Phase 1: Physical Sliced Tear (Top cap breaks off)
    setAnimState('tearing');

    // Phase 2: Cards Slide Out from the open slit
    const t1 = setTimeout(() => {
      setAnimState('sliding');
      playSparkleSound();
    }, 600);
    timeoutRefs.current.push(t1);

    // Phase 3: Transition to Card Reveal stage
    const t2 = setTimeout(() => {
      setAnimState('revealing');
    }, 1350);
    timeoutRefs.current.push(t2);
  };

  const handleCardClick = (idx: number) => {
    setSelectedCardIndex(idx);
    const card = pulledCards[idx];

    if (!revealedCards[idx]) {
      playCardFlipSound();
      const updated = [...revealedCards];
      updated[idx] = true;
      setRevealedCards(updated);

      if (
        card.rarity === 'super_rare' ||
        card.rarity === 'ultra_rare' ||
        card.rarity === 'secret_rare'
      ) {
        playLegendaryRevealSound();
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.55 },
        });
      } else if (card.rarity === 'rare') {
        playSparkleSound();
      }
    } else {
      playCardFlipSound();
    }
  };

  const handleReset = () => {
    clearTimeouts();
    setAnimState('unopened');
    setPulledCards([]);
    setRevealedCards([]);
    setSelectedCardIndex(0);
    setPackId((prev) => prev + 1);
  };

  const allRevealed = revealedCards.length > 0 && revealedCards.every(Boolean);
  const revealedCount = revealedCards.filter(Boolean).length;
  const activeCard = (pulledCards.length > 0 && selectedCardIndex < pulledCards.length)
    ? pulledCards[selectedCardIndex]
    : pulledCards[0];

  // Dynamic card scale to guarantee 100% viewport fit without scrolling
  const cardScale = packCardCount === 1 ? 1.15 : packCardCount === 3 ? 0.88 : 0.72;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center py-2 relative my-auto animate-in fade-in duration-300">
      {/* Optional Close button if used as standalone modal */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute -top-2 right-0 z-50 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors shadow-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex flex-col items-center justify-center w-full text-center relative">
        {/* ========================================================
            PHASE 1 & 2: PHYSICAL FOIL SLIT TEAR & SLIDE ANIMATION
           ======================================================== */}
        {animState !== 'revealing' ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#F9F1F9] bg-[#610F4E]/80 px-3 py-1 rounded-full border border-[#F50B8C]/40 flex items-center justify-center gap-1.5 mx-auto w-fit">
                <Scissors className="w-3.5 h-3.5 text-[#F50B8C]" />
                {animState === 'unopened' ? 'Toca para abrir' : '¡Abriendo sobre...!'}
              </span>
              <h2 className="text-3xl font-black text-[#F9F1F9] tracking-wide">
                Sobre de Cartas Tokkii
              </h2>

              {/* CARD COUNT SELECTOR BUTTONS (1, 3, 5) */}
              {animState === 'unopened' && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="text-xs font-bold text-[#B894B3] mr-1">Cartas por sobre:</span>
                  {[1, 3, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPackCardCount(count)}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                        packCardCount === count
                          ? 'bg-[#F50B8C] text-white border-[#ff6ebb] shadow-md scale-105'
                          : 'bg-[#290A30] text-[#B894B3] border-[#610F4E] hover:border-[#F50B8C]/50 hover:text-[#F9F1F9]'
                      }`}
                    >
                      {count} {count === 1 ? 'Carta' : 'Cartas'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* REALISTIC PHYSICAL SPLIT PACK CONTAINER (Exact 2:3 ratio of PNG: 300px x 450px) */}
            <div
              onClick={handleOpenPack}
              className={`relative w-[300px] h-[450px] select-none cursor-pointer transition-transform duration-300 ${
                animState === 'unopened' ? 'hover:scale-[1.04] active:scale-95' : ''
              }`}
            >
              {/* CARDS SLIDING OUT FROM THE OPEN MOUTH (Dynamic fan of 1, 3 or 5 cards) */}
              {pulledCards.length > 0 && (animState === 'sliding' || animState === 'tearing') && (
                <div className="absolute inset-0 pointer-events-none z-15">
                  {pulledCards.map((_, idx) => {
                    const total = pulledCards.length;
                    const centerIdx = (total - 1) / 2;
                    const offsetFactor = total > 1 ? idx - centerIdx : 0;

                    const rot = animState === 'sliding' ? offsetFactor * 4 : 0;
                    const tx = animState === 'sliding' ? offsetFactor * 14 : 0;
                    const ty = animState === 'sliding' ? Math.abs(offsetFactor) * 5 : 0;

                    return (
                      <div
                        key={`sliding-${packId}-${idx}`}
                        className="absolute left-1/2 transition-all duration-700 ease-out"
                        style={{
                          width: '235px',
                          height: '335px',
                          top: animState === 'sliding' ? `${-95 + ty}px` : '90px',
                          opacity: animState === 'sliding' ? 1 : 0,
                          transform: animState === 'sliding'
                            ? `translateX(calc(-50% + ${tx}px)) scale(1.02) rotate(${rot}deg)`
                            : 'translateX(-50%) scale(0.85) rotate(0deg)',
                          zIndex: 15 + idx,
                        }}
                      >
                        <div className="w-full h-full rounded-[16px] overflow-hidden border-2 border-amber-400/90 shadow-[0_8px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(234,179,8,0.4)] bg-slate-950 relative">
                          <img
                            src={resolveImageUrl('/cards/Card_Trasera.png')}
                            alt={`Reverso de Carta ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 1. TOP SLICED FOIL PIECE (EXACT COMPLEMENTARY CLIP-PATH) */}
              <div
                className="absolute inset-0 z-30 transition-all duration-700 ease-in-out pointer-events-none"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 17%, 85% 21%, 70% 16%, 50% 22%, 35% 17%, 20% 21%, 0 16%)',
                  transform:
                    animState === 'tearing' || animState === 'sliding'
                      ? 'translateX(190px) translateY(-110px) rotate(45deg) scale(0.75)'
                      : 'translateX(0) translateY(0) rotate(0deg) scale(1)',
                  opacity: animState === 'tearing' || animState === 'sliding' ? 0 : 1,
                }}
              >
                <img
                  src={resolveImageUrl('/cards/Imagen_Sobre_2.png')}
                  alt="Sobre Tokkii TCG"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </div>

              {/* 2. BOTTOM FOIL BODY PIECE (EXACT CUT SLIT MOUTH) */}
              <div
                className="absolute inset-0 z-20 transition-all duration-700 ease-out pointer-events-none"
                style={{
                  clipPath: 'polygon(0 16%, 20% 21%, 35% 17%, 50% 22%, 70% 16%, 85% 21%, 100% 17%, 100% 100%, 0 100%)',
                  transform:
                    animState === 'sliding'
                      ? 'translateY(110px) scale(0.85)'
                      : animState === 'tearing'
                      ? 'translateY(15px) scale(0.98)'
                      : 'translateY(0) scale(1)',
                  opacity: animState === 'sliding' ? 0.35 : 1,
                }}
              >
                <img
                  src={resolveImageUrl('/cards/Imagen_Sobre_2.png')}
                  alt="Sobre Tokkii TCG"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
              PHASE 3: HORIZONTAL MULTI-CARD FACE-DOWN REVEAL STAGE
             ======================================================== */
          pulledCards.length > 0 && (
            <div className="flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-500 w-full">
              {/* Header Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F50B8C]" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[#F9F1F9] bg-[#610F4E]/90 px-3 py-1 rounded-full border border-[#F50B8C]/50 shadow-sm">
                    Sobre Abierto • {pulledCards.length} {pulledCards.length === 1 ? 'Carta' : 'Cartas'}
                  </span>
                  <Sparkles className="w-4 h-4 text-[#F50B8C]" />
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#F9F1F9] tracking-wide">
                  {!allRevealed ? (
                    <span className="flex items-center justify-center gap-2">
                      <span>Toca las cartas para revelarlas</span>
                      <span className="text-sm font-mono text-[#F50B8C] bg-[#290A30] px-2.5 py-0.5 rounded-full border border-[#610F4E]">
                        {revealedCount}/{pulledCards.length}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[#34d399] flex items-center justify-center gap-2 animate-in zoom-in-95">
                      <span>¡Todas las cartas reveladas!</span>
                      <Sparkles className="w-5 h-5 text-[#F50B8C]" />
                    </span>
                  )}
                </h2>
              </div>

              {/* HORIZONTAL CARDS DISPLAY */}
              <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full py-2">
                {pulledCards.map((card, idx) => {
                  const isRevealed = revealedCards[idx];
                  const isSelected = selectedCardIndex === idx;
                  const rConfig = RARITY_CONFIGS[card.rarity] || RARITY_CONFIGS.common;

                  return (
                    <div
                      key={`pack-${packId}-slot-${idx}-${card.id}`}
                      onClick={() => handleCardClick(idx)}
                      className="flex flex-col items-center gap-2 cursor-pointer group"
                    >
                      <div
                        className={`transition-all duration-300 transform rounded-2xl ${
                          !isRevealed
                            ? 'hover:scale-105 hover:-translate-y-2'
                            : isSelected
                            ? 'scale-105 -translate-y-1'
                            : 'hover:scale-102 hover:-translate-y-1'
                        }`}
                      >
                        <TcgCard
                          card={card}
                          scale={cardScale}
                          isFlipped={!isRevealed}
                          onFlipToggle={() => handleCardClick(idx)}
                          showBackFlipBtn={false}
                          interactive={true}
                        />
                      </div>

                      {/* State Label Below Card */}
                      <div className="h-6 flex items-center justify-center">
                        {isRevealed ? (
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow"
                            style={{
                              color: rConfig.color,
                              borderColor: rConfig.borderColor,
                              backgroundColor: 'rgba(41, 10, 48, 0.9)',
                            }}
                          >
                            {rConfig.name} {'★'.repeat(rConfig.stars)}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#F9F1F9] bg-[#610F4E]/90 px-2.5 py-0.5 rounded-full border border-[#F50B8C]/50 animate-pulse">
                            Toca para revelar
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleReset}
                  disabled={!allRevealed}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                    allRevealed
                      ? 'bg-gradient-to-r from-[#F50B8C] to-[#b80869] hover:from-[#ff2b9f] hover:to-[#F50B8C] text-white shadow-lg shadow-[#F50B8C]/30 hover:scale-105 active:scale-95 cursor-pointer border border-[#ff6ebb]/40'
                      : 'bg-[#290A30] text-[#B894B3]/40 border border-[#610F4E] cursor-not-allowed opacity-50'
                  }`}
                  title={!allRevealed ? 'Revela todas las cartas para abrir otro sobre' : 'Abrir otro sobre'}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Abrir Otro Sobre</span>
                </button>

                {activeCard && revealedCards[selectedCardIndex] && (
                  <button
                    onClick={() => {
                      if (onClose) onClose();
                      if (onInspectCard && activeCard) onInspectCard(activeCard);
                    }}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#610F4E] hover:bg-[#7a1362] text-[#F9F1F9] text-xs font-bold border border-[#F50B8C]/40 hover:border-[#F50B8C] transition-all shadow hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#F50B8C]" />
                    <span>Inspeccionar {activeCard.title}</span>
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
