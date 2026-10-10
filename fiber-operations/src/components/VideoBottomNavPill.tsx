import React from 'react';

export type VideoTabType = 'HOME' | 'RADAR' | 'FAT' | 'RSU' | 'HUB' | 'PON';

interface VideoBottomNavPillProps {
  currentTab: VideoTabType;
  onTabChange: (tab: VideoTabType) => void;
  onQuickAction?: () => void;
  isLightMode?: boolean;
  isVisible?: boolean;
  className?: string;
}

/* ==========================================================================
   ULTRA-MODERN CUSTOM ICONS FOR BOTTOM NAVIGATION DOCK
   ========================================================================== */

// 1. Ultra-Modern Cyber Home Icon
const ModernHomeIcon: React.FC<{ isLightMode?: boolean; isActive?: boolean }> = ({ isActive }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 sm:w-4.5 sm:h-4.5">
    <path
      d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
      fill="currentColor"
      fillOpacity={isActive ? '0.95' : '0.75'}
    />
    <path
      d="M12 7V10"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="12" cy="17" r="1.2" fill="#38bdf8" />
  </svg>
);

// 2. Ultra-Modern Tactical Radar Icon
const ModernRadarIcon: React.FC<{ isLightMode?: boolean; isActive?: boolean }> = ({ isActive }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 sm:w-4.5 sm:h-4.5">
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.85" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2.5 1.5" strokeOpacity="0.9" />
    <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    <path
      d="M12 2.5V12L18.5 7.5"
      stroke="#ffffff"
      strokeWidth="1.6"
      strokeLinecap="round"
      className={isActive ? 'animate-pulse' : ''}
    />
    <circle cx="16" cy="7.5" r="1" fill="#38bdf8" />
  </svg>
);

// 3. Ultra-Modern FAT Optical Terminal Icon
const ModernFatIcon: React.FC<{ isLightMode?: boolean; isActive?: boolean }> = ({ isActive }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 sm:w-4.5 sm:h-4.5">
    <rect x="3" y="5" width="18" height="15" rx="3.5" fill="currentColor" fillOpacity={isActive ? '0.95' : '0.8'} />
    <rect x="5.5" y="9.5" width="13" height="7.5" rx="1.8" fill="#ffffff" fillOpacity="0.22" />
    <circle cx="8" cy="13.2" r="1.3" fill="#38bdf8" />
    <circle cx="12" cy="13.2" r="1.3" fill="#38bdf8" />
    <circle cx="16" cy="13.2" r="1.3" fill="#38bdf8" />
    <path d="M7 3.5H17" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="10.5" y="2" width="3" height="2" rx="0.5" fill="#ffffff" />
  </svg>
);

// 4. Ultra-Modern RSU Backbone Server Tower Icon
const ModernRsuIcon: React.FC<{ isLightMode?: boolean; isActive?: boolean }> = ({ isActive }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 sm:w-4.5 sm:h-4.5">
    <rect x="4" y="3" width="16" height="18" rx="3" fill="currentColor" fillOpacity={isActive ? '0.95' : '0.8'} />
    {/* Blade 1 */}
    <rect x="6.5" y="6" width="11" height="3" rx="1" fill="#ffffff" fillOpacity="0.25" />
    <circle cx="8.5" cy="7.5" r="0.9" fill="#34d399" />
    <line x1="11" y1="7.5" x2="15.5" y2="7.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
    {/* Blade 2 */}
    <rect x="6.5" y="10.5" width="11" height="3" rx="1" fill="#ffffff" fillOpacity="0.25" />
    <circle cx="8.5" cy="12" r="0.9" fill="#38bdf8" />
    <line x1="11" y1="12" x2="15.5" y2="12" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
    {/* Blade 3 */}
    <rect x="6.5" y="15" width="11" height="3" rx="1" fill="#ffffff" fillOpacity="0.25" />
    <circle cx="8.5" cy="16.5" r="0.9" fill="#f59e0b" />
    <line x1="11" y1="16.5" x2="15.5" y2="16.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// 5. Ultra-Modern Central Optical HUB Icon
const ModernHubIcon: React.FC<{ isLightMode?: boolean; isActive?: boolean }> = ({ isActive }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 sm:w-4.5 sm:h-4.5">
    <path
      d="M12 2L20.5 7V17L12 22L3.5 17V7L12 2Z"
      fill="currentColor"
      fillOpacity={isActive ? '0.95' : '0.8'}
    />
    <circle cx="12" cy="12" r="3.2" fill="#ffffff" />
    <circle cx="12" cy="12" r="1.6" fill="#9333ea" />
    <circle cx="12" cy="5.5" r="1.2" fill="#38bdf8" />
    <circle cx="18" cy="14.5" r="1.2" fill="#38bdf8" />
    <circle cx="6" cy="14.5" r="1.2" fill="#38bdf8" />
  </svg>
);

// 6. Ultra-Modern PON Optical Port Icon
const ModernPonIcon: React.FC<{ isLightMode?: boolean; isActive?: boolean }> = ({ isActive }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 sm:w-4.5 sm:h-4.5">
    <rect x="5" y="4" width="14" height="16" rx="3.5" fill="currentColor" fillOpacity={isActive ? '0.95' : '0.8'} />
    <circle cx="12" cy="12" r="4.2" fill="#ffffff" fillOpacity="0.25" />
    <circle cx="12" cy="12" r="2.2" fill="#38bdf8" />
    <circle cx="12" cy="12" r="0.9" fill="#ffffff" />
    <path d="M12 2V4" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M9 20V22" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M15 20V22" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const VideoBottomNavPill: React.FC<VideoBottomNavPillProps> = ({
  currentTab,
  onTabChange,
  isLightMode = false,
  isVisible = true,
  className = ''
}) => {
  const tabs = [
    {
      id: 'HOME' as VideoTabType,
      label: 'Home',
      renderIcon: (active: boolean) => <ModernHomeIcon isLightMode={isLightMode} isActive={active} />,
      gradient: 'from-blue-500 to-indigo-600',
      activeGlow: 'shadow-[0_0_16px_rgba(59,130,246,0.6)]'
    },
    {
      id: 'RADAR' as VideoTabType,
      label: 'Radar',
      renderIcon: (active: boolean) => <ModernRadarIcon isLightMode={isLightMode} isActive={active} />,
      gradient: 'from-cyan-400 to-blue-500',
      activeGlow: 'shadow-[0_0_16px_rgba(6,182,212,0.6)]'
    },
    {
      id: 'FAT' as VideoTabType,
      label: 'FAT',
      renderIcon: (active: boolean) => <ModernFatIcon isLightMode={isLightMode} isActive={active} />,
      gradient: 'from-amber-400 to-orange-600',
      activeGlow: 'shadow-[0_0_16px_rgba(249,115,22,0.6)]'
    },
    {
      id: 'RSU' as VideoTabType,
      label: 'RSU',
      renderIcon: (active: boolean) => <ModernRsuIcon isLightMode={isLightMode} isActive={active} />,
      gradient: 'from-emerald-400 to-teal-600',
      activeGlow: 'shadow-[0_0_16px_rgba(16,185,129,0.6)]'
    },
    {
      id: 'HUB' as VideoTabType,
      label: 'HUB',
      renderIcon: (active: boolean) => <ModernHubIcon isLightMode={isLightMode} isActive={active} />,
      gradient: 'from-purple-400 to-indigo-600',
      activeGlow: 'shadow-[0_0_16px_rgba(168,85,247,0.6)]'
    },
    {
      id: 'PON' as VideoTabType,
      label: 'PON',
      renderIcon: (active: boolean) => <ModernPonIcon isLightMode={isLightMode} isActive={active} />,
      gradient: 'from-sky-400 to-cyan-600',
      activeGlow: 'shadow-[0_0_16px_rgba(14,165,233,0.6)]'
    }
  ];

  const handleTabClick = (tabId: VideoTabType) => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    } catch {
      // Ignore vibration errors
    }
    onTabChange(tabId);
  };

  return (
    <div
      className={`w-full max-w-md mx-auto select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform flex items-center justify-center gap-2 px-2 sm:px-3 ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
          : 'translate-y-24 opacity-0 scale-95 pointer-events-none'
      } ${className}`}
    >
      {/* ULTRA-MODERN BOTTOM NAVIGATION DOCK */}
      <nav
        aria-label="Navigation Dock"
        className={`relative flex-1 rounded-full p-1.5 sm:p-2 flex items-center justify-between backdrop-blur-3xl saturate-200 transition-all duration-300 shadow-2xl border ${
          isLightMode
            ? 'bg-white/90 border-slate-200/80 shadow-[0_12px_40px_rgba(15,23,42,0.14)]'
            : 'bg-[rgba(12,15,24,0.92)] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)]'
        }`}
      >
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 sm:py-1.5 px-0.5 rounded-full cursor-pointer min-h-[46px] sm:min-h-[48px] relative transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-90 ${
                isActive
                  ? isLightMode
                    ? 'bg-slate-100 text-slate-900 shadow-sm scale-[1.04]'
                    : 'bg-white/10 text-white scale-[1.04]'
                  : isLightMode
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {/* MODERN 3D ICON BADGE */}
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-tr ${tab.gradient} text-white ${tab.activeGlow} scale-110 shadow-md ring-1 ring-white/40`
                    : isLightMode
                    ? 'bg-slate-200/70 text-slate-700'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {tab.renderIcon(isActive)}
              </div>

              {/* Modern Label */}
              <span
                className={`whitespace-nowrap text-[9px] sm:text-[10px] tracking-tight transition-all duration-300 ${
                  isActive
                    ? isLightMode
                      ? 'font-black text-slate-950'
                      : 'font-black text-white'
                    : isLightMode
                    ? 'font-semibold text-slate-600'
                    : 'font-medium text-slate-400'
                }`}
              >
                {tab.label}
              </span>

              {/* Ultra-Modern Glowing Micro Indicator Bar */}
              {isActive && (
                <span
                  className={`w-3.5 sm:w-4 h-0.5 rounded-full bg-gradient-to-r ${tab.gradient} shadow-sm animate-in fade-in zoom-in-75 duration-200`}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
