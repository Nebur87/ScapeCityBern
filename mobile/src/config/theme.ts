// Theme configuration for ScapeArBern - Urban Escape Room
// Provides consistent colors, gradients, spacing and animations across the app

export const theme = {
  colors: {
    // Primary brand colors
    primary: '#FFD700',        // Gold - main brand color
    secondary: '#8B5A2B',      // Brown - secondary brand color
    accent: '#B8860B',         // Dark goldenrod - accent color
    
    // Status colors
    success: '#4CAF50',        // Green - success states
    warning: '#FF9800',        // Orange - warning states
    danger: '#F44336',         // Red - error/danger states
    info: '#2196F3',           // Blue - info states
    
    // Background gradients
    background: {
      primary: '#1a1a2e',      // Dark purple - main background
      secondary: '#16213e',     // Medium purple - secondary background
      tertiary: '#0f0f23',     // Darkest purple - tertiary background
      surface: '#FFFFFF15',     // Semi-transparent white - surface overlay
      card: '#FFFFFF20',        // Semi-transparent white - card background
    },
    
    // Text colors
    text: {
      primary: '#FFFFFF',       // White - primary text
      secondary: '#FFFFFF90',   // 90% white - secondary text
      muted: '#FFFFFF70',       // 70% white - muted text
      disabled: '#FFFFFF50',    // 50% white - disabled text
      inverse: '#000000',       // Black - inverse text (on light backgrounds)
    },
    
    // Border and separator colors
    border: {
      primary: '#FFD70030',     // 30% gold - primary borders
      secondary: '#FFFFFF20',   // 20% white - secondary borders
      muted: '#FFFFFF10',       // 10% white - muted borders
    },
    
    // Time-based colors for countdown
    time: {
      excellent: '#4CAF50',     // Green - >2 hours remaining
      good: '#FF9800',          // Orange - 1-2 hours remaining
      critical: '#F44336',      // Red - <1 hour remaining
    }
  },
  
  // Gradient definitions for consistent styling
  gradients: {
    // Main app gradients
    primary: ['#1a1a2e', '#16213e', '#0f0f23'],
    secondary: ['#0f0f23', '#1a1a2e'],
    
    // Puzzle-specific gradients
    puzzle: ['#1a1a2e', '#16213e', '#0f0f23'],
    success: ['#4CAF5020', '#4CAF5010', 'transparent'],
    warning: ['#FF980020', '#FF980010', 'transparent'],
    danger: ['#F4433620', '#F4433610', 'transparent'],
    
    // Special effect gradients
    gold: ['#FFD700', '#B8860B', '#8B7355'],
    shine: ['transparent', '#FFD70030', 'transparent'],
  },

  // Animation timing and easing
  animations: {
    timing: {
      fast: 200,               // Fast animations (button presses, etc.)
      normal: 400,             // Normal animations (transitions)
      slow: 800,               // Slow animations (page transitions)
      extraSlow: 1200,         // Extra slow (dramatic reveals)
    },
    
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'spring',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    
    spring: {
      tension: 50,
      friction: 8,
    }
  },

  // Consistent spacing system
  spacing: {
    xs: 4,    // Extra small spacing
    sm: 8,    // Small spacing
    md: 16,   // Medium spacing (base unit)
    lg: 24,   // Large spacing
    xl: 32,   // Extra large spacing
    xxl: 48,  // Extra extra large spacing
    
    // Semantic spacing
    component: 16,    // Default component padding
    section: 24,      // Section spacing
    screen: 20,       // Screen edge padding
  },

  // Typography scale
  typography: {
    // Font sizes
    fontSize: {
      xs: 11,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
      title: 24,
      heading: 28,
      display: 32,
    },
    
    // Font weights
    fontWeight: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      heavy: '800',
    },
    
    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
    
    // Font families
    fontFamily: {
      default: 'System',
      monospace: 'monospace',
      serif: 'serif',
    }
  },

  // Border radius values
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    round: 50,      // For circular elements
    pill: 999,      // For pill-shaped elements
  },

  // Shadow definitions
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      shadowOpacity: 0.25,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      shadowOpacity: 0.3,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      shadowOpacity: 0.35,
      elevation: 12,
    }
  },

  // Z-index layers
  zIndex: {
    background: -1,
    default: 0,
    dropdown: 1000,
    sticky: 1010,
    fixed: 1020,
    modal: 1030,
    popover: 1040,
    tooltip: 1050,
    toast: 1060,
  }
};

// Utility functions for theme usage
export const getTimeColor = (seconds: number): string => {
  const hours = seconds / 3600;
  
  if (hours > 2) return theme.colors.time.excellent;
  if (hours > 1) return theme.colors.time.good;
  return theme.colors.time.critical;
};

export const getPuzzleGradient = (type?: string) => {
  switch (type) {
    case 'success':
      return theme.gradients.success;
    case 'warning':
      return theme.gradients.warning;
    case 'danger':
      return theme.gradients.danger;
    default:
      return theme.gradients.puzzle;
  }
};

// Define theme type separately
export type Theme = typeof theme;

// Theme-aware style helper
export const createThemedStyles = (styleFunction: (themeObj: Theme) => any) => {
  return styleFunction(theme);
};

export default theme;