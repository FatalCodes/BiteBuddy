import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button, Input } from '../ui';
import { useAuthStore } from '../../stores';

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
  
  const { signUp, isLoading, error } = useAuthStore();

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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    const result = await signUp(email, password);
    
    if (result.success && onSuccess) {
      onSuccess();
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
        onPress={handleSubmit}
        isLoading={isLoading}
        style={styles.button}
      />
      
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
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