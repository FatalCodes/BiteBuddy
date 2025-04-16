import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname, Stack } from 'expo-router';
import { useAuthStore, useUserProfileStore, useOnboardingStore } from '../../lib/stores';
import { Button } from '../../lib/components';
import { SafeAreaView } from 'react-native-safe-area-context';

const SelectHeightScreen = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { profile } = useUserProfileStore();
    
    // Use the onboarding store instead of API calls
    const { setHeight, navigateToNextStep, data, isLoading } = useOnboardingStore();
    
    // Height always stored in cm
    const [selectedHeight, setSelectedHeight] = useState<number>(data.height || profile?.height || 170);
    
    const isOnboarding = pathname.startsWith('/(onboarding)');

    // Initialize from profile if needed
    useEffect(() => {
        if (profile?.height && !data.height) {
            setSelectedHeight(profile.height);
        }
    }, [profile?.height, data.height]);

    // Generate height values (memoized)
    const heightOptions = useMemo(() => {
        // Generate height options from 100cm to 250cm in steps of 1cm
        const options = [];
        for (let i = 100; i <= 250; i++) {
            options.push(i);
        }
        return options;
    }, []);

    // Handle height selection with useCallback
    const handleSelectHeight = useCallback((height: number) => {
        setSelectedHeight(height);
    }, []);

    // Convert cm to feet and inches for display
    const cmToFeetInches = useCallback((cm: number) => {
        const inches = cm / 2.54;
        const feet = Math.floor(inches / 12);
        const remainingInches = Math.round(inches % 12);
        return `${feet}'${remainingInches}"`;
    }, []);

    // Render a height option item - memoized for performance
    const renderHeightItem = useCallback(({ item }: { item: number }) => {
        const isSelected = selectedHeight === item;
        
        return (
            <TouchableOpacity
                style={[
                    styles.heightOption,
                    isSelected && styles.selectedHeightOption
                ]}
                onPress={() => handleSelectHeight(item)}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.heightText,
                    isSelected && styles.selectedHeightText
                ]}>
                    {item} cm
                </Text>
                <Text style={[
                    styles.heightTextSecondary,
                    isSelected && styles.selectedHeightText
                ]}>
                    {cmToFeetInches(item)}
                </Text>
            </TouchableOpacity>
        );
    }, [selectedHeight, handleSelectHeight, cmToFeetInches]);

    // Use key extractor for FlatList
    const keyExtractor = useCallback((item: number) => item.toString(), []);

    const handleDone = () => {
        if (!selectedHeight) return;

        // Update the onboarding store with the selected height
        setHeight(selectedHeight);
        
        // Use the navigateToNextStep function to handle navigation
        navigateToNextStep();
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <View style={styles.header}>
                <Text style={styles.title}>What's your height?</Text>
                <Text style={styles.subtitle}>Select your height in centimeters.</Text>
            </View>

            <View style={styles.contentContainer}>
                <FlatList
                    data={heightOptions}
                    renderItem={renderHeightItem}
                    keyExtractor={keyExtractor}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.heightGrid}
                    initialNumToRender={15}
                    maxToRenderPerBatch={15}
                    windowSize={5}
                />
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
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 10,
    },
    heightGrid: {
        paddingVertical: 15,
        paddingHorizontal: 5,
    },
    heightOption: {
        flex: 1,
        margin: 8,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    selectedHeightOption: {
        backgroundColor: '#3498db',
        borderColor: '#2980b9',
    },
    heightText: {
        fontSize: 17,
        fontWeight: '500',
        color: '#333',
    },
    heightTextSecondary: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    selectedHeightText: {
        color: '#fff',
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