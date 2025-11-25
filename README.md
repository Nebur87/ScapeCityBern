# 🐻 ScapeArBern - Urban Escape Room
## El Secreto de la Ciudad de los Osos

<div align="center">

![React Native](https://img.shields.io/badge/React%20Native-0.76-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-black?logo=expo)

Una aventura de escape room urbano que gamifica la exploración de Berna, Suiza, mediante puzzles digitales interactivos, realidad aumentada y una narrativa inmersiva.

*🎯 Objetivo: Descubrir los secretos ocultos de la capital suiza mientras resuelves desafíos en ubicaciones históricas icónicas.*

</div>

---

## 📱 **Introducción**

**ScapeArBern** es una aplicación móvil de escape room urbano que transforma la ciudad de Berna en un tablero de juego interactivo. Los jugadores recorren 10 ubicaciones históricas emblemáticas, resolviendo puzzles únicos que combinan tecnología moderna (AR, sensores del dispositivo) con la rica historia y cultura de la capital suiza.

### 🎮 **Características Principales:**
- **10 Paradas Únicas**: Desde el Zytglogge hasta el Bärengraben
- **6 Tipos de Puzzles**: Vitral, Criptograma, Brújula, Secuencia, Mosaico y Realidad Aumentada
- **Sistema de Tiempo Global**: 3 horas para completar la aventura
- **Geolocalización**: Validación de ubicación para cada parada
- **Progreso Persistente**: Sincronización automática con el servidor
- **Leaderboard**: Clasificación global de jugadores

---

## 🏗️ **Arquitectura del Sistema**

### **Frontend - React Native**
```
📱 React Native + Expo SDK 54
├── 🎯 Zustand (State Management)
├── 📦 AsyncStorage (Persistencia Local)
├── 🗺️ React Native Maps (Geolocalización)
├── 🎨 React Native Reanimated (Animaciones)
├── 📐 React Native SVG (Gráficos)
├── 📷 Expo Camera (Realidad Aumentada)
└── 🌐 Axios (HTTP Client)
```

### **Backend - Node.js + Express**
```
🔧 Express.js + TypeScript
├── 🗄️ PostgreSQL (Base de Datos Principal)
├── ⚡ Redis (Cache y Sessions)
├── 🔐 JWT (Autenticación)
├── 📍 Geolocalización (Haversine Distance)
├── 🎯 Bcrypt (Hash de Contraseñas)
└── 🔄 CORS (Cross-Origin Resource Sharing)
```

### **Infraestructura - Docker**
```
🐳 Docker Compose
├── 🖥️ Backend Container (Node.js)
├── 🗃️ PostgreSQL Container
├── ⚡ Redis Container
└── 🌐 Network Bridge
```

### **Comunicación**
- **API REST** con endpoints tipados
- **JWT Authentication** en headers
- **Real-time sync** con AsyncStorage
- **Offline-first** con sincronización diferida

---

## 🏪 **Gestión de Estado (Zustand Stores)**

### **🔐 useAuth.ts - Autenticación**
```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  
  // Actions
  login(email: string, password: string): Promise<User>;
  register(email: string, password: string, name?: string): Promise<User>;
  logout(): Promise<void>;
  refreshProfile(): Promise<void>;
}
```
- **Persistencia automática** con AsyncStorage
- **Token JWT** en todas las requests
- **Auto-logout** en sesiones expiradas
- **Rehydratación** al abrir la app

### **📊 useProgress.ts - Progreso del Jugador**
```typescript
interface ProgressStore {
  completedStops: string[];
  totalPoints: number;
  sealsCollected: string[];
  currentStop: string | null;
  
  // Actions
  completeStop(stopId: string, result: PuzzleResult): Promise<void>;
  syncWithServer(): Promise<void>;
  getCompletionPercentage(): number;
}
```
- **Progreso local** con sincronización al servidor
- **Sellos temáticos** por cada puzzle completado
- **Puntuación acumulativa** con bonificaciones

### **⏱️ useAdventure.ts - Contador Global**
```typescript
interface AdventureStore {
  started: boolean;
  countdown: number;        // 10800 segundos (3 horas)
  pointsBonus: number;
  completed: boolean;
  
  // Actions
  startAdventure(): void;
  tick(): void;            // Llamado cada segundo
  finishAdventure(basePoints: number): number;  // Retorna total + bonus
}
```
- **Timer persistente** que sobrevive al cierre de la app
- **Bonificación de tiempo**: 5 puntos por minuto restante
- **Auto-completación** al agotar el tiempo

### **📋 types.ts - Tipado Fuerte**
- Interfaces centralizadas para toda la aplicación
- Type guards para validación en runtime
- Props tipadas para componentes de puzzles
- Respuestas API con tipos específicos

---

## 🌐 **API Endpoints**

### **🔐 Autenticación**
```http
POST /api/auth/register
Content-Type: application/json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "name": "Nombre Usuario"
}
```

```http
POST /api/auth/login
Content-Type: application/json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

### **🗺️ Rutas y Progreso**
```http
GET /api/routes/bern-route
Authorization: Bearer <jwt-token>
```

```http
POST /api/progress/complete
Authorization: Bearer <jwt-token>
Content-Type: application/json
{
  "routeSlug": "bern-route",
  "stopSlug": "zytglogge",
  "userLocation": { "lat": 46.9480, "lng": 7.4474 },
  "result": {
    "seal": "time",
    "points": 150,
    "timeSpent": 120000
  }
}
```

### **🏆 Leaderboard**
```http
GET /api/leaderboard/bern-route
Authorization: Bearer <jwt-token>
```

### **📊 Respuesta Típica**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "completedStops": ["zytglogge", "cathedral"],
    "seals": ["time", "light"],
    "points": 320
  },
  "timestamp": "2025-11-25T10:30:00Z"
}
```

---

## 🧩 **Sistema de Puzzles**

### **✅ Puzzles Implementados**

#### **🌈 PuzzleVitral**
- **Mecánica**: Sliding puzzle 3x5 con drag & drop
- **Ubicación**: Münster Cathedral / Zytglogge
- **Recompensa**: Sello "light" / "time"

#### **🔤 PuzzleCryptogram**
- **Mecánica**: Descifrado Caesar cipher con input interactivo
- **Ubicación**: Käfigturm (Torre Prisión)
- **Recompensa**: Sello "justice"

#### **🧭 PuzzleCompass**
- **Mecánica**: Orientación con DeviceMotion API
- **Ubicación**: Nydeggbrücke (Puente)
- **Recompensa**: Sello "river"

#### **🎵 PuzzleSequence**
- **Mecánica**: Simon Says con botones de colores
- **Ubicación**: Rosengarten / Einstein-Haus
- **Recompensa**: Sello "memory" / "relativity"

#### **🎨 PuzzleMosaic**
- **Mecánica**: Ensamblaje de sellos recolectados
- **Ubicación**: Bärengraben (Final)
- **Recompensa**: Sello "guardian"

#### **📱 PuzzleAROverlay**
- **Mecánica**: Realidad aumentada con AR.js
- **Ubicación**: Museo Histórico
- **Recompensa**: Sello "archive"

### **🔮 Puzzles Extensibles**
- **Decision**: Árbol de decisiones históricas
- **Exchange**: Intercambio de elementos temáticos
- **Audio**: Reconocimiento de patrones sonoros
- **Trivia**: Preguntas sobre historia de Berna

### **🔧 Arquitectura Modular**
```typescript
interface PuzzleComponentProps {
  stop: Stop;
  userCoords?: Coords;
  onComplete: (result: PuzzleResult) => void;
  onClose?: () => void;
}

// Cada puzzle es un componente independiente
const PuzzleVitral: React.FC<PuzzleComponentProps> = ({ 
  stop, 
  onComplete 
}) => {
  // Lógica específica del puzzle
  // Validación de geofence
  // Interfaz única y temática
  // Callback estandarizado al completar
};
```

---

## ⏱️ **Contador Global y Gamificación**

### **🕒 Sistema de Tiempo**
- **Duración Total**: 3 horas (10,800 segundos)
- **Persistencia**: El timer continúa aunque se cierre la app
- **Visualización**: Componente `GlobalCountdown.tsx`

### **💰 Sistema de Bonificación**
```typescript
// Cálculo de bonus al finalizar
const minutesRemaining = Math.floor(countdown / 60);
const pointsBonus = minutesRemaining * 5; // 5 puntos por minuto
const totalPoints = basePoints + pointsBonus;
```

### **🎨 GlobalCountdown.tsx**
- **Círculo animado** que se vacía con el tiempo (SVG + Reanimated)
- **Colores dinámicos**: 
  - 🟢 Verde: +2 horas restantes
  - 🟡 Amarillo: 1-2 horas restantes  
  - 🔴 Rojo: <1 hora restante
- **Información en tiempo real**: HH:MM:SS y puntos bonus potenciales

---

## 🎯 **Flujo de Juego Completo**

### **1. 📱 Registro e Inicio**
```
Usuario abre app → Registro/Login → Pantalla principal
                                        ↓
              GlobalCountdown (no iniciado) + Mapa de paradas
                                        ↓
                    "Iniciar Aventura" → Timer comienza
```

### **2. 🗺️ Exploración Urbana**
```
Usuario navega a parada → Validación de geofence → Acceso al puzzle
                                     ↓
                            Resolución del puzzle
                                     ↓
                      Recompensa (sello + puntos) → Progreso guardado
```

### **3. 🏁 Finalización**
```
10 paradas completadas → "Finalizar Aventura" → Cálculo de bonus
                                     ↓
                           Puntuación final → Leaderboard
```

### **📍 Las 10 Paradas de Berna**
1. **Zytglogge** - Torre del Reloj → Puzzle Vitral
2. **Münster** - Catedral → Puzzle Vitral  
3. **Bundeshaus** - Parlamento → Puzzle Decision
4. **Käfigturm** - Torre Prisión → Puzzle Cryptogram
5. **Nydeggbrücke** - Puente → Puzzle Compass
6. **Rosengarten** - Jardín de Rosas → Puzzle Sequence
7. **Einstein-Haus** - Casa de Einstein → Puzzle Sequence
8. **Bundesplatz** - Plaza Federal → Puzzle Exchange
9. **Museo Histórico** - Archivo → Puzzle AR Overlay
10. **Bärengraben** - Foso de Osos → Puzzle Mosaic (Final)

---

## 🚀 **Instalación y Configuración**

### **📋 Pre-requisitos**
- Node.js 20+
- npm o yarn
- Docker y Docker Compose
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio / Xcode (para testing)

### **🔧 Backend Setup**
```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/scapearben.git
cd scapearben

# 2. Configurar backend
cd backend
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/scapearben
# JWT_SECRET=tu-secret-super-seguro
# REDIS_URL=redis://localhost:6379

# 4. Levantar infraestructura con Docker
docker-compose up -d

# 5. Ejecutar migraciones (si es necesario)
npm run migrate

# 6. Iniciar servidor de desarrollo
npm run dev
```

### **📱 Frontend Setup**
```bash
# 1. Instalar dependencias del frontend
cd mobile
npm install

# 2. Configurar Expo (si es la primera vez)
npx expo install

# 3. Iniciar servidor de desarrollo
npx expo start

# 4. Escanear QR con Expo Go o usar simulador
# - Android: Expo Go app
# - iOS: Camera app → Escaner QR
```

### **🐳 Docker Compose Configuration**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/scapearben
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=scapearben
      - POSTGRES_USER=postgres  
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## 🧪 **Pruebas y Validación**

### **🏃‍♂️ Testing en Desarrollo**
```bash
# Backend tests
cd backend
npm run test

# Frontend tests  
cd mobile
npm run test

# E2E testing (Expo)
npx expo test
```

### **📍 Pruebas en Campo (Berna)**
- **Validación de Geofences**: Comprobar radios de 20-60m en cada parada
- **Conectividad**: Probar en diferentes zonas de cobertura móvil
- **Usabilidad**: Testing con usuarios reales en condiciones urbanas
- **Performance**: Uso de batería durante 3 horas de juego continuo

### **📱 Testing Multi-dispositivo**
- **Android**: Galaxy S21+, Pixel 6, OnePlus 9
- **iOS**: iPhone 12/13/14, iPad Air
- **Diferentes tamaños**: Phones, tablets, foldables

### **🔧 Ajustes Post-Testing**
- Optimización de radios de geofence según feedback
- Calibración de sensores (brújula, acelerómetro)
- Ajustes de UI/UX según comportamiento del usuario
- Optimización de rendimiento y batería

---

## 🏗️ **Estructura del Proyecto**

```
📁 scapearben/
├── 📱 mobile/                    # React Native Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/        # UI Components
│   │   │   ├── 🧩 puzzles/      # Puzzle Components
│   │   │   ├── GlobalCountdown.tsx
│   │   │   ├── PuzzleScreen.tsx
│   │   │   └── PuzzleWrapper.tsx
│   │   ├── 📁 screens/          # App Screens
│   │   ├── 📁 hooks/            # Zustand Stores
│   │   │   ├── useAuth.ts
│   │   │   ├── useProgress.ts
│   │   │   └── useAdventure.ts
│   │   ├── 📁 services/         # API Layer
│   │   │   └── api.ts
│   │   ├── 📁 config/           # Configuration
│   │   │   ├── config.ts        # Stops & Route Config
│   │   │   └── theme.ts         # Design System
│   │   ├── 📁 types/            # TypeScript Definitions
│   │   │   └── types.ts
│   │   └── 📁 utils/            # Utility Functions
│   ├── 📄 package.json
│   └── 📄 app.config.js
│
├── 🔧 backend/                   # Express.js Backend
│   ├── 📁 src/
│   │   ├── 📁 routes/           # API Routes
│   │   │   ├── auth.ts
│   │   │   ├── progress.ts
│   │   │   └── leaderboard.ts
│   │   ├── 📁 models/           # Database Models
│   │   ├── 📁 middleware/       # Auth, CORS, etc.
│   │   ├── 📁 services/         # Business Logic
│   │   └── 📁 utils/            # Helper Functions
│   ├── 📄 package.json
│   └── 📄 Dockerfile
│
├── 🐳 docker-compose.yml        # Infrastructure
├── 📄 README.md                 # This file
└── 📄 .gitignore
```

---

## 🚧 **Roadmap y Mejoras Futuras**

### **📅 Fase 2 - Expansión**
- [ ] **Nuevas ciudades**: Zurich, Geneva, Basel
- [ ] **Puzzles adicionales**: Audio, Trivia, Decision Tree
- [ ] **Multijugador**: Equipos y competencias en tiempo real
- [ ] **AR mejorada**: WebXR, 3D objects, spatial audio

### **📅 Fase 3 - Gamificación**
- [ ] **Sistema de logros**: Badges y achievements
- [ ] **Temporadas**: Eventos especiales y rutas temáticas
- [ ] **Personalización**: Avatares y customización
- [ ] **Social features**: Compartir progreso, desafiar amigos

### **📅 Fase 4 - Plataforma**
- [ ] **Editor de rutas**: Herramienta para crear nuevos escape rooms
- [ ] **Marketplace**: Rutas creadas por la comunidad
- [ ] **Analytics**: Dashboard para organizadores de eventos
- [ ] **API pública**: Integración con sistemas de turismo

---

## 🤝 **Contribuciones y Colaboración**

### **👥 Roles del Equipo**
- **Full-Stack Developer**: Arquitectura, backend, integración
- **Mobile Developer**: React Native, UI/UX, optimización
- **Game Designer**: Mecánicas de puzzle, narrativa, balance
- **QA Tester**: Testing en campo, validación de UX

### **🔄 Proceso de Contribución**
1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### **📋 Guidelines**
- **TypeScript**: Código 100% tipado
- **ESLint**: Configuración estricta
- **Conventional Commits**: Formato estándar de commits
- **Testing**: Cobertura mínima del 80%

---

## 📄 **Licencia**

MIT License

Copyright (c) 2025 ScapeArBern Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🙏 **Agradecimientos**

- **Bern Tourism Board**: Por facilitar información histórica y ubicaciones
- **React Native Community**: Por librerías y recursos invaluables
- **Expo Team**: Por la plataforma de desarrollo móvil
- **Open Source Contributors**: Todas las librerías que hacen esto posible

---

<div align="center">

### 🐻 **¡Descubre los Secretos de la Ciudad de los Osos!** 🐻

**ScapeArBern** - Donde la historia cobra vida a través del juego.

[🌐 Website](https://scapearben.ch) | [📱 Download](https://expo.dev/@scapearben/app) | [🐛 Issues](https://github.com/tu-usuario/scapearben/issues) | [💬 Discord](https://discord.gg/scapearben)

Made with ❤️ in Bern, Switzerland 🇨🇭

</div>

2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🏔️ Sobre Berna

Berna, la capital de Suiza, es Patrimonio de la Humanidad por la UNESCO. Su casco histórico medieval, con la famosa Zytglogge y sus fuentes del siglo XVI, ofrece el escenario perfecto para esta aventura urbana que combina historia, tecnología y diversión.

---

**¡Descubre los secretos de la Ciudad de los Osos! 🐻🏰**