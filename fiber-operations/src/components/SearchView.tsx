import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search as SearchIcon,
  X,
  Navigation,
  Building2,
  Server,
  Radio,
  Network
} from 'lucide-react';
import { FatRecord, FAT_DATASET, HUB_DATASET, RSU_DATASET, getPonDataset, HubRecord, RsuRecord, PonRecord } from '../data/telecomDataset';
import { FatModelIcon, RsuModelIcon, HubModelIcon, PonPortModelIcon } from './ModelIcons';

interface SearchViewProps {
  onClose: () => void;
  onSelectFat: (fat: FatRecord) => void;
  onStartNavigation: (fat: FatRecord) => void;
  onNavigateToHub?: (hub: { hub: string; rsu: string; city: string; lat: number; lng: number; locality: string }) => void;
  onNavigateToRsu?: (rsu: { rsu: string; city: string; lat: number; lng: number }) => void;
  isLightMode?: boolean;
}

export type SearchCategoryFilter = 'ALL' | 'FAT' | 'RSU' | 'HUB' | 'PON';

export const SearchView: React.FC<SearchViewProps> = ({
  onClose,
  onSelectFat,
  onStartNavigation,
  onNavigateToHub,
  onNavigateToRsu,
  isLightMode = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<SearchCategoryFilter>('ALL');
  const [showKeyboard, setShowKeyboard] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 1. FAT Search Results (Filtered & Sorted by FAT ID)
  const fatResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (selectedFilter !== 'ALL' && selectedFilter !== 'FAT') return [];

    let list = FAT_DATASET;
    if (q) {
      list = list.filter(
        (f) =>
          f.fatId.toLowerCase().includes(q) ||
          f.id.toLowerCase().includes(q) ||
          f.neAddress.toLowerCase().includes(q) ||
          f.locality.toLowerCase().includes(q) ||
          f.city.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 40).sort((a, b) => a.fatId.localeCompare(b.fatId));
  }, [searchQuery, selectedFilter]);

  // 2. HUB Search Results (Filtered & Sorted by HUB Name)
  const hubResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (selectedFilter !== 'ALL' && selectedFilter !== 'HUB') return [];

    let list = HUB_DATASET;
    if (q) {
      list = list.filter(
        (h) =>
          h.hub.toLowerCase().includes(q) ||
          h.rsu.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.locality.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 30).sort((a, b) => a.hub.localeCompare(b.hub));
  }, [searchQuery, selectedFilter]);

  // 3. RSU Search Results (Filtered & Sorted by RSU Code)
  const rsuResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (selectedFilter !== 'ALL' && selectedFilter !== 'RSU') return [];

    let list = RSU_DATASET;
    if (q) {
      list = list.filter(
        (r) =>
          r.rsu.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 30).sort((a, b) => a.rsu.localeCompare(b.rsu));
  }, [searchQuery, selectedFilter]);

  // 4. PON PORT Search Results (Filtered & Sorted by PON Port Name)
  const ponResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (selectedFilter !== 'ALL' && selectedFilter !== 'PON') return [];

    const ponList = getPonDataset();
    let list = ponList;
    if (q) {
      list = list.filter(
        (p) =>
          p.ponPort.toLowerCase().includes(q) ||
          p.affiliatedPon.toLowerCase().includes(q) ||
          p.hub.toLowerCase().includes(q) ||
          p.rsu.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 30).sort((a, b) => a.ponPort.localeCompare(b.ponPort));
  }, [searchQuery, selectedFilter]);

  const totalMatchesCount = fatResults.length + hubResults.length + rsuResults.length + ponResults.length;

  const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  const row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  const handleKeyPress = (char: string) => {
    setSearchQuery((prev) => prev + char);
  };

  const handleBackspace = () => {
    setSearchQuery((prev) => prev.slice(0, -1));
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-black/80 backdrop-blur-2xl text-neutral-100 select-none animate-in fade-in duration-200 p-2 sm:p-4 overflow-hidden"
    >
      <div className="w-full max-w-lg h-full flex flex-col rounded-[28px] border border-white/15 bg-[#0e121e] shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* 1. TOP SEARCH BAR */}
        <div className="px-3.5 pt-3 pb-2.5 bg-[#121622]/95 border-b border-black backdrop-blur-2xl">
          <div className="flex items-center gap-2.5 max-w-md mx-auto w-full">
            <div className="flex-1 relative flex items-center">
              <div className="w-full h-11 rounded-full bg-[rgba(18,18,24,0.95)] border border-black flex items-center px-3.5 gap-2.5 shadow-[0_16px_45px_rgba(0,0,0,0.95)] backdrop-blur-3xl transition-all">
                <SearchIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search FAT, HUB, RSU, PON Port..."
                  className="w-full bg-transparent text-sm text-white placeholder-[#8ca0b8] focus:outline-none"
                />

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Clear text"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-cyan-400 hover:text-cyan-300 font-bold text-sm px-2 py-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
            >
              Cancel
            </button>
          </div>

          {/* 2. CATEGORY FILTER TABS: ALL | FAT | HUB | RSU | PON PORT */}
          <div className="flex items-center gap-1.5 mt-2.5 max-w-md mx-auto w-full overflow-x-auto pb-0.5 no-scrollbar">
            {(
              [
                { id: 'ALL', label: 'All Categories' },
                { id: 'FAT', label: 'FAT Terminals' },
                { id: 'HUB', label: 'Central HUB' },
                { id: 'RSU', label: 'RSU Exchange' },
                { id: 'PON', label: 'PON Ports' }
              ] as const
            ).map((tab) => {
              const isTabActive = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 shrink-0 ${
                    isTabActive
                      ? 'bg-cyan-400 text-slate-950 font-black shadow-[0_2px_12px_rgba(6,182,212,0.4)]'
                      : 'bg-[#1a2030] text-neutral-300 hover:text-white border border-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. CATEGORY SPECIFIC SEARCH RESULTS LIST */}
        <div className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-3 max-w-md mx-auto w-full no-scrollbar">
          <div className="flex items-center justify-between text-xs font-mono px-1 py-0.5 border-b border-white/10 pb-1">
            <span className="text-cyan-400 font-extrabold uppercase">
              {selectedFilter === 'ALL' ? 'Search Matches' : `${selectedFilter} Results`} ({totalMatchesCount})
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                Clear Query
              </button>
            )}
          </div>

          {/* A. FAT TERMINAL RESULTS */}
          {fatResults.length > 0 && (
            <div className="space-y-2">
              {selectedFilter === 'ALL' && (
                <div className="text-[11px] font-mono font-extrabold text-cyan-400 uppercase tracking-wider">
                  FAT Terminals ({fatResults.length})
                </div>
              )}
              {fatResults.map((fat) => (
                <div
                  key={fat.id}
                  onClick={() => {
                    onClose();
                    onSelectFat(fat);
                  }}
                  className="p-3 rounded-2xl bg-[#141824] hover:bg-[#1a2336] border border-white/10 hover:border-cyan-500/40 shadow-md flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-98 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1a2335] to-[#121926] border border-white/10 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                      <FatModelIcon className="w-5 h-5 text-cyan-300" />
                    </div>

                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                          FAT {fat.fatId}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                          {fat.ponPort}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-300 truncate max-w-[210px] mt-0.5">
                        {fat.neAddress}
                      </div>

                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        HUB {fat.hub} · RSU {fat.rsu} · {fat.locality}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                      {fat.totalCap} Ports
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        onStartNavigation(fat);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] shadow-sm cursor-pointer active:scale-95 transition-all"
                    >
                      <Navigation className="w-3 h-3 fill-black" />
                      <span>Go</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* B. CENTRAL HUB RESULTS */}
          {hubResults.length > 0 && (
            <div className="space-y-2">
              {selectedFilter === 'ALL' && (
                <div className="text-[11px] font-mono font-extrabold text-cyan-400 uppercase tracking-wider pt-1">
                  Central HUB Nodes ({hubResults.length})
                </div>
              )}
              {hubResults.map((hub) => (
                <div
                  key={hub.hub}
                  onClick={() => {
                    if (onNavigateToHub) {
                      onClose();
                      onNavigateToHub({ hub: hub.hub, rsu: hub.rsu, city: hub.city, lat: hub.lat, lng: hub.lng, locality: hub.locality });
                    } else if (hub.fats?.[0]) {
                      onClose();
                      onSelectFat(hub.fats[0]);
                    }
                  }}
                  className="p-3 rounded-2xl bg-[#141824] hover:bg-[#1a2336] border border-cyan-500/30 shadow-md flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-98 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                      <HubModelIcon className="w-5 h-5 text-cyan-400" />
                    </div>

                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-extrabold text-sm text-cyan-300">
                          Central HUB · {hub.hub}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                          RSU {hub.rsu}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-300 truncate max-w-[210px] mt-0.5">
                        {hub.locality} &middot; {hub.city}
                      </div>

                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {hub.fatCount} Connected FAT Terminals · {hub.totalCapacity} Total Capacity
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-black text-cyan-400 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 shrink-0">
                    CENTRAL HUB
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* C. RSU EXCHANGE RESULTS */}
          {rsuResults.length > 0 && (
            <div className="space-y-2">
              {selectedFilter === 'ALL' && (
                <div className="text-[11px] font-mono font-extrabold text-amber-400 uppercase tracking-wider pt-1">
                  RSU Exchanges ({rsuResults.length})
                </div>
              )}
              {rsuResults.map((rsu) => (
                <div
                  key={rsu.rsu}
                  onClick={() => {
                    if (onNavigateToRsu) {
                      onClose();
                      onNavigateToRsu({ rsu: rsu.rsu, city: rsu.city, lat: rsu.lat, lng: rsu.lng });
                    }
                  }}
                  className="p-3 rounded-2xl bg-[#181520] hover:bg-[#221c2e] border border-amber-500/30 shadow-md flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-98 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                      <RsuModelIcon className="w-5 h-5 text-amber-400" />
                    </div>

                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-extrabold text-sm text-amber-300">
                          RSU Exchange · {rsu.rsu}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-300 truncate max-w-[210px] mt-0.5">
                        City: {rsu.city}
                      </div>

                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {rsu.hubCount} HUBs &middot; {rsu.fatCount} Active FAT Terminals
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-black text-amber-400 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 shrink-0">
                    RSU EXCHANGE
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* D. PON PORT RESULTS */}
          {ponResults.length > 0 && (
            <div className="space-y-2">
              {selectedFilter === 'ALL' && (
                <div className="text-[11px] font-mono font-extrabold text-emerald-400 uppercase tracking-wider pt-1">
                  PON Ports ({ponResults.length})
                </div>
              )}
              {ponResults.map((pon) => (
                <div
                  key={pon.ponPort}
                  onClick={() => {
                    if (pon.fats?.[0]) {
                      onClose();
                      onSelectFat(pon.fats[0]);
                    }
                  }}
                  className="p-3 rounded-2xl bg-[#111f18] hover:bg-[#162a20] border border-emerald-500/30 shadow-md flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-98 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                      <PonPortModelIcon className="w-5 h-5 text-emerald-400" />
                    </div>

                    <div className="min-w-0 pr-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-extrabold text-sm text-emerald-300">
                          PON Port · {pon.ponPort}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-300 truncate max-w-[210px] mt-0.5">
                        Affiliated: {pon.affiliatedPon} &middot; HUB {pon.hub}
                      </div>

                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {pon.fatCount} Bound FAT Terminals &middot; {pon.totalCapacity} Total Capacity
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-black text-emerald-400 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shrink-0">
                    PON PORT
                  </span>
                </div>
              ))}
            </div>
          )}

          {totalMatchesCount === 0 && (
            <div className="py-12 text-center text-neutral-400 font-mono text-sm space-y-1">
              <div>No matching {selectedFilter} nodes found for &ldquo;<span className="text-cyan-400 font-bold">{searchQuery}</span>&rdquo;</div>
              <p className="text-xs text-slate-500">Try searching by FAT ID, HUB, RSU or PON Port code.</p>
            </div>
          )}
        </div>

        {/* 4. VIRTUAL FIELD KEYBOARD */}
        <div className="bg-[#121622] border-t border-black p-2 select-none">
          <div className="flex items-center justify-between px-3 py-1 text-[11px] font-mono text-neutral-400">
            <span>Virtual Field Keyboard</span>
            <button
              onClick={() => setShowKeyboard(!showKeyboard)}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              {showKeyboard ? 'Hide' : 'Show'}
            </button>
          </div>

          {showKeyboard && (
            <div className="max-w-md mx-auto space-y-1.5 pb-2 pt-1">
              <div className="flex justify-center gap-1">
                {row1.map((k) => (
                  <button
                    key={k}
                    onClick={() => handleKeyPress(k)}
                    className="w-8 sm:w-9 h-10 rounded-lg bg-[#202738] hover:bg-[#2b354d] active:bg-cyan-500 active:text-black text-white font-mono text-sm font-semibold flex items-center justify-center cursor-pointer shadow transition-colors active:scale-90"
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div className="flex justify-center gap-1">
                {row2.map((k) => (
                  <button
                    key={k}
                    onClick={() => handleKeyPress(k)}
                    className="w-8 sm:w-9 h-10 rounded-lg bg-[#202738] hover:bg-[#2b354d] active:bg-cyan-500 active:text-black text-white font-mono text-sm font-semibold flex items-center justify-center cursor-pointer shadow transition-colors active:scale-90"
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div className="flex justify-center gap-1">
                {row3.map((k) => (
                  <button
                    key={k}
                    onClick={() => handleKeyPress(k)}
                    className="w-8 sm:w-9 h-10 rounded-lg bg-[#202738] hover:bg-[#2b354d] active:bg-cyan-500 active:text-black text-white font-mono text-sm font-semibold flex items-center justify-center cursor-pointer shadow transition-colors active:scale-90"
                  >
                    {k}
                  </button>
                ))}
                <button
                  onClick={handleBackspace}
                  className="w-12 h-10 rounded-lg bg-[#2b354d] hover:bg-[#374463] text-amber-300 font-mono text-xs font-bold flex items-center justify-center cursor-pointer shadow active:scale-90"
                >
                  ⌫
                </button>
              </div>

              <div className="flex justify-center gap-2 pt-1 px-4">
                <button
                  onClick={() => handleKeyPress('-')}
                  className="w-12 h-9 rounded-lg bg-[#202738] hover:bg-[#2b354d] text-white font-mono font-bold text-sm cursor-pointer flex items-center justify-center"
                >
                  -
                </button>
                <button
                  onClick={() => handleKeyPress(' ')}
                  className="flex-1 h-9 rounded-lg bg-[#202738] hover:bg-[#2b354d] text-neutral-300 font-mono text-xs font-semibold cursor-pointer flex items-center justify-center shadow"
                >
                  Space
                </button>
                <button
                  onClick={onClose}
                  className="px-4 h-9 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs cursor-pointer flex items-center justify-center shadow-lg active:scale-95"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
