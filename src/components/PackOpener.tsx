import React, { useState, useRef, useEffect } from 'react';
import type { CardData } from '../types/card';
import { TcgCard } from './TcgCard';
import { RARITY_CONFIGS } from '../data/rarityConfigs';
import { playPackTearSound, playLegendaryRevealSound, playSparkleSound, playCardFlipSound } from '../utils/soundEffects';
import { resolveImageUrl } from '../utils/imageHelper';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, X, Scissors, AlertCircle } from 'lucide-react';
import type { UserProfile, UserPacksCount } from '../types/user';

interface PackOpenerProps {
  cards: CardData[];
  onClose?: () => void;
  onInspectCard?: (card: CardData) => void;
  userProfile?: UserProfile | null;
  userPacks?: UserPacksCount;
  onOpenUserPack?: (packType: 'pack_1' | 'pack_3' | 'pack_5', cards: CardData[]) => Promise<boolean>;
  onLoginTwitch?: () => void;
}

export const PackOpener: React.FC<PackOpenerProps> = ({
  cards,
  onClose,
  onInspectCard,
  userProfile,
  userPacks,
  onOpenUserPack,
  onLoginTwitch,
}) => {
  const [packCardCount, setPackCardCount] = useState<number>(3);
  const [animState, setAnimState] = useState<'unopened' | 'tearing' | 'sliding' | 'revealing'>('unopened');
  const [pulledCards, setPulledCards] = useState<CardData[]>([]);
  const [revealedCards, setRevealedCards] = useState<boolean[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);
  const [packId, setPackId] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const currentPackType: 'pack_1' | 'pack_3' | 'pack_5' =
    packCardCount === 1 ? 'pack_1' : packCardCount === 3 ? 'pack_3' : 'pack_5';
  const availablePackCount = userPacks ? userPacks[currentPackType] : 0;

  const getRandomCard = () => {
    return cards[Math.floor(Math.random() * cards.length)];
  };

  const handleOpenPack = () => {
    if (animState !== 'unopened') return;

    // Check login
    if (!userProfile) {
      if (onLoginTwitch) onLoginTwitch();
      return;
    }

    // Check inventory
    if (availablePackCount <= 0) {
      setErrorMessage(`No tienes sobres de ${packCardCount} ${packCardCount === 1 ? 'carta' : 'cartas'} disponibles.`);
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    clearTimeouts();
    setErrorMessage(null);
    setPackId((prev) => prev + 1);

    const newPulled: CardData[] = [];
    for (let i = 0; i < packCardCount; i++) {
      newPulled.push(getRandomCard());
    }

    // 1. INSTANT ANIMATION & SOUND (0ms lag on click)
    playPackTearSound();
    setPulledCards(newPulled);
    setRevealedCards(new Array(packCardCount).fill(false));
    setSelectedCardIndex(0);

    // Phase 1: Physical Sliced Tear (Top cap breaks off instantly)
    setAnimState('tearing');

    // Phase 2: Cards Slide Out from the open slit (Original timing)
    const t1 = setTimeout(() => {
      setAnimState('sliding');
      playSparkleSound();
    }, 600);
    timeoutRefs.current.push(t1);

    // Phase 3: Transition to Card Reveal stage (Original timing)
    const t2 = setTimeout(() => {
      setAnimState('revealing');
    }, 1350);
    timeoutRefs.current.push(t2);

    // 2. ASYNC BACKGROUND SYNC (completely decoupled from UI)
    if (onOpenUserPack) {
      setTimeout(() => {
        onOpenUserPack(currentPackType, newPulled).catch((err) => {
          console.error('Error in background pack deduction:', err);
        });
      }, 0);
    }
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

              {/* Error / Warning Alert */}
              {errorMessage && (
                <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-2 max-w-md mx-auto animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Twitch Login prompt if not logged in */}
              {!userProfile && (
                <div className="bg-[#290A30]/90 border border-[#610F4E] p-3 rounded-2xl max-w-md mx-auto space-y-2">
                  <p className="text-xs text-[#B894B3]">
                    Inicia sesión con tu cuenta de Twitch para registrar tus sobres y cartas obtenidas.
                  </p>
                  {onLoginTwitch && (
                    <button
                      onClick={onLoginTwitch}
                      className="px-4 py-1.5 rounded-xl bg-[#9146FF] hover:bg-[#772CE8] text-white text-xs font-black shadow transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                      </svg>
                      <span>Conectar Twitch</span>
                    </button>
                  )}
                </div>
              )}

              {/* CARD COUNT SELECTOR BUTTONS (1, 3, 5) with Available Inventories */}
              {animState === 'unopened' && (
                <div className="flex flex-col items-center gap-2 pt-1">
                  <div className="flex items-center justify-center gap-2">
                    {[
                      { count: 1, type: 'pack_1' as const, label: '1 Carta', qty: userPacks?.pack_1 || 0 },
                      { count: 3, type: 'pack_3' as const, label: '3 Cartas', qty: userPacks?.pack_3 || 0 },
                      { count: 5, type: 'pack_5' as const, label: '5 Cartas', qty: userPacks?.pack_5 || 0 },
                    ].map((item) => (
                      <button
                        key={item.count}
                        type="button"
                        onClick={() => setPackCardCount(item.count)}
                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all border flex flex-col items-center gap-0.5 cursor-pointer ${
                          packCardCount === item.count
                            ? 'bg-[#F50B8C] text-white border-[#ff6ebb] shadow-md scale-105'
                            : 'bg-[#290A30] text-[#B894B3] border-[#610F4E] hover:border-[#F50B8C]/50 hover:text-[#F9F1F9]'
                        }`}
                      >
                        <span>{item.label}</span>
                        {userProfile && (
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                              item.qty > 0
                                ? packCardCount === item.count
                                  ? 'bg-black/30 text-white'
                                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-900/60 text-slate-400'
                            }`}
                          >
                            {item.qty} {item.qty === 1 ? 'disp.' : 'disp.'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {userProfile && availablePackCount <= 0 && (
                    <span className="text-[11px] text-amber-400 font-semibold bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-full">
                      ⚠️ No tienes sobres disponibles de {packCardCount} {packCardCount === 1 ? 'carta' : 'cartas'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* REALISTIC PHYSICAL SPLIT PACK CONTAINER (Exact 2:3 ratio of PNG: 300px x 450px) */}
            <div
              onClick={handleOpenPack}
              className={`relative w-[300px] h-[450px] select-none cursor-pointer transition-transform duration-300 ${
                animState === 'unopened'
                  ? userProfile && availablePackCount <= 0
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:scale-[1.04] active:scale-95'
                  : ''
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
                  src={resolveImageUrl('/cards/Imagen_Sobre_3.png')}
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
                  src={resolveImageUrl('/cards/Imagen_Sobre_3.png')}
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
