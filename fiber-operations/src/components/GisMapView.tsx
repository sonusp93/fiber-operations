import React, { useState } from 'react';
import { FAT_NODES, FIBER_CABLES } from '../data/mockTelecomData';
import { FatNode } from '../types/telecom';
import { ZoomIn, ZoomOut, Compass, Navigation, Layers, ChevronRight, Activity, X } from 'lucide-react';

interface GisMapViewProps {
  selectedFatId?: string | null;
  onSelectFat: (fat: FatNode) => void;
}

export const GisMapView: React.FC<GisMapViewProps> = ({
  selectedFatId,
  onSelectFat
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeInspectNode, setActiveInspectNode] = useState<FatNode | null>(
    FAT_NODES.find((f) => f.id === selectedFatId) || null
  );
  const [mapLayer, setMapLayer] = useState<'trunks' | 'all' | 'heatmap'>('trunks');

  // Handle map panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Node position map helper (matching coordinates to SVG space)
  const getNodeCoordinates = (nodeId: string): { x: number; y: number } => {
    switch (nodeId) {
      case 'fat-04': // Detskoe Servisovt
        return { x: 240, y: 90 };
      case 'fat-05': // Samsun Servirov
        return { x: 320, y: 210 };
      case 'fat-01': // VKA Central 01
        return { x: 190, y: 290 };
      case 'fat-03': // Bumhvad Cianbot
        return { x: 110, y: 380 };
      case 'fat-02': // VKA FAT ASUS West
        return { x: 120, y: 220 };
      case 'fat-06': // Fateshory
        return { x: 220, y: 420 };
      default:
        return { x: 190, y: 290 };
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0c0f17] overflow-hidden select-none flex flex-col">
      {/* Top Search / Filter Bar over Map */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="glass-card rounded-2xl px-3.5 py-2.5 flex items-center gap-2 pointer-events-auto border border-white/10 shadow-xl max-w-xs w-full">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-semibold text-white tracking-tight">
            LocFinder GIS Network
          </span>
          <span className="text-[10px] font-mono text-neutral-400 ml-auto">
            Live OTDR
          </span>
        </div>

        {/* Map Layers toggle */}
        <div className="flex gap-1.5 pointer-events-auto">
          <button
            onClick={() => setMapLayer(mapLayer === 'trunks' ? 'all' : 'trunks')}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
              mapLayer === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                : 'bg-neutral-900/80 text-neutral-300 border-white/10 hover:bg-neutral-800'
            }`}
            title="Layer filter"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 420 520"
          preserveAspectRatio="xMidYMid slice"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
        >
          <defs>
            {/* Map styling patterns */}
            <linearGradient id="fiberGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            <filter id="neonPulse" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Map Water Body (Matching video left curve) */}
          <path
            d="M 0,0 L 50,0 Q 80,120 40,240 T 15,520 L 0,520 Z"
            fill="#060910"
            stroke="#161c29"
            strokeWidth="1.5"
          />

          {/* Dark City Road Network (Authentic CartoDB Dark style) */}
          {/* Arterial Highways */}
          <path d="M 0,140 Q 150,150 420,110" stroke="#1d2433" strokeWidth="6" fill="none" />
          <path d="M 170,0 Q 190,260 260,520" stroke="#1d2433" strokeWidth="5.5" fill="none" />
          <path d="M 0,330 L 420,270" stroke="#1d2433" strokeWidth="5" fill="none" />
          <path d="M 280,0 L 360,520" stroke="#1d2433" strokeWidth="4" fill="none" />

          {/* Secondary Urban Streets Grid */}
          <path d="M 60,60 L 420,60" stroke="#151b27" strokeWidth="2" strokeDasharray="4 3" fill="none" />
          <path d="M 40,200 L 420,200" stroke="#151b27" strokeWidth="2" fill="none" />
          <path d="M 40,240 L 420,240" stroke="#151b27" strokeWidth="1.5" fill="none" />
          <path d="M 30,400 L 420,400" stroke="#151b27" strokeWidth="2" fill="none" />
          <path d="M 30,460 L 420,460" stroke="#151b27" strokeWidth="1.5" fill="none" />

          <path d="M 100,0 L 100,520" stroke="#151b27" strokeWidth="1.5" fill="none" />
          <path d="M 140,0 L 140,520" stroke="#151b27" strokeWidth="1.5" fill="none" />
          <path d="M 220,0 L 220,520" stroke="#151b27" strokeWidth="1.5" fill="none" />
          <path d="M 300,0 L 300,520" stroke="#151b27" strokeWidth="1.5" fill="none" />

          {/* City District Road Labels */}
          <text x="70" y="132" fill="#3b4861" fontSize="7" fontWeight="bold" letterSpacing="1">
            PE-14 HIGHWAY
          </text>
          <text x="270" y="32" fill="#3b4861" fontSize="7" fontWeight="bold" letterSpacing="1">
            SECTOR 4 RING
          </text>
          <text x="32" y="375" fill="#3b4861" fontSize="6.5">
            DOWNTOWN SOUTH
          </text>

          {/* FIBER CABLE TRUNK ROUTES (Matching video 00:06 & 00:08) */}
          {FIBER_CABLES.map((cable) => {
            const pathData = cable.points.reduce((acc, pt, i) => {
              return i === 0 ? `M ${pt[0]} ${pt[1]}` : `${acc} L ${pt[0]} ${pt[1]}`;
            }, '');

            return (
              <g key={cable.id}>
                {/* Wide Neon Glow Backdrop */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={cable.status === 'degraded' ? '#f59e0b' : '#06b6d4'}
                  strokeWidth="8"
                  strokeOpacity="0.22"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Primary Fiber Conduit Core */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={cable.status === 'degraded' ? '#fbbf24' : '#38bdf8'}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Animated Optical Pulse along the fiber line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.2"
                  strokeDasharray="6 30"
                  className="animate-optical-pulse"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* Distance Callout Labels on Fiber Lines (Matching video 00:06) */}
          {/* Label 1: Detskoe Servisovt 23.90 Mmi */}
          <g transform="translate(225, 140)">
            <rect
              x="-48"
              y="-10"
              width="96"
              height="20"
              rx="10"
              fill="#111622"
              stroke="#06b6d4"
              strokeWidth="1.2"
              filter="drop-shadow(0 2px 5px rgba(0,0,0,0.7))"
            />
            <text
              x="0"
              y="3"
              fill="#ffffff"
              fontSize="7.5"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              23.90 Mmi
            </text>
          </g>

          {/* Label 2: Samsun Servirov 23 11 00 ml */}
          <g transform="translate(325, 175)">
            <rect
              x="-50"
              y="-10"
              width="100"
              height="20"
              rx="10"
              fill="#111622"
              stroke="#38bdf8"
              strokeWidth="1.2"
              filter="drop-shadow(0 2px 5px rgba(0,0,0,0.7))"
            />
            <text
              x="0"
              y="3"
              fill="#ffffff"
              fontSize="7.5"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              23 11 00 ml
            </text>
          </g>

          {/* Label 3: Bumhvad Cianbot 23.5M */}
          <g transform="translate(135, 345)">
            <rect
              x="-44"
              y="-10"
              width="88"
              height="20"
              rx="10"
              fill="#111622"
              stroke="#06b6d4"
              strokeWidth="1.2"
              filter="drop-shadow(0 2px 5px rgba(0,0,0,0.7))"
            />
            <text
              x="0"
              y="3"
              fill="#ffffff"
              fontSize="7.5"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              23.5M
            </text>
          </g>

          {/* INTERACTIVE TERMINAL NODES (FAT / RSU / HUB) */}
          {FAT_NODES.map((node) => {
            const pos = getNodeCoordinates(node.id);
            const isSelected = activeInspectNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer"
                onClick={() => setActiveInspectNode(node)}
              >
                {/* Active Ripple Animation */}
                <circle
                  r={isSelected ? '24' : '16'}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1"
                  strokeOpacity={isSelected ? '0.6' : '0.2'}
                  className="animate-ping"
                />

                {/* Outer Glass Ring */}
                <circle
                  r={isSelected ? '14' : '10'}
                  fill="#0c101a"
                  stroke={isSelected ? '#38bdf8' : '#06b6d4'}
                  strokeWidth="2.5"
                  filter="drop-shadow(0 0 6px rgba(6,182,212,0.6))"
                />

                {/* Center Core Dot */}
                <circle
                  r={isSelected ? '6' : '4'}
                  fill={node.status === 'warning' ? '#f59e0b' : '#38bdf8'}
                />

                {/* Node Text Callout */}
                <g transform="translate(0, 20)">
                  <rect
                    x="-38"
                    y="-8"
                    width="76"
                    height="16"
                    rx="8"
                    fill="#0a0d14"
                    stroke={isSelected ? '#38bdf8' : '#1e2638'}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3"
                    fill="#ffffff"
                    fontSize="7"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {node.code}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Map Control Buttons (Zoom, Compass, Reset) */}
        <div className="absolute right-4 bottom-28 z-20 flex flex-col gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.3, 2.5))}
            className="w-10 h-10 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-white border border-white/10 flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <ZoomIn className="w-5 h-5 text-neutral-300" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.3, 0.7))}
            className="w-10 h-10 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-white border border-white/10 flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <ZoomOut className="w-5 h-5 text-neutral-300" />
          </button>
          <button
            onClick={resetView}
            className="w-10 h-10 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-cyan-400 border border-white/10 flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer"
            title="Recenter"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>

        {/* Google / Mapbox Watermark attribution style (matching video 00:06 & 00:08) */}
        <div className="absolute left-4 bottom-24 z-10 flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
          <span className="font-semibold text-neutral-400">Google</span>
          <span>© 2026 Telecom VKA Map</span>
        </div>
      </div>

      {/* Selected Node Inspection Card Drawer (slides up from bottom) */}
      {activeInspectNode && (
        <div className="absolute bottom-20 left-3 right-3 z-30 animate-in fade-in slide-in-from-bottom duration-200">
          <div className="glass-card rounded-2xl p-4 border border-cyan-500/30 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-semibold">
                    {activeInspectNode.code}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {activeInspectNode.statusText}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">
                  {activeInspectNode.name}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                  {activeInspectNode.description}
                </p>
              </div>

              <button
                onClick={() => setActiveInspectNode(null)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5 text-center">
              <div className="bg-neutral-800/40 p-1.5 rounded-lg">
                <div className="text-[10px] text-neutral-400">Power</div>
                <div className="text-xs font-mono font-bold text-cyan-400">
                  {activeInspectNode.opticalPowerDbm} dBm
                </div>
              </div>
              <div className="bg-neutral-800/40 p-1.5 rounded-lg">
                <div className="text-[10px] text-neutral-400">Port Load</div>
                <div className="text-xs font-mono font-bold text-emerald-400">
                  {activeInspectNode.portsUsed}/{activeInspectNode.portsTotal}
                </div>
              </div>
              <div className="bg-neutral-800/40 p-1.5 rounded-lg">
                <div className="text-[10px] text-neutral-400">Backhaul</div>
                <div className="text-xs font-mono font-bold text-amber-400">
                  {activeInspectNode.contentAddress}
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectFat(activeInspectNode)}
              className="w-full mt-3 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md active:scale-98 transition-all cursor-pointer min-h-[44px]"
            >
              <span>Open FAT Details Spec Sheet</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
