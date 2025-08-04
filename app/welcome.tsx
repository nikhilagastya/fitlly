import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FF6B9D', '#4ECDC4', '#45B7D1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.logoCircle}
            >
              <Text style={styles.logoText}>F</Text>
            </LinearGradient>
            <Text style={styles.appName}>Fitlly</Text>
          </View>
          <View style={styles.sparkleContainer}>
            <Sparkles size={24} color="white" />
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentSection}>
          <View style={styles.heroContent}>
            <Text style={styles.tagline}>Your Closet.</Text>
            <Text style={styles.taglineAccent}>Styled Smarter.</Text>
            <Text style={styles.subtitle}>
              Transform your wardrobe into endless possibilities with AI-powered styling
            </Text>
          </View>

          {/* Feature Highlights */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Smart outfit recommendations</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Mix & match your clothes</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Save & share your looks</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <ArrowRight size={20} color="#FF6B9D" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
      </LinearGradient>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -10,
    right: -30,
  },
  contentSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 40,
  },
  tagline: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  taglineAccent: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FBBF24',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FBBF24',
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  buttonSection: {
    paddingBottom: 50,
    gap: 16,
  },
  getStartedButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    gap: 8,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  loginButton: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: 120,
    left: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    top: 300,
    right: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  decorativeCircle3: {
    position: 'absolute',
    bottom: 200,
    left: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});