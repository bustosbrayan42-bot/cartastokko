import React, { useState } from 'react';
import type { CardData, Rarity } from '../types/card';
import { TcgCard } from './TcgCard';
import { RARITY_CONFIGS } from '../data/rarityConfigs';
import { DEFAULT_CARDS } from '../data/defaultCards';
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
  golden_epic: {
    id: 'showcase-golden-epic',
    title: 'Tokkii Dorada Épica',
    subtitle: 'Carta Única de Canje • Golden Holo Masterpiece',
    image: '/cards/Muestra_Showcase.jpeg',
    imageZoom: 1,
    rarity: 'golden_epic',
    element: 'leyenda',
    hp: 350,
    cardNumber: '141',
    totalInSet: '140',
    artist: 'Tokkii Studio',
    flavorText: 'Carta única de canje oficial. Forjada en oro puro con lámina holográfica dorada resplandeciente.',
    abilityName: 'Canje Legendario',
    abilityDamage: '300',
    abilityDesc: 'Efecto supremo de canje único de la colección Tokkii TCG.',
    weakness: 'desafio',
    resistance: 'rutina',
    retreatCost: 3,
    isFullArt: true,
    tags: ['Tokkii', 'GoldenEpic', 'CanjeUnico', 'FullArt'],
    customHoloStyle: 'golden_holo',
    customFoilOpacity: 1.0,
    customMaskOpacity: 0.35,
  },
};

interface RarityShowcaseSliderProps {
  cards?: CardData[];
}

const getShowcaseCardForRarity = (rarity: Rarity, allCards: CardData[]): CardData => {
  const targetMap: Record<Rarity, string> = {
    common: '002',
    uncommon: '001',
    rare: '004',
    super_rare: '020',
    ultra_rare: '003',
    secret_rare: '005',
    golden_epic: '141',
  };

  const targetNumber = targetMap[rarity];
  const found =
    allCards.find((c) => c.cardNumber === targetNumber) ||
    allCards.find((c) => c.rarity === rarity) ||
    DEFAULT_CARDS.find((c) => c.cardNumber === targetNumber) ||
    DEFAULT_CARDS.find((c) => c.rarity === rarity) ||
    SHOWCASE_CARDS_BY_RARITY[rarity];

  const cfg = RARITY_CONFIGS[rarity];

  return {
    ...found,
    rarity: rarity,
    customHoloStyle: found.customHoloStyle || cfg.holoStyle,
    customFoilOpacity: found.customFoilOpacity ?? (cfg.holoStyle === 'none' ? 0 : 0.85),
    customMaskOpacity: found.customMaskOpacity ?? 0.25,
  };
};

export const RarityShowcaseSlider: React.FC<RarityShowcaseSliderProps> = ({ cards = [] }) => {
  const rarities: Rarity[] = [
    'common',
    'uncommon',
    'rare',
    'super_rare',
    'ultra_rare',
    'secret_rare',
    'golden_epic',
  ];
  const [selectedRarity, setSelectedRarity] = useState<Rarity>('common');

  const currentCard = React.useMemo(() => {
    const list = cards && cards.length > 0 ? cards : DEFAULT_CARDS;
    return getShowcaseCardForRarity(selectedRarity, list);
  }, [selectedRarity, cards]);
  const currentIndex = rarities.indexOf(selectedRarity);
  const currentConfig = RARITY_CONFIGS[selectedRarity];

  const prevIndex = (currentIndex - 1 + rarities.length) % rarities.length;
  const nextIndex = (currentIndex + 1) % rarities.length;
  const prevConfig = RARITY_CONFIGS[rarities[prevIndex]];
  const nextConfig = RARITY_CONFIGS[rarities[nextIndex]];

  const [scale, setScale] = useState<number>(() => {
    if (typeof window === 'undefined') return 1.1;
    const w = window.innerWidth;
    if (w < 400) return 0.76;
    if (w < 640) return 0.88;
    if (w < 1024) return 1.05;
    return 1.22;
  });

  React.useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      if (w < 400) setScale(0.76);
      else if (w < 640) setScale(0.88);
      else if (w < 1024) setScale(1.05);
      else setScale(1.22);
    };
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + rarities.length) % rarities.length;
    setSelectedRarity(rarities[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % rarities.length;
    setSelectedRarity(rarities[nextIdx]);
  };

  return (
    <div className="w-full max-w-[1650px] mx-auto px-2 sm:px-6 py-2 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16 relative">
      {/* Ambient background glow matching rarity color */}
      <div
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 filter blur-[120px] pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: currentConfig.color }}
      />

      {/* LEFT COLUMN: Card Stage (Clean, without side arrows) */}
      <div className="flex-shrink-0 flex items-center justify-center relative z-10">
        <div className="flex flex-col items-center justify-center">
          {currentCard && (
            <div className="py-2">
              <TcgCard
                card={currentCard}
                scale={scale}
                interactive={true}
                showBackFlipBtn={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Texts, Rarity Slider & Tech Specs */}
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

        {/* DESLIZADOR HORIZONTAL DE RAREZA (Horizontal Rarity Slider in a Single Row) */}
        <div className="w-full space-y-2.5">
          <div className="flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-2.5 bg-[#290A30]/90 backdrop-blur-md rounded-2xl border border-[#610F4E] shadow-xl relative overflow-hidden">
            {/* Ambient subtle glow inside slider */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none blur-xl transition-all duration-500"
              style={{ backgroundColor: currentConfig.color }}
            />

            {/* Left Navigation Arrow */}
            <button
              type="button"
              onClick={handlePrev}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#31213D] hover:bg-[#610F4E] text-[#F9F1F9] hover:text-white border border-[#610F4E] hover:border-[#F50B8C] flex items-center justify-center transition-all active:scale-90 shadow-md shrink-0 cursor-pointer z-10"
              title="Rareza anterior"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Horizontal Track with 3 Rarities: Left (Previous, smaller), Center (Active, Bigger), Right (Next, smaller) */}
            <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-3 z-10 overflow-hidden">
              {/* Previous Rarity (Left, slightly smaller scale) */}
              <button
                type="button"
                onClick={handlePrev}
                className="flex-1 min-w-0 max-w-[150px] sm:max-w-[170px] py-2 px-2 sm:px-2.5 rounded-xl bg-[#31213D]/70 hover:bg-[#31213D] border border-[#610F4E]/80 hover:border-[#610F4E] text-center transition-all duration-300 opacity-60 hover:opacity-90 scale-90 cursor-pointer select-none"
                title={`Ir a ${prevConfig.name}`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="font-mono text-[11px] font-bold shrink-0" style={{ color: prevConfig.color }}>
                    {prevConfig.shortName}
                  </span>
                  <span className="text-xs font-semibold text-[#B894B3] truncate">
                    {prevConfig.name}
                  </span>
                </div>
                <div className="text-[10px] tracking-tighter mt-0.5" style={{ color: prevConfig.color }}>
                  {'★'.repeat(prevConfig.stars)}
                </div>
              </button>

              {/* Current Active Rarity (Center, Bigger Font & Bigger Stars) */}
              <div
                className="flex-1 min-w-0 max-w-[210px] sm:max-w-[240px] py-2.5 px-3 rounded-2xl bg-[#610F4E] text-center transition-all duration-300 scale-105 shadow-[0_0_20px_rgba(245,11,140,0.35)] cursor-default select-none border-2"
                style={{
                  borderColor: currentConfig.color,
                  boxShadow: `0 0 20px ${currentConfig.color}40`,
                }}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className="font-mono text-sm sm:text-base font-black shrink-0"
                    style={{ color: currentConfig.color }}
                  >
                    {currentConfig.shortName}
                  </span>
                  <span className="text-sm sm:text-base font-black text-white truncate tracking-wide">
                    {currentConfig.name}
                  </span>
                </div>
                <div
                  className="text-xs sm:text-sm font-bold tracking-wider mt-0.5 filter drop-shadow-[0_0_6px_currentColor]"
                  style={{ color: currentConfig.color }}
                >
                  {'★'.repeat(currentConfig.stars)}
                </div>
              </div>

              {/* Next Rarity (Right, slightly smaller scale) */}
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 min-w-0 max-w-[150px] sm:max-w-[170px] py-2 px-2 sm:px-2.5 rounded-xl bg-[#31213D]/70 hover:bg-[#31213D] border border-[#610F4E]/80 hover:border-[#610F4E] text-center transition-all duration-300 opacity-60 hover:opacity-90 scale-90 cursor-pointer select-none"
                title={`Ir a ${nextConfig.name}`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="font-mono text-[11px] font-bold shrink-0" style={{ color: nextConfig.color }}>
                    {nextConfig.shortName}
                  </span>
                  <span className="text-xs font-semibold text-[#B894B3] truncate">
                    {nextConfig.name}
                  </span>
                </div>
                <div className="text-[10px] tracking-tighter mt-0.5" style={{ color: nextConfig.color }}>
                  {'★'.repeat(nextConfig.stars)}
                </div>
              </button>
            </div>

            {/* Right Navigation Arrow */}
            <button
              type="button"
              onClick={handleNext}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#31213D] hover:bg-[#610F4E] text-[#F9F1F9] hover:text-white border border-[#610F4E] hover:border-[#F50B8C] flex items-center justify-center transition-all active:scale-90 shadow-md shrink-0 cursor-pointer z-10"
              title="Rareza siguiente"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Mini 7-dot Position Indicator */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {rarities.map((r) => {
              const cfg = RARITY_CONFIGS[r];
              const isActive = r === selectedRarity;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRarity(r)}
                  title={`${cfg.name} (${cfg.shortName})`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-6 shadow-md'
                      : 'w-2 bg-[#610F4E]/80 hover:bg-[#B894B3]'
                  }`}
                  style={{
                    backgroundColor: isActive ? cfg.color : undefined,
                    boxShadow: isActive ? `0 0 8px ${cfg.color}` : undefined,
                  }}
                />
              );
            })}
          </div>
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
