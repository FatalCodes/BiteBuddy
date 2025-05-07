import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../lib/components/ui';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FoodSpecifications {
  title?: string;
  description?: string;
  servingSize?: string;
  additionalContext?: string;
}

// Type for analysis confidence
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

export default function AddFoodDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri: string; confidence?: string }>();
  const { imageUri } = params;
  
  // Parse confidence data if it exists
  const analysisConfidence: AnalysisConfidence | null = params.confidence ? JSON.parse(params.confidence) : null;
  const needsMoreContext = analysisConfidence?.needsMoreContext ?? false;

  const [specifications, setSpecifications] = useState<FoodSpecifications>({});

  useEffect(() => {
    if (!imageUri) {
      console.error("AddFoodDetailsScreen requires an imageUri param.");
      if(router.canGoBack()) router.back();
    }
  }, [imageUri, router]);

  const handleSpecificationsSubmit = () => {
    if (!imageUri) return;

    if (router.canGoBack()) {
      router.replace({ 
        pathname: '/food/camera' as any,
        params: { 
          imageUri, 
          specifications: JSON.stringify(specifications),
          timestamp: Date.now().toString(), 
        },
      });
    } else {
      console.warn("Cannot go back from add-details screen.");

      router.replace('/food/camera' as any);
    }
  };

  // Determine the message to show in the confidence box
  let confidenceDisplayMessage = "Please provide some details to help us analyze your meal."; // Default message
  if (analysisConfidence && needsMoreContext) {
    if (analysisConfidence.missingInfo && analysisConfidence.missingInfo.includes('AI analysis failed or was refused. Please provide details.')) {
      confidenceDisplayMessage = "We had trouble identifying your food. Please provide additional information below.";
    } else if (analysisConfidence.missingInfo && analysisConfidence.missingInfo.length > 0) {
      // If there's other specific info, you could still use it, or stick to generic
      // For now, let's use a generic one if it's not the refusal/failure case.
      confidenceDisplayMessage = "The AI needs a bit more help. Please add any relevant details.";
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>
            {needsMoreContext ? 'Additional Information Needed' : 'Add Food Details'}
          </Text>

          {needsMoreContext && analysisConfidence && (
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceText}>
                Overall Confidence: {Math.round(analysisConfidence.overall * 100)}%
              </Text>
              <Text style={styles.missingInfoText}>
                {confidenceDisplayMessage}
              </Text>
            </View>
          )}

          <View style={styles.form}>
            <Text style={styles.label}>Food Title (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Chicken Salad"
              value={specifications.title}
              onChangeText={(text) => setSpecifications(prev => ({ ...prev, title: text }))}
            />
            
            <Text style={styles.label}>Serving Size (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 1 cup, 200g"
              value={specifications.servingSize}
              onChangeText={(text) => setSpecifications(prev => ({ ...prev, servingSize: text }))}
            />
            
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="e.g., Grilled chicken with mixed vegetables"
              value={specifications.description}
              onChangeText={(text) => setSpecifications(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />
            
            <Text style={styles.label}>Additional Context (Optional)</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="e.g., homemade, restaurant name, specific ingredients"
              value={specifications.additionalContext}
              onChangeText={(text) => setSpecifications(prev => ({ ...prev, additionalContext: text }))}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.buttons}>
            <Button
              title="Cancel"
              onPress={() => {
                if(router.canGoBack()) router.back();
              }}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Reanalyze"
              onPress={handleSpecificationsSubmit}
              style={styles.button}
              disabled={!imageUri}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  confidenceContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#856404',
  },
  missingInfoText: {
    fontSize: 14,
    color: '#856404',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
}); 