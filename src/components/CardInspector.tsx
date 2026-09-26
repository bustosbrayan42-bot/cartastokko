import React, { useState } from 'react';
import type { CardData } from '../types/card';
import { TcgCard } from './TcgCard';
import { RARITY_CONFIGS } from '../data/rarityConfigs';
import { ELEMENT_CONFIGS } from '../data/elementConfigs';
import { playSparkleSound, playCardFlipSound } from '../utils/soundEffects';
import {
  X,
  RotateCw,
  Sparkles,
  Zap,
  Shield
} from 'lucide-react';

interface CardInspectorProps {
  card: CardData | null;
  onClose: () => void;
}

export const CardInspector: React.FC<CardInspectorProps> = ({
  card,
  onClose,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [scale, setScale] = useState(1.15);

  if (!card) return null;

  const rarityConfig = RARITY_CONFIGS[card.rarity] || RARITY_CONFIGS.common;
  const elementConfig = ELEMENT_CONFIGS[card.element] || ELEMENT_CONFIGS.impulso;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    playCardFlipSound();
  };

  const handleSparkle = () => {
    playSparkleSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-red-500/80 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700 backdrop-blur-md cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: 3D CARD DISPLAY & CONTROLS */}
        <div className="flex-1 bg-gradient-to-b from-slate-950/90 to-slate-900/90 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none filter blur-3xl transition-colors duration-500"
            style={{ backgroundColor: rarityConfig.color }}
          />

          <div className="my-auto py-4">
            <TcgCard
              card={card}
              scale={scale}
              isFlipped={isFlipped}
              onFlipToggle={handleFlip}
              showBackFlipBtn={false}
              interactive={true}
            />
          </div>

          {/* Quick Interactive Control Bar */}
          <div className="mt-4 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 shadow-lg">
            <button
              onClick={handleFlip}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              Girar Carta
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <button
              onClick={handleSparkle}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Destello
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Zoom:</span>
              <input
                type="range"
                min="0.9"
                max="1.3"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-16 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CARD DATA, SPECS & DETAILS (READ-ONLY) */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header / Rarity Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-black tracking-wider uppercase border shadow ${rarityConfig.badgeBg}`}
                >
                  {rarityConfig.name} ({rarityConfig.shortName})
                </span>
                <span className="text-amber-400 text-sm">
                  {'★'.repeat(rarityConfig.stars)}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                N° {card.cardNumber} / {card.totalInSet}
              </span>
            </div>

            {/* Title & Element */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{elementConfig.symbol}</span>
                <h2 className="text-2xl font-black text-white tracking-wide">
                  {card.title}
                </h2>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{card.subtitle}</p>
            </div>

            {/* Foil Effect Details Box */}
            <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">
                    Acabado Foil: <span className="text-amber-300">{rarityConfig.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    {rarityConfig.description}
                  </div>
                </div>
              </div>
              <span className="shrink-0 text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-900 text-cyan-300 border border-slate-700">
                {rarityConfig.holoStyle}
              </span>
            </div>

            {/* Battle Stats & Ability */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Puntos de Vida
                  </div>
                  <div className="text-xl font-black text-red-400 flex items-center gap-1 mt-0.5">
                    <Shield className="w-4 h-4" />
                    {card.hp} HP
                  </div>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Elemento Primario
                  </div>
                  <div className="text-sm font-black text-amber-300 flex items-center gap-1 mt-1">
                    <span>{elementConfig.symbol}</span>
                    {elementConfig.name}
                  </div>
                </div>
              </div>

              {card.abilityName && (
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-sm text-amber-300">
                        {card.abilityName}
                      </span>
                    </div>
                    {card.abilityDamage && (
                      <span className="font-black text-base text-white">
                        {card.abilityDamage} Daño
                      </span>
                    )}
                  </div>
                  {card.abilityDesc && (
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {card.abilityDesc}
                    </p>
                  )}
                </div>
              )}

              {card.flavorText && (
                <div className="p-3 rounded-xl bg-slate-950/30 border border-slate-800/60 italic text-xs text-slate-400">
                  "{card.flavorText}"
                </div>
              )}
            </div>

            {/* Tags / Metadata */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Información de Colección
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-xs text-slate-300 border border-slate-700">
                  Ilustrador: <strong className="text-white font-medium">{card.artist}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-xs text-slate-300 border border-slate-700">
                  Formato: <strong className="text-amber-300 font-medium">{card.isFullArt ? 'Full Art Holo' : 'Marco Estándar'}</strong>
                </span>
                {card.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-lg bg-slate-900 text-[11px] text-slate-400 border border-slate-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all shadow-lg hover:shadow-amber-500/25 cursor-pointer"
            >
              Listo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
