import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import { useAdventureStore } from '../hooks/useAdventure';

const { width } = Dimensions.get('window');

// Animated Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface GlobalCountdownProps {
  size?: number;
  strokeWidth?: number;
}

const GlobalCountdown: React.FC<GlobalCountdownProps> = ({
  size = 120,
  strokeWidth = 8,
}) => {
  const { countdown, started } = useAdventureStore();
  const [currentTime, setCurrentTime] = useState(countdown);
  
  // Constants
  const INITIAL_COUNTDOWN = 10800; // 3 hours in seconds
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Animated values
  const progress = useSharedValue(1);
  
  useEffect(() => {
    setCurrentTime(countdown);
    
    if (started) {
      // Calculate progress (0 = finished, 1 = full time)
      const progressValue = countdown / INITIAL_COUNTDOWN;
      progress.value = withTiming(progressValue, { duration: 1000 });
    }
  }, [countdown, started]);
  
  // Animated circle properties
  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = interpolate(
      progress.value,
      [0, 1],
      [circumference, 0],
      Extrapolate.CLAMP
    );
    
    return {
      strokeDashoffset,
    };
  });
  
  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get color based on time remaining
  const getTimeColor = (seconds: number): string => {
    const hours = seconds / 3600;
    
    if (hours > 2) return '#4CAF50'; // Verde - más de 2 horas
    if (hours > 1) return '#FF9800'; // Amarillo - entre 1 y 2 horas
    return '#F44336'; // Rojo - menos de 1 hora
  };
  
  // Calculate bonus points
  const bonusPoints = Math.floor(currentTime / 60) * 5;
  
  // Get time status message
  const getTimeStatus = (seconds: number): string => {
    const hours = seconds / 3600;
    
    if (hours > 2) return '¡Excelente tiempo!';
    if (hours > 1) return '¡Buen ritmo!';
    if (hours > 0.5) return '¡Date prisa!';
    return '¡Tiempo crítico!';
  };
  
  const timeColor = getTimeColor(currentTime);
  const timeStatus = getTimeStatus(currentTime);
  
  if (!started) {
    return (
      <View style={styles.container}>
        <View style={[styles.circle, { width: size, height: size }]}>
          <Text style={styles.readyText}>¡Listo para{'\n'}comenzar!</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.countdownContainer}>
        {/* Animated SVG Circle */}
        <Svg width={size} height={size} style={styles.svgCircle}>
          <G rotation="-90" origin={`${size/2}, ${size/2}`}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E0E0E0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            
            {/* Animated progress circle */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={timeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              animatedProps={animatedCircleProps}
            />
          </G>
        </Svg>
        
        {/* Time display in center */}
        <View style={[styles.timeContainer, { width: size, height: size }]}>
          <Text style={[styles.timeText, { color: timeColor }]}>
            {formatTime(currentTime)}
          </Text>
          <Text style={styles.statusText}>{timeStatus}</Text>
        </View>
      </View>
      
      {/* Bonus points display */}
      <View style={styles.bonusContainer}>
        <Text style={styles.bonusLabel}>Puntos Bonus</Text>
        <Text style={[styles.bonusPoints, { color: timeColor }]}>
          +{bonusPoints}
        </Text>
        <Text style={styles.bonusDescription}>
          {Math.floor(currentTime / 60)} min × 5pts
        </Text>
      </View>
      
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: timeColor,
                width: `${(currentTime / INITIAL_COUNTDOWN) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round((currentTime / INITIAL_COUNTDOWN) * 100)}% restante
        </Text>
      </View>
      
      {/* Time milestones */}
      <View style={styles.milestonesContainer}>
        <View style={[styles.milestone, currentTime > 7200 && styles.milestoneActive]}>
          <Text style={styles.milestoneText}>2h+</Text>
          <View style={[styles.milestoneIndicator, { backgroundColor: '#4CAF50' }]} />
        </View>
        
        <View style={[styles.milestone, currentTime > 3600 && currentTime <= 7200 && styles.milestoneActive]}>
          <Text style={styles.milestoneText}>1-2h</Text>
          <View style={[styles.milestoneIndicator, { backgroundColor: '#FF9800' }]} />
        </View>
        
        <View style={[styles.milestone, currentTime <= 3600 && styles.milestoneActive]}>
          <Text style={styles.milestoneText}>&lt;1h</Text>
          <View style={[styles.milestoneIndicator, { backgroundColor: '#F44336' }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  countdownContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  svgCircle: {
    position: 'absolute',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  readyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  timeContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadowColor: '#00000030',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  bonusContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bonusLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  bonusPoints: {
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: '#00000030',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bonusDescription: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  progressBarContainer: {
    width: width - 60,
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  milestonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width - 60,
    paddingVertical: 10,
  },
  milestone: {
    alignItems: 'center',
    opacity: 0.4,
    flex: 1,
  },
  milestoneActive: {
    opacity: 1,
  },
  milestoneText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  milestoneIndicator: {
    width: 20,
    height: 4,
    borderRadius: 2,
  },
});

export default GlobalCountdown;