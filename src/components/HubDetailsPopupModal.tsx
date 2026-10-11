import React, { useState } from 'react';
import { FatRecord, HubRecord } from '../data/telecomDataset';
import { X, Navigation, Copy, Check, Network, MapPin, Layers } from 'lucide-react';
import { HubModelIcon, FatModelIcon } from './ModelIcons';

interface HubDetailsPopupModalProps {
  hub: HubRecord;
  onClose: () => void;
  onSelectFat: (fat: FatRecord) => void;
  onStartNavigation: (hub: { hub: string; rsu: string; city: string; lat: number; lng: number; locality: string }) => void;
  isLightMode?: boolean;
}

export const HubDetailsPopupModal: React.FC<HubDetailsPopupModalProps> = ({
  hub,
  onClose,
  onSelectFat,
  onStartNavigation,
  isLightMode = false
}) => {
  const [copied, setCopied] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleAnimatedClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 180);
  };

  const handleCopyGps = () => {
    navigator.clipboard.writeText(`${hub.lat}, ${hub.lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleAnimatedClose();
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 select-none bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200 ${
        isClosing ? 'animate-backdrop-fade-out pointer-events-none' : ''
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md max-h-[85vh] rounded-[28px] flex flex-col overflow-hidden shadow-2xl transition-all border ${
          isClosing ? 'animate-fat-zoom-out' : 'animate-fat-zoom-in'
        } ${
          isLightMode
            ? 'bg-white text-slate-900 border-slate-200 shadow-xl'
            : 'bg-[#0d0a1a] text-neutral-100 border-purple-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.95)]'
        }`}
      >
        {/* Header */}
        <div className={`p-3.5 flex items-start justify-between gap-2 border-b ${
          isLightMode ? 'bg-purple-50/90 border-slate-200/80' : 'bg-purple-950/20 border-purple-500/30'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
              <HubModelIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-black text-sm text-purple-300">
                  Central HUB · {hub.hub}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  RSU {hub.rsu}
                </span>
              </div>
              <p className="text-xs text-neutral-300 truncate mt-0.5">
                {hub.locality} &middot; {hub.city}
              </p>
            </div>
          </div>

          <button
            onClick={handleAnimatedClose}
            className={`p-2 rounded-full cursor-pointer active:scale-90 transition-all border ${
              isLightMode
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                : 'bg-white/10 hover:bg-white/20 border-white/10 text-neutral-300'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px] block">Connected FATs</span>
              <span className="text-sm font-extrabold text-cyan-400">{hub.fatCount || hub.fats.length} Terminals</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px] block">Total Capacity</span>
              <span className="text-sm font-extrabold text-purple-400">{hub.totalCapacity} Ports</span>
            </div>
          </div>

          {/* GPS Coordinates Copy Row */}
          <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>{hub.lat.toFixed(4)}, {hub.lng.toFixed(4)}</span>
            </div>
            <button
              onClick={handleCopyGps}
              className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-[10px] cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy GPS'}</span>
            </button>
          </div>

          {/* Connected FAT Terminals Section */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
              <span>Connected FAT Terminals ({hub.fats.length})</span>
              <span className="text-[10px] text-purple-400">Tap item to inspect</span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar">
              {hub.fats.map((fat) => (
                <div
                  key={fat.id}
                  onClick={() => {
                    handleAnimatedClose();
                    onSelectFat(fat);
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-purple-950/40 border border-white/10 hover:border-purple-500/40 flex items-center justify-between cursor-pointer transition-all active:scale-98 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FatModelIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-mono font-bold text-xs text-white group-hover:text-purple-300 transition-colors">
                        FAT {fat.fatId} &middot; {fat.ponPort}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {fat.neAddress}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                    {fat.totalCap}P
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-3.5 border-t border-white/10 bg-black/40 flex items-center gap-2">
          <button
            onClick={() => {
              handleAnimatedClose();
              onStartNavigation({
                hub: hub.hub,
                rsu: hub.rsu,
                city: hub.city,
                lat: hub.lat,
                lng: hub.lng,
                locality: hub.locality
              });
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 cursor-pointer active:scale-95 transition-all"
          >
            <Navigation className="w-4 h-4 fill-white" />
            <span>Navigate to HUB {hub.hub}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
