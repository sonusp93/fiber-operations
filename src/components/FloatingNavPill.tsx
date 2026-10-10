import React from 'react';
import { TabType } from '../types/telecom';
import { Flame, Briefcase, Network, ShieldCheck, Settings as SettingsIcon } from 'lucide-react';

interface FloatingNavPillProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const FloatingNavPill: React.FC<FloatingNavPillProps> = ({
  currentTab,
  onTabChange
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'FAT',
      label: 'FAT',
      icon: <Flame className="w-4 h-4" />
    },
    {
      id: 'RSU',
      label: 'RSU',
      icon: <Briefcase className="w-4 h-4" />
    },
    {
      id: 'HUB',
      label: 'HUB',
      icon: <Network className="w-4 h-4" />
    },
    {
      id: 'PON',
      label: 'PON PORT',
      icon: <ShieldCheck className="w-4 h-4" />
    },
    {
      id: 'Settings',
      label: 'Settings',
      icon: <SettingsIcon className="w-4 h-4" />
    }
  ];

  return (
    <div className="w-full flex justify-center items-center pointer-events-none z-40 px-3">
      <nav 
        aria-label="Bottom Navigation" 
        className="glass-pill rounded-full p-1.5 flex items-center gap-1 pointer-events-auto transition-all duration-200"
      >
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer min-h-[44px] ${
                isActive
                  ? 'bg-neutral-800/90 text-white shadow-md border border-white/15 scale-102'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
              }`}
            >
              <span className={isActive ? 'text-cyan-400' : 'text-neutral-400'}>
                {tab.icon}
              </span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
