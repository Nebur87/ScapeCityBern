import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useGameStore } from './src/stores/gameStore';

const Tab = createBottomTabNavigator();

// Pantalla de inicio con store interactivo
function HomeScreen() {
  const { score, playerName, setPlayerName, addScore } = useGameStore();
  
  const handleSetName = () => {
    setPlayerName(playerName ? 'Anónimo' : 'Explorador');
  };
  
  const handleAddPoints = () => {
    addScore(10);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ ScapeCityBern</Text>
      <Text style={styles.subtitle}>Urban Escape Room</Text>
      <Text style={styles.description}>
        ¡Bienvenido al escape room urbano de Berna!
      </Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.status}>✅ App funcionando correctamente</Text>
        <Text style={styles.status}>✅ Store Zustand: OK</Text>
        <Text style={styles.playerInfo}>👤 Jugador: {playerName || 'Anónimo'}</Text>
        <Text style={styles.playerInfo}>🏆 Puntuación: {score}</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSetName}>
          <Text style={styles.buttonText}>
            {playerName ? 'Volver a Anónimo' : 'Ser Explorador'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleAddPoints}>
          <Text style={styles.buttonText}>+10 Puntos</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PuzzlesScreen() {
  const { completedPuzzles, setCurrentPuzzle, completePuzzle } = useGameStore();
  
  const puzzles = [
    { id: 'clock-tower', name: '🕐 Torre del Reloj', difficulty: 'Fácil', points: 10 },
    { id: 'fountain', name: '⛲ Fuente de la Ciudad', difficulty: 'Medio', points: 20 },
    { id: 'bridge', name: '🌉 Puente Histórico', difficulty: 'Difícil', points: 30 },
    { id: 'cathedral', name: '⛪ Catedral de Berna', difficulty: 'Experto', points: 50 },
  ];
  
  const handleSelectPuzzle = (puzzle) => {
    setCurrentPuzzle(puzzle.id);
  };
  
  const handleCompletePuzzle = (puzzle) => {
    completePuzzle(puzzle.id, puzzle.points);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧩 Enigmas</Text>
      <Text style={styles.subtitle}>Desafíos por resolver</Text>
      
      <View style={styles.puzzleList}>
        {puzzles.map((puzzle) => {
          const isCompleted = completedPuzzles.includes(puzzle.id);
          return (
            <View key={puzzle.id} style={[styles.puzzleCard, isCompleted && styles.completedCard]}>
              <Text style={styles.puzzleName}>{puzzle.name}</Text>
              <Text style={styles.puzzleDifficulty}>Nivel: {puzzle.difficulty}</Text>
              <Text style={styles.puzzlePoints}>Puntos: {puzzle.points}</Text>
              
              {isCompleted ? (
                <Text style={styles.completedText}>✅ Completado</Text>
              ) : (
                <View style={styles.puzzleButtons}>
                  <TouchableOpacity 
                    style={styles.smallButton} 
                    onPress={() => handleSelectPuzzle(puzzle)}
                  >
                    <Text style={styles.buttonText}>Seleccionar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.smallButton, styles.completeButton]} 
                    onPress={() => handleCompletePuzzle(puzzle)}
                  >
                    <Text style={styles.buttonText}>Completar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function MapScreen() {
  const { currentPuzzleId, completedPuzzles, setCurrentPuzzle } = useGameStore();
  
  const locations = [
    {
      id: 'clock-tower',
      name: '🕐 Torre del Reloj',
      description: 'Icónico símbolo de Berna',
      address: 'Kramgasse 49, 3011 Bern',
      status: completedPuzzles.includes('clock-tower') ? 'completed' : 'available'
    },
    {
      id: 'fountain',
      name: '⛲ Fuente de la Ciudad', 
      description: 'Histórica fuente medieval',
      address: 'Gerechtigkeitsgasse, 3011 Bern',
      status: completedPuzzles.includes('fountain') ? 'completed' : 'available'
    },
    {
      id: 'bridge',
      name: '🌉 Puente Histórico',
      description: 'Puente sobre el río Aare',
      address: 'Nydeggbrücke, 3011 Bern', 
      status: completedPuzzles.includes('bridge') ? 'completed' : 'available'
    },
    {
      id: 'cathedral',
      name: '⛪ Catedral de Berna',
      description: 'Majestuosa catedral gótica',
      address: 'Münsterplatz 1, 3000 Bern',
      status: completedPuzzles.includes('cathedral') ? 'completed' : 'available'
    }
  ];
  
  return (
    <ScrollView style={styles.mapScrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>🗺️ Mapa de Berna</Text>
        <Text style={styles.subtitle}>Ubicaciones del Escape Room</Text>
        
        <View style={styles.mapContainer}>
          <Text style={styles.mapPlaceholder}>
            📍 Mapa Interactivo de la Ciudad
          </Text>
          <Text style={styles.mapInfo}>
            Explora las ubicaciones históricas de Berna
          </Text>
        </View>
        
        <View style={styles.locationsList}>
          <Text style={styles.locationsTitle}>🎯 Ubicaciones Disponibles:</Text>
          
          {locations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={[
                styles.locationCard,
                location.status === 'completed' && styles.completedLocation,
                currentPuzzleId === location.id && styles.activeLocation
              ]}
              onPress={() => setCurrentPuzzle(location.id)}
            >
              <Text style={styles.locationName}>{location.name}</Text>
              <Text style={styles.locationDescription}>{location.description}</Text>
              <Text style={styles.locationAddress}>📍 {location.address}</Text>
              
              <View style={styles.locationStatus}>
                {location.status === 'completed' && (
                  <Text style={styles.statusCompleted}>✅ Completado</Text>
                )}
                {currentPuzzleId === location.id && (
                  <Text style={styles.statusActive}>🎯 Activo</Text>
                )}
                {location.status === 'available' && currentPuzzleId !== location.id && (
                  <Text style={styles.statusAvailable}>📍 Disponible</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function ProfileScreen() {
  const { playerName, score, completedPuzzles, currentPuzzleId, resetGame } = useGameStore();
  
  const totalPuzzles = 4;
  const progress = Math.round((completedPuzzles.length / totalPuzzles) * 100);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Perfil</Text>
      <Text style={styles.subtitle}>Tu progreso en el juego</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.playerName}>🎮 {playerName || 'Jugador Anónimo'}</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>🏆 Puntuación Total:</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>✅ Puzzles Completados:</Text>
          <Text style={styles.statValue}>{completedPuzzles.length}/{totalPuzzles}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>🎯 Puzzle Actual:</Text>
          <Text style={styles.statValue}>{currentPuzzleId || 'Ninguno'}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>📊 Progreso:</Text>
          <Text style={styles.statValue}>{progress}%</Text>
        </View>
      </View>
      
      {completedPuzzles.length === totalPuzzles && (
        <View style={styles.achievementContainer}>
          <Text style={styles.achievementText}>🎉 ¡Felicidades!</Text>
          <Text style={styles.achievementSubtext}>Has completado todos los puzzles</Text>
        </View>
      )}
      
      <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetGame}>
        <Text style={styles.buttonText}>Reiniciar Progreso</Text>
      </TouchableOpacity>
    </View>
  );
}

// App principal con navegación por tabs
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: { 
              backgroundColor: '#8B5A2B',
              borderTopWidth: 0,
            },
            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: '#D2B48C',
            headerStyle: { backgroundColor: '#8B5A2B' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Tab.Screen 
            name="Inicio" 
            component={HomeScreen}
            options={{ 
              tabBarIcon: () => null,
              headerTitle: 'ScapeCityBern'
            }}
          />
          <Tab.Screen 
            name="Enigmas" 
            component={PuzzlesScreen}
            options={{ 
              tabBarIcon: () => null 
            }}
          />
          <Tab.Screen 
            name="Mapa" 
            component={MapScreen}
            options={{ 
              tabBarIcon: () => null 
            }}
          />
          <Tab.Screen 
            name="Perfil" 
            component={ProfileScreen}
            options={{ 
              tabBarIcon: () => null 
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B5A2B',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#8B5A2B',
    marginBottom: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    minWidth: '80%',
    elevation: 2,
  },
  status: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 5,
  },
  playerInfo: {
    fontSize: 16,
    color: '#8B5A2B',
    textAlign: 'center',
    marginBottom: 5,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#8B5A2B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    minWidth: 120,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  puzzleList: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '60%',
  },
  puzzleCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5A2B',
  },
  completedCard: {
    backgroundColor: '#E8F5E8',
    borderLeftColor: '#4CAF50',
  },
  puzzleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5A2B',
    marginBottom: 5,
  },
  puzzleDifficulty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  puzzlePoints: {
    fontSize: 14,
    color: '#8B5A2B',
    fontWeight: '600',
    marginBottom: 10,
  },
  completedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  puzzleButtons: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  smallButton: {
    backgroundColor: '#8B5A2B',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  playerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5A2B',
    textAlign: 'center',
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 5,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5A2B',
  },
  achievementContainer: {
    backgroundColor: '#FFD700',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 15,
  },
  achievementText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5A2B',
    marginBottom: 5,
  },
  achievementSubtext: {
    fontSize: 14,
    color: '#666',
  },
  resetButton: {
    backgroundColor: '#FF5722',
    marginTop: 10,
  },
  mapScrollView: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  mapContainer: {
    backgroundColor: '#8B5A2B',
    margin: 15,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
  },
  mapPlaceholder: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mapInfo: {
    fontSize: 16,
    color: '#D2B48C',
    textAlign: 'center',
  },
  locationsList: {
    padding: 15,
  },
  locationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5A2B',
    marginBottom: 15,
    textAlign: 'center',
  },
  locationCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5A2B',
  },
  completedLocation: {
    backgroundColor: '#E8F5E8',
    borderLeftColor: '#4CAF50',
  },
  activeLocation: {
    backgroundColor: '#FFF3E0',
    borderLeftColor: '#FF9800',
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5A2B',
    marginBottom: 5,
  },
  locationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  locationAddress: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  locationStatus: {
    alignItems: 'flex-end',
  },
  statusCompleted: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusActive: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  statusAvailable: {
    fontSize: 12,
    color: '#8B5A2B',
    fontWeight: 'bold',
  },
});
