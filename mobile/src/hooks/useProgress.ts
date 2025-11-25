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
  lastSyncTime: string | null;
}

interface ProgressActions {
  completeStop: (stopId: string, result: PuzzleResult, userCoords?: { lat: number; lng: number }) => Promise<void>;
  setCurrentStop: (stopId: string) => void;
  resetProgress: () => void;
  syncWithServer: () => Promise<void>;
  getCompletionPercentage: () => number;
  isStopCompleted: (stopId: string) => boolean;
}

interface ProgressStore extends ProgressState, ProgressActions {}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      // Initial state
      completedStops: [],
      currentStop: null,
      totalPoints: 0,
      sealsCollected: [],
      isLoading: false,
      lastSyncTime: null,

      // Actions
      completeStop: async (stopId: string, result: PuzzleResult, userCoords?) => {
        set({ isLoading: true });
        
        try {
          console.log(`Completing stop: ${stopId}`, result);
          
          // Call API if coordinates available
          if (userCoords) {
            await api.completeStop('bern-route', stopId, userCoords.lat, userCoords.lng);
          }
          
          // Update local state
          const { completedStops, sealsCollected, totalPoints } = get();
          
          if (!completedStops.includes(stopId)) {
            set({
              completedStops: [...completedStops, stopId],
              sealsCollected: [...sealsCollected, result.seal],
              totalPoints: totalPoints + result.points,
              lastSyncTime: new Date().toISOString(),
              isLoading: false,
            });
            
            console.log(`Stop ${stopId} completed successfully`);
          } else {
            console.warn(`Stop ${stopId} already completed`);
            set({ isLoading: false });
          }

        } catch (error) {
          console.error('Failed to complete stop:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      setCurrentStop: (stopId: string) => {
        console.log(`Setting current stop to: ${stopId}`);
        set({ currentStop: stopId });
      },

      resetProgress: () => {
        console.log('Resetting progress');
        set({
          completedStops: [],
          currentStop: null,
          totalPoints: 0,
          sealsCollected: [],
          lastSyncTime: null,
        });
      },

      syncWithServer: async () => {
        try {
          console.log('Syncing progress with server');
          const progress = await api.getProgress('bern-route');
          
          set({
            completedStops: progress.completedStops,
            sealsCollected: progress.seals,
            totalPoints: progress.points,
            lastSyncTime: new Date().toISOString(),
          });
          
          console.log('Progress synced successfully');
        } catch (error) {
          console.error('Failed to sync progress:', error);
        }
      },

      getCompletionPercentage: () => {
        const { completedStops } = get();
        return (completedStops.length / 10) * 100; // 10 total stops
      },

      isStopCompleted: (stopId: string) => {
        const { completedStops } = get();
        return completedStops.includes(stopId);
      },
    }),
    {
      name: 'progress-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        completedStops: state.completedStops,
        totalPoints: state.totalPoints,
        sealsCollected: state.sealsCollected,
        currentStop: state.currentStop,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);

// Main hook
export const useProgress = () => {
  const store = useProgressStore();
  
  return {
    // State
    completedStops: store.completedStops,
    currentStop: store.currentStop,
    totalPoints: store.totalPoints,
    sealsCollected: store.sealsCollected,
    isLoading: store.isLoading,
    lastSyncTime: store.lastSyncTime,
    
    // Computed
    completionPercentage: store.getCompletionPercentage(),
    totalStopsCompleted: store.completedStops.length,
    canProgress: store.completedStops.length < 10,
    
    // Actions
    completeStop: store.completeStop,
    setCurrentStop: store.setCurrentStop,
    resetProgress: store.resetProgress,
    syncWithServer: store.syncWithServer,
    isStopCompleted: store.isStopCompleted,
  };
};

// Selector hooks
export const useProgressStats = () => useProgressStore((state) => ({
  completedStops: state.completedStops.length,
  totalPoints: state.totalPoints,
  sealsCollected: state.sealsCollected.length,
  completionPercentage: state.getCompletionPercentage(),
}));

export const useProgressActions = () => useProgressStore((state) => ({
  completeStop: state.completeStop,
  setCurrentStop: state.setCurrentStop,
  resetProgress: state.resetProgress,
  syncWithServer: state.syncWithServer,
}));

export default useProgressStore;