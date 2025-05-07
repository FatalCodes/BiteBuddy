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
import { useTheme } from '@/lib/contexts/ThemeContext'; // Use alias for new location

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle; // Changed to TextStyle as it affects TextInput directly
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
  const { theme } = useTheme(); // Get theme

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };

  // Define dynamic styles based on theme and state
  const dynamicLabelStyle: TextStyle = {
    fontSize: 14,
    fontFamily: theme.fonts.medium, // Poppins Medium
    color: theme.colors.textSecondary,
    marginBottom: 6, 
    ...labelStyle, // Allow external override
  };

  const dynamicInputStyle: TextStyle = {
    fontFamily: theme.fonts.regular, // Poppins Regular
    fontSize: 16,
    borderWidth: 1,
    borderColor: error ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.border,
    borderRadius: 12, // Match button radius
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.card, // Use card color for background
    color: theme.colors.text,
    // Add a subtle transition effect (might need a library like reanimated)
    // transition: 'border-color 0.2s ease-in-out',
    ...inputStyle, // Allow external override
  };

  const dynamicErrorStyle: TextStyle = {
    color: theme.colors.error,
    fontSize: 12,
    fontFamily: theme.fonts.regular,
    marginTop: 4,
    ...errorStyle, // Allow external override
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={dynamicLabelStyle}>
          {label}
        </Text>
      )}
      <TextInput
        style={dynamicInputStyle} // Apply the fully combined dynamic style
        placeholderTextColor={theme.colors.textSecondary} // Use theme color
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry}
        selectionColor={theme.colors.primary} // Set cursor/selection color
        {...props}
      />
      {error && (
        <Text style={dynamicErrorStyle}>
          {error}
        </Text>
      )}
    </View>
  );
};

// Keep minimal base styles, most styling is dynamic now
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  // input: { ... } // Base input styles moved to dynamicInputStyle
  // label: { ... } // Base label styles moved to dynamicLabelStyle
  // errorText: { ... } // Base error styles moved to dynamicErrorStyle
}); 