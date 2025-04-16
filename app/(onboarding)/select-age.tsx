import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    BackHandler, 
    Alert, 
    Platform, 
    TouchableOpacity,
    FlatList
} from 'react-native';
import { useRouter, usePathname, Stack } from 'expo-router';
import { useAuthStore, useUserProfileStore, useOnboardingStore } from '../../lib/stores';
import { Button } from '../../lib/components';
import { SafeAreaView } from 'react-native-safe-area-context';

const SelectAgeScreen = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuthStore();
    const { profile } = useUserProfileStore();
    
    // Use the onboarding store instead of making API calls
    const { setAge, navigateToNextStep, data, isLoading, reset } = useOnboardingStore();
    
    // Local state for the selected age
    const [selectedAge, setSelectedAge] = useState<number>(data.age || profile?.age || 25);
    
    const isOnboarding = pathname.startsWith('/(onboarding)');

    // Initialize from profile if data doesn't exist in onboarding store
    useEffect(() => {
        if (profile?.age && !data.age) {
            setSelectedAge(profile.age);
        }
    }, [profile?.age, data.age]);

    // Generate age values (memoized)
    const ageOptions = useMemo(() => {
        // Generate age options from 13 to 100
        const options = [];
        for (let i = 13; i <= 100; i++) {
            options.push(i);
        }
        return options;
    }, []);

    // Handle age selection with useCallback
    const handleSelectAge = useCallback((age: number) => {
        setSelectedAge(age);
    }, []);

    // Render an age option item - memoized for performance
    const renderAgeItem = useCallback(({ item }: { item: number }) => {
        const isSelected = selectedAge === item;
        
        return (
            <TouchableOpacity
                style={[
                    styles.ageOption,
                    isSelected && styles.selectedAgeOption
                ]}
                onPress={() => handleSelectAge(item)}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.ageText,
                    isSelected && styles.selectedAgeText
                ]}>
                    {item}
                </Text>
            </TouchableOpacity>
        );
    }, [selectedAge, handleSelectAge]);

    // Use key extractor for FlatList
    const keyExtractor = useCallback((item: number) => item.toString(), []);

    // Confirmation dialog for exiting onboarding
    const showExitConfirmation = () => {
        Alert.alert(
            "Exit Onboarding",
            "Are you sure you want to exit the setup process? Your progress will not be saved.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Exit",
                    onPress: () => {
                        // Reset onboarding store data when exiting
                        reset();
                        
                        // Navigate to login - using type coercion for router compatibility
                        router.replace('/(auth)/login' as any);
                    }
                }
            ]
        );
    };

    // Handle hardware back button press for Android
    useEffect(() => {
        // Only add hardware back handler on Android
        if (Platform.OS !== 'android') return;
        
        const handleBackPress = () => {
            showExitConfirmation();
            return true; // Prevents default back behavior
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBackPress
        );

        return () => backHandler.remove();
    }, [router, reset]);

    const handleDone = () => {
        if (!selectedAge) return;

        // Update the onboarding store with the selected age
        setAge(selectedAge);
        
        // Use the new navigateToNextStep function to handle navigation
        navigateToNextStep();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Configure screen navigation options */}
            <Stack.Screen 
                options={{
                    // Show the header but customize it
                    headerShown: true,
                    // Remove the default header title
                    headerTitle: "",
                    // Customize the header style
                    headerStyle: {
                        backgroundColor: '#f8f8f8',
                    },
                    headerShadowVisible: false,
                    // Add a Cancel button in the header
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={showExitConfirmation}
                            style={styles.headerButton}
                        >
                            <Text style={styles.headerButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    ),
                    // This prevents the iOS swipe gesture from automatically going back
                    gestureEnabled: false
                }} 
            />

            <View style={styles.header}>
                <Text style={styles.title}>What's your age?</Text>
                <Text style={styles.subtitle}>This helps us personalize your experience.</Text>
            </View>

            <View style={styles.contentContainer}>
                <FlatList
                    data={ageOptions}
                    renderItem={renderAgeItem}
                    keyExtractor={keyExtractor}
                    numColumns={3}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.ageGrid}
                    initialNumToRender={15}
                    maxToRenderPerBatch={15}
                    windowSize={5}
                />
            </View>

            <View style={styles.footer}>
                <Button
                    title={isLoading ? '' : (isOnboarding ? 'Next' : 'Done')}
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
    ageGrid: {
        paddingVertical: 15,
        paddingHorizontal: 5,
    },
    ageOption: {
        flex: 1,
        margin: 8,
        height: 60,
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
    selectedAgeOption: {
        backgroundColor: '#3498db',
        borderColor: '#2980b9',
    },
    ageText: {
        fontSize: 17,
        fontWeight: '500',
        color: '#333',
    },
    selectedAgeText: {
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
    headerButton: {
        padding: 10,
    },
    headerButtonText: {
        color: '#3498db',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default SelectAgeScreen; 