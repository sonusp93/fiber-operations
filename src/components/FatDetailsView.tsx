import React, { useState } from 'react';
import { FatNode } from '../types/telecom';
import { ChevronLeft, MapPin, Activity, CheckCircle2, RefreshCw, Zap } from 'lucide-react';

interface FatDetailsViewProps {
  fat: FatNode;
  onBack: () => void;
  onLocateOnMap: (fat: FatNode) => void;
}

export const FatDetailsView: React.FC<FatDetailsViewProps> = ({
  fat,
  onBack,
  onLocateOnMap
}) => {
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleRunOtdrTest = () => {
    setIsRunningTest(true);
    setTestResult(null);
    setTimeout(() => {
      setIsRunningTest(false);
      setTestResult(`OTDR Pass: Attenuation 0.22 dB/km, Event @ 842m (Splice loss 0.03 dB), Return Loss -54.2 dB`);
    }, 1200);
  };

  const specsList = [
    { label: 'Total Name', value: '15.00 MFB', sub: 'NKA 02/09/2026' },
    { label: 'FAT ID', value: fat.code, sub: fat.createdDate },
    { label: 'Parameter Stamp', value: '2026/10/20 PM', sub: '0/0 mm' },
    { label: 'Total Type', value: fat.type, sub: '15/04/2024' },
    { label: 'Total Connection', value: fat.totalConnection, sub: 'Concrete' },
    { label: 'Total Taptol / Status', value: fat.statusText, sub: 'Now Working', isStatus: true },
    { label: 'Total Trax / Parameter', value: fat.totalParameter, sub: 'Anewman' },
    { label: 'Total Recurrent', value: '100%', sub: 'Naye' },
    { label: 'Coordinates', value: `${fat.coordinates.lat.toFixed(4)}°N, ${fat.coordinates.lng.toFixed(4)}°E`, sub: 'WGS84 GPS' },
    { label: 'Splice Type', value: fat.spliceType, sub: 'Core Alignment' },
    { label: 'Security Hash', value: fat.securityHash, sub: 'Encrypted Latch' },
    { label: 'Pole / Cabinet Unit', value: fat.poleUnit, sub: 'Distribution Sector' },
    { label: 'Network Address', value: fat.networkAddress, sub: 'Optical Feeder' },
    { label: 'Content Address', value: fat.contentAddress, sub: 'Backhaul Link' }
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-y-auto pb-32">
      {/* Top Bar matching video 00:05 */}
      <div className="sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-md px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm font-medium min-h-[44px] cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <span className="text-xs font-mono text-neutral-400">
          ID: {fat.code}
        </span>

        <button
          onClick={() => onLocateOnMap(fat)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-xs font-semibold hover:bg-cyan-900/60 cursor-pointer min-h-[44px]"
        >
          <MapPin className="w-3.5 h-3.5" />
          Map
        </button>
      </div>

      {/* Main Container */}
      <div className="px-5 py-4 space-y-5 max-w-lg mx-auto w-full">
        {/* Title & Status */}
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-neutral-400 font-mono tracking-wider uppercase">
              Terminal Node Specifications
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              FAT Details
            </h1>
            <div className="text-xs text-neutral-400 mt-1">
              {fat.name} · {fat.poleUnit}
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {fat.statusText}
          </div>
        </div>

        {/* Diagnostic Quick Bar */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-neutral-900/80 border border-white/5">
          <div className="text-center p-2 rounded-xl bg-neutral-800/40">
            <div className="text-[10px] text-neutral-400 font-medium">PON Port</div>
            <div className="text-sm font-mono font-bold text-cyan-400 mt-0.5">
              {fat.ponPort}
            </div>
          </div>
          <div className="text-center p-2 rounded-xl bg-neutral-800/40">
            <div className="text-[10px] text-neutral-400 font-medium">Port Usage</div>
            <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
              {fat.portsUsed} / {fat.portsTotal}
            </div>
          </div>
          <div className="text-center p-2 rounded-xl bg-neutral-800/40">
            <div className="text-[10px] text-neutral-400 font-medium">Backhaul Ring</div>
            <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">
              11.74 HUB
            </div>
          </div>
        </div>

        {/* Specification Rows Table (matching video 00:05 & 00:06) */}
        <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800/80 divide-y divide-neutral-800/60 overflow-hidden shadow-lg">
          {specsList.map((row, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center px-4 py-3 hover:bg-neutral-800/30 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400 font-medium">
                  {row.label}
                </span>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {row.sub}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-mono font-semibold ${
                    row.isStatus ? 'text-emerald-400' : 'text-neutral-200'
                  }`}
                >
                  {row.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Live OTDR Diagnostic Action */}
        <div className="space-y-3 pt-2">
          <div className="flex gap-2">
            <button
              onClick={handleRunOtdrTest}
              disabled={isRunningTest}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium text-xs shadow-md shadow-cyan-950/40 transition-all active:scale-[0.98] cursor-pointer min-h-[44px]"
            >
              {isRunningTest ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Testing Reflectometer...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  Run OTDR Splice Test
                </>
              )}
            </button>

            <button
              onClick={() => onLocateOnMap(fat)}
              className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs border border-white/10 active:scale-[0.98] cursor-pointer min-h-[44px]"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Trace Route
            </button>
          </div>

          {testResult && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Reflectometer Diagnostics Optimal
              </div>
              <p className="font-mono text-[11px] text-emerald-200/90 leading-relaxed">
                {testResult}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
