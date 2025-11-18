import { Tower, FresnelZoneData, ElevationPoint } from '@/app/types';

const SPEED_OF_LIGHT = 3e8; // meters per second

/**
 * Calculate the wavelength from frequency
 */
export function calculateWavelength(frequencyGHz: number): number {
  const frequencyHz = frequencyGHz * 1e9;
  return SPEED_OF_LIGHT / frequencyHz;
}

/**
 * Calculate the first Fresnel zone radius at a given point
 */
export function calculateFresnelRadius(
  wavelength: number,
  d1: number,
  d2: number
): number {
  // r = sqrt((λ * d1 * d2) / (d1 + d2))
  return Math.sqrt((wavelength * d1 * d2) / (d1 + d2));
}

/**
 * Calculate the distance between two points using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate the bearing between two points
 */
export function calculateBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  return Math.atan2(y, x);
}

/**
 * Calculate Fresnel zone for a link
 */
export function calculateFresnelZone(
  tower1: Tower,
  tower2: Tower,
  frequencyGHz: number,
  elevationProfile?: ElevationPoint[]
): FresnelZoneData {
  const distance = calculateDistance(tower1.lat, tower1.lng, tower2.lat, tower2.lng);
  const wavelength = calculateWavelength(frequencyGHz);
  
  // Calculate maximum Fresnel radius (at the midpoint)
  const maxRadius = calculateFresnelRadius(wavelength, distance / 2, distance / 2);
  
  // Calculate center point (midpoint between towers)
  const centerLat = (tower1.lat + tower2.lat) / 2;
  const centerLng = (tower1.lng + tower2.lng) / 2;
  
  // Calculate rotation (bearing from tower1 to tower2)
  const rotation = calculateBearing(tower1.lat, tower1.lng, tower2.lat, tower2.lng);

  // If we have elevation profile, calculate clearances
  let processedElevationProfile: ElevationPoint[] | undefined;
  if (elevationProfile) {
    processedElevationProfile = elevationProfile.map(point => {
      const d1 = point.distance;
      const d2 = distance - d1;
      const fresnelRadius = calculateFresnelRadius(wavelength, d1, d2);
      
      // Calculate the height of the line of sight at this point
      // Assuming linear elevation change for simplicity
      const tower1Elevation = elevationProfile[0]?.elevation || 0;
      const tower2Elevation = elevationProfile[elevationProfile.length - 1]?.elevation || 0;
      const lineOfSightElevation = tower1Elevation + 
        (tower2Elevation - tower1Elevation) * (d1 / distance);
      
      // Clearance is the difference between line of sight and terrain,
      // minus the Fresnel radius requirement
      const clearance = lineOfSightElevation - point.elevation - fresnelRadius;
      
      return {
        ...point,
        fresnelRadius,
        clearance,
      };
    });
  }

  return {
    center: [centerLat, centerLng],
    width: distance,
    height: maxRadius * 2, // Full diameter
    rotation,
    elevationProfile: processedElevationProfile,
  };
}
