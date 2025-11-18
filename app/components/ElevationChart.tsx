import { ElevationPoint } from '@/app/types';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ElevationChartProps {
  elevationProfile: ElevationPoint[];
  distance: number;
}

export function ElevationChart({ elevationProfile, distance }: ElevationChartProps) {
  // Prepare data for the chart
  const chartData = elevationProfile.map((point, index) => {
    const tower1Elevation = elevationProfile[0]?.elevation || 0;
    const tower2Elevation = elevationProfile[elevationProfile.length - 1]?.elevation || 0;
    const lineOfSightElevation = tower1Elevation + 
      (tower2Elevation - tower1Elevation) * (point.distance / distance);
    
    return {
      distance: (point.distance / 1000).toFixed(2), // km
      terrain: point.elevation,
      lineOfSight: lineOfSightElevation,
      fresnelUpper: lineOfSightElevation + point.fresnelRadius,
      fresnelLower: lineOfSightElevation - point.fresnelRadius,
      isObstructed: point.clearance && point.clearance < 0,
    };
  });

  const minElevation = Math.min(...elevationProfile.map(p => p.elevation - p.fresnelRadius));
  const maxElevation = Math.max(...elevationProfile.map(p => p.elevation + p.fresnelRadius));

  return (
    <div className="w-full h-48 bg-white rounded-lg p-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="distance" 
            label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5 }}
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
          />
          <YAxis 
            label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
            domain={[minElevation - 50, maxElevation + 50]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #D0D4DA',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: any) => `${value.toFixed(2)} m`}
          />
          
          {/* Fresnel Zone */}
          <Area
            type="monotone"
            dataKey="fresnelUpper"
            stroke="none"
            fill="#2ECE71"
            fillOpacity={0.1}
          />
          <Area
            type="monotone"
            dataKey="fresnelLower"
            stroke="none"
            fill="#2ECE71"
            fillOpacity={0.1}
          />
          
          {/* Line of Sight */}
          <Line
            type="monotone"
            dataKey="lineOfSight"
            stroke="#2563EB"
            strokeWidth={2}
            dot={false}
            name="Line of Sight"
          />
          
          {/* Terrain */}
          <Area
            type="monotone"
            dataKey="terrain"
            stroke="#8B4513"
            strokeWidth={2}
            fill="#D2691E"
            fillOpacity={0.6}
            name="Terrain"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
