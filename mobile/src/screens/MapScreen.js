// MapScreen.js - Importador condicional
import { Platform } from 'react-native';

// Importación condicional según la plataforma
let MapScreen;
if (Platform.OS === 'web') {
  MapScreen = require('./MapScreen.web.js').default;
} else {
  MapScreen = require('./MapScreen.native.js').default;
}

export default MapScreen;