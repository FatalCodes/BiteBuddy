import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Keyboard } from 'react-native';
import { useRouter, usePathname, Stack } from 'expo-router';
import { useAuthStore, useUserProfileStore, useOnboardingStore } from '../../lib/stores';
import { Button } from '../../lib/components';
import { SafeAreaView } from 'react-native-safe-area-context';

const SelectHeightScreen = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { profile } = useUserProfileStore();
    
    const { setHeight, navigateToNextStep, data, isLoading } = useOnboardingStore();
    
    const [selectedHeightCm, setSelectedHeightCm] = useState<number>(data.height || profile?.height || 170); // Stays in CM
    const [unit, setUnit] = useState<'ftin' | 'cm'>('ftin');

    const [ftInputValue, setFtInputValue] = useState<string>('');
    const [inInputValue, setInInputValue] = useState<string>('');
    const [cmInputValue, setCmInputValue] = useState<string>('');
    
    const isOnboarding = pathname.startsWith('/(onboarding)');

    const CM_PER_INCH = 2.54;
    const INCHES_PER_FOOT = 12;

    const ftInToCm = useCallback((feet: number, inches: number): number => {
        if (isNaN(feet) || isNaN(inches)) return 0;
        return Math.round((feet * INCHES_PER_FOOT + inches) * CM_PER_INCH);
    }, []);

    const cmToFtIn = useCallback((cm: number): { feet: number, inches: number } => {
        if (isNaN(cm)) return { feet: 0, inches: 0 };
        const totalInches = cm / CM_PER_INCH;
        const feet = Math.floor(totalInches / INCHES_PER_FOOT);
        const inches = Math.round(totalInches % INCHES_PER_FOOT);
        return { feet, inches };
    }, []);

    useEffect(() => {
        // Initialize from profile or data store (already in CM)
        const initialCm = data.height || profile?.height || 170;
        setSelectedHeightCm(initialCm);

        // Always initialize input fields based on the current unit state after selectedHeightCm is set.
        // The unit state itself defaults to 'ftin'.
        if (unit === 'ftin') {
            const { feet, inches } = cmToFtIn(initialCm);
            setFtInputValue(feet.toString());
            setInInputValue(inches.toString());
            setCmInputValue('');
        } else { // unit === 'cm'
            setCmInputValue(initialCm.toString());
            setFtInputValue('');
            setInInputValue('');
        }
    }, [data.height, profile?.height, cmToFtIn, unit]); // Added unit to deps to correctly re-populate inputs if unit changed due to external factors (though unlikely here)

    const handleFtInChange = (ftStr: string, inStr: string) => {
        setFtInputValue(ftStr);
        setInInputValue(inStr);
        const ft = parseFloat(ftStr);
        const inch = parseFloat(inStr);

        if (ftStr === '' && inStr === '') {
            setSelectedHeightCm(0); // Clear height if both inputs are empty
            return;
        }

        const currentFt = !isNaN(ft) && ft >= 0 ? ft : 0;
        const currentIn = !isNaN(inch) && inch >= 0 && inch < 12 ? inch : 0;

        if (ftStr !== '' && isNaN(ft)) { // Invalid foot string
             setSelectedHeightCm(0);
             return;
        }
        if (inStr !== '' && (isNaN(inch) || inch < 0 || inch >= 12)) { // Invalid inch string
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
            setSelectedHeightCm(0); // Set to 0 if invalid or empty
        }
    };

    const handleSetUnit = (newUnit: 'ftin' | 'cm') => {
        if (unit === newUnit) return;
        setUnit(newUnit);
        if (selectedHeightCm > 0) {
            if (newUnit === 'ftin') {
                const { feet, inches } = cmToFtIn(selectedHeightCm);
                setFtInputValue(feet.toString());
                setInInputValue(inches.toString());
                setCmInputValue('');
            } else { // new unit is 'cm'
                setCmInputValue(selectedHeightCm.toString());
                setFtInputValue('');
                setInInputValue('');
            }
        }
    };

    const handleDone = () => {
        if (selectedHeightCm <= 0) {
            // Optionally show an alert or error message
            return;
        }
        setHeight(selectedHeightCm); // Stored in CM
        navigateToNextStep();
        Keyboard.dismiss();
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <View style={styles.header}>
                <Text style={styles.title}>What's your height?</Text>
                <Text style={styles.subtitle}>Enter your height below.</Text>
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
                            maxLength={1} // e.g., 0-9 ft
                            returnKeyType="next"
                        />
                        <Text style={styles.unitLabelFtIn}>ft</Text>
                        <TextInput
                            style={[styles.input, styles.inputFtIn, styles.inputInches]}
                            value={inInputValue}
                            onChangeText={(text) => handleFtInChange(ftInputValue, text)}
                            placeholder="in"
                            keyboardType="numeric"
                            maxLength={2} // e.g., 0-11 in
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
                            returnKeyType="done"
                            onSubmitEditing={handleDone}
                        />
                        <Text style={styles.unitLabelCm}>cm</Text>
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <Button
                    title="Next"
                    onPress={handleDone}
                    disabled={isLoading}
                    style={styles.doneButton}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
        marginBottom: 20, // Added margin for spacing
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center', // Center input area
    },
    unitToggleContainerOuter: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 25,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 4, // Padding inside the toggle background
    },
    unitButton: {
        paddingVertical: 10,
        paddingHorizontal: 25, // Increased padding for better touch area
        borderRadius: 6, // Slightly less rounded than outer container
        marginHorizontal: 2, // Space between buttons
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
        justifyContent: 'center', // Center the ft/in inputs
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
        justifyContent: 'space-between', // Space out input and unit label
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
        minWidth: 60, // Ensure decent width for ft/in inputs
    },
    inputInches: {
        marginLeft: 10, // Space between ft and in inputs
    },
    inputCm: {
        flex: 1, // Allow cm input to take available space
        marginRight: 10,
    },
    unitLabelFtIn: {
        fontSize: 18,
        fontWeight: '500',
        color: '#555',
        marginLeft: 5,
        marginRight: 15, // Space after unit label
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

export default SelectHeightScreen; 