import { createClient } from '@supabase/supabase-js';
import type { CardData } from '../types/card';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hucjgcodrhjocghcwdrf.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xQYr4SpATP_vMB3Dt3yqSg_cUiefVhA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface DbCardRow {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  image_zoom?: number;
  image_offset_x?: number;
  image_offset_y?: number;
  image_rotation?: number;
  image_fit?: 'cover' | 'contain' | 'full_bleed';
  rarity: CardData['rarity'];
  element: CardData['element'];
  hp: number;
  card_number: string;
  total_in_set: string;
  artist: string;
  flavor_text: string;
  attacks?: Array<{
    id: string;
    name: string;
    cost: CardData['element'][];
    damage: string;
    description: string;
    tag?: string;
  }>;
  retreat_cost: number;
  weakness: CardData['weakness'] | null;
  resistance: CardData['resistance'] | null;
  is_full_art: boolean;
  border_color?: string | null;
  tags?: string[];
  date_added?: string;
}

export const rowToCard = (row: DbCardRow): CardData => {
  // Map ability from first attack if present
  const firstAttack = row.attacks && row.attacks.length > 0 ? row.attacks[0] : null;

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    image: row.image || '/cards/tokkii_photographer.jpg',
    imageZoom: Number(row.image_zoom ?? 1),
    imageOffsetX: Number(row.image_offset_x ?? 0),
    imageOffsetY: Number(row.image_offset_y ?? 0),
    imageRotation: Number(row.image_rotation ?? 0),
    imageFit: row.image_fit || 'cover',
    rarity: row.rarity,
    element: row.element,
    hp: Number(row.hp ?? 100),
    cardNumber: row.card_number,
    totalInSet: row.total_in_set,
    artist: row.artist,
    flavorText: row.flavor_text || '',
    abilityName: firstAttack?.name || undefined,
    abilityCost: firstAttack?.cost || undefined,
    abilityDamage: firstAttack?.damage || undefined,
    abilityDesc: firstAttack?.description || undefined,
    retreatCost: Number(row.retreat_cost ?? 1),
    weakness: row.weakness || undefined,
    resistance: row.resistance || undefined,
    isFullArt: !!row.is_full_art,
    tags: Array.isArray(row.tags) ? row.tags : [],
    dateAdded: row.date_added,
  };
};

/**
 * Fetch all cards from Supabase for Visor
 */
export const fetchCardsFromSupabase = async (): Promise<CardData[]> => {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('card_number', { ascending: true });

  if (error) {
    console.error('Error fetching cards from Supabase in Visor:', error);
    throw error;
  }

  return (data as DbCardRow[]).map(rowToCard);
};
