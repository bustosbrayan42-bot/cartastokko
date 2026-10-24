import { supabaseAuth } from '../utils/authSupabaseClient';

export type PackType = 'pack_1' | 'pack_3' | 'pack_5' | 'multi';

export interface PackPool {
  pack_1: number;
  pack_3: number;
  pack_5: number;
}

export interface GiftCode {
  id: string;
  code: string;
  pack_type: PackType;
  pack_quantity: number;
  pack_pool?: PackPool;
  max_total_uses: number | null;
  max_uses_per_user: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  description?: string;
}

export interface RedeemResult {
  success: boolean;
  error?: string;
  reward?: {
    code: string;
    pack_type: 'pack_1' | 'pack_3' | 'pack_5';
    pack_quantity: number;
    pack_label: string;
    is_random_multi?: boolean;
  };
}

const R2_PUBLIC_CODES_URL = 'https://pub-0bf9a87cec964ff49bfd058873c948c3.r2.dev/gift_codes.json';

/**
 * Fetch list of active gift codes from storage (R2 / Supabase fallback)
 */
export const fetchActiveGiftCodes = async (): Promise<GiftCode[]> => {
  // 1. Try Supabase gift_codes table if it exists
  try {
    const { data, error } = await supabaseAuth
      .from('gift_codes')
      .select('*')
      .eq('is_active', true);

    if (!error && Array.isArray(data) && data.length > 0) {
      return data as GiftCode[];
    }
  } catch {
    // ignore
  }

  // 2. Fetch from Cloudflare R2 public endpoint
  try {
    const res = await fetch(`${R2_PUBLIC_CODES_URL}?t=${Date.now()}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data as GiftCode[];
      }
    }
  } catch (err) {
    console.error('Error fetching gift codes from R2:', err);
  }

  // 3. Fallback to localStorage backup
  try {
    const local = localStorage.getItem('tokkii_gift_codes_backup');
    if (local) return JSON.parse(local);
  } catch {
    // ignore
  }

  return [];
};

/**
 * Helper to get human friendly pack name
 */
export const getPackLabel = (type: string, qty: number): string => {
  const map: Record<string, string> = {
    pack_1: qty === 1 ? 'Sobre de 1 Carta' : 'Sobres de 1 Carta',
    pack_3: qty === 1 ? 'Sobre de 3 Cartas' : 'Sobres de 3 Cartas',
    pack_5: qty === 1 ? 'Sobre de 5 Cartas' : 'Sobres de 5 Cartas',
    multi: 'Multisobres Aleatorios',
  };
  return `${qty}x ${map[type] || 'Sobre'}`;
};

/**
 * Redeem a gift code for a logged in user
 */
export const redeemGiftCode = async (
  userId: string,
  rawCode: string
): Promise<RedeemResult> => {
  if (!userId) {
    return {
      success: false,
      error: 'Debes iniciar sesión con tu cuenta de Twitch para canjear un código de regalo.',
    };
  }

  const cleanCode = rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (!cleanCode) {
    return {
      success: false,
      error: 'Por favor ingresa un código de regalo válido.',
    };
  }

  try {
    // 1. Fetch available codes
    const codes = await fetchActiveGiftCodes();
    const matchedCode = codes.find((c) => c.code.toUpperCase() === cleanCode);

    if (!matchedCode) {
      return {
        success: false,
        error: `El código "${cleanCode}" no existe o no es válido. Verifica que esté bien escrito.`,
      };
    }

    if (!matchedCode.is_active) {
      return {
        success: false,
        error: `El código "${cleanCode}" ha sido pausado o ya no está disponible.`,
      };
    }

    const codeIdTag = `GIFT_CODE:${matchedCode.code.toUpperCase()}`;

    // 2. Check user usage limit
    const { data: userLogs, error: userLogsErr } = await supabaseAuth
      .from('user_cards')
      .select('id, card_id, count')
      .eq('user_id', userId)
      .eq('source', 'code_redemption')
      .or(`card_id.eq.${codeIdTag},card_id.like.${codeIdTag}:%`);

    if (userLogsErr) {
      console.warn('Error querying user redemptions:', userLogsErr);
    }

    const userUses = (userLogs || []).reduce((acc: number, r: { count?: number }) => acc + (r.count || 1), 0);
    const maxPerUser = matchedCode.max_uses_per_user || 1;

    if (userUses >= maxPerUser) {
      return {
        success: false,
        error: `Ya has canjeado el código "${cleanCode}" el número máximo de veces permitido (${maxPerUser} ${maxPerUser === 1 ? 'vez' : 'veces'}).`,
      };
    }

    let awardedPack: 'pack_1' | 'pack_3' | 'pack_5' = 'pack_3';
    let awardedQty = 1;

    // 3. Handle multisobres vs standard codes
    if (matchedCode.pack_type === 'multi') {
      // Query all logs for this code to calculate remaining envelopes in pool
      const { data: allLogs, error: allLogsErr } = await supabaseAuth
        .from('user_cards')
        .select('card_id, count')
        .eq('source', 'code_redemption')
        .or(`card_id.eq.${codeIdTag},card_id.like.${codeIdTag}:%`);

      if (allLogsErr) {
        console.warn('Error querying all redemptions for multisobres:', allLogsErr);
      }

      let claimed1 = 0;
      let claimed3 = 0;
      let claimed5 = 0;

      (allLogs || []).forEach((r: { card_id?: string; count?: number }) => {
        const cnt = r.count || 1;
        const cId = r.card_id || '';
        if (cId.endsWith(':pack_1')) claimed1 += cnt;
        else if (cId.endsWith(':pack_3')) claimed3 += cnt;
        else if (cId.endsWith(':pack_5')) claimed5 += cnt;
      });

      const pool = matchedCode.pack_pool || { pack_1: 0, pack_3: 0, pack_5: 0 };
      const rem1 = Math.max(0, (pool.pack_1 || 0) - claimed1);
      const rem3 = Math.max(0, (pool.pack_3 || 0) - claimed3);
      const rem5 = Math.max(0, (pool.pack_5 || 0) - claimed5);
      const totalRemaining = rem1 + rem3 + rem5;

      if (totalRemaining <= 0) {
        return {
          success: false,
          error: `¡Llegaste tarde! Todos los sobres de este código ya han sido canjeados (${(pool.pack_1 || 0) + (pool.pack_3 || 0) + (pool.pack_5 || 0)} sobres en total).`,
        };
      }

      // Weighted random selection based on remaining packs
      const rand = Math.floor(Math.random() * totalRemaining);
      if (rand < rem1) {
        awardedPack = 'pack_1';
      } else if (rand < rem1 + rem3) {
        awardedPack = 'pack_3';
      } else {
        awardedPack = 'pack_5';
      }
      awardedQty = 1;
    } else {
      // Standard fixed pack code
      if (matchedCode.max_total_uses !== null) {
        const { data: allLogs, error: allLogsErr } = await supabaseAuth
          .from('user_cards')
          .select('count')
          .eq('source', 'code_redemption')
          .or(`card_id.eq.${codeIdTag},card_id.like.${codeIdTag}:%`);

        if (allLogsErr) {
          console.warn('Error querying all redemptions:', allLogsErr);
        }

        const totalUsed = (allLogs || []).reduce((acc: number, r: { count?: number }) => acc + (r.count || 1), 0);
        if (totalUsed >= matchedCode.max_total_uses) {
          return {
            success: false,
            error: `¡Llegaste tarde! El código "${cleanCode}" ya ha alcanzado su límite máximo de canjes disponibles (${matchedCode.max_total_uses}).`,
          };
        }
      }

      awardedPack = (matchedCode.pack_type || 'pack_3') as 'pack_1' | 'pack_3' | 'pack_5';
      awardedQty = matchedCode.pack_quantity || 1;
    }

    // 4. Record the redemption in Supabase
    const finalCardId = matchedCode.pack_type === 'multi'
      ? `${codeIdTag}:${awardedPack}`
      : codeIdTag;

    const existingLog = (userLogs || []).find((l: { card_id?: string }) => l.card_id === finalCardId);

    if (existingLog) {
      const { error: updateRedeemErr } = await supabaseAuth
        .from('user_cards')
        .update({
          count: (existingLog.count || 1) + 1,
          obtained_at: new Date().toISOString(),
        })
        .eq('id', existingLog.id);

      if (updateRedeemErr) {
        console.error('Error updating redemption log:', updateRedeemErr);
        return {
          success: false,
          error: 'Error al registrar el canje en la base de datos. Inténtalo nuevamente.',
        };
      }
    } else {
      const { error: insertRedeemErr } = await supabaseAuth.from('user_cards').insert({
        user_id: userId,
        card_id: finalCardId,
        count: 1,
        source: 'code_redemption',
        obtained_at: new Date().toISOString(),
      });

      if (insertRedeemErr) {
        console.error('Error inserting redemption log:', insertRedeemErr);
        return {
          success: false,
          error: 'Error al registrar el canje en la base de datos. Inténtalo nuevamente.',
        };
      }
    }

    // 5. Award the packs to user_packs in Supabase
    const { data: existingPack, error: fetchPackErr } = await supabaseAuth
      .from('user_packs')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('pack_type', awardedPack)
      .maybeSingle();

    if (fetchPackErr) {
      console.warn('Error fetching existing pack row:', fetchPackErr);
    }

    if (existingPack) {
      const newQty = (Number(existingPack.quantity) || 0) + awardedQty;
      const { error: updatePackErr } = await supabaseAuth
        .from('user_packs')
        .update({
          quantity: newQty,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPack.id);

      if (updatePackErr) {
        console.error('Error updating pack quantity:', updatePackErr);
        return {
          success: false,
          error: 'Error al acreditar los sobres en tu cuenta. Contáctate con Tokkii.',
        };
      }
    } else {
      const { error: insertPackErr } = await supabaseAuth.from('user_packs').insert({
        user_id: userId,
        pack_type: awardedPack,
        quantity: awardedQty,
        updated_at: new Date().toISOString(),
      });

      if (insertPackErr) {
        console.error('Error creating user pack row:', insertPackErr);
        return {
          success: false,
          error: 'Error al acreditar los sobres en tu cuenta.',
        };
      }
    }

    return {
      success: true,
      reward: {
        code: matchedCode.code,
        pack_type: awardedPack,
        pack_quantity: awardedQty,
        pack_label: getPackLabel(awardedPack, awardedQty),
        is_random_multi: matchedCode.pack_type === 'multi',
      },
    };
  } catch (err: any) {
    console.error('Unexpected error during code redemption:', err);
    return {
      success: false,
      error: err?.message || 'Ocurrió un error inesperado al canjear el código.',
    };
  }
};
