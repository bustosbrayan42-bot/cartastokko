export interface UserProfile {
  id: string;
  twitch_id?: string;
  username: string;
  display_name: string;
  avatar_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserCardItem {
  id: string;
  user_id: string;
  card_id: string;
  count: number;
  obtained_at: string;
  source?: string;
}

export interface UserPackItem {
  id: string;
  user_id: string;
  pack_type: 'pack_1' | 'pack_3' | 'pack_5';
  quantity: number;
  updated_at: string;
}

export interface UserPacksCount {
  pack_1: number;
  pack_3: number;
  pack_5: number;
}
