import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();
  
  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening URL:', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.paragraph}>
            BiteBuddy is designed to help you make healthier food choices, track your nutrition, and build better eating habits. Our mission is to simplify nutrition tracking while making it fun and engaging through our companion feature.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="restaurant-outline" size={24} color="#3498db" style={styles.featureIcon} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Food Logging</Text>
              <Text style={styles.featureDescription}>
                Easily log your meals with our intuitive food entry system, complete with image recognition.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="analytics-outline" size={24} color="#3498db" style={styles.featureIcon} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Nutrition Tracking</Text>
              <Text style={styles.featureDescription}>
                Monitor your macronutrients and overall calorie intake with detailed charts and insights.
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="happy-outline" size={24} color="#3498db" style={styles.featureIcon} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Virtual Companion</Text>
              <Text style={styles.featureDescription}>
                Stay motivated with your virtual pet that grows and thrives as you maintain good nutrition habits.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Development Team</Text>
          <Text style={styles.paragraph}>
            BiteBuddy was created by a passionate team of developers, nutritionists, and designers committed to creating useful tools for healthy living.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => openLink('https://www.example.com/bitebuddy')}
          >
            <Ionicons name="globe-outline" size={22} color="#fff" style={styles.linkIcon} />
            <Text style={styles.linkText}>Visit Our Website</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.linkButton, styles.twitterButton]}
            onPress={() => openLink('https://twitter.com/bitebuddy')}
          >
            <Ionicons name="logo-twitter" size={22} color="#fff" style={styles.linkIcon} />
            <Text style={styles.linkText}>Follow on Twitter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.linkButton, styles.emailButton]}
            onPress={() => openLink('mailto:support@bitebuddy.example.com')}
          >
            <Ionicons name="mail-outline" size={22} color="#fff" style={styles.linkIcon} />
            <Text style={styles.linkText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.copyright}>© 2023 BiteBuddy. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  version: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  section: {
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  featureIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  twitterButton: {
    backgroundColor: '#1DA1F2',
  },
  emailButton: {
    backgroundColor: '#34495e',
  },
  linkIcon: {
    marginRight: 10,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  copyright: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
    fontSize: 14,
  },
}); 