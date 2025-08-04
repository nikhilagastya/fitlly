import React, { useState } from 'react';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shuffle, Save, ArrowLeft, User, Heart } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { DatabaseService } from '@/services/database';
import { WardrobeItem } from '@/types/database';

export default function MixMatchScreen() {
  const { user } = useAuth();
  const [selectedOutfit, setSelectedOutfit] = useState<{
    top: WardrobeItem | null;
    bottom: WardrobeItem | null;
    accessory: WardrobeItem | null;
  }>({
    top: null,
    bottom: null,
    accessory: null,
  });

  const [wardrobeItems, setWardrobeItems] = useState<{
    tops: WardrobeItem[];
    bottoms: WardrobeItem[];
    accessories: WardrobeItem[];
    shoes: WardrobeItem[];
    outerwear: WardrobeItem[];
  }>({
    tops: [],
    bottoms: [],
    accessories: [],
    shoes: [],
    outerwear: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadWardrobeItems();
    }
  }, [user]);

  const loadWardrobeItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [tops, bottoms, accessories, shoes, outerwear] = await Promise.all([
        DatabaseService.getWardrobeItems(user.id, 'TOPS'),
        DatabaseService.getWardrobeItems(user.id, 'BOTTOMS'),
        DatabaseService.getWardrobeItems(user.id, 'ACCESSORIES'),
        DatabaseService.getWardrobeItems(user.id, 'SHOES'),
        DatabaseService.getWardrobeItems(user.id, 'OUTERWEAR'),
      ]);
      
      setWardrobeItems({ tops, bottoms, accessories, shoes, outerwear });
      
      // Auto-select first items if available
      if (tops.length > 0 && !selectedOutfit.top) {
        setSelectedOutfit(prev => ({ ...prev, top: tops[0] }));
      }
      if (bottoms.length > 0 && !selectedOutfit.bottom) {
        setSelectedOutfit(prev => ({ ...prev, bottom: bottoms[0] }));
      }
      if (accessories.length > 0 && !selectedOutfit.accessory) {
        setSelectedOutfit(prev => ({ ...prev, accessory: accessories[0] }));
      }
    } catch (error) {
      console.error('Error loading wardrobe items:', error);
    } finally {
      setLoading(false);
    }
  };

  const randomizeOutfit = () => {
    const randomTop = wardrobeItems.tops.length > 0 
      ? wardrobeItems.tops[Math.floor(Math.random() * wardrobeItems.tops.length)]
      : null;
    const randomBottom = wardrobeItems.bottoms.length > 0
      ? wardrobeItems.bottoms[Math.floor(Math.random() * wardrobeItems.bottoms.length)]
      : null;
    const randomAccessory = wardrobeItems.accessories.length > 0
      ? wardrobeItems.accessories[Math.floor(Math.random() * wardrobeItems.accessories.length)]
      : null;

    setSelectedOutfit({
      top: randomTop,
      bottom: randomBottom,
      accessory: randomAccessory,
    });
  };

  const saveLook = async () => {
    if (!user || (!selectedOutfit.top && !selectedOutfit.bottom && !selectedOutfit.accessory)) {
      Alert.alert('Error', 'Please select at least one item for your outfit');
      return;
    }

    setSaving(true);
    try {
      // Create outfit
      const outfit = await DatabaseService.createOutfit({
        user_id: user.id,
        name: `Look ${new Date().toLocaleDateString()}`,
        description: 'Created with Mix & Match',
        occasion: '',
        season: '',
        is_public: false,
      });

      if (!outfit) {
        Alert.alert('Error', 'Failed to save outfit');
        return;
      }

      // Add outfit items
      const promises = [];
      if (selectedOutfit.top) {
        promises.push(DatabaseService.addOutfitItem({
          outfit_id: outfit.id,
          wardrobe_item_id: selectedOutfit.top.id,
          position_type: 'TOP',
        }));
      }
      if (selectedOutfit.bottom) {
        promises.push(DatabaseService.addOutfitItem({
          outfit_id: outfit.id,
          wardrobe_item_id: selectedOutfit.bottom.id,
          position_type: 'BOTTOM',
        }));
      }
      if (selectedOutfit.accessory) {
        promises.push(DatabaseService.addOutfitItem({
          outfit_id: outfit.id,
          wardrobe_item_id: selectedOutfit.accessory.id,
          position_type: 'ACCESSORY',
        }));
      }

      await Promise.all(promises);

      Alert.alert('Success', 'Look saved to your lookbook!', [
        { text: 'View Lookbook', onPress: () => router.push('/wardrobe') },
        { text: 'OK' },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save outfit');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading your wardrobe...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mix & Match</Text>
          <TouchableOpacity style={styles.heartButton}>
            <Heart size={24} color="#FF6B9D" />
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={['#F3E8FF', '#E0E7FF']}
            style={styles.avatarContainer}
          >
            <View style={styles.avatar}>
              <User size={60} color="#A855F7" />
            </View>
            <Text style={styles.avatarText}>Style Preview</Text>
          </LinearGradient>
        </View>

        {/* Current Outfit Display */}
        <View style={styles.outfitDisplay}>
          <Text style={styles.sectionTitle}>Current Look</Text>
          <View style={styles.outfitGrid}>
            <View style={styles.outfitItem}>
              {selectedOutfit.top ? (
                <Image source={{ uri: selectedOutfit.top.image_url }} style={styles.outfitImage} />
              ) : (
                <View style={styles.emptySlot}>
                  <Text style={styles.emptySlotText}>No Top</Text>
                </View>
              )}
              <Text style={styles.outfitLabel}>Top</Text>
            </View>
            <View style={styles.outfitItem}>
              {selectedOutfit.bottom ? (
                <Image source={{ uri: selectedOutfit.bottom.image_url }} style={styles.outfitImage} />
              ) : (
                <View style={styles.emptySlot}>
                  <Text style={styles.emptySlotText}>No Bottom</Text>
                </View>
              )}
              <Text style={styles.outfitLabel}>Bottom</Text>
            </View>
            <View style={styles.outfitItem}>
              {selectedOutfit.accessory ? (
                <Image source={{ uri: selectedOutfit.accessory.image_url }} style={styles.outfitImage} />
              ) : (
                <View style={styles.emptySlot}>
                  <Text style={styles.emptySlotText}>No Accessory</Text>
                </View>
              )}
              <Text style={styles.outfitLabel}>Accessory</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.randomizeButton} 
            onPress={randomizeOutfit}
            disabled={loading}
          >
            <LinearGradient
              colors={['#FBBF24', '#F59E0B']}
              style={styles.gradientButton}
            >
              <Shuffle size={24} color="white" />
              <Text style={styles.randomizeText}>Randomize Look</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.disabledButton]} 
            onPress={saveLook}
            disabled={saving}
          >
            <Save size={20} color="#10B981" />
            <Text style={styles.saveText}>
              {saving ? 'Saving...' : 'Save Look'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Wardrobe Categories */}
        <View style={styles.wardrobeSection}>
          <Text style={styles.sectionTitle}>Your Wardrobe</Text>
          
          {/* Tops */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>Tops</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsCarousel}>
              {wardrobeItems.tops.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.carouselItem}
                  onPress={() => setSelectedOutfit(prev => ({ ...prev, top: item }))}
                >
                  <Image source={{ uri: item.image_url }} style={styles.carouselImage} />
                </TouchableOpacity>
              ))}
              {wardrobeItems.tops.length === 0 && (
                <TouchableOpacity 
                  style={styles.emptyCategory}
                  onPress={() => router.push('/upload')}
                >
                  <Text style={styles.emptyCategoryText}>Add tops</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Bottoms */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>Bottoms</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsCarousel}>
              {wardrobeItems.bottoms.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.carouselItem}
                  onPress={() => setSelectedOutfit(prev => ({ ...prev, bottom: item }))}
                >
                  <Image source={{ uri: item.image_url }} style={styles.carouselImage} />
                </TouchableOpacity>
              ))}
              {wardrobeItems.bottoms.length === 0 && (
                <TouchableOpacity 
                  style={styles.emptyCategory}
                  onPress={() => router.push('/upload')}
                >
                  <Text style={styles.emptyCategoryText}>Add bottoms</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Accessories */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>Accessories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsCarousel}>
              {wardrobeItems.accessories.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.carouselItem}
                  onPress={() => setSelectedOutfit(prev => ({ ...prev, accessory: item }))}
                >
                  <Image source={{ uri: item.image_url }} style={styles.carouselImage} />
                </TouchableOpacity>
              ))}
              {wardrobeItems.accessories.length === 0 && (
                <TouchableOpacity 
                  style={styles.emptyCategory}
                  onPress={() => router.push('/upload')}
                >
                  <Text style={styles.emptyCategoryText}>Add accessories</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  heartButton: {
    padding: 8,
  },
  avatarSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  avatarContainer: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7C3AED',
  },
  outfitDisplay: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  outfitGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  outfitItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  outfitImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
  },
  emptySlot: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptySlotText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  outfitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  actionButtons: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  randomizeButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.7,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  randomizeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  saveText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  wardrobeSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  itemsCarousel: {
    paddingLeft: 0,
  },
  carouselItem: {
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  carouselImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  emptyCategory: {
    width: 80,
    height: 80,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginRight: 12,
  },
  emptyCategoryText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});