import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, Alert, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore, useUserProfileStore } from '../../lib/stores';
import { Button } from '../../lib/components';

export default function SelectHeightScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, updateProfile, isLoading } = useUserProfileStore();
  
  const [selectedHeightCm, setSelectedHeightCm] = useState<number>(profile?.height || 170);
  const [unit, setUnit] = useState<'ftin' | 'cm'>('ftin');

  const [ftInputValue, setFtInputValue] = useState<string>('');
  const [inInputValue, setInInputValue] = useState<string>('');
  const [cmInputValue, setCmInputValue] = useState<string>('');

  const CM_PER_INCH = 2.54;
  const INCHES_PER_FOOT = 12;

  const ftInToCm = useCallback((feet: number, inches: number): number => {
    if (isNaN(feet) || isNaN(inches)) return 0;
    return Math.round((feet * INCHES_PER_FOOT + inches) * CM_PER_INCH);
  }, []);

  const cmToFtIn = useCallback((cm: number): { feet: number, inches: number } => {
    if (isNaN(cm) || cm <= 0) return { feet: 0, inches: 0 };
    const totalInches = cm / CM_PER_INCH;
    const feet = Math.floor(totalInches / INCHES_PER_FOOT);
    const inches = Math.round(totalInches % INCHES_PER_FOOT);
    return { feet, inches };
  }, []);

  useEffect(() => {
    const initialCm = profile?.height || 170;
    if (profile?.height && profile.height !== selectedHeightCm) {
        setSelectedHeightCm(profile.height);
    } else if (!profile?.height && selectedHeightCm !== 170) {
        setSelectedHeightCm(170);
    }
    
    const currentCmToConvert = profile?.height || selectedHeightCm;

    if (unit === 'ftin') {
        const { feet, inches } = cmToFtIn(currentCmToConvert);
        setFtInputValue(feet.toString());
        setInInputValue(inches.toString());
        setCmInputValue('');
    } else {
        setCmInputValue(currentCmToConvert.toString());
        setFtInputValue('');
        setInInputValue('');
    }
  }, [profile?.height, unit, cmToFtIn, selectedHeightCm]);

  const handleFtInChange = (ftStr: string, inStr: string) => {
    setFtInputValue(ftStr);
    setInInputValue(inStr);
    
    if (ftStr === '' && inStr === '') {
        setSelectedHeightCm(0);
        return;
    }

    const ft = parseFloat(ftStr);
    const inch = parseFloat(inStr);

    const currentFt = !isNaN(ft) && ft >= 0 ? ft : 0;
    const currentIn = !isNaN(inch) && inch >= 0 && inch < 12 ? inch : 0;

    if ((ftStr !== '' && (isNaN(ft) || ft < 0 || ft > 9)) ||
        (inStr !== '' && (isNaN(inch) || inch < 0 || inch >= 12))) {
        setSelectedHeightCm(0);
        return;
    }
    setSelectedHeightCm(ftInToCm(currentFt, currentIn));
  };

  const handleCmChange = (cmStr: string) => {
    setCmInputValue(cmStr);
    const cm = parseFloat(cmStr);
    if (!isNaN(cm) && cm > 0) {
        setSelectedHeightCm(cm);
    } else {
        setSelectedHeightCm(0); 
    }
  };

  const handleSetUnit = (newUnit: 'ftin' | 'cm') => {
    if (unit === newUnit) return;
    setUnit(newUnit);
    const currentCm = selectedHeightCm;
    if (currentCm > 0) {
        if (newUnit === 'ftin') {
            const { feet, inches } = cmToFtIn(currentCm);
            setFtInputValue(feet.toString());
            setInInputValue(inches.toString());
            setCmInputValue('');
        } else {
            setCmInputValue(currentCm.toString());
            setFtInputValue('');
            setInInputValue('');
        }
    } else {
        setFtInputValue('');
        setInInputValue('');
        setCmInputValue('');
    }
  };

  const handleDone = async () => {
    if (!user || selectedHeightCm <= 0) {
      Alert.alert('Invalid Height', 'Please enter a valid height.');
      return;
    }

    const result = await updateProfile(user.id, { height: selectedHeightCm });
    Keyboard.dismiss();
    
    if (result.success) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/profile');
      }
    } else {
      Alert.alert('Error', result.error || 'Failed to save height.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Height' }} /> 
      
      <View style={styles.header}>
        <Text style={styles.title}>Update Your Height</Text>
        <Text style={styles.subtitle}>Used for calorie estimation.</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.unitToggleContainerOuter}>
            <TouchableOpacity 
                style={[styles.unitButton, unit === 'ftin' && styles.unitButtonActive]}
                onPress={() => handleSetUnit('ftin')}
            >
                <Text style={[styles.unitButtonText, unit === 'ftin' && styles.unitButtonTextActive]}>ft / in</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.unitButton, unit === 'cm' && styles.unitButtonActive]}
                onPress={() => handleSetUnit('cm')}
            >
                <Text style={[styles.unitButtonText, unit === 'cm' && styles.unitButtonTextActive]}>cm</Text>
            </TouchableOpacity>
        </View>

        {unit === 'ftin' ? (
            <View style={styles.inputGroupFtIn}>
                <TextInput
                    style={[styles.input, styles.inputFtIn]}
                    value={ftInputValue}
                    onChangeText={(text) => handleFtInChange(text, inInputValue)}
                    placeholder="ft"
                    keyboardType="numeric"
                    maxLength={1}
                    returnKeyType="next"
                />
                <Text style={styles.unitLabelFtIn}>ft</Text>
                <TextInput
                    style={[styles.input, styles.inputFtIn, styles.inputInches]}
                    value={inInputValue}
                    onChangeText={(text) => handleFtInChange(ftInputValue, text)}
                    placeholder="in"
                    keyboardType="numeric"
                    maxLength={2}
                    returnKeyType="done"
                    onSubmitEditing={handleDone}
                />
                <Text style={styles.unitLabelFtIn}>in</Text>
            </View>
        ) : (
            <View style={styles.inputGroupCm}>
                <TextInput
                    style={[styles.input, styles.inputCm]}
                    value={cmInputValue}
                    onChangeText={handleCmChange}
                    placeholder="e.g., 170"
                    keyboardType="numeric"
                    maxLength={3}
                    returnKeyType="done"
                    onSubmitEditing={handleDone}
                />
                <Text style={styles.unitLabelCm}>cm</Text>
            </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button 
          title={"Save"}
          onPress={handleDone} 
          disabled={selectedHeightCm <= 0 || isLoading}
          isLoading={isLoading}
          style={styles.doneButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
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
    textAlign: 'center',
    marginBottom: 20, 
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  unitToggleContainerOuter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  unitButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  unitButtonActive: {
    backgroundColor: '#3498db',
  },
  unitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  unitButtonTextActive: {
    color: '#fff',
  },
  inputGroupFtIn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  inputGroupCm: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    fontSize: 28,
    fontWeight: '500',
    color: '#333',
    paddingVertical: 10,
  },
  inputFtIn: {
    textAlign: 'center',
    minWidth: 60, 
  },
  inputInches: {
    marginLeft: 10, 
  },
  inputCm: {
    flex: 1, 
    marginRight: 10,
  },
  unitLabelFtIn: {
    fontSize: 18,
    fontWeight: '500',
    color: '#555',
    marginLeft: 5,
    marginRight: 15, 
  },
  unitLabelCm: {
    fontSize: 18,
    fontWeight: '500',
    color: '#555',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  doneButton: {
    backgroundColor: '#3498db',
  },
}); 