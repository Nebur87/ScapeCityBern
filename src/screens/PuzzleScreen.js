import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function PuzzleScreen({ route, navigation }) {
  const { stop, routeId, puzzleType } = route.params;
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  const completePuzzle = () => {
    Alert.alert(
      '¡Puzzle Completado!',
      `Has ganado el ${stop.reward.seal} y ${stop.reward.points} puntos.\n\n${stop.reward.text}`,
      [
        {
          text: 'Continuar',
          onPress: () => {
            setIsCompleted(true);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const renderPuzzleContent = () => {
    switch (puzzleType) {
      case 'Alineación Astronómica AR':
        return (
          <View style={styles.puzzleContainer}>
            <Text style={styles.puzzleTitle}>Alinea los Símbolos</Text>
            <Text style={styles.puzzleInstructions}>
              Usa la cámara para escanear el reloj y alinea los símbolos según la hora actual.
            </Text>
            <View style={styles.arPlaceholder}>
              <Ionicons name="camera" size={60} color="#8B5A2B" />
              <Text style={styles.arText}>Vista AR del Reloj</Text>
            </View>
          </View>
        );
      
      case 'Reconstrucción de Vitral':
        return (
          <View style={styles.puzzleContainer}>
            <Text style={styles.puzzleTitle}>Reconstruye el Vitral</Text>
            <Text style={styles.puzzleInstructions}>
              Arrastra las piezas para formar la imagen completa del vitral.
            </Text>
            <View style={styles.vitralGrid}>
              {[1,2,3,4,5,6,7,8,9].map(piece => (
                <TouchableOpacity 
                  key={piece} 
                  style={styles.vitralPiece}
                  onPress={() => setProgress(prev => prev + 11)}
                >
                  <Text>{piece}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      default:
        return (
          <View style={styles.puzzleContainer}>
            <Text style={styles.puzzleTitle}>{puzzleType}</Text>
            <Text style={styles.puzzleInstructions}>
              {stop.puzzle.instructions || stop.puzzle.hint}
            </Text>
            <View style={styles.genericPuzzle}>
              <Ionicons name="puzzle" size={80} color="#8B5A2B" />
              <Text style={styles.genericText}>Puzzle Interactivo</Text>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#8B5A2B', '#D2B48C']}
        style={styles.header}
      >
        <Text style={styles.stopName}>{stop.name}</Text>
        <Text style={styles.puzzleType}>{puzzleType}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {renderPuzzleContent()}
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Progreso: {progress}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.completeButton,
            progress < 100 && styles.disabledButton
          ]}
          onPress={completePuzzle}
          disabled={progress < 100}
        >
          <LinearGradient
            colors={progress >= 100 ? ['#4CAF50', '#45a049'] : ['#999', '#666']}
            style={styles.buttonGradient}
          >
            <Ionicons name="trophy" size={24} color="white" />
            <Text style={styles.completeButtonText}>Completar Puzzle</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  stopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  puzzleType: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  puzzleContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  puzzleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  puzzleInstructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  arPlaceholder: {
    height: 200,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  arText: {
    marginTop: 10,
    color: '#8B5A2B',
    fontSize: 16,
  },
  vitralGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitralPiece: {
    width: '30%',
    height: 60,
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#8B5A2B',
  },
  genericPuzzle: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genericText: {
    marginTop: 10,
    color: '#8B5A2B',
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  completeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});