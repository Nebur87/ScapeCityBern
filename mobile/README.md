# Configuración de la Aplicación Móvil 📱

## Configurar Variables de Entorno

Actualizar `mobile/src/services/api.js` con la URL de tu backend:

```javascript
// Para desarrollo local
const API_BASE_URL = 'http://localhost:3001/api';

// Para dispositivo físico en la misma red
const API_BASE_URL = 'http://192.168.1.100:3001/api';

// Para producción
const API_BASE_URL = 'https://tu-dominio.com/api';
```

## Permisos Necesarios

La app requiere los siguientes permisos:

### Android (app.json)
```json
{
  "expo": {
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "RECORD_AUDIO"
      ]
    }
  }
}
```

### iOS (app.json)
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Esta app necesita acceso a tu ubicación para validar que estás cerca de las paradas del juego.",
        "NSCameraUsageDescription": "La cámara se usa para los puzzles de realidad aumentada.",
        "NSMicrophoneUsageDescription": "El micrófono se puede usar para ciertos puzzles interactivos."
      }
    }
  }
}
```

## Desarrollo

```bash
# Instalar dependencias
cd mobile
npm install

# Iniciar en modo desarrollo
npx expo start

# Escanear QR con Expo Go app
# O presionar 'a' para Android, 'i' para iOS
```

## Testing en Dispositivo Real

Para probar funcionalidades GPS y AR es recomendable usar un dispositivo físico:

```bash
# Conectar dispositivo Android via USB
adb devices
npx expo run:android

# Para iOS (requiere macOS y Xcode)
npx expo run:ios
```

## Builds de Producción

### Android APK
```bash
npx expo build:android -t apk
```

### Android AAB (para Google Play Store)
```bash
npx expo build:android -t app-bundle
```

### iOS (requiere cuenta de desarrollador Apple)
```bash
npx expo build:ios
```

## Configuración de Mapas

Para usar mapas nativos en producción, necesitarás API keys:

### Google Maps (Android)
1. Obtener API key en Google Cloud Console
2. Añadir al `app.json`:
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "TU_GOOGLE_MAPS_API_KEY"
        }
      }
    }
  }
}
```

### Apple Maps (iOS)
No requiere API key adicional, usa MapKit nativo.

## Troubleshooting

### Errores comunes:

**Location permission denied:**
- Verificar que los permisos están en app.json
- Reinstalar la app después de cambiar permisos

**Maps not loading:**
- Verificar API key de Google Maps
- Comprobar que Billing está habilitado en Google Cloud

**Network request failed:**
- Verificar que el backend está corriendo
- Comprobar la URL de la API
- Para dispositivo físico, usar IP local en lugar de localhost

### Logs útiles:
```bash
# Ver logs de Expo
npx expo start --dev-client

# Logs de Android
adb logcat

# Remote debugging
npx expo start --dev-client --tunnel
```