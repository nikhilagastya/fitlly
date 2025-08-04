export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface WardrobeItem {
  id: string;
  user_id: string;
  name: string;
  category: 'TOPS' | 'BOTTOMS' | 'ACCESSORIES' | 'SHOES' | 'OUTERWEAR';
  subcategory: string;
  color: string;
  brand: string;
  image_url: string;
  image_path: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  name: string;
  description: string;
  occasion: string;
  season: string;
  is_public: boolean;
  likes_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
}

export interface OutfitItem {
  id: string;
  outfit_id: string;
  wardrobe_item_id: string;
  position_type: 'TOP' | 'BOTTOM' | 'ACCESSORY' | 'SHOE' | 'OUTERWEAR';
  created_at: string;
  wardrobe_item?: WardrobeItem;
}

export interface StylePreference {
  id: string;
  user_id: string;
  preference_name: string;
  created_at: string;
}

export interface OutfitLike {
  id: string;
  outfit_id: string;
  user_id: string;
  created_at: string;
}

export interface OutfitFavorite {
  id: string;
  outfit_id: string;
  user_id: string;
  created_at: string;
}