import React from 'react';

interface Icon3DProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  isLightMode?: boolean;
  isActive?: boolean;
}

const getSizePixels = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number = 'md'): number => {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'xs': return 16;
    case 'sm': return 20;
    case 'md': return 24;
    case 'lg': return 32;
    case 'xl': return 40;
    default: return 24;
  }
};

/**
 * 1. MODERN 3D FAT ICON (Fiber Access Terminal Box)
 * Replaces 📍 with high-tech 3D fiber enclosure:
 * - Isometric 3D terminal housing
 * - Multi-port optical splitter adapters (SC/APC)
 * - Fiber optic core conduits with dark glowing / vibrant accents
 * - 3D depth, beveled edges, and realistic drop shadow
 */
export const Fat3DModelIcon: React.FC<Icon3DProps> = ({
  className = '',
  size = 'md',
  isLightMode = false,
  isActive = false
}) => {
  const px = getSizePixels(size);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-300 ${
        isActive ? 'scale-110' : 'hover:scale-105'
      } ${className}`}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* 3D Chassis Gradients - Vibrant jewel orange */}
          <linearGradient id="fatBoxTop" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffedd5" />
            <stop offset="50%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          <linearGradient id="fatBoxFront" x1="6" y1="12" x2="30" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          <linearGradient id="fatPortGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <filter id="fatDarkGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={isLightMode ? "#ea580c" : "#ea580c"} floodOpacity={isLightMode ? "0.3" : "0.45"} />
          </filter>
        </defs>

        {/* 3D Base Drop Shadow */}
        <ellipse cx="18" cy="31" rx="13" ry="3.5" fill={isLightMode ? "rgba(15,23,42,0.18)" : "rgba(0,0,0,0.65)"} />

        {/* 3D Terminal Chassis Main Body */}
        <g filter="url(#fatDarkGlow)">
          {/* Main Enclosure Box */}
          <rect x="6" y="8" width="24" height="20" rx="4.5" fill="url(#fatBoxFront)" />

          {/* Top Beveled Lid (Isometric 3D lip) */}
          <path
            d="M6 12.5C6 10.0147 8.01472 8 10.5 8H25.5C27.9853 8 30 10.0147 30 12.5V14H6V12.5Z"
            fill="url(#fatBoxTop)"
          />

          {/* Inner Inset Face Plate */}
          <rect
            x="8.5"
            y="15"
            width="19"
            height="11"
            rx="2.5"
            fill={isLightMode ? "#ffffff" : "#170a04"}
            stroke={isLightMode ? "#fed7aa" : "#7c2d12"}
            strokeWidth="0.8"
          />

          {/* 4 Optical SC/APC Port Sockets */}
          <circle cx="12" cy="18.5" r="1.6" fill="url(#fatPortGlow)" />
          <circle cx="16" cy="18.5" r="1.6" fill="url(#fatPortGlow)" />
          <circle cx="20" cy="18.5" r="1.6" fill="url(#fatPortGlow)" />
          <circle cx="24" cy="18.5" r="1.6" fill="url(#fatPortGlow)" />

          {/* Optical Port Core Indicators (Laser Signal) */}
          <circle cx="12" cy="18.5" r="0.7" fill="#ffffff" />
          <circle cx="16" cy="18.5" r="0.7" fill="#ffffff" />
          <circle cx="20" cy="18.5" r="0.7" fill="#ffffff" />
          <circle cx="24" cy="18.5" r="0.7" fill="#ffffff" />

          {/* Bottom Fiber Cable Feeders (3D Ingress tubes) */}
          <rect x="11.5" y="27" width="2" height="4" rx="1" fill={isLightMode ? "#94a3b8" : "#475569"} />
          <rect x="15.5" y="27" width="2" height="4" rx="1" fill={isLightMode ? "#94a3b8" : "#475569"} />
          <rect x="19.5" y="27" width="2" height="4" rx="1" fill={isLightMode ? "#94a3b8" : "#475569"} />
          <rect x="22.5" y="27" width="2" height="4" rx="1" fill={isLightMode ? "#94a3b8" : "#475569"} />

          {/* Hinge & Lock Catch */}
          <rect x="16.5" y="6.5" width="3" height="2" rx="0.8" fill={isLightMode ? "#fdba74" : "#9a3412"} />

          {/* Top Latch High-gloss 3D highlight */}
          <line x1="9" y1="9.5" x2="27" y2="9.5" stroke="rgba(255,255,255,0.45)" strokeWidth="0.9" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};

/**
 * 2. MODERN 3D HUB ICON (Central Optical Distribution Hub Node)
 * Replaces ⚡ with high-tech 3D Optical Distribution Node:
 * - Isometric 3D optical core prism
 * - Multi-stage fiber routing tiers with dark glowing purple/sapphire depth
 * - Laser distribution wave guides & aggregator crystal
 */
export const Hub3DModelIcon: React.FC<Icon3DProps> = ({
  className = '',
  size = 'md',
  isLightMode = false,
  isActive = false
}) => {
  const px = getSizePixels(size);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-300 ${
        isActive ? 'scale-110' : 'hover:scale-105'
      } ${className}`}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="hubPrismTop" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f3e8ff" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>

          <linearGradient id="hubCoreRing" x1="6" y1="6" x2="30" y2="30">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#6b21a8" />
          </linearGradient>

          <linearGradient id="hubRayGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          <filter id="hubDarkGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#9333ea" floodOpacity={isLightMode ? "0.3" : "0.45"} />
          </filter>
        </defs>

        {/* 3D Base Drop Shadow */}
        <ellipse cx="18" cy="31.5" rx="13" ry="3.5" fill={isLightMode ? "rgba(15,23,42,0.18)" : "rgba(0,0,0,0.65)"} />

        <g filter="url(#hubDarkGlow)">
          {/* Hexagonal Tier Base (Isometric Hub Platter) */}
          <path
            d="M18 4L29 10V22L18 28L7 22V10L18 4Z"
            fill="url(#hubPrismTop)"
            stroke={isLightMode ? "#d8b4fe" : "#7e22ce"}
            strokeWidth="0.8"
          />

          {/* Inner 3D Optical Matrix Disc */}
          <path
            d="M18 7.5L26.5 12V20L18 24.5L9.5 20V12L18 7.5Z"
            fill={isLightMode ? "#ffffff" : "#18062a"}
            stroke={isLightMode ? "#c084fc" : "#9333ea"}
            strokeWidth="0.8"
          />

          {/* Central Optical Aggregator Prism Node */}
          <circle cx="18" cy="16" r="4.2" fill="url(#hubCoreRing)" />
          <circle cx="18" cy="16" r="2.2" fill="url(#hubRayGold)" />
          <circle cx="18" cy="16" r="1" fill="#ffffff" />

          {/* Optical Radial Fiber Spokes */}
          <line x1="18" y1="8" x2="18" y2="12" stroke={isLightMode ? "#a855f7" : "#c084fc"} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="18" y1="20" x2="18" y2="24" stroke={isLightMode ? "#a855f7" : "#c084fc"} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="11" y1="13" x2="14.5" y2="14.8" stroke={isLightMode ? "#a855f7" : "#c084fc"} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="25" y1="19" x2="21.5" y2="17.2" stroke={isLightMode ? "#a855f7" : "#c084fc"} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="11" y1="19" x2="14.5" y2="17.2" stroke={isLightMode ? "#a855f7" : "#c084fc"} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="25" y1="13" x2="21.5" y2="14.8" stroke={isLightMode ? "#a855f7" : "#c084fc"} strokeWidth="1.2" strokeLinecap="round" />

          {/* 3 Satellite Distribution Node Terminals */}
          <circle cx="18" cy="7.5" r="1.4" fill="#38bdf8" />
          <circle cx="26.5" cy="12" r="1.4" fill="#38bdf8" />
          <circle cx="26.5" cy="20" r="1.4" fill="#38bdf8" />
          <circle cx="18" cy="24.5" r="1.4" fill="#38bdf8" />
          <circle cx="9.5" cy="20" r="1.4" fill="#38bdf8" />
          <circle cx="9.5" cy="12" r="1.4" fill="#38bdf8" />
        </g>
      </svg>
    </div>
  );
};

/**
 * 3. MODERN 3D RSU ICON (Remote Switching Unit / Telecom Shelter Cabinet)
 * Replaces 🏢 with high-tech 3D Telecom Server Rack & Equipment Shelter:
 * - Isometric 3D server cabinet tower
 * - Stacked optical blade tiers
 * - Dark glowing emerald/cyan status LED array
 * - Ventilation grilles and precision telecom housing
 */
export const Rsu3DModelIcon: React.FC<Icon3DProps> = ({
  className = '',
  size = 'md',
  isLightMode = false,
  isActive = false
}) => {
  const px = getSizePixels(size);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-300 ${
        isActive ? 'scale-110' : 'hover:scale-105'
      } ${className}`}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="rsuTowerTop" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#dcfce7" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <linearGradient id="rsuFrontBevel" x1="8" y1="6" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="rsuLedGreen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <filter id="rsuDarkGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#10b981" floodOpacity={isLightMode ? "0.3" : "0.45"} />
          </filter>
        </defs>

        {/* 3D Base Drop Shadow */}
        <ellipse cx="18" cy="31.5" rx="13" ry="3.5" fill={isLightMode ? "rgba(15,23,42,0.18)" : "rgba(0,0,0,0.65)"} />

        <g filter="url(#rsuDarkGlow)">
          {/* Main 3D Server Cabinet Chassis */}
          <rect x="7" y="6" width="22" height="23" rx="4" fill="url(#rsuFrontBevel)" />

          {/* Roof Cap / Bevel */}
          <path
            d="M7 10C7 7.79086 8.79086 6 11 6H25C27.2091 6 29 7.79086 29 10V11H7V10Z"
            fill="url(#rsuTowerTop)"
          />

          {/* Blade 1 (Top Optical Line Terminal Switch) */}
          <rect x="9.5" y="12" width="17" height="4" rx="1.5" fill={isLightMode ? "#ffffff" : "#062319"} />
          <circle cx="12" cy="14" r="1.1" fill="url(#rsuLedGreen)" />
          <circle cx="15" cy="14" r="1.1" fill="url(#rsuLedGreen)" />
          <line x1="18" y1="14" x2="24.5" y2="14" stroke={isLightMode ? "#94a3b8" : "#047857"} strokeWidth="1.2" strokeLinecap="round" />

          {/* Blade 2 (Middle Switching Fabric) */}
          <rect x="9.5" y="17.5" width="17" height="4" rx="1.5" fill={isLightMode ? "#ffffff" : "#062319"} />
          <circle cx="12" cy="19.5" r="1.1" fill="#38bdf8" />
          <circle cx="15" cy="19.5" r="1.1" fill="url(#rsuLedGreen)" />
          <line x1="18" y1="19.5" x2="24.5" y2="19.5" stroke={isLightMode ? "#94a3b8" : "#047857"} strokeWidth="1.2" strokeLinecap="round" />

          {/* Blade 3 (Bottom Distribution Matrix) */}
          <rect x="9.5" y="23" width="17" height="4" rx="1.5" fill={isLightMode ? "#ffffff" : "#062319"} />
          <circle cx="12" cy="25" r="1.1" fill="url(#rsuLedGreen)" />
          <circle cx="15" cy="25" r="1.1" fill="#f59e0b" />
          <line x1="18" y1="25" x2="24.5" y2="25" stroke={isLightMode ? "#94a3b8" : "#047857"} strokeWidth="1.2" strokeLinecap="round" />

          {/* Left/Right Ventilation Grilles */}
          <circle cx="24.5" cy="8.5" r="0.8" fill="#ffffff" />
          <circle cx="22" cy="8.5" r="0.8" fill="#ffffff" opacity="0.6" />

          {/* Base Stand Pillars */}
          <rect x="10" y="28.5" width="3" height="2" rx="0.5" fill={isLightMode ? "#64748b" : "#047857"} />
          <rect x="23" y="28.5" width="3" height="2" rx="0.5" fill={isLightMode ? "#64748b" : "#047857"} />
        </g>
      </svg>
    </div>
  );
};

/**
 * 4. MODERN 3D PON PORT ICON (Optical Plug & Ferrule)
 */
export const PonPort3DModelIcon: React.FC<Icon3DProps> = ({
  className = '',
  size = 'md',
  isLightMode = false,
  isActive = false
}) => {
  const px = getSizePixels(size);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-300 ${
        isActive ? 'scale-110' : 'hover:scale-105'
      } ${className}`}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="ponPlug" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
        </defs>

        <rect x="9" y="8" width="18" height="20" rx="4" fill="url(#ponPlug)" />
        <rect x="13" y="5" width="10" height="4" rx="1.5" fill="#38bdf8" />
        <circle cx="18" cy="18" r="4" fill={isLightMode ? "#ffffff" : "#0f2742"} />
        <circle cx="18" cy="18" r="2" fill="#22d3ee" />
        <circle cx="18" cy="18" r="0.8" fill="#ffffff" />
      </svg>
    </div>
  );
};

/**
 * 5. MODERN 3D RADAR ICON (Optical Sonar Dish)
 */
export const Radar3DModelIcon: React.FC<Icon3DProps> = ({
  className = '',
  size = 'md',
  isLightMode = false,
  isActive = false
}) => {
  const px = getSizePixels(size);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-300 ${
        isActive ? 'scale-110' : 'hover:scale-105'
      } ${className}`}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="radarDish" x1="0" y1="0" x2="36" y2="36">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>

        <circle cx="18" cy="18" r="14" fill="url(#radarDish)" />
        <circle cx="18" cy="18" r="10" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        <circle cx="18" cy="18" r="6" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
        <circle cx="18" cy="18" r="2.5" fill="#ffffff" />
        <line x1="18" y1="4" x2="18" y2="32" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <line x1="4" y1="18" x2="32" y2="18" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      </svg>
    </div>
  );
};

// Line Model Icon Fallbacks for backwards compatibility
export const FatModelIcon: React.FC<{ className?: string; isActive?: boolean }> = ({
  className = 'w-5 h-5',
  isActive = false
}) => (
  <Fat3DModelIcon className={className} isActive={isActive} />
);

export const RsuModelIcon: React.FC<{ className?: string; isActive?: boolean }> = ({
  className = 'w-5 h-5',
  isActive = false
}) => (
  <Rsu3DModelIcon className={className} isActive={isActive} />
);

export const HubModelIcon: React.FC<{ className?: string; isActive?: boolean }> = ({
  className = 'w-5 h-5',
  isActive = false
}) => (
  <Hub3DModelIcon className={className} isActive={isActive} />
);

export const PonPortModelIcon: React.FC<{ className?: string; isActive?: boolean }> = ({
  className = 'w-5 h-5',
  isActive = false
}) => (
  <PonPort3DModelIcon className={className} isActive={isActive} />
);

export const SettingsModelIcon: React.FC<{ className?: string; isActive?: boolean }> = ({
  className = 'w-5 h-5',
  isActive = false
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={isActive ? '2.4' : '1.8'}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const MicVoiceIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
