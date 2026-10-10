import React, { useState, useEffect, useRef, useMemo } from 'react';

export interface SparklineChartProps {
  dataPoints?: number[];
  timeLabels?: string[];
  colorTheme?: 'cyan' | 'amber' | 'emerald' | 'blue';
  unit?: string;
  height?: number;
  isLive?: boolean;
  liveIntervalMs?: number;
  minBound?: number;
  maxBound?: number;
  volatility?: number;
  showLivePulse?: boolean;
  onLiveUpdate?: (latestVal: number) => void;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  dataPoints: initialPoints = [18, 22, 29, 38, 48, 54, 52, 60],
  timeLabels: initialTimeLabels = ['11:00', '12:00', '2:00 PM'],
  colorTheme = 'cyan',
  unit = '',
  height = 70,
  isLive = true,
  liveIntervalMs = 2000,
  minBound = 10,
  maxBound = 100,
  volatility = 2.8,
  showLivePulse = true,
  onLiveUpdate
}) => {
  const [data, setData] = useState<number[]>(initialPoints);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<number[]>(initialPoints);
  const onLiveUpdateRef = useRef(onLiveUpdate);

  useEffect(() => {
    onLiveUpdateRef.current = onLiveUpdate;
  }, [onLiveUpdate]);

  // Synchronize if initialPoints prop changes
  useEffect(() => {
    dataRef.current = initialPoints;
    setData(initialPoints);
  }, [initialPoints]);

  // Real-time live data streaming engine (optimized for battery & thermal efficiency)
  useEffect(() => {
    if (!isLive) return;

    // Use relaxed interval (default minimum 10s) to prevent CPU wake locks and phone heating
    const effectiveInterval = Math.max(8000, liveIntervalMs);

    const interval = setInterval(() => {
      // Pause completely if screen is off or app is in background
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }

      const currentPoints = dataRef.current;
      const lastVal = currentPoints[currentPoints.length - 1] ?? 50;
      // Gentle drift
      const delta = (Math.random() - 0.48) * (volatility * 0.7);
      let nextVal = Number((lastVal + delta).toFixed(1));
      
      // Keep within bounds
      if (nextVal < minBound) nextVal = Number((minBound + Math.random() * 2).toFixed(1));
      if (nextVal > maxBound) nextVal = Number((maxBound - Math.random() * 2).toFixed(1));

      const newPoints = [...currentPoints.slice(1), nextVal];
      dataRef.current = newPoints;
      setData(newPoints);

      if (onLiveUpdateRef.current) {
        onLiveUpdateRef.current(nextVal);
      }
    }, effectiveInterval);

    return () => clearInterval(interval);
  }, [isLive, liveIntervalMs, minBound, maxBound, volatility]);

  const colors = {
    cyan: {
      stroke: '#e2e8f0',
      glow: 'rgba(255, 255, 255, 0.45)',
      gradientStart: 'rgba(255, 255, 255, 0.3)',
      gradientMid: 'rgba(255, 255, 255, 0.1)',
      gradientEnd: 'rgba(255, 255, 255, 0.01)',
      badge: 'text-neutral-200 bg-neutral-900/90 border-white/30 shadow-[0_0_12px_rgba(255,255,255,0.2)]',
      dot: '#ffffff'
    },
    amber: {
      stroke: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.55)',
      gradientStart: 'rgba(245, 158, 11, 0.35)',
      gradientMid: 'rgba(245, 158, 11, 0.12)',
      gradientEnd: 'rgba(245, 158, 11, 0.01)',
      badge: 'text-amber-300 bg-[#291b0c]/90 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]',
      dot: '#fbbf24'
    },
    emerald: {
      stroke: '#10b981',
      glow: 'rgba(16, 185, 129, 0.55)',
      gradientStart: 'rgba(16, 185, 129, 0.35)',
      gradientMid: 'rgba(16, 185, 129, 0.12)',
      gradientEnd: 'rgba(16, 185, 129, 0.01)',
      badge: 'text-emerald-300 bg-[#0c271e]/90 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.4)]',
      dot: '#34d399'
    },
    blue: {
      stroke: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.55)',
      gradientStart: 'rgba(59, 130, 246, 0.35)',
      gradientMid: 'rgba(59, 130, 246, 0.12)',
      gradientEnd: 'rgba(59, 130, 246, 0.01)',
      badge: 'text-blue-300 bg-[#0c1f3d]/90 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.4)]',
      dot: '#60a5fa'
    }
  }[colorTheme];

  const minVal = Math.min(...data) * 0.9;
  const maxVal = Math.max(...data) * 1.08;
  const range = maxVal - minVal || 1;

  const width = 340;
  const chartHeight = Math.max(30, height - 18);

  // Generate SVG coordinates with smooth cubic bezier spline
  const points = useMemo(() => {
    return data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = chartHeight - ((val - minVal) / range) * (chartHeight - 6) - 3;
      return { x, y, val };
    });
  }, [data, minVal, range, chartHeight, width]);

  // Smooth cubic bezier path
  const linePath = useMemo(() => {
    return points.reduce((acc, point, i, arr) => {
      if (i === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
      const prev = arr[i - 1];
      const cpX1 = (prev.x + (point.x - prev.x) / 2).toFixed(1);
      const cpY1 = prev.y.toFixed(1);
      const cpX2 = (prev.x + (point.x - prev.x) / 2).toFixed(1);
      const cpY2 = point.y.toFixed(1);
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    }, '');
  }, [points]);

  const areaPath = useMemo(() => {
    return `${linePath} L ${width} ${chartHeight} L 0 ${chartHeight} Z`;
  }, [linePath, width, chartHeight]);

  const lastPoint = points[points.length - 1] || { x: width, y: chartHeight / 2, val: 0 };

  // Mouse / Touch scrub interaction
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = chartContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = relX / rect.width;
    const closestIdx = Math.round(ratio * (data.length - 1));
    setHoverIndex(closestIdx);
  };

  return (
    <div className="w-full select-none relative pt-1">
      {/* Chart Canvas with Smooth Live Transition */}
      <div 
        ref={chartContainerRef}
        className="relative w-full overflow-visible cursor-crosshair touch-none"
        style={{ height: `${chartHeight}px` }}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`live-grad-${colorTheme}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.gradientStart} />
              <stop offset="55%" stopColor={colors.gradientMid} />
              <stop offset="100%" stopColor={colors.gradientEnd} />
            </linearGradient>

            <filter id={`live-glow-${colorTheme}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor={colors.stroke} floodOpacity="0.75" />
            </filter>
          </defs>

          {/* Area Fill with live wave gradient */}
          <path
            d={areaPath}
            fill={`url(#live-grad-${colorTheme})`}
            className="transition-all duration-300 ease-out"
          />

          {/* Glowing Stroke Curve */}
          <path
            d={linePath}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            filter={`url(#live-glow-${colorTheme})`}
            className="transition-all duration-300 ease-out"
          />

          {/* Scrub Vertical Guideline when Hovering */}
          {hoverIndex !== null && points[hoverIndex] && (
            <g className="transition-opacity duration-150">
              <line
                x1={points[hoverIndex].x}
                y1={0}
                x2={points[hoverIndex].x}
                y2={chartHeight}
                stroke={colors.stroke}
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <circle
                cx={points[hoverIndex].x}
                cy={points[hoverIndex].y}
                r="4.5"
                fill="#ffffff"
                stroke={colors.stroke}
                strokeWidth="2.5"
                className="shadow-lg"
              />
            </g>
          )}

          {/* LIVE TIP PULSATING RADAR BLIP (At current real-time point) */}
          {showLivePulse && isLive && hoverIndex === null && (
            <g className="transition-all duration-300 ease-out" transform={`translate(${lastPoint.x}, ${lastPoint.y})`}>
              {/* Outer Pulsing Radar Ring */}
              <circle
                r="6.5"
                fill="none"
                stroke={colors.stroke}
                strokeWidth="1.5"
                className="animate-ping opacity-75 origin-center"
              />
              {/* Mid Glow Ring */}
              <circle
                r="4.5"
                fill={colors.glow}
                className="animate-pulse"
              />
              {/* Inner Solid Blip */}
              <circle
                r="3"
                fill={colors.dot}
                stroke="#ffffff"
                strokeWidth="1.2"
                className="shadow-md"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip during Scrub/Hover */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="absolute top-0 transform -translate-x-1/2 -translate-y-8 pointer-events-none z-20 transition-all duration-75"
            style={{ left: `${(points[hoverIndex].x / width) * 100}%` }}
          >
            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border backdrop-blur-xl shadow-2xl whitespace-nowrap ${colors.badge}`}>
              <span className="opacity-75 mr-1">Point {hoverIndex + 1}:</span>
              <span>{points[hoverIndex].val} {unit}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Time Labels & LIVE Status Indicator */}
      <div className="flex justify-between items-center text-[10px] text-neutral-400 font-medium pt-1 px-1 tracking-wider font-mono">
        <span>{initialTimeLabels[0] || '11:00'}</span>
        <span>{initialTimeLabels[1] || '12:00'}</span>
        <div className="flex items-center gap-1">
          {isLive && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 px-1.5 py-0.2 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              LIVE
            </span>
          )}
          <span>{initialTimeLabels[2] || 'Now'}</span>
        </div>
      </div>
    </div>
  );
};
