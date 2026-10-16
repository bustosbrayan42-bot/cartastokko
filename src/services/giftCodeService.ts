import { supabaseAuth } from '../utils/authSupabaseClient';

export type PackType = 'pack_1' | 'pack_3' | 'pack_5';

export interface GiftCode {
  id: string;
  code: string;
  pack_type: PackType;
  pack_quantity: number;
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
    pack_type: PackType;
    pack_quantity: number;
    pack_label: string;
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
export const getPackLabel = (type: PackType, qty: number): string => {
  const map: Record<PackType, string> = {
    pack_1: qty === 1 ? 'Sobre de 1 Carta' : 'Sobres de 1 Carta',
    pack_3: qty === 1 ? 'Sobre de 3 Cartas' : 'Sobres de 3 Cartas',
    pack_5: qty === 1 ? 'Sobre de 5 Cartas' : 'Sobres de 5 Cartas',
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
      .select('id, count')
      .eq('user_id', userId)
      .eq('source', 'code_redemption')
      .eq('card_id', codeIdTag);

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

    // 3. Check total global usage limit (if set)
    if (matchedCode.max_total_uses !== null) {
      const { data: allLogs, error: allLogsErr } = await supabaseAuth
        .from('user_cards')
        .select('count')
        .eq('source', 'code_redemption')
        .eq('card_id', codeIdTag);

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

    // 4. Record the redemption in Supabase (upsert / update count if user has already redeemed once)
    const existingLog = userLogs && userLogs.length > 0 ? userLogs[0] : null;

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
        card_id: codeIdTag,
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
    const packType = matchedCode.pack_type;
    const packQty = matchedCode.pack_quantity || 1;

    const { data: existingPack, error: fetchPackErr } = await supabaseAuth
      .from('user_packs')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('pack_type', packType)
      .maybeSingle();

    if (fetchPackErr) {
      console.warn('Error fetching existing pack row:', fetchPackErr);
    }

    if (existingPack) {
      const newQty = (Number(existingPack.quantity) || 0) + packQty;
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
        pack_type: packType,
        quantity: packQty,
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
        pack_type: packType,
        pack_quantity: packQty,
        pack_label: getPackLabel(packType, packQty),
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
