import { supabase } from '@/supabse/Supabase';
import { removeFile } from '@/services/storage';
import { WardrobeItem, Outfit, OutfitItem, Profile, StylePreference } from '@/types/database';

export class DatabaseService {
  // Profile operations
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }
    return true;
  }

  // Wardrobe operations
  static async getWardrobeItems(userId: string, category?: string): Promise<WardrobeItem[]> {
    let query = supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching wardrobe items:', error);
      return [];
    }
    return data || [];
  }

  static async addWardrobeItem(item: Omit<WardrobeItem, 'id' | 'created_at' | 'updated_at'>): Promise<WardrobeItem | null> {
    const { data, error } = await supabase
      .from('wardrobe_items')
      .insert([item])
      .select()
      .single();

    if (error) {
      console.error('Error adding wardrobe item:', error);
      return null;
    }
    return data;
  }

  static async deleteWardrobeItem(itemId: string): Promise<boolean> {
    // Try to fetch image_path to clean up storage
    const { data: itemToDelete } = await supabase
      .from('wardrobe_items')
      .select('image_path')
      .eq('id', itemId)
      .single();

    const { error } = await supabase
      .from('wardrobe_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting wardrobe item:', error);
      return false;
    }
    // best-effort storage cleanup (ignore errors)
    try {
      if (itemToDelete?.image_path) {
        await removeFile('wardrobe', itemToDelete.image_path);
      }
    } catch (e) {
      // no-op
    }
    return true;
  }

  static async toggleFavoriteItem(itemId: string, isFavorite: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('wardrobe_items')
      .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
    return true;
  }

  // Outfit operations
  static async getUserOutfits(userId: string): Promise<Outfit[]> {
    const { data, error } = await supabase
      .from('outfits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching outfits:', error);
      return [];
    }
    return data || [];
  }

  static async createOutfit(outfit: Omit<Outfit, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'favorites_count'>): Promise<Outfit | null> {
    const { data, error } = await supabase
      .from('outfits')
      .insert([outfit])
      .select()
      .single();

    if (error) {
      console.error('Error creating outfit:', error);
      return null;
    }
    return data;
  }

  static async getOutfitItems(outfitId: string): Promise<OutfitItem[]> {
    const { data, error } = await supabase
      .from('outfit_items')
      .select(`
        *,
        wardrobe_item:wardrobe_items(*)
      `)
      .eq('outfit_id', outfitId);

    if (error) {
      console.error('Error fetching outfit items:', error);
      return [];
    }
    return data || [];
  }

  static async addOutfitItem(outfitItem: Omit<OutfitItem, 'id' | 'created_at'>): Promise<OutfitItem | null> {
    const { data, error } = await supabase
      .from('outfit_items')
      .insert([outfitItem])
      .select()
      .single();

    if (error) {
      console.error('Error adding outfit item:', error);
      return null;
    }
    return data;
  }

  static async deleteOutfit(outfitId: string): Promise<boolean> {
    // First delete outfit items
    await supabase
      .from('outfit_items')
      .delete()
      .eq('outfit_id', outfitId);

    // Then delete the outfit
    const { error } = await supabase
      .from('outfits')
      .delete()
      .eq('id', outfitId);

    if (error) {
      console.error('Error deleting outfit:', error);
      return false;
    }
    return true;
  }

  // Style preferences
  static async getStylePreferences(userId: string): Promise<StylePreference[]> {
    const { data, error } = await supabase
      .from('style_preferences')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching style preferences:', error);
      return [];
    }
    return data || [];
  }

  static async addStylePreference(userId: string, preferenceName: string): Promise<boolean> {
    const { error } = await supabase
      .from('style_preferences')
      .insert([{ user_id: userId, preference_name: preferenceName }]);

    if (error) {
      console.error('Error adding style preference:', error);
      return false;
    }
    return true;
  }

  // Outfit likes and favorites
  static async toggleOutfitLike(outfitId: string, userId: string): Promise<boolean> {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('outfit_likes')
      .select('id')
      .eq('outfit_id', outfitId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Remove like
      const { error } = await supabase
        .from('outfit_likes')
        .delete()
        .eq('outfit_id', outfitId)
        .eq('user_id', userId);

      if (!error) {
        // Decrement likes count
        await supabase.rpc('decrement_outfit_likes', { outfit_id: outfitId });
      }
      return !error;
    } else {
      // Add like
      const { error } = await supabase
        .from('outfit_likes')
        .insert([{ outfit_id: outfitId, user_id: userId }]);

      if (!error) {
        // Increment likes count
        await supabase.rpc('increment_outfit_likes', { outfit_id: outfitId });
      }
      return !error;
    }
  }

  static async toggleOutfitFavorite(outfitId: string, userId: string): Promise<boolean> {
    // Check if already favorited
    const { data: existingFavorite } = await supabase
      .from('outfit_favorites')
      .select('id')
      .eq('outfit_id', outfitId)
      .eq('user_id', userId)
      .single();

    if (existingFavorite) {
      // Remove favorite
      const { error } = await supabase
        .from('outfit_favorites')
        .delete()
        .eq('outfit_id', outfitId)
        .eq('user_id', userId);

      if (!error) {
        // Decrement favorites count
        await supabase.rpc('decrement_outfit_favorites', { outfit_id: outfitId });
      }
      return !error;
    } else {
      // Add favorite
      const { error } = await supabase
        .from('outfit_favorites')
        .insert([{ outfit_id: outfitId, user_id: userId }]);

      if (!error) {
        // Increment favorites count
        await supabase.rpc('increment_outfit_favorites', { outfit_id: outfitId });
      }
      return !error;
    }
  }

  // Get user's liked outfits
  static async getUserLikedOutfits(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('outfit_likes')
      .select('outfit_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching liked outfits:', error);
      return [];
    }
    return data?.map(item => item.outfit_id) || [];
  }

  // Get user's favorite outfits
  static async getUserFavoriteOutfits(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('outfit_favorites')
      .select('outfit_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching favorite outfits:', error);
      return [];
    }
    return data?.map(item => item.outfit_id) || [];
  }
}
