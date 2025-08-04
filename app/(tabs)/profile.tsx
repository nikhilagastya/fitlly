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
import { User, CreditCard as Edit, Settings, Heart, Share, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Star, Shirt } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const handleProfileImageUpload = async () => {
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
        Alert.alert('Success', 'Profile picture updated!');
        // Here you would typically update the profile image in your state/backend
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  const handleMenuItemPress = (title) => {
    switch (title) {
      case 'Edit Profile':
        Alert.alert('Edit Profile', 'Profile editing functionality would be implemented here');
        break;
      case 'Notifications':
        Alert.alert('Notifications', 'Notification settings would be shown here');
        break;
      case 'Privacy':
        Alert.alert('Privacy', 'Privacy settings would be displayed here');
        break;
      case 'Share App':
        Alert.alert('Share App', 'App sharing functionality would be implemented here');
        break;
      case 'Help & Support':
        Alert.alert('Help & Support', 'Help and support options would be shown here');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => {
        // Implement logout logic here
        Alert.alert('Logged Out', 'You have been logged out successfully');
      }},
    ]);
  };

  const stylePreferences = ['Casual', 'Trendy', 'Minimalist', 'Vintage'];
  
  const menuItems = [
    { icon: Edit, title: 'Edit Profile', subtitle: 'Update your information' },
    { icon: Bell, title: 'Notifications', subtitle: 'Manage your alerts' },
    { icon: Shield, title: 'Privacy', subtitle: 'Control your data' },
    { icon: Share, title: 'Share App', subtitle: 'Tell friends about Fitlly' },
    { icon: HelpCircle, title: 'Help & Support', subtitle: 'Get assistance' },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileInfo}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={handleProfileImageUpload}
            >
              <User size={40} color="white" />
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Sarah Johnson</Text>
              <Text style={styles.userEmail}>sarah.j@email.com</Text>
              <View style={styles.memberBadge}>
                <Star size={14} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.memberText}>Premium Member</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleMenuItemPress('Edit Profile')}
          >
            <Edit size={18} color="#667EEA" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Shirt size={24} color="#FF6B9D" />
            </View>
            <Text style={styles.statNumber}>47</Text>
            <Text style={styles.statLabel}>Wardrobe Items</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Heart size={24} color="#10B981" />
            </View>
            <Text style={styles.statNumber}>23</Text>
            <Text style={styles.statLabel}>Saved Looks</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Star size={24} color="#FBBF24" />
            </View>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Total Likes</Text>
          </View>
        </View>

        {/* Style Preferences */}
        <View style={styles.preferencesSection}>
          <Text style={styles.sectionTitle}>Style Preferences</Text>
          <View style={styles.preferencesGrid}>
            {stylePreferences.map((style, index) => (
              <View key={index} style={styles.preferenceTag}>
                <Text style={styles.preferenceText}>{style}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item.title)}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>
                    <item.icon size={20} color="#6B7280" />
                  </View>
                  <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Version & Legal */}
        <View style={styles.legalSection}>
          <TouchableOpacity style={styles.legalItem}>
            <Text style={styles.legalText}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalItem}>
            <Text style={styles.legalText}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpace} />
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  settingsButton: {
    padding: 8,
  },
  profileCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    marginBottom: 8,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  memberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#667EEA',
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  preferencesSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceTag: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  preferenceText: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  menuList: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  legalSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  legalItem: {
    marginBottom: 12,
  },
  legalText: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  logoutButton: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 32,
  },
});