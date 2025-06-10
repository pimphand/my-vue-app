/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return Number(distance.toFixed(2));
}

/**
 * Convert degrees to radians
 * @param deg Degrees
 * @returns Radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Office coordinates
export const OFFICE_COORDINATES = {
  latitude: -7.197357052809274,
  longitude: 107.89438523413747
};

/**
 * Calculate distance from office location
 * @param lat Latitude of the point
 * @param lon Longitude of the point
 * @returns Distance in kilometers from office
 */
export function calculateDistanceFromOffice(lat: number, lon: number): number {
  return calculateDistance(
    OFFICE_COORDINATES.latitude,
    OFFICE_COORDINATES.longitude,
    lat,
    lon
  );
}

/**
 * Check if location is within 100 meters of office
 * @param lat Latitude of the point
 * @param lon Longitude of the point
 * @returns Object containing distance and status
 */
export function checkOfficeLocation(lat: number, lon: number): { distance: number; status: string } {
  const distance = calculateDistanceFromOffice(lat, lon);
  // Convert 100 meters to kilometers (0.1 km)
  const isWithinRange = distance <= 0.1;
  
  return {
    distance,
    status: isWithinRange ? 'Di dalam kantor' : 'Di luar kantor'
  };
}
