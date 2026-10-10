import React, { useState, useEffect } from 'react';
import { FatRecord } from '../data/telecomDataset';
import { 
  X, 
  MapPin, 
  Copy, 
  Check, 
  Compass, 
  Navigation, 
  Layers, 
  Radio, 
  ExternalLink,
  Activity,
  Zap
} from 'lucide-react';
import { Fat3DModelIcon, Hub3DModelIcon, Rsu3DModelIcon } from './ModelIcons';

interface FatDetailsUnifiedViewProps {
  fat: FatRecord;
  onBack: () => void;
  onStartNavigation: (fat: FatRecord) => void;
  onShowOnMap: (fat: FatRecord) => void;
  isLightMode?: boolean;
}

export const FatDetailsUnifiedView: React.FC<FatDetailsUnifiedViewProps> = ({
  fat,
  onBack,
  onStartNavigation,
  onShowOnMap,
  isLightMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'SPECS' | 'LOCATION'>('SPECS');
  const [copied, setCopied] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Close handler with smooth zoom out exit animation
  const handleAnimatedClose = (callback?: () => void) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      if (callback) {
        callback();
      } else {
        onBack();
      }
    }, 180);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleAnimatedClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${fat.fatLat}, ${fat.fatLog}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const specs = [
    { label: 'Total Name', value: '15.00 MFB', sub: 'NKA 02/09/2026' },
    { label: 'FAT ID', value: fat.fatId, sub: fat.rfsDate, highlight: true },
    { label: 'PON Port', value: fat.ponPort, sub: 'Optical Drop', highlight: true },
    { label: 'Affiliated PON', value: fat.affiliatedPon, sub: 'Distribution feeder' },
    { label: 'Total Capacity', value: `${fat.totalCap} Ports`, sub: '1:8 / 1:16 Splitter' },
    { label: 'Current Status', value: 'Now Working', sub: 'Active Splice', isStatus: true },
    { label: 'GPS Coordinates', value: `${fat.fatLat.toFixed(4)}, ${fat.fatLog.toFixed(4)}`, sub: 'WGS84 Real-time' },
    { label: 'Connected HUB', value: fat.hub, sub: `GPS: ${fat.hubLat.toFixed(4)}, ${fat.hubLog.toFixed(4)}` },
    { label: 'Parent RSU', value: `RSU ${fat.rsu}`, sub: `GPS: ${fat.rsuLat.toFixed(4)}, ${fat.rsuLog.toFixed(4)}` },
    { label: 'NE Address', value: fat.neAddress, sub: fat.locality }
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleAnimatedClose();
        }
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 select-none ${
        isLightMode
          ? 'bg-black/25 backdrop-blur-[6px]'
          : 'bg-black/50 backdrop-blur-[6px]'
      } ${
        isClosing ? 'animate-backdrop-fade-out pointer-events-none' : 'animate-backdrop-fade-in'
      }`}
    >
      {/* SAME-SIZE POPUP MODAL MATCHING NAVIGATION POPUP MODAL (max-w-md) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md max-h-[85vh] rounded-[28px] flex flex-col overflow-hidden shadow-2xl transition-all border ${
          isClosing ? 'animate-fat-zoom-out' : 'animate-fat-zoom-in'
        } ${
          isLightMode
            ? 'bg-white text-slate-900 border-slate-200 shadow-xl'
            : 'bg-[#0f121d] text-neutral-100 border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.92)]'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-3 sm:p-3.5 flex items-start justify-between gap-2 border-b ${
          isLightMode ? 'bg-slate-50/90 border-slate-200/80' : 'bg-white/[0.04] border-white/10'
        }`}>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* FAT ID badge */}
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md text-white bg-gradient-to-r from-orange-500 to-amber-600 shadow-sm">
                FAT {fat.fatId}
              </span>

              {/* PON Port badge */}
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md text-white bg-blue-600 shadow-sm">
                {fat.ponPort}
              </span>

              {/* Status indicator */}
              <span className={`flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                isLightMode ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950/80 text-emerald-300'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>Working</span>
              </span>
            </div>

            <h2 className={`text-xs sm:text-sm font-extrabold tracking-tight truncate mt-0.5 ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              {fat.neAddress}
            </h2>

            <div className={`text-[10.5px] font-medium truncate ${
              isLightMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {fat.locality} · {fat.city}
            </div>
          </div>

          <button
            onClick={() => handleAnimatedClose()}
            className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-all shrink-0 border ${
              isLightMode
                ? 'bg-slate-200/80 hover:bg-slate-300 border-slate-300 text-slate-700'
                : 'bg-white/10 hover:bg-white/20 border-white/10 text-neutral-200'
            }`}
            title="Close popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Switcher: Field Specs vs Same-Location Map Preview */}
        <div className={`px-3 pt-2 pb-1 flex items-center gap-1.5 border-b ${
          isLightMode ? 'bg-slate-100/60 border-slate-200/60' : 'bg-white/[0.02] border-white/5'
        }`}>
          <button
            onClick={() => setActiveTab('SPECS')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'SPECS'
                ? isLightMode
                  ? 'bg-white text-blue-600 shadow-sm font-black'
                  : 'bg-white/10 text-cyan-300 shadow-sm font-black'
                : isLightMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Field Specs</span>
          </button>

          <button
            onClick={() => setActiveTab('LOCATION')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'LOCATION'
                ? isLightMode
                  ? 'bg-white text-emerald-600 shadow-sm font-black'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm font-black'
                : isLightMode
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Location Map</span>
          </button>
        </div>

        {/* Modal Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar">
          {/* TAB 1: FIELD SPECS */}
          {activeTab === 'SPECS' ? (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              {/* Quick Action Navigation Buttons */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => {
                    handleAnimatedClose(() => {
                      onBack();
                      onStartNavigation(fat);
                    });
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold text-xs text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer min-h-[36px] active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Start Turn GPS</span>
                </button>

                <button
                  onClick={() => setActiveTab('LOCATION')}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-md shadow-emerald-500/25 transition-all cursor-pointer min-h-[36px] active:scale-95"
                >
                  <MapPin className="w-3.5 h-3.5 text-white" />
                  <span>View Location</span>
                </button>
              </div>

              {/* Network Pathway Hierarchy Grid */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className={`rounded-xl p-2 text-center border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/5'
                }`}>
                  <span className={`text-[8.5px] uppercase tracking-wider block font-bold ${
                    isLightMode ? 'text-slate-500' : 'text-neutral-400'
                  }`}>
                    Terminal
                  </span>
                  <div className={`text-xs font-mono font-extrabold truncate mt-0.5 ${
                    isLightMode ? 'text-slate-900' : 'text-white'
                  }`}>
                    {fat.fatId}
                  </div>
                </div>

                <div className={`rounded-xl p-2 text-center border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/5'
                }`}>
                  <span className={`text-[8.5px] uppercase tracking-wider block font-bold ${
                    isLightMode ? 'text-slate-500' : 'text-neutral-400'
                  }`}>
                    Parent RSU
                  </span>
                  <div className="text-xs font-mono font-extrabold text-amber-500 truncate mt-0.5">
                    RSU {fat.rsu}
                  </div>
                </div>

                <div className={`rounded-xl p-2 text-center border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/5'
                }`}>
                  <span className={`text-[8.5px] uppercase tracking-wider block font-bold ${
                    isLightMode ? 'text-slate-500' : 'text-neutral-400'
                  }`}>
                    Central Hub
                  </span>
                  <div className={`text-xs font-mono font-extrabold truncate mt-0.5 ${
                    isLightMode ? 'text-slate-900' : 'text-white'
                  }`}>
                    {fat.hub}
                  </div>
                </div>
              </div>

              {/* Specifications Table */}
              <div className="space-y-1">
                <div className={`text-[9px] font-mono uppercase tracking-wider px-1 font-bold ${
                  isLightMode ? 'text-slate-500' : 'text-neutral-400'
                }`}>
                  Field Optical Parameters
                </div>

                <div className={`rounded-2xl overflow-hidden text-xs border divide-y ${
                  isLightMode
                    ? 'bg-slate-50/80 border-slate-200 divide-slate-200/80'
                    : 'bg-white/[0.03] border-white/5 divide-white/[0.05]'
                }`}>
                  {specs.map((row, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center px-2.5 py-1.5 transition-colors ${
                        isLightMode ? 'hover:bg-slate-100' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex flex-col pr-1 min-w-0">
                        <span className={`font-semibold text-[10.5px] truncate ${
                          isLightMode ? 'text-slate-700' : 'text-neutral-300'
                        }`}>
                          {row.label}
                        </span>
                        <span className={`text-[8.5px] font-mono truncate ${
                          isLightMode ? 'text-slate-400' : 'text-neutral-500'
                        }`}>
                          {row.sub}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-mono text-[10.5px] ${
                            row.isStatus
                              ? 'text-emerald-500 font-bold'
                              : row.highlight
                              ? isLightMode ? 'text-slate-950 font-black' : 'text-white font-bold'
                              : isLightMode ? 'text-slate-800 font-medium' : 'text-neutral-300 font-medium'
                          }`}
                        >
                          {row.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: IN-PLACE SAME-LOCATION MAP & RADAR LOCATOR PREVIEW */
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Tactical Radar / Map Locator Visualizer inside the popup */}
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-cyan-500/30 bg-gradient-to-b from-[#080d1a] to-[#04060c] flex items-center justify-center shadow-inner">
                {/* Concentric distance rings */}
                <div className="absolute w-36 h-36 rounded-full border border-cyan-500/20" />
                <div className="absolute w-24 h-24 rounded-full border border-cyan-500/30 border-dashed" />
                <div className="absolute w-12 h-12 rounded-full border border-cyan-500/40" />

                {/* Radar Grid Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/20" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/20" />

                {/* Optical Feeder Path line from Hub to FAT */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line 
                    x1="25%" 
                    y1="75%" 
                    x2="50%" 
                    y2="50%" 
                    stroke="#a855f7" 
                    strokeWidth="2" 
                    strokeDasharray="4 3" 
                  />
                  <line 
                    x1="75%" 
                    y1="25%" 
                    x2="50%" 
                    y2="50%" 
                    stroke="#10b981" 
                    strokeWidth="2" 
                    strokeDasharray="4 3" 
                  />
                </svg>

                {/* Parent Hub Pin */}
                <div className="absolute left-[25%] top-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                  <span className="text-[8px] font-mono text-purple-400 font-bold">HUB {fat.hub}</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#c084fc]" />
                </div>

                {/* Parent RSU Pin */}
                <div className="absolute left-[75%] top-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                  <span className="text-[8px] font-mono text-emerald-400 font-bold">RSU {fat.rsu}</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#34d399]" />
                </div>

                {/* CENTER TARGET: FAT TERMINAL POLE PIN */}
                <div className="relative z-20 flex flex-col items-center pointer-events-none animate-bounce">
                  <div className="p-1 rounded-full bg-orange-500 text-white shadow-[0_0_16px_#f97316] ring-2 ring-white">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono font-black text-white bg-black/80 px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap border border-orange-500/50">
                    FAT {fat.fatId} · Active
                  </span>
                </div>

                {/* Coordinate HUD Overlay */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-mono px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-cyan-300">
                  <span>GPS: {fat.fatLat.toFixed(5)}° N</span>
                  <span>{fat.fatLog.toFixed(5)}° E</span>
                  <span className="text-emerald-400">Locked</span>
                </div>
              </div>

              {/* Location details card */}
              <div className={`p-2.5 rounded-2xl border space-y-1.5 ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
              }`}>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Physical Address:</span>
                  <span className="font-bold text-orange-500">Pole Mounted Closure</span>
                </div>
                <p className={`text-xs font-semibold ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                  {fat.neAddress}, {fat.locality}, {fat.city}
                </p>
                <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                  <span>Substation: RSU {fat.rsu}</span>
                  <span>Aggregator: HUB {fat.hub}</span>
                </div>
              </div>

              {/* Direct Navigation Button inside Location Popup */}
              <button
                onClick={() => {
                  handleAnimatedClose(() => {
                    onBack();
                    onStartNavigation(fat);
                  });
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/30 transition-all active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 fill-current" />
                <span>Open Turn-by-Turn Navigation</span>
              </button>
            </div>
          )}

          {/* Copy GPS Coordinates Action Bar */}
          <div className="pt-1">
            <button
              onClick={handleCopy}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-sm ${
                isLightMode
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                  <span className="text-emerald-500 font-extrabold text-xs">Coordinates Copied!</span>
                </>
              ) : (
                <>
                  <Copy className={`w-3.5 h-3.5 ${isLightMode ? 'text-slate-500' : 'text-neutral-400'}`} />
                  <span className="truncate">Copy GPS Coordinates ({fat.fatLat.toFixed(4)}, {fat.fatLog.toFixed(4)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
