import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../config/theme';
import type { Theme } from '../config/theme';

interface PuzzleWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onClose?: () => void;
  loading?: boolean;
  loadingText?: string;
  headerGradient?: string[];
}

const PuzzleWrapper: React.FC<PuzzleWrapperProps> = ({
  children,
  title,
  subtitle,
  icon = 'game-controller-outline',
  onClose,
  loading = false,
  loadingText = 'Cargando...',
  headerGradient = theme.gradients.puzzle,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background.primary} />
      
      <LinearGradient colors={headerGradient.length >= 2 ? [headerGradient[0], headerGradient[1], ...headerGradient.slice(2)] : ['#1a1a2e', '#16213e']} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          {onClose && (
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
          
          <View style={styles.headerCenter}>
            <View style={styles.titleContainer}>
              <Ionicons 
                name={icon} 
                size={20} 
                color={theme.colors.primary} 
                style={styles.titleIcon} 
              />
              <Text style={styles.title}>{title}</Text>
            </View>
            
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>
          
          <View style={styles.headerRight} />
        </View>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>{loadingText}</Text>
            </View>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.content}>
          {children}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screen,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.muted,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40, // Balance the back button
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.title,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    textShadowColor: theme.colors.background.primary + '80',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background.primary + 'CC',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: theme.zIndex.modal,
  },
  loadingContent: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    fontWeight: '500',
  },
});

export default PuzzleWrapper;