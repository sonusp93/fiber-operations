import React, { useState } from 'react';
import { RsuRecord, FatRecord } from '../data/telecomDataset';
import { X, Navigation, Copy, Check, MapPin, Server } from 'lucide-react';
import { RsuModelIcon, HubModelIcon } from './ModelIcons';

interface RsuDetailsPopupModalProps {
  rsu: RsuRecord;
  onClose: () => void;
  onSelectFat: (fat: FatRecord) => void;
  onStartNavigation: (rsu: { rsu: string; city: string; lat: number; lng: number }) => void;
  isLightMode?: boolean;
}

export const RsuDetailsPopupModal: React.FC<RsuDetailsPopupModalProps> = ({
  rsu,
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
    navigator.clipboard.writeText(`${rsu.lat}, ${rsu.lng}`);
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
            : 'bg-[#17130e] text-neutral-100 border-amber-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.95)]'
        }`}
      >
        {/* Header */}
        <div className={`p-3.5 flex items-start justify-between gap-2 border-b ${
          isLightMode ? 'bg-amber-50/90 border-slate-200/80' : 'bg-amber-950/20 border-amber-500/30'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <RsuModelIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-black text-sm text-amber-300">
                  RSU Exchange · {rsu.rsu}
                </span>
              </div>
              <p className="text-xs text-neutral-300 truncate mt-0.5">
                City: {rsu.city}
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
              <span className="text-slate-400 text-[10px] block">Connected HUBs</span>
              <span className="text-sm font-extrabold text-amber-400">{rsu.hubCount || rsu.hubsList.length} HUBs</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px] block">Active FATs</span>
              <span className="text-sm font-extrabold text-emerald-400">{rsu.fatCount} Terminals</span>
            </div>
          </div>

          {/* GPS Coordinates Copy Row */}
          <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>{rsu.lat.toFixed(4)}, {rsu.lng.toFixed(4)}</span>
            </div>
            <button
              onClick={handleCopyGps}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px] cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy GPS'}</span>
            </button>
          </div>

          {/* Substation HUBs List */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
              <span>Bound Central HUBs ({rsu.hubsList.length})</span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar">
              {rsu.hubsList.map((h) => (
                <div
                  key={h.hub}
                  className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between font-mono text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <HubModelIcon className="w-4 h-4 text-purple-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-white">
                        HUB {h.hub}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {h.locality} &middot; {h.fats.length} FATs
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 shrink-0">
                    {h.totalCapacity} Ports
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
                rsu: rsu.rsu,
                city: rsu.city,
                lat: rsu.lat,
                lng: rsu.lng
              });
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer active:scale-95 transition-all"
          >
            <Navigation className="w-4 h-4 fill-slate-950" />
            <span>Navigate to RSU {rsu.rsu}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
