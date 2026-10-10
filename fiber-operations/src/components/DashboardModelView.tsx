import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FatRecord, FAT_DATASET, calculateGpsDistanceMeters, calculateBearingDegrees } from '../data/telecomDataset';
import { SparklineChart } from './SparklineChart';
import { NetworkOperationsCenterCard } from './NetworkOperationsCenterCard';
import { 
  ChevronRight, Radio, GripVertical, Sliders,
  Check, RotateCcw, Sparkles as LucideSparkles, MapPin, Zap, Flame, Search, X, Navigation,
  RefreshCw, ChevronDown, ChevronUp, Layers, Compass, Network, Briefcase, Shield, ArrowRight, Power,
  LogOut, User, Smartphone
} from 'lucide-react';
import { Fat3DModelIcon, Hub3DModelIcon, Rsu3DModelIcon, PonPort3DModelIcon, Radar3DModelIcon } from './ModelIcons';
import { AndroidStudioModal } from './AndroidStudioModal';

import { UserAuthProfile } from './TechnicianLoginPage';

const Sparkles = LucideSparkles || ((props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
));

interface DashboardModelViewProps {
  onOpenSearch?: () => void;
  onSelectFat: (fat: FatRecord) => void;
  onOpenGisMap: () => void;
  onOpenRadarPage?: () => void;
  onOpenPonTrunks: () => void;
  onOpenCentralHubs: () => void;
  onOpenFatTerminals: () => void;
  isLightMode?: boolean;
  onBack?: () => void;
  canGoBack?: boolean;
  isNearby1KmOnly?: boolean;
  onToggleNearby1Km?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onNavigateToFat?: (fat: FatRecord) => void;
  isScrolledDown?: boolean;
  onScrollChange?: (isScrolledDown: boolean) => void;
  onRegisterScrollToTop?: (scrollFn: () => void) => void;
  currentUser?: UserAuthProfile | null;
  onOpenSettings?: () => void;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
}

type DashboardCardKey = 'noc' | 'radar' | 'total_fats' | 'asus_hubs' | 'rsu_instructions';

const DEFAULT_CARD_ORDER: DashboardCardKey[] = [
  'noc',
  'radar',
  'total_fats',
  'asus_hubs',
  'rsu_instructions'
];

const CARD_LABELS: Record<DashboardCardKey, string> = {
  noc: 'Network Operations Center',
  radar: 'Proximity Full View Dark Map',
  total_fats: 'Total FATs Telemetry',
  asus_hubs: 'Unique ASUS & Total Hubs',
  rsu_instructions: 'RSU Hubs & Instructions'
};

const KM_OPTIONS = [0.5, 1, 2, 3, 5] as const;

const DashboardModelViewComp: React.FC<DashboardModelViewProps> = ({
  onSelectFat,
  onOpenGisMap,
  onOpenRadarPage,
  onOpenPonTrunks,
  onOpenCentralHubs,
  onOpenFatTerminals,
  isLightMode = false,
  isNearby1KmOnly = false,
  onToggleNearby1Km,
  searchQuery = '',
  onSearchChange,
  onNavigateToFat,
  isScrolledDown,
  onScrollChange,
  onRegisterScrollToTop,
  currentUser,
  onOpenSettings,
  onOpenLoginModal,
  onLogout
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isAndroidStudioModalOpen, setIsAndroidStudioModalOpen] = useState(false);

  // Relaxed telemetry metrics (zero CPU battery heating)
  const [liveFatPercent, setLiveFatPercent] = useState(25.9);
  const [liveUnitsOnline, setLiveUnitsOnline] = useState(55);
  const [liveAsusItems, setLiveAsusItems] = useState(55);
  const [liveHubsCount, setLiveHubsCount] = useState(2011);

  // Dedicated Home Screen Search Box State
  const [isHomeSearchExpanded, setIsHomeSearchExpanded] = useState(false);
  const [searchFilterType, setSearchFilterType] = useState<'ALL' | 'FAT' | 'HUB' | 'RSU'>('ALL');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Scroll tracking: when scrolling down, search collapses to top bar; when scrolling up, returns to search box
  const [internalIsScrolled, setInternalIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const effectiveIsScrolled = isScrolledDown !== undefined ? isScrolledDown : internalIsScrolled;

  // Register smooth scroll-to-top callback for parent header search button
  useEffect(() => {
    if (onRegisterScrollToTop) {
      onRegisterScrollToTop(() => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        setIsHomeSearchExpanded(true);
        setTimeout(() => searchInputRef.current?.focus(), 250);
      });
    }
  }, [onRegisterScrollToTop]);

  // Kilometer Selection for scanning (default: 1 km)
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(1);

  // Radar scanning stages: ONLY 1 TIME SCAN to prevent battery drain and phone heat
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStageText, setScanStageText] = useState('');
  const [gpsOffNotice, setGpsOffNotice] = useState<string | null>(null);
  const scanAnimFrameRef = useRef<number | null>(null);

  // "SHOW ONLY THAT COUNT": Toggle to view nearby nodes list
  const [showOnlyNearbyList, setShowOnlyNearbyList] = useState(false);

  // Separate tab view when viewing counted nodes: 'FAT' | 'HUB' | 'RSU'
  const [nearbyActiveTab, setNearbyActiveTab] = useState<'FAT' | 'HUB' | 'RSU'>('FAT');

  const [isRadarGpsEnabled, setIsRadarGpsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('locfinder_radar_gps_enabled') !== 'false';
  });

  // Single-pass GPS anchor
  const [userAnchorGps, setUserAnchorGps] = useState<{ lat: number; lng: number }>({
    lat: 10.0261, // Default Central Cochin/Calicut optical corridor
    lng: 76.3125
  });

  useEffect(() => {
    localStorage.setItem('locfinder_radar_gps_enabled', String(isRadarGpsEnabled));
  }, [isRadarGpsEnabled]);

  // When GPS is turned OFF, radar stops immediately & clears active results
  useEffect(() => {
    if (!isRadarGpsEnabled) {
      if (scanAnimFrameRef.current) {
        cancelAnimationFrame(scanAnimFrameRef.current);
        scanAnimFrameRef.current = null;
      }
      setIsScanning(false);
      setScanCompleted(false);
      setScanProgress(0);
      setShowOnlyNearbyList(false);
    }
  }, [isRadarGpsEnabled]);

  // Perform single 1-time scan ONLY IF GPS IS ENABLED
  const triggerSingleScan = useCallback((radiusKm?: number) => {
    const targetRadius = radiusKm !== undefined ? radiusKm : selectedRadiusKm;

    // IF GPS IS OFF: RADAR CANNOT WORK!
    if (!isRadarGpsEnabled) {
      setIsScanning(false);
      setScanCompleted(false);
      setScanProgress(0);
      setGpsOffNotice('GPS is turned OFF! Radar requires GPS location.');
      setTimeout(() => setGpsOffNotice(null), 3500);
      return;
    }

    setGpsOffNotice(null);
    setIsScanning(true);
    setScanCompleted(false);
    setScanProgress(0);
    setScanStageText(`Wiping buffer & preparing ${targetRadius} KM perimeter...`);

    if (scanAnimFrameRef.current) {
      cancelAnimationFrame(scanAnimFrameRef.current);
    }

    // Optional 1-time geolocation grab if GPS enabled
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos.coords.latitude >= 8 && pos.coords.latitude <= 13) {
            setUserAnchorGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        },
        () => {},
        { timeout: 3000, maximumAge: 60000 }
      );
    }

    const duration = 1200; // Smooth 1.2s modern scan
    const startTime = performance.now();

    const updateScan = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setScanProgress(pct);

      if (pct < 25) {
        setScanStageText('Wiping old buffers & zeroing receiver...');
      } else if (pct < 65) {
        setScanStageText(`Sweeping ${targetRadius} KM optical grid...`);
      } else if (pct < 95) {
        setScanStageText('Locking nearby FATs, HUBs & RSUs...');
      } else {
        setScanStageText('Grid scan locked with RTK precision');
      }

      if (elapsed < duration) {
        scanAnimFrameRef.current = requestAnimationFrame(updateScan);
      } else {
        setScanProgress(100);
        setScanStageText(`✓ 100% Grid Scan Complete · ${nearbyNodesData.fats.length} Terminals Locked`);
        setTimeout(() => {
          setIsScanning(false);
          setScanCompleted(true);
        }, 600);
      }
    };

    scanAnimFrameRef.current = requestAnimationFrame(updateScan);
  }, [isRadarGpsEnabled, selectedRadiusKm]);

  // When 1KM or Nearby is toggled on, run scan ONLY IF GPS IS ENABLED
  useEffect(() => {
    if (isNearby1KmOnly) {
      if (isRadarGpsEnabled) {
        triggerSingleScan(selectedRadiusKm);
      } else {
        setGpsOffNotice('GPS is turned OFF! Turn GPS ON to activate radar.');
        setTimeout(() => setGpsOffNotice(null), 3500);
      }
    } else {
      setIsScanning(false);
      setScanCompleted(false);
      setShowOnlyNearbyList(false);
    }
  }, [isNearby1KmOnly, triggerSingleScan, selectedRadiusKm, isRadarGpsEnabled]);

  // Compute nearby FATs, HUBs, and RSUs for the selected radius
  const nearbyNodesData = useMemo(() => {
    // If GPS is OFF, radar doesn't work! Zero nodes shown.
    if (!isRadarGpsEnabled) {
      return {
        fats: [],
        fatCount: 0,
        hubs: [],
        hubCount: 0,
        rsus: [],
        rsuCount: 0
      };
    }

    const maxMeters = selectedRadiusKm * 1000;

    // Fast bounding box filtering to eliminate 99.9% of distant points before Haversine trig calculations
    const latDelta = (maxMeters + 2000) / 111000; // 2km safety buffer
    const lngDelta = (maxMeters + 2000) / 100000;

    let candidateSet = FAT_DATASET.filter(
      (f) =>
        Math.abs(f.fatLat - userAnchorGps.lat) <= latDelta &&
        Math.abs(f.fatLog - userAnchorGps.lng) <= lngDelta
    );

    if (candidateSet.length === 0) {
      candidateSet = FAT_DATASET.slice(0, 50);
    }

    const withDist = candidateSet.map((f) => {
      const dist = calculateGpsDistanceMeters(
        userAnchorGps.lat,
        userAnchorGps.lng,
        f.fatLat,
        f.fatLog
      );
      const bearing = calculateBearingDegrees(
        userAnchorGps.lat,
        userAnchorGps.lng,
        f.fatLat,
        f.fatLog
      );
      return {
        ...f,
        distanceMeters: dist,
        bearingDegrees: bearing,
        distanceText: dist < 1000 ? `${dist}m` : `${(dist / 1000).toFixed(2)}km`
      };
    });

    let filtered = withDist.filter((f) => f.distanceMeters <= maxMeters);
    if (filtered.length === 0) {
      filtered = withDist.slice(0, Math.min(12, Math.max(4, Math.round(selectedRadiusKm * 8))));
    }

    filtered.sort((a, b) => a.distanceMeters - b.distanceMeters);

    // Group into unique HUBs
    const hubMap = new Map<string, { hub: string; rsu: string; city: string; locality: string; fatCount: number; minDistanceMeters: number; lat: number; lng: number }>();
    filtered.forEach((f) => {
      const existing = hubMap.get(f.hub);
      if (!existing || f.distanceMeters < existing.minDistanceMeters) {
        hubMap.set(f.hub, {
          hub: f.hub,
          rsu: f.rsu,
          city: f.city,
          locality: f.locality,
          fatCount: (existing ? existing.fatCount : 0) + 1,
          minDistanceMeters: f.distanceMeters,
          lat: f.fatLat,
          lng: f.fatLog
        });
      } else {
        existing.fatCount += 1;
      }
    });
    const uniqueHubList = Array.from(hubMap.values());

    // Group into unique RSUs
    const rsuMap = new Map<string, { rsu: string; city: string; hubCount: number; fatCount: number; minDistanceMeters: number; lat: number; lng: number }>();
    filtered.forEach((f) => {
      const existing = rsuMap.get(f.rsu);
      if (!existing) {
        rsuMap.set(f.rsu, {
          rsu: f.rsu,
          city: f.city,
          hubCount: 1,
          fatCount: 1,
          minDistanceMeters: f.distanceMeters,
          lat: f.fatLat,
          lng: f.fatLog
        });
      } else {
        existing.fatCount += 1;
        if (f.distanceMeters < existing.minDistanceMeters) {
          existing.minDistanceMeters = f.distanceMeters;
        }
      }
    });
    const uniqueRsuList = Array.from(rsuMap.values());

    return {
      fats: filtered,
      fatCount: filtered.length,
      hubs: uniqueHubList,
      hubCount: uniqueHubList.length,
      rsus: uniqueRsuList,
      rsuCount: uniqueRsuList.length
    };
  }, [selectedRadiusKm, userAnchorGps, isRadarGpsEnabled]);

  // Home Page Customization: Card ordering & edit mode
  const [cardOrder, setCardOrder] = useState<DashboardCardKey[]>(() => {
    try {
      const saved = localStorage.getItem('telecom_home_dashboard_layout');
      if (saved) {
        const parsed = JSON.parse(saved) as DashboardCardKey[];
        if (Array.isArray(parsed) && parsed.length === DEFAULT_CARD_ORDER.length) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_CARD_ORDER;
  });

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [draggedCardId, setDraggedCardId] = useState<DashboardCardKey | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<DashboardCardKey | null>(null);

  // Press & Hold Detector
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const startPressTimer = (cardKey: DashboardCardKey, e: React.TouchEvent | React.MouseEvent) => {
    if (isCustomizing) return;
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

    const clientX = 'touches' in e ? e.touches[0]?.clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : (e as React.MouseEvent).clientY;
    touchStartPosRef.current = { x: clientX, y: clientY };

    longPressTimerRef.current = setTimeout(() => {
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([35, 45, 35]);
        }
      } catch {}
      setIsCustomizing(true);
      setDraggedCardId(cardKey);
      setTimeout(() => setDraggedCardId(null), 800);
    }, 450);
  };

  const cancelPressTimer = (e?: React.TouchEvent | React.MouseEvent) => {
    if (e && 'touches' in e && touchStartPosRef.current) {
      const currentX = e.touches[0]?.clientX || 0;
      const currentY = e.touches[0]?.clientY || 0;
      const dist = Math.hypot(currentX - touchStartPosRef.current.x, currentY - touchStartPosRef.current.y);
      if (dist > 10) {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      return;
    }

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const clearTimerOnRelease = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const moveCard = useCallback((index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cardOrder.length) return;

    setCardOrder((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, item);
      localStorage.setItem('telecom_home_dashboard_layout', JSON.stringify(copy));
      return copy;
    });
  }, [cardOrder.length]);

  const handleDragStart = (e: React.DragEvent, cardKey: DashboardCardKey) => {
    setDraggedCardId(cardKey);
    e.dataTransfer.setData('text/plain', cardKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, cardKey: DashboardCardKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCardId !== cardKey) {
      setDragOverCardId(cardKey);
    }
  };

  const handleDrop = (e: React.DragEvent, targetCardKey: DashboardCardKey) => {
    e.preventDefault();
    const sourceCardKey = e.dataTransfer.getData('text/plain') as DashboardCardKey;
    if (!sourceCardKey || sourceCardKey === targetCardKey) return;

    setCardOrder((prev) => {
      const copy = [...prev];
      const sourceIndex = copy.indexOf(sourceCardKey);
      const targetIndex = copy.indexOf(targetCardKey);
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const [removed] = copy.splice(sourceIndex, 1);
        copy.splice(targetIndex, 0, removed);
        localStorage.setItem('telecom_home_dashboard_layout', JSON.stringify(copy));
      }
      return copy;
    });
    setDraggedCardId(null);
    setDragOverCardId(null);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverCardId(null);
  };

  const handleResetLayout = () => {
    setCardOrder(DEFAULT_CARD_ORDER);
    localStorage.removeItem('telecom_home_dashboard_layout');
  };

  const handleLiveFatUpdate = useCallback((latestValue: number) => {
    setLiveFatPercent(latestValue);
    setLiveUnitsOnline(50 + Math.round((latestValue / 100) * 20));
  }, []);

  const handleLiveAsusUpdate = useCallback((latestValue: number) => {
    setLiveAsusItems(Math.round(latestValue));
  }, []);

  const handleLiveHubsUpdate = useCallback((latestValue: number) => {
    setLiveHubsCount(Math.round(latestValue));
  }, []);

  // Fast short-circuiting search loop (max 12 matches required)
  const matchingFats = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return FAT_DATASET.slice(0, 4);
    }
    const matches: FatRecord[] = [];
    for (const f of FAT_DATASET) {
      if (matches.length >= 12) break;
      if (!f) continue;

      let isMatch = false;
      if (searchFilterType === 'FAT') {
        isMatch = f.fatId.toLowerCase().includes(q) || f.neAddress.toLowerCase().includes(q);
      } else if (searchFilterType === 'HUB') {
        isMatch = f.hub.toLowerCase().includes(q);
      } else if (searchFilterType === 'RSU') {
        isMatch = f.rsu.toLowerCase().includes(q);
      } else {
        isMatch =
          f.fatId.toLowerCase().includes(q) ||
          f.ponPort.toLowerCase().includes(q) ||
          f.neAddress.toLowerCase().includes(q) ||
          f.locality.toLowerCase().includes(q) ||
          f.city.toLowerCase().includes(q) ||
          f.hub.toLowerCase().includes(q) ||
          f.rsu.toLowerCase().includes(q);
      }

      if (isMatch) {
        matches.push(f);
      }
    }

    return matches.slice(0, 8);
  }, [searchQuery, searchFilterType]);

  // Card Content Renderer
  const renderCardContent = (key: DashboardCardKey) => {
    switch (key) {
      case 'noc':
        return (
          <NetworkOperationsCenterCard
            onOpenGisMap={onOpenGisMap}
            onOpenPonTrunks={onOpenPonTrunks}
            onOpenCentralHubs={onOpenCentralHubs}
            onOpenFatTerminals={onOpenFatTerminals}
            isLightMode={isLightMode}
          />
        );

      case 'radar':
        return (
          <div
            className={`rounded-2xl p-3 sm:p-3.5 shadow-sm relative overflow-hidden transition-all duration-300 group border ${
              !isRadarGpsEnabled
                ? isLightMode
                  ? 'bg-amber-50/50 border-amber-300/60 text-slate-900'
                  : 'bg-slate-900/60 border-amber-500/25 text-slate-200'
                : isScanning
                ? 'border border-cyan-500/60 bg-cyan-950/25 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-slate-100 ring-1 ring-cyan-500/30'
                : scanCompleted && isNearby1KmOnly
                ? 'border border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_18px_rgba(16,185,129,0.2)] text-slate-100'
                : isLightMode
                ? 'clean-light-card clean-light-card-hover text-slate-900'
                : 'bg-gradient-to-r from-[#161822] via-[#12141c] to-[#0d0f17] text-white border-white/10 shadow-lg'
            }`}
          >
            <div className="relative z-10 space-y-2.5">
              {/* COMPACT TOP ROW: Icon + Title + Status + Action Controls */}
              <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Compact Radar Icon (Decreased size, sleek) */}
                  <div
                    onClick={!isCustomizing ? (onOpenRadarPage || onOpenGisMap) : undefined}
                    className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                    title="Open Dedicated Radar Scanner Page"
                  >
                    <Radio className="w-4 h-4 stroke-[2.2]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className={`text-xs sm:text-sm font-extrabold tracking-tight truncate ${
                        !isRadarGpsEnabled
                          ? 'text-amber-400'
                          : isScanning
                          ? 'text-cyan-300'
                          : scanCompleted && isNearby1KmOnly
                          ? 'text-emerald-300'
                          : isLightMode
                          ? 'text-slate-900'
                          : 'text-white'
                      }`}>
                        Proximity Radar
                      </h3>

                      {/* Status Badges */}
                      {!isRadarGpsEnabled ? (
                        <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-400 shrink-0">
                          GPS OFF · INACTIVE
                        </span>
                      ) : isScanning ? (
                        <span className="flex items-center gap-1 text-[9.5px] font-mono font-black px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.6)] animate-pulse shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
                          SCANNING {scanProgress}%
                        </span>
                      ) : scanCompleted && isNearby1KmOnly ? (
                        <span className="flex items-center gap-1 text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400 text-emerald-300 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_6px_#34d399]" />
                          LOCKED ({nearbyNodesData.fatCount} FATS)
                        </span>
                      ) : (
                        <span className={`text-[9.5px] font-mono font-medium px-2 py-0.5 rounded-full border shrink-0 ${
                          isLightMode ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/10 border-white/10 text-slate-300'
                        }`}>
                          IDLE · ±3m RTK
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Controls: GPS ON/OFF, New Scan, Radar Toggle, Full Radar */}
                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                  {/* GPS ON / OFF TOGGLE */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = !isRadarGpsEnabled;
                      setIsRadarGpsEnabled(next);
                      if (next) {
                        triggerSingleScan(selectedRadiusKm);
                      }
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 border ${
                      isRadarGpsEnabled
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-sm'
                        : 'bg-amber-500/15 border-amber-400/50 text-amber-400 hover:bg-amber-500/25'
                    }`}
                    title={isRadarGpsEnabled ? 'GPS Active (Click to turn OFF)' : 'GPS Inactive (Click to turn ON)'}
                  >
                    <Power className={`w-3 h-3 ${isRadarGpsEnabled ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                    <span>GPS: <b>{isRadarGpsEnabled ? 'ON' : 'OFF'}</b></span>
                  </button>

                  {/* RE-SCAN BUTTON (Zero operation if GPS is OFF) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isRadarGpsEnabled) {
                        setGpsOffNotice('GPS is turned OFF! Turn GPS ON to activate radar scanner.');
                        setTimeout(() => setGpsOffNotice(null), 3500);
                        return;
                      }
                      if (!isNearby1KmOnly && onToggleNearby1Km) {
                        onToggleNearby1Km();
                      } else {
                        triggerSingleScan(selectedRadiusKm);
                      }
                    }}
                    disabled={isScanning || !isRadarGpsEnabled}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 border ${
                      !isRadarGpsEnabled
                        ? 'opacity-40 cursor-not-allowed border-transparent bg-white/5 text-slate-500'
                        : isScanning
                        ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200 animate-pulse'
                        : isLightMode
                        ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800 shadow-sm'
                        : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                    }`}
                    title={!isRadarGpsEnabled ? 'GPS is OFF. Turn ON GPS to scan' : 'Wipe previous results and scan anew'}
                  >
                    <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
                    <span>{isScanning ? 'Scanning' : 'Scan'}</span>
                  </button>

                  {/* RADAR ON/OFF TOGGLE (Requires GPS) */}
                  {onToggleNearby1Km && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isRadarGpsEnabled && !isNearby1KmOnly) {
                          setGpsOffNotice('GPS is turned OFF! Turn GPS ON to activate radar.');
                          setTimeout(() => setGpsOffNotice(null), 3500);
                          return;
                        }
                        onToggleNearby1Km();
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-black flex items-center gap-1 cursor-pointer transition-all active:scale-95 border ${
                        !isRadarGpsEnabled
                          ? 'opacity-50 border-amber-500/30 bg-amber-950/20 text-amber-300'
                          : isScanning
                          ? 'bg-cyan-600 border-cyan-400 text-white shadow-sm'
                          : scanCompleted && isNearby1KmOnly
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm'
                          : isLightMode
                          ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                          : 'bg-white/10 border-white/15 text-slate-300 hover:text-white'
                      }`}
                      title="Turn proximity radar scan ON or OFF"
                    >
                      <span>RADAR:</span>
                      <span>{isNearby1KmOnly && isRadarGpsEnabled ? 'ON' : 'OFF'}</span>
                    </button>
                  )}

                  {/* FULL RADAR PAGE SHORTCUT (Compact icon button instead of bulky row) */}
                  {onOpenRadarPage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRadarPage();
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors border border-transparent hover:border-cyan-500/30"
                      title="Open Dedicated Full Radar Page"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* GPS OFF NOTICE BANNER (When GPS is disabled, radar does not work) */}
              {!isRadarGpsEnabled && (
                <div className="p-2 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300">
                    <Power className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>GPS is OFF · Radar cannot work without GPS location.</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsRadarGpsEnabled(true);
                      triggerSingleScan(selectedRadiusKm);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-mono font-bold shrink-0 cursor-pointer transition-all active:scale-95"
                  >
                    Turn ON
                  </button>
                </div>
              )}

              {/* TEMPORARY GPS OFF ALERT (if user tapped scan when GPS off) */}
              {gpsOffNotice && isRadarGpsEnabled === false && (
                <div className="text-[10.5px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-lg animate-in fade-in">
                  ⚠️ {gpsOffNotice}
                </div>
              )}

              {/* MODERN LOADING PROGRESS BAR - SHOWN ONLY DURING SCANNING (No radar graphic!) */}
              {isScanning && (
                <div className="space-y-1.5 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="flex items-center justify-between text-[10.5px] font-mono">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block shadow-[0_0_6px_#22d3ee] shrink-0" />
                      <span className="font-bold text-cyan-300 truncate">
                        {scanStageText}
                      </span>
                    </div>
                    <span className="font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 shrink-0 ml-2">
                      {scanProgress}%
                    </span>
                  </div>

                  {/* Modern Sleek Progress Bar Track */}
                  <div className="relative w-full h-2 sm:h-2.5 rounded-full p-0.5 border border-cyan-500/40 bg-black/70 shadow-inner overflow-hidden select-none">
                    <div
                      className="h-full rounded-full relative transition-all duration-100 ease-out flex items-center overflow-hidden"
                      style={{
                        width: `${scanProgress}%`,
                        background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 50%, #10b981 100%)',
                        boxShadow: '0 0 12px rgba(6, 182, 212, 0.6)'
                      }}
                    >
                      {/* Animated shimmer beam running across */}
                      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-loading-shimmer" />
                      </div>
                      {/* Glowing leading tip dot */}
                      <div className="absolute right-0 top-0 bottom-0 w-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>Range: {selectedRadiusKm} KM</span>
                    <span>1490/1550nm Laser Sweep</span>
                  </div>
                </div>
              )}

              {/* COMPACT BOTTOM UTILITY ROW: Radius Micro-Pills (Left) & Count Summary (Right) */}
              {isRadarGpsEnabled && (
                <div className="flex items-center justify-between gap-2 pt-0.5 flex-wrap">
                  {/* Compact Radius Micro-Chips */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono text-slate-400 mr-0.5">Range:</span>
                    {KM_OPTIONS.map((km) => (
                      <button
                        key={km}
                        onClick={() => {
                          setSelectedRadiusKm(km);
                          if (isNearby1KmOnly) {
                            triggerSingleScan(km);
                          }
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                          selectedRadiusKm === km
                            ? isLightMode
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-xs'
                            : isLightMode
                            ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {km}k
                      </button>
                    ))}
                  </div>

                  {/* Compact Node Count Breakdown Trigger */}
                  <button
                    onClick={() => setShowOnlyNearbyList(!showOnlyNearbyList)}
                    className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                      showOnlyNearbyList
                        ? isLightMode
                          ? 'bg-blue-50 border-blue-300 text-blue-900'
                          : 'bg-cyan-950/60 border-cyan-500/50 text-cyan-200'
                        : isLightMode
                        ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                    }`}
                    title="Toggle FAT, HUB and RSU lists"
                  >
                    <span className="text-amber-400">{nearbyNodesData.fatCount} FAT</span>
                    <span className="opacity-40">·</span>
                    <span className="text-purple-300">{nearbyNodesData.hubCount} HUB</span>
                    <span className="opacity-40">·</span>
                    <span className="text-emerald-400">{nearbyNodesData.rsuCount} RSU</span>
                    {showOnlyNearbyList ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                  </button>
                </div>
              )}

              {/* =================================================================
                  SEPARATE SHOW FOR FAT, HUB, AND RSU WITH MODERN 3D ICONS
                  ================================================================= */}
              {showOnlyNearbyList && (
                !isRadarGpsEnabled ? (
                  <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 text-center space-y-1">
                    <p className="text-xs font-mono font-bold text-amber-400">
                      GPS IS TURNED OFF
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">
                      Turn GPS ON above to discover nearby FAT terminals, HUBs, and RSUs.
                    </p>
                  </div>
                ) : isScanning ? (
                  <div className="p-3 rounded-xl border border-cyan-500/40 bg-black/40 text-center space-y-1 animate-pulse">
                    <p className="text-xs font-mono font-bold text-cyan-400">
                      WIPING PREVIOUS RESULTS • SCANNING GRID...
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">
                      Sweeping {selectedRadiusKm} KM perimeter with optical sensor...
                    </p>
                  </div>
                ) : (
                <div className={`p-3 rounded-2xl border space-y-3 animate-in fade-in duration-150 ${
                  isLightMode ? 'bg-white border-blue-200 shadow-sm' : 'bg-[#10121d] border-white/15'
                }`}>
                  {/* SEPARATE TABS WITH MODERN 3D ICONS: FAT | HUB | RSU */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/10">
                    <button
                      onClick={() => setNearbyActiveTab('FAT')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        nearbyActiveTab === 'FAT'
                          ? isLightMode
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/30'
                          : isLightMode ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Fat3DModelIcon size="xs" isLightMode={isLightMode} isActive={nearbyActiveTab === 'FAT'} />
                      <span>FATs ({nearbyNodesData.fatCount})</span>
                    </button>

                    <button
                      onClick={() => setNearbyActiveTab('HUB')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        nearbyActiveTab === 'HUB'
                          ? isLightMode
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                          : isLightMode ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Hub3DModelIcon size="xs" isLightMode={isLightMode} isActive={nearbyActiveTab === 'HUB'} />
                      <span>HUBs ({nearbyNodesData.hubCount})</span>
                    </button>

                    <button
                      onClick={() => setNearbyActiveTab('RSU')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        nearbyActiveTab === 'RSU'
                          ? isLightMode
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30'
                          : isLightMode ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Rsu3DModelIcon size="xs" isLightMode={isLightMode} isActive={nearbyActiveTab === 'RSU'} />
                      <span>RSUs ({nearbyNodesData.rsuCount})</span>
                    </button>
                  </div>

                  {/* TAB 1: SEPARATE FAT TERMINALS LIST */}
                  {nearbyActiveTab === 'FAT' && (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto no-scrollbar pt-1">
                      {nearbyNodesData.fats.map((fat) => (
                        <div
                          key={fat.id}
                          onClick={() => onSelectFat(fat)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isLightMode
                              ? 'bg-slate-50 hover:bg-blue-50/70 border-slate-200 text-slate-900'
                              : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <Fat3DModelIcon size="sm" isLightMode={isLightMode} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono font-black text-blue-600 dark:text-cyan-300">
                                  FAT {fat.fatId}
                                </span>
                                <span className="text-[10px] font-mono font-bold px-1.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  {fat.distanceText}
                                </span>
                                <span className="text-[10px] font-mono px-1 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                  {fat.ponPort}
                                </span>
                              </div>
                              <div className="text-[10.5px] truncate mt-0.5 text-slate-500 dark:text-slate-400">
                                {fat.neAddress} · {fat.locality}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {onNavigateToFat && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToFat(fat);
                                }}
                                className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                                  isLightMode
                                    ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                                    : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60'
                                }`}
                                title="Navigate to node"
                              >
                                <Navigation className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <span className="text-[10px] font-mono font-bold text-slate-500">
                              HUB {fat.hub}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 2: SEPARATE CENTRAL DISTRIBUTION HUBS LIST */}
                  {nearbyActiveTab === 'HUB' && (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto no-scrollbar pt-1">
                      {nearbyNodesData.hubs.map((hub) => (
                        <div
                          key={hub.hub}
                          onClick={onOpenCentralHubs}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isLightMode
                              ? 'bg-slate-50 hover:bg-amber-50/70 border-slate-200 text-slate-900'
                              : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <Hub3DModelIcon size="sm" isLightMode={isLightMode} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                                  HUB {hub.hub}
                                </span>
                                <span className="text-[10px] font-mono font-bold px-1.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                  ~{hub.minDistanceMeters}m
                                </span>
                                <span className="text-[10px] font-mono px-1 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                  RSU {hub.rsu}
                                </span>
                              </div>
                              <div className="text-[10.5px] truncate mt-0.5 text-slate-500 dark:text-slate-400">
                                {hub.locality} · {hub.city} · {hub.fatCount} Connected Field FATs
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold font-mono px-2 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-300 shrink-0">
                            View Hub
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 3: SEPARATE RSU EXCHANGES LIST */}
                  {nearbyActiveTab === 'RSU' && (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto no-scrollbar pt-1">
                      {nearbyNodesData.rsus.map((rsu) => (
                        <div
                          key={rsu.rsu}
                          onClick={onOpenCentralHubs}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isLightMode
                              ? 'bg-slate-50 hover:bg-emerald-50/70 border-slate-200 text-slate-900'
                              : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <Rsu3DModelIcon size="sm" isLightMode={isLightMode} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                                  RSU {rsu.rsu}
                                </span>
                                <span className="text-[10px] font-mono font-bold px-1.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  Exchange Site
                                </span>
                              </div>
                              <div className="text-[10.5px] truncate mt-0.5 text-slate-500 dark:text-slate-400">
                                {rsu.city} Primary Exchange Backbone
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold font-mono px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 shrink-0">
                            View RSU
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'total_fats':
        return (
          <div
            onClick={!isCustomizing ? onOpenFatTerminals : undefined}
            className={`rounded-[26px] p-4 shadow-md space-y-2 cursor-pointer transition-all duration-300 border ${
              isLightMode
                ? 'clean-light-card clean-light-card-hover text-slate-900'
                : 'liquid-glass-card liquid-glass-card-hover text-white'
            }`}
          >
            <div className="flex justify-between items-center text-xs">
              <div className={`flex items-center gap-1 font-bold tracking-wider ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                <span>TOTAL FATS</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className={`flex items-center gap-2 text-[11px] font-mono ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>1 Feb</span>
                <span className="text-slate-400">·</span>
                <span>1000/2004</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className={`text-3xl font-black font-mono tracking-tight transition-all duration-300 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                {liveFatPercent.toFixed(1)}%
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>{liveUnitsOnline} Units Online</span>
              </div>
            </div>

            <div className="pt-1">
              <SparklineChart
                dataPoints={[20, 22, 25, 27, 26, 28, 27, 26]}
                timeLabels={['11:00', '12:00', '2:00 PM']}
                colorTheme="cyan"
                unit="%"
                height={70}
                isLive={false}
                onLiveUpdate={handleLiveFatUpdate}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Average 35.8%</span>
              <span className={`font-semibold ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>Active Sector</span>
            </div>
          </div>
        );

      case 'asus_hubs':
        return (
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={!isCustomizing ? onOpenPonTrunks : undefined}
              className={`rounded-3xl p-3.5 shadow-md space-y-1.5 cursor-pointer transition-all border ${
                isLightMode ? 'clean-light-card clean-light-card-hover text-slate-900' : 'bg-[#141620]/90 border-white/10 text-white'
              }`}
            >
              <div className={`text-[11px] font-bold tracking-wider uppercase ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                UNIQUE ASUS
              </div>
              <div className={`text-2xl font-black font-mono transition-all duration-300 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                {liveAsusItems}
              </div>
              <div className="pt-1">
                <SparklineChart
                  dataPoints={[40, 48, 52, 58, 55, 54]}
                  colorTheme="amber"
                  height={40}
                  isLive={false}
                  minBound={35}
                  maxBound={65}
                  volatility={1.8}
                  onLiveUpdate={handleLiveAsusUpdate}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>0.0</span>
                <span className="text-amber-500 font-bold">+8% peak</span>
              </div>
            </div>

            <div
              onClick={!isCustomizing ? onOpenCentralHubs : undefined}
              className={`rounded-3xl p-3.5 shadow-md space-y-1.5 cursor-pointer transition-all border ${
                isLightMode ? 'clean-light-card clean-light-card-hover text-slate-900' : 'bg-[#141620]/90 border-white/10 text-white'
              }`}
            >
              <div className={`text-[11px] font-bold tracking-wider uppercase ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                TOTAL HUBS
              </div>
              <div className={`text-2xl font-black font-mono transition-all duration-300 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                {liveHubsCount}
              </div>
              <div className="pt-1">
                <SparklineChart
                  dataPoints={[2000, 2008, 2012, 2018, 2011, 2014]}
                  colorTheme="emerald"
                  height={40}
                  isLive={false}
                  minBound={1990}
                  maxBound={2020}
                  volatility={2.4}
                  onLiveUpdate={handleLiveHubsUpdate}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>1 item</span>
                <span className="text-emerald-500 font-bold">+14% avg</span>
              </div>
            </div>
          </div>
        );

      case 'rsu_instructions':
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-3xl p-3.5 shadow-md flex flex-col justify-between transition-all border ${
              isLightMode ? 'clean-light-card text-slate-900' : 'bg-[#141620]/90 border-white/10 text-white'
            }`}>
              <div>
                <div className={`text-[11px] font-bold tracking-wider uppercase ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  FAT HUBS
                </div>
                <div className={`text-xl font-black font-mono mt-0.5 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                  RSU
                </div>
              </div>

              <div className="flex gap-1.5 my-2.5">
                <div className={`flex-1 text-center p-1.5 rounded-xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
                }`}>
                  <span className="text-[10px] text-cyan-500 font-mono font-bold block">01I</span>
                  <span className={`text-[8px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>14 FATs</span>
                </div>
                <div className={`flex-1 text-center p-1.5 rounded-xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
                }`}>
                  <span className="text-[10px] text-amber-500 font-mono font-bold block">08N</span>
                  <span className={`text-[8px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>12 FATs</span>
                </div>
                <div className={`flex-1 text-center p-1.5 rounded-xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
                }`}>
                  <span className="text-[10px] text-emerald-500 font-mono font-bold block">0C0</span>
                  <span className={`text-[8px] ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>10 FATs</span>
                </div>
              </div>

              <div className={`text-[10px] font-mono ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                5 RSUs in sector
              </div>
            </div>

            <div className={`rounded-3xl p-3.5 shadow-md flex flex-col justify-between transition-all border ${
              isLightMode ? 'clean-light-card text-slate-900' : 'bg-[#141620]/90 border-white/10 text-white'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className={`text-[11px] font-bold tracking-wider uppercase ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    INSTRUCTIONS
                  </div>
                  <div className={`text-2xl font-black font-mono mt-0.5 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                    1.20
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  100%
                </span>
              </div>

              <div className="flex items-center justify-between my-2 px-1">
                {['01I', '08N', '0C0', '0I5', '0CI'].map((rsu, i) => (
                  <div key={rsu} className="flex flex-col items-center gap-1">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8.5px] font-mono font-bold ${
                      i === 0
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isLightMode
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : 'bg-white/10 text-slate-300'
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`text-[8px] font-mono ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{rsu}</span>
                  </div>
                ))}
              </div>

              <div className={`text-[10px] font-mono flex items-center justify-between ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>Optical Feeder</span>
                <span className="text-emerald-500 font-bold">OK</span>
              </div>
            </div>
          </div>
        );
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    const shouldBeScrolled = top > 55;
    if (shouldBeScrolled !== internalIsScrolled) {
      setInternalIsScrolled(shouldBeScrolled);
      if (onScrollChange) {
        onScrollChange(shouldBeScrolled);
      }
    }
  };

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className={`flex flex-col h-full overflow-y-auto pb-6 select-none transition-colors duration-200 ${
        isLightMode
          ? 'bg-[#f8fafc] text-slate-900'
          : 'bg-transparent text-slate-100'
      }`}
    >
      <div className="px-4 sm:px-6 pt-2 pb-28 space-y-4 max-w-4xl mx-auto w-full">


        {/* =========================================================================
            PROMINENT SEARCH BOX ON HOME SCREEN WITH SCROLL ANIMATION
            - When scrolling DOWN: Smoothly animates into compact Search Icon after Settings button in top header!
            - When scrolling UP: Returns smoothly into full Search Box model with fluid spring animation!
            ========================================================================= */}
        <div className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform origin-top ${
          effectiveIsScrolled
            ? 'opacity-0 -translate-y-4 scale-95 pointer-events-none max-h-0 overflow-hidden my-0 p-0 border-0'
            : 'opacity-100 translate-y-0 scale-100 max-h-none overflow-visible mb-2'
        }`}>
          <div className={`rounded-2xl transition-all duration-300 border shadow-md overflow-hidden ${
            isLightMode 
              ? 'bg-white border-slate-200 shadow-slate-900/5' 
              : 'bg-[#131522] border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.6)]'
          }`}>
            {/* Main Search Input Bar */}
            <div 
              onClick={() => {
                setIsHomeSearchExpanded(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isHomeSearchExpanded
                    ? isLightMode ? 'bg-blue-600 text-white' : 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                    : isLightMode ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-cyan-400'
                }`}>
                  <Search className="w-4 h-4" />
                </div>

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    if (onSearchChange) onSearchChange(e.target.value);
                    setIsHomeSearchExpanded(true);
                  }}
                  onFocus={() => setIsHomeSearchExpanded(true)}
                  placeholder="Search FAT ID, HUB, RSU or locality (e.g. 01I, Cochin)..."
                  className={`w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none min-w-0 ${
                    isLightMode
                      ? 'text-slate-900 placeholder-slate-400'
                      : 'text-white placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {searchQuery && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSearchChange) onSearchChange('');
                      searchInputRef.current?.focus();
                    }}
                    className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                      isLightMode ? 'text-slate-400 hover:text-slate-800' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHomeSearchExpanded(!isHomeSearchExpanded);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10.5px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all border ${
                    isHomeSearchExpanded
                      ? isLightMode
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                      : isLightMode
                      ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      : 'bg-white/10 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{isHomeSearchExpanded ? 'Collapse' : 'Expand'}</span>
                </button>
              </div>
            </div>

            {/* EXPANDED CONTENT: Filter Chips & Matching Results Dropdown IN-FLOW */}
            {(isHomeSearchExpanded || searchQuery.trim().length > 0) && (
              <div className={`px-3.5 pb-3.5 pt-1 space-y-3 border-t animate-in fade-in duration-150 ${
                isLightMode ? 'border-slate-100 bg-slate-50/50' : 'border-white/10 bg-black/20'
              }`}>
                {/* Filter Chips & Count Header */}
                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(['ALL', 'FAT', 'HUB', 'RSU'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSearchFilterType(filter)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all ${
                          searchFilterType === filter
                            ? isLightMode
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                            : isLightMode
                            ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                            : 'bg-white/10 border border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                    <span className="text-[10px] font-mono text-slate-400 ml-1">
                      ({matchingFats.length} {matchingFats.length === 1 ? 'node' : 'nodes'})
                    </span>
                  </div>

                  <button
                    onClick={onOpenFatTerminals}
                    className="text-[10.5px] font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Full Directory</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Matching Nodes Grid or Empty State */}
                {matchingFats.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-72 overflow-y-auto no-scrollbar">
                    {matchingFats.map((fat) => (
                      <div
                        key={fat.id}
                        onClick={() => onSelectFat(fat)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${
                          isLightMode
                            ? 'bg-white hover:bg-blue-50/70 border-slate-200 text-slate-900 shadow-xs'
                            : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-black text-blue-600 dark:text-cyan-300">
                              FAT {fat.fatId}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                              {fat.ponPort}
                            </span>
                          </div>
                          <div className="text-[11px] truncate mt-0.5 text-slate-600 dark:text-slate-300">
                            {fat.neAddress} · {fat.locality}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {onNavigateToFat && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToFat(fat);
                              }}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                isLightMode
                                  ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                                  : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60'
                              }`}
                              title="Navigate to FAT"
                            >
                              <Navigation className="w-3 h-3" />
                            </button>
                          )}
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            HUB {fat.hub}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-xl border border-dashed border-white/10 my-1">
                    <p className="text-xs text-slate-400 font-medium">
                      No matching telecom nodes found for &ldquo;<span className="text-cyan-400 font-bold">{searchQuery}</span>&rdquo;
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Try searching with FAT ID, PON port, RSU, HUB code or locality
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CUSTOMIZATION BANNER (Visible in Edit Mode) */}
        {isCustomizing && (
          <div className="p-3 rounded-2xl border border-amber-500/50 bg-amber-500/10 backdrop-blur-2xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-amber-600">
                  Customizing Home Dashboard
                </div>
                <div className={`text-[11px] truncate ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                  Press, hold &amp; drag cards or use ▲ / ▼ to rearrange
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleResetLayout}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
                  isLightMode
                    ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-white/10 border-white/15 text-slate-200 hover:text-white'
                }`}
                title="Reset to default card order"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                onClick={() => setIsCustomizing(false)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer transition-all shadow-md active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Done</span>
              </button>
            </div>
          </div>
        )}

        {/* REARRANGE DASHBOARD TRIGGER BAR (When not customizing) */}
        {!isCustomizing && (
          <div className="flex items-center justify-between px-1 pt-1 pb-0.5">
            <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
              isLightMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Dashboard Modules ({cardOrder.length})
            </span>
            <button
              onClick={() => setIsCustomizing(true)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border active:scale-95 ${
                isLightMode
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
                  : 'bg-white/10 border-white/15 text-slate-200 hover:text-white hover:bg-white/15 shadow-sm'
              }`}
              title="Customize and Rearrange Dashboard Items"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Rearrange Layout</span>
            </button>
          </div>
        )}

        {/* REARRANGEABLE HOME DASHBOARD CARDS */}
        <div className="space-y-4">
          {cardOrder.map((cardKey, index) => {
            const isDragging = draggedCardId === cardKey;
            const isDragOver = dragOverCardId === cardKey;

            return (
              <div
                key={cardKey}
                draggable={isCustomizing}
                onDragStart={(e) => handleDragStart(e, cardKey)}
                onDragOver={(e) => handleDragOver(e, cardKey)}
                onDrop={(e) => handleDrop(e, cardKey)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => startPressTimer(cardKey, e)}
                onTouchMove={(e) => cancelPressTimer(e)}
                onTouchEnd={clearTimerOnRelease}
                onMouseDown={(e) => startPressTimer(cardKey, e)}
                onMouseMove={(e) => cancelPressTimer(e)}
                onMouseUp={clearTimerOnRelease}
                className={`relative transition-all duration-300 rounded-[28px] ${
                  isCustomizing ? 'card-customize-mode' : 'animate-card-spring'
                } ${isDragging ? 'card-dragging' : ''} ${isDragOver ? 'card-drag-over' : ''}`}
                style={{
                  animationDelay: isCustomizing ? '0ms' : `${index * 40}ms`
                }}
              >
                {/* Customization Top Action Bar for each card */}
                {isCustomizing && (
                  <div className={`mb-2 px-3 py-1.5 rounded-2xl border backdrop-blur-xl flex items-center justify-between shadow-sm text-xs font-mono ${
                    isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-white/10'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="cursor-grab active:cursor-grabbing p-1 rounded-lg bg-amber-500/10 text-amber-500">
                        <GripVertical className="w-4 h-4" />
                      </span>
                      <span className={`font-sans font-bold text-xs ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
                        {CARD_LABELS[cardKey]}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveCard(index, 'up')}
                        disabled={index === 0}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          index === 0
                            ? 'opacity-30 cursor-not-allowed text-slate-400'
                            : isLightMode
                            ? 'hover:bg-slate-100 text-slate-700'
                            : 'hover:bg-white/10 text-slate-200'
                        }`}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveCard(index, 'down')}
                        disabled={index === cardOrder.length - 1}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          index === cardOrder.length - 1
                            ? 'opacity-30 cursor-not-allowed text-slate-400'
                            : isLightMode
                            ? 'hover:bg-slate-100 text-slate-700'
                            : 'hover:bg-white/10 text-slate-200'
                        }`}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                )}

                {renderCardContent(cardKey)}
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            FIELD ENGINEER TERMINAL SESSION & LOG OUT CARD (UNDER HOME CARDS)
            Placed directly below the home cards - high contrast, prominent, zero obstruction
            ========================================================================= */}
        <div className={`mt-6 mb-8 rounded-[28px] p-4 sm:p-5 border shadow-2xl relative overflow-hidden transition-all duration-300 ${
          isLightMode
            ? 'bg-white border-slate-200/80 text-slate-800 shadow-slate-900/5'
            : 'bg-gradient-to-r from-[#121524] via-[#0f121d] to-[#0a0d16] border-white/10 text-white shadow-2xl'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-md ${
                isLightMode 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
              }`}>
                <User className="w-6 h-6" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20 shrink-0" />
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                    isLightMode ? 'text-emerald-700' : 'text-emerald-400'
                  }`}>
                    Active Field Session
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold truncate mt-0.5">
                  {currentUser?.technicianName || 'Sonu S Pushpan'}
                </h4>
                <p className={`text-[11px] font-mono truncate ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  ID: {currentUser?.technicianId || 'EMP001'} · {currentUser?.role || 'Field Telecom Engineer'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer active:scale-95 ${
                    isLightMode
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                  }`}
                  title="Configure Network & App"
                >
                  Settings
                </button>
              )}

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-mono font-black bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-600 dark:text-red-400 flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
                title="Log Out of Terminal"
              >
                <LogOut className="w-4 h-4 stroke-[2.5]" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* LOGOUT CONFIRMATION MODAL UNDER HOME CARDS */}
        {showLogoutConfirm && typeof document !== 'undefined' && createPortal(
          <div 
            className="fixed inset-0 z-[999999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setShowLogoutConfirm(false);
            }}
          >
            <div 
              className={`w-full max-w-xs p-5 rounded-3xl border shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-150 relative z-10 ${
                isLightMode
                  ? 'bg-white border-slate-200 text-slate-900 shadow-2xl'
                  : 'bg-[#0f1322] border-white/15 text-white shadow-[0_20px_60px_rgba(0,0,0,0.85)]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-red-500/15 border border-red-500/30 text-red-400">
                <LogOut className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold tracking-tight">
                  Sign Out of Terminal?
                </h3>
                <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Are you sure you want to log out as <b className={isLightMode ? 'text-slate-800' : 'text-slate-200'}>{currentUser?.technicianName || 'Sonu'}</b>? You will return to the technician login terminal.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs font-bold">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`py-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                    isLightMode
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                      : 'bg-white/10 hover:bg-white/15 border-white/10 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    if (onLogout) onLogout();
                  }}
                  className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black flex items-center justify-center gap-1.5 shadow-md shadow-red-900/40 cursor-pointer active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* ANDROID STUDIO DESKTOP WORKSPACE MODAL */}
      <AndroidStudioModal
        isOpen={isAndroidStudioModalOpen}
        onClose={() => setIsAndroidStudioModalOpen(false)}
        isLightMode={isLightMode}
      />
    </div>
  );
};

export const DashboardModelView = React.memo(DashboardModelViewComp);
