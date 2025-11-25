/**
 * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
 * @param {number} lat1 - Latitud del primer punto
 * @param {number} lon1 - Longitud del primer punto
 * @param {number} lat2 - Latitud del segundo punto
 * @param {number} lon2 - Longitud del segundo punto
 * @returns {number} Distancia en metros
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
}

/**
 * Verifica si una ubicación está dentro del geofence de una parada
 * @param {Object} userLocation - {latitude, longitude}
 * @param {Object} stopLocation - {lat, lng}
 * @param {number} radius - Radio en metros
 * @returns {boolean}
 */
export function isWithinGeofence(userLocation, stopLocation, radius) {
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    stopLocation.lat,
    stopLocation.lng
  );
  
  return distance <= radius;
}

/**
 * Obtiene la dirección del compass en grados
 * @param {number} heading - Heading del dispositivo
 * @returns {string} Dirección cardinal
 */
export function getCompassDirection(heading) {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  
  const index = Math.round(heading / 22.5) % 16;
  return directions[index];
}

/**
 * Convierte metros a formato legible
 * @param {number} meters - Distancia en metros
 * @returns {string} Distancia formateada
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}