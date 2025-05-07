import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LoginForm } from '../../lib/components';
import { useAuthStore } from '../../lib/stores';

export default function LoginScreen() {
  const router = useRouter();
  const { checkSession, user } = useAuthStore();
  
  // Check for existing session
  useEffect(() => {
    const checkAuth = async () => {
      await checkSession();
    };
    
    checkAuth();
  }, []);
  
  // Redirect to main app if user already logged in
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user, router]);
  

  const handleLoginSuccess = () => {
    router.replace('/(tabs)');
  };
  

  const navigateToSignup = () => {
    router.push('/auth/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen
        options={{
          title: 'Sign In',
          headerShown: false,
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <LoginForm
            onSuccess={handleLoginSuccess}
            onCreateAccount={navigateToSignup}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  logo: {
    width: 200,
    height: 200,
  },
}); 