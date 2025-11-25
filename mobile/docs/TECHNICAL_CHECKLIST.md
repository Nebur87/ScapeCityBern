# 🔧 Checklist Técnico Completo - ScapeArBern
## Pulido Técnico para Escape Room Urbano (React Native + Express)

---

## 1. 📋 **TIPADO FUERTE - TypeScript**

### ✅ Checklist:
- [ ] Verificar interfaces en `types.ts` están siendo usadas consistentemente
- [ ] Revisar `config.ts` usa tipos correctos de Stop, Puzzle, Reward
- [ ] Confirmar `PuzzleScreen` está correctamente tipado
- [ ] Validar que todos los hooks expongan tipos claros
- [ ] Asegurar que `api.ts` tiene respuestas tipadas

### 🔧 Ejemplos de Código:

#### **types.ts - Interfaces Centralizadas**
```typescript
// Asegurar que todas las interfaces estén exportadas correctamente
export interface Stop {
  id: string;
  name: string;
  coords: { lat: number; lng: number };
  puzzle: Puzzle;
  reward: Reward;
  description?: string;
  radius?: number;
}

export interface PuzzleResult {
  seal: string;
  points: number;
  timeSpent?: number;
  attempts?: number;
}

// Props tipadas para componentes de puzzle
export interface PuzzleComponentProps {
  stop: Stop;
  userCoords?: { lat: number; lng: number };
  onComplete: (result: PuzzleResult) => void;
  onClose?: () => void;
}
```

#### **config.ts - Tipado Correcto**
```typescript
import { Stop, Puzzle, Reward } from '../types/types';

export const stops: Stop[] = [
  {
    id: 'zytglogge',
    name: 'Zytglogge',
    coords: { lat: 46.9480, lng: 7.4474 },
    puzzle: {
      type: 'vitral' as const,
      solution: 'TIEMPO',
      hint: 'Las agujas del reloj revelan el patrón correcto'
    } satisfies Puzzle,
    reward: {
      seal: 'time',
      points: 150
    } satisfies Reward,
    radius: 30
  }
];

// Helper functions tipadas
export const getStopById = (id: string): Stop | undefined => {
  return stops.find(stop => stop.id === id);
};
```

---

## 2. 🔗 **INTEGRACIÓN DE STORES**

### ✅ Checklist:
- [ ] `useAuth.ts` conectado con `api.ts`
- [ ] `useAdventure.ts` tiene persistencia con AsyncStorage
- [ ] `useProgress.ts` (crear si no existe) maneja progreso de paradas
- [ ] Todos los stores exponen hooks tipados
- [ ] Integración entre stores es consistente

### 🔧 Ejemplos de Código:

#### **useProgress.ts - Store de Progreso (CREAR)**
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../services/api';
import { Stop, PuzzleResult } from '../types/types';

interface ProgressState {
  completedStops: string[];
  currentStop: string | null;
  totalPoints: number;
  sealsCollected: string[];
  isLoading: boolean;
}

interface ProgressActions {
  completeStop: (stopId: string, result: PuzzleResult) => Promise<void>;
  setCurrentStop: (stopId: string) => void;
  resetProgress: () => void;
  syncWithServer: () => Promise<void>;
}

export const useProgressStore = create<ProgressState & ProgressActions>()(
  persist(
    (set, get) => ({
      completedStops: [],
      currentStop: null,
      totalPoints: 0,
      sealsCollected: [],
      isLoading: false,

      completeStop: async (stopId: string, result: PuzzleResult) => {
        set({ isLoading: true });
        
        try {
          // Call API
          await api.completeStop('bern-route', stopId, 0, 0); // Coords from location
          
          // Update local state
          const { completedStops, sealsCollected, totalPoints } = get();
          
          set({
            completedStops: [...completedStops, stopId],
            sealsCollected: [...sealsCollected, result.seal],
            totalPoints: totalPoints + result.points,
            isLoading: false,
          });

        } catch (error) {
          console.error('Failed to complete stop:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      setCurrentStop: (stopId: string) => set({ currentStop: stopId }),
      resetProgress: () => set({
        completedStops: [],
        currentStop: null,
        totalPoints: 0,
        sealsCollected: [],
      }),

      syncWithServer: async () => {
        try {
          const progress = await api.getProgress('bern-route');
          set({
            completedStops: progress.completedStops,
            sealsCollected: progress.seals,
            totalPoints: progress.points,
          });
        } catch (error) {
          console.error('Failed to sync progress:', error);
        }
      },
    }),
    {
      name: 'progress-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Hook tipado
export const useProgress = () => {
  const store = useProgressStore();
  return {
    ...store,
    isStopCompleted: (stopId: string) => store.completedStops.includes(stopId),
    getCompletionPercentage: () => (store.completedStops.length / 10) * 100,
  };
};
```

#### **Integración useAuth.ts mejorada**
```typescript
// En useAuth.ts - añadir integración con otros stores
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    ...store,
    
    // Logout mejorado que limpia todos los stores
    logout: async () => {
      await store.logout();
      
      // Limpiar otros stores
      useProgressStore.getState().resetProgress();
      useAdventureStore.getState().resetAdventure();
    },
  };
};
```

---

## 3. 🧩 **PUZZLESCREEN - Switch Central**

### ✅ Checklist:
- [ ] Switch maneja todos los tipos de puzzle
- [ ] Props están correctamente tipadas
- [ ] onComplete llama a api.completeStop
- [ ] Error handling para puzzles no implementados
- [ ] Loading states durante API calls

### 🔧 Ejemplos de Código:

#### **PuzzleScreen.tsx - Switch Mejorado**
```typescript
import React from 'react';
import { PuzzleComponentProps, PuzzleResult } from '../types/types';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../hooks/useAuth';

// Import all puzzle components
import PuzzleVitral from './puzzles/PuzzleVitral';
import PuzzleCryptogram from './puzzles/PuzzleCryptogram';
import PuzzleCompass from './puzzles/PuzzleCompass';
import PuzzleSequence from './puzzles/PuzzleSequence';
import PuzzleMosaic from './puzzles/PuzzleMosaic';
import PuzzleAROverlay from './puzzles/PuzzleAROverlay';

const PuzzleScreen: React.FC<PuzzleComponentProps> = ({ 
  stop, 
  userCoords, 
  onComplete, 
  onClose 
}) => {
  const { completeStop, isLoading } = useProgress();
  const { isAuthenticated } = useAuth();

  const handleComplete = async (result: PuzzleResult) => {
    if (!isAuthenticated) {
      Alert.alert('Error', 'Debes iniciar sesión para guardar el progreso');
      return;
    }

    try {
      await completeStop(stop.id, result);
      onComplete?.(result);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el progreso. Inténtalo de nuevo.');
    }
  };

  const renderPuzzle = () => {
    const commonProps = {
      stop,
      userCoords,
      onComplete: handleComplete,
      onClose,
    };

    switch (stop.puzzle.type) {
      case 'vitral':
        return <PuzzleVitral {...commonProps} />;
      
      case 'cryptogram':
        return <PuzzleCryptogram {...commonProps} />;
      
      case 'compass':
        return <PuzzleCompass {...commonProps} />;
      
      case 'sequence':
        return <PuzzleSequence {...commonProps} />;
      
      case 'mosaic':
        return <PuzzleMosaic {...commonProps} />;
      
      case 'ar-overlay':
        return <PuzzleAROverlay {...commonProps} />;
      
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Puzzle tipo "{stop.puzzle.type}" no implementado
            </Text>
            <Button title="Volver" onPress={onClose} />
          </View>
        );
    }
  };

  if (isLoading) {
    return <LoadingOverlay message="Guardando progreso..." />;
  }

  return renderPuzzle();
};
```

---

## 4. ⏱️ **CONTADOR GLOBAL - useAdventure**

### ✅ Checklist:
- [ ] `useAdventure.ts` integrado en HomeScreen
- [ ] `GlobalCountdown.tsx` muestra tiempo y puntos
- [ ] `finishAdventure()` calcula bonificación correcta
- [ ] Timer persiste al cerrar/abrir app
- [ ] Integración con Leaderboard

### 🔧 Ejemplos de Código:

#### **HomeScreen.tsx - Integración Completa**
```typescript
import React, { useEffect } from 'react';
import { View, Button, Alert } from 'react-native';
import { useAdventure, startGlobalTimer, initializeAdventure } from '../hooks/useAdventure';
import { useProgress } from '../hooks/useProgress';
import GlobalCountdown from '../components/GlobalCountdown';

const HomeScreen: React.FC = () => {
  const { 
    started, 
    completed, 
    startAdventure, 
    finishAdventure 
  } = useAdventure();
  
  const { 
    completedStops, 
    totalPoints, 
    getCompletionPercentage 
  } = useProgress();

  useEffect(() => {
    initializeAdventure();
  }, []);

  const handleStartAdventure = () => {
    Alert.alert(
      'Iniciar Aventura',
      '¿Estás listo para comenzar el escape room? Tendrás 3 horas para completarlo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Comenzar', 
          onPress: () => {
            startAdventure();
            startGlobalTimer();
          }
        }
      ]
    );
  };

  const handleFinishAdventure = () => {
    const totalPointsWithBonus = finishAdventure(totalPoints);
    
    Alert.alert(
      '¡Aventura Completada!',
      `Puntos finales: ${totalPointsWithBonus}\nPorcentaje completado: ${getCompletionPercentage()}%`,
      [{ text: 'Ver Ranking', onPress: () => navigation.navigate('Leaderboard') }]
    );
  };

  return (
    <View style={styles.container}>
      <GlobalCountdown size={150} strokeWidth={12} />
      
      {!started && (
        <Button 
          title="🚀 Iniciar Aventura" 
          onPress={handleStartAdventure}
        />
      )}
      
      {started && !completed && completedStops.length === 10 && (
        <Button 
          title="🏁 Finalizar Aventura" 
          onPress={handleFinishAdventure}
        />
      )}
      
      <StopsMap />
    </View>
  );
};
```

---

## 5. 🌐 **API - CONEXIÓN BACKEND**

### ✅ Checklist:
- [ ] Todas las funciones API están tipadas
- [ ] JWT se añade automáticamente
- [ ] Error handling robusto
- [ ] Timeout y retry logic
- [ ] Respuestas tipadas con interfaces

### 🔧 Ejemplos de Código:

#### **api.ts - Funciones Tipadas Mejoradas**
```typescript
// Mejorar tipado de respuestas API
interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export const completeStop = async (
  routeSlug: string,
  stopSlug: string,
  userLat: number,
  userLng: number
): Promise<Progress> => {
  try {
    const response = await apiClient.post<APIResponse<Progress>>('/progress/complete', {
      routeSlug,
      stopSlug,
      userLocation: { lat: userLat, lng: userLng },
      completedAt: new Date().toISOString(),
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to complete stop');
    }

    return response.data.data;
  } catch (error) {
    console.error(`Failed to complete stop ${stopSlug}:`, error);
    
    // Specific error handling
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error('Ubicación inválida para esta parada');
      }
      if (error.response?.status === 409) {
        throw new Error('Esta parada ya fue completada');
      }
    }
    
    throw error;
  }
};

// Interceptor mejorado para JWT
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log para debugging
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
    });
    
    return config;
  }
);
```

---

## 6. 🐳 **INFRAESTRUCTURA - Docker & Backend**

### ✅ Checklist:
- [ ] Docker Compose configurado correctamente
- [ ] Backend expone endpoints necesarios
- [ ] PostgreSQL con schemas correctos
- [ ] Redis para cache/sessions
- [ ] Variables de entorno documentadas

### 🔧 Ejemplos de Código:

#### **docker-compose.yml - Stack Completo**
```yaml
version: '3.8'

services:
  # Backend Express
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/scapearben
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-super-secret-key
    depends_on:
      - db
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  # PostgreSQL Database
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=scapearben
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  # Redis Cache
  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

#### **Backend Endpoints - Express Routes**
```typescript
// backend/routes/progress.ts
import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// POST /api/progress/complete
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { routeSlug, stopSlug, userLocation } = req.body;
    const userId = req.user.id;

    // Validate geolocation
    const stop = await Stop.findOne({ slug: stopSlug });
    const distance = calculateDistance(userLocation, stop.coords);
    
    if (distance > stop.radius) {
      return res.status(400).json({
        success: false,
        message: 'Fuera del área de la parada'
      });
    }

    // Save progress
    const progress = await Progress.create({
      userId,
      stopId: stop.id,
      completedAt: new Date(),
      points: stop.reward.points
    });

    res.json({
      success: true,
      data: {
        id: progress.id,
        completedStops: await getUserCompletedStops(userId),
        seals: await getUserSeals(userId),
        points: await getUserTotalPoints(userId)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
```

---

## 7. 🎨 **UI/UX - CONSISTENCIA VISUAL**

### ✅ Checklist:
- [ ] Gradientes consistentes en todos los puzzles
- [ ] Animaciones fluidas y coherentes
- [ ] Feedback visual claro (loading, success, error)
- [ ] `GlobalCountdown` con colores dinámicos
- [ ] Tema de colores unificado

### 🔧 Ejemplos de Código:

#### **theme.ts - Tema Unificado (CREAR)**
```typescript
export const theme = {
  colors: {
    primary: '#FFD700',      // Dorado
    secondary: '#8B5A2B',    // Marrón
    success: '#4CAF50',      // Verde
    warning: '#FF9800',      // Amarillo
    danger: '#F44336',       // Rojo
    background: {
      dark: '#1a1a2e',
      medium: '#16213e',
      light: '#0f0f23',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#FFFFFF90',
      muted: '#FFFFFF70',
    }
  },
  
  gradients: {
    puzzle: ['#1a1a2e', '#16213e', '#0f0f23'],
    success: ['#4CAF5020', '#4CAF5010'],
    warning: ['#FF980020', '#FF980010'],
    danger: ['#F4433620', '#F4433610'],
  },

  animations: {
    timing: {
      fast: 300,
      normal: 500,
      slow: 1000,
    },
    easing: {
      bounce: 'spring',
      smooth: 'ease-in-out',
    }
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  }
};
```

#### **Componente Base - PuzzleWrapper**
```typescript
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../config/theme';

interface PuzzleWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const PuzzleWrapper: React.FC<PuzzleWrapperProps> = ({ 
  children, 
  title, 
  subtitle 
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient 
        colors={theme.gradients.puzzle} 
        style={styles.background}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
        
        {children}
      </LinearGradient>
    </SafeAreaView>
  );
};

// Usar en todos los puzzles
const PuzzleVitral = ({ stop, onComplete }: PuzzleComponentProps) => {
  return (
    <PuzzleWrapper 
      title="Restauración del Vitral"
      subtitle={stop.description}
    >
      {/* Contenido del puzzle */}
    </PuzzleWrapper>
  );
};
```

---

## 🚀 **PLAN DE IMPLEMENTACIÓN**

### Fase 1 - Tipado y Stores (Día 1-2)
1. ✅ Revisar y corregir `types.ts`
2. ✅ Crear `useProgress.ts`
3. ✅ Integrar stores entre sí
4. ✅ Tipar todas las respuestas API

### Fase 2 - Puzzles y UI (Día 3-4)
1. ✅ Mejorar `PuzzleScreen.tsx`
2. ✅ Crear `theme.ts` unificado
3. ✅ Implementar `PuzzleWrapper`
4. ✅ Pulir `GlobalCountdown.tsx`

### Fase 3 - Backend y Testing (Día 5-6)
1. ✅ Configurar Docker Compose
2. ✅ Implementar endpoints faltantes
3. ✅ Testing de integración
4. ✅ Optimización de performance

### Fase 4 - Deploy y Documentación (Día 7)
1. ✅ Deploy en VPS
2. ✅ Documentación API
3. ✅ Testing en dispositivos reales
4. ✅ Optimización final

---

## 📋 **TESTING CHECKLIST**

- [ ] Login/Register funcionando
- [ ] Timer global persiste correctamente
- [ ] Todos los puzzles cargan sin errores
- [ ] API guarda progreso correctamente
- [ ] Geolocalización funciona en cada parada
- [ ] Leaderboard muestra datos correctos
- [ ] Animaciones fluidas en todos los dispositivos
- [ ] Manejo de errores robusto
- [ ] Performance óptima (< 3s de carga)
- [ ] Compatible con Android/iOS

¡Este checklist te dará una aplicación de escape room robusta, bien tipada y con excelente UX! 🎮✨