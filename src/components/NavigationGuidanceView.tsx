import React, { useState, useEffect } from 'react';
import { FatRecord, FAT_DATASET, calculateGpsDistanceMeters, calculateBearingDegrees, getCompassHeading } from '../data/telecomDataset';
import { Navigation, ExternalLink, Compass, MapPin, CheckCircle2, ChevronRight, Copy, Check, Crosshair } from 'lucide-react';

interface NavigationGuidanceViewProps {
  activeFat: FatRecord | null;
  onSelectAnotherFat: (fat: FatRecord) => void;
  onViewOnMap: (fat: FatRecord) => void;
}

export const NavigationGuidanceView: React.FC<NavigationGuidanceViewProps> = ({
  activeFat: initialFat,
  onSelectAnotherFat,
  onViewOnMap
}) => {
  const [targetFat, setTargetFat] = useState<FatRecord>(initialFat || FAT_DATASET[4]); // default to 01I040207 Angamaly
  
  // Field Employee GPS (simulated near target)
  const [employeeGps, setEmployeeGps] = useState<{ lat: number; lng: number }>({
    lat: targetFat.rsuLat + 0.003,
    lng: targetFat.rsuLog + 0.002
  });

  const [copied, setCopied] = useState(false);
  const [isSimulatingMove, setIsSimulatingMove] = useState(false);

  // Sync if prop changes
  useEffect(() => {
    if (initialFat) {
      setTargetFat(initialFat);
    }
  }, [initialFat]);

  // Real-time navigation calculations
  const distanceMeters = calculateGpsDistanceMeters(
    employeeGps.lat,
    employeeGps.lng,
    targetFat.fatLat,
    targetFat.fatLog
  );

  const bearing = calculateBearingDegrees(
    employeeGps.lat,
    employeeGps.lng,
    targetFat.fatLat,
    targetFat.fatLog
  );

  const heading = getCompassHeading(bearing);
  const walkingMinutes = Math.max(1, Math.round(distanceMeters / 75));
  const bikeMinutes = Math.max(1, Math.round(distanceMeters / 250));

  // Simulate stepping closer to target for field test
  const handleStepCloser = () => {
    setIsSimulatingMove(true);
    setEmployeeGps((prev) => ({
      lat: prev.lat + (targetFat.fatLat - prev.lat) * 0.45,
      lng: prev.lng + (targetFat.fatLog - prev.lng) * 0.45
    }));
    setTimeout(() => setIsSimulatingMove(false), 300);
  };

  const handleResetPosition = () => {
    setEmployeeGps({
      lat: targetFat.rsuLat + 0.004,
      lng: targetFat.rsuLog + 0.003
    });
  };

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${targetFat.fatLat}, ${targetFat.fatLog}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openGoogleMapsDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${targetFat.fatLat},${targetFat.fatLog}&travelmode=two-wheeler`;
    window.open(url, '_blank');
  };

  // Turn by turn navigation steps
  const routeSteps = [
    {
      title: `Proceed ${heading} toward ${targetFat.locality}`,
      detail: `Initial direction ${bearing}° from current field position (${distanceMeters < 1000 ? `${distanceMeters}m` : `${(distanceMeters / 1000).toFixed(1)}km`})`,
      done: distanceMeters < 500
    },
    {
      title: `Follow Optical Feeder from HUB ${targetFat.hub}`,
      detail: `Backhaul origin coordinates: ${targetFat.hubLat.toFixed(5)}, ${targetFat.hubLog.toFixed(5)}`,
      done: distanceMeters < 200
    },
    {
      title: `Arrive at Location: ${targetFat.neAddress}`,
      detail: `Search outdoor pole or building entrance at ${targetFat.locality}`,
      done: distanceMeters < 50
    },
    {
      title: `Verify FAT Box & PON Port`,
      detail: `Confirm physical label: FAT ${targetFat.fatId} · Port: ${targetFat.ponPort} (${targetFat.totalCap} Ports)`,
      done: distanceMeters < 15
    }
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-y-auto">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 p-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono text-emerald-400 font-bold tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Active Field Navigation
          </div>
          <h1 className="text-base font-bold text-white tracking-tight mt-0.5">
            Target FAT: {targetFat.fatId}
          </h1>
        </div>

        {/* Change Target dropdown */}
        <select
          value={targetFat.id}
          onChange={(e) => {
            const found = FAT_DATASET.find((f) => f.id === e.target.value);
            if (found) {
              setTargetFat(found);
              setEmployeeGps({ lat: found.rsuLat + 0.003, lng: found.rsuLog + 0.002 });
              onSelectAnotherFat(found);
            }
          }}
          className="bg-neutral-800 border border-neutral-700 text-xs text-cyan-300 font-mono rounded-xl px-2.5 py-1.5 focus:outline-none"
        >
          {FAT_DATASET.map((f) => (
            <option key={f.id} value={f.id}>
              {f.fatId} ({f.locality})
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* BIG COMPASS HUD & DISTANCE CALLOUT */}
        <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-5 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
          {/* Geodesic Distance Big Display */}
          <div className="text-4xl font-extrabold text-white font-mono tracking-tight">
            {distanceMeters < 1000 ? `${distanceMeters}` : `${(distanceMeters / 1000).toFixed(2)}`}
            <span className="text-base text-cyan-400 ml-1.5 font-sans">
              {distanceMeters < 1000 ? 'meters' : 'km'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1 font-mono">
            <span>Bearing: <strong className="text-white">{bearing}° {heading}</strong></span>
            <span>·</span>
            <span>ETA: <strong className="text-emerald-400">{walkingMinutes}m walk / {bikeMinutes}m bike</strong></span>
          </div>

          {/* Graphical Compass Ring */}
          <div className="relative w-36 h-36 my-4 flex items-center justify-center select-none">
            {/* Outer dial */}
            <div className="absolute inset-0 rounded-full border-2 border-neutral-800 flex items-center justify-center">
              <span className="absolute top-1 text-[10px] font-mono font-bold text-cyan-400">N</span>
              <span className="absolute right-1 text-[10px] font-mono font-bold text-neutral-500">E</span>
              <span className="absolute bottom-1 text-[10px] font-mono font-bold text-neutral-500">S</span>
              <span className="absolute left-1 text-[10px] font-mono font-bold text-neutral-500">W</span>
            </div>

            {/* Rotating Needle pointing towards bearing */}
            <div
              className="relative w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
              style={{ transform: `rotate(${bearing}deg)` }}
            >
              {/* Pointer Arrow */}
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[44px] border-b-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] -translate-y-6" />
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[34px] border-t-neutral-600 translate-y-6" />
              {/* Center Pivot */}
              <div className="absolute w-5 h-5 rounded-full bg-neutral-900 border-2 border-white shadow-md flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            </div>
          </div>

          {/* Quick Simulation controls for field test */}
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handleStepCloser}
              disabled={distanceMeters <= 5}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate GPS Move</span>
            </button>
            <button
              onClick={handleResetPosition}
              className="px-2.5 py-1.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-[11px] text-neutral-400 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* PRIMARY ACTION: OPEN IN GOOGLE MAPS APP */}
        <button
          onClick={openGoogleMapsDirections}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-neutral-950 font-bold text-sm shadow-xl shadow-cyan-950/40 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
        >
          <Navigation className="w-4 h-4 fill-black" />
          <span>Launch Google Maps Driving / Walking Directions</span>
          <ExternalLink className="w-4 h-4 ml-1" />
        </button>

        {/* TARGET SPECIFICATION CARD (Every detail from user's image) */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                Destination Node
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">
                {targetFat.neAddress}
              </h2>
              <div className="text-xs text-neutral-400">
                {targetFat.locality} · {targetFat.city}
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 px-2 py-0.5 rounded">
              {targetFat.totalCap} Ports
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block font-sans">PON PORT</span>
              <span className="text-cyan-300 font-bold">{targetFat.ponPort}</span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block font-sans">AFFILIATED PON</span>
              <span className="text-white truncate block">{targetFat.affiliatedPon}</span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block font-sans">HUB ID</span>
              <span className="text-white">{targetFat.hub}</span>
            </div>
            <div className="p-2 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <span className="text-[10px] text-neutral-400 block font-sans">RSU ID</span>
              <span className="text-white">RSU {targetFat.rsu}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs font-mono">
            <span className="text-neutral-400">
              FAT GPS: {targetFat.fatLat.toFixed(5)}, {targetFat.fatLog.toFixed(5)}
            </span>
            <button
              onClick={handleCopyCoords}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* STEP-BY-STEP FIELD NAVIGATION GUIDANCE */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 shadow-lg">
          <div className="text-xs font-bold text-white uppercase tracking-wider">
            Field Employee Route Steps
          </div>

          <div className="space-y-2.5">
            {routeSteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all ${
                  step.done
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                    : idx === 0
                    ? 'bg-cyan-950/30 border-cyan-800/40 text-cyan-200'
                    : 'bg-neutral-950/40 border-neutral-800/60 text-neutral-400'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {step.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-current text-[10px] font-mono flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 font-sans leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View on GIS Map Link */}
        <button
          onClick={() => onViewOnMap(targetFat)}
          className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[42px]"
        >
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>Switch to Interactive GIS Map for this FAT</span>
        </button>
      </div>
    </div>
  );
};
