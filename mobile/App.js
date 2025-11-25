import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useGameStore } from './src/stores/gameStore';
import { stops, seals } from './src/config/gameConfig';

// Crear objeto gameConfig para compatibilidad
const gameConfig = { stops, seals };

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
  const { completedStops, unlockedStops, currentStopId, setCurrentStop, completeStop } = useGameStore();
  
  const stops = [
    { id: 'stop-1', name: '🕐 Zytglogge', difficulty: 'Fácil', points: 10, seal: 'time' },
    { id: 'stop-2', name: '⛪ Catedral (Münster)', difficulty: 'Fácil', points: 12, seal: 'light' },
    { id: 'stop-3', name: '🏛️ Bundeshaus', difficulty: 'Medio', points: 15, seal: 'consensus' },
    { id: 'stop-4', name: '🗼 Käfigturm', difficulty: 'Medio', points: 14, seal: 'justice' },
    { id: 'stop-5', name: '🌉 Nydeggbrücke', difficulty: 'Difícil', points: 16, seal: 'river' },
  ];
  
  const handleSelectStop = (stop) => {
    setCurrentStop(stop.id);
  };
  
  const handleCompleteStop = (stop) => {
    const reward = { seal: stop.seal, points: stop.points };
    completeStop(stop.id, reward);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧩 Enigmas</Text>
      <Text style={styles.subtitle}>Desafíos por resolver</Text>
      
      <View style={styles.puzzleList}>
        {stops.map((stop) => {
          const isCompleted = completedStops.includes(stop.id);
          const isUnlocked = unlockedStops.includes(stop.id);
          const isActive = currentStopId === stop.id;
          
          return (
            <View key={stop.id} style={[
              styles.puzzleCard, 
              isCompleted && styles.completedCard,
              !isUnlocked && styles.lockedCard
            ]}>
              <View style={styles.stopHeader}>
                <Text style={styles.puzzleName}>{stop.name}</Text>
                <Text style={styles.sealIndicator}>🏆 {stop.seal}</Text>
              </View>
              <Text style={styles.puzzleDifficulty}>Nivel: {stop.difficulty}</Text>
              <Text style={styles.puzzlePoints}>Puntos: {stop.points}</Text>
              
              {!isUnlocked ? (
                <Text style={styles.lockedText}>🔒 Completa paradas anteriores</Text>
              ) : isCompleted ? (
                <Text style={styles.completedText}>✅ Completado</Text>
              ) : (
                <View style={styles.puzzleButtons}>
                  <TouchableOpacity 
                    style={[styles.smallButton, isActive && styles.activeButton]} 
                    onPress={() => handleSelectStop(stop)}
                  >
                    <Text style={styles.buttonText}>
                      {isActive ? 'Seleccionado' : 'Seleccionar'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.smallButton, styles.completeButton]} 
                    onPress={() => handleCompleteStop(stop)}
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
  const { currentStopId, completedStops, unlockedStops, setCurrentStop } = useGameStore();
  
  // Sistema de mapa progresivo - cada área se descubre al avanzar
  const mapAreas = [
    {
      id: 'stop-1',
      name: '🕐 Zytglogge', 
      description: 'Torre del reloj astronómico medieval',
      gridPosition: { x: 1, y: 1 },
      revealRadius: 1, // Revela áreas adyacentes
      status: completedStops.includes('stop-1') ? 'completed' : 
             unlockedStops.includes('stop-1') ? 'available' : 'locked'
    },
    {
      id: 'stop-2',
      name: '⛪ Catedral (Münster)',
      description: 'Majestuosa catedral gótica',
      gridPosition: { x: 2, y: 1 },
      revealRadius: 1,
      status: completedStops.includes('stop-2') ? 'completed' : 
             unlockedStops.includes('stop-2') ? 'available' : 'locked'
    },
    {
      id: 'stop-3',
      name: '🏛️ Bundeshaus',
      description: 'Sede del parlamento suizo',
      gridPosition: { x: 0, y: 2 },
      revealRadius: 1,
      status: completedStops.includes('stop-3') ? 'completed' : 
             unlockedStops.includes('stop-3') ? 'available' : 'locked'
    },
    {
      id: 'stop-4',
      name: '🗼 Käfigturm',
      description: 'Antigua torre prisión',
      gridPosition: { x: 2, y: 2 },
      revealRadius: 1,
      status: completedStops.includes('stop-4') ? 'completed' : 
             unlockedStops.includes('stop-4') ? 'available' : 'locked'
    },
    {
      id: 'stop-5',
      name: '🌉 Nydeggbrücke',
      description: 'Puente histórico sobre el Aare',
      gridPosition: { x: 1, y: 3 },
      revealRadius: 1,
      status: completedStops.includes('stop-5') ? 'completed' : 
             unlockedStops.includes('stop-5') ? 'available' : 'locked'
    },
    {
      id: 'stop-6',
      name: '🎭 Teatro',
      description: 'Casa cultural de Berna',
      gridPosition: { x: 3, y: 0 },
      revealRadius: 1,
      status: completedStops.includes('stop-6') ? 'completed' : 
             unlockedStops.includes('stop-6') ? 'available' : 'locked'
    },
    {
      id: 'stop-7',
      name: '📚 Biblioteca',
      description: 'Centro del conocimiento',
      gridPosition: { x: 3, y: 1 },
      revealRadius: 1,
      status: completedStops.includes('stop-7') ? 'completed' : 
             unlockedStops.includes('stop-7') ? 'available' : 'locked'
    },
    {
      id: 'stop-8',
      name: '🏛️ Museo',
      description: 'Historia y arte de Berna',
      gridPosition: { x: 0, y: 3 },
      revealRadius: 1,
      status: completedStops.includes('stop-8') ? 'completed' : 
             unlockedStops.includes('stop-8') ? 'available' : 'locked'
    },
    {
      id: 'stop-9',
      name: '🌳 Parque',
      description: 'Espacio verde histórico',
      gridPosition: { x: 3, y: 2 },
      revealRadius: 1,
      status: completedStops.includes('stop-9') ? 'completed' : 
             unlockedStops.includes('stop-9') ? 'available' : 'locked'
    },
    {
      id: 'stop-10',
      name: '🏰 Castillo Final',
      description: 'El gran tesoro de Berna',
      gridPosition: { x: 3, y: 3 },
      revealRadius: 2, // Área final revela más territorio
      status: completedStops.includes('stop-10') ? 'completed' : 
             unlockedStops.includes('stop-10') ? 'available' : 'locked'
    }
  ];

  // Calcular qué áreas del mapa están reveladas
  const getRevealedAreas = () => {
    const revealed = new Set();
    
    // Siempre revelar el área inicial
    revealed.add('0,0');
    revealed.add('1,1'); // Posición del primer puzzle
    
    // Revelar áreas basadas en puzzles completados
    completedStops.forEach(stopId => {
      const area = mapAreas.find(a => a.id === stopId);
      if (area) {
        const { x, y } = area.gridPosition;
        const radius = area.revealRadius;
        
        // Revelar área central y adyacentes
        for (let dx = -radius; dx <= radius; dx++) {
          for (let dy = -radius; dy <= radius; dy++) {
            revealed.add(`${x + dx},${y + dy}`);
          }
        }
      }
    });
    
    return revealed;
  };

  const revealedAreas = getRevealedAreas();
  const progressPercentage = Math.round((completedStops.length / gameConfig.stops.length) * 100);
  
  return (
    <ScrollView style={styles.mapScrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>🗺️ Mapa de Berna</Text>
        <Text style={styles.subtitle}>Ubicaciones del Escape Room</Text>
        
        <View style={styles.mapContainer}>
          <Text style={styles.mapPlaceholder}>
            🗺️ MAPA DE BERNA
          </Text>
          <View style={styles.mapProgress}>
            <Text style={styles.mapProgressText}>
              📍 Explorado: {progressPercentage}% | Áreas descubiertas: {revealedAreas.size}
            </Text>
          </View>
          
          <View style={styles.explorationGrid}>
            {/* Grid 4x4 del mapa progresivo */}
            {[0,1,2,3].map(row => (
              <View key={row} style={styles.mapGridRow}>
                {[0,1,2,3].map(col => {
                  const isRevealed = revealedAreas.has(`${col},${row}`);
                  const area = mapAreas.find(a => a.gridPosition.x === col && a.gridPosition.y === row);
                  
                  return (
                    <TouchableOpacity
                      key={`${col}-${row}`}
                      style={[
                        styles.gridCell,
                        !isRevealed && styles.hiddenCell,
                        area && area.status === 'completed' && styles.completedCell,
                        area && area.status === 'available' && styles.availableCell,
                        area && currentStopId === area.id && styles.activeCell
                      ]}
                      onPress={() => area && area.status !== 'locked' && setCurrentStop(area.id)}
                      disabled={!area || area.status === 'locked'}
                    >
                      {!isRevealed ? (
                        <Text style={styles.hiddenText}>❓</Text>
                      ) : area ? (
                        <View style={styles.cellContent}>
                          <Text style={styles.cellEmoji}>
                            {area.name.split(' ')[0]}
                          </Text>
                          {area.status === 'completed' && (
                            <Text style={styles.cellStatus}>✅</Text>
                          )}
                          {area.status === 'available' && area.id === currentStopId && (
                            <Text style={styles.cellStatus}>🎯</Text>
                          )}
                        </View>
                      ) : (
                        <View style={styles.emptyArea}>
                          <Text style={styles.terrainText}>🌲</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
          
          <Text style={styles.mapLegendText}>
            ❓ Sin explorar | ✅ Completado | 🎯 Actual | 🌲 Paisaje
          </Text>
        </View>
        
        {/* Mapa de coordenadas reales */}
        <View style={styles.realMapContainer}>
          <Text style={styles.realMapTitle}>📍 Coordenadas GPS Reales</Text>
          <View style={styles.coordinatesMap}>
            {gameConfig.stops
              .filter(stop => unlockedStops.includes(stop.id) || completedStops.includes(stop.id))
              .map(stop => (
                <TouchableOpacity
                  key={stop.id}
                  style={[
                    styles.coordinatePin,
                    completedStops.includes(stop.id) && styles.completedPin,
                    currentStopId === stop.id && styles.activePin
                  ]}
                  onPress={() => setCurrentStop(stop.id)}
                >
                  <Text style={styles.pinEmoji}>{stop.name.split(' ')[0] || '📍'}</Text>
                  <Text style={styles.pinName}>{stop.name.split(' ').slice(1).join(' ')}</Text>
                  <Text style={styles.pinCoords}>
                    {stop.coordinates.lat.toFixed(4)}, {stop.coordinates.lng.toFixed(4)}
                  </Text>
                </TouchableOpacity>
              ))
            }
          </View>
          <Text style={styles.coordinatesNote}>
            💡 Estas son las coordenadas GPS reales de las ubicaciones en Berna
          </Text>
        </View>
        
        <View style={styles.discoveredAreas}>
          <Text style={styles.areasTitle}>🔍 Áreas Descubiertas:</Text>
          
          {mapAreas.filter(area => {
            const key = `${area.gridPosition.x},${area.gridPosition.y}`;
            return revealedAreas.has(key);
          }).map((area) => {
            // Obtener las coordenadas reales del gameConfig
            const realStop = gameConfig.stops.find(s => s.id === area.id);
            
            return (
              <TouchableOpacity
                key={area.id}
                style={[
                  styles.discoveredCard,
                  area.status === 'completed' && styles.discoveredCompleted,
                  area.status === 'locked' && styles.discoveredLocked,
                  currentStopId === area.id && styles.discoveredActive
                ]}
                onPress={() => area.status !== 'locked' && setCurrentStop(area.id)}
                disabled={area.status === 'locked'}
              >
                <View style={styles.discoveredHeader}>
                  <View style={styles.discoveredInfo}>
                    <Text style={styles.discoveredName}>{area.name}</Text>
                    <Text style={styles.discoveredDescription}>{area.description}</Text>
                    
                    {/* Coordenadas reales de GPS */}
                    {realStop && (
                      <Text style={styles.discoveredCoords}>
                        🌍 GPS: {realStop.coordinates.lat.toFixed(6)}, {realStop.coordinates.lng.toFixed(6)}
                      </Text>
                    )}
                    
                    {/* Información adicional del juego */}
                    {realStop && (
                      <View style={styles.stopDetails}>
                        <Text style={styles.stopInfo}>
                          🏆 Sello: {realStop.seal} | 🎯 Dificultad: {realStop.difficulty} | ⭐ Puntos: {realStop.points}
                        </Text>
                        {realStop.hint && (
                          <Text style={styles.stopHint}>💡 Pista: {realStop.hint}</Text>
                        )}
                      </View>
                    )}
                  </View>
                  <View style={styles.discoveredStatus}>
                    {area.status === 'completed' && <Text style={styles.statusIcon}>✅</Text>}
                    {area.status === 'locked' && <Text style={styles.statusIcon}>🔒</Text>}
                    {area.status === 'available' && <Text style={styles.statusIcon}>📍</Text>}
                    {currentStopId === area.id && <Text style={styles.statusIcon}>🎯</Text>}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          
          {mapAreas.length - mapAreas.filter(area => {
            const key = `${area.gridPosition.x},${area.gridPosition.y}`;
            return revealedAreas.has(key);
          }).length > 0 && (
            <View style={styles.hiddenAreasHint}>
              <Text style={styles.hintText}>
                🌫️ {mapAreas.length - mapAreas.filter(area => {
                  const key = `${area.gridPosition.x},${area.gridPosition.y}`;
                  return revealedAreas.has(key);
                }).length} áreas aún por descubrir...
              </Text>
              <Text style={styles.hintSubtext}>
                Completa puzzles para revelar más del mapa 🗺️
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function ProfileScreen() {
  const { playerName, score, completedStops, currentStopId, collectedSeals, resetGame } = useGameStore();
  
  const totalStops = 10; // Total de paradas en el juego
  const progress = Math.round((completedStops.length / totalStops) * 100);
  
  const sealEmojis = {
    time: '⏰', light: '💡', consensus: '🤝', justice: '⚖️', river: '🌊'
  };
  
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
          <Text style={styles.statLabel}>✅ Paradas Completadas:</Text>
          <Text style={styles.statValue}>{completedStops.length}/{totalStops}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>🎯 Parada Actual:</Text>
          <Text style={styles.statValue}>{currentStopId || 'Ninguna'}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>🏆 Sellos Coleccionados:</Text>
          <Text style={styles.statValue}>{collectedSeals.length}/10</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>📊 Progreso:</Text>
          <Text style={styles.statValue}>{progress}%</Text>
        </View>
      </View>
      
      {collectedSeals.length > 0 && (
        <View style={styles.sealsContainer}>
          <Text style={styles.sealsTitle}>🏆 Sellos Coleccionados:</Text>
          <View style={styles.sealsGrid}>
            {collectedSeals.map((seal, index) => (
              <Text key={index} style={styles.sealItem}>
                {sealEmojis[seal] || '🏆'} {seal}
              </Text>
            ))}
          </View>
        </View>
      )}
      
      {completedStops.length === totalStops && (
        <View style={styles.achievementContainer}>
          <Text style={styles.achievementText}>🎉 ¡Maestro de Berna!</Text>
          <Text style={styles.achievementSubtext}>Has completado todas las paradas del escape room</Text>
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
  lockedCard: {
    backgroundColor: '#F5F5F5',
    borderLeftColor: '#9E9E9E',
    opacity: 0.7,
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  sealIndicator: {
    fontSize: 10,
    color: '#FF9800',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: 'bold',
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
  activeButton: {
    backgroundColor: '#FF9800',
  },
  lockedText: {
    fontSize: 14,
    color: '#9E9E9E',
    fontWeight: 'bold',
    textAlign: 'center',
    fontStyle: 'italic',
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
  sealsContainer: {
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  sealsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5A2B',
    marginBottom: 10,
    textAlign: 'center',
  },
  sealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  sealItem: {
    fontSize: 12,
    color: '#8B5A2B',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  mapScrollView: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  mapContainer: {
    backgroundColor: '#2C3E50',
    margin: 15,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    borderWidth: 2,
    borderColor: '#8B5A2B',
  },
  mapPlaceholder: {
    fontSize: 18,
    color: '#ECF0F1',
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  mapProgress: {
    backgroundColor: 'rgba(139, 90, 43, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 12,
  },
  mapProgressText: {
    fontSize: 11,
    color: '#D2B48C',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  explorationGrid: {
    width: '100%',
    aspectRatio: 1,
    padding: 8,
  },
  mapGridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
    margin: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#34495E',
    borderWidth: 1,
    borderColor: '#4A5F7A',
  },
  hiddenCell: {
    backgroundColor: '#1C2833',
    borderColor: '#2C3E50',
  },
  completedCell: {
    backgroundColor: '#27AE60',
    borderColor: '#2ECC71',
  },
  availableCell: {
    backgroundColor: '#8B5A2B',
    borderColor: '#D2B48C',
  },
  activeCell: {
    backgroundColor: '#E67E22',
    borderColor: '#F39C12',
    shadowColor: '#F39C12',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  cellContent: {
    alignItems: 'center',
  },
  cellEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  cellStatus: {
    fontSize: 12,
  },
  hiddenText: {
    fontSize: 20,
    color: '#5D6D7E',
  },
  emptyArea: {
    alignItems: 'center',
  },
  terrainText: {
    fontSize: 14,
    opacity: 0.6,
  },
  mapLegendText: {
    fontSize: 10,
    color: '#BDC3C7',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  discoveredAreas: {
    padding: 15,
  },
  areasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5A2B',
    marginBottom: 15,
    textAlign: 'center',
  },
  discoveredCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5A2B',
  },
  discoveredCompleted: {
    backgroundColor: '#E8F5E8',
    borderLeftColor: '#27AE60',
  },
  discoveredLocked: {
    backgroundColor: '#F8F9FA',
    borderLeftColor: '#95A5A6',
    opacity: 0.7,
  },
  discoveredActive: {
    backgroundColor: '#FFF3E0',
    borderLeftColor: '#E67E22',
  },
  discoveredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  discoveredInfo: {
    flex: 1,
  },
  discoveredName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5A2B',
    marginBottom: 4,
  },
  discoveredDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  discoveredCoords: {
    fontSize: 11,
    color: '#95A5A6',
    fontFamily: 'monospace',
  },
  discoveredStatus: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  hiddenAreasHint: {
    backgroundColor: '#34495E',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 14,
    color: '#ECF0F1',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  hintSubtext: {
    fontSize: 12,
    color: '#BDC3C7',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  stopDetails: {
    marginTop: 8,
  },
  stopInfo: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  stopHint: {
    fontSize: 11,
    color: '#95A5A6',
    fontStyle: 'italic',
    marginTop: 4,
  },
  realMapContainer: {
    backgroundColor: '#2C3E50',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginHorizontal: 10,
  },
  realMapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ECF0F1',
    textAlign: 'center',
    marginBottom: 15,
  },
  coordinatesMap: {
    backgroundColor: '#34495E',
    borderRadius: 10,
    padding: 15,
    minHeight: 150,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  coordinatePin: {
    backgroundColor: '#95A5A6',
    borderRadius: 8,
    padding: 8,
    margin: 4,
    minWidth: 80,
    alignItems: 'center',
    elevation: 2,
  },
  completedPin: {
    backgroundColor: '#27AE60',
  },
  activePin: {
    backgroundColor: '#E67E22',
    borderWidth: 2,
    borderColor: '#F39C12',
  },
  pinEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  pinName: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pinCoords: {
    fontSize: 8,
    color: '#ECF0F1',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 2,
  },
  coordinatesNote: {
    fontSize: 12,
    color: '#BDC3C7',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  coordinateCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5A2B',
  },
  completedCoordinate: {
    backgroundColor: '#E8F5E8',
    borderLeftColor: '#4CAF50',
  },
  lockedCoordinate: {
    backgroundColor: '#F5F5F5',
    borderLeftColor: '#9E9E9E',
    opacity: 0.6,
  },
  activeCoordinate: {
    backgroundColor: '#FFF3E0',
    borderLeftColor: '#FF9800',
  },
  coordinateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  coordinateInfo: {
    flex: 1,
  },
  coordinateName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5A2B',
    marginBottom: 3,
  },
  coordinateData: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  coordinateIndicator: {
    marginLeft: 10,
  },
  statusIcon: {
    fontSize: 18,
  },
  coordinateDetails: {
    marginTop: 5,
  },
  coordinateDistance: {
    fontSize: 11,
    color: '#8B5A2B',
    marginBottom: 2,
  },
  coordinateDirection: {
    fontSize: 11,
    color: '#666',
  },
  mapLegend: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#8B5A2B',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5A2B',
    marginBottom: 8,
    textAlign: 'center',
  },
  legendItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
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
  lockedLocation: {
    backgroundColor: '#F5F5F5',
    borderLeftColor: '#9E9E9E',
    opacity: 0.6,
  },
  activeLocation: {
    backgroundColor: '#FFF3E0',
    borderLeftColor: '#FF9800',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5A2B',
    flex: 1,
  },
  locationPoints: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF9800',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  locationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 18,
  },
  locationAddress: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  locationDifficulty: {
    fontSize: 12,
    color: '#8B5A2B',
    fontWeight: '600',
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
  statusLocked: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: 'bold',
  },
});
