import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../lib/stores';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../lib/components';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { user, checkEmailVerification, resendVerificationEmail, signOut } = useAuthStore();
  const [isChecking, setIsChecking] = useState(false);
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Start checking for verification
  useEffect(() => {
    startVerificationCheck();
    return () => stopVerificationCheck();
  }, []);

  const startVerificationCheck = () => {
    checkVerificationStatus();
    
    // Check again every 5 seconds
    const interval = setInterval(checkVerificationStatus, 5000);
    setCheckInterval(interval);
  };

  const stopVerificationCheck = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      setCheckInterval(null);
    }
  };

  const checkVerificationStatus = async () => {
    if (!user?.email) return;
    
    setIsChecking(true);
    const isVerified = await checkEmailVerification();
    setIsChecking(false);

    if (isVerified) {
      stopVerificationCheck();
      router.replace('/(onboarding)/select-age' as any);
    }
  };

  const handleResendEmail = async () => {
    if (!user?.email) return;

    try {
      await resendVerificationEmail(user.email);
      Alert.alert(
        "Email Sent",
        "A new verification email has been sent to your inbox."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to resend verification email. Please try again later."
      );
    }
  };

  const handleSignOut = async () => {
    stopVerificationCheck();
    await signOut();
    router.replace('/(auth)/login' as any);
  };

  if (!user?.email) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No user found. Please sign in again.</Text>
        <Button title="Go to Login" onPress={() => router.replace('/(auth)/login' as any)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen
        options={{
          title: 'Verify Your Email',
          headerShown: true,
        }}
      />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail" size={64} color="#3498db" />
        </View>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.email}>{user.email}</Text>
        
        <Text style={styles.description}>
          We've sent you a verification email. Please check your inbox and click the verification link to continue.
        </Text>

        {isChecking && (
          <View style={styles.checkingContainer}>
            <ActivityIndicator size="small" color="#3498db" />
            <Text style={styles.checkingText}>Checking verification status...</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Resend Email"
            onPress={handleResendEmail}
            style={styles.resendButton}
          />
          
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  checkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkingText: {
    marginLeft: 8,
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  resendButton: {
    backgroundColor: '#3498db',
  },
  signOutButton: {
    padding: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '500',
  },
}); 