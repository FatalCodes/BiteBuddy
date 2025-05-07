import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Linking,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity 
        style={styles.faqQuestion}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.questionText}>{question}</Text>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={22} 
          color="#666" 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

export default function HelpScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const contactSupport = () => {
    Linking.openURL('mailto:support@bitebuddy.example.com?subject=Support%20Request')
      .catch(() => Alert.alert('Cannot open email client'));
  };
  
  const openUserGuide = () => {
    Alert.alert('User Guide', 'This would open the BiteBuddy user guide or documentation.');
  };
  
  const submitSupportRequest = () => {
    Alert.alert(
      'Support Request Submitted',
      'Thank you for your message. Our support team will respond within 24 hours.',
      [{ text: 'OK', onPress: () => setSearchQuery('') }]
    );
  };


  const faqs = [
    {
      question: 'How do I log a meal?',
      answer: 'You can log a meal by tapping the "+" button in the Food Log tab, then choosing manual entry or using the camera for food recognition. Fill in the details and tap "Log Food".'
    },
    {
      question: 'How accurate is the calorie counting?',
      answer: 'BiteBuddy uses a comprehensive food database for accurate nutrition information. When using image recognition, estimates are based on computer vision models and may require manual adjustment for precise tracking.'
    },
    {
      question: 'What is the Companion feature?',
      answer: 'The Companion is your virtual pet that grows and reacts to your nutrition habits. Maintaining balanced meals and consistent logging helps your companion thrive and gain new abilities.'
    },
    {
      question: 'Can I export my nutrition data?',
      answer: 'Yes! You can export your data from the Profile tab. Go to Profile > Data Management > Export Data. This creates a file with all your food logs and nutrition history.'
    },
    {
      question: 'How do I reset my companion?',
      answer: 'If you want to start fresh with your companion, go to Profile > Data Management > Reset Companion. Note that this will reset your companion\'s progress, but your food logs will remain intact.'
    }
  ];
  

  const filteredFaqs = searchQuery
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search help topics..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
        
        {/* Quick Help Buttons */}
        <View style={styles.quickHelpContainer}>
          <TouchableOpacity style={styles.quickHelpButton} onPress={openUserGuide}>
            <Ionicons name="book-outline" size={24} color="#3498db" />
            <Text style={styles.quickHelpText}>User Guide</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickHelpButton} onPress={contactSupport}>
            <Ionicons name="mail-outline" size={24} color="#3498db" />
            <Text style={styles.quickHelpText}>Email Support</Text>
          </TouchableOpacity>
        </View>
        
        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <FAQItem 
                key={index} 
                question={faq.question} 
                answer={faq.answer} 
              />
            ))
          ) : (
            <Text style={styles.noResultsText}>
              No results found for "{searchQuery}"
            </Text>
          )}
        </View>
        
        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Describe your issue or question..."
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          
          <TouchableOpacity style={styles.submitButton} onPress={submitSupportRequest}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.troubleshootingSection}>
          <Text style={styles.sectionTitle}>Common Troubleshooting</Text>
          
          <View style={styles.troubleshootingItem}>
            <Ionicons name="refresh-circle-outline" size={24} color="#e74c3c" style={styles.troubleshootingIcon} />
            <View>
              <Text style={styles.troubleshootingTitle}>App Crashing</Text>
              <Text style={styles.troubleshootingText}>
                Try restarting the app or your device. If the issue persists, check for app updates or reinstall the application.
              </Text>
            </View>
          </View>
          
          <View style={styles.troubleshootingItem}>
            <Ionicons name="cloud-offline-outline" size={24} color="#e74c3c" style={styles.troubleshootingIcon} />
            <View>
              <Text style={styles.troubleshootingTitle}>Sync Issues</Text>
              <Text style={styles.troubleshootingText}>
                Check your internet connection and try syncing again. You can manually export and import your data if automatic sync fails.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  quickHelpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  quickHelpButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickHelpText: {
    marginTop: 8,
    color: '#333',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  answerText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  messageInput: {
    height: 120,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  troubleshootingSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  troubleshootingItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  troubleshootingIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  troubleshootingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  troubleshootingText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
  },
}); 