import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
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
  const [userProgress, setUserProgress] = useState({
    completedStops: [],
    currentStop: 0
  });
  const mapRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos necesarios', 'Se necesita acceso a la ubicación');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation);
      setRegion({
        ...region,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
    }
  };

  const centerOnUserLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const centerOnStop = (stop) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: stop.coordinates.lat,
        longitude: stop.coordinates.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  const getMarkerColor = (stopIndex) => {
    if (userProgress.completedStops.includes(stopIndex)) {
      return '#4CAF50'; // Verde para completadas
    } else if (stopIndex === userProgress.currentStop) {
      return '#FF9800'; // Naranja para actual
    } else if (stopIndex < userProgress.currentStop) {
      return '#F44336'; // Rojo para perdidas
    } else {
      return '#9E9E9E'; // Gris para futuras
    }
  };

  const onMarkerPress = (stop, index) => {
    setSelectedStop({ ...stop, index });
  };

  const navigateToStop = () => {
    if (selectedStop) {
      navigation.navigate('StopDetail', { 
        stop: selectedStop, 
        routeId: 'bern-classic' 
      });
    }
  };

  const renderStopItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.stopListItem,
        userProgress.completedStops.includes(index) && styles.completedStopItem
      ]}
      onPress={() => {
        centerOnStop(item);
        setSelectedStop({ ...item, index });
      }}
    >
      <View style={styles.stopNumber}>
        <Text style={styles.stopNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.stopInfo}>
        <Text style={styles.stopName}>{item.name}</Text>
        <Text style={styles.stopDescription}>{item.puzzle.type}</Text>
      </View>
      <Ionicons 
        name={userProgress.completedStops.includes(index) ? 'checkmark-circle' : 'location'} 
        size={24} 
        color={getMarkerColor(index)} 
      />
    </TouchableOpacity>
  );

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

        {/* Panel de información de parada seleccionada */}
        {selectedStop && (
          <View style={styles.stopPanel}>
            <View style={styles.stopPanelHeader}>
              <Text style={styles.stopPanelTitle}>
                {selectedStop.index + 1}. {selectedStop.name}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedStop(null)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.stopPanelDescription}>
              {selectedStop.puzzle.hint}
            </Text>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={navigateToStop}
            >
              <Text style={styles.navigateButtonText}>Ir a esta parada</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Lista de paradas */}
      <View style={styles.stopsListContainer}>
        <Text style={styles.stopsListTitle}>Paradas de la Ruta</Text>
        <FlatList
          data={bernRoute.stops}
          renderItem={renderStopItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stopsList}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    top: 50,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  stopPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  stopPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stopPanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  stopPanelDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  navigateButton: {
    backgroundColor: '#8B5A2B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  navigateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopsListContainer: {
    backgroundColor: 'white',
    paddingTop: 15,
    paddingBottom: 10,
  },
  stopsListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  stopsList: {
    paddingHorizontal: 15,
  },
  stopListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    width: 200,
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