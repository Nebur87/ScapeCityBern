import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Import types and services
import { Stop, PuzzleResult, PuzzleComponentProps } from '../types/types';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../hooks/useAuth';
import PuzzleWrapper from './PuzzleWrapper';
import { theme } from '../config/theme';

// Import puzzle components
import PuzzleVitral from './puzzles/PuzzleVitral';
import PuzzleCryptogram from './puzzles/PuzzleCryptogram';
import PuzzleCompass from './puzzles/PuzzleCompass';
import PuzzleSequence from './puzzles/PuzzleSequence';
import PuzzleMosaic from './puzzles/PuzzleMosaic';
import PuzzleAROverlay from './puzzles/PuzzleAROverlay';

const { width, height } = Dimensions.get('window');

const PuzzleScreen: React.FC<PuzzleComponentProps> = ({
  stop,
  userCoords,
  onComplete,
  onClose,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Hooks for state management
  const { completeStop, isLoading: progressLoading } = useProgress();
  const { isAuthenticated, user } = useAuth();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Autenticación Requerida',
        'Debes iniciar sesión para acceder a los puzzles.',
        [{ text: 'OK', onPress: onClose }]
      );
    }
  }, [isAuthenticated, onClose]);

  // Manejar completación del puzzle
  const handleComplete = async (result: PuzzleResult) => {
    if (isCompleted || isSubmitting) return;

    if (!isAuthenticated) {
      Alert.alert('Error', 'Debes iniciar sesión para guardar el progreso');
      return;
    }

    setIsCompleted(true);
    setIsSubmitting(true);

    try {
      // Mostrar mensaje de éxito inmediatamente
      const successMessage = getPuzzleSuccessMessage(stop.puzzle.type, result);
      
      // Usar el store para completar la parada
      await completeStop(stop.id, result, userCoords);

      Alert.alert(
        '🎉 ¡Puzzle Completado!',
        `${successMessage}\n\n¡Tu progreso ha sido guardado correctamente!`,
        [
          {
            text: 'Continuar',
            style: 'default',
            onPress: () => {
              onComplete?.(result);
            },
          },
        ]
      );

    } catch (error) {
      console.error('Error al completar puzzle:', error);
      
      // Mostrar error pero permitir continuar
      Alert.alert(
        '⚠️ Error de Conexión',
        `Puzzle completado correctamente, pero hubo un problema al guardar:\n\n${
          error instanceof Error ? error.message : 'Error desconocido'
        }\n\nTu progreso se guardará cuando tengas conexión.`,
        [
          {
            text: 'Continuar',
            style: 'default',
            onPress: () => {
              onComplete?.(result);
            },
          },
          {
            text: 'Reintentar',
            style: 'default',
            onPress: async () => {
              setIsSubmitting(false);
              setIsCompleted(false);
              handleComplete(result);
            },
          },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtener mensaje de éxito específico para cada tipo de puzzle
  const getPuzzleSuccessMessage = (puzzleType: string, result: PuzzleResult): string => {
    const baseMessage = `Ubicación: ${stop.name}\nSello obtenido: ${result.seal}\nPuntos ganados: ${result.points}`;
    
    switch (puzzleType) {
      case 'vitral':
        return `🌈 ¡Has restaurado el vitral de la catedral!\n\n${baseMessage}\n\nEl vitral brilla nuevamente con todos sus colores.`;
      
      case 'cryptogram':
        return `🔐 ¡Criptograma descifrado correctamente!\n\n${baseMessage}\n\nHas revelado el mensaje secreto oculto.`;
      
      case 'compass':
        return `🧭 ¡Orientación perfecta encontrada!\n\n${baseMessage}\n\nHas seguido el camino correcto hacia tu destino.`;
      
      case 'sequence':
        return `🎵 ¡Secuencia completada magistralmente!\n\n${baseMessage}\n\nTu memoria ha superado todos los desafíos.`;
      
      case 'mosaic':
        return `🎨 ¡Mosaico final ensamblado!\n\n${baseMessage}\n\nHas unido todas las piezas del gran misterio.`;
      
      case 'ar-overlay':
        return `📱 ¡Realidad aumentada dominada!\n\n${baseMessage}\n\nHas revelado secretos ocultos en el mundo real.`;
      
      default:
        return `✨ ¡Puzzle completado con éxito!\n\n${baseMessage}`;
    }
  };

  // Renderizar el puzzle correspondiente según el tipo
  const renderPuzzle = () => {
    const defaultRadius = stop.radius || 50;

    switch (stop.puzzle.type) {
      case 'vitral':
        return (
          <PuzzleVitral
            stop={stop}
            userCoords={userCoords}
            stopCoords={stop.coords}
            radius={defaultRadius}
            onComplete={handleComplete}
            onClose={onClose}
          />
        );

      case 'cryptogram':
        return (
          <PuzzleCryptogram
            stop={stop}
            userCoords={userCoords}
            stopCoords={stop.coords}
            radius={defaultRadius}
            onComplete={handleComplete}
            onClose={onClose}
          />
        );

      case 'compass':
        return (
          <PuzzleCompass
            stop={stop}
            userCoords={userCoords}
            stopCoords={stop.coords}
            radius={defaultRadius}
            onComplete={handleComplete}
            onClose={onClose}
          />
        );

      case 'sequence':
        return (
          <PuzzleSequence
            stop={stop}
            userCoords={userCoords}
            stopCoords={stop.coords}
            radius={defaultRadius}
            onComplete={handleComplete}
            onClose={onClose}
          />
        );

      case 'mosaic':
        return (
          <PuzzleMosaic
            stop={stop}
            userCoords={userCoords}
            stopCoords={stop.coords}
            radius={defaultRadius}
            onComplete={handleComplete}
            onClose={onClose}
          />
        );

      case 'ar-overlay':
        return (
          <PuzzleAROverlay
            stop={stop}
            userCoords={userCoords}
            stopCoords={stop.coords}
            radius={defaultRadius}
            onComplete={handleComplete}
            onClose={onClose}
          />
        );

      default:
        return (
          <PuzzleWrapper
            title="Puzzle No Disponible"
            subtitle={`Tipo "${stop.puzzle.type}" no implementado`}
            icon="alert-circle-outline"
            onClose={onClose}
            headerGradient={theme.gradients.danger}
          >
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={80} color={theme.colors.danger} />
              <Text style={styles.errorTitle}>Puzzle No Disponible</Text>
              <Text style={styles.errorText}>
                El tipo de puzzle "{stop.puzzle.type}" no está implementado o no es válido.
              </Text>
              <Text style={styles.errorDetails}>
                Ubicación: {stop.name}
              </Text>
              {onClose && (
                <TouchableOpacity style={styles.backButton} onPress={onClose}>
                  <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
              )}
            </View>
          </PuzzleWrapper>
        );
    }
  };

  // Mostrar loading overlay si está enviando
  if (isSubmitting || progressLoading) {
    return (
      <PuzzleWrapper
        title={stop.name}
        subtitle="Guardando progreso..."
        loading={true}
        loadingText="Sincronizando con servidor..."
      >
        <View />
      </PuzzleWrapper>
    );
  }

  return renderPuzzle();
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.title,
    fontWeight: 'bold',
    color: theme.colors.danger,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
    marginBottom: theme.spacing.md,
  },
  errorDetails: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.sm,
  },
  backButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
  },
});

export default PuzzleScreen;