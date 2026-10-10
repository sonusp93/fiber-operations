import React, { useState } from 'react';
import { FatRecord } from '../data/telecomDataset';
import { X, Navigation, MapPin, Copy, Check } from 'lucide-react';

interface FatDetailsModalProps {
  fat: FatRecord;
  onClose: () => void;
  onNavigate: (fat: FatRecord) => void;
  onShowOnMap: (fat: FatRecord) => void;
  isLightMode?: boolean;
}

export const FatDetailsModal: React.FC<FatDetailsModalProps> = ({
  fat,
  onClose,
  onNavigate,
  onShowOnMap,
  isLightMode = false
}) => {
  const [copied, setCopied] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${fat.fatLat}, ${fat.fatLog}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fields = [
    { label: 'FAT ID', value: fat.fatId },
    { label: 'PON Port', value: fat.ponPort, highlight: true },
    { label: 'Affiliated PON', value: fat.affiliatedPon },
    { label: 'Total Capacity', value: `${fat.totalCap} Ports` },
    { label: 'RFS Date', value: fat.rfsDate },
    { label: 'NE Address', value: fat.neAddress },
    { label: 'Locality', value: fat.locality },
    { label: 'Connected HUB', value: fat.hub },
    { label: 'Parent RSU', value: `RSU ${fat.rsu}` }
  ];

  const handleAnimatedClose = (callback?: () => void) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      if (callback) {
        callback();
      } else {
        onClose();
      }
    }, 200);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleAnimatedClose();
        }
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 select-none ${
        isLightMode
          ? 'bg-black/15 backdrop-blur-[5px]'
          : 'bg-black/25 backdrop-blur-[5px]'
      } ${
        isClosing ? 'animate-backdrop-fade-out pointer-events-none' : 'animate-backdrop-fade-in'
      }`}
    >
      {/* SMALL POPUP MODAL - No border color, soft shadow, background main page visible underneath */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[285px] sm:max-w-[295px] rounded-[22px] p-3 space-y-2.5 shadow-2xl max-h-[62vh] overflow-y-auto border-none ${
          isClosing ? 'animate-fat-zoom-out' : 'animate-fat-zoom-in'
        } ${
          isLightMode
            ? 'bg-white/95 backdrop-blur-xl text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.18)]'
            : 'bg-[#13151f]/95 backdrop-blur-xl text-neutral-100 shadow-[0_25px_60px_rgba(0,0,0,0.85)]'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-start pb-2 border-none">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-md border-none ${
                isLightMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                FAT: {fat.fatId}
              </span>
              <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-md border-none ${
                isLightMode ? 'bg-emerald-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {fat.ponPort}
              </span>
            </div>
            <h2 className={`text-[11.5px] font-bold mt-1 truncate ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              {fat.neAddress}
            </h2>
            <div className={`text-[10px] ${
              isLightMode ? 'text-slate-500' : 'text-neutral-400'
            }`}>
              {fat.locality} · {fat.city}
            </div>
          </div>

          <button
            onClick={() => handleAnimatedClose()}
            className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-all border-none ${
              isLightMode
                ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-700'
                : 'bg-white/10 hover:bg-white/20 text-neutral-200'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              handleAnimatedClose(() => {
                onClose();
                onNavigate(fat);
              });
            }}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[10.5px] shadow-md transition-all cursor-pointer min-h-[34px] border-none"
          >
            <Navigation className="w-3 h-3 fill-white text-white" />
            <span>Navigation</span>
          </button>

          <button
            onClick={() => {
              handleAnimatedClose(() => {
                onClose();
                onShowOnMap(fat);
              });
            }}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-[10.5px] shadow-md transition-all cursor-pointer min-h-[34px] border-none"
          >
            <MapPin className="w-3 h-3" />
            <span>View Map</span>
          </button>
        </div>

        {/* Full Specifications Table */}
        <div className={`rounded-xl divide-y overflow-hidden text-[10px] border-none ${
          isLightMode
            ? 'bg-slate-100/70 divide-slate-200/60'
            : 'bg-white/[0.04] divide-white/[0.05]'
        }`}>
          {fields.map((f, i) => (
            <div key={i} className="flex justify-between items-center px-2 py-1">
              <span className={`font-medium ${isLightMode ? 'text-slate-600' : 'text-neutral-400'}`}>
                {f.label}
              </span>
              <span className={`font-mono text-right ${
                f.highlight
                  ? 'text-emerald-500 font-bold'
                  : isLightMode ? 'text-slate-900 font-medium' : 'text-neutral-200'
              }`}>
                {f.value}
              </span>
            </div>
          ))}
        </div>

        {/* Copy Coordinates */}
        <div className="pt-0.5">
          <button
            onClick={handleCopy}
            className={`w-full py-1.5 px-2 rounded-xl text-[10px] font-mono flex items-center justify-center gap-1 cursor-pointer min-h-[32px] border-none ${
              isLightMode
                ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-800'
                : 'bg-white/10 hover:bg-white/15 text-neutral-200'
            }`}
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500 stroke-[3]" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy GPS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
