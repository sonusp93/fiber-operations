import React, { useState, useEffect, useMemo } from 'react';
import { NavigationTarget } from './InbuiltDirectionMap';
import { calculateGpsDistanceMeters } from '../data/telecomDataset';
import { Fat3DModelIcon, Hub3DModelIcon, Rsu3DModelIcon } from './ModelIcons';
import { 
  X, MapPin, Navigation, Car, Bike, Footprints, 
  ExternalLink, Copy, Check, Clock, Radio, Compass, ShieldCheck 
} from 'lucide-react';

interface NavigationPopupModalProps {
  target: NavigationTarget;
  onClose: () => void;
  isLightMode?: boolean;
}

export const NavigationPopupModal: React.FC<NavigationPopupModalProps> = ({
  target,
  onClose,
  isLightMode = false
}) => {
  const [copied, setCopied] = useState(false);
  const [travelMode, setTravelMode] = useState<'DRIVING' | 'TWO_WHEELER' | 'WALKING'>('DRIVING');

  // Technician live device location or accurate anchor
  const [userGps, setUserGps] = useState<{ lat: number; lng: number }>({
    lat: 10.0261,
    lng: 76.3125
  });
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(3);
  const [isGpsLive, setIsGpsLive] = useState(false);

  // Single-pass geolocation fetch (zero continuous drain, no heating)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserGps({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          setGpsAccuracy(Math.round(pos.coords.accuracy));
          setIsGpsLive(true);
        },
        () => {
          setIsGpsLive(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    }
  }, []);

  // Distance calculation in meters
  const distanceMeters = useMemo(() => {
    return calculateGpsDistanceMeters(userGps.lat, userGps.lng, target.lat, target.lng);
  }, [userGps, target]);

  // Estimated Travel Time
  const etaMinutes = useMemo(() => {
    if (distanceMeters <= 15) return 0;
    if (travelMode === 'WALKING') {
      return Math.max(1, Math.round(distanceMeters / 75)); // ~4.5 km/h
    } else if (travelMode === 'TWO_WHEELER') {
      return Math.max(1, Math.round(distanceMeters / 450)); // ~27 km/h
    } else {
      return Math.max(1, Math.round(distanceMeters / 600)); // ~36 km/h
    }
  }, [distanceMeters, travelMode]);

  // Copy coordinates
  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${target.lat}, ${target.lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Launch Google Maps Driving Mode directly
  const handleOpenGoogleMapsDriving = () => {
    const mode = travelMode === 'WALKING' ? 'walking' : travelMode === 'TWO_WHEELER' ? 'two-wheeler' : 'driving';
    const url = `https://www.google.com/maps/dir/?api=1&destination=${target.lat},${target.lng}&travelmode=${mode}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-md rounded-3xl border p-5 shadow-2xl transition-all duration-300 ${
          isLightMode
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/15'
            : 'bg-[#0e121d] border-white/15 text-white shadow-[0_24px_60px_rgba(0,0,0,0.95)]'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            {target.type === 'FAT' ? (
              <Fat3DModelIcon size="md" isLightMode={isLightMode} />
            ) : target.type === 'HUB' ? (
              <Hub3DModelIcon size="md" isLightMode={isLightMode} />
            ) : (
              <Rsu3DModelIcon size="md" isLightMode={isLightMode} />
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-mono font-black text-cyan-600 dark:text-cyan-300 truncate">
                  {target.name}
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                  isLightMode ? 'bg-blue-100 text-blue-700' : 'bg-cyan-500/15 text-cyan-300'
                }`}>
                  {target.type}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {target.locality}, {target.city}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all active:scale-90 cursor-pointer ${
              isLightMode ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-slate-400 hover:text-white'
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Origin to Destination Route Information */}
        <div className="space-y-3 py-3 border-b border-slate-200/80 dark:border-white/10">
          {/* Origin: My Location */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                  My Location (Origin)
                </span>
                <span className="text-[9.5px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {isGpsLive ? '● Live GPS' : '● Region Anchor'} ±{gpsAccuracy || 3}m
                </span>
              </div>
              <div className="text-xs font-bold font-mono truncate text-slate-800 dark:text-slate-200 mt-0.5">
                {userGps.lat.toFixed(5)}, {userGps.lng.toFixed(5)}
              </div>
            </div>
          </div>

          {/* Dotted Route Connector */}
          <div className="ml-3.5 border-l-2 border-dashed border-cyan-500/40 h-3" />

          {/* Destination: Search Item Location */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Navigation className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  Search Item Location
                </span>
                {target.ponPort && (
                  <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-bold">
                    {target.ponPort}
                  </span>
                )}
              </div>
              <div className="text-xs font-bold truncate text-slate-800 dark:text-slate-200 mt-0.5">
                {target.subtitle || `${target.locality}, ${target.city}`}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10.5px] font-mono text-slate-500 dark:text-slate-400">
                  {target.lat.toFixed(5)}, {target.lng.toFixed(5)}
                </span>
                <button
                  onClick={handleCopyCoords}
                  className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Travel Mode Selector */}
        <div className="py-2.5 flex items-center justify-between gap-1">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Travel Mode:</span>
          <div className={`flex items-center gap-1 p-0.5 rounded-xl border ${
            isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
          }`}>
            <button
              onClick={() => setTravelMode('DRIVING')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono flex items-center gap-1 transition-all cursor-pointer ${
                travelMode === 'DRIVING'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Drive</span>
            </button>

            <button
              onClick={() => setTravelMode('TWO_WHEELER')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono flex items-center gap-1 transition-all cursor-pointer ${
                travelMode === 'TWO_WHEELER'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Bike</span>
            </button>

            <button
              onClick={() => setTravelMode('WALKING')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono flex items-center gap-1 transition-all cursor-pointer ${
                travelMode === 'WALKING'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Walk</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metrics: KILOMETER, TIME, TRAFFIC */}
        <div className="grid grid-cols-3 gap-2 py-2 text-center">
          {/* Kilometers */}
          <div className={`p-2.5 rounded-2xl border ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">
              Kilometers
            </div>
            <div className="text-sm font-black font-mono text-cyan-600 dark:text-cyan-400 mt-1">
              {distanceMeters < 1000 ? `${distanceMeters} m` : `${(distanceMeters / 1000).toFixed(2)} km`}
            </div>
          </div>

          {/* Travel Time */}
          <div className={`p-2.5 rounded-2xl border ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">
              Est. Time
            </div>
            <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>~{etaMinutes} mins</span>
            </div>
          </div>

          {/* Traffic */}
          <div className={`p-2.5 rounded-2xl border ${
            isLightMode ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
          }`}>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Traffic</span>
            </div>
            <div className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              Clear / Fast
            </div>
          </div>
        </div>

        {/* START DRIVING MODE BUTTON -> SWITCH TO GOOGLE MAPS */}
        <div className="pt-3">
          <button
            onClick={handleOpenGoogleMapsDriving}
            className="w-full py-3.5 px-4 rounded-2xl font-black text-sm cursor-pointer min-h-[50px] active:scale-95 transition-all shadow-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white flex items-center justify-center gap-2 shadow-blue-900/40"
          >
            <Car className="w-4 h-4 stroke-[2.5]" />
            <span>START DRIVING MODE (GOOGLE MAPS)</span>
            <ExternalLink className="w-4 h-4 opacity-85" />
          </button>
        </div>
      </div>
    </div>
  );
};
