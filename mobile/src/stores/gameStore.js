import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNextStop, validateStop, getUnlockedStops } from '../config/gameConfig';

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Estado del jugador
      playerName: null,
      score: 0,
      level: 1,
      
      // Sistema de paradas y sellos
      currentStopId: null,
      completedStops: [],
      unlockedStops: ['stop-1'], // Primer nivel desbloqueado
      collectedSeals: [],
      
      // Estado de los puzzles (legacy - mantenido para compatibilidad)
      currentPuzzleId: null,
      completedPuzzles: [],
      puzzleAttempts: {},
      
      // Configuración
      soundEnabled: true,
      notificationsEnabled: true,
      
      // Acciones del jugador
      setPlayerName: (name) => set({ playerName: name }),
      
      // Acciones de puntuación
      addScore: (points) => set((state) => ({ 
        score: state.score + points 
      })),
      
      resetScore: () => set({ score: 0 }),
      
      // Acciones del sistema de paradas
      setCurrentStop: (stopId) => set({ currentStopId: stopId }),
      
      completeStop: (stopId, reward) => set((state) => {
        const newCompletedStops = [...new Set([...state.completedStops, stopId])];
        const newCollectedSeals = [...new Set([...state.collectedSeals, reward.seal])];
        const newUnlockedStops = getUnlockedStops(newCompletedStops);
        const nextStop = getNextStop(stopId);
        
        return {
          completedStops: newCompletedStops,
          collectedSeals: newCollectedSeals,
          unlockedStops: newUnlockedStops,
          score: state.score + reward.points,
          currentStopId: nextStop ? nextStop.id : null,
        };
      }),
      
      // Acciones de puzzles (legacy - mantenido para compatibilidad)
      setCurrentPuzzle: (puzzleId) => set({ currentPuzzleId: puzzleId }),
      
      completePuzzle: (puzzleId, points = 10) => set((state) => ({
        completedPuzzles: [...new Set([...state.completedPuzzles, puzzleId])],
        score: state.score + points,
        currentPuzzleId: null,
      })),
      
      addPuzzleAttempt: (puzzleId) => set((state) => ({
        puzzleAttempts: {
          ...state.puzzleAttempts,
          [puzzleId]: (state.puzzleAttempts[puzzleId] || 0) + 1,
        },
      })),
      
      // Configuración
      toggleSound: () => set((state) => ({ 
        soundEnabled: !state.soundEnabled 
      })),
      
      toggleNotifications: () => set((state) => ({ 
        notificationsEnabled: !state.notificationsEnabled 
      })),
      
      // Reset general
      resetGame: () => set({
        score: 0,
        level: 1,
        currentStopId: null,
        completedStops: [],
        unlockedStops: ['stop-1'],
        collectedSeals: [],
        currentPuzzleId: null,
        completedPuzzles: [],
        puzzleAttempts: {},
      }),
    }),
    {
      name: 'scapear-game-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);