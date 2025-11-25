// MapScreen.native.js - Versión nativa
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { bernRoute } from '../data/routes';
import { DEV_MODE } from '../services/api';

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 46.9481,
    longitude: 7.4474,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [selectedStop, setSelectedStop] = useState(null);
  const [showStopsList, setShowStopsList] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const mapRef = useRef();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso de ubicación',
          'Se necesita acceso a la ubicación para mostrar tu posición en el mapa.',
          [{ text: 'OK' }]
        );
        return;
      }
      getCurrentLocation();
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(location);
      
      // Centrar el mapa en la ubicación del usuario
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
    }
  };

  const centerOnUserLocation = () => {
    if (location) {
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current?.animateToRegion(newRegion, 1000);
    } else {
      getCurrentLocation();
    }
  };

  const centerOnBern = () => {
    const bernRegion = {
      latitude: 46.9481,
      longitude: 7.4474,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
    mapRef.current?.animateToRegion(bernRegion, 1000);
  };

  const onMarkerPress = (stop, index) => {
    setSelectedStop({ ...stop, index });
    
    // Centrar el mapa en el marcador seleccionado
    const markerRegion = {
      latitude: stop.coordinates.lat,
      longitude: stop.coordinates.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    mapRef.current?.animateToRegion(markerRegion, 1000);
  };

  const onStopPress = (stop, index) => {
    // En modo desarrollo, todos los puzzles están desbloqueados
    if (DEV_MODE || index <= currentProgress) {
      navigation.navigate('StopDetail', { stop, index });
    } else {
      Alert.alert(
        'Puzzle bloqueado',
        'Debes completar los puzzles anteriores para desbloquear este.',
        [{ text: 'OK' }]
      );
    }
  };

  const getMarkerColor = (index) => {
    if (DEV_MODE) {
      return '#4CAF50'; // Verde para modo desarrollo
    }
    
    if (index < currentProgress) {
      return '#4CAF50'; // Verde para completados
    } else if (index === currentProgress) {
      return '#FF9800'; // Naranja para actual
    } else {
      return '#F44336'; // Rojo para bloqueados
    }
  };

  const getStopStatus = (index) => {
    if (DEV_MODE) {
      return 'available';
    }
    
    if (index < currentProgress) {
      return 'completed';
    } else if (index === currentProgress) {
      return 'current';
    } else {
      return 'locked';
    }
  };

  const renderStopItem = ({ item, index }) => {
    const status = getStopStatus(index);
    
    return (
      <TouchableOpacity
        style={[
          styles.stopItem,
          status === 'completed' && styles.completedStopItem,
        ]}
        onPress={() => onStopPress(item, index)}
        disabled={status === 'locked' && !DEV_MODE}
      >
        <View
          style={[
            styles.stopNumber,
            { backgroundColor: getMarkerColor(index) },
          ]}
        >
          <Text style={styles.stopNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.stopInfo}>
          <Text style={styles.stopName}>{item.name}</Text>
          <Text style={styles.stopDescription}>
            {item.puzzle.type} • {item.puzzle.difficulty}
          </Text>
        </View>
        <Ionicons
          name={
            status === 'completed' ? 'checkmark-circle' :
            status === 'current' ? 'play-circle' :
            status === 'locked' ? 'lock-closed' : 'chevron-forward'
          }
          size={24}
          color={
            status === 'completed' ? '#4CAF50' :
            status === 'current' ? '#FF9800' :
            status === 'locked' ? '#999' : '#8B5A2B'
          }
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {bernRoute.stops.map((stop, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: stop.coordinates.lat,
                longitude: stop.coordinates.lng,
              }}
              title={stop.name}
              description={stop.puzzle.type}
              pinColor={getMarkerColor(index)}
              onPress={() => onMarkerPress(stop, index)}
            />
          ))}
        </MapView>

        {/* Indicador de modo desarrollo */}
        {DEV_MODE && (
          <View style={styles.devModeIndicator}>
            <Ionicons name="bug" size={16} color="#FF6B6B" />
            <Text style={styles.devModeText}>MODO PRUEBA - Puzzles desbloqueados</Text>
          </View>
        )}

        {/* Botón de ubicación */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={centerOnUserLocation}
        >
          <Ionicons name="locate" size={24} color="#8B5A2B" />
        </TouchableOpacity>

        {/* Botón de Bern */}
        <TouchableOpacity
          style={styles.bernButton}
          onPress={centerOnBern}
        >
          <Ionicons name="business" size={24} color="#8B5A2B" />
        </TouchableOpacity>

        {/* Botón de lista */}
        <TouchableOpacity
          style={styles.listButton}
          onPress={() => setShowStopsList(!showStopsList)}
        >
          <Ionicons name="list" size={24} color="#8B5A2B" />
        </TouchableOpacity>

        {/* Panel de información del stop seleccionado */}
        {selectedStop && (
          <View style={styles.stopInfoPanel}>
            <View style={styles.stopInfoHeader}>
              <Text style={styles.stopInfoTitle}>{selectedStop.name}</Text>
              <TouchableOpacity
                onPress={() => setSelectedStop(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.stopInfoDescription}>
              {selectedStop.description}
            </Text>
            <View style={styles.puzzleInfo}>
              <Text style={styles.puzzleType}>{selectedStop.puzzle.type}</Text>
              <Text style={styles.puzzleDifficulty}>
                Dificultad: {selectedStop.puzzle.difficulty}
              </Text>
              <Text style={styles.puzzleDuration}>
                Duración: ~{selectedStop.puzzle.estimatedTime} min
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.startButton,
                (selectedStop.index > currentProgress && !DEV_MODE) && styles.disabledButton
              ]}
              onPress={() => onStopPress(selectedStop, selectedStop.index)}
              disabled={selectedStop.index > currentProgress && !DEV_MODE}
            >
              <Text style={styles.startButtonText}>
                {selectedStop.index > currentProgress && !DEV_MODE
                  ? 'Bloqueado'
                  : selectedStop.index < currentProgress
                  ? 'Completado'
                  : 'Iniciar Puzzle'
                }
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de paradas */}
        {showStopsList && (
          <View style={styles.stopsListContainer}>
            <View style={styles.stopsListHeader}>
              <Text style={styles.stopsListTitle}>Paradas del Recorrido</Text>
              <TouchableOpacity
                onPress={() => setShowStopsList(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={bernRoute.stops}
              renderItem={renderStopItem}
              keyExtractor={(item, index) => index.toString()}
              style={styles.stopsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  locationButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bernButton: {
    position: 'absolute',
    bottom: 180,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  listButton: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  stopInfoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  stopInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stopInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5A2B',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  stopInfoDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    lineHeight: 22,
  },
  puzzleInfo: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  puzzleType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5A2B',
    marginBottom: 5,
  },
  puzzleDifficulty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  puzzleDuration: {
    fontSize: 14,
    color: '#666',
  },
  startButton: {
    backgroundColor: '#8B5A2B',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopsListContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
  stopsListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  stopsListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5A2B',
  },
  stopsList: {
    flex: 1,
    padding: 20,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    marginBottom: 10,
  },
  completedStopItem: {
    backgroundColor: '#E8F5E8',
  },
  stopNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8B5A2B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stopNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  stopDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  devModeIndicator: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: '#FFF5F5',
    borderColor: '#FF6B6B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  devModeText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
});