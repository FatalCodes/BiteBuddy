import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card } from '../ui';
import { Companion } from '../../../types';

interface CompanionCardProps {
  companion: Companion;
  onPress?: () => void;
  compact?: boolean;
}

export const CompanionCard: React.FC<CompanionCardProps> = ({ 
  companion, 
  onPress,
  compact = false
}) => {
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

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Text style={styles.emoji}>{getMoodEmoji()}</Text>
          </View>
          
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.name}>{companion.name}</Text>
              <Text style={styles.mood}>{getCompanionMood()}</Text>
            </View>
            
            {!compact && (
              <View style={styles.stats}>
                <StatBar 
                  label="Health" 
                  value={companion.health} 
                  color="#2ecc71" 
                />
                <StatBar 
                  label="Happiness" 
                  value={companion.happiness} 
                  color="#3498db" 
                />
                <StatBar 
                  label="Energy" 
                  value={companion.energy} 
                  color="#f39c12" 
                />
              </View>
            )}
            
            {compact && (
              <View style={styles.compactStats}>
                <Text style={styles.compactStat}>❤️ {companion.health}%</Text>
                <Text style={styles.compactStat}>😊 {companion.happiness}%</Text>
                <Text style={styles.compactStat}>⚡ {companion.energy}%</Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

// Stat bar component for companion stats
interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, color }) => {
  return (
    <View style={styles.statContainer}>
      <View style={styles.statHeader}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}%</Text>
      </View>
      <View style={styles.statBarContainer}>
        <View 
          style={[
            styles.statBar, 
            { width: `${value}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  container: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 40,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mood: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  stats: {
    marginTop: 4,
  },
  statContainer: {
    marginBottom: 8,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statBarContainer: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBar: {
    height: '100%',
    borderRadius: 3,
  },
  compactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  compactStat: {
    fontSize: 12,
    color: '#666',
  },
}); 