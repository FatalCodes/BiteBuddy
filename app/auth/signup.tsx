import React from 'react';
import { View, StyleSheet, SafeAreaView, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SignUpForm } from '../../lib/components';

export default function SignUpScreen() {
  const router = useRouter();
  
  const handleSignUpSuccess = () => {
    router.replace('/(tabs)');
  };
  
  const navigateToLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen
        options={{
          title: 'Create Account',
          headerShown: true,
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            {/* <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            /> */}
          </View>
          
          <SignUpForm
            onSuccess={handleSignUpSuccess}
            onLogin={navigateToLogin}
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
    paddingVertical: 30,
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