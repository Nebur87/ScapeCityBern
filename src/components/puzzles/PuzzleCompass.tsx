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
import { DeviceMotion } from 'expo-sensors';

const { width, height } = Dimensions.get('window');

interface Coords {
  latitude: number;
  longitude: number;
}

interface PuzzleData {
  targetAngle: number;
  tolerance?: number;
  hint?: string;
}

interface PuzzleCompassProps {
  userCoords?: Coords;
  stopCoords: Coords;
  radius: number;
  stop: {
    puzzle: PuzzleData;
  };
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

// Función para normalizar ángulos
const normalizeAngle = (angle: number): number => {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
};

// Función para calcular diferencia angular
const angleDifference = (angle1: number, angle2: number): number => {
  const diff = Math.abs(normalizeAngle(angle1) - normalizeAngle(angle2));
  return Math.min(diff, 360 - diff);
};

const PuzzleCompass: React.FC<PuzzleCompassProps> = ({
  userCoords,
  stopCoords,
  radius,
  stop,
  onComplete,
  onClose,
}) => {
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isNearTarget, setIsNearTarget] = useState(false);

  // Configuración del puzzle
  const targetAngle = stop.puzzle.targetAngle || 45;
  const tolerance = stop.puzzle.tolerance || 10;

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const needleRotation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const calibrationAnim = useRef(new Animated.Value(0)).current;

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

    // Inicializar sensores
    initializeCompass();
    setStartTime(Date.now());

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

    // Animación de calibración
    const calibrationAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(calibrationAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(calibrationAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    calibrationAnimation.start();

    // Simular calibración por 3 segundos
    setTimeout(() => {
      setIsCalibrating(false);
      calibrationAnimation.stop();
    }, 3000);

    return () => {
      DeviceMotion.removeAllListeners();
      calibrationAnimation.stop();
    };
  }, []);

  useEffect(() => {
    // Animar rotación de la aguja
    Animated.timing(needleRotation, {
      toValue: currentHeading,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Verificar si está cerca del objetivo
    const diff = angleDifference(currentHeading, targetAngle);
    const isNear = diff <= tolerance;
    setIsNearTarget(isNear);

    if (isNear && !isCompleted) {
      // Animación de éxito
      const successAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      successAnimation.start();

      // Auto-completar después de 2 segundos manteniendo la posición
      setTimeout(() => {
        const currentDiff = angleDifference(currentHeading, targetAngle);
        if (currentDiff <= tolerance && !isCompleted) {
          completePuzzle();
        }
        successAnimation.stop();
      }, 2000);
    } else {
      pulseAnim.setValue(1);
    }
  }, [currentHeading, isCompleted]);

  const initializeCompass = () => {
    DeviceMotion.setUpdateInterval(100);
    
    const subscription = DeviceMotion.addListener((motionData) => {
      if (motionData.rotation) {
        // Convertir rotación a heading (0-360 grados)
        let heading = motionData.rotation.gamma * (180 / Math.PI);
        if (motionData.rotation.beta < 0) {
          heading = 180 - heading;
        }
        
        // Simular brújula más realista en modo desarrollo
        if (!userCoords) {
          // En modo desarrollo, simular movimiento basado en tiempo
          const time = Date.now();
          heading = (time / 50) % 360;
        }

        setCurrentHeading(normalizeAngle(heading));
      }
    });

    return subscription;
  };

  const completePuzzle = () => {
    if (isCompleted) return;
    
    setIsCompleted(true);
    const timeSpent = Date.now() - startTime;
    const timeBonus = Math.max(0, 60000 - timeSpent); // Bonus por tiempo (1 minuto máximo)
    const basePoints = 120;
    const totalPoints = Math.round(basePoints + (timeBonus / 1000));

    // Animación de éxito final
    Animated.parallel([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    setTimeout(() => {
      Alert.alert(
        '🧭 ¡Rumbo Encontrado!',
        `Has orientado correctamente la brújula hacia el río.\n\nÁngulo objetivo: ${targetAngle}°\nTu orientación: ${Math.round(currentHeading)}°\nTiempo: ${Math.round(timeSpent / 1000)}s\nPuntos: ${totalPoints}`,
        [
          {
            text: 'Continuar',
            onPress: () => onComplete({ seal: 'river', points: Math.max(50, totalPoints) }),
          },
        ]
      );
    }, 1000);
  };

  const getCompassDirection = (angle: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(angle / 45) % 8;
    return directions[index];
  };

  const renderCompassMarks = () => {
    const marks = [];
    for (let i = 0; i < 360; i += 30) {
      const isMainDirection = i % 90 === 0;
      const markHeight = isMainDirection ? 20 : 12;
      const markWidth = isMainDirection ? 3 : 1;
      
      marks.push(
        <View
          key={i}
          style={[
            styles.compassMark,
            {
              height: markHeight,
              width: markWidth,
              transform: [
                { rotate: `${i}deg` },
                { translateY: -140 },
              ],
            },
          ]}
        />
      );

      if (isMainDirection) {
        marks.push(
          <Text
            key={`label-${i}`}
            style={[
              styles.compassLabel,
              {
                transform: [
                  { rotate: `${i}deg` },
                  { translateY: -160 },
                ],
              },
            ]}
          >
            {getCompassDirection(i)}
          </Text>
        );
      }
    }
    return marks;
  };

  if (!isWithinRadius) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a4b47', '#2d5a4e']} style={styles.background}>
          <View style={styles.geofenceContainer}>
            <Ionicons name="location-outline" size={80} color="#FFD700" />
            <Text style={styles.geofenceTitle}>Acércate al Río Aare</Text>
            <Text style={styles.geofenceText}>
              Necesitas estar cerca del puente para orientarte hacia la corriente del río.
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
      <LinearGradient colors={['#0f2027', '#203a43', '#2c5530']} style={styles.background}>
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
              <Text style={styles.title}>Brújula del Río</Text>
              <Text style={styles.subtitle}>Encuentra la dirección del Aare</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          {/* Status */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, isNearTarget && styles.statusSuccess]}>
              <Ionicons 
                name={isNearTarget ? "checkmark-circle" : "compass"} 
                size={20} 
                color={isNearTarget ? "#00FF00" : "#FFD700"} 
              />
              <Text style={[styles.statusText, isNearTarget && styles.statusTextSuccess]}>
                {isCalibrating 
                  ? 'Calibrando...' 
                  : isNearTarget 
                    ? '¡Dirección correcta!' 
                    : 'Busca el rumbo correcto'
                }
              </Text>
            </View>
          </View>

          {/* Compass Container */}
          <View style={styles.compassContainer}>
            <Animated.View
              style={[
                styles.compassBase,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: isCalibrating ? calibrationAnim : 1,
                },
              ]}
            >
              {/* Compass Marks */}
              <View style={styles.compassMarks}>
                {renderCompassMarks()}
              </View>

              {/* Target Indicator */}
              <View
                style={[
                  styles.targetIndicator,
                  {
                    transform: [{ rotate: `${targetAngle}deg` }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  style={styles.targetArrow}
                />
              </View>

              {/* Compass Needle */}
              <Animated.View
                style={[
                  styles.compassNeedle,
                  {
                    transform: [
                      { rotate: needleRotation.interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '360deg'],
                        })
                      }
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#FF0000', '#FFFFFF']}
                  style={styles.needleGradient}
                />
                <View style={styles.needleCenter} />
              </Animated.View>

              {/* Center Dot */}
              <View style={styles.compassCenter} />
            </Animated.View>
          </View>

          {/* Info Display */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Orientación actual:</Text>
              <Text style={styles.infoValue}>
                {Math.round(currentHeading)}° {getCompassDirection(currentHeading)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Objetivo:</Text>
              <Text style={styles.infoValue}>
                {targetAngle}° {getCompassDirection(targetAngle)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Diferencia:</Text>
              <Text style={[
                styles.infoValue,
                { color: isNearTarget ? '#00FF00' : '#FFD700' }
              ]}>
                {Math.round(angleDifference(currentHeading, targetAngle))}°
              </Text>
            </View>
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
            pointerEvents={isCompleted ? 'auto' : 'none'}
          >
            <LinearGradient
              colors={['#00FF0030', '#00FF0020']}
              style={styles.successBackground}
            >
              <Ionicons name="compass" size={80} color="#00FF00" />
              <Text style={styles.successText}>¡Rumbo Encontrado!</Text>
            </LinearGradient>
          </Animated.View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>
              <Ionicons name="information-circle" size={16} color="#FFD700" /> Instrucciones
            </Text>
            <Text style={styles.instructionsText}>
              {stop.puzzle.hint || 
                `Gira tu dispositivo hasta que la aguja apunte hacia ${targetAngle}° (${getCompassDirection(targetAngle)}). La flecha roja marca la dirección objetivo.`
              }
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
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF20',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FFD70030',
  },
  statusSuccess: {
    backgroundColor: '#00FF0020',
    borderColor: '#00FF0050',
  },
  statusText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  statusTextSuccess: {
    color: '#00FF00',
  },
  compassContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  compassBase: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#FFFFFF10',
    borderWidth: 3,
    borderColor: '#FFD70040',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  compassMarks: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  compassMark: {
    position: 'absolute',
    backgroundColor: '#FFFFFF60',
    top: '50%',
    left: '50%',
    marginLeft: -1.5,
  },
  compassLabel: {
    position: 'absolute',
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    top: '50%',
    left: '50%',
    width: 20,
    marginLeft: -10,
    marginTop: -8,
  },
  targetIndicator: {
    position: 'absolute',
    width: 6,
    height: 100,
    top: 40,
    left: '50%',
    marginLeft: -3,
  },
  targetArrow: {
    flex: 1,
    borderRadius: 3,
  },
  compassNeedle: {
    position: 'absolute',
    width: 4,
    height: 120,
    top: 20,
    left: '50%',
    marginLeft: -2,
  },
  needleGradient: {
    flex: 1,
    borderRadius: 2,
  },
  needleCenter: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    top: '50%',
    left: '50%',
    marginLeft: -4,
    marginTop: -4,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  compassCenter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF15',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#FFD70020',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoLabel: {
    color: '#FFFFFF80',
    fontSize: 14,
  },
  infoValue: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
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

export default PuzzleCompass;