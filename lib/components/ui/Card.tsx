import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewProps, 
  ViewStyle 
} from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padded = true,
  elevated = true,
  ...props
}) => {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        elevated && styles.elevated,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  padded: {
    padding: 16,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
}); 