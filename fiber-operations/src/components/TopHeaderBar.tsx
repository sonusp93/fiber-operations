import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  X, 
  Settings, 
  Sun, 
  Moon, 
  LogOut,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { VideoTabType } from './VideoBottomNavPill';
import { FAT_DATASET, FatRecord } from '../data/telecomDataset';

interface TopHeaderBarProps {
  canGoBack?: boolean;
  onBack?: () => void;
  onOpenSettings: () => void;
  onToggleTheme?: () => void;
  isLightMode?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultsCount?: number;
  currentTab?: VideoTabType;
  onSelectFat?: (fat: FatRecord) => void;
  onSwitchTab?: (tab: VideoTabType) => void;
  isNearby1KmOnly?: boolean;
  onToggleNearby1Km?: () => void;
  isScrolledDown?: boolean;
  onScrolledSearchClick?: () => void;
  userName?: string;
  onLogout?: () => void;
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  canGoBack,
  onBack,
  onOpenSettings,
  onToggleTheme,
  isLightMode = false,
  searchQuery,
  onSearchChange,
  currentTab = 'HOME',
  onSelectFat,
  userName = 'Sonu',
  onLogout,
  isScrolledDown = false,
  onScrolledSearchClick
}) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSearchActive(false);
        setShowLogoutConfirm(false);
      }
    };
    if (isSearchActive || showLogoutConfirm) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSearchActive, showLogoutConfirm]);

  const handleClear = () => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  // Fast short-circuiting autocomplete matches for top bar dropdown (max 7 matches)
  const liveMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const matches: FatRecord[] = [];
    for (const f of FAT_DATASET) {
      if (matches.length >= 7) break;
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
      }
    }
    return matches;
  }, [searchQuery]);

  // Contextual placeholder based on active tab
  const getPlaceholder = () => {
    switch (currentTab) {
      case 'RADAR':
        return 'Search Radar Proximity Nodes..';
      case 'HUB':
        return 'Search HUB ID, RSU, Locality..';
      case 'RSU':
        return 'Search RSU Code, Substation..';
      case 'PON':
        return 'Search PON Port, Feeder..';
      case 'FAT':
        return 'Search FAT ID, Address..';
      case 'HOME':
      default:
        return 'Search FAT ID, HUB, RSU or Address..';
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    }
  };

  // On Home screen, top bar shows search ONLY when scrolled down past the in-page search bar
  const shouldShowTopSearch = currentTab !== 'HOME' || isScrolledDown;

  return (
    <header 
      ref={containerRef} 
      className="relative flex-shrink-0 w-full px-2.5 sm:px-4 pt-2.5 pb-2 z-50 select-none backdrop-blur-xl"
    >
      <div className="w-full max-w-5xl mx-auto">
        {/* SINGLE HEADER ROW: ALWAYS SETTINGS, SEAMLESS SEARCH BAR / BRAND BADGE, USERNAME & THEME */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 w-full">
          {/* LEFT: Settings button ALWAYS present (no top back button needed, left/right gesture back used) */}
          <div className="flex items-center shrink-0">
            <button
              onClick={onOpenSettings}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all duration-300 ease-out active:scale-85 hover:scale-105 border ${
                isLightMode
                  ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100 shadow-sm'
                  : 'bg-[rgba(18,20,28,0.85)] border-white/10 text-slate-200 hover:text-white shadow-[0_14px_40px_rgba(0,0,0,0.7)]'
              }`}
              title="Settings & Network Config"
            >
              <Settings className="w-4 h-4 transition-transform duration-300 hover:rotate-90 text-cyan-400 font-bold" />
            </button>
          </div>

          {/* CENTER: NO OVERLAP! Seamless fluid search bar or brand badge */}
          {!shouldShowTopSearch ? (
            <div className="flex-1 min-w-0 flex items-center justify-center px-1 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div 
                onClick={onScrolledSearchClick}
                className={`h-9 sm:h-10 max-w-full px-2.5 sm:px-4 rounded-full flex items-center gap-1.5 sm:gap-2 border backdrop-blur-2xl shadow-sm transition-all duration-300 cursor-pointer hover:border-cyan-500/40 min-w-0 overflow-hidden shrink ${
                  isLightMode
                    ? 'bg-white/80 border-slate-200 text-slate-800 hover:bg-slate-50'
                    : 'bg-[rgba(18,20,28,0.85)] border-white/10 text-slate-200 hover:bg-white/10'
                }`}
                title="Tap to view Home Search"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0 shadow-[0_0_8px_#22d3ee]" />
                <span className={`text-[11px] sm:text-xs font-mono font-bold tracking-wider truncate min-w-0 ${
                  isLightMode ? 'text-blue-700' : 'text-cyan-300'
                }`}>
                  <span className="inline sm:hidden">VKA FIBER</span>
                  <span className="hidden sm:inline">VKA FIBER OPERATIONS</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 hidden md:inline shrink-0">
                  · RTK GIS
                </span>
              </div>
            </div>
          ) : (
            <div className="relative flex-1 min-w-0 animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-300">
              <div 
                onClick={() => setIsSearchActive(true)}
                className={`w-full h-9 sm:h-10 rounded-full flex items-center justify-between gap-2 px-3 backdrop-blur-3xl border transition-all duration-300 cursor-text ${
                isSearchActive || searchQuery
                  ? isLightMode
                    ? 'bg-white border-blue-500 ring-2 ring-blue-500/15 shadow-md text-slate-900'
                    : 'bg-[#121524] border-cyan-400/80 ring-2 ring-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.2)] text-white'
                  : isLightMode
                  ? 'bg-white/90 border-slate-300/80 text-slate-800 hover:border-slate-400'
                  : 'bg-[rgba(18,20,28,0.85)] border-white/12 text-slate-200 hover:border-white/25 shadow-sm'
              }`}>
                <Search 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onScrolledSearchClick) onScrolledSearchClick();
                    setIsSearchActive(true);
                    inputRef.current?.focus();
                  }}
                  className={`w-4 h-4 shrink-0 transition-colors cursor-pointer ${
                    isLightMode ? 'text-blue-600' : 'text-cyan-400'
                  }`} 
                />
                
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setIsSearchActive(true);
                  }}
                  onFocus={() => setIsSearchActive(true)}
                  placeholder={getPlaceholder()}
                  className={`w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none min-w-0 ${
                    isLightMode 
                      ? 'text-slate-900 placeholder-slate-400' 
                      : 'text-white placeholder-slate-400'
                  }`}
                />

                {searchQuery && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }} 
                    className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            {/* LIVE SEARCH AUTOCOMPLETE DROPDOWN */}
            {isSearchActive && searchQuery.trim().length > 0 && (
              <div className={`absolute top-11 sm:top-12 left-0 right-0 rounded-2xl border p-2 shadow-2xl z-[999] animate-in fade-in zoom-in-95 duration-150 ${
                isLightMode 
                  ? 'bg-white border-slate-200 text-slate-900 shadow-2xl ring-1 ring-slate-900/10' 
                  : 'bg-[#0f1322] border-cyan-500/30 text-white shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl ring-1 ring-cyan-500/20'
              }`}>
                <div className="flex items-center justify-between px-2.5 py-1.5 mb-1 border-b border-white/5 text-[10.5px] font-mono text-slate-400">
                  <span className="font-bold text-cyan-400 dark:text-cyan-300">MATCHING NODES ({liveMatches.length})</span>
                  <span>TAP TO LOCATE</span>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto no-scrollbar">
                  {liveMatches.length > 0 ? (
                    liveMatches.map((fat) => (
                      <div
                        key={fat.id}
                        onClick={() => {
                          if (onSelectFat) onSelectFat(fat);
                          setIsSearchActive(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all border border-transparent ${
                          isLightMode 
                            ? 'hover:bg-blue-50/90 hover:border-blue-200 text-slate-800' 
                            : 'hover:bg-white/10 hover:border-cyan-500/20 text-white'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-mono font-bold text-xs text-blue-600 dark:text-cyan-300">
                            FAT {fat.fatId} &middot; <span className="text-emerald-500">{fat.ponPort}</span>
                          </div>
                          <div className="text-[10px] truncate text-slate-500 dark:text-slate-400 mt-0.5">
                            {fat.neAddress} &middot; {fat.locality}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0 px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                          HUB {fat.hub}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 space-y-1">
                      <div>No nodes found matching &ldquo;<span className="text-cyan-400 font-bold">{searchQuery}</span>&rdquo;</div>
                      <div className="text-[10.5px] text-slate-500">
                        Try searching with FAT ID (e.g. 01I), PON, HUB, RSU or locality
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          {/* RIGHT GROUP: USERNAME (LOGOUT ONLY) & THEME TOGGLE */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
            {/* Field Engineer Badge: CLICKING LOGS OUT ONLY AS REQUESTED */}
            <div 
              onClick={handleUserClick}
              className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 sm:gap-2 border backdrop-blur-2xl shadow-sm transition-all duration-300 cursor-pointer active:scale-95 group shrink-0 ${
                isLightMode
                  ? 'bg-white border-slate-200 text-slate-900 hover:bg-red-50 hover:border-red-300'
                  : 'bg-[rgba(18,20,28,0.85)] border-white/10 text-white hover:border-red-500/40 hover:bg-red-950/20 shadow-[0_12px_36px_rgba(0,0,0,0.6)]'
              }`}
              title="Click to Log Out"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20 shrink-0 group-hover:bg-red-400 group-hover:ring-red-400/30 transition-colors" />
              <span className={`text-[11px] sm:text-xs font-mono font-bold tracking-wide truncate max-w-[60px] sm:max-w-[100px] ${
                isLightMode ? 'text-slate-900' : 'text-slate-100'
              }`}>
                {userName}
              </span>
              <LogOut className="w-3 h-3 text-slate-400 group-hover:text-red-400 transition-colors shrink-0" />
            </div>

            {/* Logout Confirmation Modal: Portal into document.body so it NEVER renders under header or home cards */}
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
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/20">
                    <LogOut className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-black tracking-tight">Confirm Log Out</h3>
                    <p className={`text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                      Log out of engineer session for <b className={isLightMode ? 'text-slate-900' : 'text-cyan-300'}>{userName}</b>?
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        isLightMode 
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' 
                          : 'bg-white/10 hover:bg-white/15 border-white/10 text-slate-300'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmLogout}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-mono font-black bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white cursor-pointer shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}

            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-85 hover:scale-105 border ${
                  isLightMode
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-600 shadow-sm'
                    : 'bg-cyan-950/60 hover:bg-cyan-900/60 border-cyan-500/30 text-cyan-400 shadow-md shadow-cyan-950/40'
                }`}
                title={isLightMode ? 'Switch to Dark Mode (Moon)' : 'Switch to Light Mode (Sun)'}
              >
                {isLightMode ? (
                  <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
                ) : (
                  <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
