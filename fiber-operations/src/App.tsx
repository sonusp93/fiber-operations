import React, { useState, useEffect, useRef, useCallback } from 'react';
import { App as CapApp } from '@capacitor/app';
import { FatRecord, loadTelecomDatasetAsync, isTelecomDataReady } from './data/telecomDataset';
import { TopHeaderBar } from './components/TopHeaderBar';
import { VideoBottomNavPill, VideoTabType } from './components/VideoBottomNavPill';
import { DashboardModelView } from './components/DashboardModelView';
import { HubDetailsView } from './components/HubDetailsView';
import { FatDirectoryView } from './components/FatDirectoryView';
import { NavigationTarget } from './components/InbuiltDirectionMap';
import { NavigationPopupModal } from './components/NavigationPopupModal';
import { NetworkHierarchyView } from './components/NetworkHierarchyView';
import { FatDetailsUnifiedView } from './components/FatDetailsUnifiedView';
import { HubDetailsPopupModal } from './components/HubDetailsPopupModal';
import { RsuDetailsPopupModal } from './components/RsuDetailsPopupModal';
import { PonPortDetailsPopupModal } from './components/PonPortDetailsPopupModal';
import { SettingsModal } from './components/SettingsModal';
import { RadarScanningView } from './components/RadarScanningView';
import { TechnicianLoginPage, UserAuthProfile } from './components/TechnicianLoginPage';
import { LiveVideoWallpaper } from './components/LiveVideoWallpaper';
import { CompanySecurityService, AppOtaUpdateInfo, DEFAULT_OFFICIAL_EMPLOYEES } from './services/companySecurityService';
import { DeviceWipedLockdownScreen } from './components/DeviceWipedLockdownScreen';
import { MandatoryOtaUpdateModal } from './components/MandatoryOtaUpdateModal';
import { RevocationWarningModal } from './components/RevocationWarningModal';
import { Zap, RefreshCw } from 'lucide-react';

export default function App() {
  // 0. ASYNC TELECOM DATASET READY STATE (Loads local 14MB asset in <15ms without JS bundle bloat)
  const [isDataReady, setIsDataReady] = useState(() => isTelecomDataReady());

  useEffect(() => {
    if (!isDataReady) {
      loadTelecomDatasetAsync().then(() => {
        setIsDataReady(true);
      });
    }
  }, [isDataReady]);
  // 1. TECHNICIAN AUTHENTICATION & SESSION PERSISTENCE (Keeps session logged in when app closes)
  const [currentUser, setCurrentUser] = useState<UserAuthProfile | null>(() => {
    try {
      const saved = localStorage.getItem('locfinder_auth_user');
      if (saved) {
        const parsed: UserAuthProfile = JSON.parse(saved);
        const check = CompanySecurityService.isTechnicianRevoked(parsed);
        if (!check.isRevoked) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const [isDeviceWiped, setIsDeviceWiped] = useState<boolean>(() => {
    return CompanySecurityService.isDeviceWiped();
  });

  const handleLoginSuccess = (profile: UserAuthProfile) => {
    localStorage.setItem('locfinder_auth_user', JSON.stringify(profile));
    setCurrentUser(profile);
  };

  const handleLogout = () => {
    localStorage.removeItem('locfinder_auth_user');
    setCurrentUser(null);
  };

  // 2. APP NAVIGATION & SELECTION STATE
  const [currentTab, setCurrentTab] = useState<VideoTabType>('HOME');
  const [selectedFat, setSelectedFat] = useState<FatRecord | null>(null);
  const [selectedHubModal, setSelectedHubModal] = useState<any | null>(null);
  const [selectedRsuModal, setSelectedRsuModal] = useState<any | null>(null);
  const [selectedPonModal, setSelectedPonModal] = useState<any | null>(null);
  const [activeNavTarget, setActiveNavTarget] = useState<NavigationTarget | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('locfinder_light_mode') === 'true';
  });
  const [isLightIcons, setIsLightIcons] = useState<boolean>(() => {
    return localStorage.getItem('locfinder_light_icons') !== 'false';
  });
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultsCount, setResultsCount] = useState(55);
  const [isNearby1KmOnly, setIsNearby1KmOnly] = useState(false);
  const [isHomeScrolledDown, setIsHomeScrolledDown] = useState(false);
  const dashboardScrollToTopRef = useRef<(() => void) | null>(null);
  const [wallpaper, setWallpaper] = useState<string>(() => {
    return localStorage.getItem('locfinder_wallpaper') || 'void';
  });
  const [themePreset, setThemePreset] = useState<string>(() => {
    return localStorage.getItem('locfinder_theme_preset') || 'dark_void';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRadarGpsMaster, setIsRadarGpsMaster] = useState<boolean>(() => {
    return localStorage.getItem('locfinder_radar_gps_enabled') !== 'false';
  });
  const [isBatterySavingGps, setIsBatterySavingGps] = useState<boolean>(() => {
    return localStorage.getItem('locfinder_gps_battery_saving') === 'true';
  });

  const handleSelectThemePreset = (presetId: string) => {
    setThemePreset(presetId);
    localStorage.setItem('locfinder_theme_preset', presetId);
    if (presetId.startsWith('light_')) {
      setIsLightMode(true);
    } else {
      setIsLightMode(false);
    }
  };

  const handleToggleGpsMaster = () => {
    setIsRadarGpsMaster((prev) => {
      const next = !prev;
      localStorage.setItem('locfinder_radar_gps_enabled', String(next));
      return next;
    });
  };

  const handleToggleBatterySavingGps = () => {
    setIsBatterySavingGps((prev) => {
      const next = !prev;
      localStorage.setItem('locfinder_gps_battery_saving', String(next));
      return next;
    });
  };

  const handleScrolledSearchClick = () => {
    if (dashboardScrollToTopRef.current) {
      dashboardScrollToTopRef.current();
    }
  };

  useEffect(() => {
    localStorage.setItem('locfinder_light_mode', String(isLightMode));
  }, [isLightMode]);

  useEffect(() => {
    localStorage.setItem('locfinder_light_icons', String(isLightIcons));
  }, [isLightIcons]);

  useEffect(() => {
    localStorage.setItem('locfinder_wallpaper', wallpaper);
  }, [wallpaper]);

  // 3. AUTO SCAN APP UPDATE ON APP OPEN & GITHUB RESIGNED EMPLOYEE REVOCATION
  const [pendingMandatoryUpdate, setPendingMandatoryUpdate] = useState<AppOtaUpdateInfo | null>(null);
  const [startupScanNotice, setStartupScanNotice] = useState<string | null>(null);
  const [revocationAlert, setRevocationAlert] = useState<{ name: string; id: string; reason: string } | null>(null);

  // COMPANY DATA WIPE LISTENER & AUTOMATIC GITHUB REVOCATION CHECK ON APP OPEN
  useEffect(() => {
    let isMounted = true;

    const handleWiped = () => {
      setIsDeviceWiped(true);
      setCurrentUser(null);
      setStartupScanNotice(null);
    };

    window.addEventListener('company_data_wipe_executed', handleWiped);

    const performStartupScan = async () => {
      try {
        const scanRes = await CompanySecurityService.autoScanGitHubUpdatesAndSecurity(currentUser);
        if (!isMounted) return;

        if (scanRes.wiped) {
          setIsDeviceWiped(true);
          setCurrentUser(null);
          return;
        }

        const currentInstalledVer = CompanySecurityService.getCurrentInstalledVersion().version;
        if (
          scanRes.updateAvailable &&
          scanRes.updateInfo &&
          CompanySecurityService.isVersionNewer(currentInstalledVer, scanRes.updateInfo.version)
        ) {
          setPendingMandatoryUpdate(scanRes.updateInfo);
        }
      } catch {}
    };

    performStartupScan();

    return () => {
      isMounted = false;
      window.removeEventListener('company_data_wipe_executed', handleWiped);
    };
  }, [currentUser]);

  // REAL-TIME ACCESS REVOCATION & CONTINUOUS BACKGROUND ROSTER SYNC (60s BALANCED)
  useEffect(() => {
    if (!currentUser) return;

    const runBackgroundRosterSync = async () => {
      try {
        const scanRes = await CompanySecurityService.autoScanGitHubUpdatesAndSecurity(currentUser);
        if (scanRes.wiped) {
          const name = currentUser.technicianName;
          const id = currentUser.technicianId;
          setIsDeviceWiped(false);
          setCurrentUser(null);
          localStorage.removeItem('locfinder_auth_user');
          setRevocationAlert({
            name,
            id,
            reason: 'Employee ID deauthorized in corporate GitHub roster'
          });
        } else if (
          scanRes.updateAvailable &&
          scanRes.updateInfo &&
          CompanySecurityService.isVersionNewer(CompanySecurityService.getCurrentInstalledVersion().version, scanRes.updateInfo.version)
        ) {
          setPendingMandatoryUpdate(scanRes.updateInfo);
        }
      } catch {}
    };

    const interval = setInterval(runBackgroundRosterSync, 60000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleWallpaperChange = (newWallpaper: string) => {
    setWallpaper(newWallpaper);
    setIsLightMode(false);
  };

  const handleToggleLightIcons = () => {
    setIsLightIcons((prev) => !prev);
  };

  // Pre-mount all tabs so DOM nodes exist in memory for 120 FPS instant tab switching
  const [visitedTabs] = useState<Set<VideoTabType>>(() => new Set(['HOME', 'RADAR', 'FAT', 'RSU', 'HUB', 'PON']));

  useEffect(() => {
    setIsNavVisible(true);
  }, [currentTab, selectedFat, activeNavTarget]);

  // Tab switching with browser history sync for Android native back swipe
  const handleTabChange = useCallback((tab: VideoTabType) => {
    setSelectedFat(null);
    setActiveNavTarget(null);
    setIsHomeScrolledDown(false);

    if (tab !== currentTab) {
      if (tab !== 'HOME' && currentTab === 'HOME') {
        try {
          window.history.pushState({ tab }, '', `#${tab.toLowerCase()}`);
        } catch {}
      }
      setCurrentTab(tab);
    }
  }, [currentTab]);

  // Back button handler: Returns to HOME or closes open modals/targets
  const handleBack = useCallback(() => {
    if (activeNavTarget) {
      setActiveNavTarget(null);
      return;
    }
    if (selectedFat) {
      setSelectedFat(null);
      return;
    }
    if (isSettingsOpen) {
      setIsSettingsOpen(false);
      return;
    }
    if (currentTab !== 'HOME') {
      setCurrentTab('HOME');
      try {
        if (window.history.state?.tab) {
          window.history.back();
        }
      } catch {}
    }
  }, [activeNavTarget, selectedFat, isSettingsOpen, currentTab]);

  // Android Native Back Gesture & Hardware Back Button Listener via Capacitor App Plugin
  useEffect(() => {
    let isSubscribed = true;

    const setupBackListener = async () => {
      try {
        const handler = await CapApp.addListener('backButton', () => {
          if (!isSubscribed) return;

          if (activeNavTarget) {
            setActiveNavTarget(null);
          } else if (selectedFat) {
            setSelectedFat(null);
          } else if (isSettingsOpen) {
            setIsSettingsOpen(false);
          } else if (currentTab !== 'HOME') {
            setCurrentTab('HOME');
          } else {
            // On HOME tab with no open modals: minimize app cleanly instead of closing abruptly
            CapApp.minimizeApp();
          }
        });

        return () => {
          handler.remove();
        };
      } catch {
        // Fallback for browser popstate
      }
    };

    const cleanupPromise = setupBackListener();

    const handleNativePopState = () => {
      if (activeNavTarget) {
        setActiveNavTarget(null);
      } else if (selectedFat) {
        setSelectedFat(null);
      } else if (isSettingsOpen) {
        setIsSettingsOpen(false);
      } else if (currentTab !== 'HOME') {
        setCurrentTab('HOME');
      }
    };

    window.addEventListener('popstate', handleNativePopState);
    window.addEventListener('backbutton', handleNativePopState);

    return () => {
      isSubscribed = false;
      cleanupPromise.then(cleanup => cleanup && cleanup()).catch(() => {});
      window.removeEventListener('popstate', handleNativePopState);
      window.removeEventListener('backbutton', handleNativePopState);
    };
  }, [activeNavTarget, selectedFat, isSettingsOpen, currentTab]);

  // 1. Direct FAT Navigation & Full View Map
  const handleStartFatNavigation = (fat: FatRecord) => {
    setSelectedFat(null);
    setActiveNavTarget({
      id: fat.id,
      name: `FAT ${fat.fatId}`,
      type: 'FAT',
      lat: fat.fatLat,
      lng: fat.fatLog,
      subtitle: fat.neAddress,
      city: fat.city,
      locality: fat.locality,
      ponPort: fat.ponPort,
      totalCap: fat.totalCap,
      hub: fat.hub,
      rsu: fat.rsu,
      rfsDate: fat.rfsDate
    });
  };

  // 2. Direct HUB Full View Map
  const handleStartHubNavigation = (hub: {
    hub: string;
    rsu: string;
    city: string;
    lat: number;
    lng: number;
    locality: string;
  }) => {
    setSelectedFat(null);
    setActiveNavTarget({
      id: `hub-${hub.hub}`,
      name: `HUB ${hub.hub}`,
      type: 'HUB',
      lat: hub.lat,
      lng: hub.lng,
      subtitle: `Central Distribution Hub · ${hub.locality}`,
      city: hub.city,
      locality: hub.locality,
      rsu: hub.rsu
    });
  };

  // 3. Direct RSU Full View Map
  const handleStartRsuNavigation = (rsu: {
    rsu: string;
    city: string;
    lat: number;
    lng: number;
  }) => {
    setSelectedFat(null);
    setActiveNavTarget({
      id: `rsu-${rsu.rsu}`,
      name: `RSU ${rsu.rsu} Exchange`,
      type: 'RSU',
      lat: rsu.lat,
      lng: rsu.lng,
      subtitle: `Main Optical Backbone Substation · ${rsu.city}`,
      city: rsu.city,
      locality: rsu.city,
      rsu: rsu.rsu
    });
  };

  // Show on HUB tab
  const handleShowOnHubTab = (_fat: FatRecord) => {
    setSelectedFat(null);
    setActiveNavTarget(null);
    setCurrentTab('HUB');
  };

  // canGoBack is TRUE ONLY when there is active back action inside the app.
  // When on HOME with no target/modal, canGoBack is FALSE, allowing native back gesture to close/minimize the app!
  const canGoBack =
    activeNavTarget !== null ||
    selectedFat !== null ||
    isSettingsOpen ||
    currentTab !== 'HOME';

  const toggleNearby1Km = () => {
    setIsNearby1KmOnly((prev) => !prev);
  };

  // INSTANT BRANDED DATA INITIALIZATION SCREEN
  if (!isDataReady) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white p-6 select-none animate-in zoom-in-90 fade-in duration-500">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_50px_rgba(6,182,212,0.5)] transform hover:scale-105 transition-transform duration-300">
            <Zap className="w-10 h-10 fill-white text-white" />
          </div>
          <div className="absolute -inset-4 rounded-full border border-cyan-500/40 animate-ping pointer-events-none" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-400">
          LOCFINDER PRO
        </h1>
        <p className="text-xs font-mono text-cyan-400/90 mb-6 flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          <span>Initializing Field Telecom Network...</span>
        </p>

        <div className="w-52 h-1.5 rounded-full bg-white/10 overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  // IF APP WAS WIPED VIA GITHUB SECURITY PROTOCOL (RESIGNED EMPLOYEE SEPARATION)
  if (isDeviceWiped) {
    return (
      <DeviceWipedLockdownScreen
        onUnlockSuccess={() => {
          setIsDeviceWiped(false);
          setCurrentUser(null);
        }}
        onSwitchAccount={() => {
          setIsDeviceWiped(false);
          setCurrentUser(null);
        }}
      />
    );
  }

  // IF NOT LOGGED IN: DISPLAY DEDICATED TECHNICIAN LOGIN SCREEN
  if (!currentUser) {
    return (
      <TechnicianLoginPage 
        onLoginSuccess={handleLoginSuccess}
        isLightMode={isLightMode}
      />
    );
  }

  return (
    <div
      className={`relative w-full h-screen min-h-screen flex flex-col overflow-hidden transition-smooth-120 select-none animate-app-opening ${
        isLightMode ? 'bg-[#f8fafc] text-slate-900' : 'bg-black text-slate-100'
      }`}
      style={
        isLightMode
          ? themePreset === 'light_azure_sky'
            ? { background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)', color: '#0369a1' }
            : themePreset === 'light_nordic_frost'
            ? { background: 'linear-gradient(180deg, #f0fdfa 0%, #ccfbf1 100%)', color: '#0f766e' }
            : themePreset === 'light_solar_amber'
            ? { background: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)', color: '#b45309' }
            : themePreset === 'light_pure_pearl'
            ? { background: '#f4f4f5', color: '#18181b' }
            : { background: '#f8fafc', color: '#0f172a' }
          : wallpaper.startsWith('data:') || wallpaper.startsWith('http')
          ? {
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.65)), url(${wallpaper})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#000000'
            }
          : themePreset === 'dark_cyber_cyan'
          ? { background: 'radial-gradient(circle at 50% 0%, #082f49 0%, #020617 80%)' }
          : themePreset === 'dark_matrix_emerald'
          ? { background: 'radial-gradient(circle at 50% 0%, #052e16 0%, #020617 80%)' }
          : themePreset === 'dark_nebula_violet'
          ? { background: 'radial-gradient(circle at 50% 0%, #3b0764 0%, #030712 80%)' }
          : themePreset === 'dark_obsidian_gold'
          ? { background: 'radial-gradient(circle at 50% 0%, #451a03 0%, #000000 80%)' }
          : wallpaper === 'cyan_nebula'
          ? { background: 'radial-gradient(circle at 50% 0%, rgba(30,41,59,0.4), #000000 70%)' }
          : wallpaper === 'matrix_green'
          ? { background: 'radial-gradient(circle at 50% 0%, rgba(20,83,45,0.35), #000000 70%)' }
          : wallpaper === 'deep_space'
          ? { background: 'radial-gradient(circle at 50% 0%, rgba(88,28,135,0.35), #000000 70%)' }
          : wallpaper === 'obsidian'
          ? { background: '#0c1424' }
          : { background: '#0e121e' }
      }
    >
      {/* LIVE VIDEO WALLPAPER BACKGROUND LAYER */}
      <LiveVideoWallpaper wallpaper={wallpaper} isLightMode={isLightMode} />

      {/* Static Background Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" />

      {/* PRIMARY HEADER BAR WITH SEARCH, 1KM TOGGLE & QUICK ACTIONS */}
        <div className="animate-header-enter w-full relative z-40">
          <TopHeaderBar
            canGoBack={canGoBack}
            onBack={handleBack}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onToggleTheme={() => setIsLightMode(!isLightMode)}
            isLightMode={isLightMode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            resultsCount={resultsCount}
            currentTab={currentTab}
            isNearby1KmOnly={isNearby1KmOnly}
            onToggleNearby1Km={toggleNearby1Km}
            onSelectFat={(fat) => setSelectedFat(fat)}
            onSwitchTab={(tab) => handleTabChange(tab)}
            isScrolledDown={isHomeScrolledDown}
            onScrolledSearchClick={handleScrolledSearchClick}
            userName={currentUser ? currentUser.technicianName : 'Log In'}
            onLogout={handleLogout}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        </div>

        {/* Viewport Container: 120 FPS GPU Hardware-Accelerated Tab Views with Seamless Zoom In / Zoom Out */}
        <main className="flex-1 w-full overflow-hidden flex flex-col relative z-0">
          <div className="flex-1 w-full h-full relative overflow-hidden">
            {/* TAB 1: HOME DASHBOARD */}
            <div
              className={`absolute inset-0 w-full h-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                currentTab === 'HOME'
                  ? 'opacity-100 scale-100 z-10 pointer-events-auto'
                  : 'opacity-0 scale-95 z-0 pointer-events-none'
              }`}
            >
              <DashboardModelView
                onOpenSearch={() => {}}
                onSelectFat={(fat) => setSelectedFat(fat)}
                onOpenGisMap={() => handleTabChange('HUB')}
                onOpenRadarPage={() => handleTabChange('RADAR')}
                onOpenPonTrunks={() => handleTabChange('PON')}
                onOpenCentralHubs={() => handleTabChange('RSU')}
                onOpenFatTerminals={() => handleTabChange('FAT')}
                isLightMode={isLightMode}
                onBack={handleBack}
                canGoBack={canGoBack}
                isNearby1KmOnly={isNearby1KmOnly}
                onToggleNearby1Km={toggleNearby1Km}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNavigateToFat={handleStartFatNavigation}
                isScrolledDown={isHomeScrolledDown}
                onScrollChange={(scrolled) => setIsHomeScrolledDown(scrolled)}
                onRegisterScrollToTop={(fn) => { dashboardScrollToTopRef.current = fn; }}
                currentUser={currentUser}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
                onLogout={handleLogout}
              />
            </div>

            {/* TAB 2: SEPARATE RADAR SCANNING PAGE */}
            <div
              className={`absolute inset-0 w-full h-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                currentTab === 'RADAR'
                  ? 'opacity-100 scale-100 z-10 pointer-events-auto'
                  : 'opacity-0 scale-95 z-0 pointer-events-none'
              }`}
            >
              {(visitedTabs.has('RADAR') || currentTab === 'RADAR') && (
                <RadarScanningView
                  onNavigateToFat={handleStartFatNavigation}
                  onNavigateToHub={handleStartHubNavigation}
                  onNavigateToRsu={handleStartRsuNavigation}
                  onSelectFat={(fat) => setSelectedFat(fat)}
                  isLightMode={isLightMode}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  isActive={currentTab === 'RADAR'}
                />
              )}
            </div>

            {/* TAB 3: FAT TERMINALS DIRECTORY */}
            <div
              className={`absolute inset-0 w-full h-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                currentTab === 'FAT'
                  ? 'opacity-100 scale-100 z-10 pointer-events-auto'
                  : 'opacity-0 scale-95 z-0 pointer-events-none'
              }`}
            >
              {(visitedTabs.has('FAT') || currentTab === 'FAT') && (
                <FatDirectoryView
                  onSelectFat={(fat) => setSelectedFat(fat)}
                  onNavigateToFat={handleStartFatNavigation}
                  onShowOnMap={handleShowOnHubTab}
                  isLightMode={isLightMode}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onUpdateResultsCount={setResultsCount}
                  isNearby1KmOnly={isNearby1KmOnly}
                  onToggleNearby1Km={toggleNearby1Km}
                  isActive={currentTab === 'FAT'}
                />
              )}
            </div>

            {/* TAB 4: RSU HIERARCHY */}
            <div
              className={`absolute inset-0 w-full h-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                currentTab === 'RSU'
                  ? 'opacity-100 scale-100 z-10 pointer-events-auto'
                  : 'opacity-0 scale-95 z-0 pointer-events-none'
              }`}
            >
              {(visitedTabs.has('RSU') || currentTab === 'RSU') && (
                <NetworkHierarchyView
                  onSelectFat={(fat) => setSelectedFat(fat)}
                  onNavigateToFat={handleStartFatNavigation}
                  onNavigateToRsu={handleStartRsuNavigation}
                  onNavigateToHub={handleStartHubNavigation}
                  isLightMode={isLightMode}
                  searchQuery={searchQuery}
                  onUpdateResultsCount={setResultsCount}
                  isActive={currentTab === 'RSU'}
                />
              )}
            </div>

            {/* TAB 5: CENTRAL HUB DETAILS */}
            <div
              className={`absolute inset-0 w-full h-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                currentTab === 'HUB'
                  ? 'opacity-100 scale-100 z-10 pointer-events-auto'
                  : 'opacity-0 scale-95 z-0 pointer-events-none'
              }`}
            >
              {(visitedTabs.has('HUB') || currentTab === 'HUB') && (
                <HubDetailsView
                  onSelectFat={(fat) => setSelectedFat(fat)}
                  onNavigateToFat={handleStartFatNavigation}
                  onNavigateToHub={handleStartHubNavigation}
                  isLightMode={isLightMode}
                  searchQuery={searchQuery}
                  onUpdateResultsCount={setResultsCount}
                  isNearby1KmOnly={isNearby1KmOnly}
                  onToggleNearby1Km={toggleNearby1Km}
                  isActive={currentTab === 'HUB'}
                />
              )}
            </div>

            {/* TAB 6: PON PORTS & TRUNKS DIRECTORY */}
            <div
              className={`absolute inset-0 w-full h-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                currentTab === 'PON'
                  ? 'opacity-100 scale-100 z-10 pointer-events-auto'
                  : 'opacity-0 scale-95 z-0 pointer-events-none'
              }`}
            >
              {(visitedTabs.has('PON') || currentTab === 'PON') && (
                <FatDirectoryView
                  onSelectFat={(fat) => setSelectedFat(fat)}
                  onNavigateToFat={handleStartFatNavigation}
                  onShowOnMap={handleShowOnHubTab}
                  isLightMode={isLightMode}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onUpdateResultsCount={setResultsCount}
                  isNearby1KmOnly={isNearby1KmOnly}
                  onToggleNearby1Km={toggleNearby1Km}
                  isActive={currentTab === 'PON'}
                />
              )}
            </div>
          </div>

          {/* FAT DETAILS CENTER POPUP MODAL */}
          {selectedFat && (
            <FatDetailsUnifiedView
              fat={selectedFat}
              onBack={() => setSelectedFat(null)}
              onStartNavigation={handleStartFatNavigation}
              onShowOnMap={handleShowOnHubTab}
              isLightMode={isLightMode}
            />
          )}

          {/* HUB DETAILS CENTER POPUP MODAL */}
          {selectedHubModal && (
            <HubDetailsPopupModal
              hub={selectedHubModal}
              onClose={() => setSelectedHubModal(null)}
              onSelectFat={(fat) => setSelectedFat(fat)}
              onStartNavigation={handleStartHubNavigation}
              isLightMode={isLightMode}
            />
          )}

          {/* RSU DETAILS CENTER POPUP MODAL */}
          {selectedRsuModal && (
            <RsuDetailsPopupModal
              rsu={selectedRsuModal}
              onClose={() => setSelectedRsuModal(null)}
              onSelectFat={(fat) => setSelectedFat(fat)}
              onStartNavigation={handleStartRsuNavigation}
              isLightMode={isLightMode}
            />
          )}

          {/* PON PORT DETAILS CENTER POPUP MODAL */}
          {selectedPonModal && (
            <PonPortDetailsPopupModal
              pon={selectedPonModal}
              onClose={() => setSelectedPonModal(null)}
              onSelectFat={(fat) => setSelectedFat(fat)}
              onStartNavigation={handleStartFatNavigation}
              isLightMode={isLightMode}
            />
          )}

          {/* IN-BUILD NAVIGATION POPUP MODAL */}
          {activeNavTarget && (
            <NavigationPopupModal
              target={activeNavTarget}
              onClose={() => setActiveNavTarget(null)}
              isLightMode={isLightMode}
            />
          )}
        </main>

        {/* 5-TAB FLOATING BOTTOM NAVIGATION DOCK WITH 3D COLOURFUL ICONS */}
        <div className="fixed bottom-5 sm:bottom-6 left-0 right-0 z-40 px-3 pointer-events-none flex justify-center animate-bottom-nav-spring">
          <div className="w-full max-w-md pointer-events-auto">
            <VideoBottomNavPill
              currentTab={currentTab}
              onTabChange={handleTabChange}
              isLightMode={isLightMode}
              isVisible={isNavVisible}
            />
          </div>
        </div>

        {/* SETTINGS MODAL */}
        {isSettingsOpen && (
          <SettingsModal
            onClose={() => setIsSettingsOpen(false)}
            isLightMode={isLightMode}
            onToggleTheme={() => setIsLightMode(!isLightMode)}
            currentWallpaper={wallpaper}
            onWallpaperChange={handleWallpaperChange}
            currentUser={currentUser}
            onLogout={handleLogout}
            isLightIcons={isLightIcons}
            onToggleLightIcons={handleToggleLightIcons}
            onSelectThemePreset={handleSelectThemePreset}
            currentThemePreset={themePreset}
            isGpsEnabled={isRadarGpsMaster}
            onToggleGps={handleToggleGpsMaster}
            isBatterySavingGps={isBatterySavingGps}
            onToggleBatterySavingGps={handleToggleBatterySavingGps}
            onTriggerOtaUpdate={(updateInfo) => {
              setPendingMandatoryUpdate(updateInfo);
              setIsSettingsOpen(false);
            }}
          />
        )}

        {/* TECHNICIAN LOGIN MODAL */}
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md">
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Close Login"
              >
                ✕
              </button>
              <TechnicianLoginPage
                onLoginSuccess={(profile) => {
                  handleLoginSuccess(profile);
                  setIsLoginModalOpen(false);
                }}
                isLightMode={isLightMode}
              />
            </div>
          </div>
        )}

        {/* STARTUP GITHUB SCAN STATUS BANNER */}
        {startupScanNotice && !pendingMandatoryUpdate && (
          <div className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
            <div className={`px-3.5 py-1.5 rounded-full text-[11px] font-mono font-bold flex items-center gap-2 shadow-xl backdrop-blur-2xl border ${
              startupScanNotice.includes('✓')
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20'
                : 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50 shadow-cyan-500/20'
            }`}>
              <span className={`w-2 h-2 rounded-full ${startupScanNotice.includes('✓') ? 'bg-emerald-400' : 'bg-cyan-400 animate-ping'}`} />
              <span>{startupScanNotice}</span>
            </div>
          </div>
        )}

        {/* MANDATORY OTA UPDATE MODAL */}
        {pendingMandatoryUpdate && (
          <MandatoryOtaUpdateModal
            updateInfo={pendingMandatoryUpdate}
            currentUser={currentUser}
            onUpdateCompleted={() => {
              const v = pendingMandatoryUpdate.version;
              setPendingMandatoryUpdate(null);
              setStartupScanNotice(`✓ Firmware v${v} installed successfully`);
              setTimeout(() => setStartupScanNotice(null), 3500);
            }}
            onRevocationDetected={() => {
              setPendingMandatoryUpdate(null);
              setIsDeviceWiped(true);
              setCurrentUser(null);
            }}
            isLightMode={isLightMode}
          />
        )}

        {/* REAL-TIME ACCESS REVOCATION ALERT MODAL */}
        {revocationAlert && (
          <RevocationWarningModal
            technicianName={revocationAlert.name}
            technicianId={revocationAlert.id}
            reason={revocationAlert.reason}
            onAcknowledge={() => setRevocationAlert(null)}
            isLightMode={isLightMode}
          />
        )}
    </div>
  );
}
