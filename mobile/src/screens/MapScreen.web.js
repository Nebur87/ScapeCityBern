// MapScreen.web.js - Versión web
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { bernRoute } from '../data/routes';
import { DEV_MODE } from '../services/api';

export default function MapScreen({ navigation }) {
  const [region, setRegion] = useState({
    latitude: 46.9481,
    longitude: 7.4474,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [selectedStop, setSelectedStop] = useState(null);
  const [showStopsList, setShowStopsList] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  const onStopPress = (stop, index) => {
    // En modo desarrollo, todos los puzzles están desbloqueados
    if (DEV_MODE || index <= currentProgress) {
      navigation.navigate('StopDetail', { stop, index });
    } else {
      alert('Debes completar los puzzles anteriores para desbloquear este.');
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
          <Text style={styles.coordinates}>
            📍 {item.coordinates.lat.toFixed(4)}, {item.coordinates.lng.toFixed(4)}
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
      {/* Indicador de modo desarrollo */}
      {DEV_MODE && (
        <View style={styles.devModeIndicator}>
          <Ionicons name="bug" size={16} color="#FF6B6B" />
          <Text style={styles.devModeText}>MODO PRUEBA - Puzzles desbloqueados</Text>
        </View>
      )}

      <View style={styles.webMapContainer}>
        <Text style={styles.webMapTitle}>🗺️ Mapa de Bern - Escape Room</Text>
        <Text style={styles.webMapSubtitle}>
          Ubicación: {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
        </Text>
        
        <View style={styles.webMapContent}>
          <Text style={styles.webMapInfo}>
            📍 {bernRoute.stops.length} ubicaciones disponibles en Bern
          </Text>
          <Text style={styles.webMapNote}>
            💡 Usa la aplicación móvil con Expo Go para ver el mapa interactivo completo
          </Text>
          
          <TouchableOpacity
            style={styles.showListButton}
            onPress={() => setShowStopsList(!showStopsList)}
          >
            <Ionicons name="list" size={20} color="white" />
            <Text style={styles.showListButtonText}>
              {showStopsList ? 'Ocultar Lista' : 'Ver Lista de Paradas'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  webMapContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  webMapTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B5A2B',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  webMapSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  webMapContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  webMapInfo: {
    fontSize: 20,
    color: '#8B5A2B',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  webMapNote: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 40,
    lineHeight: 24,
  },
  showListButton: {
    backgroundColor: '#8B5A2B',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  showListButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    backgroundColor: '#F5F5DC',
  },
  stopsListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5A2B',
  },
  closeButton: {
    padding: 5,
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
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  completedStopItem: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  stopNumber: {
    width: 35,
    height: 35,
    borderRadius: 17,
    backgroundColor: '#8B5A2B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stopDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
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
  devModeIndicator: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FF6B6B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    margin: 20,
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