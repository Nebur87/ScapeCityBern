import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [userProgress, setUserProgress] = useState({
    stopsCompleted: 0,
    totalStops: 10,
    currentRoute: 'bern-classic'
  });

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos de ubicación',
          'Esta aplicación necesita acceso a tu ubicación para funcionar correctamente.'
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
    }
  };

  const startRoute = () => {
    navigation.navigate('RouteDetail', { routeId: 'bern-classic' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header con gradiente */}
        <LinearGradient
          colors={['#8B5A2B', '#D2B48C']}
          style={styles.header}
        >
          <Text style={styles.title}>El Secreto de la Ciudad de los Osos</Text>
          <Text style={styles.subtitle}>
            Descubre el misterioso Manuscrito del Aare
          </Text>
          
          {/* Imagen del oso de Berna */}
          <View style={styles.bearContainer}>
            <Ionicons name="paw" size={60} color="white" />
          </View>
        </LinearGradient>

        {/* Progreso */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Tu Progreso</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(userProgress.stopsCompleted / userProgress.totalStops) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {userProgress.stopsCompleted} de {userProgress.totalStops} paradas completadas
          </Text>
        </View>

        {/* Botón principal */}
        <TouchableOpacity style={styles.startButton} onPress={startRoute}>
          <LinearGradient
            colors={['#8B5A2B', '#A0522D']}
            style={styles.buttonGradient}
          >
            <Ionicons name="play-circle" size={24} color="white" />
            <Text style={styles.startButtonText}>
              {userProgress.stopsCompleted === 0 ? 'Comenzar Aventura' : 'Continuar'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Información de la ruta */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Ruta: Bern Classic</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#8B5A2B" />
            <Text style={styles.infoText}>10 ubicaciones históricas</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color="#8B5A2B" />
            <Text style={styles.infoText}>2-3 horas de duración</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="walk" size={20} color="#8B5A2B" />
            <Text style={styles.infoText}>~3 km de recorrido</Text>
          </View>
        </View>

        {/* Ubicaciones destacadas */}
        <View style={styles.highlightsCard}>
          <Text style={styles.highlightsTitle}>Lugares que visitarás</Text>
          <View style={styles.locationsList}>
            <Text style={styles.locationItem}>🕐 Zytglogge - Torre del Reloj</Text>
            <Text style={styles.locationItem}>⛪ Catedral de Berna</Text>
            <Text style={styles.locationItem}>🏛️ Bundeshaus - Parlamento</Text>
            <Text style={styles.locationItem}>🐻 Bärengraben - Foso de los Osos</Text>
            <Text style={styles.locationItem}>🌹 Rosengarten</Text>
          </View>
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
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  bearContainer: {
    marginTop: 20,
  },
  progressCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5A2B',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  startButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  highlightsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  highlightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  locationsList: {
    gap: 8,
  },
  locationItem: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});