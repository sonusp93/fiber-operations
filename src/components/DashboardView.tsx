import React, { useState } from 'react';
import { METRICS_DATA, FAT_NODES } from '../data/mockTelecomData';
import { FAT_DATASET, FatRecord } from '../data/telecomDataset';
import { SparklineChart } from './SparklineChart';
import { VideoTabType } from './VideoBottomNavPill';
import { Search as SearchIcon, Bell, ChevronRight, ArrowUpRight, Flame, Radio, Network, Sparkles as LucideSparkles, Layers } from 'lucide-react';

const Sparkles = LucideSparkles || ((props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
));

interface DashboardViewProps {
  onOpenSearch: () => void;
  onSelectFat: (fat: FatRecord) => void;
  onSwitchTab: (tab: VideoTabType) => void;
  isLightMode?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenSearch,
  onSelectFat,
  onSwitchTab,
  isLightMode = false
}) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'FAT' | 'HUB' | 'RSU' | 'PON'>('ALL');
  const [bellActive, setBellActive] = useState(true);

  return (
    <div className={`flex flex-col h-full overflow-y-auto pb-32 select-none transition-colors duration-200 ${
      isLightMode
        ? 'bg-[#f4f2ef] text-neutral-900'
        : 'bg-black text-neutral-100'
    }`}>
      {/* Top Mobile Bar */}
      <div className={`sticky top-0 z-20 backdrop-blur-md px-5 pt-3 pb-3 border-b flex items-center justify-between ${
        isLightMode ? 'bg-white/90 border-neutral-200' : 'bg-black/90 border-white/10'
      }`}>
        <div>
          <div className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider uppercase">
            Optical FTTH Network
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBellActive(!bellActive)}
            className={`p-2 rounded-full border relative cursor-pointer ${
              isLightMode ? 'bg-neutral-100 border-neutral-200 text-neutral-700' : 'bg-neutral-900 border-white/10 text-neutral-300 hover:text-white'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {bellActive && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-neutral-950" />
            )}
          </button>

          <div
            onClick={() => onSwitchTab('FAT')}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/15 flex items-center justify-center font-mono text-xs font-bold text-cyan-300 shadow-md cursor-pointer"
          >
            VK
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-5 max-w-lg mx-auto w-full">
        {/* Quick Sector Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {(['ALL', 'FAT', 'HUB', 'RSU', 'PON'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                if (cat === 'FAT') onSwitchTab('FAT');
                else if (cat === 'HUB') onSwitchTab('HUB');
                else if (cat === 'RSU') onSwitchTab('RSU');
                else if (cat === 'PON') onSwitchTab('PON');
              }}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer min-h-[36px] ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                  : isLightMode
                  ? 'bg-white text-neutral-700 hover:bg-neutral-100 border border-black'
                  : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border border-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Primary Metric Cards with Glowing Sparklines */}
        <div className="space-y-4">
          {METRICS_DATA.map((metric) => (
            <div
              key={metric.id}
              className={`rounded-2xl p-4 border border-black transition-all shadow-xl ${
                isLightMode
                  ? 'bg-white'
                  : 'bg-[#16191f]/90'
              }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-neutral-400 tracking-wider">
                  {metric.title}
                </span>

                <div className="flex items-center gap-1 text-xs font-mono font-semibold text-emerald-400">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{metric.changeRate}</span>
                </div>
              </div>

              {/* Metric Value */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-3xl font-extrabold tracking-tight font-mono ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>
                  {metric.value}
                </span>
                <span className="text-xs font-semibold text-neutral-400">
                  {metric.unit}
                </span>
              </div>

              {/* Sparkline Canvas Chart */}
              <SparklineChart
                dataPoints={metric.dataPoints}
                timeLabels={metric.timeLabels}
                colorTheme={metric.colorTheme}
                unit={metric.unit}
                height={70}
              />
            </div>
          ))}
        </div>

        {/* Network Operations Section (matching video 00:01 & 00:07) */}
        <div>
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-sm font-bold text-white tracking-tight">
              Network Operations
            </h2>
            <button
              onClick={() => onSwitchTab('HUB')}
              className="text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              See All GIS Nodes
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Live nodes from telecom dataset */}
            <div
              onClick={() => onSelectFat(FAT_DATASET[0])}
              className={`flex items-center justify-between p-3.5 rounded-2xl border border-black cursor-pointer transition-all shadow-md active:scale-[0.99] ${
                isLightMode ? 'bg-white hover:bg-neutral-50' : 'bg-neutral-900/80 hover:bg-neutral-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-black flex items-center justify-center text-cyan-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-2">
                    FAT {FAT_DATASET[0].fatId} ({FAT_DATASET[0].locality})
                    <span className="text-[10px] font-mono text-cyan-400">
                      {FAT_DATASET[0].ponPort}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {FAT_DATASET[0].totalCap}-Port · {FAT_DATASET[0].fatLat.toFixed(4)} / {FAT_DATASET[0].fatLog.toFixed(4)} · Active
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-emerald-400">
                    HUB {FAT_DATASET[0].hub}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    RSU {FAT_DATASET[0].rsu}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </div>
            </div>

            <div
              onClick={() => onSelectFat(FAT_DATASET[1])}
              className={`flex items-center justify-between p-3.5 rounded-2xl border border-black cursor-pointer transition-all shadow-md active:scale-[0.99] ${
                isLightMode ? 'bg-white hover:bg-neutral-50' : 'bg-neutral-900/80 hover:bg-neutral-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-950/70 border border-black flex items-center justify-center text-amber-400">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-2">
                    FAT {FAT_DATASET[1].fatId} ({FAT_DATASET[1].locality})
                    <span className="text-[10px] font-mono text-emerald-400">
                      {FAT_DATASET[1].ponPort}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {FAT_DATASET[1].neAddress} · {FAT_DATASET[1].city}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-amber-400">
                    HUB {FAT_DATASET[1].hub}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    RSU {FAT_DATASET[1].rsu}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </div>
            </div>

            <div
              onClick={() => onSelectFat(FAT_DATASET[2])}
              className={`flex items-center justify-between p-3.5 rounded-2xl border border-black cursor-pointer transition-all shadow-md active:scale-[0.99] ${
                isLightMode ? 'bg-white hover:bg-neutral-50' : 'bg-neutral-900/80 hover:bg-neutral-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-950/70 border border-black flex items-center justify-center text-blue-400">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-2">
                    FAT {FAT_DATASET[2].fatId} ({FAT_DATASET[2].locality})
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {FAT_DATASET[2].totalCap}-Port Mini · {FAT_DATASET[2].city}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-cyan-400">
                    HUB {FAT_DATASET[2].hub}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400">
                    RSU {FAT_DATASET[2].rsu}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
