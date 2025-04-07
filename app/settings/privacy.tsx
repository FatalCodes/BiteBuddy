import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last Updated: May 1, 2023</Text>
          
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to BiteBuddy! This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application. Please read this Privacy Policy carefully. By using the application, you consent to the practices described in this policy.
          </Text>
          
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Personal Data:</Text> When you use BiteBuddy, we may collect personal information such as your name, email address, and profile information.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Health and Nutrition Data:</Text> We collect information about your food intake, dietary preferences, and nutrition habits to provide our core services.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Device Information:</Text> We may collect information about your mobile device including the hardware model, operating system, and unique device identifiers.
          </Text>
          
          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <Text style={styles.listItem}>• Provide, maintain, and improve our services</Text>
          <Text style={styles.listItem}>• Personalize your experience and deliver content relevant to your interests</Text>
          <Text style={styles.listItem}>• Process and complete transactions</Text>
          <Text style={styles.listItem}>• Send you technical notices and support messages</Text>
          <Text style={styles.listItem}>• Respond to your comments and questions</Text>
          
          <Text style={styles.sectionTitle}>4. Data Storage</Text>
          <Text style={styles.paragraph}>
            BiteBuddy primarily stores your data locally on your device. Cloud backup features are optional and only activated with your explicit consent.
          </Text>
          
          <Text style={styles.sectionTitle}>5. Data Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell, trade, or rent your personal information to third parties. We may share anonymous, aggregated data for research or analytical purposes.
          </Text>
          
          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to access, update, or delete your personal information at any time through the app settings. You can also request a copy of your data or ask questions about our privacy practices by contacting us.
          </Text>
          
          <Text style={styles.sectionTitle}>7. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </Text>
          
          <Text style={styles.sectionTitle}>8. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>support@bitebuddy.example.com</Text>
        </View>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 16,
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 8,
    paddingLeft: 16,
  },
  bold: {
    fontWeight: '600',
  },
  contactInfo: {
    fontSize: 16,
    color: '#3498db',
    marginTop: 8,
    marginBottom: 24,
  },
}); 