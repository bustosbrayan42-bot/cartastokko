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
    attacks: Array.isArray(row.attacks) ? row.attacks : [],
    retreatCost: Number(row.retreat_cost ?? 1),
    weakness: row.weakness || undefined,
    resistance: row.resistance || undefined,
    isFullArt: !!row.is_full_art,
    tags: Array.isArray(row.tags) ? row.tags : [],
    dateAdded: row.date_added,
  };
};

const CARDS_CACHE_KEY = 'tokkii_cached_cards_v1';
const CARDS_CACHE_TIME_KEY = 'tokkii_cached_cards_v1_time';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos de caché local para evitar gastar cuota

/**
 * Fetch all cards from Supabase for Visor with smart caching
 */
export const fetchCardsFromSupabase = async (forceRefresh: boolean = false): Promise<CardData[]> => {
  // 1. Si no se fuerza la recarga, intentar leer de la caché local primero
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(CARDS_CACHE_KEY);
      const cachedTime = localStorage.getItem(CARDS_CACHE_TIME_KEY);
      if (cached && cachedTime) {
        const age = Date.now() - parseInt(cachedTime, 10);
        if (age < CACHE_TTL_MS) {
          return JSON.parse(cached);
        }
      }
    } catch {}
  }

  // 2. Si no hay caché o expiró, consultar Supabase
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('card_number', { ascending: true });

  if (error) {
    console.error('Error fetching cards from Supabase in Visor:', error);
    // Fallback: Si falla la red, usar lo que haya en caché
    try {
      const cached = localStorage.getItem(CARDS_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
    throw error;
  }

  const cards = (data as DbCardRow[]).map(rowToCard);

  // 3. Guardar en caché local
  try {
    localStorage.setItem(CARDS_CACHE_KEY, JSON.stringify(cards));
    localStorage.setItem(CARDS_CACHE_TIME_KEY, Date.now().toString());
  } catch {}

  return cards;
};

/**
 * Invalida manualmente la caché de cartas
 */
export const invalidateCardsCache = () => {
  try {
    localStorage.removeItem(CARDS_CACHE_KEY);
    localStorage.removeItem(CARDS_CACHE_TIME_KEY);
  } catch {}
};
