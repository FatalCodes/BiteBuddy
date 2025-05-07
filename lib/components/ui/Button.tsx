import React, { ReactNode } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { useTheme } from '@/lib/contexts/ThemeContext'; // Use alias for new location

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'; // Added danger/ghost
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  ...props
}) => {
  const { theme } = useTheme(); // Get theme context

  // Define styles dynamically based on theme and props
  const dynamicStyles = getDynamicStyles(theme, variant, size, disabled);

  // Enhanced press handler with debug information
  const handlePress = () => {
    console.log(`Button "${title}" pressed, disabled: ${disabled}, isLoading: ${isLoading}`);
    
    if (disabled || isLoading) {
      console.log(`Button "${title}" is disabled or loading, ignoring press`);
      return;
    }
    
    try {
      onPress();
    } catch (error) {
      console.error(`Error in ${title} button onPress handler:`, error);
    }
  };

  // Content to render inside the button
  const buttonContent = (
    <>
      {icon && iconPosition === 'left' && <View style={dynamicStyles.iconWrapper}>{icon}</View>}
      <Text style={[dynamicStyles.text, textStyle]}>
        {title}
      </Text>
      {icon && iconPosition === 'right' && <View style={dynamicStyles.iconWrapper}>{icon}</View>}
    </>
  );

  return (
    <TouchableOpacity
      style={[
        dynamicStyles.button,
        style // Allow external styles to override
      ]}
      onPress={handlePress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={dynamicStyles.loader.color} // Use dynamic loader color
          size="small" 
        />
      ) : (
        buttonContent
      )}
    </TouchableOpacity>
  );
};

// Function to generate dynamic styles based on theme and props
const getDynamicStyles = (theme: any, variant: string, size: string, disabled: boolean) => {
  const { colors, fonts } = theme;

  // Base styles
  let buttonStyle: ViewStyle = {
    borderRadius: 12, // More rounded corners
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1, // Apply border width generally
    borderColor: 'transparent', // Default to transparent
    opacity: disabled ? 0.6 : 1, // Apply disabled opacity here
  };

  let textStyle: TextStyle = {
    fontFamily: fonts.semiBold, // Use Poppins SemiBold by default
    fontSize: 16,
    textAlign: 'center',
  };

  let loaderColor = colors.text; // Default loader color

  // Variant styles
  switch (variant) {
    case 'primary':
      buttonStyle.backgroundColor = colors.primary;
      buttonStyle.borderColor = colors.primary;
      textStyle.color = colors.card; // White text on primary background
      loaderColor = colors.card;
      break;
    case 'secondary':
      buttonStyle.backgroundColor = colors.secondary;
      buttonStyle.borderColor = colors.secondary;
      textStyle.color = colors.card; // White text on secondary background
      loaderColor = colors.card;
      break;
    case 'outline':
      buttonStyle.backgroundColor = 'transparent';
      buttonStyle.borderColor = colors.primary;
      textStyle.color = colors.primary;
      loaderColor = colors.primary;
      break;
    case 'danger':
      buttonStyle.backgroundColor = colors.error;
      buttonStyle.borderColor = colors.error;
      textStyle.color = colors.card; 
      loaderColor = colors.card;
      break;
    case 'ghost': // Minimal styling, often used for icons or subtle actions
      buttonStyle.backgroundColor = 'transparent';
      buttonStyle.borderColor = 'transparent';
      textStyle.color = colors.textSecondary;
      loaderColor = colors.textSecondary;
      buttonStyle.borderWidth = 0; // No border for ghost
      break;
    default:
      buttonStyle.backgroundColor = colors.primary;
      buttonStyle.borderColor = colors.primary;
      textStyle.color = colors.card;
      loaderColor = colors.card;
  }

  // Size styles
  switch (size) {
    case 'small':
      buttonStyle.paddingVertical = 8;
      buttonStyle.paddingHorizontal = 14;
      textStyle.fontSize = 14;
      break;
    case 'medium':
      buttonStyle.paddingVertical = 12;
      buttonStyle.paddingHorizontal = 24;
      textStyle.fontSize = 16;
      break;
    case 'large':
      buttonStyle.paddingVertical = 16;
      buttonStyle.paddingHorizontal = 32;
      textStyle.fontSize = 18;
      break;
    default:
      buttonStyle.paddingVertical = 12;
      buttonStyle.paddingHorizontal = 24;
      textStyle.fontSize = 16;
  }

  return StyleSheet.create({
    button: buttonStyle,
    text: textStyle,
    iconWrapper: {
      marginHorizontal: 8,
    },
    loader: {
        color: loaderColor
    }
  });
}; 