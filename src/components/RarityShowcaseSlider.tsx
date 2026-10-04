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
    customHoloStyle: 'none',
    customFoilOpacity: 0,
    customMaskOpacity: 0.28,
  },
  uncommon: {
    id: 'showcase-uncommon',
    title: 'EvilTokkii',
    subtitle: 'Muestra Poco Común • Wave Refraction',
    image: '/cards/Muestra_Showcase.jpeg',
    imageZoom: 1,
    rarity: 'uncommon',
    element: 'impulso',
    hp: 110,
    cardNumber: '002',
    totalInSet: '000',
    artist: 'EvilTokkii Studio',
    flavorText: 'Muestra de carta poco común con lámina holográfica Wave Refraction (65% foil, 28% brillo).',
    abilityName: 'Destello Ondulante',
    abilityDamage: '60',
    abilityDesc: 'Efecto de demostración para el acabado Wave Refraction.',
    weakness: 'aventura',
    resistance: 'arte',
    retreatCost: 1,
    isFullArt: false,
    tags: ['EvilTokkii', 'PocoComún', 'WaveRefraction'],
    customHoloStyle: 'wave',
    customFoilOpacity: 0.65,
    customMaskOpacity: 0.28,
  },
  rare: {
    id: 'showcase-rare',
    title: 'EvilTokkii',
    subtitle: 'Muestra Rara • Holo Glitter Spark',
    image: '/cards/Muestra_Showcase.jpeg',
    imageZoom: 1,
    rarity: 'rare',
    element: 'ingenio',
    hp: 140,
    cardNumber: '003',
    totalInSet: '000',
    artist: 'EvilTokkii Studio',
    flavorText: 'Muestra de carta rara con lámina holográfica Holo Glitter Spark (100% foil, 18% brillo).',
    abilityName: 'Prisma Glitter',
    abilityDamage: '90',
    abilityDesc: 'Efecto de demostración para el acabado Holo Glitter Spark.',
    weakness: 'desafio',
    resistance: 'aura',
    retreatCost: 2,
    isFullArt: false,
    tags: ['EvilTokkii', 'Rara', 'HoloGlitter'],
    customHoloStyle: 'glitter',
    customFoilOpacity: 1,
    customMaskOpacity: 0.18,
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
    flavorText: 'Muestra de carta súper rara con destellos estelares dorados y microtexturas (80% foil, 28% brillo).',
    abilityName: 'Destello Dorado',
    abilityDamage: '140',
    abilityDesc: 'Efecto de demostración para el acabado Gold Starlight.',
    weakness: 'rutina',
    resistance: 'talento',
    retreatCost: 2,
    isFullArt: false,
    tags: ['EvilTokkii', 'SuperRare', 'GoldStars'],
    customHoloStyle: 'gold_stars',
    customFoilOpacity: 0.8,
    customMaskOpacity: 0.28,
  },
  ultra_rare: {
    id: 'showcase-ultra-rare',
    title: 'EvilTokkii',
    subtitle: 'Muestra Ultra Rara • Secret Gold Mythic Full Art',
    image: '/cards/Muestra_Showcase.jpeg',
    imageZoom: 1,
    rarity: 'ultra_rare',
    element: 'aura',
    hp: 230,
    cardNumber: '005',
    totalInSet: '000',
    artist: 'EvilTokkii Studio',
    flavorText: 'Muestra de carta ultra rara Full Art con lámina Secret Gold Mythic (70% foil, 20% brillo).',
    abilityName: 'Distorsión Mítica',
    abilityDamage: '190',
    abilityDesc: 'Efecto de demostración para el acabado Secret Gold Mythic Full Art.',
    weakness: 'desafio',
    resistance: 'ingenio',
    retreatCost: 2,
    isFullArt: true,
    tags: ['EvilTokkii', 'UltraRare', 'SecretGold', 'FullArt'],
    customHoloStyle: 'secret_gold',
    customFoilOpacity: 0.7,
    customMaskOpacity: 0.2,
  },
  secret_rare: {
    id: 'showcase-secret-rare',
    title: 'EvilTokkii',
    subtitle: 'Muestra Rara Secreta • Prismatic Laser Masterpiece',
    image: '/cards/Muestra_Showcase.jpeg',
    imageZoom: 1,
    rarity: 'secret_rare',
    element: 'leyenda',
    hp: 310,
    cardNumber: '006',
    totalInSet: '000',
    artist: 'EvilTokkii Studio',
    flavorText: 'Muestra de carta secreta Full Art con lámina prismática arcoíris láser y aura mítica (90% foil, 20% brillo).',
    abilityName: 'Soberanía Mítica',
    abilityDamage: '250',
    abilityDesc: 'Efecto de demostración para el acabado Prismatic Laser Masterpiece.',
    weakness: 'desafio',
    resistance: 'rutina',
    retreatCost: 3,
    isFullArt: true,
    tags: ['EvilTokkii', 'SecretRare', 'Prismatic', 'Masterpiece', 'FullArt'],
    customHoloStyle: 'prismatic',
    customFoilOpacity: 0.9,
    customMaskOpacity: 0.2,
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
  const [selectedRarity, setSelectedRarity] = useState<Rarity>('common');

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
          className="w-12 h-12 rounded-full bg-[#290A30]/90 hover:bg-[#31213D] text-[#F9F1F9] hover:border-[#F50B8C] flex items-center justify-center border border-[#610F4E] transition-all active:scale-90 shadow-2xl shrink-0 cursor-pointer backdrop-blur-md"
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
          className="w-12 h-12 rounded-full bg-[#290A30]/90 hover:bg-[#31213D] text-[#F9F1F9] hover:border-[#F50B8C] flex items-center justify-center border border-[#610F4E] transition-all active:scale-90 shadow-2xl shrink-0 cursor-pointer backdrop-blur-md"
          title="Siguiente rareza"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      </div>

      {/* RIGHT COLUMN: Texts, Rarity Selectors & Tech Specs */}
      <div className="flex-1 flex flex-col justify-center space-y-5 max-w-2xl text-left relative z-10 w-full">
        {/* Header Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#F50B8C]">
            <Sparkles className="w-4 h-4 shrink-0 text-[#F50B8C] animate-pulse" />
            <span>Laboratorio de Acabados Holográficos TCG</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-[#F9F1F9] tracking-wide">
            Evolución de Rareza & Efectos Láser
          </h2>
          <p className="text-sm lg:text-base text-[#B894B3] leading-relaxed">
            Interactúa con la carta moviendo el ratón para apreciar los reflejos prismáticos, destellos estelares y el marco según su nivel de rareza.
          </p>
        </div>

        {/* Rarity Tabs Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-1.5 bg-[#290A30]/85 backdrop-blur-md rounded-2xl border border-[#610F4E] w-full shadow-lg">
          {rarities.map((r) => {
            const cfg = RARITY_CONFIGS[r];
            const isActive = selectedRarity === r;
            return (
              <button
                key={r}
                onClick={() => setSelectedRarity(r)}
                className={`px-2 py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center ${
                  isActive
                    ? 'bg-[#610F4E] text-[#F9F1F9] border border-[#F50B8C]/70 shadow-[0_0_15px_rgba(245,11,140,0.35)] scale-[1.04]'
                    : 'text-[#B894B3] hover:text-[#F9F1F9] hover:bg-[#610F4E]/30'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs font-extrabold" style={{ color: cfg.color }}>{cfg.shortName}</span>
                  <span className="truncate text-xs">{cfg.name}</span>
                </div>
                <span className="text-[10px] tracking-tighter" style={{ color: cfg.color }}>
                  {'★'.repeat(cfg.stars)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Rarity Spec Box */}
        <div className="w-full bg-[#290A30]/85 backdrop-blur-md rounded-2xl p-5 border border-[#610F4E] shadow-2xl space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#610F4E] pb-3">
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
              <span className="text-sm tracking-wider" style={{ color: currentConfig.color }}>
                {'★'.repeat(currentConfig.stars)}
              </span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-[#31213D] border border-[#610F4E] text-xs font-mono text-[#F9F1F9]">
              Foil:{' '}
              <span className="text-[#F50B8C] font-bold">
                {currentConfig.holoStyle === 'none'
                  ? 'Sin Foil (Mate)'
                  : currentConfig.holoStyle === 'wave'
                  ? 'Wave Refraction'
                  : currentConfig.holoStyle === 'glitter'
                  ? 'Holo Glitter Spark'
                  : currentConfig.holoStyle === 'gold_stars'
                  ? 'Gold Starlight'
                  : currentConfig.holoStyle === 'secret_gold'
                  ? 'Secret Gold Mythic'
                  : currentConfig.holoStyle === 'prismatic'
                  ? 'Prismatic Laser'
                  : currentConfig.holoStyle}
              </span>
            </div>
          </div>

          <p className="text-sm text-[#B894B3] leading-relaxed">
            {currentConfig.description}
          </p>

          {/* Sample Card Stats & Ability */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="bg-[#31213D]/80 rounded-xl p-2.5 border border-[#610F4E] text-center">
              <span className="text-[10px] text-[#B894B3] block uppercase font-mono">Tipo / Arte</span>
              <span className="text-xs font-bold text-[#F9F1F9] uppercase">{currentCard.isFullArt ? 'Full Art' : 'Estándar'}</span>
            </div>
            <div className="bg-[#31213D]/80 rounded-xl p-2.5 border border-[#610F4E] text-center">
              <span className="text-[10px] text-[#B894B3] block uppercase font-mono">Elemento</span>
              <span className="text-xs font-bold text-[#F9F1F9] capitalize">{currentCard.element}</span>
            </div>
            <div className="bg-[#31213D]/80 rounded-xl p-2.5 border border-[#610F4E] text-center">
              <span className="text-[10px] text-[#B894B3] block uppercase font-mono">Habilidad</span>
              <span className="text-xs font-bold text-[#F50B8C] truncate block">{currentCard.abilityName}</span>
            </div>
            <div className="bg-[#31213D]/80 rounded-xl p-2.5 border border-[#610F4E] text-center">
              <span className="text-[10px] text-[#B894B3] block uppercase font-mono">Puntos Salud</span>
              <span className="text-xs font-bold text-[#fb7185]">{currentCard.hp} HP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
