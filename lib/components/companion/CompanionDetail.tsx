import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../ui';
import { Companion } from '../../../types';
import { LinearGradient } from 'expo-linear-gradient';

interface CompanionDetailProps {
  companion: Companion;
}

export const CompanionDetail: React.FC<CompanionDetailProps> = ({ companion }) => {
  // Function to determine companion mood based on health and happiness
  const getCompanionMood = () => {
    const averageScore = (companion.health + companion.happiness) / 2;
    
    if (averageScore >= 75) return 'Happy';
    if (averageScore >= 50) return 'Content';
    if (averageScore >= 25) return 'Hungry';
    return 'Sad';
  };
  
  // Function to determine emoji based on mood
  const getMoodEmoji = () => {
    const mood = getCompanionMood();
    
    switch (mood) {
      case 'Happy': return '😄';
      case 'Content': return '🙂';
      case 'Hungry': return '😐';
      case 'Sad': return '😢';
      default: return '🙂';
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
    
    if (health < 30) {
      return "Your companion needs healthier food! Try eating more protein-rich foods and vegetables.";
    } else if (happiness < 30) {
      return "Your companion seems unhappy. Try to eat a more balanced diet with occasional treats.";
    } else if (energy < 30) {
      return "Your companion is low on energy. Consider foods with complex carbohydrates for sustained energy.";
    } else if (health > 70 && happiness > 70 && energy > 70) {
      return "Your companion is thriving! Keep up the great work with your balanced diet.";
    } else {
      return "Your companion is doing okay, but there's room for improvement. Try to maintain a balanced diet.";
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradientHeader}
      >
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{getMoodEmoji()}</Text>
        </View>
        <Text style={styles.name}>{companion.name}</Text>
        <Text style={styles.mood}>{getCompanionMood()}</Text>
      </LinearGradient>
      
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
  gradientHeader: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  emojiContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    fontSize: 60,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  mood: {
    fontSize: 16,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  content: {
    padding: 16,
    marginTop: -20,
  },
  statsCard: {
    marginBottom: 16,
  },
  adviceCard: {
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 16,
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