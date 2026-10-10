import React, { useState } from 'react';
import { 
  X, 
  Moon, 
  Sun, 
  RefreshCw, 
  Check, 
  Sparkles as LucideSparkles,
  ShieldCheck, 
  Image as ImageIcon, 
  Upload, 
  Video, 
  Play, 
  Film, 
  User, 
  LogOut, 
  Layers,
  Battery,
  Download,
  CheckCircle2,
  Navigation,
  Compass,
  Palette,
  Lock,
  Smartphone,
  Info,
  CheckCircle
} from 'lucide-react';
import { UserAuthProfile } from './TechnicianLoginPage';
import { CompanySecurityService } from '../services/companySecurityService';

// Crash-proof Sparkles icon fallback
const Sparkles = LucideSparkles || ((props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
));

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
  onSelectThemePreset,
  currentThemePreset = 'dark_void',
  isGpsEnabled: parentGpsEnabled,
  onToggleGps: parentToggleGps,
  isBatterySavingGps: parentBatterySavingGps,
  onToggleBatterySavingGps: parentToggleBatterySavingGps,
  onTriggerOtaUpdate
}) => {
  // GPS Sensor state
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

  // OTA Updates
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [availableUpdate, setAvailableUpdate] = useState<{
    version: string;
    build: string;
    releaseNotes: string;
  } | null>(null);
  const [updateInstallSuccess, setUpdateInstallSuccess] = useState<string | null>(null);

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setAvailableUpdate(null);
    setUpdateInstallSuccess(null);
    try {
      const otaRes = await CompanySecurityService.checkForOtaUpdate();
      const currentVer = CompanySecurityService.getCurrentInstalledVersion().version;

      if (otaRes.hasUpdate && otaRes.update) {
        setAvailableUpdate({
          version: `v${otaRes.update.version}`,
          build: otaRes.update.build || `Build ${otaRes.update.version}`,
          releaseNotes: otaRes.update.releaseNotes || 'New in-app mandatory update available.'
        });
        if (onTriggerOtaUpdate) {
          onTriggerOtaUpdate(otaRes.update);
          onClose();
        }
      } else {
        setUpdateInstallSuccess(`App is up to date! Currently running v${currentVer}.`);
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
        downloadUrl: 'https://github.com/sonusp93/fiber-operations/releases/download/v3.1.5/LocFinderPro.apk'
      });
      onClose();
    }
  };

  // GitHub Roster Sync
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [gitHubSyncResult, setGitHubSyncResult] = useState<string | null>(null);

  const handleSyncGitHubManifest = async () => {
    setIsSyncingGitHub(true);
    setGitHubSyncResult(null);
    try {
      const res = await CompanySecurityService.syncWithGitHubPolicy();
      setGitHubSyncResult(res.message);
    } finally {
      setIsSyncingGitHub(false);
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
        {/* Header */}
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
                  v{CompanySecurityService.getCurrentInstalledVersion().version}
                </span>
              </div>
              <span className={`text-[11px] font-mono ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Hardware GPS, Roster &amp; System Preferences
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

          {/* 1. LOGGED-IN TECHNICIAN PROFILE & LOGOUT */}
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
                    {currentUser ? currentUser.technicianName : 'Active Technician'}
                  </h4>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    {currentUser ? 'Verified' : 'Guest'}
                  </span>
                </div>
                <p className={`text-[11px] font-mono mt-0.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  {currentUser ? `${currentUser.phoneNumber} · ${currentUser.technicianId}` : 'EMP001 · Sonu S Pushpan'}
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
                className="px-3.5 py-2 rounded-xl text-xs font-mono font-black flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white cursor-pointer shadow-lg shadow-red-500/20 transition-all active:scale-95"
                title="Logout from technician session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>

          {/* 2. WHAT'S NEW IN VERSION 3.1.5 (FULL RELEASE CHANGELOG) */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-cyan-400" />
                    <span>What's New in Version {CompanySecurityService.getCurrentInstalledVersion().version}</span>
                  </h4>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                    Changelog
                  </span>
                </div>
                <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Feature comparison &amp; performance upgrades (Before vs After)
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>1. In-App Mandatory OTA Updates (No Browser Navigation)</span>
                </div>
                <p className="text-[10.5px] text-slate-300">
                  <span className="text-amber-400 font-bold">[BEFORE]:</span> Updates required opening external web browser.<br />
                  <span className="text-emerald-400 font-bold">[AFTER]:</span> Mandatory updates patch directly inside the app with full live progress.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>2. Self-Service Reinstallation Device Lock Reset</span>
                </div>
                <p className="text-[10.5px] text-slate-300">
                  <span className="text-amber-400 font-bold">[BEFORE]:</span> Uninstalling app blocked logins with device mismatch errors.<br />
                  <span className="text-emerald-400 font-bold">[AFTER]:</span> Reinstalled app allows 1-click 'Reset &amp; Activate On This Device'.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>3. Tailwind CSS v4 Styling Engine Integration</span>
                </div>
                <p className="text-[10.5px] text-slate-300">
                  <span className="text-amber-400 font-bold">[BEFORE]:</span> Uncompiled Tailwind classes caused unstyled text on dark background.<br />
                  <span className="text-emerald-400 font-bold">[AFTER]:</span> Configured `@tailwindcss/vite` for full cyan glassmorphism UI.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <div className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>4. Accurate Multi-Field Node Search</span>
                </div>
                <p className="text-[10.5px] text-slate-300">
                  <span className="text-amber-400 font-bold">[BEFORE]:</span> Search query was hardcoded to 'HUB-20'.<br />
                  <span className="text-emerald-400 font-bold">[AFTER]:</span> Searches accurately by FAT ID, HUB, RSU, PON, Locality, and Address.
                </p>
              </div>
            </div>
          </div>

          {/* 3. MANDATORY IN-APP OTA ENGINE */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>In-App Firmware Updates &amp; OTA Engine</span>
                  </h4>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>MANDATORY IN-APP</span>
                  </span>
                </div>
                <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Checks GitHub releases and installs updates directly in-app
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <span className="text-[11px] font-mono text-slate-400">
                Channel: <b className="text-cyan-400 font-bold">Official GitHub OTA Engine</b>
              </span>

              <button
                onClick={handleCheckUpdate}
                disabled={isCheckingUpdate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs cursor-pointer shadow-sm transition-all active:scale-95 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                <span>{isCheckingUpdate ? 'Checking GitHub...' : 'Check For Updates'}</span>
              </button>
            </div>

            {availableUpdate && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-400/60 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-xs font-mono font-black text-cyan-300">
                      Update Available: {availableUpdate.version}
                    </span>
                  </div>

                  <button
                    onClick={handleInstallUpdate}
                    className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Patch In-App Now</span>
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

          {/* 4. GPS SENSOR & LOCATION SERVICES */}
          <div className={`p-4 rounded-2xl border space-y-3.5 ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div>
              <h4 className="text-xs font-black flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>GPS Sensor &amp; Location Services</span>
              </h4>
              <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-neutral-400'}`}>
                Hardware satellite receiver control and power-optimized polling
              </p>
            </div>

            {/* GPS Master Toggle */}
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
                    {effectiveGpsEnabled ? 'Radar scanning tracking satellites' : 'Radar scanning paused'}
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

            {/* Battery Saving for GPS */}
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
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Throttles GPS polling when stationary to preserve battery life
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

          {/* 5. GITHUB CORPORATE ROSTER SYNC */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>GitHub Corporate Roster Sync</span>
                </h4>
                <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Synchronizes verified technician IDs with official GitHub manifest
                </p>
              </div>

              <button
                type="button"
                onClick={handleSyncGitHubManifest}
                disabled={isSyncingGitHub}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGitHub ? 'animate-spin' : ''}`} />
                <span>{isSyncingGitHub ? 'Syncing...' : 'Sync Roster'}</span>
              </button>
            </div>

            {gitHubSyncResult && (
              <p className="text-[10px] text-cyan-300 font-mono pt-1">
                &gt; {gitHubSyncResult}
              </p>
            )}
          </div>

          {/* 6. THEMES & COLORWAYS */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <span>Themes &amp; Colorways</span>
                </h4>
                <p className={`text-[11px] mt-0.5 ${isLightMode ? 'text-slate-500' : 'text-neutral-400'}`}>
                  Select field themes optimized for ambient sunlight or night operation
                </p>
              </div>

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
                <span>{isLightMode ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                {isLightMode ? 'Light Themes:' : 'Dark Themes:'}
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

          {/* 7. LIVE VIDEO & STATIC WALLPAPERS */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.04] border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-cyan-400" />
                  <span>Live Video Wallpapers</span>
                </h4>
              </div>

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
        </div>
      </div>
    </div>
  );
};
