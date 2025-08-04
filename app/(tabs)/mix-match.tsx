import React, { useState } from 'react';
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

export default function MixMatchScreen() {
  const [selectedOutfit, setSelectedOutfit] = useState({
    top: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=300',
    bottom: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=300',
    accessory: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=300',
  });

  const wardrobeItems = {
    tops: [
      'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=200',
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=200',
      'https://images.pexels.com/photos/1149601/pexels-photo-1149601.jpeg?auto=compress&cs=tinysrgb&w=200',
    ],
    bottoms: [
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=200',
      'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=200',
    ],
    accessories: [
      'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=200',
      'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=200',
    ],
  };

  const randomizeOutfit = () => {
    const randomTop = wardrobeItems.tops[Math.floor(Math.random() * wardrobeItems.tops.length)];
    const randomBottom = wardrobeItems.bottoms[Math.floor(Math.random() * wardrobeItems.bottoms.length)];
    const randomAccessory = wardrobeItems.accessories[Math.floor(Math.random() * wardrobeItems.accessories.length)];

    setSelectedOutfit({
      top: randomTop,
      bottom: randomBottom,
      accessory: randomAccessory,
    });
  };

  const saveLook = () => {
    Alert.alert('Success', 'Look saved to your lookbook!', [
      { text: 'View Lookbook', onPress: () => router.push('/wardrobe') },
      { text: 'OK' },
    ]);
  };

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
              <Image source={{ uri: selectedOutfit.top }} style={styles.outfitImage} />
              <Text style={styles.outfitLabel}>Top</Text>
            </View>
            <View style={styles.outfitItem}>
              <Image source={{ uri: selectedOutfit.bottom }} style={styles.outfitImage} />
              <Text style={styles.outfitLabel}>Bottom</Text>
            </View>
            <View style={styles.outfitItem}>
              <Image source={{ uri: selectedOutfit.accessory }} style={styles.outfitImage} />
              <Text style={styles.outfitLabel}>Accessory</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.randomizeButton} onPress={randomizeOutfit}>
            <LinearGradient
              colors={['#FBBF24', '#F59E0B']}
              style={styles.gradientButton}
            >
              <Shuffle size={24} color="white" />
              <Text style={styles.randomizeText}>Randomize Look</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={saveLook}>
            <Save size={20} color="#10B981" />
            <Text style={styles.saveText}>Save Look</Text>
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
                  <Image source={{ uri: item }} style={styles.carouselImage} />
                </TouchableOpacity>
              ))}
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
                  <Image source={{ uri: item }} style={styles.carouselImage} />
                </TouchableOpacity>
              ))}
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
                  <Image source={{ uri: item }} style={styles.carouselImage} />
                </TouchableOpacity>
              ))}
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
});