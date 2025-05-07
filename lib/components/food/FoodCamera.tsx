import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image, Dimensions, Platform, ScrollView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../ui';
import { FoodNutrition } from '../../../types';
import { useFoodStore } from '../../stores';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image as ExpoImage } from 'expo-image';
import { analyzeFoodImage, OpenAIAPIRefusalError, OpenAINoFoodDetectedError } from '../../api/openai';

// Check if OpenAI API key is configured
import { OPENAI_API_KEY } from '../../utils/openai';

interface FoodSpecifications {
  title?: string;
  description?: string;
  servingSize?: string;
  additionalContext?: string;
}

interface AnalysisConfidence {
  overall: number;
  items: {
    name: string;
    confidence: number;
    needsContext?: boolean;
  }[];
  needsMoreContext: boolean;
  missingInfo?: string[];
}

interface FoodCameraProps {
  userId: string;
  onCapture?: (nutrition: FoodNutrition, imageUri: string) => void;
  onCancel?: () => void;
}

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height; // Get screen height
const guideCircleDiameter = screenWidth * 0.85; // Make circle slightly larger
const guideCircleRadius = guideCircleDiameter / 2;

// Crop box remains based on the desired capture area (can still be square based on circle)
const guideBoxCrop = {
  top: 0.5 - (guideCircleDiameter / 2 / Dimensions.get('window').height), 
  left: (1 - (guideCircleDiameter / screenWidth)) / 2, // Center horizontally based on diameter
  width: guideCircleDiameter / screenWidth, // Width matching diameter relative to screen
  height: guideCircleDiameter / Dimensions.get('window').height, 
};

export const FoodCamera: React.FC<FoodCameraProps> = ({
  userId,
  onCapture,
  onCancel,
}) => {
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri?: string; specifications?: string; timestamp?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  
  // const { simulateAIAnalysis } = useFoodStore(); // Not used if OPENAI_API_KEY is present

  const analyzeImage = useCallback(async (uri: string, specs?: FoodSpecifications) => {
    setAnalyzing(true);
    try {
      const result = await analyzeFoodImage(uri, specs);

      if (result.confidence && result.confidence.overall < 0.15) {
        console.log("Analysis confidence too low (<15%):", result.confidence.overall);
        Alert.alert(
          "No Food Detected",
          "Sorry, we didn't detect any food in your image. Please try again.",
          [{ text: "OK", onPress: () => setImageUri(null) }]
        );
        return;
      }
      
      if (result.confidence?.needsMoreContext && !specs) { 
        console.log("Analysis needs more context, navigating to add-details...");
        router.push({
          pathname: '/food/add-details',
          params: { 
            imageUri: uri,
            confidence: JSON.stringify(result.confidence) 
          }
        });
        return; 
      }

      if (onCapture && result.nutrition) { 
        onCapture(result.nutrition, uri);
      } else if (!result.nutrition) { 
        console.warn("Analysis potentially successful but no nutrition data returned by API.");
        Alert.alert(
          "Analysis Incomplete",
          "The AI analyzed the image but couldn\'t provide complete nutrition details. You can try adding details manually or retake the photo.",
          [{ text: "OK", onPress: () => setImageUri(uri) }]
        );
      }
    } catch (error: any) {
      console.error("Error during analyzeImage in FoodCamera:", error);
      Alert.alert(
        "No Food Detected",
        "Sorry, we didn't detect any food in your image. Please try again.",
        [{ text: "OK", onPress: () => setImageUri(null) }]
      );
    } finally {
      setAnalyzing(false);
    }
  }, [onCapture, router, setImageUri]);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // ---- EFFECT TO HANDLE RETURN FROM ADD DETAILS SCREEN ----
  useEffect(() => {
    if (params.imageUri && params.specifications && params.timestamp) { 
      console.log("Received data back from AddDetailsScreen:", params);
      const returnedUri = params.imageUri;
      const returnedSpecs: FoodSpecifications = JSON.parse(params.specifications);
      if(imageUri !== returnedUri) {
        setImageUri(returnedUri); 
      }
      console.log("Triggering analysis with specs from params after returning from add-details.");
      analyzeImage(returnedUri, returnedSpecs);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [params.imageUri, params.specifications, params.timestamp, analyzeImage]);

  const toggleFlash = () => {
    setIsFlashOn(prev => !prev);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text>Camera permission is required to scan food.</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
        {onCancel && <Button title="Cancel" onPress={onCancel} variant="outline" style={{marginTop: 10}}/>}
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: true });
        if (photo?.uri) {
          setImageUri(photo.uri);
        } else {
          console.warn("Photo capture did not return a valid URI.");
          Alert.alert('Capture Error', 'Could not get image data after taking picture.');
        }
      } catch (error: any) {
        Alert.alert('Capture Error', error.message || 'Failed to take picture. Please try again.');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, 
        aspect: [1, 1], 
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image. Please try again.');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const navigateToManualEntry = () => {
    router.push('/food/entry');
  };

  if (analyzing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.analyzeText}>Analyzing your food...</Text>
        <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
        <Text style={styles.analyzeSubtext}>
          {!OPENAI_API_KEY 
            ? 'Using simulated data (no API key found)'
            : 'Our AI is identifying the food and calculating nutrition information'}
        </Text>
      </View>
    );
  }

  if (imageUri) {
    return (
      <View style={styles.previewContainer}>
        <View style={styles.imagePreviewWrapper}>
          <ExpoImage
            source={{ uri: imageUri }} 
            style={styles.previewImageCircular} 
            contentFit="cover"
          />
        </View>
        <View style={styles.previewControlsContainer}>
          <Button
            title="Add Details"
            onPress={() => {
              router.push({ pathname: '/food/add-details', params: { imageUri } });
            }}
            style={styles.actionButton}
          />
          <Button
            title="Analyze"
            onPress={() => analyzeImage(imageUri)} 
            style={styles.actionButton}
            variant="outline"
          />
          <Button
            title="Retake Photo"
            onPress={() => setImageUri(null)} 
            variant="danger"
            style={styles.actionButton}
          />
        </View>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Checking camera permissions...</Text>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        enableTorch={isFlashOn}
        onCameraReady={() => console.log("Camera ready")}
      />
      <View style={styles.circleOutline} />
      <View style={styles.guidanceTextContainer}>
        <Text style={styles.guidanceText}>Position food in circle</Text>
      </View>
      <View style={styles.topControlsContainer}>
        <TouchableOpacity onPress={handleCancel} style={styles.iconButtonTopLeft}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFlash} style={styles.iconButtonTopRight}>
          <Ionicons name={isFlashOn ? "flash" : "flash-off"} size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.bottomControls}>
        <TouchableOpacity onPress={() => setCameraType(prev => prev === 'back' ? 'front' : 'back')} style={styles.iconButton}>
          <Ionicons name="camera-reverse-outline" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
          <MaterialIcons name="photo-library" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  circleOutline: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: guideCircleDiameter,
    height: guideCircleDiameter,
    borderRadius: guideCircleRadius,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    marginTop: -(guideCircleRadius),
    marginLeft: -(guideCircleRadius),
    zIndex: 3,
  },
  guidanceTextContainer: {
    position: 'absolute',
    top: (screenHeight / 2) + guideCircleRadius + 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  guidanceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Or your app's background
  },
  analyzeText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  loader: {
    marginVertical: 10,
  },
  analyzeSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  topControlsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconButtonTopLeft: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
  },
  iconButtonTopRight: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'black',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePreviewWrapper: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.7,
    borderRadius: (screenWidth * 0.7) / 2,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: '#e0e0e0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  previewImageCircular: {
    width: '100%',
    height: '100%',
  },
  previewControlsContainer: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  actionButton: {
    width: '100%',
    marginBottom: 15,
  },
  bottomControls: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
  },
}); 