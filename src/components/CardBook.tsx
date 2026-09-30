import React, { useState, useRef } from 'react';
import type { CardData } from '../types/card';
import { TcgCard } from './TcgCard';
import { playPageTurnSound } from '../utils/soundEffects';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Layers,
  RefreshCw
} from 'lucide-react';

interface CardBookProps {
  cards: CardData[];
  onInspectCard: (card: CardData) => void;
  userOwnedCardIds?: Set<string>;
  isLoggedIn?: boolean;
  onOpenDuplicateModal?: () => void;
  duplicatesCount?: number;
}

export const CardBook: React.FC<CardBookProps> = ({
  cards,
  onInspectCard,
  userOwnedCardIds,
  isLoggedIn = false,
  onOpenDuplicateModal,
  duplicatesCount = 0,
}) => {
  // Binder Capacity: 144 card slots in total (Pages 1 to 12)
  // 4x3 grid per page = 4 horizontal (cols) x 3 vertical (rows) = 12 cards per Page
  // 2 pages per Spread (Hoja) = 24 cards per Spread
  // Total Spreads = 144 / 24 = 6 Hojas (12 Páginas)
  const TOTAL_ALBUM_SLOTS = 144;
  const CARDS_PER_PAGE = 12;
  const CARDS_PER_SPREAD = 24;

  const totalPages = Math.ceil(TOTAL_ALBUM_SLOTS / CARDS_PER_SPREAD); // 6 Spreads (12 Páginas)
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState<number>(0);

  // 2-Phase Continuous Momentum Flip
  const [turnState, setTurnState] = useState<
    'next-phase1' | 'next-phase2' | 'prev-phase1' | 'prev-phase2' | null
  >(null);

  const phaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAnimating = turnState !== null;
  const PHASE_DURATION_MS = 210;

  // Turn Forward (Next Spread)
  const handleNextPage = () => {
    if (currentSpreadIndex >= totalPages - 1 || isAnimating) return;
    playPageTurnSound();

    if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);

    setTurnState('next-phase1');

    phaseTimeoutRef.current = setTimeout(() => {
      setTurnState('next-phase2');

      phaseTimeoutRef.current = setTimeout(() => {
        setCurrentSpreadIndex((prev) => prev + 1);
        setTurnState(null);
      }, PHASE_DURATION_MS);
    }, PHASE_DURATION_MS);
  };

  // Turn Backward (Prev Spread)
  const handlePrevPage = () => {
    if (currentSpreadIndex <= 0 || isAnimating) return;
    playPageTurnSound();

    if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);

    setTurnState('prev-phase1');

    phaseTimeoutRef.current = setTimeout(() => {
      setTurnState('prev-phase2');

      phaseTimeoutRef.current = setTimeout(() => {
        setCurrentSpreadIndex((prev) => prev - 1);
        setTurnState(null);
      }, PHASE_DURATION_MS);
    }, PHASE_DURATION_MS);
  };

  // Render a 4x3 page face (calibrated precisely to maximize viewport usage with ZERO scroll)
  const renderPageFace = (
    pageNumber: number,
    side: 'left' | 'right',
    isFlipLeaf = false
  ) => {
    const pageStartSlot = (pageNumber - 1) * CARDS_PER_PAGE + 1;
    const pageEndSlot = Math.min(TOTAL_ALBUM_SLOTS, pageNumber * CARDS_PER_PAGE);

    return (
      <div
        className="w-[410px] sm:w-[490px] md:w-[535px] lg:w-[565px] h-[500px] sm:h-[555px] md:h-[585px] lg:h-[608px] rounded-[22px] sm:rounded-[26px] p-2 sm:p-2.5 md:p-3 border border-slate-800/80 shadow-[inset_0_0_25px_rgba(0,0,0,0.7)] flex flex-col justify-between relative overflow-hidden select-none"
        style={{
          background:
            side === 'left'
              ? 'linear-gradient(135deg, rgba(49,33,61,0.98) 0%, rgba(41,10,48,0.99) 100%)'
              : 'linear-gradient(225deg, rgba(49,33,61,0.98) 0%, rgba(41,10,48,0.99) 100%)',
        }}
      >
        {/* 6 Ring Holes on the inner spine edge */}
        <div
          className={`absolute top-0 bottom-0 ${
            side === 'left' ? 'right-1 sm:right-1.5' : 'left-1 sm:left-1.5'
          } flex flex-col justify-around py-4 z-20 pointer-events-none`}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#31213D] border border-[#610F4E] shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]"
            />
          ))}
        </div>

        {/* Top Header of Page */}
        <div className="flex items-center justify-between pb-1 mb-0.5 border-b border-[#610F4E]/70 text-[9px] sm:text-[10px] font-mono text-[#B894B3]">
          {side === 'left' ? (
            <>
              <span className="flex items-center gap-1 text-[#F50B8C] font-bold">
                <Sparkles className="w-2.5 h-2.5" />
                PÁGINA {pageNumber}
              </span>
              <span className="tracking-wider uppercase text-[#B894B3]/70 text-[8px]">TOKKII BINDER 4x3</span>
            </>
          ) : (
            <>
              <span className="tracking-wider uppercase text-[#B894B3]/70 text-[8px]">TOKKII BINDER 4x3</span>
              <span className="flex items-center gap-1 text-[#F50B8C] font-bold">
                PÁGINA {pageNumber}
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            </>
          )}
        </div>

        {/* 4x3 CARDS GRID (4 Horizontal x 3 Vertical = 12 Slots per Page) */}
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5 justify-center items-center py-0.5">
          {[...Array(12)].map((_, slotIdx) => {
            const absoluteSlotNum = (pageNumber - 1) * CARDS_PER_PAGE + slotIdx + 1;
            const isWithin150 = absoluteSlotNum <= TOTAL_ALBUM_SLOTS;
            const card = isWithin150 ? cards[absoluteSlotNum - 1] : undefined;
            const slotFormatted = String(absoluteSlotNum).padStart(3, '0');

            return (
              <div
                key={`${side}-${pageNumber}-slot-${absoluteSlotNum}`}
                className="w-[92px] h-[130px] sm:w-[110px] sm:h-[156px] md:w-[122px] md:h-[172px] lg:w-[128px] lg:h-[181px] flex items-center justify-center rounded-lg sm:rounded-xl bg-slate-950/60 border border-slate-800/60 relative group transition-all"
              >
                {card ? (
                  /* Filled Card Slot */
                  (() => {
                    const isCardLocked = isLoggedIn && userOwnedCardIds ? !userOwnedCardIds.has(card.id) : false;
                    return (
                      <div
                        className={`transform transition-transform duration-200 ${
                          !isFlipLeaf && !isCardLocked
                            ? 'hover:scale-[1.07] hover:z-30 cursor-pointer'
                            : isCardLocked
                            ? 'cursor-default select-none'
                            : ''
                        } flex items-center justify-center`}
                        onClick={() => {
                          if (!isAnimating && !isCardLocked && onInspectCard) {
                            onInspectCard(card);
                          }
                        }}
                        title={
                          isCardLocked
                            ? `Carta #${card.cardNumber} - Bloqueada (No Obtenida)`
                            : `${card.title} (#${card.cardNumber}) - Clic para inspeccionar`
                        }
                      >
                        <div className="hidden lg:block">
                          <TcgCard
                            card={card}
                            scale={0.40}
                            isLocked={isCardLocked}
                            interactive={!isCardLocked && !isFlipLeaf && !isAnimating}
                            showBackFlipBtn={false}
                          />
                        </div>
                        <div className="hidden md:block lg:hidden">
                          <TcgCard
                            card={card}
                            scale={0.38}
                            isLocked={isCardLocked}
                            interactive={!isCardLocked && !isFlipLeaf && !isAnimating}
                            showBackFlipBtn={false}
                          />
                        </div>
                        <div className="hidden sm:block md:hidden">
                          <TcgCard
                            card={card}
                            scale={0.34}
                            isLocked={isCardLocked}
                            interactive={!isCardLocked && !isFlipLeaf && !isAnimating}
                            showBackFlipBtn={false}
                          />
                        </div>
                        <div className="block sm:hidden">
                          <TcgCard
                            card={card}
                            scale={0.28}
                            isLocked={isCardLocked}
                            interactive={!isCardLocked && !isFlipLeaf && !isAnimating}
                            showBackFlipBtn={false}
                          />
                        </div>
                      </div>
                    );
                  })()
                ) : isWithin150 ? (
                  /* Empty Numbered Sleeve Slot */
                  <div className="w-full h-full rounded-lg sm:rounded-xl border border-dashed border-slate-800/60 flex flex-col items-center justify-center text-slate-700/60 space-y-0.5 select-none hover:border-slate-700 hover:text-slate-600 transition-colors">
                    <Layers className="w-3.5 h-3.5 stroke-[1.2]" />
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-500">
                      #{slotFormatted}
                    </span>
                    <span className="text-[7px] font-mono uppercase tracking-wider text-slate-600">
                      Vacío
                    </span>
                  </div>
                ) : (
                  /* Out of 150 bounds padding */
                  <div className="w-full h-full rounded-lg sm:rounded-xl border border-slate-900/30 bg-slate-950/20" />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Footer of Page */}
        <div className="pt-1 mt-0.5 border-t border-slate-800/70 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-slate-500">
          <span>
            {pageStartSlot <= TOTAL_ALBUM_SLOTS
              ? `Ranuras #${String(pageStartSlot).padStart(3, '0')} - #${String(pageEndSlot).padStart(3, '0')}`
              : 'Final del Álbum'}
          </span>
          <span>Pág. {pageNumber} / {totalPages * 2}</span>
        </div>
      </div>
    );
  };

  // Page Numbers
  const curLeftPageNum = currentSpreadIndex * 2 + 1;
  const curRightPageNum = currentSpreadIndex * 2 + 2;

  // Base Left Page to show
  let baseLeftPageNum = curLeftPageNum;
  if (turnState === 'next-phase2') {
    baseLeftPageNum = (currentSpreadIndex + 1) * 2 + 1;
  } else if (turnState === 'prev-phase1' || turnState === 'prev-phase2') {
    baseLeftPageNum = (currentSpreadIndex - 1) * 2 + 1;
  }

  // Base Right Page to show
  let baseRightPageNum = curRightPageNum;
  if (turnState === 'next-phase1' || turnState === 'next-phase2') {
    baseRightPageNum = (currentSpreadIndex + 1) * 2 + 2;
  } else if (turnState === 'prev-phase2') {
    baseRightPageNum = (currentSpreadIndex - 1) * 2 + 2;
  }

  return (
    <div className="w-full flex flex-col items-center justify-center select-none py-0 space-y-1 animate-in fade-in duration-300">
      {/* Continuous Momentum Physics Keyframes */}
      <style>{`
        @keyframes foldRightAccelerate {
          0% {
            transform: rotateY(0deg) translateZ(0px);
            filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3));
          }
          100% {
            transform: rotateY(-90deg) translateZ(35px);
            filter: drop-shadow(-20px 20px 30px rgba(0,0,0,0.9));
          }
        }

        @keyframes unfoldLeftDecelerate {
          0% {
            transform: rotateY(90deg) translateZ(35px);
            filter: drop-shadow(20px 20px 30px rgba(0,0,0,0.9));
          }
          100% {
            transform: rotateY(0deg) translateZ(0px);
            filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3));
          }
        }

        @keyframes foldLeftAccelerate {
          0% {
            transform: rotateY(0deg) translateZ(0px);
            filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3));
          }
          100% {
            transform: rotateY(90deg) translateZ(35px);
            filter: drop-shadow(20px 20px 30px rgba(0,0,0,0.9));
          }
        }

        @keyframes unfoldRightDecelerate {
          0% {
            transform: rotateY(-90deg) translateZ(35px);
            filter: drop-shadow(-20px 20px 30px rgba(0,0,0,0.9));
          }
          100% {
            transform: rotateY(0deg) translateZ(0px);
            filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3));
          }
        }
      `}</style>

      {/* Top Header Bar */}
      <div className="w-full max-w-[1240px] flex flex-col sm:flex-row items-center justify-between gap-2 px-2 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#610F4E] border border-[#F50B8C]/40 flex items-center justify-center text-[#F50B8C] shadow-[0_0_10px_rgba(245,11,140,0.25)]">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-black text-[#F9F1F9] tracking-wide">
                Álbum TCG Coleccionista 4x3 (144 Cartas)
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#610F4E]/80 border border-[#F50B8C]/40 text-[#F9F1F9] hidden sm:inline-block">
                Hoja {currentSpreadIndex + 1} de {totalPages}
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Actions: Duplicates Button + Collection Progress */}
        <div className="flex items-center gap-2">
          {/* Button: Cartas repetidas x Sobre */}
          {isLoggedIn && onOpenDuplicateModal && (
            <button
              onClick={onOpenDuplicateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-[#610F4E] to-[#9146FF] hover:from-[#7a1362] hover:to-[#a35cfc] border border-[#F50B8C]/50 text-white text-xs font-bold shadow-md shadow-[#F50B8C]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              title="Canjear cartas repetidas por sobres de 3 cartas"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#F50B8C]" />
              <span>Cartas repetidas x Sobre</span>
              {typeof duplicatesCount === 'number' && duplicatesCount > 0 && (
                <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full bg-[#F50B8C] text-white">
                  {duplicatesCount}
                </span>
              )}
            </button>
          )}

          {/* User Collection Progress */}
          {isLoggedIn && userOwnedCardIds && (
            <div className="flex items-center gap-2.5 bg-[#290A30]/90 border border-[#610F4E] px-3 py-1.5 rounded-2xl shadow-sm">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-[#F9F1F9]">
                  Desbloqueadas: <span className="text-[#F50B8C] font-mono">{userOwnedCardIds.size}</span> / {TOTAL_ALBUM_SLOTS}
                </span>
                <div className="w-24 sm:w-32 h-1.5 bg-[#31213D] rounded-full overflow-hidden border border-[#610F4E]/60 mt-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#F50B8C] to-pink-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((userOwnedCardIds.size / TOTAL_ALBUM_SLOTS) * 100))}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-black font-mono text-[#F50B8C]">
                {Math.round((userOwnedCardIds.size / TOTAL_ALBUM_SLOTS) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main 3D Binder Book Stage */}
      <div className="w-full flex items-center justify-center relative px-2 sm:px-4">
        {/* Navigation Arrow Left */}
        <button
          onClick={handlePrevPage}
          disabled={currentSpreadIndex === 0 || isAnimating}
          className={`z-40 w-9 h-9 sm:w-11 sm:h-11 mr-1 sm:mr-3 rounded-full bg-[#290A30]/90 border border-[#610F4E] hover:border-[#F50B8C] text-[#F9F1F9] flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-90 cursor-pointer disabled:opacity-20 disabled:pointer-events-none ${
            currentSpreadIndex > 0 ? 'hover:scale-110 hover:shadow-[0_0_15px_rgba(245,11,140,0.3)]' : ''
          }`}
          title="Página anterior (Giro 3D)"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Double-Page Binder Container with 3D Perspective */}
        <div
          className="w-fit bg-gradient-to-b from-[#290A30] via-[#31213D] to-[#290A30] border-2 sm:border-[3px] border-[#610F4E] rounded-[24px] sm:rounded-[30px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.95),0_0_35px_rgba(0,0,0,0.75)] p-2 sm:p-3 relative select-none"
          style={{
            perspective: '2800px',
            boxShadow: 'inset 0 0 45px rgba(0,0,0,0.88), 0 20px 50px rgba(0,0,0,0.95), 0 0 1px 1px rgba(255,255,255,0.08)',
          }}
        >
          {/* Leather Center Spine with Metal Rings */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 sm:w-8 z-30 pointer-events-none flex flex-col justify-around items-center py-3.5">
            {/* Spine Shadow Crease */}
            <div className="absolute inset-y-0 w-3 sm:w-4 bg-gradient-to-r from-black/95 via-black/20 to-black/95 shadow-2xl" />

            {/* 6 Real Metallic Binder Rings */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-6 sm:w-8 h-2.5 sm:h-3 rounded-full bg-gradient-to-r from-slate-400 via-slate-100 to-slate-500 shadow-[0_3px_6px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.9)] border border-slate-600/80 z-30 relative"
              >
                <div className="absolute top-0.5 left-1 right-1 h-0.5 rounded-full bg-white/75 filter blur-[0.4px]" />
              </div>
            ))}
          </div>

          {/* Book Inner Spread Stage */}
          <div
            className="flex flex-row items-center gap-2.5 sm:gap-3.5 relative"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* 1. LEFT PAGE CONTAINER */}
            <div className="relative z-10" style={{ transformStyle: 'preserve-3d' }}>
              {renderPageFace(baseLeftPageNum, 'left')}

              {/* NEXT PHASE 2: New Left Page Unfolds 90° -> 0° */}
              {turnState === 'next-phase2' && (
                <div
                  className="absolute inset-0 z-40 pointer-events-none"
                  style={{
                    transformOrigin: '100% 50%',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    animation: `unfoldLeftDecelerate ${PHASE_DURATION_MS}ms cubic-bezier(0, 0, 0.2, 1) forwards`,
                  }}
                >
                  {renderPageFace((currentSpreadIndex + 1) * 2 + 1, 'left', true)}
                </div>
              )}

              {/* PREV PHASE 1: Current Left Page Folds 0° -> 90° */}
              {turnState === 'prev-phase1' && (
                <div
                  className="absolute inset-0 z-40 pointer-events-none"
                  style={{
                    transformOrigin: '100% 50%',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    animation: `foldLeftAccelerate ${PHASE_DURATION_MS}ms cubic-bezier(0.4, 0, 1, 1) forwards`,
                  }}
                >
                  {renderPageFace(curLeftPageNum, 'left', true)}
                </div>
              )}
            </div>

            {/* 2. RIGHT PAGE CONTAINER */}
            <div className="relative z-10" style={{ transformStyle: 'preserve-3d' }}>
              {renderPageFace(baseRightPageNum, 'right')}

              {/* NEXT PHASE 1: Current Right Page Folds 0° -> -90° */}
              {turnState === 'next-phase1' && (
                <div
                  className="absolute inset-0 z-40 pointer-events-none"
                  style={{
                    transformOrigin: '0% 50%',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    animation: `foldRightAccelerate ${PHASE_DURATION_MS}ms cubic-bezier(0.4, 0, 1, 1) forwards`,
                  }}
                >
                  {renderPageFace(curRightPageNum, 'right', true)}
                </div>
              )}

              {/* PREV PHASE 2: New Right Page Unfolds -90° -> 0° */}
              {turnState === 'prev-phase2' && (
                <div
                  className="absolute inset-0 z-40 pointer-events-none"
                  style={{
                    transformOrigin: '0% 50%',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    animation: `unfoldRightDecelerate ${PHASE_DURATION_MS}ms cubic-bezier(0, 0, 0.2, 1) forwards`,
                  }}
                >
                  {renderPageFace((currentSpreadIndex - 1) * 2 + 2, 'right', true)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Arrow Right */}
        <button
          onClick={handleNextPage}
          disabled={currentSpreadIndex >= totalPages - 1 || isAnimating}
          className={`z-40 w-9 h-9 sm:w-11 sm:h-11 ml-1 sm:ml-3 rounded-full bg-[#290A30]/90 border border-[#610F4E] hover:border-[#F50B8C] text-[#F9F1F9] flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-90 cursor-pointer disabled:opacity-20 disabled:pointer-events-none ${
            currentSpreadIndex < totalPages - 1 ? 'hover:scale-110 hover:shadow-[0_0_15px_rgba(245,11,140,0.3)]' : ''
          }`}
          title="Página siguiente (Giro 3D)"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
};
