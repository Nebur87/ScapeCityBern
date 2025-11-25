import axios from 'axios';

// URL del backend - probamos con IP y puerto diferente si hay problemas
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.1:3001/api' // Para desarrollo local
  : 'http://87.106.104.30:3001/api'; // Tu VPS

// Modo de desarrollo para testing sin geolocalización
export const DEV_MODE = true; // Siempre activado para poder probar

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Aumentamos timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token JWT automáticamente
apiClient.interceptors.request.use((config) => {
  // Aquí se añadiría el token desde AsyncStorage
  return config;
});

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      console.log('Error de red - verifica si el backend está funcionando en:', API_BASE_URL);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Servicios de API
export const routesAPI = {
  getAllRoutes: () => apiClient.get('/routes'),
  getRoute: (id) => apiClient.get(`/routes/${id}`),
};

export const usersAPI = {
  register: (userData) => apiClient.post('/users/register', userData),
  login: (credentials) => apiClient.post('/users/login', credentials),
  getProfile: () => apiClient.get('/users/profile'),
};

export const progressAPI = {
  getProgress: (userId, routeId) => apiClient.get(`/progress/${userId}/${routeId}`),
  startRoute: (userId, routeId) => apiClient.post(`/progress/${userId}/start`, { routeId }),
  completeStop: (userId, stopData) => apiClient.post(`/progress/${userId}/complete`, stopData),
};

export const leaderboardAPI = {
  getLeaderboard: (routeId, timeframe = 'all') => 
    apiClient.get(`/leaderboard/${routeId}?timeframe=${timeframe}`),
  getStats: (routeId) => apiClient.get(`/leaderboard/${routeId}/stats`),
};

// Health check para verificar conexión
export const healthAPI = {
  checkConnection: () => apiClient.get('/health'),
};