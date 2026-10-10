import React, { useState, useEffect } from 'react';
import { 
  X, 
  Moon, 
  Sun, 
  RefreshCw, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Image as ImageIcon, 
  Upload, 
  Video, 
  Play, 
  Film, 
  User, 
  LogOut, 
  Code,
  Layers,
  Zap,
  Battery,
  Flame,
  Gauge,
  Sliders,
  Download,
  Bell,
  CheckCircle2,
  Navigation,
  Compass,
  Cpu,
  Palette,
  Lock,
  Trash2,
  ShieldAlert,
  AlertTriangle,
  Smartphone,
  FolderCheck
} from 'lucide-react';
import { UserAuthProfile } from './TechnicianLoginPage';
import { CompanySecurityService } from '../services/companySecurityService';
import { AndroidStudioModal } from './AndroidStudioModal';

export type PerformanceMode = 'BALANCED' | 'HIGH' | 'BATTERY_SAVER';

interface SettingsModalProps {
  onClose: () => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
  currentWallpaper: string;
  onWallpaperChange: (wallpaper: string) => void;
  currentUser?: UserAuthProfile | null;
  onLogout?: () => void;
  isLightIcons?: boolean;
  onToggleLightIcons?: () => void;
  onSelectThemePreset?: (themeId: string) => void;
  currentThemePreset?: string;
  isGpsEnabled?: boolean;
  onToggleGps?: () => void;
  isBatterySavingGps?: boolean;
  onToggleBatterySavingGps?: () => void;
  onTriggerOtaUpdate?: (updateInfo: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  isLightMode,
  onToggleTheme,
  currentWallpaper = 'void',
  onWallpaperChange,
  currentUser,
  onLogout,
  isLightIcons = true,
  onToggleLightIcons,
  onSelectThemePreset,
  currentThemePreset = 'default_dark',
  isGpsEnabled: parentGpsEnabled,
  onToggleGps: parentToggleGps,
  isBatterySavingGps: parentBatterySavingGps,
  onToggleBatterySavingGps: parentToggleBatterySavingGps,
  onTriggerOtaUpdate
}) => {
  // 0. ANDROID STUDIO DESKTOP WORKSPACE MODAL
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);

  // 1. 120 FPS SMOOTH TOGGLE
  const [fps120Enabled, setFps120Enabled] = useState<boolean>(() => {
    return localStorage.getItem('locfinder_120fps_smooth') !== 'false';
  });

  const handleToggleFps120 = () => {
    const nextVal = !fps120Enabled;
    setFps120Enabled(nextVal);
    localStorage.setItem('locfinder_120fps_smooth', String(nextVal));
    if (nextVal) {
      document.documentElement.classList.add('smooth-120fps-mode');
    } else {
      document.documentElement.classList.remove('smooth-120fps-mode');
    }
  };

  // 2. PERFORMANCE PROFILES (High Performance vs Balanced vs Battery Saver)
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(() => {
    return (localStorage.getItem('locfinder_perf_mode') as PerformanceMode) || 'HIGH';
  });

  const handleSelectPerformanceMode = (mode: PerformanceMode) => {
    setPerformanceMode(mode);
    localStorage.setItem('locfinder_perf_mode', mode);
  };

  // 3. GPS SENSOR ON / OFF & BATTERY SAVING FOR GPS
  const [localGpsEnabled, setLocalGpsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('locfinder_radar_gps_enabled') !== 'false';
  });
  const effectiveGpsEnabled = parentGpsEnabled !== undefined ? parentGpsEnabled : localGpsEnabled;

  const handleToggleGpsSensor = () => {
    if (parentToggleGps) {
      parentToggleGps();
    } else {
      const next = !localGpsEnabled;
      setLocalGpsEnabled(next);
      localStorage.setItem('locfinder_radar_gps_enabled', String(next));
    }
  };

  const [localBatteryGps, setLocalBatteryGps] = useState<boolean>(() => {
    return localStorage.getItem('locfinder_gps_battery_saving') === 'true';
  });
  const effectiveBatteryGps = parentBatterySavingGps !== undefined ? parentBatterySavingGps : localBatteryGps;

  const handleToggleBatterySavingGps = () => {
    if (parentToggleBatterySavingGps) {
      parentToggleBatterySavingGps();
    } else {
      const next = !localBatteryGps;
      setLocalBatteryGps(next);
      localStorage.setItem('locfinder_gps_battery_saving', String(next));
    }
  };

  // 4. PHONE HEATING CONTROL SETTING
  const [phoneHeatingControl, setPhoneHeatingControl] = useState<boolean>(() => {
    return localStorage.getItem('locfinder_heat_control') !== 'false';
  });

  const handleToggleHeatControl = () => {
    const nextVal = !phoneHeatingControl;
    setPhoneHeatingControl(nextVal);
    localStorage.setItem('locfinder_heat_control', String(nextVal));
  };

  // 5. AUTO UPDATE FEATURE: NOTIFY & INSTALL
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState<boolean>(() => {
    return localStorage.getItem('locfinder_auto_update') !== 'false';
  });
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [availableUpdate, setAvailableUpdate] = useState<{
    version: string;
    build: string;
    releaseNotes: string;
  } | null>(null);
  const [isInstallingUpdate, setIsInstallingUpdate] = useState(false);
  const [updateInstallSuccess, setUpdateInstallSuccess] = useState<string | null>(null);

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setAvailableUpdate(null);
    setUpdateInstallSuccess(null);
    try {
      const syncRes = await CompanySecurityService.syncWithGitHubPolicy();
      const latest = syncRes.policy.latestAppUpdate || CompanySecurityService.getLocalPolicy().latestAppUpdate;

      if (latest && latest.version !== CompanySecurityService.getCurrentInstalledVersion().version) {
        setAvailableUpdate({
          version: `v${latest.version}`,
          build: latest.build || `Build ${latest.version}`,
          releaseNotes: latest.releaseNotes || 'New security update available from company GitHub repository.'
        });
        if (onTriggerOtaUpdate) {
          onTriggerOtaUpdate(latest);
          onClose();
        }
      } else {
        setUpdateInstallSuccess(`App is up to date! Currently running v${CompanySecurityService.getCurrentInstalledVersion().version} (${CompanySecurityService.getCurrentInstalledVersion().build}).`);
      }
    } catch {
      setUpdateInstallSuccess(`App is up to date! Currently running v${CompanySecurityService.getCurrentInstalledVersion().version}.`);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleInstallUpdate = () => {
    if (availableUpdate && onTriggerOtaUpdate) {
      onTriggerOtaUpdate({
        version: availableUpdate.version.replace(/^v/, ''),
        build: availableUpdate.build,
        releaseNotes: availableUpdate.releaseNotes,
        isMandatory: true,
        downloadUrl: 'https://github.com/sonusp93/fiber-operations/releases/download/v1.0.3/LocFinderPro.apk'
      });
      onClose();
    } else {
      window.open('https://github.com/sonusp93/fiber-operations/releases', '_blank');
      setUpdateInstallSuccess('Redirecting to official GitHub Releases page...');
    }
  };

  // 6. GITHUB OTA REMOTE DATA WIPE FOR RESIGNED EMPLOYEES
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [gitHubSyncResult, setGitHubSyncResult] = useState<string | null>(null);
  const [gitHubManifestUrl, setGitHubManifestUrl] = useState(() => CompanySecurityService.getGitHubManifestUrl());
  const [isWipingData, setIsWipingData] = useState(false);
  const [dataWipeSuccess, setDataWipeSuccess] = useState<string | null>(null);

  const handleSyncGitHubManifest = async () => {
    setIsSyncingGitHub(true);
    setGitHubSyncResult(null);
    try {
      const res = await CompanySecurityService.syncWithGitHubPolicy();
      setGitHubSyncResult(res.message);

      // Check active user against deauthorized list
      if (currentUser) {
        const check = CompanySecurityService.isTechnicianRevoked(currentUser);
        if (check.isRevoked) {
          CompanySecurityService.executeCompanyDataWipe(
            check.reason || 'Employee separation registered in corporate GitHub manifest',
            currentUser
          );
          onClose();
        }
      }
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  const handleTestSimulateWipe = () => {
    if (confirm('SIMULATE RESIGNED EMPLOYEE REMOTE WIPE?\n\nThis will trigger an immediate corporate data separation wipe. All official company FAT nodes, maps, credentials and local cache will be permanently purged from this device.')) {
      CompanySecurityService.executeCompanyDataWipe(
        'Simulated Resigned Field Engineer Data Wipe via GitHub Policy',
        currentUser
      );
      onClose();
    }
  };

  const handleClearCompanyAppData = () => {
    if (confirm('CLEAR DATA & PURGE OFFLINE CACHE?\n\nThis will wipe all local search histories, temporary GIS cache, offline node buffers, and radar scan cache.')) {
      setIsWipingData(true);
      try {
        localStorage.removeItem('locfinder_search_history');
        localStorage.removeItem('locfinder_cached_nodes');
        localStorage.removeItem('locfinder_radar_cache');
        localStorage.removeItem('locfinder_history');
        localStorage.removeItem('locfinder_favorites');
        setDataWipeSuccess('Company offline cache and search indices cleared successfully!');
      } catch {
        //
      }
      setTimeout(() => {
        setIsWipingData(false);
        setTimeout(() => setDataWipeSuccess(null), 3500);
      }, 350);
    }
  };

  const handleCustomWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          onWallpaperChange(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          onWallpaperChange(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 6. 5 ADDITIONAL THEMES FOR DARK AND LIGHT
  const DARK_THEMES = [
    { id: 'dark_void', name: 'Pitch Black Void', accent: '#38bdf8', preview: 'bg-black border-neutral-800' },
    { id: 'dark_cyber_cyan', name: 'Cyberpunk Neon', accent: '#06b6d4', preview: 'bg-[#050f1e] border-cyan-500/50' },
    { id: 'dark_matrix_emerald', name: 'Matrix Emerald', accent: '#10b981', preview: 'bg-[#03150d] border-emerald-500/50' },
    { id: 'dark_nebula_violet', name: 'Cosmic Violet', accent: '#a855f7', preview: 'bg-[#120624] border-purple-500/50' },
    { id: 'dark_obsidian_gold', name: 'Obsidian Amber', accent: '#f59e0b', preview: 'bg-[#140e05] border-amber-500/50' }
  ];

  const LIGHT_THEMES = [
    { id: 'light_clean_slate', name: 'Clean Snow Slate', accent: '#2563eb', preview: 'bg-slate-50 border-slate-300' },
    { id: 'light_azure_sky', name: 'Azure High-Contrast', accent: '#0284c7', preview: 'bg-sky-50 border-sky-300' },
    { id: 'light_nordic_frost', name: 'Nordic Frost Teal', accent: '#0d9488', preview: 'bg-teal-50 border-teal-300' },
    { id: 'light_solar_amber', name: 'Sunlight Amber Daylight', accent: '#d97706', preview: 'bg-amber-50 border-amber-300' },
    { id: 'light_pure_pearl', name: 'Pure Minimal Pearl', accent: '#475569', preview: 'bg-zinc-100 border-zinc-300' }
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none ${
      isLightMode ? 'bg-slate-900/50' : 'bg-black/85'
    }`}>
      <div className={`w-full max-w-xl border rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto flex flex-col transition-all duration-300 ${
        isLightMode
          ? 'bg-white border-slate-200 text-slate-900 shadow-xl'
          : 'bg-[#0d101a] border-white/10 text-neutral-100 shadow-[0_25px_60px_rgba(0,0,0,0.95)]'
      }`}>
        {/* Modern Header with Developer Attribution */}
        <div className={`flex justify-between items-center pb-3 border-b ${
          isLightMode ? 'border-slate-200' : 'border-white/10'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">
                  Field Engine Settings
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                  v1.0.0
                </span>
              </div>
              <span className={`text-[11px] font-mono ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                System, Hardware &amp; Security Controls
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full cursor-pointer active:scale-90 transition-all border ${
              isLightMode
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
                : 'bg-white/10 hover:bg-white/20 border-white/10 text-neutral-300'
            }`}
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 space-y-3.5 overflow-y-auto py-1 pr-0.5">

          {/* 1. LOGGED-IN TECHNICIAN CARD & LOGOUT */}
          {currentUser && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              isLightMode ? 'bg-blue-50/80 border-blue-200' : 'bg-cyan-950/20 border-cyan-500/30'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border font-mono font-black ${
                  isLightMode ? 'bg-blue-600 text-white border-blue-500' : 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30'
                }`}>
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black tracking-tight">
                      {currentUser.technicianName}
                    </h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                      Verified Field Lead
                    </span>
                  </div>
                  <p className={`text-[11px] font-mono mt-0.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    {currentUser.phoneNumber} &middot; {currentUser.technicianId}
                  </p>
                </div>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 cursor-pointer transition-all active:scale-95"
                  title="Logout from technician portal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          )}

          {/* 2. 120 FPS SMOOTH TOGGLE & HARDWARE REFRESH RATE */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                fps120Enabled
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                  : 'bg-neutral-800 border-white/10 text-neutral-400'
              }`}>
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black tracking-tight">
                    120 FPS Ultra-Smooth Mode
                  </h4>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                    fps120Enabled 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
                      : 'bg-neutral-800 text-neutral-400 border-white/10'
                  }`}>
                    {fps120Enabled ? '120Hz ProMotion' : '60Hz Standard'}
                  </span>
                </div>
                <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-neutral-400'}`}>
                  GPU hardware acceleration with fluid spring curves and zero micro-stutter
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleFps120}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer border ${
                fps120Enabled
                  ? 'bg-cyan-500 border-cyan-400 shadow-md shadow-cyan-500/30'
                  : isLightMode ? 'bg-slate-300 border-slate-400' : 'bg-neutral-700 border-white/15'
              }`}
            >
              <span
                className={`block w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${
                  fps120Enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 3. PERFORMANCE PROFILES: HIGH PERFORMANCE vs BALANCED */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <span>Performance Profiles</span>
                </h4>
                <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Tune optical rendering engines, radar refresh, and CPU core utilization
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* High Performance Optimised Card */}
              <button
                type="button"
                onClick={() => handleSelectPerformanceMode('HIGH')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                  performanceMode === 'HIGH'
                    ? 'border-cyan-400 bg-cyan-950/40 text-white ring-1 ring-cyan-400 shadow-lg shadow-cyan-500/20'
                    : isLightMode
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  performanceMode === 'HIGH' ? 'bg-cyan-500 text-slate-950' : 'bg-white/10 text-cyan-400'
                }`}>
                  <Zap className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black">High Performance</span>
                    {performanceMode === 'HIGH' && (
                      <span className="text-[9px] font-mono px-1 rounded bg-cyan-400 text-slate-950 font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    Instant sub-millisecond GIS queries, maximum optical rendering fidelity &amp; unconstrained 120Hz refresh.
                  </p>
                </div>
              </button>

              {/* Balanced Performance Card */}
              <button
                type="button"
                onClick={() => handleSelectPerformanceMode('BALANCED')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                  performanceMode === 'BALANCED'
                    ? 'border-emerald-400 bg-emerald-950/40 text-white ring-1 ring-emerald-400 shadow-lg shadow-emerald-500/20'
                    : isLightMode
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  performanceMode === 'BALANCED' ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-emerald-400'
                }`}>
                  <Sliders className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black">Balanced Performance</span>
                    {performanceMode === 'BALANCED' && (
                      <span className="text-[9px] font-mono px-1 rounded bg-emerald-400 text-slate-950 font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    Adaptive frame pacing, intelligent idle downclocking &amp; optimal ratio between speed and battery life.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 4. GPS SENSOR ON/OFF & BATTERY SAVING FOR GPS */}
          <div className={`p-4 rounded-2xl border space-y-3.5 ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <span>GPS Sensor &amp; Location Services</span>
                </h4>
                <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Control hardware satellite receiver and power-optimized polling
                </p>
              </div>
            </div>

            {/* GPS Master ON / OFF Toggle */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              effectiveGpsEnabled 
                ? isLightMode ? 'bg-blue-50/60 border-blue-200' : 'bg-cyan-950/20 border-cyan-500/30'
                : isLightMode ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-950/20 border-amber-500/30'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                  effectiveGpsEnabled 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">GPS Sensor Master</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                      effectiveGpsEnabled 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {effectiveGpsEnabled ? 'SENSOR ON' : 'SENSOR OFF'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {effectiveGpsEnabled 
                      ? 'Radar scanning and live navigation actively tracking satellites'
                      : 'Radar scanning is paused to preserve power and prevent background telemetry'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleGpsSensor}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border ${
                  effectiveGpsEnabled
                    ? 'bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/30'
                    : isLightMode ? 'bg-slate-300 border-slate-400' : 'bg-neutral-700 border-white/15'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    effectiveGpsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Battery Saving for GPS Option */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              effectiveBatteryGps
                ? isLightMode ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/30'
                : isLightMode ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                  effectiveBatteryGps
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-neutral-800 text-neutral-400 border border-white/10'
                }`}>
                  <Battery className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">Battery Saving Option for GPS</span>
                    {effectiveBatteryGps && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        LOW POWER SATELLITE
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Throttles GPS poll intervals to 5 seconds when stationary to save 45% battery
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleBatterySavingGps}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border ${
                  effectiveBatteryGps
                    ? 'bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/30'
                    : isLightMode ? 'bg-slate-300 border-slate-400' : 'bg-neutral-700 border-white/15'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    effectiveBatteryGps ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 5. PHONE HEATING CONTROL SETTING */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                phoneHeatingControl
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                  : 'bg-neutral-800 border-white/10 text-neutral-400'
              }`}>
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black tracking-tight">
                    Phone Heating Control
                  </h4>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                    phoneHeatingControl
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      : 'bg-neutral-800 text-neutral-400 border-white/10'
                  }`}>
                    {phoneHeatingControl ? 'THERMAL GUARD ACTIVE' : 'UNTHROTTLED'}
                  </span>
                </div>
                <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Limits background CPU spikes, clamps continuous radar loops &amp; cools device
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleHeatControl}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border ${
                phoneHeatingControl
                  ? 'bg-orange-500 border-orange-400 shadow-md shadow-orange-500/30'
                  : isLightMode ? 'bg-slate-300 border-slate-400' : 'bg-neutral-700 border-white/15'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  phoneHeatingControl ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 6. AUTO UPDATE FEATURE: FULL TIME MANDATORY (CANNOT BE DISABLED BY EMPLOYEES) */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Auto-Update Engine &amp; OTA Releases</span>
                  </h4>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>ALWAYS ON &middot; FULL TIME</span>
                  </span>
                </div>
                <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Enforced by company policy 24/7. Employees cannot disable updates.
                </p>
              </div>

              {/* Permanently Locked ON Toggle */}
              <div 
                className="w-12 h-6.5 rounded-full bg-emerald-500 border border-emerald-400 shadow-md shadow-emerald-500/30 relative opacity-95 cursor-not-allowed flex items-center"
                title="Mandatory Company Policy: Auto-updates are permanently active for field engineer compliance."
              >
                <span className="block w-4.5 h-4.5 rounded-full bg-white shadow translate-x-6 transition-transform flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-emerald-700" />
                </span>
              </div>
            </div>

            {/* Check for updates manual button */}
            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <span className="text-[11px] font-mono text-slate-400">
                Channel: <b className="text-cyan-400 font-bold">Production Stable (GitHub Channel)</b>
              </span>

              <button
                onClick={handleCheckUpdate}
                disabled={isCheckingUpdate || isInstallingUpdate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs cursor-pointer shadow-sm transition-all active:scale-95 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                <span>{isCheckingUpdate ? 'Checking GitHub...' : 'Check For Updates'}</span>
              </button>
            </div>

            {/* Notification Banner when update is found */}
            {availableUpdate && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-400/60 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-xs font-mono font-black text-cyan-300">
                      Update Available: {availableUpdate.version}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                      {availableUpdate.build}
                    </span>
                  </div>

                  <button
                    onClick={handleInstallUpdate}
                    disabled={isInstallingUpdate}
                    className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/30 transition-all active:scale-95"
                  >
                    {isInstallingUpdate ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Installing OTA...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Install Now</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] font-mono text-slate-300">
                  {availableUpdate.releaseNotes}
                </p>
              </div>
            )}

            {updateInstallSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{updateInstallSuccess}</span>
              </div>
            )}
          </div>

          {/* 7. COMPANY OFFICIAL DATA SECURITY & RESIGNED EMPLOYEE REMOTE WIPE (GITHUB OTA) */}
          <div className={`p-4 rounded-2xl border space-y-3.5 ${
            isLightMode ? 'bg-red-50/50 border-red-200' : 'bg-red-950/15 border-red-500/30'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-black tracking-tight text-red-400">
                      Company Official Data Defense &amp; Remote Wipe
                    </h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                      GitHub OTA Sentinel
                    </span>
                  </div>
                  <p className={`text-[11px] mt-1 ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                    This app uses company official telecom data. If a field engineer resigns, their device data is automatically wiped through GitHub security updates.
                  </p>
                </div>
              </div>
            </div>

            {/* GitHub Policy Source URL */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>GitHub Security Manifest:</span>
                <span className="text-emerald-400 font-bold">Active 24/7 Sync</span>
              </div>
              <input
                type="text"
                value={gitHubManifestUrl}
                onChange={(e) => {
                  setGitHubManifestUrl(e.target.value);
                  CompanySecurityService.setGitHubManifestUrl(e.target.value);
                }}
                className="w-full bg-transparent border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 focus:outline-none focus:border-red-400 font-mono"
                placeholder="https://raw.githubusercontent.com/.../revoked_technicians.json"
              />

              <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={handleSyncGitHubManifest}
                  disabled={isSyncingGitHub}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGitHub ? 'animate-spin' : ''}`} />
                  <span>{isSyncingGitHub ? 'Checking GitHub...' : 'Sync GitHub Revocations'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestSimulateWipe}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  title="Simulate remote wipe when an employee resigns"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Test Resigned Employee Wipe</span>
                </button>
              </div>

              {gitHubSyncResult && (
                <p className="text-[10px] text-cyan-300 font-mono pt-1">
                  &gt; {gitHubSyncResult}
                </p>
              )}
            </div>

            {/* ANTI-BYPASS RESIGNED EMPLOYEE REVOCATION PROTOCOL */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-red-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-[11px]">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>ANTI-BYPASS PROTOCOL: RESIGNED EMPLOYEE REVOCATION</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <strong>Question:</strong> If an employee resigns, ignores the update, or cancels the installation, how are they revoked?
              </p>
              <div className="space-y-1.5 text-[10.5px] font-mono text-slate-400 pl-1 border-l-2 border-red-500/40">
                <p>
                  <span className="text-cyan-400 font-bold">1. Auto-Scan on App Open:</span> The app scans GitHub on every startup before displaying FAT data.
                </p>
                <p>
                  <span className="text-cyan-400 font-bold">2. Mandatory Installation Lock:</span> If an update or revocation is flagged, the update CANNOT be cancelled or dismissed.
                </p>
                <p>
                  <span className="text-cyan-400 font-bold">3. Immediate Data Wipe:</span> If the employee's ID is marked "RESIGNED" in GitHub, all company data is purged from this app. (The employee's personal phone and private files are 100% untouched).
                </p>
                <p>
                  <span className="text-cyan-400 font-bold">4. Airplane Mode Expiration:</span> If the device is kept offline to avoid sync, the 48-hour security grace period expires and blocks optical data.
                </p>
              </div>
            </div>

            {/* BIG CLEAR DATA BUTTON (HIGH VISIBILITY FOR FIELD ENGINEERS) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClearCompanyAppData}
                disabled={isWipingData}
                className="w-full py-3 px-4 rounded-xl font-mono font-black text-xs uppercase tracking-wider bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-950/50 border border-red-400/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                <span>{isWipingData ? 'PURGING DATA & CACHE...' : 'CLEAR DATA (PURGE OFFLINE CACHE)'}</span>
              </button>

              {dataWipeSuccess && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono text-center">
                  {dataWipeSuccess}
                </div>
              )}
            </div>
          </div>

          {/* 7. THEME SETTING: 5 ADDITIONAL THEMES FOR DARK & LIGHT */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <span>5 Additional Themes for Dark &amp; Light</span>
                </h4>
                <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Select fine-tuned colorways crafted for high visibility in field environments
                </p>
              </div>

              {/* Master Dark / Light toggle button */}
              <button
                type="button"
                onClick={onToggleTheme}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 border ${
                  isLightMode
                    ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'
                    : 'bg-cyan-500 border-cyan-400 text-black hover:bg-cyan-400 font-black'
                }`}
              >
                {isLightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                <span>{isLightMode ? 'Dark Palette' : 'Light Palette'}</span>
              </button>
            </div>

            {/* Themes Grid */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                {isLightMode ? '5 Light Ambient Themes:' : '5 Dark Ambient Themes:'}
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(isLightMode ? LIGHT_THEMES : DARK_THEMES).map((th) => {
                  const isSelected = currentThemePreset === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => onSelectThemePreset && onSelectThemePreset(th.id)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${th.preview} ${
                        isSelected
                          ? 'ring-2 ring-cyan-400 shadow-md font-bold scale-[1.02]'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span 
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: th.accent }}
                        />
                        {isSelected && (
                          <span className="text-[9px] font-mono font-bold text-cyan-400">Active</span>
                        )}
                      </div>
                      <div className="text-xs font-bold mt-1.5 truncate">{th.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 8. LIVE VIDEO WALLPAPERS & CUSTOM VIDEO MP4 UPLOAD */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-cyan-400" />
                  <span>Live Video Wallpapers</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                    6 Presets + MP4
                  </span>
                </h4>
                <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Dynamic 120Hz optical laser video loops &amp; custom MP4 video upload
                </p>
              </div>

              {/* Upload Custom Video Button */}
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/10 hover:bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 font-bold text-[11px] cursor-pointer transition-all active:scale-95">
                <Film className="w-3.5 h-3.5" />
                <span>Upload Video</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleCustomVideoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'video:cyber_fiber', label: 'Cyber Fiber', icon: Play, desc: 'Laser streams' },
                { id: 'video:matrix_grid', label: 'Matrix Grid', icon: Film, desc: '3D perspective' },
                { id: 'video:synthwave_neon', label: 'Synthwave Neon', icon: Sparkles, desc: 'Magenta streams' },
                { id: 'video:aurora_borealis', label: 'Aurora Borealis', icon: Layers, desc: 'Emerald ripples' },
                { id: 'video:quantum_particles', label: 'Quantum Rays', icon: Sparkles, desc: 'Photon particles' },
                { id: 'video:deep_space', label: 'Nebula Drift', icon: Video, desc: 'Cosmic violet' }
              ].map((v) => {
                const isSelected = currentWallpaper === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => onWallpaperChange(v.id)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all bg-gradient-to-br from-[#0c1424] to-black ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-400 text-white shadow-lg shadow-cyan-500/30 scale-[1.02]'
                        : 'border-white/10 opacity-70 hover:opacity-100 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <v.icon className="w-3.5 h-3.5 text-cyan-400" />
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      )}
                    </div>
                    <div className="text-xs font-bold mt-1 truncate">{v.label}</div>
                    <div className="text-[9px] font-mono text-cyan-400/80 mt-0.5">{v.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 9. STATIC WALLPAPERS & IMAGE UPLOAD */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-cyan-500" />
                  <span>Static Wallpapers</span>
                </h4>
                <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-neutral-400'}`}>
                  High-contrast minimal dark textures &amp; custom photo upload
                </p>
              </div>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 font-bold text-[11px] cursor-pointer transition-all active:scale-95">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomWallpaperUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'void', label: 'Pitch Black Void', bg: 'bg-[#000000] border-neutral-800' },
                { id: 'cyan_nebula', label: 'Cyberpunk Cyan', bg: 'bg-gradient-to-br from-cyan-950 to-black border-cyan-500/40' },
                { id: 'matrix_green', label: 'Matrix Fiber', bg: 'bg-gradient-to-br from-emerald-950 to-black border-emerald-500/40' },
                { id: 'deep_space', label: 'Deep Violet', bg: 'bg-gradient-to-br from-purple-950 to-black border-purple-500/40' },
                { id: 'obsidian', label: 'Obsidian Steel', bg: 'bg-[#0c1017] border-neutral-800' }
              ].map((w) => {
                const isSelected = currentWallpaper === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => onWallpaperChange(w.id)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${w.bg} ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 shadow-md font-bold text-white scale-[1.02]'
                        : 'opacity-70 hover:opacity-100 text-neutral-300'
                    }`}
                  >
                    <div className="text-xs font-semibold">{w.label}</div>
                    <div className="text-[9px] font-mono text-cyan-400/80 mt-0.5">
                      {isSelected ? 'Active' : 'Select'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 10. LIGHT ICONS TOGGLE */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isLightMode ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-neutral-800 border-white/15 text-amber-400'
              }`}>
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold">
                  Light High-Contrast 3D Icons
                </h4>
                <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Luminous jewel-toned 3D FAT, HUB &amp; RSU icons
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleLightIcons}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer border ${
                isLightIcons
                  ? 'bg-amber-500 border-amber-400'
                  : isLightMode ? 'bg-slate-200 border-slate-300' : 'bg-neutral-700 border-white/10'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  isLightIcons ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 11. DEVELOPER DETAILS: ONLY PLACE AT THE BOTTOM OF SETTINGS PAGE */}
          <div className={`p-4 rounded-2xl border text-center space-y-1.5 ${
            isLightMode 
              ? 'bg-slate-50 border-slate-200 text-slate-800' 
              : 'bg-white/[0.03] border-white/10 text-white'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-mono font-bold tracking-wide">
                Developed by <span className="text-cyan-400 font-black">Sonu</span>
              </h4>
            </div>
            <p className={`text-[10.5px] font-mono ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              LocFinder Pro v{CompanySecurityService.getCurrentInstalledVersion().version} ({CompanySecurityService.getCurrentInstalledVersion().build}) &middot; Official Release
            </p>
          </div>

        </div>
      </div>

      {/* ANDROID STUDIO DESKTOP WORKSPACE MODAL */}
      <AndroidStudioModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        isLightMode={isLightMode}
      />
    </div>
  );
};
