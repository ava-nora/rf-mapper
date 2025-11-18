export interface Tower {
    id: string;
    lat: number;
    lng: number;
    frequency: number; // in GHz
  }
  
  export interface Link {
    id: string;
    tower1Id: string;
    tower2Id: string;
    frequency: number;
  }
  
  export interface FresnelZoneData {
    center: [number, number];
    width: number;
    height: number;
    rotation: number;
    elevationProfile?: ElevationPoint[];
  }
  
  export interface ElevationPoint {
    distance: number; // meters from tower1
    elevation: number; // meters above sea level
    fresnelRadius: number; // meters
    clearance?: number; // meters (positive if clear, negative if obstructed)
  }
  