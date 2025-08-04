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
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Share as share, CreditCard as Edit, ArrowLeft, Filter } from 'lucide-react-native';
import { router } from 'expo-router';

export default function WardrobeScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const [savedLooks, setSavedLooks] = useState([

    {
      id: 1,
      name: 'Casual Day',
      likes: 24,
      outfit: {
        top: 'Pink Crop Top',
        bottom: 'Blue Jeans',
        accessory: 'White Sneakers',
      },
      image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=300',
      date: '2 days ago',
      liked: true,
    },
    {
      id: 2,
      name: 'Date Night',
      likes: 42,
      outfit: {
        top: 'Black Top',
        bottom: 'Dress Pants',
        accessory: 'Gold Chain',
      },
      image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=300',
      date: '1 week ago',
      liked: false,
    },
    {
      id: 3,
      name: 'Summer Vibes',
      likes: 18,
      outfit: {
        top: 'Floral Top',
        bottom: 'White Shorts',
        accessory: 'Sun Hat',
      },
      image: 'https://images.pexels.com/photos/1149601/pexels-photo-1149601.jpeg?auto=compress&cs=tinysrgb&w=300',
      date: '3 days ago',
      liked: true,
    },
    {
      id: 4,
      name: 'Office Chic',
      likes: 31,
      outfit: {
        top: 'Blazer',
        bottom: 'Trousers',
        accessory: 'Pearl Necklace',
      },
      image: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=300',
      date: '5 days ago',
      liked: false,
    },
  ]);

  const toggleLike = (lookId) => {
    setSavedLooks(prev => 
      prev.map(look => 
        look.id === lookId ? { ...look, liked: !look.liked, likes: look.liked ? look.likes - 1 : look.likes + 1 } : look
      )
    );
  };

  const shareLook = async (look) => {
    try {
      await Share.share({
        message: `Check out my ${look.name} look on Fitlly! 👗✨`,
        title: 'My Fitlly Look',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share look');
    }
  };

  const editLook = (look) => {
    Alert.alert('Edit Look', `Edit ${look.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Edit', onPress: () => router.push('/mix-match') },
    ]);
  };

  const tabs = ['All', 'Favorites', 'Recent', 'Most Liked'];

  const filteredLooks = savedLooks.filter(look => {
    switch (activeTab) {
      case 'Favorites':
        return look.liked;
      case 'Recent':
        return true; // All are recent for demo
      case 'Most Liked':
        return look.likes > 25;
      default:
        return true;
    }
  });

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
            {savedLooks.length} saved looks • {savedLooks.filter(l => l.liked).length} favorites
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
                <Image source={{ uri: look.image }} style={styles.lookImage} />
                
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
                        color={look.liked ? "#FF6B9D" : "white"} 
                        fill={look.liked ? "#FF6B9D" : "transparent"}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.outfitDetails}>
                    <Text style={styles.outfitText}>{look.outfit.top}</Text>
                    <Text style={styles.outfitText}>{look.outfit.bottom}</Text>
                    <Text style={styles.outfitText}>{look.outfit.accessory}</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.likesContainer}>
                      <Heart size={16} color="#FF6B9D" fill="#FF6B9D" />
                      <Text style={styles.likesText}>{look.likes}</Text>
                    </View>
                    <Text style={styles.dateText}>{look.date}</Text>
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
              <Text style={styles.statNumber}>{savedLooks.reduce((sum, look) => sum + look.likes, 0)}</Text>
              <Text style={styles.statLabel}>Total Likes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{savedLooks.filter(l => l.liked).length}</Text>
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
});