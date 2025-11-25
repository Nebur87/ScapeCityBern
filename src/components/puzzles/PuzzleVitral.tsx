import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
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

interface PuzzleVitralProps {
  userCoords?: Coords;
  stopCoords: Coords;
  radius: number;
  onComplete: (result: { seal: string; points: number }) => void;
  onClose?: () => void;
}

interface PuzzlePiece {
  id: number;
  correctPosition: number;
  currentPosition: number;
  color: string;
  pattern: string;
  isPlaced: boolean;
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

const PuzzleVitral: React.FC<PuzzleVitralProps> = ({
  userCoords,
  stopCoords,
  radius,
  onComplete,
  onClose,
}) => {
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Patrones de colores para el vitral (simulando vidrieras góticas)
  const vitralColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#A55EEA', '#26DE81', '#FD79A8', '#FDCB6E', '#6C5CE7'
  ];

  const vitralPatterns = [
    'rose', 'cross', 'star', 'diamond', 'circle',
    'triangle', 'square', 'hexagon', 'spiral', 'leaf',
    'crown', 'flame', 'wave', 'heart', 'angel'
  ];

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

    // Inicializar puzzle
    initializePuzzle();

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

    // Animación de brillo continuo
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    glowAnimation.start();

    return () => glowAnimation.stop();
  }, []);

  const initializePuzzle = () => {
    // Crear 15 piezas (3x5 grid)
    const pieces: PuzzlePiece[] = Array.from({ length: 15 }, (_, index) => ({
      id: index,
      correctPosition: index,
      currentPosition: index,
      color: vitralColors[index],
      pattern: vitralPatterns[index],
      isPlaced: false,
    }));

    // Mezclar las piezas
    const shuffled = [...pieces];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tempPosition = shuffled[i].currentPosition;
      shuffled[i].currentPosition = shuffled[j].currentPosition;
      shuffled[j].currentPosition = tempPosition;
    }

    setPuzzlePieces(shuffled);
    setStartTime(Date.now());
  };

  const swapPieces = (piece1Index: number, piece2Index: number) => {
    const newPieces = [...puzzlePieces];
    const temp = newPieces[piece1Index].currentPosition;
    newPieces[piece1Index].currentPosition = newPieces[piece2Index].currentPosition;
    newPieces[piece2Index].currentPosition = temp;

    setPuzzlePieces(newPieces);
    setMoves(prev => prev + 1);

    // Verificar si está completo
    const isComplete = newPieces.every(piece => piece.correctPosition === piece.currentPosition);
    if (isComplete && !isCompleted) {
      setIsCompleted(true);
      completePuzzle();
    }
  };

  const completePuzzle = () => {
    const timeSpent = Date.now() - startTime;
    const timeBonus = Math.max(0, 120000 - timeSpent); // Bonus por tiempo (2 minutos máximo)
    const movesPenalty = Math.max(0, moves - 20) * 10; // Penalización por movimientos extra
    const basePoints = 150;
    const totalPoints = Math.round(basePoints + (timeBonus / 1000) - movesPenalty);

    // Animación de completado
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
    ]).start();

    setTimeout(() => {
      Alert.alert(
        '🌟 ¡Vitral Restaurado!',
        `Has reconstruido el hermoso vitral gótico.\n\nMovimientos: ${moves}\nTiempo: ${Math.round(timeSpent / 1000)}s\nPuntos: ${totalPoints}`,
        [
          {
            text: 'Continuar',
            onPress: () => onComplete({ seal: 'light', points: totalPoints }),
          },
        ]
      );
    }, 500);
  };

  const renderPuzzlePiece = (piece: PuzzlePiece, index: number) => {
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Haptic feedback aquí si está disponible
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Detectar qué pieza está más cerca para intercambiar
        const { moveX, moveY } = gestureState;
        const pieceSize = (width - 80) / 3;
        const col = Math.floor((moveX - 40) / pieceSize);
        const row = Math.floor((moveY - 200) / pieceSize);
        const targetIndex = row * 3 + col;

        if (targetIndex >= 0 && targetIndex < 15 && targetIndex !== index) {
          swapPieces(index, targetIndex);
        }
      },
    });

    const pieceSize = (width - 80) / 3;
    const row = Math.floor(piece.currentPosition / 3);
    const col = piece.currentPosition % 3;

    return (
      <Animated.View
        key={piece.id}
        style={[
          styles.puzzlePiece,
          {
            width: pieceSize - 4,
            height: pieceSize - 4,
            left: col * pieceSize + 42,
            top: row * pieceSize + 202,
            backgroundColor: piece.color,
            transform: [
              {
                scale: isCompleted ? scaleAnim : 1,
              },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={[piece.color, `${piece.color}80`]}
          style={styles.pieceGradient}
        >
          <View style={styles.piecePattern}>
            <Text style={styles.patternText}>{piece.pattern}</Text>
            <Text style={styles.pieceNumber}>{piece.correctPosition + 1}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  if (!isWithinRadius) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#2C1810', '#8B4513']} style={styles.background}>
          <View style={styles.geofenceContainer}>
            <Ionicons name="location-outline" size={80} color="#FFD700" />
            <Text style={styles.geofenceTitle}>Acércate al Münster</Text>
            <Text style={styles.geofenceText}>
              Necesitas estar cerca de la catedral para poder restaurar el vitral sagrado.
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
      <LinearGradient colors={['#1a0033', '#330066', '#4d0080']} style={styles.background}>
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
              <Text style={styles.title}>El Vitral Sagrado</Text>
              <Text style={styles.subtitle}>Restaura la vidriera gótica</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Ionicons name="swap-horizontal" size={20} color="#FFD700" />
              <Text style={styles.statText}>{moves}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="time" size={20} color="#FFD700" />
              <Text style={styles.statText}>
                {Math.floor((Date.now() - startTime) / 1000)}s
              </Text>
            </View>
          </View>

          {/* Puzzle Grid */}
          <Animated.View
            style={[
              styles.puzzleContainer,
              {
                shadowOpacity: glowAnim,
              },
            ]}
          >
            <LinearGradient
              colors={['#FFD70020', '#FFD70010', 'transparent']}
              style={styles.puzzleBackground}
            >
              {puzzlePieces.map((piece, index) => renderPuzzlePiece(piece, index))}
            </LinearGradient>
          </Animated.View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>
              <Ionicons name="information-circle" size={16} color="#FFD700" /> Instrucciones
            </Text>
            <Text style={styles.instructionsText}>
              Arrastra las piezas para reconstruir el vitral. Cada pieza debe volver a su posición original.
            </Text>
          </View>

          {/* Reset Button */}
          <TouchableOpacity style={styles.resetButton} onPress={initializePuzzle}>
            <LinearGradient colors={['#FF6B6B', '#FF5252']} style={styles.resetGradient}>
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.resetText}>Reiniciar</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  statText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  puzzleContainer: {
    width: width - 40,
    height: width - 40,
    alignSelf: 'center',
    borderRadius: 15,
    backgroundColor: '#FFFFFF10',
    borderWidth: 2,
    borderColor: '#FFD70030',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 10,
  },
  puzzleBackground: {
    flex: 1,
    borderRadius: 13,
  },
  puzzlePiece: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pieceGradient: {
    flex: 1,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  piecePattern: {
    alignItems: 'center',
  },
  patternText: {
    fontSize: 10,
    color: '#FFFFFF90',
    textAlign: 'center',
  },
  pieceNumber: {
    fontSize: 8,
    color: '#FFFFFF70',
    marginTop: 2,
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF15',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
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
  resetButton: {
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  resetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  resetText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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

export default PuzzleVitral;