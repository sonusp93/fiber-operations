import React, { useState, useMemo, useEffect } from 'react';
import { FAT_DATASET, FAT_BY_CITY_MAP, FatRecord, calculateGpsDistanceMeters } from '../data/telecomDataset';
import { Navigation, Copy, Check, MapPin, Radio } from 'lucide-react';

interface FatDirectoryViewProps {
  onSelectFat: (fat: FatRecord) => void;
  onNavigateToFat: (fat: FatRecord) => void;
  onShowOnMap: (fat: FatRecord) => void;
  isLightMode?: boolean;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onUpdateResultsCount?: (count: number) => void;
  isNearby1KmOnly?: boolean;
  onToggleNearby1Km?: () => void;
  isActive?: boolean;
}

// City reference anchors for 1km simulation if GPS is out of range
const CITY_ANCHORS: Record<string, { lat: number; lng: number }> = {
  ALL: { lat: 10.0261, lng: 76.3125 }, // Central Cochin Fiber Corridor
  Cochin: { lat: 10.0261, lng: 76.3125 },
  Calicut: { lat: 11.3075, lng: 75.7850 },
  Thiruvananthapuram: { lat: 8.4982, lng: 76.9450 }
};

const FatDirectoryViewComp: React.FC<FatDirectoryViewProps> = ({
  onSelectFat,
  onNavigateToFat,
  onShowOnMap,
  isLightMode = false,
  searchQuery = '',
  onSearchChange,
  onUpdateResultsCount,
  isNearby1KmOnly = false,
  onToggleNearby1Km,
  isActive = true
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedCap, setSelectedCap] = useState<string>('ALL');
  const [internalQuery, setInternalQuery] = useState(searchQuery);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userGps, setUserGps] = useState<{ lat: number; lng: number } | null>(null);

  // Request browser geolocation once if granted
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Check if user is anywhere near southern India (roughly lat 8-13, lng 74-78)
          if (pos.coords.latitude >= 8 && pos.coords.latitude <= 13 && pos.coords.longitude >= 74 && pos.coords.longitude <= 78) {
            setUserGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        },
        () => {},
        { timeout: 4000 }
      );
    }
  }, []);

  useEffect(() => {
    setInternalQuery(searchQuery);
  }, [searchQuery]);

  const activeSearchQuery = searchQuery !== '' ? searchQuery : internalQuery;

  const [visibleCount, setVisibleCount] = useState(60);

  // Active reference coordinate for 1KM radius calculations
  const referenceCoords = useMemo(() => {
    if (userGps) return userGps;
    return CITY_ANCHORS[selectedCity] || CITY_ANCHORS.ALL;
  }, [userGps, selectedCity]);

  // Ultra-fast active-gated candidate search & distance calculation (0ms lag)
  const filteredFats = useMemo(() => {
    if (!isActive) return [];

    let dataset = FAT_DATASET;
    if (selectedCity !== 'ALL') {
      dataset = FAT_BY_CITY_MAP.get(selectedCity.toLowerCase()) || FAT_DATASET;
    }

    if (selectedCap !== 'ALL') {
      const capNum = parseInt(selectedCap, 10);
      dataset = dataset.filter((f) => f.totalCap === capNum);
    }

    const q = activeSearchQuery.toLowerCase().trim();
    if (q !== '') {
      const matches: FatRecord[] = [];
      for (let i = 0; i < dataset.length; i++) {
        const f = dataset[i];
        if (
          f.fatId.toLowerCase().includes(q) ||
          f.ponPort.toLowerCase().includes(q) ||
          f.neAddress.toLowerCase().includes(q) ||
          f.locality.toLowerCase().includes(q) ||
          f.city.toLowerCase().includes(q) ||
          f.hub.toLowerCase().includes(q) ||
          f.rsu.toLowerCase().includes(q)
        ) {
          matches.push(f);
          if (matches.length >= 300) break;
        }
      }
      dataset = matches;
    }

    // Nearby 1km filter: use fast lat/lng bounding box first
    if (isNearby1KmOnly) {
      const latDelta = 0.015; // ~1.5km
      const lngDelta = 0.015;
      dataset = dataset.filter(
        (f) =>
          Math.abs(f.fatLat - referenceCoords.lat) <= latDelta &&
          Math.abs(f.fatLog - referenceCoords.lng) <= lngDelta
      );
    }

    // Limit distance calculation candidates to top 150 items for 120 FPS
    const candidates = dataset.slice(0, 150);

    const withDist = candidates.map((f) => {
      const distMeters = calculateGpsDistanceMeters(
        referenceCoords.lat,
        referenceCoords.lng,
        f.fatLat,
        f.fatLog
      );
      return {
        ...f,
        distanceMeters: distMeters,
        distanceKm: (distMeters / 1000).toFixed(2)
      };
    });

    if (isNearby1KmOnly) {
      withDist.sort((a, b) => a.distanceMeters - b.distanceMeters);
    }

    return withDist;
  }, [isActive, referenceCoords, selectedCity, selectedCap, activeSearchQuery, isNearby1KmOnly]);

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(60);
  }, [activeSearchQuery, selectedCity, selectedCap, isNearby1KmOnly]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdateResultsCount?.(filteredFats.length);
    }, 0);
    return () => clearTimeout(timer);
  }, [filteredFats.length, onUpdateResultsCount]);

  const handleCopyGps = (fat: FatRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${fat.fatLat}, ${fat.fatLog}`);
    setCopiedId(fat.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden select-none transition-colors duration-200 ${
      isLightMode
        ? 'bg-[#f8fafc] text-slate-900'
        : 'bg-black text-slate-100'
    }`}>
      {/* 2ND ROW: Compact City & 1KM Nearby Filter Bar - NO BLACK BORDERS */}
      <div className="flex-shrink-0 z-20 px-3 pt-1 pb-2 max-w-4xl lg:max-w-5xl mx-auto w-full">
        <div className={`rounded-2xl p-1.5 border backdrop-blur-3xl shadow-sm flex items-center justify-between gap-1 overflow-x-auto no-scrollbar ${
          isLightMode
            ? 'bg-white border-slate-200 text-slate-900'
            : 'liquid-glass-pill border-white/10 text-white'
        }`}>
          {/* Cities horizontal pills */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
            {['ALL', 'Cochin', 'Calicut', 'Thiruvananthapuram'].map((c) => {
              const isSelected = selectedCity === c;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold shrink-0 transition-all duration-200 cursor-pointer active:scale-90 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold shadow-sm scale-[1.02]'
                      : isLightMode
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {c === 'ALL' ? 'All Cities' : c}
                </button>
              );
            })}
          </div>

          {/* 1KM Nearby Quick Toggle Pill & Capacity Filter */}
          <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-slate-200/80">
            {onToggleNearby1Km && (
              <button
                onClick={onToggleNearby1Km}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold font-mono flex items-center gap-1 cursor-pointer transition-all active:scale-95 border ${
                  isNearby1KmOnly
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                    : isLightMode
                    ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    : 'bg-white/10 border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Toggle 1KM nearby radius filter"
              >
                <Radio className={`w-3 h-3 ${isNearby1KmOnly ? 'animate-pulse text-white' : 'text-slate-400'}`} />
                <span>1KM: {isNearby1KmOnly ? 'ON' : 'OFF'}</span>
              </button>
            )}

            {/* Capacity filter */}
            {['ALL', '16', '32'].map((cap) => (
              <button
                key={cap}
                onClick={() => setSelectedCap(cap)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                  selectedCap === cap
                    ? 'bg-slate-900 text-white shadow-sm border-slate-900'
                    : isLightMode
                    ? 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200'
                    : 'text-slate-400 hover:text-white bg-white/5 border-white/10'
                }`}
                title={`Filter Capacity: ${cap}`}
              >
                {cap === 'ALL' ? 'Cap' : `${cap}P`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3RD ROW: SCROLLING FAT CARDS LIST */}
      <div className="flex-1 overflow-y-auto px-3 pb-28 pt-1">
        <div className="max-w-4xl lg:max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredFats.slice(0, visibleCount).map((fat, idx) => (
          <div
            key={fat.id}
            onClick={() => onSelectFat(fat)}
            style={{ animationDelay: `${Math.min(idx * 30, 240)}ms` }}
            className={`p-3.5 rounded-[22px] transition-all duration-300 shadow-md space-y-2.5 cursor-pointer group animate-card-spring border ${
              isLightMode
                ? 'clean-light-card clean-light-card-hover text-slate-900'
                : 'liquid-glass-card liquid-glass-card-hover text-slate-100'
            }`}
          >
            {/* Header: FAT ID & PON Port with 3D colorful badges */}
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* 3D Blue FAT ID badge */}
                  <span className="text-xs font-mono font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-0.5 rounded-lg shadow-sm">
                    FAT {fat.fatId}
                  </span>

                  {/* 3D Green PON badge */}
                  <span className="text-xs font-mono font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 px-2 py-0.5 rounded-lg shadow-sm">
                    {fat.ponPort}
                  </span>

                  {/* 1KM Nearby distance badge if nearby mode or close */}
                  {(isNearby1KmOnly || fat.distanceMeters <= 1200) && (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                      isLightMode
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                    }`}>
                      <MapPin className="w-2.5 h-2.5 text-amber-500" />
                      <span>{fat.distanceKm} km</span>
                    </span>
                  )}
                </div>

                <div className={`text-xs font-bold mt-1.5 truncate ${
                  isLightMode ? 'text-slate-900' : 'text-slate-100'
                }`}>
                  {fat.neAddress}
                </div>

                <div className={`text-[11px] mt-0.5 ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {fat.locality} · {fat.city}
                </div>
              </div>

              {/* Port Count & RFS */}
              <div className="text-right shrink-0">
                <span className={`text-xs font-mono font-black ${
                  isLightMode ? 'text-slate-900' : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                }`}>
                  {fat.totalCap} Ports
                </span>
                <div className={`text-[10px] font-mono mt-0.5 ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  RFS: {fat.rfsDate}
                </div>
              </div>
            </div>

            {/* Backhaul Hierarchy Badges */}
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className={`px-2 py-0.5 rounded-md font-bold border ${
                isLightMode
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-purple-950/60 text-purple-300 border-purple-800/40'
              }`}>
                HUB {fat.hub}
              </span>
              <span className={`px-2 py-0.5 rounded-md font-bold border ${
                isLightMode
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
              }`}>
                RSU {fat.rsu}
              </span>
              <span className={`truncate ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {fat.affiliatedPon}
              </span>
            </div>

            {/* Actions: Navigation & GPS Copy - NO BLACK BORDER */}
            <div className={`flex items-center justify-between pt-1.5 border-t ${
              isLightMode ? 'border-slate-200/90' : 'border-white/10'
            }`}>
              <button
                onClick={(e) => handleCopyGps(fat, e)}
                className={`text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-colors ${
                  isLightMode
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Copy Coordinates"
              >
                {copiedId === fat.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                    <span className="text-emerald-600 font-extrabold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{fat.fatLat.toFixed(4)}, {fat.fatLog.toFixed(4)}</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToFat(fat);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-xs text-white cursor-pointer active:scale-95 transition-all shadow-md shadow-blue-500/25"
                >
                  <Navigation className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Live Navigate</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>

        {filteredFats.length > visibleCount && (
          <div className="mt-4 flex justify-center pb-8">
            <button
              onClick={() => setVisibleCount((prev) => prev + 100)}
              className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Load More FAT Terminals ({filteredFats.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const FatDirectoryView = React.memo(FatDirectoryViewComp);
