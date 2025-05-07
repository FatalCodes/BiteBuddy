import React, { useState } from 'react';
import { View, StyleSheet, Text, Platform, Alert } from 'react-native';
import { Button, Input } from '../ui';
import { useAuthStore } from '../../stores';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';

interface SignUpFormProps {
  onSuccess?: () => void;
  onLogin?: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSuccess,
  onLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ 
    email?: string; 
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const { signUp, signInWithGoogle, signInWithApple, isLoading, error } = useAuthStore();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { 
      email?: string; 
      password?: string;
      confirmPassword?: string;
    } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    const result = await signUp(email, password);
    
    if (result.success) {
      router.push('/(auth)/verify-email' as any);
    }
  };

  const handleGoogleSubmit = async () => {
    console.log('[DEBUG] SignUpForm: handleGoogleSubmit triggered');
    const result = await signInWithGoogle();
    if (result.success) {
      console.log('Google sign-in initiated successfully (check auth state changes)');
    } else {
      Alert.alert('Google Sign-In Error', result.error || 'Failed to sign in with Google.');
    }
  };

  const handleAppleSubmit = async () => {
    console.log('[DEBUG] SignUpForm: handleAppleSubmit triggered');
    if (Platform.OS !== 'ios') {
      Alert.alert('Platform Error', 'Apple Sign-In is only available on iOS devices.');
      return;
    }
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      if (credential.identityToken) {
        console.log('Apple Credential Received, attempting Supabase sign-in...');
        const fullName = credential.fullName?.givenName && credential.fullName?.familyName 
          ? `${credential.fullName.givenName} ${credential.fullName.familyName}` 
          : null;
        console.log('Passing to signInWithApple - Full Name:', fullName);
        const result = await signInWithApple(credential.identityToken, fullName);
        if (result.success) {
            console.log('Apple sign-in successful (check auth state changes)');
        } else {
           Alert.alert('Sign-In Error', result.error || 'Failed to sign in with Apple.');
        }
      } else {
        console.log('Apple Sign-In did not return an identityToken.');
        Alert.alert('Sign-In Error', 'Could not get authentication token from Apple.');
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        console.log('User canceled Apple Sign-In.');
      } else {
        console.error('AppleAuthentication.signInAsync Error:', e);
        Alert.alert('Sign-In Error', e.message || 'An unexpected error occurred during Apple Sign-In.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to start your journey</Text>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      <Input
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      
      <Input
        label="Password"
        placeholder="Create a password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />
      
      <Input
        label="Confirm Password"
        placeholder="Confirm your password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
      />
      
      <Button
        title="Create Account"
        onPress={handleEmailSubmit}
        isLoading={isLoading}
        style={styles.button}
      />

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button
        title="Sign Up with Google"
        onPress={handleGoogleSubmit}
        isLoading={isLoading}
        style={StyleSheet.flatten([styles.oauthButton, styles.googleButton])}
        icon={<Ionicons name="logo-google" size={20} color="#fff" />}
      />

      {Platform.OS === 'ios' && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={8}
          style={styles.appleButtonNative}
          onPress={handleAppleSubmit}
        />
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?{' '}
        </Text>
        <Text
          style={styles.linkText}
          onPress={onLogin}
        >
          Sign in
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#888',
    fontWeight: '500',
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  googleButton: {
    backgroundColor: '#DB4437', 
  },
  appleButtonNative: {
    width: '100%',
    height: 48,
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
  },
  linkText: {
    color: '#3498db',
    fontWeight: '500',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
  },
}); 