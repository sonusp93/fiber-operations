import React, { useState, useMemo, useEffect } from 'react';
import { calculateGpsDistanceMeters, calculateBearingDegrees, getCompassHeading } from '../data/telecomDataset';
import { Navigation, Compass, ArrowUp, ArrowRight, ArrowLeft, CheckCircle2, RotateCcw, ZoomIn, ZoomOut, ChevronDown, Network, Server, Box } from 'lucide-react';

export interface NavigationTarget {
  id: string;
  name: string;
  type: 'FAT' | 'HUB' | 'RSU';
  lat: number;
  lng: number;
  subtitle: string;
  city: string;
  locality: string;
  ponPort?: string;
  totalCap?: number;
  hub?: string;
  rsu?: string;
  rfsDate?: string;
}

interface InbuiltDirectionMapProps {
  target: NavigationTarget;
  onBack: () => void;
  isLightMode?: boolean;
}

export const InbuiltDirectionMap: React.FC<InbuiltDirectionMapProps> = ({
  target,
  onBack,
  isLightMode = false
}) => {
  // Field Technician origin GPS (starts offset from destination)
  const initialOrigin = useMemo(() => ({
    lat: target.lat + 0.0035,
    lng: target.lng + 0.0028
  }), [target]);

  const [currentGps, setCurrentGps] = useState(initialOrigin);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSpecs, setShowSpecs] = useState(false);

  // Sync if target changes
  useEffect(() => {
    setCurrentGps(initialOrigin);
  }, [initialOrigin]);

  // Generate realistic road/optical waypoints between origin and target
  const waypoints = useMemo(() => {
    const p0 = currentGps;
    const p3 = { lat: target.lat, lng: target.lng };
    
    // Intermediate simulated street corners / conduit bends
    const p1 = {
      lat: p0.lat + (p3.lat - p0.lat) * 0.35,
      lng: p0.lng + (p3.lng - p0.lng) * 0.1
    };
    const p2 = {
      lat: p0.lat + (p3.lat - p0.lat) * 0.7,
      lng: p0.lng + (p3.lng - p0.lng) * 0.85
    };

    return [p0, p1, p2, p3];
  }, [currentGps, target]);

  // Metrics
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
  const walkingMinutes = Math.max(1, Math.round(distanceMeters / 75));
  const bikeMinutes = Math.max(1, Math.round(distanceMeters / 250));

  // Determine current turn direction instruction based on target type
  const currentInstruction = useMemo(() => {
    if (distanceMeters < 15) {
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        action: `Arrived at ${target.type}: ${target.name}`,
        street: target.subtitle,
        sub: target.type === 'FAT' ? `Verify Port ${target.ponPort || '1'}` : `Node Online in ${target.locality}`
      };
    } else if (distanceMeters < 80) {
      return {
        icon: <ArrowUp className="w-5 h-5 text-cyan-400" />,
        action: `Straight to ${target.type} Terminal Site`,
        street: `Approach ${target.locality} (${target.city})`,
        sub: `Optical link marker visible ahead`
      };
    } else if (distanceMeters < 250) {
      return {
        icon: <ArrowRight className="w-5 h-5 text-amber-400" />,
        action: 'Turn Right onto Distribution Lane',
        street: `Follow Optical Feeder conduit toward ${target.name}`,
        sub: `Next maneuver in ${Math.min(distanceMeters - 20, 110)}m`
      };
    } else {
      return {
        icon: <ArrowLeft className="w-5 h-5 text-cyan-400" />,
        action: `Proceed ${heading} on Sector Arterial`,
        street: `Toward ${target.locality} cluster (${target.city})`,
        sub: `Continue ${Math.round(distanceMeters * 0.6)}m then turn right`
      };
    }
  }, [distanceMeters, heading, target]);

  // Simulate stepping along the route
  const handleStepAlongRoute = () => {
    setCurrentGps((prev) => {
      const remainingLat = target.lat - prev.lat;
      const remainingLng = target.lng - prev.lng;
      if (Math.abs(remainingLat) < 0.0001 && Math.abs(remainingLng) < 0.0001) {
        return { lat: target.lat, lng: target.lng };
      }
      return {
        lat: prev.lat + remainingLat * 0.38,
        lng: prev.lng + remainingLng * 0.38
      };
    });
  };

  const handleResetNavigation = () => {
    setCurrentGps(initialOrigin);
  };

  // Convert GPS coordinates to local SVG map space
  const allLats = [currentGps.lat, target.lat, ...waypoints.map((w) => w.lat)];
  const allLngs = [currentGps.lng, target.lng, ...waypoints.map((w) => w.lng)];
  const minLat = Math.min(...allLats) - 0.001;
  const maxLat = Math.max(...allLats) + 0.001;
  const minLng = Math.min(...allLngs) - 0.0015;
  const maxLng = Math.max(...allLngs) + 0.0015;

  const latSpan = maxLat - minLat || 0.002;
  const lngSpan = maxLng - minLng || 0.002;

  const projectToSvg = (lat: number, lng: number) => {
    const x = ((lng - minLng) / lngSpan) * 360 + 30;
    const y = 440 - ((lat - minLat) / latSpan) * 380;
    return { x, y };
  };

  const originSvg = projectToSvg(currentGps.lat, currentGps.lng);
  const targetSvg = projectToSvg(target.lat, target.lng);
  const waypointsSvg = waypoints.map((w) => projectToSvg(w.lat, w.lng));

  const polylinePath = waypointsSvg.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className={`relative w-full h-full overflow-hidden select-none flex flex-col transition-all duration-300 animate-view-120 ${
      isLightMode ? 'bg-[#f4f2ef] text-neutral-900' : 'bg-black text-neutral-100'
    }`}>
      {/* NAVIGATION HEADER BANNER WITH REAL TURN GUIDANCE */}
      <div className={`flex-shrink-0 border-b p-3 z-20 space-y-2 shadow-xl backdrop-blur-xl ${
        isLightMode ? 'bg-white/95 border-neutral-200' : 'bg-black/95 border-neutral-800'
      }`}>
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-xs font-semibold cursor-pointer transition-all active:scale-95"
          >
            &larr; Back
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/40 px-2 py-0.5 rounded-full font-bold">
              {target.type} In-App Route
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {target.name}
            </span>
          </div>
        </div>

        {/* Current Turn Direction Card */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 shadow-md ${
          isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-[#0a0a0a] border-cyan-500/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/90 border border-cyan-700/60 flex items-center justify-center shrink-0">
              {currentInstruction.icon}
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">
                {currentInstruction.action}
              </div>
              <div className="text-[11px] text-neutral-400 truncate max-w-[200px] sm:max-w-xs mt-0.5">
                {currentInstruction.street}
              </div>
              <div className="text-[10px] text-neutral-500">
                {currentInstruction.sub}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-base font-extrabold text-emerald-400 font-mono">
              {distanceMeters < 1000 ? `${distanceMeters} m` : `${(distanceMeters / 1000).toFixed(2)} km`}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono">
              {walkingMinutes} min walk · {bikeMinutes}m bike
            </div>
          </div>
        </div>
      </div>

      {/* VECTOR MAP CANVAS WITH DYNAMIC 120FPS GLOWING ROUTE LINE */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox="0 0 420 480"
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Map Grid Background */}
          <rect width="420" height="480" fill={isLightMode ? '#e8e5e0' : '#100e0d'} />
          <line x1="0" y1="120" x2="420" y2="120" stroke={isLightMode ? '#d5d0c8' : '#1c1715'} strokeWidth="1.5" />
          <line x1="0" y1="240" x2="420" y2="240" stroke={isLightMode ? '#d5d0c8' : '#1c1715'} strokeWidth="1.5" />
          <line x1="0" y1="360" x2="420" y2="360" stroke={isLightMode ? '#d5d0c8' : '#1c1715'} strokeWidth="1.5" />
          <line x1="140" y1="0" x2="140" y2="480" stroke={isLightMode ? '#d5d0c8' : '#1c1715'} strokeWidth="1.5" />
          <line x1="280" y1="0" x2="280" y2="480" stroke={isLightMode ? '#d5d0c8' : '#1c1715'} strokeWidth="1.5" />

          {/* Streets */}
          <path d="M 40,80 L 380,80" stroke={isLightMode ? '#cac4b8' : '#221b18'} strokeWidth="8" fill="none" />
          <path d="M 80,0 L 80,480" stroke={isLightMode ? '#cac4b8' : '#221b18'} strokeWidth="8" fill="none" />
          <path d="M 320,0 L 320,480" stroke={isLightMode ? '#cac4b8' : '#221b18'} strokeWidth="7" fill="none" />
          <path d="M 0,320 L 420,320" stroke={isLightMode ? '#cac4b8' : '#221b18'} strokeWidth="7" fill="none" />

          {/* ACTIVE ROUTE LINE */}
          <path
            d={polylinePath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="9"
            strokeOpacity="0.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={polylinePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={polylinePath}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="6 20"
            className="animate-optical-pulse"
            strokeLinecap="round"
          />

          {/* Turn Waypoint Intersection Dots */}
          {waypointsSvg.slice(1, -1).map((wpt, idx) => (
            <g key={`wpt-${idx}`} transform={`translate(${wpt.x}, ${wpt.y})`}>
              <circle r="4" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" />
              <circle r="1.5" fill="#ffffff" />
            </g>
          ))}

          {/* TARGET PIN (FAT, HUB, or RSU) */}
          <g transform={`translate(${targetSvg.x}, ${targetSvg.y})`}>
            <circle r="22" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.4" className="animate-ping" />
            <circle r="13" fill="#064e3b" stroke="#34d399" strokeWidth="2.5" />
            <circle r="5" fill="#ffffff" />
            {/* Destination Callout Badge */}
            <g transform="translate(0, -22)">
              <rect x="-46" y="-10" width="92" height="20" rx="10" fill="#181412" stroke="#34d399" strokeWidth="1.2" />
              <text x="0" y="3" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {target.type}: {target.name}
              </text>
            </g>
          </g>

          {/* FIELD TECHNICIAN GPS MARKER */}
          <g transform={`translate(${originSvg.x}, ${originSvg.y})`}>
            <circle r="24" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.35" className="animate-ping" />
            <circle r="12" fill="#075985" fillOpacity="0.6" stroke="#38bdf8" strokeWidth="2" />
            <circle r="5" fill="#ffffff" />
            <polygon
              points="0,-18 5,-8 -5,-8"
              fill="#38bdf8"
              transform={`rotate(${bearing})`}
            />
            <text x="0" y="22" fill="#38bdf8" fontSize="7.5" fontWeight="bold" textAnchor="middle">
              Field GPS
            </text>
          </g>
        </svg>

        {/* Map Control Buttons */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.3, 2.5))}
            className="w-8 h-8 rounded-xl bg-[#181412]/90 text-white border border-white/10 flex items-center justify-center hover:bg-neutral-800 cursor-pointer shadow-md transition-all active:scale-90"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.3, 0.8))}
            className="w-8 h-8 rounded-xl bg-[#181412]/90 text-white border border-white/10 flex items-center justify-center hover:bg-neutral-800 cursor-pointer shadow-md transition-all active:scale-90"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetNavigation}
            className="w-8 h-8 rounded-xl bg-[#181412]/90 text-cyan-400 border border-white/10 flex items-center justify-center hover:bg-neutral-800 cursor-pointer shadow-md transition-all active:scale-90"
            title="Reset Origin"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compass & Bearing HUD */}
        <div className="absolute left-3 top-3 z-10 bg-[#181412]/90 border border-white/10 rounded-2xl p-2 flex items-center gap-2 backdrop-blur-xl shadow-lg">
          <div className="w-7 h-7 rounded-full border border-neutral-700 flex items-center justify-center relative">
            <div
              className="w-0.5 h-4 bg-cyan-400 origin-bottom transition-transform duration-300"
              style={{ transform: `rotate(${bearing}deg)` }}
            />
          </div>
          <div className="text-[10px] font-mono">
            <span className="text-white font-bold block">{heading} {bearing}°</span>
            <span className="text-neutral-400 block">Bearing</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION CONTROLS AT BOTTOM */}
      <div className={`flex-shrink-0 border-t p-3 z-20 space-y-2 backdrop-blur-xl ${
        isLightMode ? 'bg-white/95 border-neutral-200' : 'bg-black/95 border-neutral-800'
      }`}>
        <div className="flex items-center gap-2">
          <button
            onClick={handleStepAlongRoute}
            disabled={distanceMeters <= 5}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all active:scale-[0.98] cursor-pointer min-h-[42px]"
          >
            <Navigation className="w-4 h-4 fill-black" />
            <span>Step Along Route ({distanceMeters}m remaining)</span>
          </button>

          <button
            onClick={() => setShowSpecs(!showSpecs)}
            className={`px-3 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-1 min-h-[42px] cursor-pointer transition-all active:scale-95 ${
              isLightMode ? 'bg-neutral-100 border-neutral-300 text-neutral-800' : 'bg-neutral-900 border-neutral-800 text-white'
            }`}
          >
            <span>Specs</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showSpecs ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expandable Node Specifications */}
        {showSpecs && (
          <div className="p-3 rounded-2xl bg-[#0a0a0a] border border-neutral-800 text-xs font-mono grid grid-cols-2 gap-2 animate-in fade-in duration-150">
            <div>
              <span className="text-[10px] text-neutral-400 block font-sans">TARGET NODE</span>
              <span className="text-cyan-300 font-bold">{target.name} ({target.type})</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block font-sans">COORDINATES</span>
              <span className="text-emerald-400 font-bold">{target.lat.toFixed(5)}, {target.lng.toFixed(5)}</span>
            </div>
            {target.ponPort && (
              <div>
                <span className="text-[10px] text-neutral-400 block font-sans">PON PORT</span>
                <span className="text-white">{target.ponPort}</span>
              </div>
            )}
            {target.totalCap && (
              <div>
                <span className="text-[10px] text-neutral-400 block font-sans">CAPACITY</span>
                <span className="text-white">{target.totalCap} Ports</span>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-[10px] text-neutral-400 block font-sans">LOCATION</span>
              <span className="text-white font-sans truncate block">{target.subtitle} · {target.locality}, {target.city}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
