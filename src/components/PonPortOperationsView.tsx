import React, { useState } from 'react';
import { SparklineChart } from './SparklineChart';
import { FatRecord, FAT_DATASET } from '../data/telecomDataset';
import { Zap, Activity, ChevronRight, Navigation, Server, Search } from 'lucide-react';
import { PonPortModelIcon } from './ModelIcons';

interface PonPortOperationsViewProps {
  onSelectFat: (fat: FatRecord) => void;
  onNavigateToFat: (fat: FatRecord) => void;
  onShowOnMap: (fat: FatRecord) => void;
  isLightMode?: boolean;
}

export const PonPortOperationsView: React.FC<PonPortOperationsViewProps> = ({
  onSelectFat,
  onNavigateToFat,
  onShowOnMap,
  isLightMode = false
}) => {
  const [selectedPort, setSelectedPort] = useState('PON-77');
  const [activeFilter, setActiveFilter] = useState<'ALL' | '16' | '8'>('ALL');

  const ponOperators = [
    { id: 'AC', name: 'AC PON-77', color: 'bg-emerald-500', occupancy: '900.7%', status: 'Operational', fatsCount: 14, speed: '10 Gbps XGS-PON' },
    { id: 'YD4', name: 'YD4-77', color: 'bg-cyan-500', occupancy: '8.0%', status: 'Nominal', fatsCount: 12, speed: '2.5 Gbps GPON' },
    { id: 'WA', name: 'WA-7 PON-77', color: 'bg-amber-500', occupancy: '10.0%', status: 'Active', fatsCount: 10, speed: '10 Gbps XGS-PON' },
    { id: 'P260', name: 'PON-260', color: 'bg-purple-500', occupancy: '9.2%', status: 'Active', fatsCount: 16, speed: '2.5 Gbps GPON' },
    { id: 'P380', name: 'PON-380', color: 'bg-indigo-500', occupancy: '7.1%', status: 'Active', fatsCount: 8, speed: '2.5 Gbps GPON' },
    { id: 'P99', name: 'PON-99 CORE', color: 'bg-teal-500', occupancy: '4.5%', status: 'Active', fatsCount: 14, speed: '10 Gbps XGS-PON' }
  ];

  return (
    <div className={`flex flex-col h-full overflow-y-auto pb-8 select-none transition-colors duration-200 ${
      isLightMode
        ? 'bg-[#f4f2ef] text-neutral-900'
        : 'bg-black text-neutral-100'
    }`}>
      {/* Top Header Card */}
      <div className="p-3.5 pb-1 max-w-lg mx-auto w-full">
        <div className={`rounded-3xl border p-3.5 shadow-xl backdrop-blur-2xl space-y-2.5 transition-all ${
          isLightMode ? 'bg-white/95 border-neutral-200 text-neutral-900 shadow-md' : 'bg-[#16191f]/95 border-[#262c36] text-white shadow-2xl'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#20242d] border border-[#2e3644] flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                <PonPortModelIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold tracking-tight">
                  PON Port Operations
                </h1>
                <p className="text-[11px] text-neutral-400">
                  Optical Line Terminal (OLT) Feeder Port Telemetry
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
              6 Active Ports
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 text-xs">
            {['PON-77', 'PON-260', 'PON-380', 'ALL PORTS'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPort(p)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedPort === p
                    ? 'bg-emerald-500 text-black font-bold shadow-md'
                    : isLightMode
                    ? 'bg-neutral-200 text-neutral-700 hover:text-black'
                    : 'bg-[#20242d] text-neutral-400 hover:text-white border border-[#2e3644]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3.5 space-y-3 max-w-lg mx-auto w-full">
        {/* Dual Live Sparkline Graphs (matching video 00:08 - 00:09) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Sparkline 1: Port Occupancy */}
          <div className={`rounded-3xl border p-3.5 shadow-xl backdrop-blur-2xl flex flex-col justify-between ${
            isLightMode ? 'bg-white border-neutral-200' : 'bg-[#16191f]/90 border-[#262c36]'
          }`}>
            <div>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-neutral-400">
                Port Occupancy
              </div>
              <div className="text-xl font-extrabold font-mono text-emerald-400 mt-0.5">
                900.7%
              </div>
            </div>
            <div className="pt-2">
              <SparklineChart
                dataPoints={[850, 870, 890, 900.7, 895, 900.7]}
                timeLabels={['12m', '6m', 'Now']}
                colorTheme="emerald"
                unit="%"
                height={55}
                isLive={true}
                liveIntervalMs={1600}
              />
            </div>
            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Optimal load</span>
            </div>
          </div>

          {/* Sparkline 2: Latency */}
          <div className={`rounded-3xl border p-3.5 shadow-xl backdrop-blur-2xl flex flex-col justify-between ${
            isLightMode ? 'bg-white border-neutral-200' : 'bg-[#16191f]/90 border-[#262c36]'
          }`}>
            <div>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-neutral-400">
                Port Latency
              </div>
              <div className="text-xl font-extrabold font-mono text-cyan-400 mt-0.5">
                0.0 ms
              </div>
            </div>
            <div className="pt-2">
              <SparklineChart
                dataPoints={[0.1, 0.0, 0.1, 0.0, 0.0, 0.0]}
                timeLabels={['12m', '6m', 'Now']}
                colorTheme="cyan"
                unit="ms"
                height={55}
                isLive={true}
                liveIntervalMs={1900}
              />
            </div>
            <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Ultra low jitter</span>
            </div>
          </div>
        </div>

        {/* Operators List (matching video 00:08 - 00:09) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-mono px-1">
            <span className="text-neutral-400 font-semibold">Active Port Operators</span>
            <span className="text-cyan-400 font-bold">See All ({ponOperators.length})</span>
          </div>

          {ponOperators.map((op) => (
            <div
              key={op.id}
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all hover:border-cyan-500/40 cursor-pointer shadow-md ${
                isLightMode
                  ? 'bg-white border-neutral-200 hover:bg-neutral-50'
                  : 'bg-[#16191f] border-[#262c36] hover:bg-[#1d222b]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${op.color} flex items-center justify-center text-black font-bold text-xs shadow-md shrink-0 font-mono`}>
                  {op.id}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white font-mono">{op.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-[#202738] text-neutral-300 border border-[#2c374d]">
                      {op.speed}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {op.fatsCount} Terminals linked · Status: <span className="text-emerald-400 font-semibold">{op.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {op.occupancy}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  Occupancy
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
