import React, { createContext, useContext } from 'react';

// Original app-specific theme structures
interface AppColors { 
  primary: string;
  secondary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  notification: string; 
}

interface AppFonts { 
  regular: string;
  medium: string;
  semiBold: string;
  bold: string;
}

export interface AppTheme { 
  colors: AppColors;
  fonts: AppFonts;
}

// Original Light Theme Definition
const lightAppColors: AppColors = {
  primary: '#007AFF',
  secondary: '#EC407A', 
  background: '#F7F7F7', 
  card: '#FFFFFF',
  text: '#121212',
  textSecondary: '#555555',
  border: '#E0E0E0',
  accent: '#00BCD4', 
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  notification: '#EC407A', 
};

const appFonts: AppFonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

const lightTheme: AppTheme = {
  colors: lightAppColors,
  fonts: appFonts,
};

// Original Context
interface ThemeContextProps {
  theme: AppTheme;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Original Provider
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = lightTheme;

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Original Hook
export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 