import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Coords {
  latitude: number;
  longitude: number;
}

interface PuzzleData {
  pattern: string[];
  speed?: number;
  hint?: string;
}

interface PuzzleSequenceProps {
  userCoords?: Coords;
  stopCoords: Coords;
  radius: number;
  stop: {
    puzzle: PuzzleData;
  };
  onComplete: (result: { seal: string; points: number }) => void;
  onClose?: () => void;
}

interface ColorButton {
  id: string;
  color: string;
  name: string;
  sound?: string;
}

// Función para calcular distancia (Haversine)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Convertir a metros
};

const PuzzleSequence: React.FC<PuzzleSequenceProps> = ({
  userCoords,
  stopCoords,
  radius,
  stop,
  onComplete,
  onClose,
}) => {
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [gameState, setGameState] = useState<'waiting' | 'showing' | 'playing' | 'completed'>('waiting');
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [currentShowIndex, setCurrentShowIndex] = useState(0);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [highlightedButton, setHighlightedButton] = useState<string | null>(null);

  // Configuración del puzzle
  const pattern = stop.puzzle.pattern || ['red', 'blue', 'green', 'yellow'];
  const speed = stop.puzzle.speed || 800; // ms entre colores

  // Definición de colores disponibles
  const colorButtons: ColorButton[] = [
    { id: 'red', color: '#FF4757', name: 'Rojo' },
    { id: 'blue', color: '#3742FA', name: 'Azul' },
    { id: 'green', color: '#2ED573', name: 'Verde' },
    { id: 'yellow', color: '#FFA502', name: 'Amarillo' },
    { id: 'purple', color: '#A55EEA', name: 'Morado' },
    { id: 'orange', color: '#FF6348', name: 'Naranja' },
  ];

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonAnims = useRef(
    colorButtons.reduce((acc, button) => {
      acc[button.id] = new Animated.Value(1);
      return acc;
    }, {} as { [key: string]: Animated.Value })
  ).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Verificar geofence
    if (userCoords) {
      const distance = calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        stopCoords.latitude,
        stopCoords.longitude
      );
      setIsWithinRadius(distance <= radius);
    } else {
      // Modo desarrollo - siempre permitir
      setIsWithinRadius(true);
    }

    // Inicializar juego
    initializeGame();

    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (gameState === 'showing' && currentShowIndex < sequence.length) {
      const timer = setTimeout(() => {
        showNextColor();
      }, speed);
      return () => clearTimeout(timer);
    } else if (gameState === 'showing' && currentShowIndex >= sequence.length) {
      // Terminar de mostrar secuencia
      setGameState('playing');
      setCurrentShowIndex(0);
    }
  }, [gameState, currentShowIndex, sequence]);

  useEffect(() => {
    if (gameState === 'playing' && playerSequence.length > 0) {
      const lastIndex = playerSequence.length - 1;
      const isCorrect = playerSequence[lastIndex] === sequence[lastIndex];

      if (!isCorrect) {
        // Error en la secuencia
        handleWrongSequence();
      } else if (playerSequence.length === sequence.length) {
        // Secuencia completada correctamente
        handleCorrectSequence();
      }
    }
  }, [playerSequence]);

  const initializeGame = () => {
    // Generar secuencia inicial basada en el patrón
    const initialSequence = pattern.slice(0, Math.min(3, pattern.length));
    setSequence(initialSequence);
    setPlayerSequence([]);
    setLevel(1);
    setScore(0);
    setStartTime(Date.now());
    setGameState('waiting');
  };

  const startGame = () => {
    setGameState('showing');
    setCurrentShowIndex(0);
    setPlayerSequence([]);
  };

  const showNextColor = () => {
    const colorId = sequence[currentShowIndex];
    setHighlightedButton(colorId);

    // Animar botón
    Animated.sequence([
      Animated.timing(buttonAnims[colorId], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnims[colorId], {
        toValue: 1.2,
        duration: speed - 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnims[colorId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      setHighlightedButton(null);
      setCurrentShowIndex(prev => prev + 1);
    }, speed);
  };

  const handleColorPress = (colorId: string) => {
    if (gameState !== 'playing') return;

    // Animar botón presionado
    Animated.sequence([
      Animated.timing(buttonAnims[colorId], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnims[colorId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setPlayerSequence(prev => [...prev, colorId]);
  };

  const handleWrongSequence = () => {
    setAttempts(prev => prev + 1);
    setGameState('waiting');

    // Animación de error
    colorButtons.forEach(button => {
      Animated.sequence([
        Animated.timing(buttonAnims[button.id], {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnims[button.id], {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    });

    setTimeout(() => {
      Alert.alert(
        '❌ Secuencia Incorrecta',
        'Intenta recordar mejor el patrón de colores.',
        [
          { text: 'Intentar de nuevo', onPress: () => startGame() },
          { text: 'Ver pista', onPress: () => showHint() },
        ]
      );
    }, 300);
  };

  const handleCorrectSequence = () => {
    const levelPoints = level * 50;
    setScore(prev => prev + levelPoints);

    if (level >= pattern.length || sequence.length >= 8) {
      // Puzzle completado
      completePuzzle();
    } else {
      // Siguiente nivel
      setLevel(prev => prev + 1);
      const nextSequence = [...sequence, pattern[sequence.length % pattern.length]];
      setSequence(nextSequence);
      setGameState('waiting');

      Alert.alert(
        '✅ ¡Correcto!',
        `Nivel ${level} completado. +${levelPoints} puntos\n\nSiguiente nivel: ${sequence.length + 1} colores`,
        [{ text: 'Continuar', onPress: () => startGame() }]
      );
    }
  };

  const completePuzzle = () => {
    setGameState('completed');
    const timeSpent = Date.now() - startTime;
    const timeBonus = Math.max(0, 180000 - timeSpent); // Bonus por tiempo (3 minutos máximo)
    const attemptsPenalty = attempts * 25; // Penalización por intentos fallidos
    const basePoints = score;
    const totalPoints = Math.round(basePoints + (timeBonus / 1000) - attemptsPenalty);

    // Animación de éxito
    Animated.parallel([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Animar todos los botones en secuencia de celebración
    colorButtons.forEach((button, index) => {
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(buttonAnims[button.id], {
            toValue: 1.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(buttonAnims[button.id], {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, index * 100);
    });

    setTimeout(() => {
      Alert.alert(
        '🧠 ¡Memoria Perfecta!',
        `Has dominado la secuencia de colores de la memoria.\n\nNivel alcanzado: ${level}\nIntentos fallidos: ${attempts}\nTiempo: ${Math.round(timeSpent / 1000)}s\nPuntos: ${Math.max(100, totalPoints)}`,
        [
          {
            text: 'Continuar',
            onPress: () => onComplete({ seal: 'memory', points: Math.max(100, totalPoints) }),
          },
        ]
      );
    }, 1000);
  };

  const showHint = () => {
    Alert.alert(
      '💡 Pista',
      stop.puzzle.hint || 
      `Secuencia actual: ${sequence.map(color => {
        const button = colorButtons.find(b => b.id === color);
        return button?.name || color;
      }).join(' → ')}`
    );
  };

  const getGameStateText = () => {
    switch (gameState) {
      case 'waiting':
        return 'Toca "Iniciar" para ver la secuencia';
      case 'showing':
        return `Memoriza la secuencia... (${currentShowIndex + 1}/${sequence.length})`;
      case 'playing':
        return `Repite la secuencia (${playerSequence.length}/${sequence.length})`;
      case 'completed':
        return '¡Secuencia completada!';
      default:
        return '';
    }
  };

  if (!isWithinRadius) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#2c1810', '#8B4513']} style={styles.background}>
          <View style={styles.geofenceContainer}>
            <Ionicons name="location-outline" size={80} color="#FFD700" />
            <Text style={styles.geofenceTitle}>Acércate a la Casa de Einstein</Text>
            <Text style={styles.geofenceText}>
              Necesitas estar cerca del hogar del genio para acceder al desafío de memoria.
            </Text>
            <Text style={styles.distanceText}>
              Radio requerido: {radius}m
            </Text>
            {onClose && (
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Volver</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.background}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {onClose && (
                <TouchableOpacity onPress={onClose} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#FFD700" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.headerCenter}>
              <Text style={styles.title}>Secuencia de Memoria</Text>
              <Text style={styles.subtitle}>Desafío de Einstein</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Ionicons name="trophy" size={20} color="#FFD700" />
              <Text style={styles.statText}>{score}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="layers" size={20} color="#FFD700" />
              <Text style={styles.statText}>{level}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="eye-off" size={20} color="#FFD700" />
              <Text style={styles.statText}>{attempts}</Text>
            </View>
          </View>

          {/* Game State */}
          <View style={styles.gameStateContainer}>
            <Text style={styles.gameStateText}>{getGameStateText()}</Text>
          </View>

          {/* Color Buttons Grid */}
          <View style={styles.colorsContainer}>
            <View style={styles.colorsGrid}>
              {colorButtons.slice(0, 4).map((button) => (
                <Animated.View
                  key={button.id}
                  style={[
                    styles.colorButtonContainer,
                    {
                      transform: [{ scale: buttonAnims[button.id] }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.colorButton,
                      { backgroundColor: button.color },
                      highlightedButton === button.id && styles.colorButtonHighlighted,
                      gameState !== 'playing' && styles.colorButtonDisabled,
                    ]}
                    onPress={() => handleColorPress(button.id)}
                    disabled={gameState !== 'playing'}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[button.color, `${button.color}CC`]}
                      style={styles.colorButtonGradient}
                    >
                      <Text style={styles.colorButtonText}>{button.name}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            {/* Additional colors if needed */}
            {colorButtons.length > 4 && (
              <View style={styles.extraColorsGrid}>
                {colorButtons.slice(4).map((button) => (
                  <Animated.View
                    key={button.id}
                    style={[
                      styles.extraColorButtonContainer,
                      {
                        transform: [{ scale: buttonAnims[button.id] }],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.extraColorButton,
                        { backgroundColor: button.color },
                        highlightedButton === button.id && styles.colorButtonHighlighted,
                        gameState !== 'playing' && styles.colorButtonDisabled,
                      ]}
                      onPress={() => handleColorPress(button.id)}
                      disabled={gameState !== 'playing'}
                      activeOpacity={0.8}
                    />
                  </Animated.View>
                ))}
              </View>
            )}
          </View>

          {/* Success Overlay */}
          <Animated.View
            style={[
              styles.successOverlay,
              {
                opacity: successAnim,
                transform: [{ scale: successAnim }],
              },
            ]}
            pointerEvents={gameState === 'completed' ? 'auto' : 'none'}
          >
            <LinearGradient
              colors={['#00FF0030', '#00FF0020']}
              style={styles.successBackground}
            >
              <Ionicons name="checkmark-circle" size={80} color="#00FF00" />
              <Text style={styles.successText}>¡Memoria Perfecta!</Text>
            </LinearGradient>
          </Animated.View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                gameState === 'showing' && styles.controlButtonDisabled,
              ]}
              onPress={startGame}
              disabled={gameState === 'showing'}
            >
              <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.controlGradient}>
                <Ionicons name="play" size={20} color="white" />
                <Text style={styles.controlText}>
                  {gameState === 'waiting' ? 'Iniciar' : 'Ver de nuevo'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={showHint}>
              <LinearGradient colors={['#FFA502', '#FF6348']} style={styles.controlGradient}>
                <Ionicons name="bulb" size={20} color="white" />
                <Text style={styles.controlText}>Pista</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={initializeGame}>
              <LinearGradient colors={['#FF6B6B', '#FF5252']} style={styles.controlGradient}>
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.controlText}>Reiniciar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>
              <Ionicons name="information-circle" size={16} color="#FFD700" /> Instrucciones
            </Text>
            <Text style={styles.instructionsText}>
              Memoriza la secuencia de colores que se ilumina, luego repítela tocando los botones en el mismo orden. Cada nivel añade un color más.
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: '#00000050',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFFFFF80',
    textAlign: 'center',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  statText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  gameStateContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gameStateText: {
    color: '#FFFFFF90',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  colorsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorButtonContainer: {
    margin: 8,
  },
  colorButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  colorButtonHighlighted: {
    borderColor: '#FFFFFF',
    borderWidth: 4,
  },
  colorButtonDisabled: {
    opacity: 0.6,
  },
  colorButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 57,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: '#00000080',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  extraColorsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  extraColorButtonContainer: {
    margin: 6,
  },
  extraColorButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF30',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBackground: {
    width: width * 0.8,
    height: 200,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00FF0050',
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF00',
    marginTop: 16,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  controlButton: {
    flex: 0.3,
    borderRadius: 25,
    overflow: 'hidden',
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  controlGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  controlText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD70020',
  },
  instructionsTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsText: {
    color: '#FFFFFF80',
    fontSize: 14,
    lineHeight: 20,
  },
  geofenceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  geofenceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  geofenceText: {
    fontSize: 16,
    color: '#FFFFFF90',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  distanceText: {
    fontSize: 14,
    color: '#FFFFFF70',
    textAlign: 'center',
    marginBottom: 30,
  },
  closeButton: {
    backgroundColor: '#8B5A2B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PuzzleSequence;