import React, { useState } from 'react';
import type { CardData, Rarity } from '../types/card';
import { TcgCard } from './TcgCard';
import { RARITY_CONFIGS } from '../data/rarityConfigs';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const SHOWCASE_CARDS_BY_RARITY: Record<Rarity, CardData> = {
  common: {
    id: 'showcase-common',
    title: 'EvilTokkii',
    subtitle: 'Muestra Común • Acabado Mate',
    image: '/cards/Muestra_Showcase.jpeg',
    imageZoom: 1,
    rarity: 'common',
    element: 'arte',
    hp: 90,
    cardNumber: '001',
    totalInSet: '000',
    artist: 'EvilTokkii Studio',
    flavorText: 'Muestra de carta común con acabado mate estándar sin lámina holográfica.',
    abilityName: 'Impacto Básico',
    abilityDamage: '30',
    abilityDesc: 'Efecto de demostración para cartas comunes.',
    weakness: 'aventura',
    resistance: 'impulso',
    retreatCost: 1,
    isFullArt: false,
    tags: ['EvilTokkii', 'Común', 'Showcase'],
  },
  uncommon: {
    id: 'showcase-uncommon',
    title: 'EvilTokkii',
    subtitle: 'Muestra Poco Común • Silver Sheen',
    image: '/cards/Muestra_Showcase.jpeg',
    imageZoom: 1,
    rarity: 'uncommon',
    element: 'impulso',
    hp: 110,
    cardNumber: '002',
    totalInSet: '000',
    artist: 'EvilTokkii Studio',
    flavorText: 'Muestra de carta poco común con sutil reflejo plateado brillante.',
    abilityName: 'Destello Plateado',
    abilityDamage: '60',
    abilityDesc: 'Efecto de demostración para el acabado Silver Sheen.',
    weakness: 'aventura',
    resistance: 'arte',
    retreatCost: 1,
    isFullArt: false,
    tags: ['EvilTokkii', 'PocoComún', 'Silver'],
  },
  rare: {
    id: 'showcase-rare',
    title: 'EvilTokkii',
    subtitle: 'Muestra Rara • Foil Prismático',
    image: '/cards/Muestra_Showcase.jpeg',
    imageZoom: 1,
    rarity: 'rare',
    element: 'ingenio',
    hp: 140,
    cardNumber: '003',
    totalInSet: '000',
    artist: 'EvilTokkii Studio',
    flavorText: 'Muestra de carta rara con refracción de luz arcoíris en ángulo dinámico.',
    abilityName: 'Prisma Cromático',
    abilityDamage: '90',
    abilityDesc: 'Efecto de demostración para el acabado Prismático Arcoíris.',
    weakness: 'desafio',
    resistance: 'aura',
    retreatCost: 2,
    isFullArt: false,
    tags: ['EvilTokkii', 'Rara', 'Prismatic'],
  },
  super_rare: {
    id: 'showcase-super-rare',
    title: 'EvilTokkii',
    subtitle: 'Muestra Súper Rara • Gold Starlight',
    image: '/cards/Muestra_Showcase.jpeg',
    imageZoom: 1,
    rarity: 'super_rare',
    element: 'estilo',
    hp: 180,
    cardNumber: '004',
    totalInSet: '000',
    artist: 'EvilTokkii Studio',
    flavorText: 'Muestra de carta súper rara con destellos estelares dorados y microtexturas.',
    abilityName: 'Destello Dorado',
    abilityDamage: '140',
    abilityDesc: 'Efecto de demostración para el acabado Gold Starlight.',
    weakness: 'rutina',
    resistance: 'talento',
    retreatCost: 2,
    isFullArt: false,
    tags: ['EvilTokkii', 'SuperRare', 'GoldStars'],
  },
  ultra_rare: {
    id: 'showcase-ultra-rare',
    title: 'EvilTokkii',
    subtitle: 'Muestra Ultra Rara • Cósmico Full Art',
    image: '/cards/Muestra_Showcase.jpeg',
    imageZoom: 1,
    rarity: 'ultra_rare',
    element: 'aura',
    hp: 230,
    cardNumber: '005',
    totalInSet: '000',
    artist: 'EvilTokkii Studio',
    flavorText: 'Muestra de carta ultra rara con efecto holográfico cósmico multidireccional.',
    abilityName: 'Distorsión Cósmica',
    abilityDamage: '190',
    abilityDesc: 'Efecto de demostración para el acabado Cósmico Radial Full Art.',
    weakness: 'desafio',
    resistance: 'ingenio',
    retreatCost: 2,
    isFullArt: true,
    tags: ['EvilTokkii', 'UltraRare', 'Cosmic', 'FullArt'],
  },
  secret_rare: {
    id: 'showcase-secret-rare',
    title: 'EvilTokkii',
    subtitle: 'Muestra Rara Secreta • Secret Gold Masterpiece',
    image: '/cards/Muestra_Showcase.jpeg',
    imageZoom: 1,
    rarity: 'secret_rare',
    element: 'leyenda',
    hp: 310,
    cardNumber: '006',
    totalInSet: '000',
    artist: 'EvilTokkii Studio',
    flavorText: 'Muestra de carta secreta con lámina dorada mística, partículas láser y refracción.',
    abilityName: 'Soberanía Mítica',
    abilityDamage: '250',
    abilityDesc: 'Efecto de demostración para el acabado Secret Gold Mythic.',
    weakness: 'desafio',
    resistance: 'rutina',
    retreatCost: 3,
    isFullArt: true,
    tags: ['EvilTokkii', 'SecretRare', 'SecretGold', 'Masterpiece'],
  },
};

export const RarityShowcaseSlider: React.FC = () => {
  const rarities: Rarity[] = [
    'common',
    'uncommon',
    'rare',
    'super_rare',
    'ultra_rare',
    'secret_rare',
  ];
  const [selectedRarity, setSelectedRarity] = useState<Rarity>('secret_rare');

  const currentCard = SHOWCASE_CARDS_BY_RARITY[selectedRarity];
  const currentIndex = rarities.indexOf(selectedRarity);
  const currentConfig = RARITY_CONFIGS[selectedRarity];

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + rarities.length) % rarities.length;
    setSelectedRarity(rarities[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % rarities.length;
    setSelectedRarity(rarities[nextIdx]);
  };

  return (
    <div className="w-full max-w-[1650px] mx-auto px-4 sm:px-6 py-2 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 relative">
      {/* Ambient background glow matching rarity color */}
      <div
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 filter blur-[120px] pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: currentConfig.color }}
      />

      {/* LEFT COLUMN: Card Stage with Navigation Arrows */}
      <div className="flex-shrink-0 flex items-center justify-center gap-4 sm:gap-8 relative z-10">
        <button
          onClick={handlePrev}
          className="w-12 h-12 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/80 transition-all active:scale-90 shadow-2xl shrink-0 cursor-pointer backdrop-blur-md"
          title="Anterior rareza"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        <div className="flex flex-col items-center justify-center">
          {currentCard && (
            <div className="py-2">
              <TcgCard
                card={currentCard}
                scale={1.22}
                interactive={true}
                showBackFlipBtn={true}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/80 transition-all active:scale-90 shadow-2xl shrink-0 cursor-pointer backdrop-blur-md"
          title="Siguiente rareza"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      </div>

      {/* RIGHT COLUMN: Texts, Rarity Selectors & Tech Specs */}
      <div className="flex-1 flex flex-col justify-center space-y-5 max-w-2xl text-left relative z-10 w-full">
        {/* Header Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
            <span>Laboratorio de Acabados Holográficos TCG</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-wide">
            Evolución de Rareza & Efectos Láser
          </h2>
          <p className="text-sm lg:text-base text-slate-300 leading-relaxed">
            Interactúa con la carta moviendo el ratón para apreciar los reflejos prismáticos, destellos estelares y el marco según su nivel de rareza.
          </p>
        </div>

        {/* Rarity Tabs Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-1.5 bg-slate-950/60 backdrop-blur-md rounded-2xl border border-slate-800/80 w-full shadow-lg">
          {rarities.map((r) => {
            const cfg = RARITY_CONFIGS[r];
            const isActive = selectedRarity === r;
            return (
              <button
                key={r}
                onClick={() => setSelectedRarity(r)}
                className={`px-2 py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center ${
                  isActive
                    ? 'bg-slate-800/90 text-white border border-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.35)] scale-[1.04]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs font-extrabold" style={{ color: cfg.color }}>{cfg.shortName}</span>
                  <span className="truncate text-xs">{cfg.name}</span>
                </div>
                <span className="text-[10px] text-amber-300 tracking-tighter">
                  {'★'.repeat(cfg.stars)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Rarity Spec Box */}
        <div className="w-full bg-slate-950/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-2xl space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full shadow-md shrink-0"
                style={{ backgroundColor: currentConfig.color, boxShadow: `0 0 12px ${currentConfig.color}` }}
              />
              <span
                className="font-black text-lg uppercase tracking-wide"
                style={{ color: currentConfig.color }}
              >
                {currentConfig.name} ({currentConfig.shortName})
              </span>
              <span className="text-sm text-amber-300 tracking-wider">
                {'★'.repeat(currentConfig.stars)}
              </span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-700/80 text-xs font-mono text-slate-300">
              Foil: <span className="text-amber-400 font-bold">{currentConfig.holoStyle}</span>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {currentConfig.description}
          </p>

          {/* Sample Card Stats & Ability */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="bg-slate-900/70 rounded-xl p-2.5 border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Tipo / Arte</span>
              <span className="text-xs font-bold text-white uppercase">{currentCard.isFullArt ? 'Full Art' : 'Estándar'}</span>
            </div>
            <div className="bg-slate-900/70 rounded-xl p-2.5 border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Elemento</span>
              <span className="text-xs font-bold text-white capitalize">{currentCard.element}</span>
            </div>
            <div className="bg-slate-900/70 rounded-xl p-2.5 border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Habilidad</span>
              <span className="text-xs font-bold text-amber-400 truncate block">{currentCard.abilityName}</span>
            </div>
            <div className="bg-slate-900/70 rounded-xl p-2.5 border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">Puntos Salud</span>
              <span className="text-xs font-bold text-rose-400">{currentCard.hp} HP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
