import { supabaseAuth } from '../utils/authSupabaseClient';
import type { UserProfile, UserPacksCount } from '../types/user';

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

  // Process each card
  for (const [cardId, count] of idCounts.entries()) {
    // Check if user already owns this card
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
      await supabaseAuth
        .from('user_cards')
        .insert({
          user_id: userId,
          card_id: cardId,
          count: count,
          obtained_at: new Date().toISOString(),
          source: source,
        });
    }
  }
};
