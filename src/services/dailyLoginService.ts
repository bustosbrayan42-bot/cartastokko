import { supabaseAuth } from '../utils/authSupabaseClient';
import type { PackType } from './giftCodeService';

export interface DailyRewardItem {
  id: 'pack_1' | 'pack_3' | 'pack_5' | 'empty';
  title: string;
  subtitle: string;
  cardCount: number;
  packType: PackType | null;
  weight: number; // probability weight
  color: string;
  borderColor: string;
  glowColor: string;
  image: string;
}

export const DAILY_ROULETTE_ITEMS: DailyRewardItem[] = [
  {
    id: 'pack_1',
    title: 'Sobre Básico',
    subtitle: '1 Carta',
    cardCount: 1,
    packType: 'pack_1',
    weight: 45, // 45%
    color: 'from-blue-600 to-cyan-500',
    borderColor: 'border-cyan-400',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    image: '/cards/Imagen_Sobre.png',
  },
  {
    id: 'pack_3',
    title: 'Sobre Estándar',
    subtitle: '3 Cartas',
    cardCount: 3,
    packType: 'pack_3',
    weight: 25, // 25%
    color: 'from-purple-600 to-pink-500',
    borderColor: 'border-pink-400',
    glowColor: 'rgba(244, 63, 94, 0.5)',
    image: '/cards/Imagen_Sobre_2.png',
  },
  {
    id: 'pack_5',
    title: 'Sobre Legendario',
    subtitle: '5 Cartas 🌟',
    cardCount: 5,
    packType: 'pack_5',
    weight: 5, // 5% (el más mínimo)
    color: 'from-amber-500 to-yellow-400',
    borderColor: 'border-amber-400',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    image: '/cards/Imagen_Sobre_3.png',
  },
  {
    id: 'empty',
    title: 'Sobre Vacío',
    subtitle: '0 Cartas 💨',
    cardCount: 0,
    packType: null,
    weight: 25, // 25%
    color: 'from-slate-700 to-slate-800',
    borderColor: 'border-slate-600',
    glowColor: 'rgba(100, 116, 139, 0.3)',
    image: '/cards/Imagen_Sobre_3.png',
  },
];

export type DayRewardType = 'pack_1' | 'pack_3' | 'pack_5' | 'roulette';

export interface DayRewardConfig {
  type: DayRewardType;
  title: string;
  badge: string;
  shortLabel: string;
  cardCount: number;
  packType: PackType | null;
  image: string;
  glowColor: string;
  borderColor: string;
  textColor: string;
  isRoulette: boolean;
  isGuaranteedMonthEnd?: boolean;
}

/**
 * Returns reward configuration based on day of week and end-of-month rule:
 * - Lunes: Sobre de 1 carta
 * - Martes: Sobre de 1 carta
 * - Miércoles: Probar suerte con el azar (Ruleta de 4 sobres)
 * - Jueves: Sobre de 1 carta
 * - Viernes: Sobre de 3 cartas
 * - Sábado: Probar suerte con el azar (Ruleta de 4 sobres)
 * - Domingo: Sobre de 1 carta
 * - Último día de cada mes: Sobre de 5 cartas garantizado
 */
export const getDayRewardConfig = (date: Date, isMonthEnd: boolean): DayRewardConfig => {
  if (isMonthEnd) {
    return {
      type: 'pack_5',
      title: 'Sobre Legendario (5 Cartas)',
      badge: '5 Cartas ★',
      shortLabel: '5 Cartas 🌟',
      cardCount: 5,
      packType: 'pack_5',
      image: '/cards/Imagen_Sobre_3.png',
      glowColor: 'rgba(245, 158, 11, 0.6)',
      borderColor: 'border-amber-400',
      textColor: 'text-amber-400',
      isRoulette: false,
      isGuaranteedMonthEnd: true,
    };
  }

  const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  switch (dayOfWeek) {
    case 1: // Lunes
    case 2: // Martes
    case 4: // Jueves
    case 0: // Domingo
      return {
        type: 'pack_1',
        title: 'Sobre Básico (1 Carta)',
        badge: '1 Carta',
        shortLabel: '1 Carta',
        cardCount: 1,
        packType: 'pack_1',
        image: '/cards/Imagen_Sobre.png',
        glowColor: 'rgba(6, 182, 212, 0.5)',
        borderColor: 'border-cyan-400',
        textColor: 'text-cyan-400',
        isRoulette: false,
      };

    case 5: // Viernes
      return {
        type: 'pack_3',
        title: 'Sobre Estándar (3 Cartas)',
        badge: '3 Cartas ✨',
        shortLabel: '3 Cartas',
        cardCount: 3,
        packType: 'pack_3',
        image: '/cards/Imagen_Sobre_2.png',
        glowColor: 'rgba(168, 85, 247, 0.6)',
        borderColor: 'border-purple-400',
        textColor: 'text-purple-400',
        isRoulette: false,
      };

    case 3: // Miércoles
    case 6: // Sábado
      return {
        type: 'roulette',
        title: 'Probar Suerte (Ruleta)',
        badge: '🎲 Ruleta Azar',
        shortLabel: '🎲 Azar',
        cardCount: 0,
        packType: null,
        image: dayOfWeek === 3 ? '/cards/Imagen_Sobre_2.png' : '/cards/Imagen_Sobre_3.png',
        glowColor: 'rgba(245, 11, 140, 0.6)',
        borderColor: 'border-pink-500',
        textColor: 'text-[#F50B8C]',
        isRoulette: true,
      };

    default:
      return {
        type: 'pack_1',
        title: 'Sobre Básico (1 Carta)',
        badge: '1 Carta',
        shortLabel: '1 Carta',
        cardCount: 1,
        packType: 'pack_1',
        image: '/cards/Imagen_Sobre.png',
        glowColor: 'rgba(6, 182, 212, 0.5)',
        borderColor: 'border-cyan-400',
        textColor: 'text-cyan-400',
        isRoulette: false,
      };
  }
};

/**
 * Returns full calendar info for current real date
 */
export const getRealCalendarInfo = (customDate?: Date) => {
  const now = customDate || new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 to 11
  const today = now.getDate(); // 1 to 31

  // Accurate number of days in the month (accounts for leap years in Feb: 28/29, 30, 31)
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // End of month check
  const isLastDayOfMonth = today === totalDaysInMonth;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const currentMonthName = monthNames[month];
  const todayReward = getDayRewardConfig(now, isLastDayOfMonth);

  // 5-day window centered on today: [-2, -1, 0, 1, 2]
  const dayOffsets = [-2, -1, 0, 1, 2];
  const dayCards = dayOffsets.map((offset) => {
    const d = new Date(year, month, today + offset);
    const dayNum = d.getDate();
    const isCurrent = offset === 0;
    const isPast = offset < 0;
    const isFuture = offset > 0;
    const isMonthEnd = d.getDate() === new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const reward = getDayRewardConfig(d, isMonthEnd);

    return {
      offset,
      date: d,
      dayNum,
      isCurrent,
      isPast,
      isFuture,
      isMonthEnd,
      isCurrentMonth: d.getMonth() === month,
      reward,
    };
  });

  const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(today).padStart(2, '0')}`;

  return {
    now,
    year,
    month,
    today,
    totalDaysInMonth,
    isLastDayOfMonth,
    currentMonthName,
    todayReward,
    dayCards,
    dateKey,
  };
};

/**
 * Check if the user has already claimed their daily reward today
 */
export const checkDailyClaimedStatus = async (
  userId?: string | null,
  dateKey?: string
): Promise<boolean> => {
  const key = dateKey || getRealCalendarInfo().dateKey;

  // 1. Check local storage first
  if (userId) {
    const local = localStorage.getItem(`tokkii_daily_login_${userId}_${key}`);
    if (local === 'true') return true;
  } else {
    const guestLocal = localStorage.getItem(`tokkii_daily_login_guest_${key}`);
    if (guestLocal === 'true') return true;
  }

  // 2. If logged in, check Supabase user_cards
  if (userId) {
    try {
      const cardTag = `DAILY_LOGIN:${key}`;
      const { data, error } = await supabaseAuth
        .from('user_cards')
        .select('id')
        .eq('user_id', userId)
        .eq('source', 'daily_login')
        .eq('card_id', cardTag)
        .maybeSingle();

      if (!error && data) {
        localStorage.setItem(`tokkii_daily_login_${userId}_${key}`, 'true');
        return true;
      }
    } catch (err) {
      console.warn('Error checking daily login status in Supabase:', err);
    }
  }

  return false;
};

/**
 * Roll for reward based on rules:
 * - If last day of the month -> guaranteed 5-card pack (Index 2)
 * - Otherwise -> weighted roll based on weights
 */
export const pickDailyRewardIndex = (isLastDayOfMonth: boolean): number => {
  if (isLastDayOfMonth) {
    // Guaranteed Sobre de 5 Cartas (Index 2)
    return 2;
  }

  const totalWeight = DAILY_ROULETTE_ITEMS.reduce((acc, item) => acc + item.weight, 0);
  const rand = Math.random() * totalWeight;

  let cumulative = 0;
  for (let i = 0; i < DAILY_ROULETTE_ITEMS.length; i++) {
    cumulative += DAILY_ROULETTE_ITEMS[i].weight;
    if (rand <= cumulative) {
      return i;
    }
  }

  return 0;
};

/**
 * Claim the selected daily reward for the user
 */
export const claimDailyReward = async (
  userId: string,
  rewardItem: DailyRewardItem | DayRewardConfig,
  dateKey?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!userId) {
    return { success: false, error: 'Debes iniciar sesión con Twitch para guardar tu recompensa.' };
  }

  const key = dateKey || getRealCalendarInfo().dateKey;
  const cardTag = `DAILY_LOGIN:${key}`;

  try {
    // 1. Record daily login in Supabase user_cards
    const { error: insertErr } = await supabaseAuth.from('user_cards').insert({
      user_id: userId,
      card_id: cardTag,
      count: 1,
      source: 'daily_login',
      obtained_at: new Date().toISOString(),
    });

    if (insertErr) {
      console.warn('Could not record daily login log in Supabase:', insertErr);
    }

    // 2. If reward is a pack, add it to user_packs in Supabase
    if (rewardItem.packType && rewardItem.cardCount > 0) {
      const packType = rewardItem.packType;

      const { data: existingPack, error: fetchErr } = await supabaseAuth
        .from('user_packs')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('pack_type', packType)
        .maybeSingle();

      if (fetchErr) {
        console.warn('Error fetching user pack row:', fetchErr);
      }

      if (existingPack) {
        const newQty = (Number(existingPack.quantity) || 0) + 1;
        const { error: updateErr } = await supabaseAuth
          .from('user_packs')
          .update({
            quantity: newQty,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPack.id);

        if (updateErr) throw updateErr;
      } else {
        const { error: insertPackErr } = await supabaseAuth.from('user_packs').insert({
          user_id: userId,
          pack_type: packType,
          quantity: 1,
          updated_at: new Date().toISOString(),
        });

        if (insertPackErr) throw insertPackErr;
      }
    }

    // 3. Save in localStorage
    localStorage.setItem(`tokkii_daily_login_${userId}_${key}`, 'true');

    return { success: true };
  } catch (err: any) {
    console.error('Error claiming daily reward:', err);
    return { success: false, error: err?.message || 'Error al guardar la recompensa' };
  }
};

