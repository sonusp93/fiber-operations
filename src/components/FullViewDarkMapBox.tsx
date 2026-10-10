/// <reference types="google.maps" />
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { FatRecord } from '../data/telecomDataset';
import { Fat3DModelIcon, Hub3DModelIcon, Rsu3DModelIcon } from './ModelIcons';
import { 
  Maximize2, Crosshair, ZoomIn, ZoomOut, Navigation, 
  MapPin, Layers, Radio, Sparkles, X, ChevronRight, Compass,
  RefreshCw, Car, ExternalLink, ShieldCheck, Locate
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
  'AIzaSyAN9uZLKX3A3C3mGo8UrEnCWD9qvxMm7h0';

// Ultra-refined Deep Midnight Obsidian Custom Dark Map Styles
const DARK_MAP_BOX_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#090d16' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#05080e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8291a5' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0b1e16' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#10b981' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#151d2e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0c1220' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#fbbf24' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#111827' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#041628' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0284c7' }]
  }
];

interface FullViewDarkMapBoxProps {
  userLocation: { lat: number; lng: number };
  radiusKm: number;
  nearbyFats: (FatRecord & { distanceMeters: number; distanceText: string; bearingDegrees: number })[];
  nearbyHubs: { hub: string; rsu: string; city: string; locality: string; fatCount: number; minDistanceMeters: number; lat: number; lng: number }[];
  nearbyRsus: { rsu: string; city: string; hubCount: number; fatCount: number; minDistanceMeters: number; lat: number; lng: number }[];
  isScanning: boolean;
  scanCompleted: boolean;
  isLightMode?: boolean;
  onSelectFat: (fat: FatRecord) => void;
  onNavigateToFat?: (fat: FatRecord) => void;
  onExpandFullScreen?: () => void;
  onRadiusChange?: (km: number) => void;
  onTriggerScan?: (km: number) => void;
  onSelectHub?: (hub: { hub: string; rsu: string; city: string; locality: string; lat: number; lng: number }) => void;
  onSelectRsu?: (rsu: { rsu: string; city: string; lat: number; lng: number }) => void;
}

// Inner helper component to draw dynamic radius circle and handle camera updates
const GoogleMapRadiusOverlay: React.FC<{
  center: google.maps.LatLngLiteral;
  radiusMeters: number;
  isScanning: boolean;
  scanCompleted: boolean;
}> = ({ center, radiusMeters, isScanning, scanCompleted }) => {
  const map = useMap();
  const circleRef = useRef<google.maps.Circle | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        strokeColor: isScanning ? '#ef4444' : scanCompleted ? '#10b981' : '#06b6d4',
        strokeOpacity: 0.85,
        strokeWeight: 2,
        fillColor: isScanning ? '#ef4444' : scanCompleted ? '#10b981' : '#06b6d4',
        fillOpacity: 0.12,
        map,
        center,
        radius: radiusMeters,
        clickable: false
      });
    } else {
      circleRef.current.setCenter(center);
      circleRef.current.setRadius(radiusMeters);
      circleRef.current.setOptions({
        strokeColor: isScanning ? '#ef4444' : scanCompleted ? '#10b981' : '#06b6d4',
        fillColor: isScanning ? '#ef4444' : scanCompleted ? '#10b981' : '#06b6d4'
      });
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, center, radiusMeters, isScanning, scanCompleted]);

  return null;
};

export const FullViewDarkMapBox: React.FC<FullViewDarkMapBoxProps> = ({
  userLocation,
  radiusKm,
  nearbyFats,
  nearbyHubs,
  nearbyRsus,
  isScanning,
  scanCompleted,
  isLightMode = false,
  onSelectFat,
  onNavigateToFat,
  onExpandFullScreen,
  onRadiusChange,
  onTriggerScan,
  onSelectHub,
  onSelectRsu
}) => {
  // Category filter inside map: ALL, FAT, HUB, RSU
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'FAT' | 'HUB' | 'RSU'>('ALL');

  const [selectedNode, setSelectedNode] = useState<{
    type: 'FAT' | 'HUB' | 'RSU';
    title: string;
    subtitle: string;
    distance: string;
    lat: number;
    lng: number;
    rawFat?: FatRecord;
    rawHub?: { hub: string; rsu: string; city: string; locality: string; lat: number; lng: number };
    rawRsu?: { rsu: string; city: string; lat: number; lng: number };
  } | null>(null);

  const [mapZoom, setMapZoom] = useState<number>(() => {
    if (radiusKm <= 0.5) return 16;
    if (radiusKm <= 1) return 15;
    if (radiusKm <= 2) return 14;
    return 13;
  });

  const [mapType, setMapType] = useState<'roadmap' | 'hybrid'>('roadmap');
  const [googleMapsError, setGoogleMapsError] = useState(false);

  // Update zoom when radius changes
  useEffect(() => {
    if (radiusKm <= 0.5) setMapZoom(16);
    else if (radiusKm <= 1) setMapZoom(15);
    else if (radiusKm <= 2) setMapZoom(14);
    else setMapZoom(13);
  }, [radiusKm]);

  // Fallback vector map pan/zoom state for offline/instant load
  const [vectorPan, setVectorPan] = useState({ x: 0, y: 0 });
  const [isVectorDragging, setIsVectorDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleVectorMouseDown = (e: React.MouseEvent) => {
    setIsVectorDragging(true);
    dragStartRef.current = { x: e.clientX - vectorPan.x, y: e.clientY - vectorPan.y };
  };

  const handleVectorMouseMove = (e: React.MouseEvent) => {
    if (!isVectorDragging) return;
    setVectorPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleVectorMouseUp = () => setIsVectorDragging(false);

  const handleVectorTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsVectorDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX - vectorPan.x, y: e.touches[0].clientY - vectorPan.y };
    }
  };

  const handleVectorTouchMove = (e: React.TouchEvent) => {
    if (!isVectorDragging || e.touches.length !== 1) return;
    setVectorPan({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y
    });
  };

  const resetToCenter = () => {
    setVectorPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  // Open external Google Maps driving mode
  const handleOpenGoogleMapsDriving = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Filtered lists based on active category
  const filteredFats = useMemo(() => {
    if (activeCategory === 'ALL' || activeCategory === 'FAT') return nearbyFats;
    return [];
  }, [nearbyFats, activeCategory]);

  const filteredHubs = useMemo(() => {
    if (activeCategory === 'ALL' || activeCategory === 'HUB') return nearbyHubs;
    return [];
  }, [nearbyHubs, activeCategory]);

  const filteredRsus = useMemo(() => {
    if (activeCategory === 'ALL' || activeCategory === 'RSU') return nearbyRsus;
    return [];
  }, [nearbyRsus, activeCategory]);

  const totalItemCount = nearbyFats.length + nearbyHubs.length + nearbyRsus.length;

  const KM_LIST = [0.5, 1, 2, 3, 5];

  return (
    <div className={`relative w-full h-84 sm:h-96 md:h-[410px] rounded-2xl overflow-hidden border select-none transition-all duration-300 shadow-2xl ${
      isScanning
        ? 'border-red-500/70 shadow-[0_0_24px_rgba(239,68,68,0.35)]'
        : scanCompleted
        ? 'border-emerald-500/70 shadow-[0_0_24px_rgba(16,185,129,0.35)]'
        : isLightMode
        ? 'border-slate-300 shadow-sm'
        : 'border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.85)]'
    }`}>
      {/* 1. REAL GOOGLE DARK MAP OR FALLBACK VECTOR DARK MAP */}
      {!googleMapsError ? (
        <div className="absolute inset-0 w-full h-full">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              style={{ width: '100%', height: '100%' }}
              defaultCenter={userLocation}
              center={userLocation}
              defaultZoom={mapZoom}
              zoom={mapZoom}
              onZoomChanged={(e) => {
                const z = e.detail?.zoom;
                if (typeof z === 'number') setMapZoom(z);
              }}
              mapTypeId={mapType}
              styles={mapType === 'roadmap' ? DARK_MAP_BOX_STYLES : undefined}
              colorScheme="DARK"
              gestureHandling="greedy"
              disableDefaultUI={true}
              mapId="DEMO_DARK_BOX_MAP"
            >
              {/* Dynamic Radius Circle Overlay */}
              <GoogleMapRadiusOverlay
                center={userLocation}
                radiusMeters={radiusKm * 1000}
                isScanning={isScanning}
                scanCompleted={scanCompleted}
              />

              {/* User Technician Beacon Marker with Accurate GPS Pulse */}
              <AdvancedMarker position={userLocation} title="My Technician GPS Position">
                <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                  <div className={`w-11 h-11 rounded-full absolute transition-all duration-300 ${
                    isScanning
                      ? 'bg-red-500/30 border border-red-500 animate-ping'
                      : scanCompleted
                      ? 'bg-emerald-500/30 border border-emerald-500 animate-ping'
                      : 'bg-cyan-500/30 border border-cyan-400 animate-pulse'
                  }`} />
                  <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-[0_0_14px_#38bdf8] flex items-center justify-center z-10">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>
              </AdvancedMarker>

              {/* 1. Nearby FAT Markers with Modern 3D Icons */}
              {filteredFats.map((fat) => (
                <AdvancedMarker
                  key={`box-fat-${fat.id}`}
                  position={{ lat: fat.fatLat, lng: fat.fatLog }}
                  title={`FAT ${fat.fatId}`}
                  onClick={() => {
                    setSelectedNode({
                      type: 'FAT',
                      title: `FAT ${fat.fatId}`,
                      subtitle: `${fat.neAddress} · ${fat.locality}`,
                      distance: fat.distanceText,
                      lat: fat.fatLat,
                      lng: fat.fatLog,
                      rawFat: fat
                    });
                  }}
                >
                  <div className="cursor-pointer group hover:scale-115 active:scale-95 transition-transform flex flex-col items-center">
                    <div className="p-1 rounded-xl bg-slate-900/95 border border-cyan-400/80 shadow-[0_4px_12px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center gap-1 px-1.5">
                      <Fat3DModelIcon size="xs" isLightMode={false} />
                      <span className="text-[9.5px] font-mono font-black text-cyan-300">
                        {fat.fatId}
                      </span>
                    </div>
                    <div className="w-1 h-2 bg-cyan-400 rounded-b" />
                  </div>
                </AdvancedMarker>
              ))}

              {/* 2. Nearby HUB Markers with Modern 3D Icons */}
              {filteredHubs.map((hub) => (
                <AdvancedMarker
                  key={`box-hub-${hub.hub}`}
                  position={{ lat: hub.lat, lng: hub.lng }}
                  title={`HUB ${hub.hub}`}
                  onClick={() => {
                    setSelectedNode({
                      type: 'HUB',
                      title: `HUB ${hub.hub}`,
                      subtitle: `${hub.locality} · ${hub.fatCount} Connected FATs`,
                      distance: hub.minDistanceMeters < 1000 ? `${hub.minDistanceMeters}m` : `${(hub.minDistanceMeters / 1000).toFixed(2)}km`,
                      lat: hub.lat,
                      lng: hub.lng,
                      rawHub: hub
                    });
                  }}
                >
                  <div className="cursor-pointer group hover:scale-115 active:scale-95 transition-transform flex flex-col items-center">
                    <div className="p-1 rounded-xl bg-slate-900/95 border border-amber-400/80 shadow-[0_4px_12px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center gap-1 px-1.5">
                      <Hub3DModelIcon size="xs" isLightMode={false} />
                      <span className="text-[9.5px] font-mono font-black text-amber-300">
                        {hub.hub}
                      </span>
                    </div>
                    <div className="w-1 h-2 bg-amber-400 rounded-b" />
                  </div>
                </AdvancedMarker>
              ))}

              {/* 3. Nearby RSU Markers with Modern 3D Icons */}
              {filteredRsus.map((rsu) => (
                <AdvancedMarker
                  key={`box-rsu-${rsu.rsu}`}
                  position={{ lat: rsu.lat, lng: rsu.lng }}
                  title={`RSU ${rsu.rsu} Exchange`}
                  onClick={() => {
                    setSelectedNode({
                      type: 'RSU',
                      title: `RSU ${rsu.rsu} Substation`,
                      subtitle: `${rsu.city} Central Exchange · ${rsu.fatCount} FATs`,
                      distance: rsu.minDistanceMeters < 1000 ? `${rsu.minDistanceMeters}m` : `${(rsu.minDistanceMeters / 1000).toFixed(2)}km`,
                      lat: rsu.lat,
                      lng: rsu.lng,
                      rawRsu: rsu
                    });
                  }}
                >
                  <div className="cursor-pointer group hover:scale-115 active:scale-95 transition-transform flex flex-col items-center">
                    <div className="p-1 rounded-xl bg-slate-900/95 border border-emerald-400/80 shadow-[0_4px_12px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center gap-1 px-1.5">
                      <Rsu3DModelIcon size="xs" isLightMode={false} />
                      <span className="text-[9.5px] font-mono font-black text-emerald-300">
                        RSU {rsu.rsu}
                      </span>
                    </div>
                    <div className="w-1 h-2 bg-emerald-400 rounded-b" />
                  </div>
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        </div>
      ) : null}

      {/* 2. FALLBACK ULTRA-CRISP DARK VECTOR GIS MAP (Active if Google Maps JS is loading or offline) */}
      <div 
        onMouseDown={handleVectorMouseDown}
        onMouseMove={handleVectorMouseMove}
        onMouseUp={handleVectorMouseUp}
        onTouchStart={handleVectorTouchStart}
        onTouchMove={handleVectorTouchMove}
        onTouchEnd={handleVectorMouseUp}
        className={`absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing ${
          googleMapsError ? 'block' : 'hidden'
        }`}
        style={{
          background: 'radial-gradient(ellipse at center, #111827 0%, #090d16 60%, #030712 100%)'
        }}
      >
        <svg
          viewBox="-200 -150 400 300"
          className="w-full h-full pointer-events-none"
          style={{
            transform: `translate(${vectorPan.x}px, ${vectorPan.y}px) scale(${mapZoom / 14})`,
            transformOrigin: 'center center'
          }}
        >
          <defs>
            <radialGradient id="vectorRadiusGrad" cx="0%" cy="0%" r="50%">
              <stop offset="0%" stopColor={isScanning ? "#ef4444" : scanCompleted ? "#10b981" : "#06b6d4"} stopOpacity="0.18" />
              <stop offset="100%" stopColor={isScanning ? "#ef4444" : scanCompleted ? "#10b981" : "#06b6d4"} stopOpacity="0.02" />
            </radialGradient>
          </defs>

          {/* Grid lines & conduits */}
          <path d="M-180 -120 L180 -120 M-180 -40 L180 -40 M-180 40 L180 40 M-180 120 L180 120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M-120 -150 L-120 150 M-40 -150 L-40 150 M40 -150 L40 150 M120 -150 L120 150" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4 4" />

          {/* Road corridors */}
          <path d="M-190 -60 Q-40 -30 0 0 T190 60" stroke="#1e293b" strokeWidth="8" fill="none" />
          <path d="M-190 -60 Q-40 -30 0 0 T190 60" stroke="#334155" strokeWidth="2" fill="none" />
          <path d="M-80 -140 Q-30 -20 0 0 T90 140" stroke="#1e293b" strokeWidth="6" fill="none" />

          {/* Optical fiber trunks */}
          <path d="M-170 -50 Q-30 -10 0 0 T170 50" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="6 3" fill="none" opacity="0.75" />
          <path d="M-60 -130 Q-20 -10 0 0 T70 130" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="6 3" fill="none" opacity="0.7" />

          {/* Selected radius circle */}
          <circle
            cx="0"
            cy="0"
            r={Math.min(130, Math.max(50, radiusKm * 65))}
            fill="url(#vectorRadiusGrad)"
            stroke={isScanning ? "#ef4444" : scanCompleted ? "#10b981" : "#06b6d4"}
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Central technician marker */}
          <circle cx="0" cy="0" r="14" fill="rgba(37,99,235,0.25)" />
          <circle cx="0" cy="0" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
        </svg>

        {/* Vector nodes */}
        <div 
          className="absolute inset-0 pointer-events-auto"
          style={{
            transform: `translate(${vectorPan.x}px, ${vectorPan.y}px) scale(${mapZoom / 14})`,
            transformOrigin: 'center center'
          }}
        >
          {filteredFats.slice(0, 10).map((fat) => {
            const angleRad = (fat.bearingDegrees - 90) * (Math.PI / 180);
            const distRatio = Math.min(1.1, fat.distanceMeters / (radiusKm * 1000));
            const leftOffset = 50 + Math.cos(angleRad) * (distRatio * 38);
            const topOffset = 50 + Math.sin(angleRad) * (distRatio * 38);

            return (
              <div
                key={fat.id}
                onClick={() => {
                  setSelectedNode({
                    type: 'FAT',
                    title: `FAT ${fat.fatId}`,
                    subtitle: `${fat.neAddress} · ${fat.locality}`,
                    distance: fat.distanceText,
                    lat: fat.fatLat,
                    lng: fat.fatLog,
                    rawFat: fat
                  });
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group hover:scale-110 active:scale-95 transition-transform"
                style={{ left: `${leftOffset}%`, top: `${topOffset}%` }}
              >
                <div className="p-1 rounded-xl bg-slate-900/95 border border-cyan-400/80 shadow-lg backdrop-blur-md flex items-center gap-1 px-1.5">
                  <Fat3DModelIcon size="xs" isLightMode={false} />
                  <span className="text-[9.5px] font-mono font-black text-cyan-300">
                    {fat.fatId}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. DYNAMIC SCANNING LASER SWEEP OVERLAY */}
      {isScanning && (
        <div 
          className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0) 100%)'
          }}
        >
          <div 
            className="w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_#ef4444] animate-bounce"
            style={{ animationDuration: '1.2s' }}
          />
        </div>
      )}

      {/* 4. TOP HUD BAR INSIDE THE MAP: ACCURATE GPS STATUS & FULL VIEW EXPAND BUTTON */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-2 pointer-events-none">
        {/* Left: Accurate Location Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/85 border border-white/15 text-slate-200 backdrop-blur-md shadow-lg pointer-events-auto">
          <span className={`w-2 h-2 rounded-full ${
            isScanning ? 'bg-red-400 animate-ping' : scanCompleted ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400 animate-pulse'
          }`} />
          <span className="text-[10px] font-mono font-bold text-cyan-300">
            {isScanning ? 'SCANNING...' : `±3m RTK · ${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)}`}
          </span>
        </div>

        {/* Right Map Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Re-Scan Button (1-Time, zero battery drain) */}
          {onTriggerScan && (
            <button
              onClick={() => onTriggerScan(radiusKm)}
              className="p-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-white/15 text-slate-200 shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer"
              title="1-Time Radar Scan (Saves Battery)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-red-400' : 'text-emerald-400'}`} />
            </button>
          )}

          {/* Toggle Roadmap / Satellite */}
          <button
            onClick={() => setMapType(mapType === 'roadmap' ? 'hybrid' : 'roadmap')}
            className="p-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-white/15 text-slate-200 shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer"
            title="Toggle Dark Street / Satellite Layer"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* Re-center GPS */}
          <button
            onClick={resetToCenter}
            className="p-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-white/15 text-slate-200 shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer"
            title="Re-Center My Location"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Zoom In */}
          <button
            onClick={() => setMapZoom((z) => Math.min(z + 1, 18))}
            className="p-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-white/15 text-slate-200 shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => setMapZoom((z) => Math.max(z - 1, 11))}
            className="p-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-white/15 text-slate-200 shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* FULL VIEW MAP EXPAND BUTTON */}
          {onExpandFullScreen && (
            <button
              onClick={onExpandFullScreen}
              className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 border border-blue-400 text-white text-[10px] font-mono font-bold shadow-lg shadow-blue-600/30 backdrop-blur-md transition-all active:scale-90 cursor-pointer flex items-center gap-1"
              title="Open Full View Map"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">FULL VIEW</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. KM COUNT FOR FAT, HUB, RSU ALL (INSIDE THE MAP BOX OVERLAY) */}
      <div className="absolute top-12 left-2.5 right-2.5 z-20 flex items-center justify-between gap-2 pointer-events-none flex-wrap">
        {/* Category count badges */}
        <div className="flex items-center gap-1.5 pointer-events-auto p-1 rounded-xl bg-slate-950/90 border border-white/15 backdrop-blur-md shadow-xl text-xs font-mono">
          {/* ALL Items Tab */}
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            ALL ({totalItemCount})
          </button>

          {/* FATs Count with 3D Icon */}
          <button
            onClick={() => setActiveCategory('FAT')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeCategory === 'FAT'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-cyan-300 hover:bg-white/10'
            }`}
          >
            <Fat3DModelIcon size="xs" isLightMode={false} />
            <span>FATs ({nearbyFats.length})</span>
          </button>

          {/* HUBs Count with 3D Icon */}
          <button
            onClick={() => setActiveCategory('HUB')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeCategory === 'HUB'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-amber-300 hover:bg-white/10'
            }`}
          >
            <Hub3DModelIcon size="xs" isLightMode={false} />
            <span>HUBs ({nearbyHubs.length})</span>
          </button>

          {/* RSUs Count with 3D Icon */}
          <button
            onClick={() => setActiveCategory('RSU')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              activeCategory === 'RSU'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-emerald-300 hover:bg-white/10'
            }`}
          >
            <Rsu3DModelIcon size="xs" isLightMode={false} />
            <span>RSUs ({nearbyRsus.length})</span>
          </button>
        </div>

        {/* Selected KM Radius Indicator */}
        <div className="flex items-center gap-1 pointer-events-auto p-1 rounded-xl bg-slate-950/90 border border-white/15 backdrop-blur-md shadow-xl text-[10px] font-mono">
          <span className="text-slate-400 px-1 font-semibold">RANGE:</span>
          {KM_LIST.map((km) => (
            <button
              key={km}
              onClick={() => onRadiusChange?.(km)}
              className={`px-1.5 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                radiusKm === km
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              {km}K
            </button>
          ))}
        </div>
      </div>

      {/* 6. BOTTOM TELEMETRY BAR INSIDE THE BOX */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-950/85 border border-white/15 px-2.5 py-1 rounded-xl backdrop-blur-md text-[9.5px] font-mono text-slate-300">
          <span className="flex items-center gap-1 text-cyan-400 font-bold">
            <Compass className="w-3 h-3" />
            CUSTOM DARK MAP
          </span>
          <span className="opacity-40">|</span>
          <span className="text-emerald-400 font-semibold">
            {totalItemCount} RADAR ITEMS INSIDE {radiusKm} KM
          </span>
        </div>

        {/* Scale Legend */}
        <div className="bg-slate-950/85 border border-white/15 px-2 py-0.5 rounded-lg backdrop-blur-md text-[9px] font-mono text-slate-400 flex items-center gap-1">
          <div className="w-8 h-1 bg-cyan-400 rounded-full" />
          <span>{radiusKm < 1 ? '250m' : '500m'}</span>
        </div>
      </div>

      {/* 7. INTERACTIVE NODE INSPECTION CARD (Tapped Marker Inside Box) */}
      {selectedNode && (
        <div className="absolute bottom-11 left-3 right-3 z-30 max-w-sm mx-auto bg-slate-950/95 border border-cyan-400/50 rounded-2xl p-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {selectedNode.type === 'FAT' ? (
                <Fat3DModelIcon size="sm" isLightMode={false} />
              ) : selectedNode.type === 'HUB' ? (
                <Hub3DModelIcon size="sm" isLightMode={false} />
              ) : (
                <Rsu3DModelIcon size="sm" isLightMode={false} />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-black text-cyan-300">
                    {selectedNode.title}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 rounded bg-emerald-500/15 text-emerald-400">
                    {selectedNode.distance}
                  </span>
                </div>
                <div className="text-[10.5px] text-slate-400 truncate mt-0.5">
                  {selectedNode.subtitle}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2.5 mt-2 border-t border-white/10">
            {/* IN-APP NAVIGATION */}
            {selectedNode.rawFat && onNavigateToFat && (
              <button
                onClick={() => {
                  if (selectedNode.rawFat && onNavigateToFat) onNavigateToFat(selectedNode.rawFat);
                }}
                className="flex-1 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 fill-current" />
                <span>Navigate</span>
              </button>
            )}

            {/* SWITCH TO GOOGLE MAPS DRIVING MODE */}
            <button
              onClick={() => handleOpenGoogleMapsDriving(selectedNode.lat, selectedNode.lng)}
              className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              title="Open Google Maps Driving Mode"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3 opacity-75" />
            </button>

            {/* INSPECT DETAILS */}
            {selectedNode.rawFat && (
              <button
                onClick={() => {
                  if (selectedNode.rawFat) onSelectFat(selectedNode.rawFat);
                }}
                className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold font-mono flex items-center justify-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                title="View Full Details"
              >
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
