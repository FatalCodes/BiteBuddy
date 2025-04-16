import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image, Dimensions, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../ui';
import { FoodNutrition } from '../../../types';
import { useFoodStore } from '../../stores';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter } from 'expo-router';

// Check if OpenAI API key is configured
import { OPENAI_API_KEY } from '../../utils/openai';

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
  // Camera state
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef<any>(null);
  
  // Image and processing state
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const { simulateAIAnalysis } = useFoodStore();

  // Request gallery permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery access is needed to select food images.');
      }
    })();
  }, []);

  // Alert user if no API key is configured
  useEffect(() => {
    if (!OPENAI_API_KEY) {
      Alert.alert(
        'Development Mode',
        'No OpenAI API key found. The app will use simulated food data instead of real AI analysis.'
      );
    }
  }, []);

  // Handle taking picture with camera and cropping to the circular guide area
  const takePicture = async () => {
    if (!cameraRef.current || !cameraReady) {
      Alert.alert('Camera Not Ready', 'Please wait...');
      return;
    }
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
         quality: 0.9, // Higher quality before crop
         // base64: true, // Uncomment if needed for API
      });

      if (!photo || !photo.uri || !photo.width || !photo.height) {
        throw new Error('Failed to capture photo details.');
      }

      // Calculate crop region based on the invisible guideBoxCrop
      const cropRegion = {
        originX: photo.width * guideBoxCrop.left,
        originY: photo.height * guideBoxCrop.top,
        width: photo.width * guideBoxCrop.width,
        height: photo.height * guideBoxCrop.height,
      };

      // Crop the image to the square area first
      const croppedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop: cropRegion }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG } 
      );
      
      // Although we crop to a square, we pass the URI to the form
      // The circular appearance is purely visual in the camera UI
      setImageUri(croppedPhoto.uri);
      analyzeImage(croppedPhoto.uri); 

    } catch (error: any) {
      console.error("Capture/Crop Error:", error);
      Alert.alert('Error', error.message || 'Failed to capture or crop picture.');
    }
  };

  // Toggle between front and back camera
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Open image picker
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // Let user crop/edit from gallery
        aspect: [1, 1], // Encourage square crop from gallery
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image. Please try again.');
    }
  };

  // Analyze the captured (and potentially cropped) image
  const analyzeImage = async (uri: string) => {
    setAnalyzing(true);
    try {
      const result = await simulateAIAnalysis(uri);
      
      if (!result.success) {
        // Show error message and reset
        Alert.alert('No Food Detected', result.error || 'Please try taking another photo.');
        setImageUri(null);
        return;
      }

      if (onCapture && result.data) {
        onCapture(result.data, uri);
      }
    } catch (error: any) {
      Alert.alert('Analysis Error', error.message || 'Failed to analyze image.');
      setImageUri(null);
    } finally {
      setAnalyzing(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Navigate to manual food entry page
  const navigateToManualEntry = () => {
    router.push('/food/entry');
  };

  // If analyzing image
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

  // Show the selected image if available
  if (imageUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
        <View style={styles.controls}>
          <Text style={styles.processingText}>Processing image...</Text>
          <ActivityIndicator size="small" color="#3498db" />
        </View>
      </View>
    );
  }

  // If camera permissions are still loading
  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Checking camera permissions...</Text>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  // If camera permissions are not granted
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.pickerContainer}>
          <Text style={styles.header}>Camera Permission Required</Text>
          <Text style={styles.subheader}>
            We need camera access to take photos of your food
          </Text>
          
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            style={{ marginBottom: 20 }}
          />
          
          <Text style={styles.orText}>- OR -</Text>
          
          <Button
            title="Use Gallery Instead"
            onPress={pickImage}
            variant="outline"
            style={{ marginTop: 20, marginBottom: 20 }}
          />
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Camera view (when permissions are granted and no image is selected yet)
  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        onCameraReady={() => setCameraReady(true)}
      >
        {/* Circle outline on top */}
        <View style={styles.circleOutline} />
        
        {/* Guidance text - Moved below the circle */}
        <View style={styles.guidanceTextContainer}>
          <Text style={styles.guidanceText}>Position food in circle</Text>
        </View>

        {/* Top Controls (Cancel ONLY) */}
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.iconButton} onPress={handleCancel}>
             <Ionicons name="close" size={30} color="#ffffff" />
          </TouchableOpacity>
          {/* Removed Flip Camera Button */}
        </View>

        {/* Bottom Controls (Gallery/Capture/Manual Entry) */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
             <Ionicons name="images-outline" size={30} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={takePicture}
            disabled={!cameraReady || analyzing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={navigateToManualEntry}>
             <Ionicons name="create-outline" size={30} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    position: 'relative',
  },
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  orText: {
    fontSize: 16,
    color: '#999',
    marginVertical: 10,
  },
  cameraControls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
    paddingBottom: 40,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  galleryPickerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    width: 200,
    height: 200,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
  },
  galleryText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 20,
    padding: 15,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  controls: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  button: {
    marginBottom: 10,
  },
  analyzeText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  analyzeSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    maxWidth: 300,
  },
  processingText: {
    fontSize: 16,
    marginBottom: 10,
  },
  loader: {
    marginVertical: 20,
  },
  
  // --- Keep essential styles --- 
  circleOutline: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: guideCircleDiameter,
    height: guideCircleDiameter,
    borderRadius: guideCircleRadius,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginTop: -guideCircleRadius,
    marginLeft: -guideCircleRadius,
    backgroundColor: 'transparent',
    zIndex: 3, // Keep on top
  },
  guidanceTextContainer: {
    position: 'absolute',
    // Position text BELOW the circle outline, but closer
    top: (screenHeight / 2) - guideCircleRadius - 110, // Changed offset from 20 to 10
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  guidanceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20, // Adjust for status bar
    left: 15,
    right: 15,
    flexDirection: 'row',
    // Align close button to the start (left)
    justifyContent: 'flex-start', 
    alignItems: 'center',
    zIndex: 10, // Ensure they are above overlays
  },
  bottomControls: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20, // Adjust for safe area / nav bar
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10, // Ensure they are above overlays
  },
  iconButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
  },
}); 