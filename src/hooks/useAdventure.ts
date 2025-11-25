import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Adventure store state interface
interface AdventureState {
  started: boolean;
  countdown: number;        // segundos restantes
  pointsBonus: number;      // puntos extra por tiempo
  completed: boolean;
  startTime: string | null; // timestamp de inicio
  endTime: string | null;   // timestamp de finalización
  isInitialized: boolean;
}

// Adventure store actions interface
interface AdventureActions {
  startAdventure: () => void;
  tick: () => void;
  finishAdventure: (basePoints: number) => number;
  resetAdventure: () => void;
  pauseAdventure: () => void;
  resumeAdventure: () => void;
  initialize: () => Promise<void>;
  getTimeRemaining: () => { hours: number; minutes: number; seconds: number };
  getFormattedTime: () => string;
}

// Combined store interface
interface AdventureStore extends AdventureState, AdventureActions {}

// Constants
const INITIAL_COUNTDOWN = 10800; // 3 horas = 10800 segundos
const POINTS_PER_MINUTE = 5;     // 5 puntos por minuto restante

// Create the adventure store with Zustand
export const useAdventureStore = create<AdventureStore>()(
  persist(
    (set, get) => ({
      // Initial state
      started: false,
      countdown: INITIAL_COUNTDOWN,
      pointsBonus: 0,
      completed: false,
      startTime: null,
      endTime: null,
      isInitialized: false,

      // Actions
      startAdventure: (): void => {
        const now = new Date().toISOString();
        
        console.log('🚀 Starting adventure with 3-hour countdown');
        
        set({
          started: true,
          countdown: INITIAL_COUNTDOWN,
          completed: false,
          pointsBonus: 0,
          startTime: now,
          endTime: null,
        });

        console.log('✅ Adventure started at:', now);
      },

      tick: (): void => {
        const state = get();
        
        if (!state.started || state.completed || state.countdown <= 0) {
          return;
        }

        const newCountdown = Math.max(0, state.countdown - 1);
        
        set({ countdown: newCountdown });

        // Auto-complete if time runs out
        if (newCountdown === 0) {
          console.log('Time is up! Auto-completing adventure');
          const { finishAdventure } = get();
          finishAdventure(0); // 0 base points if time runs out
        }
      },

      finishAdventure: (basePoints: number): number => {
        const state = get();
        
        if (!state.started || state.completed) {
          console.warn('Cannot finish adventure: not started or already completed');
          return basePoints;
        }

        const now = new Date().toISOString();
        
        // Calculate bonus points: 5 points per minute remaining
        const minutesRemaining = Math.floor(state.countdown / 60);
        const pointsBonus = minutesRemaining * POINTS_PER_MINUTE;
        const totalPoints = basePoints + pointsBonus;

        console.log('🏁 Finishing adventure:', {
          basePoints,
          minutesRemaining,
          pointsBonus,
          totalPoints,
        });

        set({
          completed: true,
          pointsBonus,
          endTime: now,
        });

        console.log('✅ Adventure completed at:', now);
        
        return totalPoints;
      },

      resetAdventure: (): void => {
        console.log('🔄 Resetting adventure to initial state');
        
        set({
          started: false,
          countdown: INITIAL_COUNTDOWN,
          pointsBonus: 0,
          completed: false,
          startTime: null,
          endTime: null,
        });

        console.log('✅ Adventure reset completed');
      },

      pauseAdventure: (): void => {
        // Note: This doesn't actually pause the timer since tick() checks started state
        // But it's here for potential future use with external timer management
        console.log('Adventure paused (timer will stop)');
      },

      resumeAdventure: (): void => {
        console.log('Adventure resumed (timer will continue)');
      },

      initialize: async (): Promise<void> => {
        if (get().isInitialized) {
          return;
        }

        console.log('🚀 Initializing adventure store');
        
        try {
          const state = get();
          
          // If adventure was started but not completed, validate timing
          if (state.started && !state.completed && state.startTime) {
            const startTime = new Date(state.startTime);
            const now = new Date();
            const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
            const remainingSeconds = Math.max(0, INITIAL_COUNTDOWN - elapsedSeconds);
            
            if (remainingSeconds <= 0) {
              console.log('Adventure time expired while app was closed');
              // Auto-complete with 0 points
              set({
                countdown: 0,
                completed: true,
                pointsBonus: 0,
                endTime: now.toISOString(),
              });
            } else {
              console.log(`Adjusting countdown: ${remainingSeconds} seconds remaining`);
              set({ countdown: remainingSeconds });
            }
          }

          set({ isInitialized: true });
          console.log('✅ Adventure store initialized');

        } catch (error) {
          console.error('❌ Adventure initialization failed:', error);
          set({ isInitialized: true });
        }
      },

      getTimeRemaining: () => {
        const { countdown } = get();
        
        const hours = Math.floor(countdown / 3600);
        const minutes = Math.floor((countdown % 3600) / 60);
        const seconds = countdown % 60;
        
        return { hours, minutes, seconds };
      },

      getFormattedTime: (): string => {
        const { getTimeRemaining } = get();
        const { hours, minutes, seconds } = getTimeRemaining();
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      },
    }),
    {
      name: 'adventure-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist all relevant state
      partialize: (state) => ({
        started: state.started,
        countdown: state.countdown,
        pointsBonus: state.pointsBonus,
        completed: state.completed,
        startTime: state.startTime,
        endTime: state.endTime,
      }),
      // Handle rehydration
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('❌ Adventure store rehydration failed:', error);
        } else {
          console.log('💾 Adventure store rehydrated');
          
          // Initialize after rehydration
          if (state) {
            state.initialize();
          }
        }
      },
    }
  )
);

// Derived selectors for common use cases
export const useAdventure = () => {
  const store = useAdventureStore();
  
  return {
    // State
    started: store.started,
    countdown: store.countdown,
    pointsBonus: store.pointsBonus,
    completed: store.completed,
    isInitialized: store.isInitialized,
    
    // Computed values
    isActive: store.started && !store.completed && store.countdown > 0,
    timeRemaining: store.getTimeRemaining(),
    formattedTime: store.getFormattedTime(),
    hasTimeLeft: store.countdown > 0,
    progressPercentage: ((INITIAL_COUNTDOWN - store.countdown) / INITIAL_COUNTDOWN) * 100,
    
    // Actions
    startAdventure: store.startAdventure,
    tick: store.tick,
    finishAdventure: store.finishAdventure,
    resetAdventure: store.resetAdventure,
    pauseAdventure: store.pauseAdventure,
    resumeAdventure: store.resumeAdventure,
    initialize: store.initialize,
  };
};

// Selector hooks for specific parts of state
export const useAdventureStatus = () => useAdventureStore((state) => ({
  started: state.started,
  completed: state.completed,
  isActive: state.started && !state.completed && state.countdown > 0,
}));

export const useAdventureTimer = () => useAdventureStore((state) => ({
  countdown: state.countdown,
  formattedTime: state.getFormattedTime(),
  timeRemaining: state.getTimeRemaining(),
  hasTimeLeft: state.countdown > 0,
}));

export const useAdventurePoints = () => useAdventureStore((state) => ({
  pointsBonus: state.pointsBonus,
  potentialBonus: Math.floor(state.countdown / 60) * POINTS_PER_MINUTE,
}));

// Action hooks
export const useAdventureActions = () => useAdventureStore((state) => ({
  startAdventure: state.startAdventure,
  tick: state.tick,
  finishAdventure: state.finishAdventure,
  resetAdventure: state.resetAdventure,
  initialize: state.initialize,
}));

// Global timer management
let globalTimer: NodeJS.Timeout | null = null;

export const startGlobalTimer = (): void => {
  if (globalTimer) {
    clearInterval(globalTimer);
  }
  
  console.log('Starting global adventure timer');
  
  globalTimer = setInterval(() => {
    const { tick, started, completed } = useAdventureStore.getState();
    
    if (started && !completed) {
      tick();
    }
  }, 1000); // Every second
};

export const stopGlobalTimer = (): void => {
  if (globalTimer) {
    console.log('Stopping global adventure timer');
    clearInterval(globalTimer);
    globalTimer = null;
  }
};

// Utility function to initialize adventure on app startup
export const initializeAdventure = async (): Promise<void> => {
  const { initialize } = useAdventureStore.getState();
  await initialize();
  
  // Start global timer if adventure is active
  const { started, completed } = useAdventureStore.getState();
  if (started && !completed) {
    startGlobalTimer();
  }
};

// Calculate time bonus for display purposes
export const calculateTimeBonus = (secondsRemaining: number): number => {
  const minutesRemaining = Math.floor(secondsRemaining / 60);
  return minutesRemaining * POINTS_PER_MINUTE;
};

// Format duration for display
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Export constants for external use
export { INITIAL_COUNTDOWN, POINTS_PER_MINUTE };

// Export the store for direct access if needed
export default useAdventureStore;