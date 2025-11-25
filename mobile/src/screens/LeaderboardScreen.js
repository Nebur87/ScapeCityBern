import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LeaderboardScreen() {
  const [selectedTab, setSelectedTab] = useState('global');
  
  const leaderboardData = {
    global: [
      { id: 1, name: 'Ana García', points: 1220, completed: true, time: '2h 15m' },
      { id: 2, name: 'Carlos López', points: 1180, completed: true, time: '2h 30m' },
      { id: 3, name: 'María Silva', points: 1150, completed: true, time: '2h 45m' },
      { id: 4, name: 'Tú', points: 450, completed: false, time: '45m' },
      { id: 5, name: 'Pedro Ruiz', points: 380, completed: false, time: '1h 10m' },
      { id: 6, name: 'Laura Martín', points: 290, completed: false, time: '35m' },
    ],
    weekly: [
      { id: 1, name: 'Tú', points: 450, completed: false, time: '45m' },
      { id: 2, name: 'Pedro Ruiz', points: 380, completed: false, time: '1h 10m' },
      { id: 3, name: 'Laura Martín', points: 290, completed: false, time: '35m' },
    ]
  };

  const getRankIcon = (position) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}`;
    }
  };

  const renderLeaderboardItem = ({ item, index }) => {
    const isCurrentUser = item.name === 'Tú';
    const position = index + 1;
    
    return (
      <View style={[
        styles.leaderboardItem,
        isCurrentUser && styles.currentUserItem
      ]}>
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{getRankIcon(position)}</Text>
        </View>
        
        <View style={styles.playerInfo}>
          <Text style={[
            styles.playerName,
            isCurrentUser && styles.currentUserName
          ]}>
            {item.name}
          </Text>
          <View style={styles.playerStats}>
            <Text style={styles.playerTime}>{item.time}</Text>
            {item.completed && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.completedText}>Completado</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.pointsContainer}>
          <Text style={[
            styles.points,
            isCurrentUser && styles.currentUserPoints
          ]}>
            {item.points}
          </Text>
          <Text style={styles.pointsLabel}>puntos</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#8B5A2B', '#D2B48C']}
        style={styles.header}
      >
        <Text style={styles.title}>Ranking</Text>
        <Text style={styles.subtitle}>El Secreto de la Ciudad de los Osos</Text>
      </LinearGradient>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'global' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('global')}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'global' && styles.activeTabText
          ]}>
            Global
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'weekly' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('weekly')}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'weekly' && styles.activeTabText
          ]}>
            Esta Semana
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={leaderboardData[selectedTab]}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.leaderboardContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#8B5A2B',
  },
  tabText: {
    fontSize: 16,
    color: '#8B5A2B',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: 'white',
  },
  leaderboardContainer: {
    padding: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  currentUserItem: {
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  currentUserName: {
    color: '#8B5A2B',
  },
  playerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  playerTime: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  pointsContainer: {
    alignItems: 'center',
  },
  points: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5A2B',
  },
  currentUserPoints: {
    color: '#FFD700',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#666',
  },
});