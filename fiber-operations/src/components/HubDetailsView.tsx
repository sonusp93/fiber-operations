import React, { useState, useMemo, useEffect } from 'react';
import { FatRecord, HUB_DATASET, FAT_BY_HUB_MAP, calculateGpsDistanceMeters } from '../data/telecomDataset';
import { Network, ChevronDown, ChevronRight, Navigation, Copy, Check, Radio, MapPin } from 'lucide-react';

interface HubDetailsViewProps {
  onSelectFat: (fat: FatRecord) => void;
  onNavigateToFat: (fat: FatRecord) => void;
  onNavigateToHub: (hub: { hub: string; rsu: string; city: string; lat: number; lng: number; locality: string }) => void;
  isLightMode?: boolean;
  searchQuery?: string;
  onUpdateResultsCount?: (count: number) => void;
  isNearby1KmOnly?: boolean;
  onToggleNearby1Km?: () => void;
  isActive?: boolean;
}

// Reference anchor coordinates for 1km calculations
const CITY_ANCHORS: Record<string, { lat: number; lng: number }> = {
  ALL: { lat: 10.0261, lng: 76.3125 },
  Cochin: { lat: 10.0261, lng: 76.3125 },
  Calicut: { lat: 11.3075, lng: 75.7850 },
  Thiruvananthapuram: { lat: 8.4982, lng: 76.9450 }
};

const HubDetailsViewComp: React.FC<HubDetailsViewProps> = ({
  onSelectFat,
  onNavigateToFat,
  onNavigateToHub,
  isLightMode = false,
  searchQuery = '',
  onUpdateResultsCount,
  isNearby1KmOnly = false,
  onToggleNearby1Km,
  isActive = true
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  // Collapsed by default as requested (opens only when user clicks dropdown button)
  const [expandedHubId, setExpandedHubId] = useState<string | null>(null);
  const [copiedGps, setCopiedGps] = useState<string | null>(null);

  // Reference coordinates for distance
  const refCoords = useMemo(() => {
    return CITY_ANCHORS[selectedCity] || CITY_ANCHORS.ALL;
  }, [selectedCity]);

  // Fast active-gated HUB list computation (0ms lag)
  const hubList = useMemo(() => {
    if (!isActive) return [];

    const q = searchQuery.toLowerCase().trim();
    const result: {
      hub: string;
      rsu: string;
      city: string;
      lat: number;
      lng: number;
      locality: string;
      fats: FatRecord[];
      totalCapacity: number;
      distanceMeters: number;
      distanceKm: string;
    }[] = [];

    for (let i = 0; i < HUB_DATASET.length; i++) {
      const h = HUB_DATASET[i];
      if (selectedCity !== 'ALL' && h.city.toLowerCase() !== selectedCity.toLowerCase()) {
        continue;
      }

      const matchSearch =
        !q ||
        h.hub.toLowerCase().includes(q) ||
        h.rsu.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.locality.toLowerCase().includes(q);

      if (matchSearch) {
        const dist = calculateGpsDistanceMeters(refCoords.lat, refCoords.lng, h.lat, h.lng);
        result.push({
          hub: h.hub,
          rsu: h.rsu,
          city: h.city,
          lat: h.lat,
          lng: h.lng,
          locality: h.locality,
          fats: h.fats,
          totalCapacity: h.totalCapacity,
          distanceMeters: dist,
          distanceKm: (dist / 1000).toFixed(2)
        });
        if (result.length >= 80) break;
      }
    }

    return result.sort((a, b) => b.fatCount - a.fatCount);
  }, [isActive, searchQuery, selectedCity, refCoords]);

  const filteredHubs = useMemo(() => {
    let list = hubList;

    // 1KM Nearby filter
    if (isNearby1KmOnly) {
      const nearbyCount = list.filter((x) => x.distanceMeters <= 1000).length;
      list = list.filter((h) => h.distanceMeters <= 1000 || (nearbyCount < 2 && h.distanceMeters <= 1800));
      list.sort((a, b) => a.distanceMeters - b.distanceMeters);
    }

    return list;
  }, [hubList, selectedCity, isNearby1KmOnly]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdateResultsCount?.(filteredHubs.length);
    }, 0);
    return () => clearTimeout(timer);
  }, [filteredHubs.length, onUpdateResultsCount]);

  const handleCopy = (hub: string, lat: number, lng: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopiedGps(hub);
    setTimeout(() => setCopiedGps(null), 1800);
  };

  const toggleExpand = (hubId: string) => {
    setExpandedHubId(expandedHubId === hubId ? null : hubId);
  };

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden select-none transition-colors duration-200 ${
      isLightMode
        ? 'bg-[#f8fafc] text-slate-900'
        : 'bg-transparent text-slate-100'
    }`}>
      {/* 2ND ROW: Compact City & 1KM Filter Bar - NO BLACK BORDERS */}
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
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold shadow-sm scale-[1.02]'
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

          <div className="flex items-center gap-1.5 shrink-0 ml-auto pl-1 border-l border-slate-200/80">
            {/* 1KM Nearby Toggle */}
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

            <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
              isLightMode
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-purple-950/70 text-purple-300 border-purple-800/40'
            }`}>
              {filteredHubs.length} HUBs
            </span>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CARDS CONTAINER: Central Hubs Directory */}
      <div className="flex-1 overflow-y-auto w-full px-3 pt-1 pb-28 space-y-3 max-w-4xl lg:max-w-5xl mx-auto">
        {filteredHubs.map((hub, idx) => {
          const isExpanded = expandedHubId === hub.hub;

          return (
            <div
              key={hub.hub}
              style={{ animationDelay: `${Math.min(idx * 35, 250)}ms` }}
              className={`rounded-[22px] border overflow-hidden shadow-md transition-all duration-300 animate-card-spring ${
                isLightMode
                  ? 'clean-light-card clean-light-card-hover text-slate-900'
                  : 'liquid-glass-card liquid-glass-card-hover text-slate-100'
              }`}
            >
              {/* HUB Header with 3D colorful icon badge */}
              <div
                onClick={() => toggleExpand(hub.hub)}
                className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                  isLightMode ? 'hover:bg-slate-50' : 'hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* 3D Colorful HUB icon badge */}
                  <div className="icon-3d-box icon-3d-hub w-10 h-10 shrink-0 text-white shadow-md">
                    <Network className="w-5 h-5 stroke-[2.4]" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className={`text-sm font-extrabold font-mono ${
                        isLightMode ? 'text-slate-900' : 'text-white'
                      }`}>
                        HUB {hub.hub}
                      </h2>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border ${
                        isLightMode
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-white/10 text-emerald-400 border-white/10'
                      }`}>
                        RSU {hub.rsu}
                      </span>

                      {/* 1KM Nearby Distance Badge */}
                      {(isNearby1KmOnly || hub.distanceMeters <= 1200) && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                          isLightMode
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                        }`}>
                          <MapPin className="w-2.5 h-2.5 text-amber-500" />
                          <span>{hub.distanceKm} km</span>
                        </span>
                      )}
                    </div>
                    <div className={`text-xs mt-0.5 font-medium ${
                      isLightMode ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {hub.locality} · {hub.city}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-500 block">
                      {hub.fats.length} FATs
                    </span>
                    <span className={`text-[10px] font-mono block ${
                      isLightMode ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {hub.totalCapacity} Ports
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className={`w-4 h-4 ${isLightMode ? 'text-slate-600' : 'text-neutral-300'}`} />
                  ) : (
                    <ChevronRight className={`w-4 h-4 ${isLightMode ? 'text-slate-400' : 'text-neutral-500'}`} />
                  )}
                </div>
              </div>

              {/* Specifications Sub-Bar with DIRECT NAVIGATE TO HUB BUTTON */}
              <div className={`px-3.5 py-2 border-t flex items-center justify-between text-xs font-mono ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-[#12141c] border-white/10'
              }`}>
                <button
                  onClick={(e) => handleCopy(hub.hub, hub.lat, hub.lng, e)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Copy HUB Coordinates"
                >
                  {copiedGps === hub.hub ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                      <span className="text-emerald-600 font-bold">GPS Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{hub.lat.toFixed(4)}, {hub.lng.toFixed(4)}</span>
                    </>
                  )}
                </button>

                {/* DEDICATED HUB NAVIGATION BUTTON - 3D PURPLE GRADIENT */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToHub(hub);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-purple-500/25 transition-all active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Navigate to HUB</span>
                </button>
              </div>

              {/* EXPANDED DETAILS: Connected FAT Boxes */}
              {isExpanded && (
                <div className={`p-3 border-t space-y-2 animate-in fade-in duration-150 ${
                  isLightMode ? 'bg-slate-100/70 border-slate-200' : 'bg-[#141620] border-white/10'
                }`}>
                  <div className={`text-[10px] font-mono uppercase tracking-wider font-bold px-1 ${
                    isLightMode ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Connected Optical FAT Boxes ({hub.fats.length})
                  </div>

                  <div className="space-y-1.5">
                    {hub.fats.slice(0, 50).map((fat) => (
                      <div
                        key={fat.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all duration-150 ${
                          isLightMode
                            ? 'bg-white border-slate-200 hover:border-slate-300'
                            : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
                        }`}
                      >
                        <div
                          onClick={() => onSelectFat(fat)}
                          className="cursor-pointer min-w-0 flex-1 pr-2"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold bg-blue-600 text-white px-2 py-0.5 rounded-md shadow-sm">
                              FAT {fat.fatId}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-500 font-bold">
                              {fat.ponPort}
                            </span>
                          </div>
                          <div className={`text-xs mt-1 truncate font-medium ${
                            isLightMode ? 'text-slate-800' : 'text-slate-200'
                          }`}>
                            {fat.neAddress}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-mono ${
                            isLightMode ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {fat.totalCap}P
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToFat(fat);
                            }}
                            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-90 transition-all shadow-sm"
                            title="Direct Navigation"
                          >
                            <Navigation className="w-3 h-3 fill-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {hub.fats.length > 50 && (
                      <div className={`text-center text-xs font-mono py-1 ${
                        isLightMode ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        Showing 50 of {hub.fats.length} FATs connected to HUB {hub.hub}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const HubDetailsView = React.memo(HubDetailsViewComp);
