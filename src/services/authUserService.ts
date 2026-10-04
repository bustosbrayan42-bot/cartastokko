import { supabaseAuth } from '../utils/authSupabaseClient';
import type { UserProfile, UserPacksCount } from '../types/user';
import type { CardData } from '../types/card';

/**
 * Sign in using Twitch OAuth
 */
export const signInWithTwitch = async (): Promise<void> => {
  const redirectUrl = window.location.origin + window.location.pathname;
  const { error } = await supabaseAuth.auth.signInWithOAuth({
    provider: 'twitch',
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    console.error('Error logging in with Twitch:', error);
    throw error;
  }
};

/**
 * Sign out
 */
export const signOutUser = async (): Promise<void> => {
  const { error } = await supabaseAuth.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Get profile for user
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data } = await supabaseAuth
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      return data as UserProfile;
    }

    // Fallback: extract directly from auth session metadata if table row is missing
    const { data: authData } = await supabaseAuth.auth.getUser();
    if (authData?.user && authData.user.id === userId) {
      const meta = (authData.user.user_metadata || {}) as Record<string, any>;
      const fallback: UserProfile = {
        id: userId,
        twitch_id: meta.provider_id || meta.sub || '',
        username: meta.preferred_username || meta.user_name || meta.name || 'Usuario',
        display_name:
          meta.custom_claims?.display_name ||
          meta.display_name ||
          meta.preferred_username ||
          meta.name ||
          'Usuario',
        avatar_url: meta.avatar_url || meta.picture || meta.profile_image_url || '',
      };

      // Try to insert it into profiles table in background
      try {
        await supabaseAuth.from('profiles').upsert(fallback);
      } catch {
        // ignore
      }
      return fallback;
    }

    return null;
  } catch (err) {
    console.warn('Could not fetch user profile:', err);
    return null;
  }
};

/**
 * Fetch all card IDs owned by a user
 */
export const fetchUserCards = async (userId: string): Promise<Map<string, number>> => {
  const cardMap = new Map<string, number>();
  try {
    const { data, error } = await supabaseAuth
      .from('user_cards')
      .select('card_id, count')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user cards:', error);
      return cardMap;
    }

    if (data) {
      data.forEach((row: { card_id: string; count: number }) => {
        cardMap.set(row.card_id, row.count || 1);
      });
    }
  } catch (err) {
    console.warn('Error fetching user cards:', err);
  }

  return cardMap;
};

/**
 * Fetch pack counts for a user
 */
export const fetchUserPacks = async (userId: string): Promise<UserPacksCount> => {
  const counts: UserPacksCount = {
    pack_1: 0,
    pack_3: 0,
    pack_5: 0,
  };

  try {
    const { data, error } = await supabaseAuth
      .from('user_packs')
      .select('pack_type, quantity')
      .eq('user_id', userId);

    if (!error && data && data.length > 0) {
      data.forEach((row: { pack_type: string; quantity: number }) => {
        if (row.pack_type === 'pack_1') counts.pack_1 = Number(row.quantity || 0);
        if (row.pack_type === 'pack_3') counts.pack_3 = Number(row.quantity || 0);
        if (row.pack_type === 'pack_5') counts.pack_5 = Number(row.quantity || 0);
      });
    } else {
      // Ensure initial records exist
      try {
        await supabaseAuth.from('user_packs').upsert([
          { user_id: userId, pack_type: 'pack_1', quantity: 0 },
          { user_id: userId, pack_type: 'pack_3', quantity: 0 },
          { user_id: userId, pack_type: 'pack_5', quantity: 0 },
        ]);
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.warn('Error fetching user packs:', err);
  }

  return counts;
};

/**
 * Deduct 1 pack when opened
 */
export const deductUserPack = async (
  userId: string,
  packType: 'pack_1' | 'pack_3' | 'pack_5'
): Promise<boolean> => {
  // First check current quantity
  const { data, error } = await supabaseAuth
    .from('user_packs')
    .select('quantity')
    .eq('user_id', userId)
    .eq('pack_type', packType)
    .single();

  if (error || !data || data.quantity <= 0) {
    return false;
  }

  const newQty = Math.max(0, data.quantity - 1);

  const { error: updateError } = await supabaseAuth
    .from('user_packs')
    .update({ quantity: newQty, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('pack_type', packType);

  return !updateError;
};

/**
 * Add opened cards into user collection (upsert with count increment)
 */
export const addCardsToUserCollection = async (
  userId: string,
  cardIds: string[],
  source: string = 'pack'
): Promise<void> => {
  if (!userId || cardIds.length === 0) return;

  // Group counts
  const idCounts = new Map<string, number>();
  for (const cid of cardIds) {
    idCounts.set(cid, (idCounts.get(cid) || 0) + 1);
  }

  // Process all cards concurrently in parallel
  await Promise.all(
    Array.from(idCounts.entries()).map(async ([cardId, count]) => {
      try {
        const { data: existing } = await supabaseAuth
          .from('user_cards')
          .select('id, count')
          .eq('user_id', userId)
          .eq('card_id', cardId)
          .maybeSingle();

        if (existing) {
          await supabaseAuth
            .from('user_cards')
            .update({
              count: (existing.count || 1) + count,
              obtained_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          await supabaseAuth.from('user_cards').insert({
            user_id: userId,
            card_id: cardId,
            count: count,
            obtained_at: new Date().toISOString(),
            source: source,
          });
        }
      } catch (err) {
        console.warn(`Error adding card ${cardId} to user:`, err);
      }
    })
  );
};

export interface DuplicatesSummary {
  common: number;
  uncommon: number;
  rare: number;
  super_rare: number;
  ultra_rare: number;
  secret_rare: number;
  totalExchangeable: number;
}

/**
 * Calculate total duplicate cards per rarity (count - 1 for each owned card)
 */
export const calculateDuplicatesSummary = (
  userCardsMap: Map<string, number>,
  allCards: CardData[]
): DuplicatesSummary => {
  const summary: DuplicatesSummary = {
    common: 0,
    uncommon: 0,
    rare: 0,
    super_rare: 0,
    ultra_rare: 0,
    secret_rare: 0,
    totalExchangeable: 0,
  };

  const cardRarityMap = new Map<string, string>();
  allCards.forEach((c) => cardRarityMap.set(c.id, c.rarity));

  userCardsMap.forEach((count, cardId) => {
    if (count > 1) {
      const dups = count - 1;
      const rarity = cardRarityMap.get(cardId);
      if (rarity === 'common') summary.common += dups;
      else if (rarity === 'uncommon') summary.uncommon += dups;
      else if (rarity === 'rare') summary.rare += dups;
      else if (rarity === 'super_rare') summary.super_rare += dups;
      else if (rarity === 'ultra_rare') summary.ultra_rare += dups;
      else if (rarity === 'secret_rare') summary.secret_rare += dups;
    }
  });

  summary.totalExchangeable =
    summary.common + summary.uncommon + summary.rare + summary.super_rare;
  return summary;
};

/**
 * Exchange duplicate cards for 1 pack of 3 cards
 * Rules:
 * - 10 common -> 1 pack_3
 * - 8 uncommon -> 1 pack_3
 * - 6 rare -> 1 pack_3
 * - 5 super_rare -> 1 pack_3
 */
export const exchangeDuplicatesForPack = async (
  userId: string,
  rarity: 'common' | 'uncommon' | 'rare' | 'super_rare',
  allCards: CardData[]
): Promise<{ success: boolean; error?: string }> => {
  if (!userId) return { success: false, error: 'Usuario no autenticado' };

  const requiredMap: Record<string, number> = {
    common: 10,
    uncommon: 8,
    rare: 6,
    super_rare: 5,
  };

  const needed = requiredMap[rarity];
  if (!needed) return { success: false, error: 'Rareza no canjeable' };

  try {
    // 1. Fetch user cards with count > 1
    const { data: userCards, error } = await supabaseAuth
      .from('user_cards')
      .select('id, card_id, count')
      .eq('user_id', userId)
      .gt('count', 1);

    if (error || !userCards) {
      return { success: false, error: 'Error al consultar cartas repetidas' };
    }

    // Filter cards matching rarity
    const targetCardIds = new Set(
      allCards.filter((c) => c.rarity === rarity).map((c) => c.id)
    );

    const eligibleRows = userCards.filter((row) => targetCardIds.has(row.card_id));
    const totalAvailable = eligibleRows.reduce((acc, row) => acc + (row.count - 1), 0);

    if (totalAvailable < needed) {
      return {
        success: false,
        error: `No tienes suficientes repetidas (Disponibles: ${totalAvailable}, Necesitas: ${needed})`,
      };
    }

    // 2. Deduct duplicates across eligible rows (never dropping count below 1)
    let remainingToDeduct = needed;
    const updatePromises = [];

    for (const row of eligibleRows) {
      if (remainingToDeduct <= 0) break;
      const canDeductFromThis = row.count - 1;
      const toDeduct = Math.min(canDeductFromThis, remainingToDeduct);
      const newCount = row.count - toDeduct;

      updatePromises.push(
        supabaseAuth
          .from('user_cards')
          .update({ count: newCount, obtained_at: new Date().toISOString() })
          .eq('id', row.id)
      );

      remainingToDeduct -= toDeduct;
    }

    await Promise.all(updatePromises);

    // 3. Award 1 Pack of 3 Cards to user_packs (update existing row by ID or insert new)
    const { data: existingPack, error: fetchPackError } = await supabaseAuth
      .from('user_packs')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('pack_type', 'pack_3')
      .maybeSingle();

    if (fetchPackError) {
      console.error('Error fetching user pack row:', fetchPackError);
    }

    if (existingPack) {
      const { error: updatePackError } = await supabaseAuth
        .from('user_packs')
        .update({
          quantity: (Number(existingPack.quantity) || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPack.id);

      if (updatePackError) {
        console.error('Error updating pack count in Supabase:', updatePackError);
        return { success: false, error: 'Error al acreditar el sobre en tu cuenta: ' + updatePackError.message };
      }
    } else {
      const { error: insertPackError } = await supabaseAuth
        .from('user_packs')
        .insert({
          user_id: userId,
          pack_type: 'pack_3',
          quantity: 1,
          updated_at: new Date().toISOString(),
        });

      if (insertPackError) {
        console.error('Error inserting pack row in Supabase:', insertPackError);
        return { success: false, error: 'Error al acreditar el sobre en tu cuenta: ' + insertPackError.message };
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error exchanging duplicates:', err);
    return { success: false, error: err?.message || 'Error inesperado al canjear' };
  }
};
