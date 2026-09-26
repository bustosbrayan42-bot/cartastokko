import React, { useRef, useState, useCallback } from 'react';
import type { CardData } from '../types/card';
import { RARITY_CONFIGS } from '../data/rarityConfigs';
import { ELEMENT_CONFIGS } from '../data/elementConfigs';
import { playCardFlipSound, playCardHoverSound, playSparkleSound } from '../utils/soundEffects';
import { resolveImageUrl } from '../utils/imageHelper';
import { RotateCw } from 'lucide-react';

interface TcgCardProps {
  card: CardData;
  scale?: number;
  isFlipped?: boolean;
  onFlipToggle?: () => void;
  onClick?: () => void;
  showBackFlipBtn?: boolean;
  interactive?: boolean;
  showFullDetails?: boolean;
  className?: string;
  enableSound?: boolean;
}

export const TcgCard: React.FC<TcgCardProps> = ({
  card,
  scale = 1,
  isFlipped = false,
  onFlipToggle,
  onClick,
  showBackFlipBtn = true,
  interactive = true,
  showFullDetails = true,
  className = '',
  enableSound = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalFlipped, setInternalFlipped] = useState(isFlipped);
  const [transformStyle, setTransformStyle] = useState({
    rotX: 0,
    rotY: 0,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
    holoAngle: 135,
  });
  const [isHovered, setIsHovered] = useState(false);

  const rarityConfig = RARITY_CONFIGS[card.rarity] || RARITY_CONFIGS.common;
  const elementConfig = ELEMENT_CONFIGS[card.element] || ELEMENT_CONFIGS.impulso;
  const actualFlipped = onFlipToggle ? isFlipped : internalFlipped;

  const isFullArtMode = card.rarity === 'secret_rare' || card.isFullArt;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;

      // Smooth gentle tilt angle (max +/- 8.5 degrees)
      const rotY = ((x - rect.width / 2) / (rect.width / 2)) * 8.5;
      const rotX = -((y - rect.height / 2) / (rect.height / 2)) * 8.5;

      const angle = Math.atan2(y - rect.height / 2, x - rect.width / 2) * (180 / Math.PI) + 180;

      setTransformStyle({
        rotX,
        rotY,
        glareX: percentX,
        glareY: percentY,
        glareOpacity: Math.min(0.28, Math.hypot(percentX - 50, percentY - 50) / 75),
        holoAngle: angle,
      });
    },
    [interactive]
  );

  const handleMouseEnter = () => {
    if (!interactive) return;
    setIsHovered(true);
    if (enableSound) playCardHoverSound();
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setIsHovered(false);
    setTransformStyle((prev) => ({
      ...prev,
      rotX: 0,
      rotY: 0,
      glareOpacity: 0,
    }));
  };

  const handleFlip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (enableSound) playCardFlipSound();
    if (card.rarity === 'secret_rare' || card.rarity === 'ultra_rare') {
      if (enableSound) playSparkleSound();
    }
    if (onFlipToggle) {
      onFlipToggle();
    } else {
      setInternalFlipped(!internalFlipped);
    }
  };

  const getHoloClass = () => {
    switch (rarityConfig.holoStyle) {
      case 'silver':
        return 'holo-silver';
      case 'prismatic':
        return 'holo-prismatic';
      case 'gold_stars':
        return 'holo-gold-stars';
      case 'cosmic':
        return 'holo-cosmic';
      case 'secret_gold':
        return 'holo-secret-gold';
      default:
        return '';
    }
  };

  // Image transform with Zoom, 360 Rotation, and Offsets
  const imageTransformStyle: React.CSSProperties = {
    transform: `translate(${card.imageOffsetX || 0}px, ${card.imageOffsetY || 0}px) rotate(${card.imageRotation || 0}deg) scale(${card.imageZoom || 1})`,
    transformOrigin: 'center center',
  };

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`card-perspective-container inline-block select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <div
        className={`card-3d-root relative rounded-[20px] shadow-2xl pointer-events-none ${
          !isHovered ? 'is-animating' : ''
        }`}
        style={
          {
            width: '320px',
            height: '450px',
            transform: `rotateX(${transformStyle.rotX}deg) rotateY(${
              actualFlipped ? transformStyle.rotY + 180 : transformStyle.rotY
            }deg)`,
            boxShadow: isHovered
              ? `0 20px 35px -8px ${rarityConfig.glowColor}, 0 0 15px ${rarityConfig.glowColor}`
              : `0 12px 24px -8px rgba(0,0,0,0.6), 0 0 8px ${rarityConfig.glowColor}`,
            '--mouse-x': `${transformStyle.glareX}%`,
            '--mouse-y': `${transformStyle.glareY}%`,
            '--glare-opacity': `${transformStyle.glareOpacity}`,
            '--holo-angle': `${transformStyle.holoAngle}deg`,
          } as React.CSSProperties
        }
      >
        {/* CARD FRONT */}
        <div
          className="card-face absolute inset-0 rounded-[20px] overflow-hidden p-[10px] flex flex-col justify-between border-2"
          style={{
            borderColor: rarityConfig.borderColor,
            background: isFullArtMode
              ? '#0f172a'
              : card.rarity === 'ultra_rare'
              ? 'linear-gradient(135deg, #2e1065 0%, #1e1b4b 50%, #030712 100%)'
              : card.rarity === 'super_rare'
              ? 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #1c1917 100%)'
              : card.rarity === 'rare'
              ? 'linear-gradient(135deg, #3b0764 0%, #1e1b4b 50%, #090d16 100%)'
              : card.rarity === 'uncommon'
              ? 'linear-gradient(135deg, #0c4a6e 0%, #1e293b 50%, #0f172a 100%)'
              : 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #090d16 100%)',
          }}
        >
          {/* FULL ART BACKGROUND IMAGE (When Secret Rare or Full Art) */}
          {isFullArtMode && (
            <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center bg-slate-950">
              <img
                src={resolveImageUrl(card.image)}
                alt={card.title}
                className={`w-full h-full ${
                  card.imageFit === 'contain' ? 'object-contain' : 'object-cover'
                } object-center transition-transform duration-75`}
                style={imageTransformStyle}
                loading="lazy"
              />
            </div>
          )}

          {/* Full Card Holographic Foil Overlay */}
          {card.rarity !== 'common' && (
            <div
              className={`absolute inset-0 rounded-[18px] ${getHoloClass()} ${
                isFullArtMode ? 'opacity-40 mix-blend-overlay' : 'opacity-75'
              } z-20 pointer-events-none`}
            />
          )}

          {/* Glare Flare */}
          <div className="card-glare z-30 pointer-events-none" />

          {/* Sparkles for Super/Ultra/Secret Rare */}
          {(card.rarity === 'secret_rare' || card.rarity === 'ultra_rare') && (
            <>
              <div className="absolute top-8 left-8 text-amber-300 text-sm animate-sparkle-1 pointer-events-none z-30 opacity-80">
                ✦
              </div>
              <div className="absolute bottom-20 right-8 text-cyan-300 text-sm animate-sparkle-2 pointer-events-none z-30 opacity-80">
                ★
              </div>
              <div className="absolute top-1/2 right-6 text-fuchsia-300 text-xs animate-sparkle-3 pointer-events-none z-30 opacity-80">
                ✦
              </div>
            </>
          )}

          {/* =========================================
              FULL ART LAYOUT (Secret Rare / Full Art)
             ========================================= */}
          {isFullArtMode ? (
            <div className="relative z-20 flex flex-col justify-between h-full w-full">
              {/* Floating Frosted Header */}
              <div className="bg-black/55 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="text-base leading-none" title={elementConfig.name}>
                    {elementConfig.symbol}
                  </span>
                  <div className="truncate text-left">
                    <div className="font-bold text-[13px] tracking-wide text-white truncate drop-shadow leading-tight">
                      {card.title}
                    </div>
                    <div className="text-[9px] text-amber-300 font-medium truncate leading-none">
                      {card.subtitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter drop-shadow">
                    HP
                  </span>
                  <span className="font-black text-sm text-red-400 drop-shadow">{card.hp}</span>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md"
                    style={{ backgroundColor: elementConfig.color, color: '#000' }}
                  >
                    {elementConfig.symbol}
                  </span>
                </div>
              </div>

              {/* Rarity Watermark Badge Top Right */}
              <div className="self-end mr-1 my-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/40 text-[9px] font-black tracking-widest text-white shadow flex items-center gap-1">
                <span className="text-amber-300">{rarityConfig.shortName}</span>
                <span className="text-[8px] text-amber-300">
                  {'★'.repeat(rarityConfig.stars)}
                </span>
                <span className="text-[7px] text-emerald-300 uppercase font-mono ml-0.5">
                  SECRET
                </span>
              </div>

              {/* Center space is 100% open and transparent to see the image completely! */}
              <div className="flex-1" />

              {/* Floating Frosted Bottom Box (Ability & Stats) */}
              <div className="space-y-1">
                {showFullDetails && (
                  <div className="bg-black/65 backdrop-blur-md rounded-xl p-2 border border-white/20 shadow-xl text-left flex flex-col gap-1">
                    {card.abilityName && (
                      <div className="border-b border-white/10 pb-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {card.abilityCost?.map((c, i) => (
                              <span
                                key={i}
                                className="w-3.5 h-3.5 rounded-full bg-slate-900/90 border border-slate-600 flex items-center justify-center text-[8px]"
                                title={c}
                              >
                                {ELEMENT_CONFIGS[c as keyof typeof ELEMENT_CONFIGS]?.symbol || '•'}
                              </span>
                            ))}
                            <span className="font-bold text-[11px] text-amber-300 tracking-tight drop-shadow">
                              {card.abilityName}
                            </span>
                          </div>
                          {card.abilityDamage && (
                            <span className="font-extrabold text-[12px] text-white drop-shadow">
                              {card.abilityDamage}
                            </span>
                          )}
                        </div>
                        {card.abilityDesc && (
                          <p className="text-[9px] text-slate-200 leading-tight mt-0.5 line-clamp-2">
                            {card.abilityDesc}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Flavor Text */}
                    <p className="text-[8px] italic text-amber-200/90 line-clamp-1 leading-none">
                      "{card.flavorText}"
                    </p>

                    {/* Attributes */}
                    <div className="flex items-center justify-between text-[8px] text-slate-300 pt-0.5 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <span>
                          Debilidad:{' '}
                          {card.weakness ? (
                            <span className="text-red-400 font-bold">
                              {ELEMENT_CONFIGS[card.weakness]?.symbol} x2
                            </span>
                          ) : (
                            '--'
                          )}
                        </span>
                        <span>
                          Resistencia:{' '}
                          {card.resistance ? (
                            <span className="text-sky-400 font-bold">
                              {ELEMENT_CONFIGS[card.resistance]?.symbol} -30
                            </span>
                          ) : (
                            '--'
                          )}
                        </span>
                      </div>
                      <div>
                        Retirada:{' '}
                        <span className="text-amber-300 font-bold">
                          {'⚪'.repeat(card.retreatCost || 1)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Art Footer */}
                <div className="px-1.5 py-0.5 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-between text-[8px] text-slate-300 border border-white/10">
                  <div className="truncate flex items-center gap-1">
                    <span className="text-slate-400">Ilus.</span>
                    <span className="font-medium text-amber-300 truncate">{card.artist}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono">
                    <span className="font-bold text-white">
                      {card.cardNumber}/{card.totalInSet}
                    </span>
                    <span className="px-1 py-0.2 rounded font-black text-[8px] bg-emerald-500/30 text-emerald-300 border border-emerald-400/50">
                      SEC ★
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================
                STANDARD FRAMED LAYOUT (Common - Ultra)
               ========================================= */
            <>
              {/* CARD HEADER */}
              <div className="relative z-10 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-t-[12px] border border-slate-700/60 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="text-base leading-none" title={elementConfig.name}>
                    {elementConfig.symbol}
                  </span>
                  <div className="truncate text-left">
                    <div className="font-bold text-[13px] tracking-wide text-white truncate drop-shadow-sm leading-tight">
                      {card.title}
                    </div>
                    <div className="text-[9px] text-slate-300 font-medium truncate leading-none">
                      {card.subtitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    HP
                  </span>
                  <span className="font-black text-sm text-red-400 drop-shadow">{card.hp}</span>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-inner"
                    style={{ backgroundColor: elementConfig.color, color: '#000' }}
                  >
                    {elementConfig.symbol}
                  </span>
                </div>
              </div>

              {/* CARD ARTWORK FRAME */}
              <div
                className="relative flex-1 my-1.5 rounded-[10px] overflow-hidden border-2 bg-slate-950 flex items-center justify-center shadow-inner"
                style={{
                  borderColor:
                    card.rarity === 'ultra_rare'
                      ? '#f472b6'
                      : card.rarity === 'super_rare'
                      ? '#facc15'
                      : card.rarity === 'rare'
                      ? '#c084fc'
                      : card.rarity === 'uncommon'
                      ? '#38bdf8'
                      : '#475569',
                }}
              >
                <img
                  src={resolveImageUrl(card.image)}
                  alt={card.title}
                  className={`w-full h-full ${
                    card.imageFit === 'contain' ? 'object-contain' : 'object-cover'
                  } object-center transition-transform duration-75`}
                  style={imageTransformStyle}
                  loading="lazy"
                />

                {/* In-Art Holo Texture Effect Layer */}
                {card.rarity !== 'common' && (
                  <div
                    className={`absolute inset-0 ${getHoloClass()} opacity-40 mix-blend-overlay pointer-events-none`}
                  />
                )}

                {/* Rarity Watermark Badge in Artwork corner */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/20 text-[9px] font-black tracking-widest text-white shadow flex items-center gap-1">
                  <span style={{ color: rarityConfig.color }}>{rarityConfig.shortName}</span>
                  <span className="text-[8px] text-amber-300">
                    {'★'.repeat(rarityConfig.stars)}
                  </span>
                </div>
              </div>

              {/* CARD ABILITY / DETAILS BOX */}
              {showFullDetails && (
                <div className="relative z-10 bg-slate-900/95 backdrop-blur-md rounded-[10px] p-2 border border-slate-700/80 shadow text-left flex flex-col gap-1">
                  {card.abilityName && (
                    <div className="border-b border-slate-800 pb-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {card.abilityCost?.map((c, i) => (
                            <span
                              key={i}
                              className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[8px]"
                              title={c}
                            >
                              {ELEMENT_CONFIGS[c as keyof typeof ELEMENT_CONFIGS]?.symbol || '•'}
                            </span>
                          ))}
                          <span className="font-bold text-[11px] text-amber-300 tracking-tight">
                            {card.abilityName}
                          </span>
                        </div>
                        {card.abilityDamage && (
                          <span className="font-extrabold text-[12px] text-white">
                            {card.abilityDamage}
                          </span>
                        )}
                      </div>
                      {card.abilityDesc && (
                        <p className="text-[9px] text-slate-300 leading-tight mt-0.5 line-clamp-2">
                          {card.abilityDesc}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Flavor Text */}
                  <p className="text-[8px] italic text-slate-400 line-clamp-1 leading-none">
                    "{card.flavorText}"
                  </p>

                  {/* Bottom Card Attributes */}
                  <div className="flex items-center justify-between text-[8px] text-slate-400 pt-0.5 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span>
                        Debilidad:{' '}
                        {card.weakness ? (
                          <span className="text-red-400 font-bold">
                            {ELEMENT_CONFIGS[card.weakness]?.symbol} x2
                          </span>
                        ) : (
                          '--'
                        )}
                      </span>
                      <span>
                        Resistencia:{' '}
                        {card.resistance ? (
                          <span className="text-sky-400 font-bold">
                            {ELEMENT_CONFIGS[card.resistance]?.symbol} -30
                          </span>
                        ) : (
                          '--'
                        )}
                      </span>
                    </div>
                    <div>
                      Retirada:{' '}
                      <span className="text-amber-300 font-bold">
                        {'⚪'.repeat(card.retreatCost || 1)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD FOOTER */}
              <div className="relative z-10 px-1 pt-1 flex items-center justify-between text-[8px] text-slate-400">
                <div className="truncate flex items-center gap-1">
                  <span className="text-slate-500">Ilus.</span>
                  <span className="font-medium text-slate-300 truncate">{card.artist}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 font-mono">
                  <span className="font-bold text-slate-200">
                    {card.cardNumber}/{card.totalInSet}
                  </span>
                  <span
                    className={`px-1 py-0.2 rounded font-black text-[8px] ${rarityConfig.badgeBg}`}
                  >
                    {rarityConfig.shortName}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CARD BACK */}
        <div
          className="card-face card-back absolute inset-0 rounded-[20px] overflow-hidden border-2 border-amber-500/80 bg-slate-950 shadow-2xl flex items-center justify-center"
        >
          <img
            src={resolveImageUrl('/cards/Card_Trasera.png')}
            alt="Reverso de Carta TCG"
            className="w-full h-full object-cover rounded-[18px]"
            loading="lazy"
          />
          <div className="card-glare z-30 pointer-events-none" />
        </div>

        {/* Quick Flip Button */}
        {showBackFlipBtn && (
          <button
            onClick={handleFlip}
            title="Girar carta (Ver reverso)"
            className="absolute -top-2 -right-2 z-40 w-7 h-7 bg-slate-900/90 hover:bg-amber-500 text-slate-300 hover:text-black rounded-full border border-slate-600 flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95 backdrop-blur-sm pointer-events-auto"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
