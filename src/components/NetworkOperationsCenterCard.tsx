import React from 'react';
import { Activity, Server, Radio, Box, Zap } from 'lucide-react';

interface NetworkOperationsCenterCardProps {
  onOpenGisMap: () => void;
  onOpenPonTrunks: () => void;
  onOpenCentralHubs: () => void;
  onOpenFatTerminals: () => void;
  isLightMode?: boolean;
}

export const NetworkOperationsCenterCard: React.FC<NetworkOperationsCenterCardProps> = ({
  onOpenGisMap,
  onOpenPonTrunks,
  onOpenCentralHubs,
  onOpenFatTerminals,
  isLightMode = false
}) => {
  return (
    <div className={`rounded-3xl p-4 shadow-md backdrop-blur-2xl select-none space-y-3.5 transition-colors duration-200 border ${
      isLightMode
        ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/5'
        : 'bg-[#141620]/90 border-white/10 text-white shadow-2xl'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* 3D Cyan Pulse Icon */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/25">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h2 className={`text-xs font-black tracking-wider uppercase font-mono ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              Network Operations Center
            </h2>
            <div className={`text-[10px] font-mono ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Real-time Core Topology
            </div>
          </div>
        </div>

        {/* Right Badge: 56k Active Nodes */}
        <div className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-extrabold border ${
          isLightMode
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-emerald-950/70 border-emerald-800/40 text-emerald-300'
        }`}>
          56k Active Nodes
        </div>
      </div>

      {/* 2x2 Grid Tiles with 3D Colourful Icons - NO BLACK BORDERS */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Tile 1: RSU GIS Map - 3D Emerald */}
        <div
          onClick={onOpenGisMap}
          className={`rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-all shadow-sm active:scale-[0.98] group border ${
            isLightMode
              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10'
          }`}
        >
          <div className="icon-3d-box icon-3d-rsu w-10 h-10 shrink-0 text-white shadow-md group-hover:scale-105 transition-transform">
            <Server className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-bold tracking-tight truncate ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              RSU GIS Map
            </div>
            <div className={`text-[11px] truncate mt-0.5 ${
              isLightMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Topology &amp; GPS
            </div>
          </div>
        </div>

        {/* Tile 2: PON Trunks - 3D Blue/Cyan */}
        <div
          onClick={onOpenPonTrunks}
          className={`rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-all shadow-sm active:scale-[0.98] group border ${
            isLightMode
              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10'
          }`}
        >
          <div className="icon-3d-box icon-3d-pon w-10 h-10 shrink-0 text-white shadow-md group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-bold tracking-tight truncate ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              PON Trunks
            </div>
            <div className={`text-[11px] truncate mt-0.5 ${
              isLightMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Line loads &amp; SFP
            </div>
          </div>
        </div>

        {/* Tile 3: Central Hubs - 3D Purple */}
        <div
          onClick={onOpenCentralHubs}
          className={`rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-all shadow-sm active:scale-[0.98] group border ${
            isLightMode
              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10'
          }`}
        >
          <div className="icon-3d-box icon-3d-hub w-10 h-10 shrink-0 text-white shadow-md group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-bold tracking-tight truncate ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              Central Hubs
            </div>
            <div className={`text-[11px] truncate mt-0.5 ${
              isLightMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              OLT exchanges
            </div>
          </div>
        </div>

        {/* Tile 4: FAT Terminals - 3D Flame/Amber */}
        <div
          onClick={onOpenFatTerminals}
          className={`rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-all shadow-sm active:scale-[0.98] group border ${
            isLightMode
              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10'
          }`}
        >
          <div className="icon-3d-box icon-3d-fat w-10 h-10 shrink-0 text-white shadow-md group-hover:scale-105 transition-transform">
            <Box className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-bold tracking-tight truncate ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              FAT Terminals
            </div>
            <div className={`text-[11px] truncate mt-0.5 ${
              isLightMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Field drops
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
