import React from 'react';
import { FAT_DATASET, FatRecord } from '../data/telecomDataset';
import { SparklineChart } from './SparklineChart';
import { MapPin, Navigation, Database, Network, ChevronRight, Activity, Zap, Layers } from 'lucide-react';

interface GraphicalDashboardProps {
  onSelectFat: (fat: FatRecord) => void;
  onStartNavigation: (fat: FatRecord) => void;
  onOpenGisMap: () => void;
  onOpenDirectory: () => void;
  onOpenHierarchy: () => void;
}

export const GraphicalDashboard: React.FC<GraphicalDashboardProps> = ({
  onSelectFat,
  onStartNavigation,
  onOpenGisMap,
  onOpenDirectory,
  onOpenHierarchy
}) => {
  const totalFats = FAT_DATASET.length;
  const totalCapacity = FAT_DATASET.reduce((sum, f) => sum + f.totalCap, 0);
  const total16P = FAT_DATASET.filter((f) => f.totalCap === 16).length;
  const total8P = FAT_DATASET.filter((f) => f.totalCap === 8).length;

  const cochinCount = FAT_DATASET.filter((f) => f.city === 'Cochin').length;
  const calicutCount = FAT_DATASET.filter((f) => f.city === 'Calicut').length;
  const tvmCount = FAT_DATASET.filter((f) => f.city === 'Thiruvananthapuram').length;

  // Sectors
  const sectors = [
    { name: 'Angamaly', rsu: '01I', count: 16, city: 'Cochin', sampleFatId: 'fat-5' },
    { name: 'Thrippunithura', rsu: '0I5', count: 21, city: 'Cochin', sampleFatId: 'fat-28' },
    { name: 'Infopark / Kochi', rsu: '0C0', count: 7, city: 'Cochin', sampleFatId: 'fat-21' },
    { name: 'Pettah', rsu: '0CI', count: 7, city: 'Trivandrum', sampleFatId: 'fat-49' },
    { name: 'Kozhikode', rsu: '08N', count: 4, city: 'Calicut', sampleFatId: 'fat-1' }
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-y-auto pb-4">
      <div className="p-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Welcome / Field Status Banner */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              GIS Telecom Operations
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Field Operations Dashboard
            </h1>
          </div>

          <button
            onClick={onOpenGisMap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 fill-black" />
            <span>Open Map</span>
          </button>
        </div>

        {/* PRIMARY GRAPHICAL METRIC CARDS (Matching user request) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: TOTAL FATS */}
          <div className="glass-card rounded-2xl p-3.5 border border-black shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs text-neutral-400 font-medium">
                <span>TOTAL FATS</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">+100% Active</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-white mt-1">
                {totalFats} <span className="text-xs text-neutral-400 font-sans font-normal">Units</span>
              </div>
            </div>
            <div className="mt-2">
              <SparklineChart
                dataPoints={[12, 24, 38, 45, 55]}
                timeLabels={['08N', '01I', '0C0', '0I5', '0CI']}
                colorTheme="cyan"
                unit="FATs"
                height={55}
              />
            </div>
          </div>

          {/* Card 2: TOTAL CAPACITY */}
          <div className="glass-card rounded-2xl p-3.5 border border-black shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs text-neutral-400 font-medium">
                <span>TOTAL PORTS</span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">648 Cap</span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-white mt-1">
                {totalCapacity} <span className="text-xs text-neutral-400 font-sans font-normal">Ports</span>
              </div>
            </div>
            <div className="mt-2">
              <SparklineChart
                dataPoints={[64, 180, 290, 480, 648]}
                timeLabels={['Q1', 'Q2', 'Q3', 'Q4', '2026']}
                colorTheme="emerald"
                unit="Ports"
                height={55}
              />
            </div>
          </div>
        </div>

        {/* SECONDARY GRAPHICAL BAR: City Geographic Distribution */}
        <div className="glass-card rounded-2xl p-4 border border-black shadow-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Geographic Sector Coverage
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              3 Telecom Circles
            </span>
          </div>

          {/* Segmented graphical bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-neutral-800">
            <div
              style={{ width: `${(cochinCount / totalFats) * 100}%` }}
              className="bg-cyan-500 h-full"
              title={`Cochin: ${cochinCount} FATs`}
            />
            <div
              style={{ width: `${(tvmCount / totalFats) * 100}%` }}
              className="bg-amber-500 h-full"
              title={`Trivandrum: ${tvmCount} FATs`}
            />
            <div
              style={{ width: `${(calicutCount / totalFats) * 100}%` }}
              className="bg-emerald-500 h-full"
              title={`Calicut: ${calicutCount} FATs`}
            />
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 shrink-0" />
              <div>
                <span className="text-white font-bold">{cochinCount}</span>
                <span className="text-[10px] text-neutral-400 block font-sans">Cochin (80%)</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shrink-0" />
              <div>
                <span className="text-white font-bold">{tvmCount}</span>
                <span className="text-[10px] text-neutral-400 block font-sans">Trivandrum</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" />
              <div>
                <span className="text-white font-bold">{calicutCount}</span>
                <span className="text-[10px] text-neutral-400 block font-sans">Calicut</span>
              </div>
            </div>
          </div>
        </div>

        {/* CAPACITY BREAKDOWN (16-Port vs 8-Port Split) */}
        <div className="glass-card rounded-2xl p-4 border border-black shadow-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Splitter Port Breakdown
            </span>
            <span className="text-xs font-mono text-cyan-400">
              55 Optical Enclosures
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-black">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
                <span>16-Port Enclosures</span>
                <span className="text-[10px] font-mono text-emerald-400">22%</span>
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {total16P} <span className="text-xs text-neutral-400 font-sans">FATs</span>
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">
                Total 192 PON drop ports
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/80 border border-black">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
                <span>8-Port Enclosures</span>
                <span className="text-[10px] font-mono text-cyan-400">78%</span>
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {total8P} <span className="text-xs text-neutral-400 font-sans">FATs</span>
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">
                Total 344 PON drop ports
              </div>
            </div>
          </div>
        </div>

        {/* SECTORS QUICK ACCESS JUMP */}
        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Field Operational Clusters
            </span>
            <button
              onClick={onOpenHierarchy}
              className="text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              View RSU Tree &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {sectors.map((sec) => (
              <div
                key={sec.name}
                onClick={() => {
                  const match = FAT_DATASET.find((f) => f.id === sec.sampleFatId) || FAT_DATASET[0];
                  onSelectFat(match);
                }}
                className="p-3 rounded-xl bg-neutral-900 border border-black hover:border-black flex items-center justify-between cursor-pointer transition-all shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-black flex items-center justify-center font-mono text-xs font-bold text-cyan-400">
                    {sec.rsu}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {sec.name} ({sec.city})
                    </h4>
                    <span className="text-[10px] font-mono text-neutral-400 font-mono">
                      RSU {sec.rsu} · {sec.count} FAT Boxes Provisioned
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-neutral-400">
                  <span className="text-xs font-mono text-emerald-400">{sec.count} FATs</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT / FEATURED FAT BOXES FOR DIRECT NAVIGATION */}
        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Inbuilt Navigation
            </span>
            <button
              onClick={onOpenDirectory}
              className="text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              See All 55 FATs &rarr;
            </button>
          </div>

          <div className="space-y-2">
            {FAT_DATASET.slice(0, 4).map((fat) => (
              <div
                key={fat.id}
                className="p-3 rounded-xl bg-neutral-900 border border-black flex items-center justify-between shadow-sm"
              >
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => onSelectFat(fat)}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {fat.fatId}
                    </span>
                    <span className="text-[10px] font-mono px-1 rounded bg-neutral-800 text-emerald-400">
                      {fat.ponPort}
                    </span>
                  </div>
                  <div className="text-xs text-white font-medium truncate max-w-[200px] mt-0.5">
                    {fat.neAddress} · {fat.locality}
                  </div>
                </div>

                <button
                  onClick={() => onStartNavigation(fat)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg liquid-glass-primary font-bold text-xs cursor-pointer shadow-sm transition-all active:scale-95"
                >
                  <Navigation className="w-3 h-3 fill-white text-white" />
                  <span>Navigate</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
