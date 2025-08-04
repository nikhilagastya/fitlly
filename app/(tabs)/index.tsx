import React from 'react';
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
import { Shuffle, Plus, Shirt, Heart, Bell, User } from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen() {
  const handleUploadImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        Alert.alert('Success', 'Image uploaded successfully!');
        // Here you would typically save the image to your state or backend
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const wardrobeItems = [
    {
      id: 1,
      name: 'Pink Crop Top',
      category: 'Casual • Summer',
      image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: 2,
      name: 'Blue Jeans',
      category: 'Casual • All seasons',
      image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: 3,
      name: 'White Sneakers',
      category: 'Footwear • Sport',
      image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: 4,
      name: 'Gold Chain',
      category: 'Accessory • Trendy',
      image: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  const recentLooks = [
    {
      id: 1,
      name: 'Casual Day',
      likes: 4,
      image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    {
      id: 2,
      name: 'Date Night',
      likes: 18,
      image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logo}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoText}>F</Text>
              </View>
              <Text style={styles.appName}>Fitlly</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Bell size={24} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButton}>
                <User size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Main Card */}
        <LinearGradient
          colors={['#FF6B9D', '#4ECDC4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainCard}
        >
          <Text style={styles.greeting}>Hey Sarah! ✨</Text>
          <Text style={styles.subGreeting}>
            Ready to create some amazing looks today?
          </Text>
          <TouchableOpacity 
            style={styles.randomButton}
            onPress={() => router.push('/mix-match')}
          >
            <Shuffle size={20} color="#FF6B9D" />
            <Text style={styles.randomButtonText}>Random Look Generator</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={handleUploadImage}
          >
            <View style={styles.actionIcon}>
              <Plus size={24} color="#FF6B9D" />
            </View>
            <Text style={styles.actionTitle}>Add Clothes</Text>
            <Text style={styles.actionSubtitle}>Upload new items</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/mix-match')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E0F2FE' }]}>
              <Shuffle size={24} color="#0EA5E9" />
            </View>
            <Text style={styles.actionTitle}>Outfit Builder</Text>
            <Text style={styles.actionSubtitle}>Mix & match</Text>
          </TouchableOpacity>
        </View>

        {/* My Wardrobe Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Wardrobe</Text>
          <View style={styles.categories}>
            <TouchableOpacity style={[styles.categoryTab, styles.activeTab]}>
              <Text style={[styles.categoryText, styles.activeCategoryText]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryTab}>
              <Text style={styles.categoryText}>Tops</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryTab}>
              <Text style={styles.categoryText}>Bottoms</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryTab}>
              <Text style={styles.categoryText}>Accessories</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.wardrobeGrid}>
            {wardrobeItems.map((item) => (
              <View key={item.id} style={styles.wardrobeItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Looks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Looks</Text>
            <TouchableOpacity onPress={() => router.push('/wardrobe')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.looksGrid}>
            {recentLooks.map((look) => (
              <View key={look.id} style={styles.lookCard}>
                <Image source={{ uri: look.image }} style={styles.lookImage} />
                <Text style={styles.lookName}>{look.name}</Text>
                <View style={styles.lookStats}>
                  <Heart size={16} color="#FF6B9D" fill="#FF6B9D" />
                  <Text style={styles.likesText}>{look.likes}</Text>
                </View>
              </View>
            ))}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 20,
    lineHeight: 22,
  },
  randomButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  randomButtonText: {
    color: '#FF6B9D',
    fontWeight: '600',
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: '600',
  },
  categories: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  activeTab: {
    backgroundColor: '#FF6B9D',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeCategoryText: {
    color: 'white',
  },
  wardrobeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  wardrobeItem: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  looksGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  lookCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  lookImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
  },
  lookName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  lookStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesText: {
    fontSize: 14,
    color: '#FF6B9D',
    fontWeight: '600',
  },
});