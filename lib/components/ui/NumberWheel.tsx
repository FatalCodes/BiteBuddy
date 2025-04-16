import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 60; // Keep items relatively compact
const VISIBLE_ITEMS = 7; // Affects the visible curve
const PERSPECTIVE = 800; // Controls the intensity of the 3D effect
const MAX_ROTATE_X = 55; // Increased rotation for more curve

interface NumberWheelProps {
  title: string;
  minValue: number;
  maxValue: number;
  initialValue: number;
  step?: number;
  precision?: number;
  unit?: string;
  alternateUnit?: string;
  onValueSelected: (value: number) => void;
  avatarComponent?: React.ReactNode;
}

const NumberWheel: React.FC<NumberWheelProps> = ({
  title,
  minValue,
  maxValue,
  initialValue,
  step = 1,
  precision = 0,
  unit = '',
  alternateUnit,
  onValueSelected,
  avatarComponent
}) => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedValue, setSelectedValue] = useState<number>(initialValue);
  const [showAlternateUnit, setShowAlternateUnit] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [currentScrollY, setCurrentScrollY] = useState(0); // Non-animated state for JS logic
  const lastHapticIndex = useRef<number | null>(null);

  // Memoize values array generation to avoid recalculating on every render
  const allValues = useMemo(() => {
    console.log("Calculating all values"); // For debugging
    return Array.from(
      { length: Math.floor((maxValue - minValue) / step) + 1 },
      (_, i) => +(minValue + i * step).toFixed(precision)
    );
  }, [minValue, maxValue, step, precision]);

  // Memoize initial scroll offset calculation
  const { initialIndex, initialScrollOffset } = useMemo(() => {
    const index = allValues.findIndex(val => val === initialValue);
    return { 
      initialIndex: index, 
      initialScrollOffset: index >= 0 ? index * ITEM_HEIGHT : 0 
    };
  }, [allValues, initialValue]);

  // Set initial scroll position - only once when component mounts
  useEffect(() => {
    scrollY.setValue(initialScrollOffset);
    setCurrentScrollY(initialScrollOffset);
    if (scrollViewRef.current && initialIndex >= 0) {
      // Use requestAnimationFrame for smoother initial scroll
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({
          y: initialScrollOffset,
          animated: false
        });
      });
    }
  }, [initialIndex, initialScrollOffset]);

  // Handle Done button with useCallback
  const handleDone = useCallback(() => {
    onValueSelected(selectedValue);
    router.back();
  }, [onValueSelected, selectedValue, router]);

  // Memoize the scroll event listener to avoid recreation on every render
  const scrollListener = useCallback((event: { value: number }) => {
    const { value } = event;
    setCurrentScrollY(value);
    const index = Math.round(value / ITEM_HEIGHT);
    if (index >= 0 && index < allValues.length) {
      const newValue = allValues[index];
      if (selectedValue !== newValue) {
        setSelectedValue(newValue);
        // Haptic feedback only when the centered item changes
        if (lastHapticIndex.current !== index) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          lastHapticIndex.current = index;
        }
      }
    }
  }, [allValues, selectedValue]);

  // Update selected value and provide haptic feedback on scroll
  useEffect(() => {
    const listenerId = scrollY.addListener(scrollListener);
    return () => scrollY.removeListener(listenerId);
  }, [scrollListener]); // Only depend on memoized callback

  // Toggle units with useCallback
  const toggleUnit = useCallback(() => {
    if (alternateUnit) {
      setShowAlternateUnit(prev => !prev);
    }
  }, [alternateUnit]);

  // Memoize value conversion function
  const convertValue = useCallback((value: number): string => {
    if (showAlternateUnit && unit === 'kg' && alternateUnit === 'lb') {
      return (value * 2.20462).toFixed(0);
    } else if (showAlternateUnit && unit === 'lb' && alternateUnit === 'kg') {
      return (value / 2.20462).toFixed(0);
    }
    return value.toFixed(precision);
  }, [showAlternateUnit, unit, alternateUnit, precision]);

  // Memoize the animated scroll handler to avoid recreation
  const handleScroll = useMemo(() => Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false } 
  ), [scrollY]);

  // Memoize the item press handler
  const createItemPressHandler = useCallback((itemY: number) => () => {
    scrollViewRef.current?.scrollTo({ y: itemY, animated: true });
  }, []);

  // Memoize the wheel item rendering function
  const renderWheelItem = useCallback((value: number, index: number) => {
    const itemY = index * ITEM_HEIGHT;
    // Use the non-animated state for the conditional check
    const isSelected = Math.abs(itemY - currentScrollY) < ITEM_HEIGHT / 2;

    // Animated value representing the distance of this item from the current scroll center
    const distance = Animated.subtract(scrollY, itemY);

    // Calculate the visible range for interpolation
    const visibleRange = ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2);

    // Interpolate rotation based on distance
    const rotateX = distance.interpolate({
      inputRange: [-visibleRange, 0, visibleRange],
      outputRange: [`${MAX_ROTATE_X}deg`, '0deg', `${-MAX_ROTATE_X}deg`],
      extrapolate: 'clamp'
    });

    // Interpolate scale based on distance
    const scale = distance.interpolate({
      inputRange: [-visibleRange, 0, visibleRange],
      outputRange: [0.6, 1, 0.6], // Scale down further items more
      extrapolate: 'clamp'
    });

    // Interpolate opacity based on distance
    const opacity = distance.interpolate({
      inputRange: [-visibleRange * 1.2, -visibleRange * 0.7, 0, visibleRange * 0.7, visibleRange * 1.2],
      outputRange: [0.1, 0.4, 1, 0.4, 0.1], // Sharper fade
      extrapolate: 'clamp'
    });
    
    // Interpolate vertical translation for curve effect
    const translateY = distance.interpolate({
        inputRange: [-visibleRange, 0, visibleRange],
        outputRange: [ITEM_HEIGHT * 0.5, 0, ITEM_HEIGHT * 0.5], // Push items vertically away
        extrapolate: 'clamp'
      });

    return (
      <TouchableOpacity
        key={index}
        style={styles.wheelItem}
        onPress={createItemPressHandler(itemY)}
        activeOpacity={0.8}
      >
        <Animated.View style={[
          styles.wheelItemContent,
          { 
            opacity,
            transform: [
              { perspective: PERSPECTIVE },
              { rotateX }, 
              { scale },
              { translateY }, // Apply vertical shift for curve
            ]
          }
        ]}>
          <Text
            style={[
              styles.wheelItemText,
              // Use non-animated state for conditional styling
              isSelected ? styles.selectedItemText : styles.inactiveItemText 
            ]}
            numberOfLines={1}
          >
            {convertValue(value)}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }, [currentScrollY, scrollY, convertValue, createItemPressHandler]);

  // Memoize the rendered wheel items to avoid recreating them on every render
  const wheelItems = useMemo(() => {
    return allValues.map(renderWheelItem);
  }, [allValues, renderWheelItem]);

  // Current display unit
  const displayUnit = showAlternateUnit ? alternateUnit : unit;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */} 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close-outline" size={28} color="#555" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.doneHeaderButton} onPress={handleDone}>
          <Text style={styles.doneHeaderText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar (Optional) */} 
      {avatarComponent && (
        <View style={styles.avatarContainer}>
          {avatarComponent}
        </View>
      )}

      {/* Wheel Container - Takes remaining space and centers its child */} 
      <View style={styles.wheelContainer}>
        {/* Fixed Height Wrapper for Visual Wheel Elements */} 
        <View style={styles.wheelVisualWrapper}>
          {/* Top Fade Gradient */} 
          <LinearGradient
            colors={['#FFFFFF', 'rgba(255, 255, 255, 0)']}
            style={styles.fadeGradientTop}
            pointerEvents="none"
          />

          {/* Scrollable Wheel */} 
          <Animated.ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate={0.97} 
            scrollEventThrottle={16}
            onScroll={handleScroll}
            contentContainerStyle={{
              paddingTop: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
              paddingBottom: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
            }}
            style={styles.wheel} // ScrollView style
          >
            {wheelItems}
          </Animated.ScrollView>

          {/* Selection Highlight Box */} 
          <View style={styles.selectionIndicator} pointerEvents="none" />
          
          {/* Unit Toggle */} 
          {(unit || alternateUnit) && (
            <TouchableOpacity 
              style={styles.unitToggle} 
              onPress={toggleUnit} 
              disabled={!alternateUnit}
            >
              <Text style={styles.unitText}>{displayUnit}</Text>
              {alternateUnit && (
                <Ionicons name="swap-horizontal-outline" size={18} color="#333" style={styles.unitIcon} />
              )}
            </TouchableOpacity>
          )}
          
          {/* Bottom Fade Gradient */} 
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', '#FFFFFF']}
            style={styles.fadeGradientBottom}
            pointerEvents="none"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- Styles --- 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EAEAEA', // Lighter border
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E', // Slightly off-black
  },
  doneHeaderButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  doneHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  
  wheelContainer: { // Occupies remaining space and centers the wrapper
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // No background needed here if container has it
  },
  wheelVisualWrapper: { // Fixed height wrapper for centering
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: '100%', // Takes full width
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Important: Clip gradients here
    position: 'relative', // Needed for absolute positioning of children
  },
  wheel: { // Style for the Animated.ScrollView
    width: '100%',
    // Height is implicitly controlled by parent wrapper
    zIndex: 1,
  },
  
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: ITEM_HEIGHT,
  },
  wheelItemText: {
    textAlign: 'center',
    includeFontPadding: false,
    fontSize: 42, // Base size
    color: '#8A8A8E', // Default inactive color (iOS gray)
    fontWeight: '400',
  },
  selectedItemText: {
    color: '#000000',
    fontWeight: '500',
    fontSize: 50, // Larger selected font size
  },
  inactiveItemText: {
    // Styles defined in wheelItemText are used for inactive
  },

  fadeGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) * 1.5, 
    zIndex: 2,
  },
  fadeGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) * 1.5, 
    zIndex: 2,
  },
  selectionIndicator: {
    position: 'absolute',
    top: '50%',
    left: 0, 
    right: 0, 
    height: ITEM_HEIGHT,
    marginTop: -ITEM_HEIGHT / 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1D1D6', 
    zIndex: 0,
  },
  unitToggle: {
    position: 'absolute',
    top: '50%',
    right: width * 0.12, 
    marginTop: -16, 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 220, 220, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 3,
  },
  unitText: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  unitIcon: {
    marginLeft: 4,
  },
});

// Use React.memo to prevent unnecessary re-renders of the entire component
export default React.memo(NumberWheel); 