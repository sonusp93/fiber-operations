import React from 'react';
import { Home, Map, Database, Network, Settings } from 'lucide-react';

export type NavTabType = 'HOME' | 'MAP' | 'FATS' | 'HIERARCHY' | 'SETTINGS';

interface DockedBottomTabBarProps {
  currentTab: NavTabType;
  onTabChange: (tab: NavTabType) => void;
}

export const DockedBottomTabBar: React.FC<DockedBottomTabBarProps> = ({
  currentTab,
  onTabChange
}) => {
  const tabs: { id: NavTabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'HOME',
      label: 'Home',
      icon: <Home className="w-4 h-4" />
    },
    {
      id: 'MAP',
      label: 'GIS Map',
      icon: <Map className="w-4 h-4" />
    },
    {
      id: 'FATS',
      label: 'FAT Directory',
      icon: <Database className="w-4 h-4" />
    },
    {
      id: 'HIERARCHY',
      label: 'RSU & HUB',
      icon: <Network className="w-4 h-4" />
    },
    {
      id: 'SETTINGS',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  return (
    <div className="flex-shrink-0 w-full px-3 pb-2 pt-1 z-30 select-none">
      {/* Rounded Popup-Style Bar inside screen */}
      <nav
        aria-label="Field Navigation Dock"
        className="w-full max-w-md mx-auto bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-1 flex items-center justify-around"
      >
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer min-h-[44px] min-w-[56px] relative ${
                isActive
                  ? 'text-cyan-400 bg-neutral-800/90 font-bold shadow-sm border border-white/10 scale-102'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
              }`}
            >
              <div className="relative">
                {tab.icon}
              </div>
              <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-2.5 h-0.5 rounded-full bg-cyan-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
