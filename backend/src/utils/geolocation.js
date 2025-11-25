/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Validate if user is within geofence of a stop
 */
export function isWithinGeofence(userLat, userLng, stopLat, stopLng, radius) {
  const distance = calculateDistance(userLat, userLng, stopLat, stopLng);
  return distance <= radius;
}

/**
 * Validate geofence with tolerance for GPS accuracy
 */
export function validateGeofenceWithTolerance(userLat, userLng, stopLat, stopLng, radius, tolerance = 10) {
  const adjustedRadius = radius + tolerance;
  return isWithinGeofence(userLat, userLng, stopLat, stopLng, adjustedRadius);
}