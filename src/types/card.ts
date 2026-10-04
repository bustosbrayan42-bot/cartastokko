export type Rarity = 'common' | 'uncommon' | 'rare' | 'super_rare' | 'ultra_rare' | 'secret_rare';

export type CardElement =
  | 'arte'
  | 'impulso'
  | 'ingenio'
  | 'aura'
  | 'talento'
  | 'estilo'
  | 'aventura'
  | 'desafio'
  | 'rutina'
  | 'leyenda';

export interface CardAttack {
  id: string;
  name: string;
  cost: CardElement[];
  damage: string;
  description: string;
  tag?: string;
}

export interface CardData {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  imageZoom?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  imageRotation?: number;
  imageFit?: 'cover' | 'contain' | 'full_bleed';
  rarity: Rarity;
  element: CardElement;
  hp: number;
  cardNumber: string;
  totalInSet: string;
  artist: string;
  flavorText: string;
  abilityName?: string;
  abilityCost?: string[];
  abilityDamage?: string;
  abilityDesc?: string;
  attacks?: CardAttack[];
  retreatCost?: number;
  weakness?: CardElement;
  resistance?: CardElement;
  isFullArt?: boolean;
  borderColor?: string;
  customHoloStyle?: 'none' | 'silver' | 'prismatic' | 'gold_stars' | 'cosmic' | 'secret_gold' | 'glitter' | 'wave';
  customFoilOpacity?: number;
  customMaskOpacity?: number;
  customGlareOpacity?: number;
  dateAdded?: string;
  tags?: string[];
}

export interface RarityConfig {
  id: Rarity;
  name: string;
  shortName: string;
  color: string;
  gradient: string;
  glowColor: string;
  borderColor: string;
  badgeBg: string;
  holoStyle: 'none' | 'silver' | 'prismatic' | 'gold_stars' | 'cosmic' | 'secret_gold';
  stars: number;
  description: string;
}
