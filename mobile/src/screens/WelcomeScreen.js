import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    icon: 'map-outline',
    title: '¡Bienvenido a Berna!',
    description: 'Explora 10 ubicaciones históricas en el corazón de Suiza mientras resuelves puzzles únicos y descubres secretos ocultos.',
    color: '#8B5A2B'
  },
  {
    id: '2',
    icon: 'location-outline',
    title: 'Geolocalización GPS',
    description: 'Usa tu ubicación para desbloquear puzzles. Camina hasta cada parada histórica y sumérgete en la aventura.',
    color: '#4CAF50'
  },
  {
    id: '3',
    icon: 'camera-outline',
    title: 'Realidad Aumentada',
    description: 'Apunta tu cámara a monumentos y edificios para revelar pistas ocultas y resolver puzzles interactivos.',
    color: '#2196F3'
  },
  {
    id: '4',
    icon: 'puzzle-outline',
    title: 'Puzzles Únicos',
    description: 'Cada ubicación tiene su propio desafío: desde alineaciones astronómicas hasta criptogramas históricos.',
    color: '#9C27B0'
  },
  {
    id: '5',
    icon: 'trophy-outline',
    title: 'Colecciona Sellos',
    description: 'Gana sellos especiales al completar cada parada. Reúne los 9 sellos para desbloquear el misterio final.',
    color: '#FF9800'
  },
  {
    id: '6',
    icon: 'paw',
    title: 'El Secreto de la Ciudad de los Osos',
    description: '¿Podrás encontrar el Manuscrito del Aare y desvelar el secreto mejor guardado de Berna?',
    color: '#8B5A2B'
  }
];

export default function WelcomeScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      finishOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
      setCurrentIndex(prevIndex);
    }
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      navigation.replace('MainTabs');
    }
  };

  const renderOnboardingItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        style={[
          styles.onboardingItem,
          { opacity, transform: [{ scale }] }
        ]}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
            <Ionicons name={item.icon} size={80} color="white" />
          </View>
          
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </Animated.View>
    );
  };

  const renderDot = (index) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const dotSize = scrollX.interpolate({
      inputRange,
      outputRange: [8, 12, 8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            opacity,
          },
        ]}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#8B5A2B', '#D2B48C', '#F5DEB3']}
        style={styles.gradient}
      >
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Omitir</Text>
        </TouchableOpacity>

        {/* Onboarding Content */}
        <View style={styles.flatListContainer}>
          <Animated.FlatList
            ref={flatListRef}
            data={onboardingData}
            renderItem={renderOnboardingItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentIndex(index);
            }}
            scrollEventThrottle={16}
          />
        </View>

        {/* Progress Indicators */}
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, index) => renderDot(index))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity 
              style={styles.previousButton}
              onPress={handlePrevious}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
              <Text style={styles.previousText}>Anterior</Text>
            </TouchableOpacity>
          )}

          <View style={styles.buttonSpacer} />

          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNext}
          >
            <LinearGradient
              colors={['#8B5A2B', '#A0522D']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextText}>
                {currentIndex === onboardingData.length - 1 ? 'Comenzar' : 'Siguiente'}
              </Text>
              <Ionicons 
                name={currentIndex === onboardingData.length - 1 ? 'play' : 'chevron-forward'} 
                size={20} 
                color="white" 
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: scrollX.interpolate({
                    inputRange: [0, (onboardingData.length - 1) * width],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  })
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} de {onboardingData.length}
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  skipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  flatListContainer: {
    flex: 1,
    marginTop: 60,
  },
  onboardingItem: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    borderRadius: 6,
    backgroundColor: 'white',
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  previousText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 4,
  },
  buttonSpacer: {
    flex: 1,
  },
  nextButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  nextText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  progressBarContainer: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
});