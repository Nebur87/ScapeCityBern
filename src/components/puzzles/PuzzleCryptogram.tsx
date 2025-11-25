import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
  solution: string;
  hint?: string;
  cryptogram: string;
  substitutions?: { [key: string]: string };
}

interface PuzzleCryptogramProps {
  userCoords?: Coords;
  stopCoords: Coords;
  radius: number;
  stop: {
    puzzle: PuzzleData;
  };
  onComplete: (result: { seal: string; points: number }) => void;
  onClose?: () => void;
}

interface LetterMapping {
  encrypted: string;
  decrypted: string;
  isRevealed: boolean;
  isCorrect: boolean;
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

// Generar criptograma Caesar cipher
const generateCryptogram = (text: string, shift: number = 3): { cryptogram: string; substitutions: { [key: string]: string } } => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const substitutions: { [key: string]: string } = {};
  
  let cryptogram = '';
  
  for (let char of text.toUpperCase()) {
    if (alphabet.includes(char)) {
      const oldIndex = alphabet.indexOf(char);
      const newIndex = (oldIndex + shift) % 26;
      const encryptedChar = alphabet[newIndex];
      substitutions[encryptedChar] = char;
      cryptogram += encryptedChar;
    } else {
      cryptogram += char;
    }
  }
  
  return { cryptogram, substitutions };
};

const PuzzleCryptogram: React.FC<PuzzleCryptogramProps> = ({
  userCoords,
  stopCoords,
  radius,
  stop,
  onComplete,
  onClose,
}) => {
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [letterMappings, setLetterMappings] = useState<{ [key: string]: string }>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [hints, setHints] = useState(0);
  const [cryptogramData, setCryptogramData] = useState<{ cryptogram: string; substitutions: { [key: string]: string } }>({
    cryptogram: '',
    substitutions: {}
  });

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
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

    // Inicializar cryptograma
    initializeCryptogram();

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

    // Animación de pulso para el input
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const initializeCryptogram = () => {
    const solution = stop.puzzle.solution || 'JUSTICIA EN BERNA';
    const { cryptogram, substitutions } = generateCryptogram(solution, 7);
    
    setCryptogramData({ cryptogram, substitutions });
    setStartTime(Date.now());
    
    // Revelar algunas letras automáticamente como ayuda
    const commonLetters = ['A', 'E', 'I', 'O', 'U'];
    const initialMappings: { [key: string]: string } = {};
    
    Object.entries(substitutions).forEach(([encrypted, original]) => {
      if (commonLetters.includes(original) && Math.random() < 0.3) {
        initialMappings[encrypted] = original;
      }
    });
    
    setLetterMappings(initialMappings);
  };

  const handleLetterInput = (encryptedLetter: string, value: string) => {
    if (value.length > 1) return;
    
    const uppercaseValue = value.toUpperCase();
    if (uppercaseValue && !/[A-Z]/.test(uppercaseValue)) return;

    setLetterMappings(prev => ({
      ...prev,
      [encryptedLetter]: uppercaseValue
    }));

    checkSolution();
  };

  const checkSolution = () => {
    const solution = stop.puzzle.solution?.toUpperCase() || 'JUSTICIA EN BERNA';
    let decodedText = '';
    
    for (let char of cryptogramData.cryptogram) {
      if (letterMappings[char]) {
        decodedText += letterMappings[char];
      } else if (char === ' ') {
        decodedText += ' ';
      } else if (!/[A-Z]/.test(char)) {
        decodedText += char;
      } else {
        decodedText += '_';
      }
    }

    // Verificar si está completo y correcto
    const isComplete = !decodedText.includes('_');
    const isCorrect = decodedText === solution;

    if (isComplete && isCorrect && !isCompleted) {
      setIsCompleted(true);
      completePuzzle();
    } else if (isComplete && !isCorrect) {
      setAttempts(prev => prev + 1);
      
      // Feedback de error
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      Alert.alert(
        '🔍 Intenta de nuevo',
        'El código no es correcto. Revisa tus sustituciones de letras.',
        [{ text: 'Continuar', style: 'default' }]
      );
    }
  };

  const completePuzzle = () => {
    const timeSpent = Date.now() - startTime;
    const timeBonus = Math.max(0, 300000 - timeSpent); // Bonus por tiempo (5 minutos máximo)
    const attemptsPenalty = attempts * 20; // Penalización por intentos fallidos
    const hintsPenalty = hints * 15; // Penalización por pistas usadas
    const basePoints = 200;
    const totalPoints = Math.round(basePoints + (timeBonus / 1000) - attemptsPenalty - hintsPenalty);

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

    setTimeout(() => {
      Alert.alert(
        '⚖️ ¡Código Descifrado!',
        `Has revelado el mensaje secreto de la justicia.\n\nIntentos: ${attempts + 1}\nPistas usadas: ${hints}\nTiempo: ${Math.round(timeSpent / 1000)}s\nPuntos: ${totalPoints}`,
        [
          {
            text: 'Continuar',
            onPress: () => onComplete({ seal: 'justice', points: Math.max(50, totalPoints) }),
          },
        ]
      );
    }, 1000);
  };

  const useHint = () => {
    const solution = stop.puzzle.solution?.toUpperCase() || 'JUSTICIA EN BERNA';
    const unrevealedLetters = Object.keys(cryptogramData.substitutions).filter(
      encrypted => !letterMappings[encrypted]
    );

    if (unrevealedLetters.length === 0) return;

    const randomEncrypted = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
    const correctDecrypted = cryptogramData.substitutions[randomEncrypted];

    setLetterMappings(prev => ({
      ...prev,
      [randomEncrypted]: correctDecrypted
    }));

    setHints(prev => prev + 1);

    // Animación de pista
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderCryptogramDisplay = () => {
    return cryptogramData.cryptogram.split('').map((char, index) => {
      if (char === ' ') {
        return <View key={index} style={styles.spaceChar} />;
      }
      
      if (!/[A-Z]/.test(char)) {
        return (
          <View key={index} style={styles.punctuationContainer}>
            <Text style={styles.punctuationChar}>{char}</Text>
          </View>
        );
      }

      const isRevealed = letterMappings[char];
      const decryptedChar = letterMappings[char] || '';

      return (
        <View key={index} style={styles.letterContainer}>
          <Text style={styles.encryptedLetter}>{char}</Text>
          <TextInput
            style={[
              styles.decryptedInput,
              isRevealed && styles.decryptedInputFilled,
            ]}
            value={decryptedChar}
            onChangeText={(value) => handleLetterInput(char, value)}
            maxLength={1}
            autoCapitalize="characters"
            textAlign="center"
          />
        </View>
      );
    });
  };

  if (!isWithinRadius) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.background}>
          <View style={styles.geofenceContainer}>
            <Ionicons name="location-outline" size={80} color="#FFD700" />
            <Text style={styles.geofenceTitle}>Acércate al Bundeshaus</Text>
            <Text style={styles.geofenceText}>
              Necesitas estar cerca del Palacio Federal para acceder a los archivos secretos.
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
      <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={styles.background}>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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
                <Text style={styles.title}>Criptograma Secreto</Text>
                <Text style={styles.subtitle}>Descifra el mensaje de la justicia</Text>
              </View>
              <View style={styles.headerRight} />
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Ionicons name="eye" size={20} color="#FFD700" />
                <Text style={styles.statText}>{attempts}</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="bulb" size={20} color="#FFD700" />
                <Text style={styles.statText}>{hints}</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="time" size={20} color="#FFD700" />
                <Text style={styles.statText}>
                  {Math.floor((Date.now() - startTime) / 1000)}s
                </Text>
              </View>
            </View>

            {/* Cryptogram Display */}
            <ScrollView contentContainerStyle={styles.cryptogramContainer}>
              <View style={styles.cryptogramGrid}>
                {renderCryptogramDisplay()}
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
                colors={['#FFD70030', '#FFD70020']}
                style={styles.successBackground}
              >
                <Ionicons name="checkmark-circle" size={80} color="#00FF00" />
                <Text style={styles.successText}>¡Código Descifrado!</Text>
              </LinearGradient>
            </Animated.View>

            {/* Controls */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity 
                style={styles.hintButton} 
                onPress={useHint}
                disabled={isCompleted}
              >
                <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.hintGradient}>
                  <Ionicons name="bulb-outline" size={20} color="white" />
                  <Text style={styles.hintText}>Pista (-15pts)</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={initializeCryptogram}
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
                {stop.puzzle.hint || 'Cada letra encriptada representa una letra diferente. Usa la lógica y patrones para descifrar el mensaje secreto.'}
              </Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
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
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 6,
  },
  statText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  cryptogramContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  cryptogramGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterContainer: {
    alignItems: 'center',
    margin: 3,
  },
  encryptedLetter: {
    fontSize: 12,
    color: '#FFFFFF60',
    marginBottom: 4,
    textAlign: 'center',
  },
  decryptedInput: {
    width: 30,
    height: 35,
    borderWidth: 1,
    borderColor: '#FFD70040',
    backgroundColor: '#FFFFFF10',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  decryptedInputFilled: {
    backgroundColor: '#FFD70020',
    borderColor: '#FFD700',
  },
  spaceChar: {
    width: 15,
    height: 35,
  },
  punctuationContainer: {
    width: 20,
    height: 35,
    justifyContent: 'flex-end',
    alignItems: 'center',
    margin: 3,
  },
  punctuationChar: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
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
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  hintButton: {
    flex: 0.48,
    borderRadius: 25,
    overflow: 'hidden',
  },
  hintGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  hintText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  resetButton: {
    flex: 0.48,
    borderRadius: 25,
    overflow: 'hidden',
  },
  resetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  resetText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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

export default PuzzleCryptogram;