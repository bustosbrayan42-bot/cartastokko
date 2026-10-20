import React, { useState, useEffect, useMemo } from 'react';
import type { CardData } from '../types/card';
import { playPageTurnSound } from '../utils/soundEffects';
import { getRenderedCardUrl, resolveImageUrl } from '../utils/imageHelper';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Layers,
  RefreshCw,
  Lock,
  Hash
} from 'lucide-react';

interface AlbumCardSlotProps {
  card: CardData;
  isCardLocked: boolean;
  cardScale?: number;
  onInspectCard?: (card: CardData) => void;
}

const AlbumCardSlot: React.FC<AlbumCardSlotProps> = React.memo(({
  card,
  isCardLocked,
  onInspectCard,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const renderedUrl = getRenderedCardUrl(card.cardNumber);

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center rounded-lg sm:rounded-xl overflow-hidden select-none transition-transform duration-150 ${
        !isCardLocked
          ? 'hover:scale-[1.04] hover:z-30 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-black/70'
          : 'cursor-default'
      }`}
      style={{ willChange: isCardLocked ? 'auto' : 'transform' }}
      onClick={() => {
        if (!isCardLocked && onInspectCard) {
          onInspectCard(card);
        }
      }}
      title={
        isCardLocked
          ? `Carta #${card.cardNumber} - Bloqueada (No Obtenida)`
          : `${card.title} (#${card.cardNumber}) - Clic para ver en detalle`
      }
    >
      {/* Skeleton loader background while image loads */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-900/60 animate-pulse rounded-lg sm:rounded-xl" />
      )}

      {/* Pre-rendered Card Image from Cloudflare R2 (Clean static image, no rarity foil/3D lag in album) */}
      <img
        src={hasError ? resolveImageUrl(card.image) : renderedUrl}
        alt={card.title || `Carta #${card.cardNumber}`}
        className={`w-full h-full object-contain rounded-lg sm:rounded-xl transition-all duration-200 ${
          isCardLocked
            ? 'grayscale brightness-[0.38] contrast-[0.85]'
            : 'brightness-[0.98] hover:brightness-105'
        } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
      />

      {/* Lock Overlay for locked cards */}
      {isCardLocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-1 sm:p-2 text-center pointer-events-none select-none bg-black/40">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-900/90 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-md mb-1">
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[8px] sm:text-[9.5px] font-mono font-black uppercase tracking-wider text-[#F9F1F9] bg-[#610F4E]/90 px-1.5 py-0.5 rounded-full border border-[#F50B8C]/40 shadow-sm mb-0.5">
            No Obtenida
          </span>
          <span className="text-[8px] sm:text-[9px] font-mono font-bold text-slate-300">
            #{String(card.cardNumber).padStart(3, '0')}
          </span>
        </div>
      )}
    </div>
  );
});

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
  const TOTAL_SINGLE_PAGES = Math.ceil(TOTAL_ALBUM_SLOTS / CARDS_PER_PAGE); // 12 Páginas
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState<number>(0);
  const [mobilePage, setMobilePage] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });
  const [sortBy, setSortBy] = useState<'number' | 'rarity'>('number');

  // Sorted cards based on sort mode (both ascending: menor a mayor)
  const sortedCards = useMemo(() => {
    const list = [...cards];
    if (sortBy === 'rarity') {
      // Rarity order from lowest to highest:
      // Común (1) -> Poco Común (2) -> Rara (3) -> Súper Rara (4) -> Ultra Rara (5) -> Rara Secreta (6)
      const rarityRank: Record<string, number> = {
        common: 1,
        uncommon: 2,
        rare: 3,
        super_rare: 4,
        ultra_rare: 5,
        secret_rare: 6,
      };

      return list.sort((a, b) => {
        const rankA = rarityRank[a.rarity] || 1;
        const rankB = rarityRank[b.rarity] || 1;
        if (rankA !== rankB) {
          return rankA - rankB;
        }
        const numA = parseInt(a.cardNumber, 10) || 0;
        const numB = parseInt(b.cardNumber, 10) || 0;
        return numA - numB;
      });
    }

    // Default: Sort by cardNumber ascending (#001 -> #140)
    return list.sort((a, b) => {
      const numA = parseInt(a.cardNumber, 10) || 0;
      const numB = parseInt(b.cardNumber, 10) || 0;
      return numA - numB;
    });
  }, [cards, sortBy]);

  // Responsive scale hook for single-instance card rendering
  const [cardScale, setCardScale] = useState<number>(() => {
    if (typeof window === 'undefined') return 0.45;
    const w = window.innerWidth;
    if (w >= 1280) return 0.45;
    if (w >= 1024) return 0.41;
    if (w >= 768) return 0.38;
    if (w >= 640) return 0.34;
    return 0.28;
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      if (w >= 1280) setCardScale(0.45);
      else if (w >= 1024) setCardScale(0.41);
      else if (w >= 768) setCardScale(0.38);
      else if (w >= 640) setCardScale(0.34);
      else setCardScale(0.28);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Intelligent prefetching of rendered card images for adjacent spreads (next & previous)
  useEffect(() => {
    const prefetchSpread = (spreadIdx: number) => {
      if (spreadIdx < 0 || spreadIdx >= totalPages) return;
      const start = spreadIdx * CARDS_PER_SPREAD;
      const end = Math.min(sortedCards.length, (spreadIdx + 1) * CARDS_PER_SPREAD);
      for (let i = start; i < end; i++) {
        const card = sortedCards[i];
        if (card && card.cardNumber) {
          const img = new Image();
          img.src = getRenderedCardUrl(card.cardNumber);
        }
      }
    };

    // Prefetch next and previous pages when idle after initial render
    const timer = setTimeout(() => {
      prefetchSpread(currentSpreadIndex + 1);
      prefetchSpread(currentSpreadIndex - 1);
    }, 120);

    return () => clearTimeout(timer);
  }, [currentSpreadIndex, sortedCards, totalPages]);

  // Direct, instant page navigation (no heavy 3D rendering overhead)
  const handleNextPage = () => {
    if (isMobile) {
      if (mobilePage >= TOTAL_SINGLE_PAGES) return;
      playPageTurnSound();
      const next = mobilePage + 1;
      setMobilePage(next);
      setCurrentSpreadIndex(Math.floor((next - 1) / 2));
    } else {
      if (currentSpreadIndex >= totalPages - 1) return;
      playPageTurnSound();
      const nextSpread = currentSpreadIndex + 1;
      setCurrentSpreadIndex(nextSpread);
      setMobilePage(nextSpread * 2 + 1);
    }
  };

  const handlePrevPage = () => {
    if (isMobile) {
      if (mobilePage <= 1) return;
      playPageTurnSound();
      const prev = mobilePage - 1;
      setMobilePage(prev);
      setCurrentSpreadIndex(Math.floor((prev - 1) / 2));
    } else {
      if (currentSpreadIndex <= 0) return;
      playPageTurnSound();
      const prevSpread = currentSpreadIndex - 1;
      setCurrentSpreadIndex(prevSpread);
      setMobilePage(prevSpread * 2 + 1);
    }
  };

  // Render a Mobile 3x4 single-page face (3 cols x 4 rows = 12 cards per page, 100% responsive)
  const renderMobilePageFace = (pageNumber: number) => {
    const pageStartSlot = (pageNumber - 1) * CARDS_PER_PAGE + 1;
    const pageEndSlot = Math.min(TOTAL_ALBUM_SLOTS, pageNumber * CARDS_PER_PAGE);

    return (
      <div
        className="w-full max-w-[420px] mx-auto rounded-[20px] p-2 sm:p-2.5 border-2 border-[#610F4E] shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_10px_30px_rgba(0,0,0,0.9)] flex flex-col justify-between relative select-none"
        style={{
          contain: 'paint layout',
          background: 'linear-gradient(135deg, rgba(49,33,61,0.98) 0%, rgba(41,10,48,0.99) 100%)',
        }}
      >
        {/* Mobile Header of Page */}
        <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-[#610F4E]/70 text-[10px] font-mono text-[#B894B3]">
          <span className="flex items-center gap-1 text-[#F50B8C] font-bold">
            <Sparkles className="w-3 h-3" />
            PÁGINA {pageNumber}
          </span>
          <span className="tracking-wider uppercase text-[#B894B3]/70 text-[8px]">TOKKII BINDER</span>
        </div>

        {/* 3x4 CARDS GRID (3 Horizontal x 4 Vertical = 12 Slots per Page) */}
        <div className="grid grid-cols-3 gap-1.5 xs:gap-2 justify-center items-center py-1">
          {[...Array(12)].map((_, slotIdx) => {
            const absoluteSlotNum = (pageNumber - 1) * CARDS_PER_PAGE + slotIdx + 1;
            const isWithin150 = absoluteSlotNum <= TOTAL_ALBUM_SLOTS;
            const card = isWithin150 ? sortedCards[absoluteSlotNum - 1] : undefined;
            const slotFormatted = String(absoluteSlotNum).padStart(3, '0');

            return (
              <div
                key={`mobile-${pageNumber}-slot-${absoluteSlotNum}`}
                className="w-full aspect-[63/88] flex items-center justify-center rounded-lg bg-slate-950/60 border border-slate-800/60 relative group transition-all overflow-hidden"
              >
                {card ? (
                  <AlbumCardSlot
                    card={card}
                    isCardLocked={!isLoggedIn || !userOwnedCardIds || !userOwnedCardIds.has(card.id)}
                    cardScale={cardScale}
                    onInspectCard={onInspectCard}
                  />
                ) : isWithin150 ? (
                  <div className="w-full h-full rounded-lg border border-dashed border-slate-800/60 flex flex-col items-center justify-center text-slate-700/60 space-y-0.5 select-none hover:border-slate-700 hover:text-slate-600 transition-colors">
                    <Layers className="w-3.5 h-3.5 stroke-[1.2]" />
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      #{slotFormatted}
                    </span>
                    <span className="text-[7px] font-mono uppercase tracking-wider text-slate-600">
                      Vacío
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-lg border border-slate-900/30 bg-slate-950/20" />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Footer of Page */}
        <div className="pt-1.5 mt-1 border-t border-slate-800/70 flex items-center justify-between text-[9px] font-mono text-slate-400">
          <span>
            {pageStartSlot <= TOTAL_ALBUM_SLOTS
              ? `Ranuras #${String(pageStartSlot).padStart(3, '0')} - #${String(pageEndSlot).padStart(3, '0')}`
              : 'Final del Álbum'}
          </span>
          <span className="font-bold text-[#F50B8C]">Pág. {pageNumber} / {TOTAL_SINGLE_PAGES}</span>
        </div>
      </div>
    );
  };

  // Render a 4x3 page face (calibrated precisely to maximize viewport usage with ZERO scroll)
  const renderPageFace = (
    pageNumber: number,
    side: 'left' | 'right'
  ) => {
    const pageStartSlot = (pageNumber - 1) * CARDS_PER_PAGE + 1;
    const pageEndSlot = Math.min(TOTAL_ALBUM_SLOTS, pageNumber * CARDS_PER_PAGE);

    return (
      <div
        className="w-[410px] sm:w-[490px] md:w-[535px] lg:w-[575px] xl:w-[635px] h-[500px] sm:h-[555px] md:h-[585px] lg:h-[615px] xl:h-[675px] rounded-[22px] sm:rounded-[26px] p-2 sm:p-2.5 md:p-3 border border-slate-800/80 shadow-[inset_0_0_25px_rgba(0,0,0,0.7)] flex flex-col justify-between relative overflow-hidden select-none"
        style={{
          contain: 'paint layout',
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
              <span className="tracking-wider uppercase text-[#B894B3]/70 text-[8px]">TOKKII BINDER</span>
            </>
          ) : (
            <>
              <span className="tracking-wider uppercase text-[#B894B3]/70 text-[8px]">TOKKII BINDER</span>
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
            const card = isWithin150 ? sortedCards[absoluteSlotNum - 1] : undefined;
            const slotFormatted = String(absoluteSlotNum).padStart(3, '0');

            return (
              <div
                key={`${side}-${pageNumber}-slot-${absoluteSlotNum}`}
                className="w-[92px] h-[130px] sm:w-[110px] sm:h-[156px] md:w-[122px] md:h-[172px] lg:w-[130px] lg:h-[184px] xl:w-[145px] xl:h-[204px] flex items-center justify-center rounded-lg sm:rounded-xl bg-slate-950/60 border border-slate-800/60 relative group transition-all"
              >
                {card ? (
                  <AlbumCardSlot
                    card={card}
                    isCardLocked={!isLoggedIn || !userOwnedCardIds || !userOwnedCardIds.has(card.id)}
                    cardScale={cardScale}
                    onInspectCard={onInspectCard}
                  />
                ) : isWithin150 ? (
                  <div className="w-full h-full rounded-lg sm:rounded-xl border border-dashed border-slate-800/60 flex flex-col items-center justify-center text-slate-700/60 space-y-0.5 select-none hover:border-slate-700 hover:text-slate-600 transition-colors">
                    <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.2]" />
                    <span className="text-[10px] sm:text-[11px] xl:text-[12px] font-mono font-bold text-slate-500">
                      #{slotFormatted}
                    </span>
                    <span className="text-[7px] sm:text-[8px] font-mono uppercase tracking-wider text-slate-600">
                      Vacío
                    </span>
                  </div>
                ) : (
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
  const leftPageNum = currentSpreadIndex * 2 + 1;
  const rightPageNum = currentSpreadIndex * 2 + 2;

  return (
    <div className="w-full flex flex-col items-center justify-center select-none py-1 space-y-3 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="w-full max-w-[850px] sm:max-w-[1014px] md:max-w-[1114px] lg:max-w-[1194px] xl:max-w-[1314px] flex flex-col sm:flex-row items-center justify-between gap-3 px-1 sm:px-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#610F4E] border border-[#F50B8C]/40 flex items-center justify-center text-[#F50B8C] shadow-[0_0_12px_rgba(245,11,140,0.3)]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xs sm:text-sm md:text-base font-black text-[#F9F1F9] tracking-wide">
                Álbum TCG Coleccionista (144 Cartas)
              </h2>
              <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#610F4E]/90 border border-[#F50B8C]/40 text-[#F9F1F9] shadow-sm">
                {isMobile ? `Pág. ${mobilePage} de ${TOTAL_SINGLE_PAGES}` : `Hoja ${currentSpreadIndex + 1} de ${totalPages}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Actions: Sort Switch + Duplicates Button + Collection Progress */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {/* Switch: Ordenar por Número vs Rareza */}
          <div className="flex items-center bg-[#290A30]/90 border border-[#610F4E] p-0.5 sm:p-1 rounded-2xl shadow-sm">
            <button
              type="button"
              onClick={() => {
                setSortBy('number');
                setCurrentSpreadIndex(0);
                setMobilePage(1);
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'number'
                  ? 'bg-[#F50B8C] text-white shadow-md shadow-[#F50B8C]/35 font-black'
                  : 'text-[#B894B3] hover:text-[#F9F1F9]'
              }`}
              title="Ordenar de menor a mayor por Número de Carta (#001 → #140)"
            >
              <Hash className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Nº Carta</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSortBy('rarity');
                setCurrentSpreadIndex(0);
                setMobilePage(1);
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'rarity'
                  ? 'bg-[#F50B8C] text-white shadow-md shadow-[#F50B8C]/35 font-black'
                  : 'text-[#B894B3] hover:text-[#F9F1F9]'
              }`}
              title="Ordenar de menor a mayor por Rareza (Común → Poco Común → Rara → Súper Rara → Ultra Rara → Secreta)"
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Rareza</span>
            </button>
          </div>

          {/* Button: Cartas repetidas x Sobre */}
          {isLoggedIn && onOpenDuplicateModal && (
            <button
              onClick={onOpenDuplicateModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#F50B8C] hover:bg-[#D00976] border border-[#F50B8C]/80 text-white text-xs font-black shadow-md shadow-[#F50B8C]/35 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              title="Canjear cartas repetidas por sobres de 3 cartas"
            >
              <RefreshCw className="w-3.5 h-3.5 text-white" />
              <span>Cartas repetidas x Sobre</span>
              {typeof duplicatesCount === 'number' && duplicatesCount > 0 && (
                <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full bg-white text-[#F50B8C] shadow-sm">
                  {duplicatesCount}
                </span>
              )}
            </button>
          )}

          {/* User Collection Progress / Login reminder */}
          {isLoggedIn && userOwnedCardIds ? (
            <div className="flex items-center gap-3 bg-[#290A30]/90 border border-[#610F4E] px-3.5 py-1.5 rounded-2xl shadow-sm">
              <div className="flex flex-col items-end">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#F9F1F9]">
                  Desbloqueadas: <span className="text-[#F50B8C] font-mono">{userOwnedCardIds.size}</span> / {TOTAL_ALBUM_SLOTS}
                </span>
                <div className="w-24 sm:w-32 md:w-36 h-1.5 bg-[#31213D] rounded-full overflow-hidden border border-[#610F4E]/60 mt-0.5">
                  <div
                    className="h-full bg-[#F50B8C] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((userOwnedCardIds.size / TOTAL_ALBUM_SLOTS) * 100))}%` }}
                  />
                </div>
              </div>
              <span className="text-xs sm:text-sm font-black font-mono text-[#F50B8C]">
                {Math.round((userOwnedCardIds.size / TOTAL_ALBUM_SLOTS) * 100)}%
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-[#290A30]/90 border border-[#610F4E]/70 px-3 py-1.5 rounded-2xl shadow-sm">
              <Lock className="w-3.5 h-3.5 text-[#F50B8C]" />
              <span className="text-[10px] sm:text-[11px] font-bold text-[#B894B3]">
                Inicia sesión con Twitch para ver tu colección
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Binder Book Stage */}
      <div className="w-full flex items-center justify-center relative px-1 sm:px-4">
        {/* Navigation Arrow Left */}
        <button
          onClick={handlePrevPage}
          disabled={isMobile ? mobilePage <= 1 : currentSpreadIndex === 0}
          className={`z-40 w-8 h-8 sm:w-11 sm:h-11 mr-1 sm:mr-3 rounded-full bg-[#290A30]/90 border border-[#610F4E] hover:border-[#F50B8C] text-[#F9F1F9] flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-90 cursor-pointer disabled:opacity-20 disabled:pointer-events-none ${
            (isMobile ? mobilePage > 1 : currentSpreadIndex > 0) ? 'hover:scale-110 hover:shadow-[0_0_15px_rgba(245,11,140,0.3)]' : ''
          }`}
          title="Página anterior"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Binder Stage: Single Page for Mobile vs Dual Spread for Desktop */}
        {isMobile ? (
          <div className="flex-1 max-w-[420px] mx-auto">
            {renderMobilePageFace(mobilePage)}
          </div>
        ) : (
          <div
            className="w-fit bg-gradient-to-b from-[#290A30] via-[#31213D] to-[#290A30] border-2 sm:border-[3px] border-[#610F4E] rounded-[24px] sm:rounded-[30px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.95),0_0_35px_rgba(0,0,0,0.75)] p-2 sm:p-3 relative select-none"
            style={{
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
            <div className="flex flex-row items-center gap-2.5 sm:gap-3.5 relative">
              {/* 1. LEFT PAGE */}
              <div className="relative z-10">
                {renderPageFace(leftPageNum, 'left')}
              </div>

              {/* 2. RIGHT PAGE */}
              <div className="relative z-10">
                {renderPageFace(rightPageNum, 'right')}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Arrow Right */}
        <button
          onClick={handleNextPage}
          disabled={isMobile ? mobilePage >= TOTAL_SINGLE_PAGES : currentSpreadIndex >= totalPages - 1}
          className={`z-40 w-8 h-8 sm:w-11 sm:h-11 ml-1 sm:ml-3 rounded-full bg-[#290A30]/90 border border-[#610F4E] hover:border-[#F50B8C] text-[#F9F1F9] flex items-center justify-center shadow-2xl backdrop-blur-md transition-all active:scale-90 cursor-pointer disabled:opacity-20 disabled:pointer-events-none ${
            (isMobile ? mobilePage < TOTAL_SINGLE_PAGES : currentSpreadIndex < totalPages - 1) ? 'hover:scale-110 hover:shadow-[0_0_15px_rgba(245,11,140,0.3)]' : ''
          }`}
          title="Página siguiente"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
};
