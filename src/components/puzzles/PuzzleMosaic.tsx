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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface Coords {
  latitude: number;
  longitude: number;
}

interface Seal {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  position?: { x: number; y: number };
  isPlaced: boolean;
}

interface MosaicSlot {
  id: string;
  sealType: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isOccupied: boolean;
  placedSeal?: Seal;
}

interface PuzzleMosaicProps {
  userCoords?: Coords;
  stopCoords: Coords;
  radius: number;
  onComplete: (result: { seal: string; points: number }) => void;
  onClose?: () => void;
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

// Función para detectar colisión entre dos rectángulos
const isColliding = (rect1: any, rect2: any): boolean => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

const PuzzleMosaic: React.FC<PuzzleMosaicProps> = ({
  userCoords,
  stopCoords,
  radius,
  onComplete,
  onClose,
}) => {
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [collectedSeals, setCollectedSeals] = useState<Seal[]>([]);
  const [mosaicSlots, setMosaicSlots] = useState<MosaicSlot[]>([]);
  const [draggingSeal, setDraggingSeal] = useState<Seal | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [placedCount, setPlacedCount] = useState(0);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const mosaicGlowAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const sealAnims = useRef<{ [key: string]: Animated.ValueXY }>({}).current;

  // Definición de sellos disponibles
  const availableSeals: Omit<Seal, 'isPlaced' | 'position'>[] = [
    { id: 'light', name: 'Sello de Luz', type: 'light', icon: 'sunny', color: '#FFD700' },
    { id: 'justice', name: 'Sello de Justicia', type: 'justice', icon: 'scale', color: '#4169E1' },
    { id: 'river', name: 'Sello del Río', type: 'river', icon: 'water', color: '#00CED1' },
    { id: 'memory', name: 'Sello de Memoria', type: 'memory', icon: 'brain', color: '#9370DB' },
    { id: 'time', name: 'Sello del Tiempo', type: 'time', icon: 'time', color: '#CD853F' },
    { id: 'wisdom', name: 'Sello de Sabiduría', type: 'wisdom', icon: 'library', color: '#228B22' },
  ];

  // Configuración del mosaico (posiciones donde van los sellos)
  const mosaicLayout: Omit<MosaicSlot, 'isOccupied' | 'placedSeal'>[] = [
    // Patrón hexagonal centrado
    { id: 'center', sealType: 'light', position: { x: width / 2 - 40, y: 200 }, size: { width: 80, height: 80 } },
    { id: 'top', sealType: 'justice', position: { x: width / 2 - 35, y: 130 }, size: { width: 70, height: 70 } },
    { id: 'topRight', sealType: 'river', position: { x: width / 2 + 20, y: 160 }, size: { width: 70, height: 70 } },
    { id: 'bottomRight', sealType: 'memory', position: { x: width / 2 + 20, y: 240 }, size: { width: 70, height: 70 } },
    { id: 'bottom', sealType: 'time', position: { x: width / 2 - 35, y: 270 }, size: { width: 70, height: 70 } },
    { id: 'topLeft', sealType: 'wisdom', position: { x: width / 2 - 90, y: 160 }, size: { width: 70, height: 70 } },
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

    // Inicializar juego
    initializeGame();

    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de brillo del mosaico
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(mosaicGlowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(mosaicGlowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    glowAnimation.start();

    return () => glowAnimation.stop();
  }, []);

  const initializeGame = async () => {
    try {
      // Cargar sellos recolectados del almacenamiento local
      const userData = await AsyncStorage.getItem('userData');
      const userProgress = await AsyncStorage.getItem('userProgress');
      
      // En modo desarrollo, simular que se tienen todos los sellos
      const mockSeals: Seal[] = availableSeals.map((seal, index) => ({
        ...seal,
        isPlaced: false,
        position: { x: 20 + (index % 3) * 100, y: 420 + Math.floor(index / 3) * 90 },
      }));

      setCollectedSeals(mockSeals);

      // Inicializar slots del mosaico
      const slots: MosaicSlot[] = mosaicLayout.map(slot => ({
        ...slot,
        isOccupied: false,
      }));
      setMosaicSlots(slots);

      // Inicializar animaciones de sellos
      mockSeals.forEach(seal => {
        sealAnims[seal.id] = new Animated.ValueXY(seal.position!);
      });

      setStartTime(Date.now());
    } catch (error) {
      console.error('Error loading seals:', error);
    }
  };

  const createPanResponder = (seal: Seal) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !seal.isPlaced,
      onMoveShouldSetPanResponder: () => !seal.isPlaced,
      onPanResponderGrant: () => {
        setDraggingSeal(seal);
        // Animar el sello para que se vea más grande
        Animated.spring(sealAnims[seal.id], {
          toValue: { x: seal.position!.x, y: seal.position!.y },
          useNativeDriver: false,
        }).start();
      },
      onPanResponderMove: (evt, gestureState) => {
        sealAnims[seal.id].setValue({
          x: seal.position!.x + gestureState.dx,
          y: seal.position!.y + gestureState.dy,
        });
      },
      onPanResponderRelease: (evt, gestureState) => {
        const newX = seal.position!.x + gestureState.dx;
        const newY = seal.position!.y + gestureState.dy;

        // Verificar si el sello está sobre un slot válido
        const targetSlot = mosaicSlots.find(slot => {
          if (slot.isOccupied || slot.sealType !== seal.type) return false;
          
          return isColliding(
            { x: newX, y: newY, width: 60, height: 60 },
            { ...slot.position, ...slot.size }
          );
        });

        if (targetSlot) {
          // Colocar el sello en el slot
          placeSealInSlot(seal, targetSlot);
        } else {
          // Regresar el sello a su posición original
          Animated.spring(sealAnims[seal.id], {
            toValue: seal.position!,
            tension: 100,
            friction: 8,
            useNativeDriver: false,
          }).start();
        }

        setDraggingSeal(null);
      },
    });
  };

  const placeSealInSlot = (seal: Seal, slot: MosaicSlot) => {
    // Animar el sello hacia el centro del slot
    Animated.spring(sealAnims[seal.id], {
      toValue: {
        x: slot.position.x + slot.size.width / 2 - 30,
        y: slot.position.y + slot.size.height / 2 - 30,
      },
      tension: 100,
      friction: 8,
      useNativeDriver: false,
    }).start();

    // Actualizar estados
    setCollectedSeals(prev => prev.map(s => 
      s.id === seal.id ? { ...s, isPlaced: true } : s
    ));

    setMosaicSlots(prev => prev.map(s => 
      s.id === slot.id ? { ...s, isOccupied: true, placedSeal: seal } : s
    ));

    setPlacedCount(prev => {
      const newCount = prev + 1;
      if (newCount >= mosaicLayout.length) {
        setTimeout(() => completePuzzle(), 500);
      }
      return newCount;
    });

    // Efecto visual de colocación
    Animated.sequence([
      Animated.timing(sealAnims[seal.id], {
        toValue: { x: slot.position.x + slot.size.width / 2 - 35, y: slot.position.y + slot.size.height / 2 - 35 },
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(sealAnims[seal.id], {
        toValue: { x: slot.position.x + slot.size.width / 2 - 30, y: slot.position.y + slot.size.height / 2 - 30 },
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const completePuzzle = () => {
    setIsCompleted(true);
    const timeSpent = Date.now() - startTime;
    const timeBonus = Math.max(0, 300000 - timeSpent); // Bonus por tiempo (5 minutos máximo)
    const basePoints = 500;
    const totalPoints = Math.round(basePoints + (timeBonus / 1000));

    // Animación de éxito épica
    Animated.parallel([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Animar todos los sellos en secuencia
    availableSeals.forEach((seal, index) => {
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(sealAnims[seal.id], {
            toValue: { x: sealAnims[seal.id]._value.x, y: sealAnims[seal.id]._value.y - 10 },
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(sealAnims[seal.id], {
            toValue: { x: sealAnims[seal.id]._value.x, y: sealAnims[seal.id]._value.y + 10 },
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start();
      }, index * 200);
    });

    setTimeout(() => {
      Alert.alert(
        '🏛️ ¡Guardián de Berna!',
        `Has completado el mosaico sagrado y te has convertido en el Guardián de los Secretos de Berna.\n\n¡Felicidades por completar toda la aventura!\n\nTiempo: ${Math.round(timeSpent / 1000)}s\nPuntos finales: ${totalPoints}`,
        [
          {
            text: '¡Victoria!',
            onPress: () => onComplete({ seal: 'guardian', points: totalPoints }),
          },
        ]
      );
    }, 2000);
  };

  const resetPuzzle = () => {
    setCollectedSeals(prev => prev.map(seal => ({
      ...seal,
      isPlaced: false,
    })));

    setMosaicSlots(prev => prev.map(slot => ({
      ...slot,
      isOccupied: false,
      placedSeal: undefined,
    })));

    setPlacedCount(0);
    setIsCompleted(false);

    // Resetear posiciones de sellos
    availableSeals.forEach((seal, index) => {
      const originalPosition = { x: 20 + (index % 3) * 100, y: 420 + Math.floor(index / 3) * 90 };
      Animated.spring(sealAnims[seal.id], {
        toValue: originalPosition,
        useNativeDriver: false,
      }).start();
    });
  };

  if (!isWithinRadius) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#2C1810', '#8B4513']} style={styles.background}>
          <View style={styles.geofenceContainer}>
            <Ionicons name="location-outline" size={80} color="#FFD700" />
            <Text style={styles.geofenceTitle}>Acércate al Bärengraben</Text>
            <Text style={styles.geofenceText}>
              Necesitas estar en el lugar sagrado de los osos para completar el mosaico final.
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
      <LinearGradient colors={['#1a1a2e', '#16213e', '#8B4513']} style={styles.background}>
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
              <Text style={styles.title}>Mosaico Sagrado</Text>
              <Text style={styles.subtitle}>El ritual final de Berna</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Sellos colocados: {placedCount} / {mosaicLayout.length}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(placedCount / mosaicLayout.length) * 100}%` }
                ]} 
              />
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Mosaico Area */}
            <Animated.View
              style={[
                styles.mosaicContainer,
                {
                  shadowOpacity: mosaicGlowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.8],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={['#FFD70030', '#FFD70010', 'transparent']}
                style={styles.mosaicBackground}
              >
                {/* Slots del mosaico */}
                {mosaicSlots.map((slot) => (
                  <View
                    key={slot.id}
                    style={[
                      styles.mosaicSlot,
                      {
                        left: slot.position.x,
                        top: slot.position.y - 100,
                        width: slot.size.width,
                        height: slot.size.height,
                      },
                      slot.isOccupied && styles.mosaicSlotOccupied,
                    ]}
                  >
                    <View style={styles.slotInner}>
                      <Ionicons 
                        name="add" 
                        size={30} 
                        color={slot.isOccupied ? "transparent" : "#FFD70050"} 
                      />
                    </View>
                  </View>
                ))}

                {/* Conexiones entre slots */}
                <View style={styles.mosaicConnections}>
                  {/* Líneas que conectan el patrón hexagonal */}
                  <View style={[styles.connectionLine, { 
                    left: width / 2 - 30, 
                    top: 170, 
                    width: 60, 
                    transform: [{ rotate: '60deg' }] 
                  }]} />
                  <View style={[styles.connectionLine, { 
                    left: width / 2 - 30, 
                    top: 170, 
                    width: 60, 
                    transform: [{ rotate: '-60deg' }] 
                  }]} />
                  <View style={[styles.connectionLine, { 
                    left: width / 2 - 30, 
                    top: 240, 
                    width: 60, 
                    transform: [{ rotate: '60deg' }] 
                  }]} />
                  <View style={[styles.connectionLine, { 
                    left: width / 2 - 30, 
                    top: 240, 
                    width: 60, 
                    transform: [{ rotate: '-60deg' }] 
                  }]} />
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Sellos disponibles */}
            <View style={styles.sealsContainer}>
              <Text style={styles.sealsTitle}>Sellos Recolectados:</Text>
              <View style={styles.sealsGrid}>
                {collectedSeals.map((seal) => {
                  const panResponder = createPanResponder(seal);
                  
                  return (
                    <Animated.View
                      key={seal.id}
                      style={[
                        styles.sealContainer,
                        {
                          transform: sealAnims[seal.id]?.getTranslateTransform() || [],
                          opacity: seal.isPlaced ? 0.3 : 1,
                          zIndex: draggingSeal?.id === seal.id ? 1000 : 1,
                        },
                      ]}
                      {...panResponder.panHandlers}
                    >
                      <LinearGradient
                        colors={[seal.color, `${seal.color}80`]}
                        style={styles.sealGradient}
                      >
                        <Ionicons name={seal.icon as any} size={30} color="white" />
                        <Text style={styles.sealText}>{seal.name}</Text>
                      </LinearGradient>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Success Overlay */}
          <Animated.View
            style={[
              styles.successOverlay,
              {
                opacity: successAnim,
                transform: [{ scale: successAnim }],
              },
            ]}
            pointerEvents={isCompleted ? 'auto' : 'none'}
          >
            <LinearGradient
              colors={['#FFD70050', '#FFD70030']}
              style={styles.successBackground}
            >
              <Ionicons name="trophy" size={100} color="#FFD700" />
              <Text style={styles.successText}>¡Guardián de Berna!</Text>
              <Text style={styles.successSubtext}>Mosaico Completado</Text>
            </LinearGradient>
          </Animated.View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetPuzzle}
              disabled={isCompleted}
            >
              <LinearGradient colors={['#FF6B6B', '#FF5252']} style={styles.resetGradient}>
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.resetText}>Reiniciar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>
              <Ionicons name="information-circle" size={16} color="#FFD700" /> Instrucciones
            </Text>
            <Text style={styles.instructionsText}>
              Arrastra los sellos recolectados hacia los espacios correspondientes del mosaico sagrado. Cada sello tiene su lugar específico en el patrón hexagonal.
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
  scrollContent: {
    flexGrow: 1,
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
  progressContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    width: width - 80,
    height: 8,
    backgroundColor: '#FFFFFF30',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  mosaicContainer: {
    height: 300,
    marginVertical: 20,
    borderRadius: 15,
    backgroundColor: '#FFFFFF10',
    borderWidth: 2,
    borderColor: '#FFD70030',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 15,
  },
  mosaicBackground: {
    flex: 1,
    borderRadius: 13,
    position: 'relative',
  },
  mosaicSlot: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD70050',
    backgroundColor: '#FFFFFF10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mosaicSlotOccupied: {
    backgroundColor: '#FFD70020',
    borderColor: '#FFD700',
  },
  slotInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mosaicConnections: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  connectionLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#FFD70030',
  },
  sealsContainer: {
    marginVertical: 20,
  },
  sealsTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  sealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  sealContainer: {
    position: 'absolute',
    width: 60,
    height: 80,
    borderRadius: 30,
    margin: 5,
  },
  sealGradient: {
    flex: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sealText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2,
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
    width: width * 0.9,
    height: 250,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  successText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 16,
    textShadowColor: '#000000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  successSubtext: {
    fontSize: 18,
    color: '#FFFFFF90',
    marginTop: 8,
  },
  controlsContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  resetButton: {
    width: 150,
    borderRadius: 25,
    overflow: 'hidden',
  },
  resetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  resetText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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

export default PuzzleMosaic;