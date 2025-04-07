import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps,
  ViewStyle,
  TextStyle
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: ViewStyle;
  errorStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  onFocus,
  onBlur,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          inputStyle
        ]}
        placeholderTextColor="#999"
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry}
        {...props}
      />
      {error && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputFocused: {
    borderColor: '#3498db',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
}); 