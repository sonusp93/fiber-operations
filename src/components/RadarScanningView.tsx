import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Radio, 
  Navigation, 
  MapPin, 
  Compass, 
  RefreshCw, 
  Check, 
  Copy, 
  Crosshair, 
  Search,
  Activity,
  Sparkles as LucideSparkles,
  Info,
  Trash2,
  Power,
  Layers,
  ArrowRight
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
import { FAT_DATASET, FatRecord, HUB_DATASET, RSU_DATASET, calculateGpsDistanceMeters } from '../data/telecomDataset';
import { Fat3DModelIcon, Hub3DModelIcon, Rsu3DModelIcon } from './ModelIcons';

interface RadarScanningViewProps {
  onNavigateToFat: (fat: FatRecord) => void;
  onNavigateToHub: (hub: { hub: string; rsu: string; city: string; lat: number; lng: number; locality: string }) => void;
  onNavigateToRsu: (rsu: { rsu: string; city: string; lat: number; lng: number }) => void;
  onSelectFat: (fat: FatRecord) => void;
  isLightMode: boolean;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  isActive?: boolean;
}

export type RadarNodeType = 'ALL' | 'FAT' | 'HUB' | 'RSU';

export interface PlottedNode {
  id: string;
  type: 'FAT' | 'HUB' | 'RSU';
  title: string;
  subtitle: string;
  locality: string;
  city: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  distanceKm: string;
  bearingDeg: number;
  bearingCardinal: string;
  opticalLossDbm: string;
  extraInfo?: string;
  rawFat?: FatRecord;
  rawHub?: typeof HUB_DATASET[0];
  rawRsu?: typeof RSU_DATASET[0];
}

// Haversine distance calculator
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Bearing from technician to node
const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): { deg: number; cardinal: string } => {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(((lon2 - lon1) * Math.PI) / 180);
  let deg = (Math.atan2(y, x) * 180) / Math.PI;
  deg = (deg + 360) % 360;

  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
  const index = Math.round(deg / 45);
  return { deg: Math.round(deg), cardinal: cardinals[index] };
};

// Compute node matches for a given coordinate & radius
const computeNodesForGps = (gpsLat: number, gpsLng: number, radiusKm: number): PlottedNode[] => {
  const list: PlottedNode[] = [];

  const latDelta = (radiusKm + 2) / 111;
  const lngDelta = (radiusKm + 2) / 100;

  // 1. Process FATs
  FAT_DATASET.forEach((fat) => {
    if (!fat) return;
    if (
      Math.abs(fat.fatLat - gpsLat) <= latDelta &&
      Math.abs(fat.fatLog - gpsLng) <= lngDelta
    ) {
      const distMeters = calculateGpsDistanceMeters(gpsLat, gpsLng, fat.fatLat, fat.fatLog);
      const distKm = distMeters / 1000;
      if (distKm <= radiusKm) {
        const bearing = calculateBearing(gpsLat, gpsLng, fat.fatLat, fat.fatLog);

        list.push({
          id: fat.id,
          type: 'FAT',
          title: `FAT ${fat.fatId}`,
          subtitle: fat.neAddress,
          locality: fat.locality,
          city: fat.city,
          lat: fat.fatLat,
          lng: fat.fatLog,
          distanceMeters: distMeters,
          distanceKm: distMeters < 1000 ? `${distMeters} m` : `${distKm.toFixed(2)} km`,
          bearingDeg: bearing.deg,
          bearingCardinal: bearing.cardinal,
          opticalLossDbm: `${fat.totalCap} Ports`,
          extraInfo: `${fat.ponPort} · HUB ${fat.hub}`,
          rawFat: fat
        });
      }
    }
  });

  // 2. Process HUBs
  HUB_DATASET.forEach((hub) => {
    const distMeters = calculateGpsDistanceMeters(gpsLat, gpsLng, hub.lat, hub.lng);
    const distKm = distMeters / 1000;
    if (distKm <= radiusKm) {
      const bearing = calculateBearing(gpsLat, gpsLng, hub.lat, hub.lng);
      list.push({
        id: `hub-${hub.hub}`,
        type: 'HUB',
        title: `HUB ${hub.hub}`,
        subtitle: `Central Distribution Hub · ${hub.locality}`,
        locality: hub.locality,
        city: hub.city,
        lat: hub.lat,
        lng: hub.lng,
        distanceMeters: distMeters,
        distanceKm: distMeters < 1000 ? `${distMeters} m` : `${distKm.toFixed(2)} km`,
        bearingDeg: bearing.deg,
        bearingCardinal: bearing.cardinal,
        opticalLossDbm: `${hub.fats.length} FATs`,
        extraInfo: `RSU ${hub.rsu} · Optical Core Aggregator`,
        rawHub: hub
      });
    }
  });

  // 3. Process RSUs
  RSU_DATASET.forEach((rsu) => {
    const distMeters = calculateGpsDistanceMeters(gpsLat, gpsLng, rsu.lat, rsu.lng);
    const distKm = distMeters / 1000;
    if (distKm <= radiusKm) {
      const bearing = calculateBearing(gpsLat, gpsLng, rsu.lat, rsu.lng);
      list.push({
        id: `rsu-${rsu.rsu}`,
        type: 'RSU',
        title: `RSU ${rsu.rsu} Exchange`,
        subtitle: `Main Optical Backbone Substation · ${rsu.city}`,
        locality: rsu.city,
        city: rsu.city,
        lat: rsu.lat,
        lng: rsu.lng,
        distanceMeters: distMeters,
        distanceKm: distMeters < 1000 ? `${distMeters} m` : `${distKm.toFixed(2)} km`,
        bearingDeg: bearing.deg,
        bearingCardinal: bearing.cardinal,
        opticalLossDbm: `${rsu.hubCount} HUBs`,
        extraInfo: `Carrier OLT · Substation Switch`,
        rawRsu: rsu
      });
    }
  });

  return list.sort((a, b) => a.distanceMeters - b.distanceMeters);
};

const RadarScanningViewComp: React.FC<RadarScanningViewProps> = ({
  onNavigateToFat,
  onNavigateToHub,
  onNavigateToRsu,
  onSelectFat,
  isLightMode,
  searchQuery = '',
  onSearchChange,
  isActive = true
}) => {
  // 1. GPS SENSOR STATE & COORDINATES
  const [isGpsEnabled, setIsGpsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('locfinder_radar_gps_enabled') !== 'false';
  });

  const [techGps, setTechGps] = useState<{ lat: number; lng: number }>({
    lat: 10.0261,
    lng: 76.3125
  });

  const [gpsPrecisionText, setGpsPrecisionText] = useState<string>('±2.4m RTK Fixed');
  const watchIdRef = useRef<number | null>(null);

  // 2. RADAR SCANNING STATE
  const [radiusKm, setRadiusKm] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<RadarNodeType>('ALL');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<number>(100);
  const [scanStageText, setScanStageText] = useState<string>('Optical Grid Synchronized');
  const [isResultsWiped, setIsResultsWiped] = useState(false);

  // Scanned nodes stored in state (WIPED on Clear Data or Rescan)
  const [scannedNodes, setScannedNodes] = useState<PlottedNode[]>(() => {
    if (!isActive) return [];
    return computeNodesForGps(10.0261, 76.3125, 1);
  });

  const [selectedNode, setSelectedNode] = useState<PlottedNode | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sync GPS state to localStorage
  useEffect(() => {
    localStorage.setItem('locfinder_radar_gps_enabled', String(isGpsEnabled));
  }, [isGpsEnabled]);

  // GPS Sensor Management
  useEffect(() => {
    if (!isGpsEnabled) {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setGpsPrecisionText('GPS Sensor Disconnected');
      return;
    }

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setGpsPrecisionText('Acquiring RTK Satellites...');

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos.coords.latitude >= 8 && pos.coords.latitude <= 13) {
            setTechGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
          const acc = pos.coords.accuracy ? `±${Math.round(pos.coords.accuracy)}m RTK` : '±2.4m RTK Fixed';
          setGpsPrecisionText(acc);
        },
        () => {
          setGpsPrecisionText('Base Station Fixed (10.0261° N)');
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );

      try {
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            if (pos.coords.latitude >= 8 && pos.coords.latitude <= 13) {
              setTechGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            }
            const acc = pos.coords.accuracy ? `±${Math.round(pos.coords.accuracy)}m RTK` : '±2.4m RTK Fixed';
            setGpsPrecisionText(acc);
          },
          () => {},
          { enableHighAccuracy: false, maximumAge: 60000 }
        );
        watchIdRef.current = id;
      } catch {
        // Fallback
      }
    }

    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isGpsEnabled]);

  const [showProgressBar, setShowProgressBar] = useState(false);
  const [isScanSuccess, setIsScanSuccess] = useState(false);
  const [scanJustFinished, setScanJustFinished] = useState(false);
  const scanAnimFrameRef = useRef<number | null>(null);
  const finishTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // BIG CLEAR DATA FUNCTION
  const handleClearData = useCallback(() => {
    if (scanAnimFrameRef.current) {
      cancelAnimationFrame(scanAnimFrameRef.current);
      scanAnimFrameRef.current = null;
    }
    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
      finishTimeoutRef.current = null;
    }
    setScannedNodes([]);
    setSelectedNode(null);
    setIsResultsWiped(true);
    setIsScanning(false);
    setShowProgressBar(false);
    setIsScanSuccess(false);
    setScanJustFinished(false);
    setScanProgress(0);
    setScanStageText('Data Wiped • 0 Nodes in Memory');
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    } catch {
      // Ignore
    }
  }, []);

  // FAST, RELIABLE SCAN WITH GUARANTEED SMOOTH 0% -> 100% VISIBLE PROGRESS ANIMATION
  const triggerNewScan = useCallback((customRadius?: number) => {
    const targetRadius = customRadius !== undefined ? customRadius : radiusKm;

    // IF GPS IS OFF: RADAR CANNOT WORK
    if (!isGpsEnabled) {
      setScannedNodes([]);
      setSelectedNode(null);
      setIsResultsWiped(true);
      setIsScanning(false);
      setShowProgressBar(false);
      setIsScanSuccess(false);
      setScanProgress(0);
      setScanStageText('⚠️ GPS is OFF! Radar cannot scan without GPS location.');
      return;
    }

    if (scanAnimFrameRef.current) {
      cancelAnimationFrame(scanAnimFrameRef.current);
    }
    if (finishTimeoutRef.current) {
      clearTimeout(finishTimeoutRef.current);
    }

    setIsScanning(true);
    setShowProgressBar(true);
    setIsScanSuccess(false);
    setScanJustFinished(false);
    setScanProgress(0);
    setScanStageText(`Acquiring satellite RTK lock for ${targetRadius} KM perimeter...`);

    const scanDuration = 1350; // 1.35 seconds smooth scan sweep
    const startTime = performance.now();

    const sweepProgress = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(Math.round((elapsed / scanDuration) * 100), 100);
      setScanProgress(pct);

      if (pct < 25) {
        setScanStageText(`Calibrating RTK precision for ${targetRadius} KM corridor...`);
      } else if (pct < 60) {
        setScanStageText(`Sweeping ${targetRadius} KM optical fiber grid...`);
      } else if (pct < 95) {
        setScanStageText('Locking nearby FATs, HUBs & RSUs...');
      } else {
        setScanStageText('Finalizing optical coordinates...');
      }

      if (elapsed < scanDuration) {
        scanAnimFrameRef.current = requestAnimationFrame(sweepProgress);
      } else {
        // GUARANTEED 100% COMPLETION
        if (finishTimeoutRef.current) {
          clearTimeout(finishTimeoutRef.current);
        }

        const freshNodes = computeNodesForGps(techGps.lat, techGps.lng, targetRadius);
        setScannedNodes(freshNodes);
        setIsResultsWiped(false);
        setScanProgress(100);
        setIsScanSuccess(true);
        setIsScanning(false);
        setScanJustFinished(true);
        setScanStageText(`✓ 100% Scan Complete • ${freshNodes.length} Nodes Discovered`);

        try {
          if ('vibrate' in navigator) {
            navigator.vibrate([30, 40]);
          }
        } catch {}

        // Hold 100% completion for 800ms, then hide progress bar cleanly (0% stuck)
        finishTimeoutRef.current = setTimeout(() => {
          setScanJustFinished(false);
          setShowProgressBar(false);
        }, 800);
      }
    };

    scanAnimFrameRef.current = requestAnimationFrame(sweepProgress);
  }, [radiusKm, techGps, isGpsEnabled]);

  // TOGGLE GPS ON / OFF
  const handleToggleGps = () => {
    const nextState = !isGpsEnabled;
    setIsGpsEnabled(nextState);
    if (!nextState) {
      handleClearData();
    } else {
      triggerNewScan();
    }
  };

  // Filter scanned nodes by type & search query
  const filteredNodes = useMemo(() => {
    if (isResultsWiped) return [];
    let list = scannedNodes;

    if (activeFilter !== 'ALL') {
      list = list.filter((n) => n.type === activeFilter);
    }

    const q = localSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((n) =>
        n.title.toLowerCase().includes(q) ||
        n.subtitle.toLowerCase().includes(q) ||
        n.locality.toLowerCase().includes(q) ||
        n.city.toLowerCase().includes(q) ||
        (n.extraInfo && n.extraInfo.toLowerCase().includes(q))
      );
    }

    return list;
  }, [scannedNodes, activeFilter, localSearch, isResultsWiped]);

  const [visibleLimit, setVisibleLimit] = useState(50);

  // Reset visible limit when filter, search, or radius changes
  useEffect(() => {
    setVisibleLimit(50);
  }, [activeFilter, localSearch, radiusKm, isResultsWiped]);

  const displayedNodes = useMemo(() => {
    return filteredNodes.slice(0, visibleLimit);
  }, [filteredNodes, visibleLimit]);

  // Breakdown Counts
  const fatCount = useMemo(() => scannedNodes.filter((n) => n.type === 'FAT').length, [scannedNodes]);
  const hubCount = useMemo(() => scannedNodes.filter((n) => n.type === 'HUB').length, [scannedNodes]);
  const rsuCount = useMemo(() => scannedNodes.filter((n) => n.type === 'RSU').length, [scannedNodes]);

  // Copy GPS handler
  const handleCopyCoordinates = (node: PlottedNode) => {
    const text = `${node.lat.toFixed(6)}, ${node.lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedId(node.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Navigation Trigger
  const handleStartNodeNavigation = (node: PlottedNode) => {
    if (node.type === 'FAT' && node.rawFat) {
      onNavigateToFat(node.rawFat);
    } else if (node.type === 'HUB' && node.rawHub) {
      onNavigateToHub(node.rawHub);
    } else if (node.type === 'RSU' && node.rawRsu) {
      onNavigateToRsu(node.rawRsu);
    }
  };

  // Terminal Details
  const handleInspectNode = (node: PlottedNode) => {
    if (node.type === 'FAT' && node.rawFat) {
      onSelectFat(node.rawFat);
    }
  };

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden select-none transition-colors duration-200 ${
      isLightMode ? 'bg-[#f8fafc] text-slate-900' : 'bg-black text-slate-100'
    }`}>
      {/* SCROLLABLE VIEW CONTAINER */}
      <div className="flex-1 overflow-y-auto px-3 pt-1 pb-28">
        <div className="max-w-4xl lg:max-w-5xl mx-auto w-full space-y-3.5">

          {/* MAIN RADAR CONTROL PANEL */}
          <div className={`p-3.5 sm:p-5 rounded-[26px] sm:rounded-[28px] border shadow-2xl relative overflow-hidden transition-all duration-300 ${
            isLightMode
              ? 'bg-white border-slate-200 text-slate-900 shadow-xl'
              : 'bg-gradient-to-b from-[#0e1220] via-[#090c16] to-[#04060c] border-cyan-500/30 text-white shadow-[0_0_50px_rgba(6,182,212,0.18)]'
          }`}>
            {/* Header: Title, Status Badges & Action Buttons */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b ${
              isLightMode ? 'border-slate-200/80' : 'border-white/10'
            }`}>
              {/* Left: Icon & Title & Status Badges */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="icon-3d-box icon-3d-radar w-10 h-10 sm:w-11 sm:h-11 rounded-2xl shrink-0 text-white shadow-lg flex items-center justify-center">
                  <Radio className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {/* Status Pill */}
                    <span className={`flex items-center gap-1.5 text-[9.5px] sm:text-[10px] font-mono font-bold px-2 sm:px-2.5 py-0.5 rounded-full border whitespace-nowrap ${
                      isScanning
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : isResultsWiped
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : isLightMode
                        ? 'bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-white/10 border-white/10 text-slate-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isScanning
                          ? 'bg-cyan-400 animate-ping'
                          : isResultsWiped
                          ? 'bg-amber-400'
                          : isGpsEnabled
                          ? 'bg-emerald-400'
                          : 'bg-slate-400'
                      }`} />
                      {isScanning
                        ? 'SCANNING...'
                        : isResultsWiped
                        ? 'DATA WIPED'
                        : isGpsEnabled
                        ? 'GPS READY'
                        : 'GPS STANDBY'}
                    </span>

                    {/* GPS RTK Accuracy Badge */}
                    <span className={`text-[9.5px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                      isGpsEnabled
                        ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-400'
                        : 'bg-amber-500/15 border-amber-400/40 text-amber-400'
                    }`}>
                      {isGpsEnabled ? gpsPrecisionText : 'GPS OFF (Paused)'}
                    </span>
                  </div>

                  <h2 className="text-sm sm:text-base md:text-lg font-black tracking-tight mt-0.5">
                    Proximity Radar &amp; Scanner
                  </h2>
                </div>
              </div>

              {/* Right: GPS ON/OFF, BIG CLEAR DATA & NEW SCAN BUTTON */}
              {/* Responsive 3-column grid on mobile, flex on desktop - eliminates awkward wrapping and text clipping */}
              <div className="w-full sm:w-auto grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:gap-2 shrink-0">
                {/* GPS ON / OFF TOGGLE */}
                <button
                  onClick={handleToggleGps}
                  className={`h-9 px-2 sm:px-3 rounded-xl text-[10.5px] sm:text-xs font-mono font-bold flex items-center justify-center gap-1 border cursor-pointer transition-all active:scale-[0.98] shadow-sm whitespace-nowrap ${
                    isGpsEnabled
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 font-extrabold shadow-emerald-500/20 ring-1 ring-emerald-500/30'
                      : isLightMode
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-500'
                      : 'bg-white/5 border-white/15 text-slate-400 hover:text-white'
                  }`}
                  title={isGpsEnabled ? 'Click to turn GPS OFF' : 'Click to turn GPS ON'}
                >
                  <Power className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${isGpsEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>GPS: <b className={isGpsEnabled ? 'text-emerald-400' : 'text-slate-400'}>{isGpsEnabled ? 'ON' : 'OFF'}</b></span>
                </button>

                {/* BIG CLEAR DATA BUTTON (PROMINENT) */}
                <button
                  onClick={handleClearData}
                  disabled={scannedNodes.length === 0 && isResultsWiped}
                  className={`h-9 px-2 sm:px-3 rounded-xl text-[10.5px] sm:text-xs font-mono font-black uppercase tracking-wider border cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-1 shadow-sm whitespace-nowrap ${
                    scannedNodes.length === 0 && isResultsWiped
                      ? 'opacity-40 cursor-not-allowed border-white/5 bg-transparent text-slate-500'
                      : isLightMode
                      ? 'bg-red-50 hover:bg-red-100 border-red-300 text-red-600 shadow-sm'
                      : 'bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-400 shadow-lg shadow-red-950/40 ring-1 ring-red-500/30'
                  }`}
                  title="Clear radar data & wipe current results from screen"
                >
                  <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5] shrink-0" />
                  <span>CLEAR</span>
                </button>

                {/* NEW SCAN BUTTON: STABLE WIDTH, NO TEXT JITTER, SHOWS PROGRESS & 100% */}
                <button
                  onClick={() => triggerNewScan()}
                  disabled={isScanning}
                  className={`h-9 px-2 sm:px-3 sm:min-w-[125px] rounded-xl text-[10.5px] sm:text-xs font-mono font-black flex items-center justify-center gap-1 cursor-pointer shadow-md transition-all active:scale-[0.98] whitespace-nowrap ${
                    isScanning
                      ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200 animate-pulse cursor-wait'
                      : scanJustFinished
                      ? 'bg-emerald-500 border border-emerald-400 text-slate-950 shadow-emerald-500/40 ring-2 ring-emerald-400'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/30'
                  }`}
                  title="Scan nearby optical terminals"
                >
                  <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${isScanning ? 'animate-spin' : ''}`} />
                  <span className="truncate">
                    {isScanning 
                      ? `${scanProgress}%` 
                      : scanJustFinished 
                      ? '100% Done ✓' 
                      : 'New Scan'}
                  </span>
                </button>
              </div>
            </div>

            {/* Sub-Bar: GPS Coordinates & Node Counts */}
            <div className={`py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-[10px] sm:text-[11px] font-mono border-b ${
              isLightMode ? 'border-slate-200/60 text-slate-600' : 'border-white/5 text-slate-300'
            }`}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="flex items-center gap-1 font-semibold">
                  <Compass className={`w-3.5 h-3.5 shrink-0 ${isGpsEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>GPS:</span>
                  <span className={`font-bold ${isGpsEnabled ? 'text-cyan-400' : 'text-amber-400'}`}>
                    {isGpsEnabled
                      ? `${techGps.lat.toFixed(4)}° N, ${techGps.lng.toFixed(4)}° E`
                      : 'PAUSED / OFF'}
                  </span>
                </span>
                <span className="opacity-40">•</span>
                <span className="text-slate-400">
                  {isGpsEnabled ? 'Satellites Active' : 'Location Tracking Off'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isResultsWiped ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Trash2 className="w-3 h-3" />
                    <span>0 Nodes (Data Wiped)</span>
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold">
                    {scannedNodes.length} Nodes in <span className="text-cyan-400">{radiusKm} KM</span>
                  </span>
                )}
              </div>
            </div>

            {/* Radius Range Selector & Filter Pills */}
            <div className="pt-2.5 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <span className={`text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider mr-1 shrink-0 ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Range:
                </span>
                {[0.5, 1, 2, 3, 5, 10].map((km) => (
                  <button
                    key={km}
                    onClick={() => {
                      setRadiusKm(km);
                      triggerNewScan(km);
                    }}
                    className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer border shrink-0 ${
                      radiusKm === km
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-black shadow-md shadow-cyan-500/40 ring-1 ring-cyan-400'
                        : isLightMode
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {km}K
                  </button>
                ))}
              </div>

              {/* Node Breakdown Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  onClick={() => setActiveFilter('ALL')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10.5px] sm:text-xs font-mono font-bold transition-all border cursor-pointer shrink-0 ${
                    activeFilter === 'ALL'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-black'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  All ({isResultsWiped ? 0 : scannedNodes.length})
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'FAT' ? 'ALL' : 'FAT')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10.5px] sm:text-xs font-mono font-bold transition-all border cursor-pointer shrink-0 ${
                    activeFilter === 'FAT'
                      ? 'bg-orange-500 text-white border-orange-400 font-black shadow-md'
                      : 'bg-white/5 border-white/10 text-orange-400 hover:text-orange-300'
                  }`}
                >
                  FAT ({isResultsWiped ? 0 : fatCount})
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'HUB' ? 'ALL' : 'HUB')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10.5px] sm:text-xs font-mono font-bold transition-all border cursor-pointer shrink-0 ${
                    activeFilter === 'HUB'
                      ? 'bg-purple-600 text-white border-purple-400 font-black shadow-md'
                      : 'bg-white/5 border-white/10 text-purple-300 hover:text-purple-200'
                  }`}
                >
                  HUB ({isResultsWiped ? 0 : hubCount})
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === 'RSU' ? 'ALL' : 'RSU')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10.5px] sm:text-xs font-mono font-bold transition-all border cursor-pointer shrink-0 ${
                    activeFilter === 'RSU'
                      ? 'bg-emerald-600 text-white border-emerald-400 font-black shadow-md'
                      : 'bg-white/5 border-white/10 text-emerald-300 hover:text-emerald-200'
                  }`}
                >
                  RSU ({isResultsWiped ? 0 : rsuCount})
                </button>
              </div>
            </div>

            {/* MODERN SCAN PROGRESS BAR (SHOWS ALL THE WAY FROM 0% TO 100% COMPLETION) */}
            {(isScanning || showProgressBar) && (
              <div className="py-2.5 space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`font-bold flex items-center gap-1.5 ${
                    isScanSuccess ? 'text-emerald-400' : 'text-cyan-400'
                  }`}>
                    {isScanSuccess && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    <span>{scanStageText}</span>
                  </span>
                  <span className={`font-black ${
                    isScanSuccess ? 'text-emerald-300' : 'text-cyan-300'
                  }`}>
                    {scanProgress}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full bg-black/60 border overflow-hidden transition-colors ${
                  isScanSuccess ? 'border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'border-cyan-500/30'
                }`}>
                  <div
                    className={`h-full transition-all duration-300 ease-out ${
                      isScanSuccess
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500'
                    }`}
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SINGLE, UNIFIED PROXIMITY RESULTS SECTION (NO 3X DUPLICATE RESULTS) */}
          <div className="space-y-3">
            {/* Search & Filter Bar */}
            <div className={`h-11 rounded-2xl flex items-center gap-2.5 px-3.5 border backdrop-blur-2xl transition-all ${
              isLightMode
                ? 'bg-white border-slate-200 text-slate-900 focus-within:border-blue-400 shadow-sm'
                : 'bg-white/5 border-white/10 text-white focus-within:border-cyan-400 shadow-md'
            }`}>
              <Search className={`w-4 h-4 shrink-0 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  onSearchChange?.(e.target.value);
                }}
                placeholder="Filter results by ID, address, locality, or PON port..."
                className="w-full bg-transparent text-xs focus:outline-none placeholder-slate-400 font-medium"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="px-2 py-1 text-xs font-mono font-bold bg-white/10 rounded-lg text-slate-300 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* RESULTS LIST: EXACTLY ONCE */}
            {isResultsWiped || filteredNodes.length === 0 ? (
              <div className={`p-8 sm:p-10 rounded-[26px] border text-center space-y-3 ${
                isLightMode ? 'bg-white border-slate-200 text-slate-600' : 'bg-white/[0.03] border-white/10 text-slate-400'
              }`}>
                <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-white/5 border border-white/10">
                  {isResultsWiped ? (
                    <Trash2 className="w-6 h-6 text-amber-400" />
                  ) : (
                    <Crosshair className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">
                    {isResultsWiped ? 'Radar Data Cleared' : 'No Terminals Found In Radius'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {isResultsWiped
                      ? 'Previous scan nodes have been wiped from memory. Tap "New Scan" above to discover nearby FATs and HUBs.'
                      : 'Try expanding the range selector above or verifying GPS sensor lock.'}
                  </p>
                </div>
                <button
                  onClick={() => triggerNewScan()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start Scan</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono px-1">
                  <span className={isLightMode ? 'text-slate-600 font-bold' : 'text-slate-400 font-bold'}>
                    Discovered Proximity Nodes ({filteredNodes.length})
                  </span>
                  <span className="text-cyan-400 font-bold">
                    Within {radiusKm} KM Radius
                  </span>
                </div>

                {/* THE UNIFIED CARD LIST (PAGINATED TO PREVENT DOM FREEZING / STICKING) */}
                {displayedNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3.5 sm:p-4 rounded-[22px] border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? isLightMode
                            ? 'bg-blue-50/80 border-blue-400 shadow-md ring-2 ring-blue-500/15'
                            : 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/30'
                          : isLightMode
                          ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 text-neutral-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* 3D Icon & Core Info */}
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`icon-3d-box w-10 h-10 rounded-xl shrink-0 text-white shadow-md flex items-center justify-center ${
                            node.type === 'FAT'
                              ? 'icon-3d-fat'
                              : node.type === 'HUB'
                              ? 'icon-3d-hub'
                              : 'icon-3d-rsu'
                          }`}>
                            {node.type === 'FAT' && <Fat3DModelIcon size="sm" isLightMode={isLightMode} />}
                            {node.type === 'HUB' && <Hub3DModelIcon size="sm" isLightMode={isLightMode} />}
                            {node.type === 'RSU' && <Rsu3DModelIcon size="sm" isLightMode={isLightMode} />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span className={`text-xs sm:text-sm font-mono font-black ${
                                node.type === 'FAT'
                                  ? 'text-orange-500'
                                  : node.type === 'HUB'
                                  ? 'text-purple-400'
                                  : 'text-emerald-400'
                              }`}>
                                {node.title}
                              </span>
                              <span className="text-[9.5px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 whitespace-nowrap">
                                {node.distanceKm}
                              </span>
                              <span className="text-[9.5px] sm:text-[10px] font-mono text-slate-400 whitespace-nowrap">
                                {node.bearingCardinal} {Math.round(node.bearingDeg)}°
                              </span>
                            </div>

                            <p className={`text-[11px] sm:text-xs truncate mt-0.5 ${
                              isLightMode ? 'text-slate-600' : 'text-slate-300'
                            }`}>
                              {node.subtitle} &middot; <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>{node.locality}</span>
                            </p>

                            {node.extraInfo && (
                              <p className={`text-[10.5px] sm:text-[11px] font-mono mt-0.5 truncate ${
                                isLightMode ? 'text-blue-600' : 'text-cyan-400/90'
                              }`}>
                                {node.extraInfo}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Node Type Badge */}
                        <div className="text-right shrink-0">
                          <span className="text-[9.5px] sm:text-[10px] font-mono text-slate-400 block">Node Type</span>
                          <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30">
                            {node.type}
                          </span>
                        </div>
                      </div>

                      {/* Direct Action Row on Each Node Card */}
                      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap">
                        {/* Copy GPS */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCoordinates(node);
                          }}
                          className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10.5px] sm:text-[11px] font-mono font-semibold flex items-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
                            isLightMode
                              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                          }`}
                          title="Copy GPS coordinates"
                        >
                          {copiedId === node.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy GPS</span>
                            </>
                          )}
                        </button>

                        {/* Terminal Details for FAT */}
                        {node.type === 'FAT' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInspectNode(node);
                            }}
                            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10.5px] sm:text-[11px] font-mono font-bold flex items-center gap-1.5 border transition-all active:scale-95 cursor-pointer ${
                              isLightMode
                                ? 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700'
                                : 'bg-purple-950/40 hover:bg-purple-900/40 border-purple-500/30 text-purple-300'
                            }`}
                          >
                            <Info className="w-3 h-3" />
                            <span>Details</span>
                          </button>
                        )}

                        {/* Start GPS Navigation */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartNodeNavigation(node);
                          }}
                          className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-[10.5px] sm:text-[11px] font-mono font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 border ${
                            isLightMode
                              ? 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white shadow-sm'
                              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 border-cyan-400 text-slate-950 shadow-md shadow-cyan-500/25'
                          }`}
                        >
                          <Navigation className="w-3 h-3 fill-current" />
                          <span>Turn GPS</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* SHOW MORE PAGINATION CONTROLS TO PREVENT DOM FREEZING */}
                {filteredNodes.length > visibleLimit && (
                  <div className="pt-3 text-center flex items-center justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => setVisibleLimit((prev) => prev + 50)}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs cursor-pointer shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
                    >
                      <span>Show More Terminals (+50)</span>
                    </button>
                    <button
                      onClick={() => setVisibleLimit(filteredNodes.length)}
                      className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono font-bold text-xs cursor-pointer active:scale-95 transition-all"
                    >
                      <span>Show All ({filteredNodes.length})</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const RadarScanningView = React.memo(RadarScanningViewComp);
