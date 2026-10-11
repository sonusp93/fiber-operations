import React, { useState } from 'react';
import { PonRecord, FatRecord } from '../data/telecomDataset';
import { X, Navigation, Copy, Check, Zap, Server } from 'lucide-react';
import { PonPortModelIcon, FatModelIcon } from './ModelIcons';

interface PonPortDetailsPopupModalProps {
  pon: PonRecord;
  onClose: () => void;
  onSelectFat: (fat: FatRecord) => void;
  onStartNavigation: (fat: FatRecord) => void;
  isLightMode?: boolean;
}

export const PonPortDetailsPopupModal: React.FC<PonPortDetailsPopupModalProps> = ({
  pon,
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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pon.ponPort);
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
            : 'bg-[#0b1713] text-neutral-100 border-emerald-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.95)]'
        }`}
      >
        {/* Header */}
        <div className={`p-3.5 flex items-start justify-between gap-2 border-b ${
          isLightMode ? 'bg-emerald-50/90 border-slate-200/80' : 'bg-emerald-950/20 border-emerald-500/30'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <PonPortModelIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-black text-sm text-emerald-300">
                  PON Port · {pon.ponPort}
                </span>
              </div>
              <p className="text-xs text-neutral-300 truncate mt-0.5">
                HUB {pon.hub} &middot; RSU {pon.rsu} &middot; {pon.city}
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
              <span className="text-slate-400 text-[10px] block">Bound FATs</span>
              <span className="text-sm font-extrabold text-emerald-400">{pon.fatCount} Terminals</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px] block">Affiliated PON</span>
              <span className="text-sm font-extrabold text-cyan-400 truncate block">{pon.affiliatedPon}</span>
            </div>
          </div>

          {/* Copy PON Port Code */}
          <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate font-bold text-white">{pon.ponPort}</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] cursor-pointer flex items-center gap-1 active:scale-95 transition-all shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Bound FATs List */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
              <span>Bound FAT Terminals ({pon.fats.length})</span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto no-scrollbar">
              {pon.fats.map((fat) => (
                <div
                  key={fat.id}
                  onClick={() => {
                    handleAnimatedClose();
                    onSelectFat(fat);
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-emerald-950/40 border border-white/10 hover:border-emerald-500/40 flex items-center justify-between cursor-pointer transition-all active:scale-98 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FatModelIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-mono font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                        FAT {fat.fatId}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {fat.neAddress} &middot; {fat.locality}
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
        {pon.fats[0] && (
          <div className="p-3.5 border-t border-white/10 bg-black/40 flex items-center gap-2">
            <button
              onClick={() => {
                handleAnimatedClose();
                onStartNavigation(pon.fats[0]);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95 transition-all"
            >
              <Navigation className="w-4 h-4 fill-slate-950" />
              <span>Navigate to Feeder Node</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
