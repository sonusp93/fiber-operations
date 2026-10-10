import React, { useState, useMemo } from 'react';
import { FatRecord, FAT_DATASET, calculateGpsDistanceMeters, calculateBearingDegrees, getCompassHeading } from '../data/telecomDataset';
import { Navigation, MapPin, ExternalLink, Compass, ZoomIn, ZoomOut, RotateCcw, Layers, Search } from 'lucide-react';

interface GisNavigationMapProps {
  selectedFat: FatRecord | null;
  onSelectFat: (fat: FatRecord) => void;
  onStartNavigation: (fat: FatRecord) => void;
}

export const GisNavigationMap: React.FC<GisNavigationMapProps> = ({
  selectedFat,
  onSelectFat,
  onStartNavigation
}) => {
  // Current active sector filter
  const [selectedCity, setSelectedCity] = useState<string>(selectedFat?.city || 'Cochin');
  const [selectedRsu, setSelectedRsu] = useState<string>(selectedFat?.rsu || '01I');
  
  // Field Employee GPS location (defaults near the active RSU)
  const [employeeGps, setEmployeeGps] = useState<{ lat: number; lng: number }>({
    lat: selectedFat ? selectedFat.rsuLat + 0.002 : 10.2045,
    lng: selectedFat ? selectedFat.rsuLog + 0.001 : 76.3842
  });

  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Filter FATs for the selected sector
  const sectorFats = useMemo(() => {
    return FAT_DATASET.filter((f) => f.city === selectedCity && f.rsu === selectedRsu);
  }, [selectedCity, selectedRsu]);

  // Compute map bounds to project GPS coordinates to SVG coordinate space (0..400, 0..480)
  const mapBounds = useMemo(() => {
    if (sectorFats.length === 0) {
      return { minLat: 10.19, maxLat: 10.22, minLng: 76.37, maxLng: 76.40 };
    }
    const allLats = [...sectorFats.map((f) => f.fatLat), ...sectorFats.map((f) => f.hubLat), sectorFats[0].rsuLat, employeeGps.lat];
    const allLngs = [...sectorFats.map((f) => f.fatLog), ...sectorFats.map((f) => f.hubLog), sectorFats[0].rsuLog, employeeGps.lng];

    const minLat = Math.min(...allLats);
    const maxLat = Math.max(...allLats);
    const minLng = Math.min(...allLngs);
    const maxLng = Math.max(...allLngs);

    const latMargin = (maxLat - minLat) * 0.18 || 0.004;
    const lngMargin = (maxLng - minLng) * 0.18 || 0.004;

    return {
      minLat: minLat - latMargin,
      maxLat: maxLat + latMargin,
      minLng: minLng - lngMargin,
      maxLng: maxLng + lngMargin
    };
  }, [sectorFats, employeeGps]);

  // Project GPS (lat, lng) to SVG (x, y)
  const projectGpsToSvg = (lat: number, lng: number): { x: number; y: number } => {
    const width = 420;
    const height = 480;
    const latSpan = mapBounds.maxLat - mapBounds.minLat || 1;
    const lngSpan = mapBounds.maxLng - mapBounds.minLng || 1;

    const x = ((lng - mapBounds.minLng) / lngSpan) * width;
    // Latitude inverted because higher latitude is North (upwards in SVG)
    const y = height - ((lat - mapBounds.minLat) / latSpan) * height;

    return { x: Math.max(30, Math.min(width - 30, x)), y: Math.max(30, Math.min(height - 30, y)) };
  };

  // Unique HUBs for this sector
  const hubs = useMemo(() => {
    const hubMap = new Map<string, { hub: string; lat: number; lng: number }>();
    sectorFats.forEach((f) => {
      if (!hubMap.has(f.hub)) {
        hubMap.set(f.hub, { hub: f.hub, lat: f.hubLat, lng: f.hubLog });
      }
    });
    return Array.from(hubMap.values());
  }, [sectorFats]);

  // RSU for this sector
  const rsuPoint = useMemo(() => {
    if (sectorFats.length === 0) return null;
    return { rsu: sectorFats[0].rsu, lat: sectorFats[0].rsuLat, lng: sectorFats[0].rsuLog };
  }, [sectorFats]);

  // Navigation metrics to selected FAT
  const navMetrics = useMemo(() => {
    if (!selectedFat) return null;
    const distanceMeters = calculateGpsDistanceMeters(
      employeeGps.lat,
      employeeGps.lng,
      selectedFat.fatLat,
      selectedFat.fatLog
    );
    const bearing = calculateBearingDegrees(
      employeeGps.lat,
      employeeGps.lng,
      selectedFat.fatLat,
      selectedFat.fatLog
    );
    const heading = getCompassHeading(bearing);
    const walkingMinutes = Math.max(1, Math.round(distanceMeters / 80)); // ~80m/min
    const bikeMinutes = Math.max(1, Math.round(distanceMeters / 300)); // ~300m/min

    return { distanceMeters, bearing, heading, walkingMinutes, bikeMinutes };
  }, [selectedFat, employeeGps]);

  // Handle dragging map
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - panOffset.x, y: e.touches[0].clientY - panOffset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
  };

  // Google Maps external deep link for field navigation
  const openInGoogleMaps = (fat: FatRecord) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${fat.fatLat},${fat.fatLog}`;
    window.open(url, '_blank');
  };

  // Available sector tabs
  const sectors = [
    { city: 'Cochin', rsu: '01I', name: 'Angamaly (01I)' },
    { city: 'Cochin', rsu: '0C0', name: 'Kochi/Infopark (0C0)' },
    { city: 'Cochin', rsu: '0I5', name: 'Thrippunithura (0I5)' },
    { city: 'Calicut', rsu: '08N', name: 'Kozhikode (08N)' },
    { city: 'Thiruvananthapuram', rsu: '0CI', name: 'Pettah (0CI)' }
  ];

  const empSvg = projectGpsToSvg(employeeGps.lat, employeeGps.lng);
  const targetSvg = selectedFat ? projectGpsToSvg(selectedFat.fatLat, selectedFat.fatLog) : null;
  const rsuSvg = rsuPoint ? projectGpsToSvg(rsuPoint.lat, rsuPoint.lng) : null;

  return (
    <div className="relative w-full h-full bg-[#0a0d14] overflow-hidden select-none flex flex-col">
      {/* Top Sector Picker Bar */}
      <div className="flex-shrink-0 bg-neutral-900/95 border-b border-neutral-800 px-3 py-2 z-20">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-bold text-white tracking-tight">
              GIS Field Navigation
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/40">
            {sectorFats.length} FATs in Sector
          </span>
        </div>

        {/* Sector Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {sectors.map((s) => {
            const isMatch = selectedCity === s.city && selectedRsu === s.rsu;
            return (
              <button
                key={`${s.city}-${s.rsu}`}
                onClick={() => {
                  setSelectedCity(s.city);
                  setSelectedRsu(s.rsu);
                  const firstInSector = FAT_DATASET.find((f) => f.city === s.city && f.rsu === s.rsu);
                  if (firstInSector) {
                    setEmployeeGps({ lat: firstInSector.rsuLat + 0.001, lng: firstInSector.rsuLog + 0.001 });
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isMatch
                    ? 'bg-cyan-500 text-black font-bold shadow-sm'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map SVG Viewport */}
      <div
        className="flex-1 w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 420 480"
          preserveAspectRatio="xMidYMid slice"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          <defs>
            {/* Background grid pattern */}
            <pattern id="gisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#141a29" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Dark Cartographic Background */}
          <rect width="420" height="480" fill="#090c14" />
          <rect width="420" height="480" fill="url(#gisGrid)" />

          {/* Optical Fiber Trunk Lines: RSU to HUBs */}
          {rsuSvg &&
            hubs.map((hub) => {
              const hSvg = projectGpsToSvg(hub.lat, hub.lng);
              return (
                <g key={`trunk-${hub.hub}`}>
                  {/* Glowing backbone route */}
                  <line
                    x1={rsuSvg.x}
                    y1={rsuSvg.y}
                    x2={hSvg.x}
                    y2={hSvg.y}
                    stroke="#0284c7"
                    strokeWidth="4"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                  />
                  <line
                    x1={rsuSvg.x}
                    y1={rsuSvg.y}
                    x2={hSvg.x}
                    y2={hSvg.y}
                    stroke="#38bdf8"
                    strokeWidth="1.8"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

          {/* Distribution Feeder Lines: HUB to FAT Boxes */}
          {sectorFats.map((fat) => {
            const hSvg = projectGpsToSvg(fat.hubLat, fat.hubLog);
            const fSvg = projectGpsToSvg(fat.fatLat, fat.fatLog);
            const isTarget = selectedFat?.id === fat.id;

            return (
              <line
                key={`feeder-${fat.id}`}
                x1={hSvg.x}
                y1={hSvg.y}
                x2={fSvg.x}
                y2={fSvg.y}
                stroke={isTarget ? '#10b981' : '#0e7490'}
                strokeWidth={isTarget ? '2.5' : '1.2'}
                strokeOpacity={isTarget ? '0.9' : '0.4'}
                strokeDasharray={isTarget ? 'none' : '2 3'}
              />
            );
          })}

          {/* ACTIVE FIELD NAVIGATION ROUTE: Employee -> Target FAT Box */}
          {selectedFat && targetSvg && (
            <g>
              {/* Outer glowing path */}
              <line
                x1={empSvg.x}
                y1={empSvg.y}
                x2={targetSvg.x}
                y2={targetSvg.y}
                stroke="#10b981"
                strokeWidth="7"
                strokeOpacity="0.3"
                strokeLinecap="round"
              />
              {/* Solid directional route line */}
              <line
                x1={empSvg.x}
                y1={empSvg.y}
                x2={targetSvg.x}
                y2={targetSvg.y}
                stroke="#34d399"
                strokeWidth="2.8"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* RSU Node Marker */}
          {rsuSvg && (
            <g transform={`translate(${rsuSvg.x}, ${rsuSvg.y})`}>
              <polygon
                points="0,-14 14,0 0,14 -14,0"
                fill="#0369a1"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <text
                x="0"
                y="3"
                fill="#ffffff"
                fontSize="7"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                RSU
              </text>
              <text
                x="0"
                y="-18"
                fill="#7dd3fc"
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
              >
                RSU {rsuPoint?.rsu}
              </text>
            </g>
          )}

          {/* HUB Node Markers */}
          {hubs.map((hub) => {
            const hSvg = projectGpsToSvg(hub.lat, hub.lng);
            return (
              <g key={`hub-${hub.hub}`} transform={`translate(${hSvg.x}, ${hSvg.y})`}>
                <polygon
                  points="0,-10 9,-5 9,5 0,10 -9,5 -9,-5"
                  fill="#1e293b"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <circle r="3" fill="#38bdf8" />
                <text
                  x="0"
                  y="18"
                  fill="#94a3b8"
                  fontSize="7"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  HUB {hub.hub}
                </text>
              </g>
            );
          })}

          {/* FAT Box Node Markers */}
          {sectorFats.map((fat) => {
            const fSvg = projectGpsToSvg(fat.fatLat, fat.fatLog);
            const isSelected = selectedFat?.id === fat.id;

            return (
              <g
                key={`marker-${fat.id}`}
                transform={`translate(${fSvg.x}, ${fSvg.y})`}
                className="cursor-pointer"
                onClick={() => onSelectFat(fat)}
              >
                {/* Selection pulse */}
                {isSelected && (
                  <circle
                    r="18"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    className="animate-ping"
                    opacity="0.6"
                  />
                )}

                {/* Outer pin badge */}
                <circle
                  r={isSelected ? '10' : '6.5'}
                  fill={isSelected ? '#065f46' : '#111827'}
                  stroke={isSelected ? '#34d399' : '#06b6d4'}
                  strokeWidth={isSelected ? '2' : '1.2'}
                />

                {/* Core dot */}
                <circle
                  r={isSelected ? '4' : '2.5'}
                  fill={isSelected ? '#ffffff' : '#22d3ee'}
                />

                {/* FAT ID Label */}
                <text
                  x="0"
                  y={isSelected ? '-14' : '-10'}
                  fill={isSelected ? '#34d399' : '#cbd5e1'}
                  fontSize={isSelected ? '8' : '6.5'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {fat.fatId.slice(-6)}
                </text>
              </g>
            );
          })}

          {/* FIELD EMPLOYEE GPS POSITION BEACON */}
          <g transform={`translate(${empSvg.x}, ${empSvg.y})`}>
            {/* Radar wave */}
            <circle r="22" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.3" className="animate-ping" />
            {/* Halo ring */}
            <circle r="12" fill="#1e3a8a" fillOpacity="0.4" stroke="#60a5fa" strokeWidth="1.5" />
            {/* GPS center dot */}
            <circle r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
            <text x="0" y="22" fill="#60a5fa" fontSize="7.5" fontWeight="bold" textAnchor="middle">
              Field Technician
            </text>
          </g>
        </svg>

        {/* Map Control Buttons */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.3, 3))}
            className="w-8 h-8 rounded-lg bg-neutral-900/90 text-white border border-neutral-700 flex items-center justify-center hover:bg-neutral-800 cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.3, 0.7))}
            className="w-8 h-8 rounded-lg bg-neutral-900/90 text-white border border-neutral-700 flex items-center justify-center hover:bg-neutral-800 cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="w-8 h-8 rounded-lg bg-neutral-900/90 text-cyan-400 border border-neutral-700 flex items-center justify-center hover:bg-neutral-800 cursor-pointer"
            title="Reset Map"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Map Legend */}
        <div className="absolute left-3 bottom-3 z-10 bg-neutral-900/90 border border-neutral-800 rounded-lg p-2 text-[10px] space-y-1 backdrop-blur-sm pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 rotate-45 inline-block" />
            <span className="text-neutral-300">RSU (Remote Switch)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-neutral-700 border border-sky-400 inline-block" />
            <span className="text-neutral-300">HUB (Central Splitter)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
            <span className="text-neutral-300">FAT Box (Terminal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span className="text-neutral-300">Your Field GPS</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SELECTED FAT NAVIGATION CARD DOCKED AT BOTTOM */}
      {selectedFat && navMetrics && (
        <div className="flex-shrink-0 bg-neutral-900 border-t border-neutral-800 p-3.5 z-20 space-y-2.5 shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                  {selectedFat.fatId}
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  PON Port: {selectedFat.ponPort}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                {selectedFat.neAddress} · {selectedFat.locality}
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                GPS: {selectedFat.fatLat.toFixed(5)}, {selectedFat.fatLog.toFixed(5)} · {selectedFat.totalCap} Ports
              </p>
            </div>

            {/* Distance & ETA Badge */}
            <div className="text-right">
              <div className="text-base font-extrabold text-emerald-400 font-mono">
                {navMetrics.distanceMeters < 1000
                  ? `${navMetrics.distanceMeters} m`
                  : `${(navMetrics.distanceMeters / 1000).toFixed(2)} km`}
              </div>
              <div className="text-[10px] text-neutral-400 flex items-center justify-end gap-1 font-mono">
                <Compass className="w-3 h-3 text-cyan-400" />
                <span>{navMetrics.heading} ({navMetrics.bearing}°)</span>
              </div>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onStartNavigation(selectedFat)}
              className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer min-h-[44px]"
            >
              <Navigation className="w-4 h-4 fill-black" />
              <span>Start In-Built Direction Navigation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
