import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Camera from 'expo-camera';

const { width, height } = Dimensions.get('window');

interface Coords {
  latitude: number;
  longitude: number;
}

interface PuzzleData {
  targetMarker: string;
  arScene?: string;
  hint?: string;
}

interface PuzzleAROverlayProps {
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

const PuzzleAROverlay: React.FC<PuzzleAROverlayProps> = ({
  userCoords,
  stopCoords,
  radius,
  stop,
  onComplete,
  onClose,
}) => {
  const [isWithinRadius, setIsWithinRadius] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [markerDetected, setMarkerDetected] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [scanProgress, setScanProgress] = useState(0);

  // Configuración del puzzle
  const targetMarker = stop.puzzle.targetMarker || 'bern-archive';

  // Referencias
  const webViewRef = useRef<WebView>(null);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // Solicitar permisos de cámara
    requestCameraPermission();
    setStartTime(Date.now());

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

    // Animación de escaneo continua
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    scanAnimation.start();

    // Animación de pulso para indicadores
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

    return () => {
      scanAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  // HTML para la escena AR.js
  const arHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AR Scanner - Bern Archive</title>
        <script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
        <script src="https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.5/aframe/build/aframe-ar.js"></script>
        <style>
            body {
                margin: 0;
                font-family: Arial, sans-serif;
                background: #000;
                overflow: hidden;
            }
            .ar-overlay {
                position: absolute;
                top: 20px;
                left: 20px;
                right: 20px;
                z-index: 1000;
                color: white;
                text-align: center;
                background: rgba(0,0,0,0.7);
                padding: 10px;
                border-radius: 10px;
            }
            .scan-indicator {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 200px;
                height: 200px;
                border: 2px solid #FFD700;
                border-radius: 10px;
                z-index: 999;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
                100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
            }
            .corner {
                position: absolute;
                width: 20px;
                height: 20px;
                border: 3px solid #FFD700;
            }
            .corner.top-left { top: 0; left: 0; border-right: none; border-bottom: none; }
            .corner.top-right { top: 0; right: 0; border-left: none; border-bottom: none; }
            .corner.bottom-left { bottom: 0; left: 0; border-right: none; border-top: none; }
            .corner.bottom-right { bottom: 0; right: 0; border-left: none; border-top: none; }
            
            .detection-success {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 255, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                font-size: 18px;
                font-weight: bold;
                display: none;
                z-index: 1001;
            }
        </style>
    </head>
    <body>
        <div class="ar-overlay">
            <h3>🏛️ Archivo Secreto de Berna</h3>
            <p>Enfoca el marcador del archivo para revelar el símbolo oculto</p>
        </div>
        
        <div class="scan-indicator">
            <div class="corner top-left"></div>
            <div class="corner top-right"></div>
            <div class="corner bottom-left"></div>
            <div class="corner bottom-right"></div>
        </div>
        
        <div id="detection-success" class="detection-success">
            ✅ ¡Símbolo Detectado!<br>
            Archivo Desbloqueado
        </div>

        <a-scene 
            vr-mode-ui="enabled: false" 
            arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
            embedded
            style="height: 100vh; width: 100vw;">
            
            <!-- Cámara AR -->
            <a-camera gps-camera rotation-reader></a-camera>
            
            <!-- Marcador del archivo -->
            <a-marker 
                id="archive-marker"
                preset="custom" 
                type="pattern" 
                url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                smooth="true"
                smoothCount="10"
                smoothTolerance="0.01"
                smoothThreshold="5">
                
                <!-- Símbolo 3D del archivo -->
                <a-box 
                    position="0 0.5 0" 
                    rotation="0 45 0"
                    scale="0.8 0.8 0.8"
                    color="#FFD700"
                    animation="property: rotation; to: 0 405 0; loop: true; dur: 3000; easing: linear;">
                </a-box>
                
                <!-- Texto flotante -->
                <a-text 
                    value="ARCHIVO\nSECRETO" 
                    position="0 1.5 0" 
                    align="center"
                    color="#FFD700"
                    scale="2 2 2"
                    animation="property: position; to: 0 2 0; dir: alternate; dur: 2000; loop: true; easing: easeInOutSine;">
                </a-text>
                
                <!-- Partículas doradas -->
                <a-sphere 
                    position="1 0.5 0" 
                    radius="0.1" 
                    color="#FFD700" 
                    opacity="0.7"
                    animation="property: position; to: -1 2 0; dur: 2000; loop: true; easing: linear;">
                </a-sphere>
                <a-sphere 
                    position="-1 0.5 0" 
                    radius="0.1" 
                    color="#FFD700" 
                    opacity="0.7"
                    animation="property: position; to: 1 2 0; dur: 2500; loop: true; easing: linear;">
                </a-sphere>
                
            </a-marker>
        </a-scene>

        <script>
            let markerDetected = false;
            let detectionTimer = null;
            
            // Detectar cuando el marcador es encontrado
            const marker = document.querySelector('#archive-marker');
            
            marker.addEventListener('markerFound', function() {
                if (!markerDetected) {
                    console.log('Marker detected: ${targetMarker}');
                    markerDetected = true;
                    
                    // Mostrar indicador de éxito
                    document.getElementById('detection-success').style.display = 'block';
                    
                    // Ocultar indicador de escaneo
                    document.querySelector('.scan-indicator').style.display = 'none';
                    
                    // Enviar mensaje a React Native después de 2 segundos
                    setTimeout(() => {
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'markerDetected',
                                marker: '${targetMarker}',
                                timestamp: Date.now()
                            }));
                        }
                    }, 2000);
                }
            });
            
            marker.addEventListener('markerLost', function() {
                console.log('Marker lost');
                document.getElementById('detection-success').style.display = 'none';
                document.querySelector('.scan-indicator').style.display = 'block';
            });
            
            // Simulación para modo desarrollo (sin cámara real)
            if (window.location.search.includes('dev=true')) {
                setTimeout(() => {
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'markerDetected',
                            marker: '${targetMarker}',
                            timestamp: Date.now(),
                            simulation: true
                        }));
                    }
                }, 5000); // Auto-trigger después de 5 segundos en modo dev
            }
        </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'markerDetected' && data.marker === targetMarker) {
        setMarkerDetected(true);
        completePuzzle();
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const completePuzzle = () => {
    if (isCompleted) return;
    
    setIsCompleted(true);
    const timeSpent = Date.now() - startTime;
    const timeBonus = Math.max(0, 120000 - timeSpent); // Bonus por tiempo (2 minutos máximo)
    const basePoints = 200;
    const totalPoints = Math.round(basePoints + (timeBonus / 1000));

    // Animación de éxito
    Animated.parallel([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 800,
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
        '📚 ¡Archivo Desbloqueado!',
        `Has revelado el símbolo secreto del archivo histórico de Berna.\n\nMarcador detectado: ${targetMarker}\nTiempo: ${Math.round(timeSpent / 1000)}s\nPuntos: ${totalPoints}`,
        [
          {
            text: 'Continuar',
            onPress: () => onComplete({ seal: 'archive', points: Math.max(150, totalPoints) }),
          },
        ]
      );
    }, 1000);
  };

  const simulateDetection = () => {
    Alert.alert(
      '🔬 Modo Simulación',
      '¿Quieres simular la detección del marcador para probar el puzzle?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Simular',
          onPress: () => {
            setMarkerDetected(true);
            completePuzzle();
          },
        },
      ]
    );
  };

  if (!isWithinRadius) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.background}>
          <View style={styles.geofenceContainer}>
            <Ionicons name="location-outline" size={80} color="#FFD700" />
            <Text style={styles.geofenceTitle}>Acércate al Archivo Histórico</Text>
            <Text style={styles.geofenceText}>
              Necesitas estar cerca del archivo municipal para acceder a los documentos secretos mediante realidad aumentada.
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

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.background}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Solicitando permisos de cámara...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.background}>
          <View style={styles.errorContainer}>
            <Ionicons name="camera-outline" size={80} color="#FF6B6B" />
            <Text style={styles.errorTitle}>Cámara Requerida</Text>
            <Text style={styles.errorText}>
              Este puzzle requiere acceso a la cámara para funcionar con realidad aumentada.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={requestCameraPermission}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={styles.background}>
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
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFD700" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.title}>Archivo AR</Text>
              <Text style={styles.subtitle}>Realidad Aumentada</Text>
            </View>
            <TouchableOpacity onPress={simulateDetection} style={styles.helpButton}>
              <Ionicons name="help-circle" size={24} color="#FFD700" />
            </TouchableOpacity>
          </View>

          {/* Status Indicator */}
          <Animated.View
            style={[
              styles.statusContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={[styles.statusIndicator, markerDetected && styles.statusSuccess]}>
              <Ionicons 
                name={markerDetected ? "checkmark-circle" : "scan"} 
                size={20} 
                color={markerDetected ? "#00FF00" : "#FFD700"} 
              />
              <Text style={[styles.statusText, markerDetected && styles.statusTextSuccess]}>
                {markerDetected ? '¡Marcador Detectado!' : 'Buscando marcador AR...'}
              </Text>
            </View>
          </Animated.View>

          {/* AR WebView */}
          <View style={styles.arContainer}>
            <WebView
              ref={webViewRef}
              source={{ 
                html: arHTML + (userCoords ? '' : '?dev=true') // Modo dev si no hay coords
              }}
              style={styles.webView}
              onMessage={handleWebViewMessage}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="large" color="#FFD700" />
                  <Text style={styles.loadingText}>Iniciando cámara AR...</Text>
                </View>
              )}
            />

            {/* Scan Overlay */}
            <Animated.View
              style={[
                styles.scanOverlay,
                {
                  opacity: scanAnim,
                },
              ]}
            >
              <View style={styles.scanLine} />
            </Animated.View>
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
              colors={['#FFD70030', '#FFD70020']}
              style={styles.successBackground}
            >
              <Ionicons name="document-text" size={80} color="#FFD700" />
              <Text style={styles.successText}>¡Archivo Desbloqueado!</Text>
            </LinearGradient>
          </Animated.View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>
              <Ionicons name="information-circle" size={16} color="#FFD700" /> Instrucciones
            </Text>
            <Text style={styles.instructionsText}>
              {stop.puzzle.hint || 
                'Enfoca con la cámara el marcador del archivo histórico. Cuando sea detectado, aparecerá un símbolo 3D dorado con información secreta.'
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  helpButton: {
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
  arContainer: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#FFD70030',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  scanLine: {
    width: '80%',
    height: 2,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
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
    borderColor: '#FFD700',
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 16,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF15',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF80',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FFFFFF90',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
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

export default PuzzleAROverlay;