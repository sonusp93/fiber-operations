/// <reference types="google.maps" />
// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { NavigationTarget } from './InbuiltDirectionMap';
import { calculateGpsDistanceMeters, calculateBearingDegrees, getCompassHeading } from '../data/telecomDataset';
import { 
  ArrowLeft, Navigation, Compass, Layers, Footprints, Car, Bike, 
  RotateCcw, Sparkles as LucideSparkles, ChevronDown, ExternalLink, Moon, Sun
} from 'lucide-react';

const Sparkles = LucideSparkles || ((props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
));

const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyAN9uZLKX3A3C3mGo8UrEnCWD9qvxMm7h0';

interface GoogleMapsNavigationProps {
  target: NavigationTarget;
  onBack: () => void;
  isLightMode?: boolean;
}

// Custom dark mode styling for Google Maps (Telecom Night / Dark Mocha Palette)
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#181412' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#120f0e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9c948e' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#685f59' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#13231c' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#34d399' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#27201d' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1d1715' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d1cbc5' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3d302a' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#291e19' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#fbbf24' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#221b18' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#22d3ee' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#091522' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#091522' }]
  }
];

// Inner route rendering component
function GoogleRouteLayer({
  origin,
  destination,
  travelMode,
  isDark,
  onStepsUpdated
}: {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  travelMode: 'DRIVING' | 'WALKING' | 'BICYCLING';
  isDark: boolean;
  onStepsUpdated: (info: { distanceText: string; durationText: string; steps: string[] }) => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  const renderDirectCorridorRoute = useCallback(() => {
    if (!map) return;

    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    const dLat = destination.lat - origin.lat;
    const dLng = destination.lng - origin.lng;

    const p1 = {
      lat: origin.lat + dLat * 0.35,
      lng: origin.lng + dLng * 0.08
    };
    const p2 = {
      lat: origin.lat + dLat * 0.72,
      lng: origin.lng + dLng * 0.88
    };

    const path = [origin, p1, p2, destination];

    // High-visibility glowing cyan underlay (customized for dark mode)
    const glowPolyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#06b6d4',
      strokeOpacity: isDark ? 0.45 : 0.3,
      strokeWeight: 10,
      map
    });

    // Vibrant core route line
    const corePolyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: isDark ? '#10b981' : '#059669',
      strokeOpacity: 0.95,
      strokeWeight: 4.5,
      map
    });

    polylinesRef.current = [glowPolyline, corePolyline];

    const bounds = new google.maps.LatLngBounds();
    path.forEach((pt) => bounds.extend(pt));
    map.fitBounds(bounds, { top: 80, right: 40, bottom: 90, left: 40 });

    const dist = calculateGpsDistanceMeters(origin.lat, origin.lng, destination.lat, destination.lng);
    const speedMps = travelMode === 'DRIVING' ? 10 : travelMode === 'BICYCLING' ? 4 : 1.3;
    const durationMinutes = Math.max(1, Math.round(dist / speedMps / 60));

    onStepsUpdated({
      distanceText: dist < 1000 ? `${dist} m` : `${(dist / 1000).toFixed(2)} km`,
      durationText: `${durationMinutes} mins`,
      steps: [
        `Depart field location along municipal access corridor toward ${destination.lat.toFixed(4)}°N`,
        'Follow main optical fiber right-of-way toward target network sector',
        `Turn right onto access lane leading to terminal site`,
        `Arrive at terminal node site (${destination.lat.toFixed(5)}, ${destination.lng.toFixed(5)})`
      ]
    });
  }, [map, origin, destination, travelMode, isDark, onStepsUpdated]);

  useEffect(() => {
    if (!map) return;

    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    let isCancelled = false;

    try {
      if (typeof google !== 'undefined' && google.maps && google.maps.DirectionsService) {
        const directionsService = new google.maps.DirectionsService();
        const mode =
          travelMode === 'WALKING'
            ? google.maps.TravelMode.WALKING
            : travelMode === 'BICYCLING'
            ? google.maps.TravelMode.BICYCLING
            : google.maps.TravelMode.DRIVING;

        directionsService.route(
          {
            origin,
            destination,
            travelMode: mode
          },
          (result, status) => {
            if (isCancelled || !map) return;
            if (status === google.maps.DirectionsStatus.OK && result && result.routes[0]) {
              const primaryRoute = result.routes[0];
              const overviewPoints = primaryRoute.overview_path.map((pt) => ({
                lat: pt.lat(),
                lng: pt.lng()
              }));

              const glowPolyline = new google.maps.Polyline({
                path: overviewPoints,
                geodesic: true,
                strokeColor: '#06b6d4',
                strokeOpacity: isDark ? 0.45 : 0.3,
                strokeWeight: 10,
                map
              });

              const corePolyline = new google.maps.Polyline({
                path: overviewPoints,
                geodesic: true,
                strokeColor: isDark ? '#10b981' : '#059669',
                strokeOpacity: 0.95,
                strokeWeight: 4.5,
                map
              });

              polylinesRef.current = [glowPolyline, corePolyline];

              if (primaryRoute.bounds) {
                map.fitBounds(primaryRoute.bounds, { top: 80, right: 40, bottom: 90, left: 40 });
              }

              const leg = primaryRoute.legs[0];
              const distText = leg?.distance?.text || '1.2 km';
              const durText = leg?.duration?.text || '3 mins';
              const steps = leg?.steps?.map((s) => s.instructions.replace(/<[^>]*>/g, '')) || [
                'Proceed along optical fiber conduit right-of-way',
                'Follow calculated road route',
                'Arrive at target network terminal'
              ];

              onStepsUpdated({
                distanceText: distText,
                durationText: durText,
                steps
              });
              return;
            }

            renderDirectCorridorRoute();
          }
        );

        return () => {
          isCancelled = true;
          polylinesRef.current.forEach((p) => p.setMap(null));
          polylinesRef.current = [];
        };
      }
    } catch {
      // Fallback
    }

    renderDirectCorridorRoute();

    return () => {
      isCancelled = true;
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, origin, destination, travelMode, renderDirectCorridorRoute, onStepsUpdated, isDark]);

  return null;
}

export const GoogleMapsNavigation: React.FC<GoogleMapsNavigationProps> = ({
  target,
  onBack,
  isLightMode = false
}) => {
  const initialOrigin = useMemo(() => ({
    lat: target.lat + 0.0035,
    lng: target.lng + 0.0028
  }), [target]);

  const [currentGps, setCurrentGps] = useState(initialOrigin);
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');
  
  // Independent dark mode toggle for Google Maps navigation (defaulting to App theme)
  const [isMapDarkMode, setIsMapDarkMode] = useState(!isLightMode);
  
  const [travelMode, setTravelMode] = useState<'DRIVING' | 'WALKING' | 'BICYCLING'>('DRIVING');
  const [routeInfo, setRouteInfo] = useState<{
    distanceText: string;
    durationText: string;
    steps: string[];
  }>({
    distanceText: 'Calculating...',
    durationText: '...',
    steps: []
  });
  const [showStepsList, setShowStepsList] = useState(false);

  // Sync if target changes
  useEffect(() => {
    setCurrentGps(initialOrigin);
  }, [initialOrigin]);

  // Sync with global theme changes
  useEffect(() => {
    setIsMapDarkMode(!isLightMode);
  }, [isLightMode]);

  const destination = useMemo(() => ({
    lat: target.lat,
    lng: target.lng
  }), [target]);

  const distanceMeters = calculateGpsDistanceMeters(
    currentGps.lat,
    currentGps.lng,
    target.lat,
    target.lng
  );

  const bearing = calculateBearingDegrees(
    currentGps.lat,
    currentGps.lng,
    target.lat,
    target.lng
  );

  const heading = getCompassHeading(bearing);

  const handleStepCloser = () => {
    setCurrentGps((prev) => {
      const remainingLat = target.lat - prev.lat;
      const remainingLng = target.lng - prev.lng;
      if (Math.abs(remainingLat) < 0.0001 && Math.abs(remainingLng) < 0.0001) {
        return { lat: target.lat, lng: target.lng };
      }
      return {
        lat: prev.lat + remainingLat * 0.35,
        lng: prev.lng + remainingLng * 0.35
      };
    });
  };

  const openInExternalMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${currentGps.lat},${currentGps.lng}&destination=${target.lat},${target.lng}&travelmode=${travelMode.toLowerCase()}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden select-none animate-view-120 ${
      !isMapDarkMode ? 'bg-[#f4f2ef] text-neutral-900' : 'bg-[#100e0d] text-neutral-100'
    }`}>
      {/* TOP IN-APP NAVIGATION HEADER */}
      <div className={`flex-shrink-0 border-b p-3 z-30 space-y-2 backdrop-blur-2xl shadow-xl ${
        !isMapDarkMode ? 'bg-white/95 border-neutral-200' : 'bg-[#181412]/95 border-white/10'
      }`}>
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-xs font-semibold cursor-pointer transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/40 text-cyan-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Google Maps {isMapDarkMode ? 'Dark' : 'Light'}</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 truncate max-w-[120px] sm:max-w-[150px]">
              {target.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Dark Mode / Night Mode Toggle */}
            <button
              onClick={() => setIsMapDarkMode(!isMapDarkMode)}
              className={`p-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                isMapDarkMode
                  ? 'bg-neutral-800 text-cyan-300 border-cyan-500/50 shadow-sm'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
              title={isMapDarkMode ? 'Switch to Light Map' : 'Switch to Dark Map'}
            >
              {isMapDarkMode ? <Moon className="w-3.5 h-3.5 text-cyan-300" /> : <Sun className="w-3.5 h-3.5 text-amber-600" />}
              <span className="text-[10px] font-bold">{isMapDarkMode ? 'Dark' : 'Light'}</span>
            </button>

            {/* Satellite vs Roadmap Toggle */}
            <button
              onClick={() => setMapType(mapType === 'roadmap' ? 'hybrid' : 'roadmap')}
              className={`p-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                mapType === 'hybrid'
                  ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                  : !isMapDarkMode
                  ? 'bg-neutral-100 border-neutral-300 text-neutral-800'
                  : 'bg-[#251e1b] border-white/10 text-neutral-300'
              }`}
              title="Toggle Satellite Imagery"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[10px]">{mapType === 'hybrid' ? 'Satellite' : 'Road'}</span>
            </button>
          </div>
        </div>

        {/* Live Directions Banner */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 shadow-md ${
          !isMapDarkMode ? 'bg-neutral-100 border-neutral-300' : 'bg-[#120f0e] border-cyan-500/30'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/90 border border-cyan-700/60 flex items-center justify-center shrink-0 text-cyan-400">
              <Navigation className="w-5 h-5 fill-cyan-400" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">
                {distanceMeters < 15
                  ? `Arrived at ${target.name}`
                  : routeInfo.steps[0] || `Heading ${heading} toward ${target.locality}`}
              </div>
              <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                {target.subtitle} ({target.city})
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-base font-extrabold text-emerald-400 font-mono">
              {routeInfo.distanceText}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono">
              {routeInfo.durationText}
            </div>
          </div>
        </div>

        {/* Travel Mode Selector & External Maps Link */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex gap-1.5">
            {[
              { id: 'DRIVING' as const, label: 'Drive', icon: <Car className="w-3.5 h-3.5" /> },
              { id: 'WALKING' as const, label: 'Walk', icon: <Footprints className="w-3.5 h-3.5" /> },
              { id: 'BICYCLING' as const, label: 'Bike', icon: <Bike className="w-3.5 h-3.5" /> }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setTravelMode(m.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                  travelMode === m.id
                    ? 'bg-cyan-500 text-black font-bold shadow-sm'
                    : !isMapDarkMode
                    ? 'bg-neutral-200/80 text-neutral-700'
                    : 'bg-[#251e1b] text-neutral-400 hover:text-white border border-white/5'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={openInExternalMaps}
            className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-mono font-semibold"
            title="Open in Native Google Maps Navigation App"
          >
            <span>Google App</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* EMBEDDED GOOGLE MAP VIEWPORT (WITH REAL DARK MODE THEME STYLING) */}
      <div className="flex-1 w-full h-full relative overflow-hidden" style={{ minHeight: '340px' }}>
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['routes', 'marker']}>
          <Map
            style={{ width: '100%', height: '100%' }}
            defaultCenter={destination}
            defaultZoom={15}
            mapTypeId={mapType}
            styles={isMapDarkMode && mapType === 'roadmap' ? DARK_MAP_STYLES : undefined}
            colorScheme={isMapDarkMode ? 'DARK' : 'LIGHT'}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            {/* Route Layer */}
            <GoogleRouteLayer
              origin={currentGps}
              destination={destination}
              travelMode={travelMode}
              isDark={isMapDarkMode}
              onStepsUpdated={(info) => setRouteInfo(info)}
            />

            {/* Target Node Marker (FAT, HUB, or RSU) */}
            <AdvancedMarker position={destination} title={target.name}>
              <Pin
                background="#10b981"
                borderColor="#064e3b"
                glyphColor="#ffffff"
                scale={1.15}
              />
            </AdvancedMarker>

            {/* Field Technician GPS Marker */}
            <AdvancedMarker position={currentGps} title="Field Technician Location">
              <div className="relative flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-cyan-500/25 animate-ping absolute" />
                <div className="w-6 h-6 rounded-full bg-cyan-500 border-2 border-white shadow-[0_0_12px_#06b6d4] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
            </AdvancedMarker>
          </Map>
        </APIProvider>
      </div>

      {/* BOTTOM CONTROLS & STEP-BY-STEP MANEUVER DRAWER */}
      <div className={`flex-shrink-0 border-t p-3 z-30 space-y-2 backdrop-blur-2xl ${
        !isMapDarkMode ? 'bg-white/95 border-neutral-200' : 'bg-[#181412]/95 border-white/10'
      }`}>
        <div className="flex items-center gap-2">
          {/* Step Closer Along Route */}
          <button
            onClick={handleStepCloser}
            disabled={distanceMeters <= 5}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-950/40 transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
          >
            <Navigation className="w-4 h-4 fill-black" />
            <span>Simulate Step Along Route</span>
          </button>

          {/* Reset Origin GPS */}
          <button
            onClick={() => setCurrentGps(initialOrigin)}
            className={`p-2.5 rounded-2xl border flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px] active:scale-95 ${
              !isMapDarkMode ? 'bg-neutral-100 border-neutral-300 text-neutral-700' : 'bg-[#251e1b] border-white/10 text-cyan-400'
            }`}
            title="Reset Origin"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Expand Steps Drawer */}
          <button
            onClick={() => setShowStepsList(!showStepsList)}
            className={`px-3 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer min-h-[44px] active:scale-95 ${
              !isMapDarkMode ? 'bg-neutral-100 border-neutral-300 text-neutral-800' : 'bg-[#251e1b] border-white/10 text-white'
            }`}
          >
            <span>Turn Steps</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showStepsList ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Turn-by-Turn Maneuvers Drawer */}
        {showStepsList && (
          <div className={`p-3 rounded-2xl border max-h-48 overflow-y-auto space-y-2 text-xs animate-in fade-in duration-150 ${
            !isMapDarkMode ? 'bg-neutral-100 border-neutral-200' : 'bg-[#120f0e] border-white/8'
          }`}>
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold px-1">
              Google Maps Turn-by-Turn Directions ({routeInfo.steps.length} Steps)
            </div>
            {routeInfo.steps.map((st, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-[11px] leading-relaxed">{st}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
