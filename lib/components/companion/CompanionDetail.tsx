import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Card } from '../ui';
import { Companion } from '../../../types';
import { BlurView } from 'expo-blur';

const happyMonkImage = require('../../../assets/images/buddy/happy-monk.png');
const sadMonkImage = require('../../../assets/images/buddy/sad-monk.png');
const sleepyMonkImage = require('../../../assets/images/buddy/sleepy-monk.png');
const monkBgImage = require('../../../assets/images/buddy/monk-bg-min2.png');

// const monkBgBlurhash = 'L5Cjsjoy03n57y%I{xI;DAR+UB,t';

interface CompanionDetailProps {
  companion: Companion;
}

export const CompanionDetail: React.FC<CompanionDetailProps> = ({ companion }) => {
  // Function to determine companion mood based on health and happiness
  const getCompanionMood = () => {
    // Low energy takes precedence
    if (companion.energy < 25) return 'Sleepy';

    const averageScore = (companion.health + companion.happiness) / 2;
    
    if (averageScore >= 75) return 'Happy';
    if (averageScore >= 50) return 'Content';
    if (averageScore >= 25) return 'Hungry';
    return 'Sad';
  };
  
  const getMoodImageSource = () => {
    const mood = getCompanionMood();
    
    switch (mood) {
      case 'Happy':
      case 'Content':
        return happyMonkImage;
      case 'Hungry':
      case 'Sad':
        return sadMonkImage;
      case 'Sleepy':
        return sleepyMonkImage;
      default:
        return happyMonkImage;
    }
  };

  // Function to get gradient colors based on companion health
  const getGradientColors = (): [string, string] => {
    const health = companion.health;
    
    if (health >= 75) return ['#43cea2', '#185a9d']; // Healthy gradient
    if (health >= 50) return ['#ffb347', '#ffcc33']; // Moderate gradient
    if (health >= 25) return ['#ff9966', '#ff5e62']; // Warning gradient
    return ['#cb2d3e', '#ef473a']; // Danger gradient
  };

  // Function to get advice based on companion status
  const getCompanionAdvice = () => {
    const health = companion.health;
    const happiness = companion.happiness;
    const energy = companion.energy;
    
    // Advice could be updated to specifically mention sleepiness if energy is < 25
    if (energy < 25) {
        return "Your companion is very sleepy and needs energy! Try foods with complex carbohydrates.";
    }
    if (health < 30) {
      return "Your companion needs healthier food! Try eating more protein-rich foods and vegetables.";
    } else if (happiness < 30) {
      return "Your companion seems unhappy. Try to eat a more balanced diet with occasional treats.";
    } else if (health > 70 && happiness > 70 && energy > 70) {
      return "Your companion is thriving! Keep up the great work with your balanced diet.";
    } else {
      return "Your companion is doing okay, but there's room for improvement. Try to maintain a balanced diet.";
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBackgroundContainer}>
        <ExpoImage
          source={monkBgImage}
          style={[StyleSheet.absoluteFill, styles.headerBackgroundImage]}
          contentFit="cover"
          transition={100}
        />
        <BlurView intensity={15} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.headerContent}>
          <View style={styles.emojiContainer}>
            <ExpoImage 
              source={getMoodImageSource()} 
              style={styles.moodImageDetail} 
              contentFit="contain"
            />
          </View>
          <Text style={styles.name}>{companion.name}</Text>
          <Text style={styles.mood}>{getCompanionMood()}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Health Status</Text>
          
          <View style={styles.stats}>
            <StatCard 
              label="Health" 
              value={companion.health} 
              icon="❤️"
              color="#2ecc71" 
            />
            <StatCard 
              label="Happiness" 
              value={companion.happiness} 
              icon="😊"
              color="#3498db" 
            />
            <StatCard 
              label="Energy" 
              value={companion.energy} 
              icon="⚡"
              color="#f39c12" 
            />
          </View>
        </Card>
        
        <Card style={styles.adviceCard}>
          <Text style={styles.sectionTitle}>Companion's Advice</Text>
          <Text style={styles.adviceText}>
            {getCompanionAdvice()}
          </Text>
        </Card>
        
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>About Your Companion</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {new Date(companion.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Fed</Text>
            <Text style={styles.infoValue}>
              {new Date(companion.last_updated).toLocaleDateString()}
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

// Stat card component for companion stats
interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  // Ensure value is clamped between 0 and 100 for display
  const displayValue = Math.max(0, Math.min(value, 100));

  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarContainer}>
        <View 
          style={[
            styles.statBar, 
            { width: `${displayValue}%`, backgroundColor: color }
          ]} 
        />
      </View>
      <Text style={styles.statValue}>{displayValue}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  headerBackgroundContainer: {
    minHeight: 280,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerBackgroundImage: {
  },
  headerContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
    backgroundColor: 'transparent',
    width: '100%',
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  moodImageDetail: {
    width: '102%',
    height: '102%',
  },
  emoji: {
    fontSize: 60,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mood: {
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    padding: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  adviceCard: {
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 100,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statBarContainer: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 4,
  },
  statBar: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  adviceText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
}); 