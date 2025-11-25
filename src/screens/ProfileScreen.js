import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation();
  
  const userStats = {
    name: 'Explorador',
    level: 'Novato',
    totalPoints: 450,
    routesCompleted: 0,
    stopsVisited: 3,
    sealsCollected: 3,
    achievements: [
      { name: 'Primer Paso', description: 'Completaste tu primera parada', icon: 'footsteps' },
      { name: 'Explorador', description: 'Visitaste 3 ubicaciones', icon: 'compass' },
      { name: 'Coleccionista', description: 'Obtuviste tu primer sello', icon: 'trophy' }
    ]
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#8B5A2B', '#D2B48C']}
          style={styles.header}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text style={styles.userName}>{userStats.name}</Text>
          <Text style={styles.userLevel}>{userStats.level}</Text>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="star" size={30} color="#FFD700" />
            <Text style={styles.statNumber}>{userStats.totalPoints}</Text>
            <Text style={styles.statLabel}>Puntos</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="location" size={30} color="#8B5A2B" />
            <Text style={styles.statNumber}>{userStats.stopsVisited}</Text>
            <Text style={styles.statLabel}>Paradas</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="ribbon" size={30} color="#4CAF50" />
            <Text style={styles.statNumber}>{userStats.sealsCollected}</Text>
            <Text style={styles.statLabel}>Sellos</Text>
          </View>
        </View>

        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Logros Desbloqueados</Text>
          {userStats.achievements.map((achievement, index) => (
            <View key={index} style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Ionicons name={achievement.icon} size={24} color="#8B5A2B" />
              </View>
              <View style={styles.achievementText}>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
          ))}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings" size={24} color="#8B5A2B" />
            <Text style={styles.actionText}>Configuración</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle" size={24} color="#8B5A2B" />
            <Text style={styles.actionText}>Ayuda</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="information-circle" size={24} color="#8B5A2B" />
            <Text style={styles.actionText}>Acerca de</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={24} color="#FF4444" />
            <Text style={[styles.actionText, styles.logoutText]}>Cerrar Sesión</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userLevel: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  achievementsContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  achievementText: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actionsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    borderBottomWidth: 0,
    backgroundColor: '#FFF5F5',
  },
  logoutText: {
    color: '#FF4444',
    fontWeight: '600',
  },
});