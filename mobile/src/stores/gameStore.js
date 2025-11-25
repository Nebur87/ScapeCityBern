import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Estado del jugador
      playerName: null,
      score: 0,
      level: 1,
      
      // Estado de los puzzles
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
      
      // Acciones de puzzles
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