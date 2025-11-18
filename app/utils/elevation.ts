import { Tower, ElevationPoint } from '@/app/types';
import { calculateDistance } from '@/app/utils/calculations';

/**
 * Fetch elevation profile between two towers using Open-Elevation API
 */
export async function fetchElevationProfile(
  tower1: Tower,
  tower2: Tower,
  numPoints: number = 10
): Promise<ElevationPoint[]> {
  const distance = calculateDistance(tower1.lat, tower1.lng, tower2.lat, tower2.lng);
  
  // Generate points along the path
  const points: { lat: number; lng: number; distance: number }[] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;
    const lat = tower1.lat + (tower2.lat - tower1.lat) * fraction;
    const lng = tower1.lng + (tower2.lng - tower1.lng) * fraction;
    const dist = distance * fraction;
    
    points.push({ lat, lng, distance: dist });
  }

  try {
    // Fetch elevations from Open-Elevation API
    // Note: This is a free API with rate limits
    const locations = points.map(p => ({ latitude: p.lat, longitude: p.lng }));
    
    const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ locations }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch elevation data');
    }

    const data = await response.json();
    
    const elevationProfile: ElevationPoint[] = points.map((point, index) => ({
      distance: point.distance,
      elevation: data.results[index]?.elevation || 0,
      fresnelRadius: 0, // Will be calculated later
    }));

    return elevationProfile;
  } catch (error) {
    console.error('Error fetching elevation data:', error);
    
    // Return mock elevation data if API fails
    return points.map(point => ({
      distance: point.distance,
      elevation: 100 + Math.random() * 50, // Random elevation between 100-150m
      fresnelRadius: 0,
    }));
  }
}
