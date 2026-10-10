import React, { useState } from 'react';
import { INITIAL_SWITCHES, RSU_DEVICES } from '../data/mockTelecomData';
import { OperationSwitch } from '../types/telecom';
import { Sliders, Radio, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

export const RsuOperationsView: React.FC = () => {
  const [switches, setSwitches] = useState<OperationSwitch[]>(INITIAL_SWITCHES);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'FAT' | 'RSU' | 'CORE'>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  const toggleSwitch = (id: string) => {
    setSwitches((prev) =>
      prev.map((sw) => {
        if (sw.id === id) {
          const newState = !sw.isActive;
          setNotification(`Relay ${sw.label} turned ${newState ? 'ON' : 'OFF'}`);
          setTimeout(() => setNotification(null), 2500);
          return { ...sw, isActive: newState };
        }
        return sw;
      })
    );
  };

  const filteredSwitches = switches.filter(
    (sw) => activeFilter === 'ALL' || sw.category === activeFilter
  );

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-y-auto pb-32">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-md px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            RSU Operations
          </h1>
          <p className="text-xs text-neutral-400">
            Hardware Relays & Remote Switch Units
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/40 text-cyan-300 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>7 Active</span>
        </div>
      </div>

      <div className="px-5 py-4 space-y-5 max-w-lg mx-auto w-full">
        {/* Toast alert */}
        {notification && (
          <div className="p-3 rounded-xl bg-cyan-950/70 border border-cyan-700/50 text-cyan-200 text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Telemetry Snapshot Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-2xl p-3.5 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Throughput</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              175.15 <span className="text-xs text-neutral-400 font-sans">MB/s</span>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
              +4.8% vs last hour
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3.5 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">Active Loops</span>
              <Radio className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              5 <span className="text-xs text-neutral-400 font-sans">Online</span>
            </div>
            <div className="text-[11px] text-cyan-400 font-medium mt-0.5">
              Avg latency 4.2ms
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-1.5 p-1 bg-neutral-900/90 rounded-xl border border-white/5">
          {(['ALL', 'FAT', 'RSU', 'CORE'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[36px] cursor-pointer ${
                activeFilter === tab
                  ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Operational Switches (matching video 00:01, 00:08, 00:09) */}
        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Field Relays &amp; Toggles
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              {filteredSwitches.filter((s) => s.isActive).length}/{filteredSwitches.length} Closed
            </span>
          </div>

          <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 divide-y divide-neutral-800/60 overflow-hidden shadow-lg">
            {filteredSwitches.map((sw) => (
              <div
                key={sw.id}
                className="flex items-center justify-between p-4 hover:bg-neutral-800/30 transition-colors"
              >
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {sw.label}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-white/5">
                      {sw.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                    {sw.description}
                  </p>
                </div>

                {/* Animated Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={sw.isActive}
                  onClick={() => toggleSwitch(sw.id)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none min-h-[44px] items-center ${
                    sw.isActive ? 'bg-emerald-500' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      sw.isActive ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live RSU Inventory List */}
        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Connected RSUs
            </span>
            <span className="text-xs text-cyan-400">Live Ping</span>
          </div>

          <div className="space-y-2">
            {RSU_DEVICES.map((rsu) => (
              <div
                key={rsu.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all"
              >
                <div>
                  <div className="text-sm font-medium text-white flex items-center gap-2">
                    {rsu.name}
                    <span className="text-[10px] font-mono text-emerald-400">
                      {rsu.changeRate}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {rsu.ipAddress} · Temp {rsu.temperatureC}°C · {rsu.lastHeartbeat}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-white">
                    {rsu.bandwidth}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400">
                    {rsu.latencyMs} ms
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
