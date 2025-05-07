import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewProps, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '@/lib/contexts/ThemeContext'; // Use alias for new location

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  // 'elevated' might be handled differently or removed for modern flat design
  // Let's replace with an optional border
  bordered?: boolean; 
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padded = true,
  bordered = false, // Default to no border
  ...props
}) => {
  const { theme } = useTheme(); // Get theme

  // Generate dynamic styles based on theme and props
  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.card,
    borderRadius: 16, // Slightly larger radius for modern feel
    overflow: 'hidden',
    borderWidth: bordered ? 1 : 0,
    borderColor: bordered ? theme.colors.border : 'transparent',
    ...(padded && { padding: 16 }), // Apply padding conditionally
    
    // Optional: Add subtle shadow for depth (adjust based on theme.dark if needed)
    // shadowColor: theme.dark ? '#000' : '#555',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: theme.dark ? 0.3 : 0.1,
    // shadowRadius: 6,
    // elevation: 5, // Android elevation
  };

  return (
    <View
      style={[
        cardStyle,
        style, // Allow external overrides
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

// No need for StyleSheet.create here anymore as styles are dynamic 