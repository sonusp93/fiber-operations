import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search as SearchIcon,
  X,
  ChevronRight,
  Navigation,
  Mic,
  Server,
  Building2,
  Network,
  Zap,
  Check
} from 'lucide-react';
import { FatRecord, FAT_DATASET } from '../data/telecomDataset';
import { MicVoiceIcon, FatModelIcon, RsuModelIcon, HubModelIcon, PonPortModelIcon } from './ModelIcons';

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
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Accurate multi-field search matching (max 50 results)
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return FAT_DATASET.slice(0, 20);
    }
    const matches: FatRecord[] = [];
    for (const node of FAT_DATASET) {
      if (matches.length >= 50) break;

      const fatIdMatch = node.fatId.toLowerCase().includes(q) || node.id.toLowerCase().includes(q);
      const hubMatch = node.hub.toLowerCase().includes(q);
      const rsuMatch = node.rsu.toLowerCase().includes(q);
      const ponMatch = node.ponPort.toLowerCase().includes(q) || (node.affiliatedPon && node.affiliatedPon.toLowerCase().includes(q));
      const addrMatch = node.neAddress.toLowerCase().includes(q) || node.locality.toLowerCase().includes(q) || node.city.toLowerCase().includes(q);

      let isMatch = false;
      if (selectedFilter === 'FAT') {
        isMatch = fatIdMatch || addrMatch;
      } else if (selectedFilter === 'RSU') {
        isMatch = rsuMatch;
      } else if (selectedFilter === 'HUB') {
        isMatch = hubMatch;
      } else if (selectedFilter === 'PON') {
        isMatch = ponMatch;
      } else {
        isMatch = fatIdMatch || hubMatch || rsuMatch || ponMatch || addrMatch;
      }

      if (isMatch) {
        matches.push(node);
      }
    }
    return matches;
  }, [searchQuery, selectedFilter]);

  // Virtual keyboard keys (matching video 00:01 - 00:03)
  const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  const row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  const handleKeyPress = (char: string) => {
    setSearchQuery((prev) => prev + char);
  };

  const handleBackspace = () => {
    setSearchQuery((prev) => prev.slice(0, -1));
  };

  const handleVoiceSearch = () => {
    setIsListening(true);
    setSearchQuery('RSU-99');
    setTimeout(() => setIsListening(false), 1200);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-black/80 backdrop-blur-2xl text-neutral-100 select-none animate-in fade-in duration-200 p-2 sm:p-4 overflow-hidden"
    >
      <div className="w-full max-w-lg h-full flex flex-col rounded-[28px] border border-white/15 bg-[#0e121e] shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* 1. TOP SEARCH BAR WITH CANCEL BUTTON */}
      <div className="px-3.5 pt-3 pb-2.5 bg-[#121622]/95 border-b border-black backdrop-blur-2xl">
        <div className="flex items-center gap-2.5 max-w-md mx-auto w-full">
          {/* Search Input Box */}
          <div className="flex-1 relative flex items-center">
            <div className="w-full h-11 rounded-full bg-[rgba(18,18,24,0.95)] border border-black flex items-center px-3.5 gap-2.5 shadow-[0_16px_45px_rgba(0,0,0,0.95),0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-3xl transition-all">
              <SearchIcon className="w-4 h-4 text-neutral-300 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAT, RSU, HUB, PON..."
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

            {/* AUTOCOMPLETE SUGGESTIONS DROPDOWN */}
            <div className="absolute top-12 left-0 right-0 rounded-2xl border border-black bg-[rgba(16,16,22,0.96)] p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-3xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {[
                { bold: searchQuery.trim() || 'Design', normal: 'systems' },
                { bold: searchQuery.trim() || 'Design', normal: 'language' },
                { bold: searchQuery.trim() || 'Design', normal: 'patterns' }
              ].map((sug, idx) => (
                <div
                  key={idx}
                  onClick={() => setSearchQuery(`${sug.bold} ${sug.normal}`)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer hover:bg-white/[0.08] text-neutral-200 hover:text-white transition-all"
                >
                  <SearchIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <div className="flex items-center gap-1.5 truncate text-xs">
                    <span className="font-bold text-white">{sug.bold}</span>
                    <span className="text-neutral-400 font-normal">{sug.normal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cancel Button (matching video top right) */}
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm px-2 py-1.5 cursor-pointer active:scale-95 transition-all shrink-0"
          >
            Cancel
          </button>
        </div>

        {/* 2. CATEGORY FILTER TABS (matching video 00:04, 00:05: FAT | RSU | HUB | PON PORT) */}
        <div className="flex items-center gap-1.5 mt-2.5 max-w-md mx-auto w-full overflow-x-auto pb-0.5">
          {(
            [
              { id: 'ALL', label: 'All Nodes' },
              { id: 'FAT', label: 'FAT' },
              { id: 'RSU', label: 'RSU' },
              { id: 'HUB', label: 'HUB' },
              { id: 'PON', label: 'PON PORT' }
            ] as const
          ).map((tab) => {
            const isTabActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95 shrink-0 ${
                  isTabActive
                    ? 'bg-white text-black font-extrabold shadow-[0_2px_10px_rgba(255,255,255,0.3)]'
                    : 'bg-[#1a2030] text-neutral-400 hover:text-white border border-black'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SEARCH RESULTS LIST (matching video 00:04: Search results with See All) */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-2 max-w-md mx-auto w-full">
        <div className="flex items-center justify-between text-xs font-mono px-1 py-1">
          <span className="text-neutral-400 font-medium">
            Search results ({searchResults.length})
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-cyan-400 hover:underline cursor-pointer"
          >
            See All
          </button>
        </div>

        {searchResults.length > 0 ? (
          searchResults.map((fat) => (
            <div
              key={fat.id}
              onClick={() => {
                onClose();
                onSelectFat(fat);
              }}
              className="p-3 rounded-2xl bg-[#141824] hover:bg-[#1a2030] border border-black hover:border-black shadow-md flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-98 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* 3D-Style Node Icon (matching green/cyan cube in video) */}
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1a2335] to-[#121926] border border-black group-hover:border-black flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                  {selectedFilter === 'RSU' ? (
                    <RsuModelIcon className="w-5 h-5 text-amber-400" />
                  ) : selectedFilter === 'HUB' ? (
                    <HubModelIcon className="w-5 h-5 text-cyan-400" />
                  ) : selectedFilter === 'PON' ? (
                    <PonPortModelIcon className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <FatModelIcon className="w-5 h-5 text-cyan-300" />
                  )}
                </div>

                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {fat.hub} · FAT {fat.fatId}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[#1f283d] text-cyan-300 border border-black">
                      {fat.rsu}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-300 truncate max-w-[210px] mt-0.5">
                    {fat.neAddress}
                  </div>

                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    3:53 PM · {fat.locality} · {fat.city}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 gap-1.5">
                <span className="text-xs font-mono font-bold text-neutral-300">
                  {fat.totalCap * 120} Units
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
          ))
        ) : (
          <div className="py-12 text-center text-neutral-400 text-sm">
            No matching telecom nodes for &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>

      {/* 4. INTERACTIVE VIRTUAL KEYBOARD (matching video 00:01 - 00:04) */}
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
            {/* Row 1 */}
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

            {/* Row 2 */}
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

            {/* Row 3 */}
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

            {/* Row 4: Space & Search */}
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
                Search
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
