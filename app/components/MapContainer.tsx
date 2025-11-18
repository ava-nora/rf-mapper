'use client';

import { useEffect, useRef, useState } from 'react';
import { Tower, Link, FresnelZoneData } from '@/app/types';
import { calculateFresnelZone } from '@/app/utils/calculations';
import { fetchElevationProfile } from '@/app/utils/elevation';
import { ElevationChart } from '@/app/components/ElevationChart';
import { Card } from '@/app/ui/Card';
import { AlertTriangleIcon, ChartAreaIcon, CheckIcon, LightbulbIcon, X } from 'lucide-react';

interface MapContainerProps {
    towers: Tower[];
    links: Link[];
    selectedTower: string | null;
    selectedLink: string | null;
    connectingTowerId: string | null;
    onMapClick: (lat: number, lng: number) => void;
    onTowerClick: (towerId: string) => void;
    onLinkClick: (linkId: string | null) => void;
}

// Define Leaflet types
declare global {
    interface Window {
        L: any;
    }
}

export const MapContainer = ({
    towers,
    links,
    selectedTower,
    selectedLink,
    connectingTowerId,
    onMapClick,
    onTowerClick,
    onLinkClick,
}: MapContainerProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<{ [key: string]: any }>({});
    const linesRef = useRef<{ [key: string]: any }>({});
    const fresnelZoneRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fresnelData, setFresnelData] = useState<FresnelZoneData | null>(null);
    const [leafletLoaded, setLeafletLoaded] = useState(false);

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Check if Leaflet is already loaded
        if (window.L) {
            initializeMap();
            return;
        }

        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
            link.crossOrigin = '';
            document.head.appendChild(link);
        }

        // Load Leaflet JS
        if (!document.querySelector('script[src*="leaflet"]')) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.async = true;
            script.onload = () => {
                setLeafletLoaded(true);
                initializeMap();
            };
            document.head.appendChild(script);
        }

        function initializeMap() {
            if (!mapRef.current || !window.L || mapInstanceRef.current) return;

            const L = window.L;

            // Initialize map centered on US
            const map = L.map(mapRef.current, {
                center: [39.8283, -98.5795],
                zoom: 5,
                zoomControl: true,
            });

            mapInstanceRef.current = map;

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            // Handle map clicks
            map.on('click', (e: any) => {
                console.log('Map clicked:', e.latlng);
                onMapClick(e.latlng.lat, e.latlng.lng);
            });

            setLeafletLoaded(true);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [onMapClick]);

    // Update towers
    useEffect(() => {
        if (!mapInstanceRef.current || !window.L) return;

        const L = window.L;

        // Remove old markers
        Object.values(markersRef.current).forEach((marker: any) => marker.remove());
        markersRef.current = {};

        // Add new markers
        towers.forEach(tower => {
            const isSelected = selectedTower === tower.id;
            const isConnecting = connectingTowerId === tower.id;

            // Improved marker styling with glow effect
            const markerColor = isConnecting ? '#f59e0b' : isSelected ? '#2563EB' : '#4B5563';
            const glowColor = isConnecting ? 'rgba(245, 158, 11, 0.4)' : isSelected ? 'rgba(37, 99, 235, 0.4)' : 'rgba(75, 85, 99, 0.2)';

            const icon = L.divIcon({
                className: 'custom-tower-marker',
                html: `
            <div style="
              width: 32px;
              height: 32px;
              background-color: ${markerColor};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 3px 8px rgba(0,0,0,0.3), 0 0 0 ${isConnecting || isSelected ? '8px' : '4px'} ${glowColor};
              cursor: ${connectingTowerId ? 'crosshair' : 'pointer'};
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.15s ease-in-out;
            ">
              <span style="font-size: 14px;">📡</span>
            </div>
          `,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });

            const marker = L.marker([tower.lat, tower.lng], { icon })
                .addTo(mapInstanceRef.current)
                .bindTooltip(
                    `<div style="text-align: center;">
              <strong>${tower.frequency} GHz</strong><br/>
              <small>${tower.lat.toFixed(4)}, ${tower.lng.toFixed(4)}</small><br/>
              <em style="color: #64748B; font-size: 11px;">Click to select</em>
            </div>`,
                    { permanent: false, direction: 'top', offset: [0, -16] }
                );

            marker.on('click', (e: any) => {
                L.DomEvent.stopPropagation(e);
                onTowerClick(tower.id);
            });

            markersRef.current[tower.id] = marker;
        });
    }, [towers, selectedTower, connectingTowerId, onTowerClick]);

    // Update links
    useEffect(() => {
        if (!mapInstanceRef.current || !window.L) return;

        const L = window.L;

        // Remove old lines
        Object.values(linesRef.current).forEach((line: any) => line.remove());
        linesRef.current = {};

        // Add new lines
        links.forEach(link => {
            const tower1 = towers.find(t => t.id === link.tower1Id);
            const tower2 = towers.find(t => t.id === link.tower2Id);

            if (tower1 && tower2) {
                const isSelected = selectedLink === link.id;
                const distance = calculateDistance(tower1, tower2);

                // Improved link colors
                const polyline = L.polyline(
                    [[tower1.lat, tower1.lng], [tower2.lat, tower2.lng]],
                    {
                        color: isSelected ? '#2F9E44' : '#1C7ED6',
                        weight: isSelected ? 5 : 3,
                        opacity: 0.9,
                    }
                ).addTo(mapInstanceRef.current);

                polyline.bindTooltip(
                    `<div style="text-align: center;">
              <strong>${link.frequency} GHz</strong><br/>
              <span>${(distance / 1000).toFixed(2)} km</span><br/>
              <em style="color: #64748B; font-size: 11px;">Click to view Fresnel zone</em>
            </div>`,
                    { sticky: true }
                );

                polyline.on('click', (e: any) => {
                    L.DomEvent.stopPropagation(e);
                    onLinkClick(link.id);
                });

                linesRef.current[link.id] = polyline;
            }
        });
    }, [links, towers, selectedLink, onLinkClick]);

    // Update Fresnel zone
    useEffect(() => {
        if (!mapInstanceRef.current || !window.L) return;

        const L = window.L;

        // Remove old Fresnel zone
        if (fresnelZoneRef.current) {
            fresnelZoneRef.current.remove();
            fresnelZoneRef.current = null;
        }
        setFresnelData(null);

        if (selectedLink) {
            const link = links.find(l => l.id === selectedLink);
            if (link) {
                const tower1 = towers.find(t => t.id === link.tower1Id);
                const tower2 = towers.find(t => t.id === link.tower2Id);

                if (tower1 && tower2) {
                    setIsLoading(true);

                    // Fetch elevation and calculate Fresnel zone
                    fetchElevationProfile(tower1, tower2).then(elevationProfile => {
                        const fresnelZoneData = calculateFresnelZone(tower1, tower2, link.frequency, elevationProfile);
                        setFresnelData(fresnelZoneData);

                        // Draw Fresnel zone ellipse
                        const distance = calculateDistance(tower1, tower2);
                        const maxRadius = fresnelZoneData.height / 2;

                        // Create points for ellipse
                        const points: [number, number][] = [];
                        const numPoints = 50;

                        for (let i = 0; i <= numPoints; i++) {
                            const t = (i / numPoints) * 2 * Math.PI;
                            const x = (distance / 2) * Math.cos(t);
                            const y = maxRadius * Math.sin(t);

                            // Rotate and translate
                            const rotatedX = x * Math.cos(fresnelZoneData.rotation) - y * Math.sin(fresnelZoneData.rotation);
                            const rotatedY = x * Math.sin(fresnelZoneData.rotation) + y * Math.cos(fresnelZoneData.rotation);

                            const lat = fresnelZoneData.center[0] + (rotatedY / 111320);
                            const lng = fresnelZoneData.center[1] + (rotatedX / (111320 * Math.cos(fresnelZoneData.center[0] * Math.PI / 180)));

                            points.push([lat, lng]);
                        }

                        fresnelZoneRef.current = L.polygon(points, {
                            color: '#10b981',
                            fillColor: '#10b981',
                            fillOpacity: 0.15,
                            weight: 2,
                            dashArray: '5, 5',
                        }).addTo(mapInstanceRef.current);

                        setIsLoading(false);
                    }).catch(error => {
                        console.error('Error calculating Fresnel zone:', error);
                        setIsLoading(false);
                    });
                }
            }
        }
    }, [selectedLink, links, towers]);

    return (
        <div className="relative flex-1">
            <div ref={mapRef} className="h-full w-full" />

            {/* Map loading indicator */}
            {!leafletLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center z-500 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white text-lg">🗺️</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-700 font-semibold text-lg">Loading map...</p>
                        <p className="text-slate-500 text-sm mt-1">Please wait</p>
                    </div>
                </div>
            )}

            {/* Instructions overlay - Hidden on mobile since ControlPanel has Quick Guide */}
            {leafletLoaded && (
                <div className="hidden md:block absolute top-4 left-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 p-5 max-w-sm z-500 animate-in slide-in-from-left duration-300">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center shadow-lg ring-4 ring-gray-300/30">
                            <LightbulbIcon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Quick Guide</h3>
                    </div>
                    <ul className="space-y-2 text-gray-600 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-gray-600 mt-0.5">•</span>
                            <span>Click map to place towers</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-gray-600 mt-0.5">•</span>
                            <span>Select tower and click "Connect" to link</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-gray-600 mt-0.5">•</span>
                            <span>Towers must have matching frequencies</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-gray-600 mt-0.5">•</span>
                            <span>Click links to view Fresnel zones</span>
                        </li>
                    </ul>
                    {connectingTowerId && (
                        <div className="mt-4 p-3 bg-gray-50 border-2 border-gray-300/60 rounded-xl shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                <p className="text-gray-800 font-medium text-sm">Click another tower to connect...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
                <div className="absolute top-16 md:top-4 right-2 md:right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/60 p-3 md:p-4 z-500 animate-in slide-in-from-right duration-300 max-w-[calc(100%-1rem)] md:max-w-none">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-blue-200 border-t-blue-600 flex-shrink-0"></div>
                        <p className="text-slate-700 font-medium text-xs md:text-sm">Calculating Fresnel zone...</p>
                    </div>
                </div>
            )}

            {/* Fresnel zone info */}
            {fresnelData && fresnelData.elevationProfile && (
                <Card className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-auto max-w-2xl z-500 p-4 md:p-6 bg-gray-50">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black flex items-center justify-center shadow-lg ring-4 ring-gray-300 flex-shrink-0">
                            <ChartAreaIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-slate-900 font-bold text-base md:text-lg truncate">Fresnel Zone Analysis</h3>
                            <p className="text-gray-600 text-xs md:text-sm">First Fresnel zone evaluation</p>
                        </div>
                        <button
                            onClick={() => onLinkClick(null)}
                            className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer flex-shrink-0"
                            aria-label="Close Fresnel zone analysis"
                        >
                            <X className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 md:gap-3 mb-2">
                        <div className="bg-white rounded-lg md:rounded-xl p-2.5 md:p-4 border border-slate-200/60">
                            <p className="text-slate-500 text-[10px] md:text-xs font-medium mb-1 md:mb-1.5 uppercase tracking-wide">Max Radius</p>
                            <p className="text-slate-900 font-bold text-sm md:text-lg">{(fresnelData.height / 2).toFixed(2)} m</p>
                        </div>
                        <div className="bg-white rounded-lg md:rounded-xl p-2.5 md:p-4 border border-slate-200/60">
                            <p className="text-slate-500 text-[10px] md:text-xs font-medium mb-1 md:mb-1.5 uppercase tracking-wide">Distance</p>
                            <p className="text-slate-900 font-bold text-sm md:text-lg">{(fresnelData.width / 1000).toFixed(2)} km</p>
                        </div>
                        <div className="bg-white rounded-lg md:rounded-xl p-2.5 md:p-4 border border-slate-200/60">
                            <p className="text-slate-500 text-[10px] md:text-xs font-medium mb-1 md:mb-1.5 uppercase tracking-wide">Frequency</p>
                            <p className="text-slate-900 font-bold text-sm md:text-lg">
                                {links.find(l => l.id === selectedLink)?.frequency || 0} GHz
                            </p>
                        </div>
                    </div>

                    {/* Elevation Chart */}
                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-md border border-slate-200/60 mb-4 md:mb-5">
                        <h4 className="text-slate-900 font-semibold mb-2 md:mb-3 text-xs md:text-sm uppercase tracking-wide">Elevation Profile</h4>
                        <div className="w-full overflow-x-auto">
                            <ElevationChart
                                elevationProfile={fresnelData.elevationProfile}
                                distance={fresnelData.width}
                            />
                        </div>
                    </div>

                    {/* Status */}
                    {fresnelData.elevationProfile.some(p => p.clearance && p.clearance < 0) ? (
                        <div className="p-3 md:p-4 bg-red-50 border border-red-300 rounded-lg md:rounded-xl">
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-red-300/30">
                                <AlertTriangleIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-red-900 font-bold text-sm md:text-base">Obstruction Detected</p>
                                    <p className="text-red-700 text-xs md:text-sm">
                                        Terrain obstructs the Fresnel zone. Signal quality may be affected.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 md:p-4 bg-emerald-50 border border-emerald-300 rounded-lg md:rounded-xl">
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-emerald-300/30">
                                    <CheckIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-emerald-900 font-bold text-sm md:text-base">Clear Path</p>
                                    <p className="text-emerald-700 text-xs md:text-sm">
                                        No terrain obstructions detected. Optimal signal propagation expected.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

function calculateDistance(tower1: Tower, tower2: Tower): number {
    const R = 6371000; // Earth's radius in meters
    const lat1 = tower1.lat * Math.PI / 180;
    const lat2 = tower2.lat * Math.PI / 180;
    const deltaLat = (tower2.lat - tower1.lat) * Math.PI / 180;
    const deltaLng = (tower2.lng - tower1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}