import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { bernRoute } from '../data/routes';

export default function RouteDetailScreen({ navigation }) {
  const route = bernRoute;

  const navigateToStop = (stop, index) => {
    navigation.navigate('StopDetail', { stop: { ...stop, index }, routeId: route.id });
  };

  const renderStopItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.stopItem}
      onPress={() => navigateToStop(item, index)}
    >
      <View style={styles.stopNumber}>
        <Text style={styles.stopNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.stopContent}>
        <Text style={styles.stopName}>{item.name}</Text>
        <Text style={styles.stopType}>{item.puzzle.type}</Text>
        <Text style={styles.stopDescription}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#8B5A2B" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={['#8B5A2B', '#D2B48C']}
          style={styles.header}
        >
          <Text style={styles.title}>{route.name}</Text>
          <Text style={styles.description}>{route.description}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Ionicons name="time" size={20} color="white" />
              <Text style={styles.statText}>{route.estimatedDuration}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="walk" size={20} color="white" />
              <Text style={styles.statText}>{route.distance}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="star" size={20} color="white" />
              <Text style={styles.statText}>{route.difficulty}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.stopsContainer}>
          <Text style={styles.stopsTitle}>Paradas de la Ruta ({route.stops.length})</Text>
          <FlatList
            data={route.stops}
            renderItem={renderStopItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 20,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  stopsContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  stopsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stopNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8B5A2B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  stopNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stopContent: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  stopType: {
    fontSize: 14,
    color: '#8B5A2B',
    marginTop: 2,
  },
  stopDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});