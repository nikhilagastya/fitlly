
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
import { Plus, Camera, Image as ImageIcon, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { DatabaseService } from '@/services/database';
import { uploadImageFromUri } from '@/services/storage';
import { WardrobeItem } from '@/types/database';

export default function UploadScreen() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('TOPS');
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadWardrobeItems();
    }
  }, [user, selectedCategory]);

  const loadWardrobeItems = async () => {
    if (!user) return;
    
    try {
      const items = await DatabaseService.getWardrobeItems(user.id, selectedCategory);
      setWardrobeItems(items);
    } catch (error) {
      console.error('Error loading wardrobe items:', error);
    }
  };

  const uploadImageToSupabase = async (uri: string): Promise<{ publicUrl: string; path: string } | null> => {
    if (!user) return null;
    try {
      const { publicUrl, path } = await uploadImageFromUri({
        uri,
        bucket: 'wardrobe',
        userId: user.id,
        folder: 'items',
      });
      return { publicUrl, path };
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const saveWardrobeItem = async (imageUri: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const uploaded = await uploadImageToSupabase(imageUri);
      if (!uploaded) {
        Alert.alert('Error', 'Failed to upload image');
        return;
      }

      const newItem: Omit<WardrobeItem, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        name: `New ${selectedCategory.toLowerCase()}`,
        category: selectedCategory as any,
        subcategory: '',
        color: '',
        brand: '',
        image_url: uploaded.publicUrl,
        image_path: uploaded.path,
        tags: [],
        is_favorite: false,
      };

      const savedItem = await DatabaseService.addWardrobeItem(newItem);
      if (savedItem) {
        Alert.alert('Success', 'Item added to your wardrobe!');
        loadWardrobeItems();
      } else {
        Alert.alert('Error', 'Failed to save item');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };
  const handleCameraUpload = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        await saveWardrobeItem(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleGalleryUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library permissions.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        await saveWardrobeItem(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const handleCategoryUpload = () => {
    Alert.alert(
      'Upload Options',
      'Choose how you want to upload your item',
      [
        { text: 'Camera', onPress: handleCameraUpload },
        { text: 'Gallery', onPress: handleGalleryUpload },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const removeItem = async (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const success = await DatabaseService.deleteWardrobeItem(itemId);
            if (success) {
              loadWardrobeItems();
            } else {
              Alert.alert('Error', 'Failed to delete item');
            }
          }
        },
      ]
    );
  };

  const categories = [
    { id: 'TOPS', name: 'TOPS', color: '#FF6B9D', bgColor: '#FEE2E2' },
    { id: 'BOTTOMS', name: 'BOTTOMS', color: '#0EA5E9', bgColor: '#E0F2FE' },
    { id: 'ACCESSORIES', name: 'ACCESSORIES', color: '#10B981', bgColor: '#D1FAE5' },
    { id: 'SHOES', name: 'SHOES', color: '#8B5CF6', bgColor: '#F3E8FF' },
    { id: 'OUTERWEAR', name: 'OUTERWEAR', color: '#F59E0B', bgColor: '#FEF3C7' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Wardrobe</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={['#A855F7', '#EC4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Build Your Digital Closet</Text>
          <Text style={styles.heroSubtitle}>
            Upload your clothes and let AI create amazing outfits for you!
          </Text>
        </LinearGradient>

        {/* Category Cards */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Choose Category</Text>
          <View style={styles.categoryCards}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: category.bgColor },
                  selectedCategory === category.id && styles.selectedCard,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Plus size={24} color="white" />
                </View>
                <Text style={[styles.categoryName, { color: category.color }]}>
                  {category.name}
                </Text>
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={handleCategoryUpload}
                >
                  <Text style={[styles.uploadButtonText, { color: category.color }]}>
                    Upload
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upload Options */}
        <View style={styles.uploadOptions}>
          <TouchableOpacity style={styles.uploadOption} onPress={handleCameraUpload}>
            <View style={styles.optionIcon}>
              <Camera size={28} color="#FF6B9D" />
            </View>
            <Text style={styles.optionTitle}>Take Photo</Text>
            <Text style={styles.optionSubtitle}>Use camera to capture</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadOption} onPress={handleGalleryUpload}>
            <View style={styles.optionIcon}>
              <ImageIcon size={28} color="#0EA5E9" />
            </View>
            <Text style={styles.optionTitle}>From Gallery</Text>
            <Text style={styles.optionSubtitle}>Choose from photos</Text>
          </TouchableOpacity>
        </View>

        {/* Preview Grid */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory} ({wardrobeItems.length})
          </Text>
          <View style={styles.previewGrid}>
            {wardrobeItems.map((item) => (
              <View key={item.id} style={styles.previewItem}>
                <Image source={{ uri: item.image_url }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => removeItem(item.id)}
                  disabled={loading}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            {/* Add More Button */}
            <TouchableOpacity 
              style={styles.addMoreButton} 
              onPress={handleCategoryUpload}
              disabled={loading}
            >
              <Plus size={32} color="#9CA3AF" />
              <Text style={styles.addMoreText}>
                {loading ? 'Uploading...' : 'Add More'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>📸 Photo Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Use good lighting</Text>
            <Text style={styles.tipItem}>• Lay clothes flat</Text>
            <Text style={styles.tipItem}>• Remove background clutter</Text>
            <Text style={styles.tipItem}>• Take multiple angles</Text>
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
  placeholder: {
    width: 40,
  },
  heroSection: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    lineHeight: 22,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  categoryCards: {
    gap: 16,
  },
  categoryCard: {
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  uploadButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  uploadButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  uploadOptions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  uploadOption: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  previewSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  previewItem: {
    width: '31%',
    aspectRatio: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addMoreButton: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '600',
  },
  tipsSection: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
