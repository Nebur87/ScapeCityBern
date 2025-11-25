// Central type definitions for the urban escape room application
// "El Secreto de la Ciudad de los Osos" - Bern, Switzerland

/**
 * Reward interface - Defines the reward system for completing puzzles
 */
export interface Reward {
  seal: string;        // Thematic seal name (e.g., "time", "light", "justice")
  points: number;      // Points awarded for completion
}

/**
 * Puzzle interface - Defines all possible puzzle configurations
 */
export interface Puzzle {
  type: "vitral" | "cryptogram" | "compass" | "sequence" | "mosaic" | "ar-overlay" | "decision" | "exchange" | "audio" | "trivia";
  solution?: string;       // For text/cryptogram puzzles (e.g., "TIEMPO", "JUSTICIA")
  targetAngle?: number;    // For compass puzzles (degrees, 0-360)
  pattern?: string[];      // For sequence puzzles (e.g., ["red", "blue", "green"])
  hint?: string;           // Optional hint text for the puzzle
  targetMarker?: string;   // For AR puzzles - marker identifier
  difficulty?: 'easy' | 'medium' | 'hard'; // Optional difficulty level
  timeLimit?: number;      // Optional time limit in seconds
}

/**
 * Geographic coordinates interface
 */
export interface Coords {
  lat: number;   // Latitude (decimal degrees)
  lng: number;   // Longitude (decimal degrees)
}

/**
 * Stop interface - Represents a location/checkpoint in the escape room route
 */
export interface Stop {
  id: string;              // Unique identifier (e.g., "zytglogge", "cathedral-munster")
  name: string;            // Display name of the location
  coords: Coords;          // GPS coordinates
  puzzle: Puzzle;          // Associated puzzle configuration
  reward: Reward;          // Reward for completing the puzzle
  description?: string;    // Optional description of the location
  radius?: number;         // Geofence radius in meters (default: 50m)
  imageUrl?: string;       // Optional image URL for the location
  unlockConditions?: string[]; // Optional - IDs of stops that must be completed first
}

/**
 * User progress tracking interface
 */
export interface UserProgress {
  userId: string;
  completedStops: string[];     // Array of completed stop IDs
  currentStop?: string;         // Currently active stop ID
  totalPoints: number;          // Total points accumulated
  sealsCollected: string[];     // Array of collected seal names
  startTime?: string;           // ISO timestamp when route was started
  completionTime?: string;      // ISO timestamp when route was completed
  lastUpdated: string;          // ISO timestamp of last update
}

/**
 * Puzzle completion result interface
 */
export interface PuzzleResult {
  seal: string;            // Seal earned
  points: number;          // Points earned
  timeSpent?: number;      // Time spent in milliseconds
  attempts?: number;       // Number of attempts made
  accuracy?: number;       // Accuracy percentage (0-100)
  bonusPoints?: number;    // Additional bonus points
}

/**
 * Route information interface
 */
export interface RouteInfo {
  id: string;              // Route identifier
  name: string;            // Route display name
  description: string;     // Route description
  city: string;            // City where route takes place
  country: string;         // Country code (e.g., "CH" for Switzerland)
  totalStops: number;      // Number of stops in the route
  totalPoints: number;     // Maximum possible points
  estimatedDuration: string; // Estimated completion time
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // Route difficulty
  version: string;         // Route version for updates
}

/**
 * User authentication interface
 */
export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
}

/**
 * API response wrapper interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Leaderboard entry interface
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName?: string;
  avatar?: string;
  totalPoints: number;
  completedStops: number;
  completionTime?: string;
  completionDuration?: number; // Duration in milliseconds
}

/**
 * Game session interface
 */
export interface GameSession {
  sessionId: string;
  userId: string;
  routeId: string;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  startTime: string;
  endTime?: string;
  currentStopId?: string;
  progress: UserProgress;
  settings: {
    soundEnabled: boolean;
    hintsEnabled: boolean;
    geofenceStrict: boolean;
    developmentMode: boolean;
  };
}

/**
 * App configuration interface
 */
export interface AppConfig {
  apiBaseUrl: string;
  mapConfig: {
    defaultZoom: number;
    minZoom: number;
    maxZoom: number;
    defaultCenter: Coords;
  };
  gameSettings: {
    defaultGeofenceRadius: number;
    maxTimePerPuzzle: number;
    pointsDecayRate: number;
    hintPenalty: number;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColors: string[];
  };
}

/**
 * Navigation props type for route screens
 */
export interface RouteScreenProps {
  stop: Stop;
  userCoords?: Coords;
  onComplete?: (result: PuzzleResult) => void;
  onClose?: () => void;
}

/**
 * Utility type for puzzle component props
 */
export interface PuzzleComponentProps extends RouteScreenProps {
  stopCoords: Coords;
  radius: number;
}

// Type guards for runtime type checking
export const isPuzzleResult = (obj: any): obj is PuzzleResult => {
  return obj && typeof obj.seal === 'string' && typeof obj.points === 'number';
};

export const isStop = (obj: any): obj is Stop => {
  return obj && 
         typeof obj.id === 'string' && 
         typeof obj.name === 'string' && 
         obj.coords && 
         typeof obj.coords.lat === 'number' && 
         typeof obj.coords.lng === 'number' &&
         obj.puzzle && 
         obj.reward;
};

export const isCoords = (obj: any): obj is Coords => {
  return obj && 
         typeof obj.lat === 'number' && 
         typeof obj.lng === 'number' &&
         obj.lat >= -90 && obj.lat <= 90 &&
         obj.lng >= -180 && obj.lng <= 180;
};

// Utility types for advanced TypeScript usage
export type PuzzleType = Puzzle['type'];
export type StopId = Stop['id'];
export type SealName = Reward['seal'];

// Union type for all possible puzzle solutions
export type PuzzleSolution = string | number | string[];

// Mapped type for puzzle configurations by type
export type PuzzleConfigMap = {
  [K in PuzzleType]: Puzzle & { type: K };
};

// Note: All interfaces are already exported with their declarations above