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
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
      {/* Ambient background glow matching rarity color */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-15 filter blur-3xl pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: currentConfig.color }}
      />

      <div className="flex flex-col items-center text-center space-y-6 relative z-10">
        {/* Header Title */}
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-widest text-amber-400">
            <Sparkles className="w-4 h-4" />
            Laboratorio de Acabados Holográficos TCG
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Evolución de Rareza & Efectos Láser
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            Interactúa con la carta moviendo el ratón para apreciar los reflejos prismáticos, destellos estelares y el marco según su nivel de rareza.
          </p>
        </div>

        {/* Rarity Tabs Selector */}
        <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 max-w-full">
          {rarities.map((r) => {
            const cfg = RARITY_CONFIGS[r];
            const isActive = selectedRarity === r;
            return (
              <button
                key={r}
                onClick={() => setSelectedRarity(r)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white border border-amber-400/80 shadow-[0_0_15px_rgba(234,179,8,0.3)] scale-105'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span style={{ color: cfg.color }}>{cfg.shortName}</span>
                <span>{cfg.name}</span>
                <span className="text-[10px] text-amber-300">
                  {'★'.repeat(cfg.stars)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center Card Stage (Clean, Proportional, No Overlap) */}
        <div className="flex items-center justify-center gap-4 md:gap-8 w-full py-4">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-all active:scale-95 shadow-lg shrink-0 cursor-pointer"
            title="Anterior rareza"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center">
            {currentCard && (
              <div className="py-2">
                <TcgCard
                  card={currentCard}
                  scale={1.1}
                  interactive={true}
                  showBackFlipBtn={true}
                />
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-all active:scale-95 shadow-lg shrink-0 cursor-pointer"
            title="Siguiente rareza"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Rarity Spec Box */}
        <div className="w-full max-w-2xl bg-slate-950/60 rounded-2xl p-4 border border-slate-800 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span
                className="font-black text-sm uppercase"
                style={{ color: currentConfig.color }}
              >
                {currentConfig.name} ({currentConfig.shortName})
              </span>
              <span className="text-xs text-amber-300">
                {'★'.repeat(currentConfig.stars)}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              {currentConfig.description}
            </p>
          </div>
          <div className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-400">
            Holo: <span className="text-amber-300 font-bold">{currentConfig.holoStyle}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
