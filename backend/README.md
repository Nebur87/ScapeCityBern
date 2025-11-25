# Backend API Documentation 🚀

## Configuración y Deployment

### Variables de Entorno Requeridas

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scapear_bern
DB_USER=postgres
DB_PASSWORD=postgres

# Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=tu-clave-secreta-cambiar-en-produccion
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000,exp://192.168.*:19000
```

## Inicialización

```bash
# Instalar dependencias
npm install

# Ejecutar migraciones/crear tablas
npm start

# Poblar con datos de prueba
npm run seed

# Modo desarrollo con hot-reload
npm run dev
```

## Estructura de la Base de Datos

### Tabla `users`
- `id` - Serial primary key
- `username` - Varchar(255) unique
- `email` - Varchar(255) unique  
- `password_hash` - Varchar(255)
- `created_at`, `updated_at` - Timestamps

### Tabla `routes`
- `id` - Varchar(255) primary key
- `name` - Varchar(255)
- `description` - Text
- `estimated_duration` - Varchar(100)
- `distance` - Varchar(100)
- `difficulty` - Varchar(100)
- `total_points` - Integer
- `is_active` - Boolean

### Tabla `stops`
- `id` - Varchar(255) primary key
- `route_id` - FK to routes
- `name` - Varchar(255)
- `description` - Text
- `latitude`, `longitude` - Decimal coordinates
- `radius` - Integer (meters)
- `puzzle_type` - Varchar(255)
- `puzzle_data` - JSONB
- `reward_data` - JSONB
- `stop_order` - Integer

### Tabla `user_progress`
- `id` - Serial primary key
- `user_id` - FK to users
- `route_id` - FK to routes
- `stop_id` - FK to stops
- `completed_at` - Timestamp
- `completion_time` - Integer (seconds)
- `points_earned` - Integer
- `puzzle_data` - JSONB

### Tabla `user_sessions`
- `id` - Serial primary key
- `user_id` - FK to users
- `route_id` - FK to routes
- `started_at` - Timestamp
- `completed_at` - Timestamp (nullable)
- `total_time` - Integer (seconds)
- `total_points` - Integer
- `is_completed` - Boolean

## API Endpoints

### Authentication

#### POST /api/users/register
Registrar nuevo usuario.

**Body:**
```json
{
  "username": "string",
  "email": "string", 
  "password": "string" (min 6 chars)
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "usuario",
    "email": "usuario@email.com",
    "createdAt": "2023-01-01T00:00:00Z"
  },
  "token": "jwt.token.here"
}
```

#### POST /api/users/login
Iniciar sesión.

**Body:**
```json
{
  "username": "string", // or email
  "password": "string"
}
```

**Response:** Same as register

#### GET /api/users/profile
Obtener perfil del usuario (requiere auth).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "username": "usuario",
  "email": "usuario@email.com",
  "created_at": "2023-01-01T00:00:00Z",
  "routes_started": 2,
  "routes_completed": 1,
  "total_points": 850,
  "stops_completed": 7
}
```

### Routes

#### GET /api/routes
Listar todas las rutas activas.

**Response:**
```json
[
  {
    "id": "bern-classic",
    "name": "El Secreto de la Ciudad de los Osos",
    "description": "Descubre el misterioso Manuscrito...",
    "estimated_duration": "2-3 horas",
    "distance": "~3 km", 
    "difficulty": "Intermedio",
    "total_points": 1220,
    "total_stops": 10
  }
]
```

#### GET /api/routes/:id
Obtener detalles de una ruta específica.

**Response:**
```json
{
  "id": "bern-classic",
  "name": "El Secreto de la Ciudad de los Osos",
  "description": "...",
  "stops": [
    {
      "id": "zytglogge",
      "name": "Zytglogge",
      "description": "La famosa torre del reloj...",
      "coordinates": {
        "lat": 46.9481,
        "lng": 7.4474
      },
      "radius": 30,
      "puzzle": {
        "type": "symbols",
        "hint": "Observa el reloj astronómico...",
        // ... puzzle data
      },
      "reward": {
        "seal": "tiempo_seal.png",
        "text": "Has obtenido el Sello del Tiempo...",
        "points": 100
      }
    }
    // ... más stops
  ],
  "userProgress": { // solo si autenticado
    "completedStops": ["zytglogge", "munster"],
    "totalCompleted": 2
  }
}
```

### Progress

#### GET /api/progress/:userId/:routeId
Obtener progreso del usuario en una ruta (requiere auth).

**Response:**
```json
{
  "session": {
    "id": 1,
    "user_id": 1,
    "route_id": "bern-classic",
    "started_at": "2023-01-01T10:00:00Z",
    "completed_at": null,
    "total_time": null,
    "total_points": 220,
    "is_completed": false
  },
  "completedStops": [
    {
      "id": 1,
      "stop_id": "zytglogge",
      "stop_name": "Zytglogge",
      "points_earned": 100,
      "completed_at": "2023-01-01T10:30:00Z"
    }
  ],
  "totalCompleted": 1,
  "totalPoints": 100
}
```

#### POST /api/progress/:userId/start
Iniciar nueva sesión de ruta (requiere auth).

**Body:**
```json
{
  "routeId": "bern-classic"
}
```

#### POST /api/progress/:userId/complete
Completar una parada (requiere auth).

**Body:**
```json
{
  "routeId": "bern-classic",
  "stopId": "zytglogge",
  "userLocation": {
    "latitude": 46.9481,
    "longitude": 7.4474
  },
  "puzzleData": {
    // data específica del puzzle completado
  }
}
```

**Response:**
```json
{
  "message": "Stop completed successfully",
  "progress": {
    "id": 1,
    "points_earned": 100,
    "completed_at": "2023-01-01T10:30:00Z"
  },
  "reward": {
    "seal": "tiempo_seal.png", 
    "text": "Has obtenido el Sello del Tiempo...",
    "points": 100
  },
  "routeCompleted": false
}
```

### Leaderboard

#### GET /api/leaderboard/:routeId
Obtener ranking de una ruta.

**Query params:**
- `timeframe`: "all" | "week" | "month" (default: "all")

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": 2,
      "username": "ana_garcia",
      "totalPoints": 1220,
      "totalTime": 8100, // seconds
      "isCompleted": true,
      "completedAt": "2023-01-01T12:15:00Z",
      "stopsCompleted": 10,
      "formattedTime": "2h 15m 0s"
    }
  ],
  "userPosition": 4, // si está autenticado
  "timeframe": "all",
  "totalEntries": 25
}
```

#### GET /api/leaderboard/:routeId/stats
Obtener estadísticas de una ruta.

**Response:**
```json
{
  "totalPlayers": 150,
  "completedPlayers": 23,
  "completionRate": "15.3",
  "avgCompletionTime": "2h 45m 30s",
  "bestTime": "1h 58m 12s", 
  "highestScore": 1220,
  "averageScore": 890,
  "popularStops": [
    {
      "id": "zytglogge",
      "name": "Zytglogge",
      "completion_count": 89
    }
  ]
}
```

## Validaciones de Seguridad

### Geofence Validation
- Las coordenadas del usuario se validan contra la base de datos
- Se incluye tolerancia para errores de GPS (10m adicionales)
- Previene completar stops fuera del rango permitido

### Rate Limiting
- 100 requests por IP cada 15 minutos
- Previene abuso de la API

### JWT Authentication
- Tokens expiran en 7 días por defecto
- Se valida existencia del usuario en cada request autenticado

## Monitoring y Logs

### Health Check
```bash
GET /health
```

### Error Handling
- Errors 400: Validation/Bad Request
- Errors 401: Unauthorized  
- Errors 403: Forbidden
- Errors 404: Not Found
- Errors 409: Conflict (duplicates)
- Errors 429: Too Many Requests
- Errors 500: Internal Server Error

### Logging
- Morgan middleware para request logging
- Console logging para errors y eventos importantes
- Logs estructurados para production