import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { calculateDistance } from '../utils/geolocation';
import { DEV_MODE } from '../services/api';

export default function StopDetailScreen({ route, navigation }) {
  const { stop, routeId } = route.params;
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    getCurrentLocation();
    const interval = setInterval(getCurrentLocation, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (DEV_MODE) {
      // En modo desarrollo, siempre permitir acceso
      setDistance(0);
      setIsWithinRange(true);
      setIsLoading(false);
    } else if (userLocation && stop) {
      const dist = calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        stop.coordinates.lat,
        stop.coordinates.lng
      );
      setDistance(dist);
      setIsWithinRange(dist <= stop.radius);
    }
  }, [userLocation, stop]);

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation(location);
      setIsLoading(false);
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      setIsLoading(false);
    }
  };

  const startPuzzle = () => {
    if (!isWithinRange) {
      Alert.alert(
        'Fuera de rango',
        `Debes estar a menos de ${stop.radius}m de ${stop.name} para comenzar el puzzle.`
      );
      return;
    }

    navigation.navigate('Puzzle', {
      stop,
      routeId,
      puzzleType: stop.puzzle.type
    });
  };

  const getDistanceColor = () => {
    if (distance === null) return '#999';
    if (distance <= stop.radius) return '#4CAF50';
    if (distance <= stop.radius * 2) return '#FF9800';
    return '#F44336';
  };

  const getDistanceIcon = () => {
    if (isWithinRange) return 'checkmark-circle';
    return 'location';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#8B5A2B" />
        <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header con gradiente */}
        <LinearGradient
          colors={['#8B5A2B', '#D2B48C']}
          style={styles.header}
        >
          <Text style={styles.stopTitle}>{stop.name}</Text>
          <Text style={styles.stopSubtitle}>{stop.puzzle.type}</Text>
        </LinearGradient>

        {/* Estado de ubicación */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Ionicons 
              name={getDistanceIcon()} 
              size={24} 
              color={getDistanceColor()} 
            />
            <Text style={styles.locationTitle}>Tu ubicación</Text>
          </View>
          
          {distance !== null && (
            <View style={styles.distanceInfo}>
              <Text style={[styles.distanceText, { color: getDistanceColor() }]}>
                {distance < 1000 
                  ? `${Math.round(distance)}m de distancia`
                  : `${(distance / 1000).toFixed(1)}km de distancia`
                }
              </Text>
              
              {isWithinRange ? (
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark" size={16} color="white" />
                  <Text style={styles.statusText}>En rango</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, styles.outOfRangeBadge]}>
                  <Ionicons name="walk" size={16} color="white" />
                  <Text style={styles.statusText}>Acércate más</Text>
                </View>
              )}
            </View>
          )}

          <Text style={styles.rangeText}>
            Rango requerido: {stop.radius}m
          </Text>
        </View>

        {/* Información del puzzle */}
        <View style={styles.puzzleCard}>
          <Text style={styles.puzzleTitle}>Puzzle: {stop.puzzle.type}</Text>
          <Text style={styles.puzzleDescription}>
            {stop.puzzle.hint}
          </Text>
          
          {stop.puzzle.instructions && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Instrucciones:</Text>
              <Text style={styles.instructionsText}>
                {stop.puzzle.instructions}
              </Text>
            </View>
          )}
        </View>

        {/* Información histórica */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Sobre este lugar</Text>
          <Text style={styles.infoDescription}>
            {stop.description || 'Un lugar histórico importante en el centro de Berna con siglos de historia por descubrir.'}
          </Text>
        </View>

        {/* Botón de acción */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            !isWithinRange && styles.disabledButton
          ]}
          onPress={startPuzzle}
          disabled={!isWithinRange}
        >
          <LinearGradient
            colors={isWithinRange ? ['#8B5A2B', '#A0522D'] : ['#999', '#666']}
            style={styles.buttonGradient}
          >
            <Ionicons 
              name={isCompleted ? "trophy" : "puzzle"} 
              size={24} 
              color="white" 
            />
            <Text style={styles.actionButtonText}>
              {isCompleted ? 'Completado' : 'Comenzar Puzzle'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Ayuda */}
        {!isWithinRange && (
          <View style={styles.helpCard}>
            <Ionicons name="information-circle" size={24} color="#FF9800" />
            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>¿Cómo llegar?</Text>
              <Text style={styles.helpDescription}>
                Camina hacia {stop.name}. Cuando estés cerca, el puzzle se desbloqueará automáticamente.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  stopTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  stopSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
  },
  locationCard: {
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
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  distanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  outOfRangeBadge: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  rangeText: {
    fontSize: 14,
    color: '#666',
  },
  puzzleCard: {
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
  puzzleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  puzzleDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 15,
  },
  instructionsContainer: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
    color: '#333',
    marginBottom: 10,
  },
  infoDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  actionButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  helpText: {
    flex: 1,
    marginLeft: 12,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});