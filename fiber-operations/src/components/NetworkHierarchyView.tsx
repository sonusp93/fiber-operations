import React, { useState, useMemo, useEffect } from 'react';
import { FatRecord, RSU_DATASET, HUB_DATASET, FAT_BY_HUB_MAP } from '../data/telecomDataset';
import { ChevronDown, ChevronRight, Navigation, Copy, Check, Box, Briefcase } from 'lucide-react';

interface NetworkHierarchyViewProps {
  onSelectFat: (fat: FatRecord) => void;
  onNavigateToFat: (fat: FatRecord) => void;
  onNavigateToRsu: (rsu: { rsu: string; city: string; lat: number; lng: number }) => void;
  onNavigateToHub: (hub: { hub: string; rsu: string; city: string; lat: number; lng: number; locality: string }) => void;
  isLightMode?: boolean;
  searchQuery?: string;
  onUpdateResultsCount?: (count: number) => void;
  isActive?: boolean;
}

const NetworkHierarchyViewComp: React.FC<NetworkHierarchyViewProps> = ({
  onSelectFat,
  onNavigateToFat,
  onNavigateToRsu,
  onNavigateToHub,
  isLightMode = false,
  searchQuery = '',
  onUpdateResultsCount,
  isActive = true
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  // Collapsed by default as requested (opens only when user clicks dropdown button)
  const [expandedRsus, setExpandedRsus] = useState<Record<string, boolean>>({});
  const [expandedHubs, setExpandedHubs] = useState<Record<string, boolean>>({});
  const [copiedGps, setCopiedGps] = useState<string | null>(null);

  // Ultra-fast active-gated hierarchy computation (0ms lag)
  const hierarchy = useMemo(() => {
    if (!isActive) return [];

    const q = searchQuery.toLowerCase().trim();
    let list = RSU_DATASET;

    if (selectedCity !== 'ALL') {
      const cityLower = selectedCity.toLowerCase();
      list = list.filter((r) => r.city.toLowerCase() === cityLower);
    }

    if (q) {
      list = list.filter((r) => {
        if (r.rsu.toLowerCase().includes(q) || r.city.toLowerCase().includes(q)) return true;
        return r.hubsList.some(
          (h) =>
            h.hub.toLowerCase().includes(q) ||
            h.locality.toLowerCase().includes(q)
        );
      });
    }

    return list.slice(0, 40).map((r) => ({
      rsu: r.rsu,
      city: r.city,
      lat: r.lat,
      lng: r.lng,
      totalCapacity: r.totalCapacity,
      hubList: r.hubsList
    }));
  }, [isActive, searchQuery, selectedCity]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onUpdateResultsCount?.(hierarchy.length);
    }, 0);
    return () => clearTimeout(timer);
  }, [hierarchy.length, onUpdateResultsCount]);

  const toggleRsu = (rsu: string) => {
    setExpandedRsus((prev) => ({ ...prev, [rsu]: !prev[rsu] }));
  };

  const toggleHub = (hub: string) => {
    setExpandedHubs((prev) => ({ ...prev, [hub]: !prev[hub] }));
  };

  const handleCopy = (id: string, lat: number, lng: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    setCopiedGps(id);
    setTimeout(() => setCopiedGps(null), 1800);
  };

  return (
    <div className={`flex flex-col h-full w-full overflow-hidden select-none transition-colors duration-200 ${
      isLightMode
        ? 'bg-[#f8fafc] text-slate-900'
        : 'bg-transparent text-slate-100'
    }`}>
      {/* 2ND ROW: Compact City Filter Bar - NO BLACK BORDERS */}
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
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold shadow-sm scale-[1.02]'
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

          <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border shrink-0 ml-auto ${
            isLightMode
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/40'
          }`}>
            {hierarchy.length} RSUs
          </span>
        </div>
      </div>

      {/* SCROLLABLE CARDS CONTAINER: RSU Hierarchy Cards */}
      <div className="flex-1 overflow-y-auto w-full px-3 pt-1 pb-28 space-y-3 max-w-4xl lg:max-w-5xl mx-auto">
        {hierarchy.map((rsu, idx) => {
          const isRsuOpen = !!expandedRsus[rsu.rsu];
          const totalFats = rsu.hubList.reduce((acc, h) => acc + h.fats.length, 0);

          return (
            <div
              key={rsu.rsu}
              style={{ animationDelay: `${Math.min(idx * 35, 250)}ms` }}
              className={`rounded-[22px] border overflow-hidden shadow-md transition-all duration-300 animate-card-spring ${
                isLightMode
                  ? 'clean-light-card clean-light-card-hover text-slate-900'
                  : 'liquid-glass-card liquid-glass-card-hover text-slate-100'
              }`}
            >
              {/* RSU Header Row with 3D colorful icon badge */}
              <div
                onClick={() => toggleRsu(rsu.rsu)}
                className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                  isLightMode ? 'bg-slate-50/80 hover:bg-slate-100/80' : 'bg-white/[0.04] hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* 3D Colorful RSU icon badge */}
                  <div className="icon-3d-box icon-3d-rsu w-10 h-10 shrink-0 text-white shadow-md">
                    <Briefcase className="w-5 h-5 stroke-[2.4]" />
                  </div>

                  <div>
                    <h2 className={`text-sm font-extrabold flex items-center gap-2 ${
                      isLightMode ? 'text-slate-900' : 'text-white'
                    }`}>
                      RSU {rsu.rsu} ({rsu.city})
                    </h2>
                    <span className={`text-[11px] font-mono ${
                      isLightMode ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      GPS: {rsu.lat.toFixed(5)}, {rsu.lng.toFixed(5)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold block ${
                      isLightMode ? 'text-slate-900' : 'text-white'
                    }`}>
                      {rsu.hubList.length} HUBs · {totalFats} FATs
                    </span>
                    <span className={`text-[10px] font-mono block ${
                      isLightMode ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      {rsu.totalCapacity} Ports
                    </span>
                  </div>
                  {isRsuOpen ? (
                    <ChevronDown className={`w-4 h-4 ${isLightMode ? 'text-slate-600' : 'text-neutral-300'}`} />
                  ) : (
                    <ChevronRight className={`w-4 h-4 ${isLightMode ? 'text-slate-400' : 'text-neutral-500'}`} />
                  )}
                </div>
              </div>

              {/* RSU GPS Sub-bar with DIRECT NAVIGATE TO RSU BUTTON */}
              <div className={`px-3.5 py-2 border-t flex items-center justify-between text-xs font-mono ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-[#12141c] border-white/10'
              }`}>
                <button
                  onClick={(e) => handleCopy(`rsu-${rsu.rsu}`, rsu.lat, rsu.lng, e)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isLightMode ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {copiedGps === `rsu-${rsu.rsu}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                      <span className="text-emerald-600 font-bold">GPS Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{rsu.lat.toFixed(4)}, {rsu.lng.toFixed(4)}</span>
                    </>
                  )}
                </button>

                {/* DEDICATED RSU NAVIGATION BUTTON - 3D EMERALD GRADIENT */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToRsu(rsu);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/25 transition-all active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Navigate to RSU</span>
                </button>
              </div>

              {/* Connected HUBs under this RSU */}
              {isRsuOpen && (
                <div className={`p-3 space-y-2.5 border-t animate-in fade-in duration-150 ${
                  isLightMode ? 'bg-slate-100/60 border-slate-200' : 'bg-[#141620] border-white/10'
                }`}>
                  {rsu.hubList.map((hub) => {
                    const isHubOpen = !!expandedHubs[hub.hub];
                    return (
                      <div
                        key={hub.hub}
                        className={`rounded-xl border overflow-hidden shadow-sm ${
                          isLightMode ? 'bg-white border-slate-200' : 'bg-[#1b1e2a] border-white/10'
                        }`}
                      >
                        {/* HUB Header Row */}
                        <div
                          onClick={() => toggleHub(hub.hub)}
                          className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                            isLightMode ? 'hover:bg-slate-50' : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm" />
                            <div>
                              <span className={`text-xs font-bold font-mono block ${
                                isLightMode ? 'text-slate-900' : 'text-white'
                              }`}>
                                HUB {hub.hub}
                              </span>
                              <span className={`text-[10px] font-mono ${
                                isLightMode ? 'text-slate-500' : 'text-slate-400'
                              }`}>
                                GPS: {hub.lat.toFixed(4)}, {hub.lng.toFixed(4)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToHub({
                                  hub: hub.hub,
                                  rsu: rsu.rsu,
                                  city: rsu.city,
                                  lat: hub.lat,
                                  lng: hub.lng,
                                  locality: rsu.city
                                });
                              }}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 active:scale-95 border ${
                                isLightMode
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                                  : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                              }`}
                            >
                              <Navigation className="w-2.5 h-2.5" />
                              <span>Route HUB</span>
                            </button>

                            <span className="text-xs font-mono text-emerald-500 font-bold">
                              {hub.fats.length} FATs
                            </span>
                            {isHubOpen ? (
                              <ChevronDown className={`w-3.5 h-3.5 ${isLightMode ? 'text-slate-600' : 'text-neutral-300'}`} />
                            ) : (
                              <ChevronRight className={`w-3.5 h-3.5 ${isLightMode ? 'text-slate-400' : 'text-neutral-500'}`} />
                            )}
                          </div>
                        </div>

                        {/* FAT Boxes and PON Ports under this HUB */}
                        {isHubOpen && (
                          <div className={`divide-y border-t ${
                            isLightMode
                              ? 'bg-slate-50/70 border-slate-200 divide-slate-200'
                              : 'bg-black/20 border-white/10 divide-white/5'
                          }`}>
                            {hub.fats.slice(0, 40).map((fat) => (
                              <div
                                key={fat.id}
                                className={`p-2.5 flex items-center justify-between transition-colors ${
                                  isLightMode ? 'hover:bg-slate-100/60' : 'hover:bg-white/[0.04]'
                                }`}
                              >
                                <div
                                  className="cursor-pointer flex-1 mr-2"
                                  onClick={() => onSelectFat(fat)}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-blue-600">
                                      FAT {fat.fatId}
                                    </span>
                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                      isLightMode
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40'
                                    }`}>
                                      {fat.ponPort}
                                    </span>
                                    <span className={`text-[10px] font-mono ${
                                      isLightMode ? 'text-slate-500' : 'text-slate-400'
                                    }`}>
                                      {fat.totalCap}P
                                    </span>
                                  </div>
                                  <div className={`text-xs mt-0.5 truncate max-w-[200px] font-medium ${
                                    isLightMode ? 'text-slate-800' : 'text-slate-200'
                                  }`}>
                                    {fat.neAddress} · {fat.locality}
                                  </div>
                                  <div className={`text-[10px] font-mono ${
                                    isLightMode ? 'text-slate-400' : 'text-slate-500'
                                  }`}>
                                    GPS: {fat.fatLat.toFixed(5)}, {fat.fatLog.toFixed(5)} · RFS: {fat.rfsDate}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => onSelectFat(fat)}
                                    className={`p-1.5 rounded-lg border ${
                                      isLightMode
                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                        : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                                    }`}
                                    title="View Details"
                                  >
                                    <Box className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onNavigateToFat(fat)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs cursor-pointer shadow-sm active:scale-95"
                                  >
                                    <Navigation className="w-3 h-3 fill-white text-white" />
                                    <span>Navigate</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                            {hub.fats.length > 40 && (
                              <div className={`p-2 text-center text-xs font-mono ${
                                isLightMode ? 'text-slate-500' : 'text-slate-400'
                              }`}>
                                Showing 40 of {hub.fats.length} FATs in HUB {hub.hub}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const NetworkHierarchyView = React.memo(NetworkHierarchyViewComp);
