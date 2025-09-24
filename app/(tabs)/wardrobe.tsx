
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
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Share as share, CreditCard as Edit, ArrowLeft, Filter } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { DatabaseService } from '@/services/database';
import { Outfit, OutfitItem } from '@/types/database';

export default function WardrobeScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [savedLooks, setSavedLooks] = useState<Outfit[]>([]);
  const [likedOutfits, setLikedOutfits] = useState<string[]>([]);
  const [favoriteOutfits, setFavoriteOutfits] = useState<string[]>([]);
  const [outfitPreviews, setOutfitPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [outfits, liked, favorites] = await Promise.all([
        DatabaseService.getUserOutfits(user.id),
        DatabaseService.getUserLikedOutfits(user.id),
        DatabaseService.getUserFavoriteOutfits(user.id),
      ]);
      
      setSavedLooks(outfits);
      setLikedOutfits(liked);
      setFavoriteOutfits(favorites);

      // Load one preview image per outfit (first item image if available)
      const previews: Record<string, string> = {};
      await Promise.all(
        outfits.map(async (o) => {
          try {
            const items = await DatabaseService.getOutfitItems(o.id);
            const first = items?.[0]?.wardrobe_item;
            if (first?.image_url) previews[o.id] = first.image_url;
          } catch {}
        })
      );
      setOutfitPreviews(previews);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (outfitId: string) => {
    if (!user) return;
    
    const success = await DatabaseService.toggleOutfitLike(outfitId, user.id);
    if (success) {
      loadData(); // Refresh data to get updated counts
    }
  };

  const shareLook = async (outfit: Outfit) => {
    try {
      await Share.share({
        message: `Check out my ${outfit.name} look on Fitlly! 👗✨`,
        title: 'My Fitlly Look',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share look');
    }
  };

  const editLook = (outfit: Outfit) => {
    Alert.alert('Edit Look', `Edit ${outfit.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Edit', onPress: () => router.push('/mix-match') },
    ]);
  };

  const deleteLook = async (outfitId: string) => {
    Alert.alert(
      'Delete Outfit',
      'Are you sure you want to delete this outfit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const success = await DatabaseService.deleteOutfit(outfitId);
            if (success) {
              loadData();
            } else {
              Alert.alert('Error', 'Failed to delete outfit');
            }
          }
        },
      ]
    );
  };

  const tabs = ['All', 'Favorites', 'Recent', 'Most Liked'];

  const filteredLooks = savedLooks.filter(look => {
    switch (activeTab) {
      case 'Favorites':
        return favoriteOutfits.includes(look.id);
      case 'Recent':
        return true; // All are recent for demo
      case 'Most Liked':
        return look.likes_count > 5;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading your lookbook...</Text>
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
          <Text style={styles.headerTitle}>My Lookbook</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={['#4ECDC4', '#44A08D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <Text style={styles.heroTitle}>Your Style Collection</Text>
          <Text style={styles.heroSubtitle}>
            {savedLooks.length} saved looks • {favoriteOutfits.length} favorites
          </Text>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabs}>
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tab,
                    activeTab === tab && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === tab && styles.activeTabText,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Looks Grid */}
        <View style={styles.looksSection}>
          <Text style={styles.sectionTitle}>
            {activeTab} ({filteredLooks.length})
          </Text>
          <View style={styles.looksGrid}>
            {filteredLooks.map((look) => (
              <View key={look.id} style={styles.lookCard}>
                <Image 
                  source={{ uri: look.preview_image_url || outfitPreviews[look.id] || 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=300' }} 
                  style={styles.lookImage} 
                />
                
                {/* Overlay */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.overlay}
                />

                {/* Card Content */}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.lookName}>{look.name}</Text>
                    <TouchableOpacity onPress={() => toggleLike(look.id)}>
                      <Heart 
                        size={20} 
                        color={likedOutfits.includes(look.id) ? "#FF6B9D" : "white"} 
                        fill={likedOutfits.includes(look.id) ? "#FF6B9D" : "transparent"}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.outfitDetails}>
                    <Text style={styles.outfitText}>{look.description || 'Custom outfit'}</Text>
                    <Text style={styles.outfitText}>{look.occasion || 'Any occasion'}</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.likesContainer}>
                      <Heart size={16} color="#FF6B9D" fill="#FF6B9D" />
                      <Text style={styles.likesText}>{look.likes_count}</Text>
                    </View>
                    <Text style={styles.dateText}>
                      {new Date(look.created_at).toLocaleDateString()}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => editLook(look)}
                    >
                      <Edit size={16} color="#4ECDC4" />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => shareLook(look)}
                    >
                      <share size={16} color="#4ECDC4" />
                      <Text style={styles.actionText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
            {filteredLooks.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No outfits found</Text>
                <TouchableOpacity onPress={() => router.push('/mix-match')}>
                  <Text style={styles.emptyLink}>Create your first look</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Style Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{savedLooks.length}</Text>
              <Text style={styles.statLabel}>Total Looks</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{savedLooks.reduce((sum, look) => sum + look.likes_count, 0)}</Text>
              <Text style={styles.statLabel}>Total Likes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{favoriteOutfits.length}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
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
  filterButton: {
    padding: 8,
  },
  heroSection: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
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
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  tabs: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  activeTab: {
    backgroundColor: '#4ECDC4',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  looksSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  looksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  lookCard: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lookImage: {
    width: '100%',
    height: 200,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lookName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  outfitDetails: {
    marginBottom: 12,
  },
  outfitText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyLink: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '600',
  },
});
