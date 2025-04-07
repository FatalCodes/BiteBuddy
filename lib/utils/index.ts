// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format time
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format date and time
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Calculate calories from macros
export const calculateCalories = (protein: number, carbs: number, fat: number): number => {
  return protein * 4 + carbs * 4 + fat * 9;
};

// Calculate total macros
export const calculateTotalMacros = (protein: number, carbs: number, fat: number): number => {
  return protein + carbs + fat;
};

// Calculate macro percentages
export const calculateMacroPercentages = (protein: number, carbs: number, fat: number) => {
  const total = protein + carbs + fat;
  
  if (total === 0) {
    return { proteinPercentage: 0, carbsPercentage: 0, fatPercentage: 0 };
  }
  
  const proteinPercentage = Math.round((protein / total) * 100);
  const carbsPercentage = Math.round((carbs / total) * 100);
  let fatPercentage = Math.round((fat / total) * 100);
  
  // Ensure percentages add up to 100
  const sum = proteinPercentage + carbsPercentage + fatPercentage;
  if (sum !== 100) {
    fatPercentage += (100 - sum);
  }
  
  return { proteinPercentage, carbsPercentage, fatPercentage };
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
}; 