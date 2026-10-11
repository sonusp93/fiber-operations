import React, { useState } from 'react';
import { 
  Download, 
  Lock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { CompanySecurityService, AppOtaUpdateInfo, UserAuthProfile } from '../services/companySecurityService';

interface MandatoryOtaUpdateModalProps {
  updateInfo: AppOtaUpdateInfo;
  currentUser: UserAuthProfile | null;
  onUpdateCompleted: () => void;
  onRevocationDetected: () => void;
  isLightMode?: boolean;
}

export const MandatoryOtaUpdateModal: React.FC<MandatoryOtaUpdateModalProps> = ({
  updateInfo,
  currentUser,
  onUpdateCompleted,
  onRevocationDetected,
  isLightMode = false
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAndInstall = () => {
    setIsDownloading(true);
    // Mark version installed in localStorage
    CompanySecurityService.setInstalledVersion(updateInfo.version, updateInfo.build);

    // Launch direct download URL in Android system / browser package installer
    const downloadUrl = updateInfo.downloadUrl || `https://github.com/sonusp93/fiber-operations/releases/download/v${updateInfo.version}/LocFinderPro.apk`;

    try {
      if (typeof window !== 'undefined') {
        window.location.href = downloadUrl;
      }
    } catch {
      window.open(downloadUrl, '_system');
    }

    setTimeout(() => {
      onUpdateCompleted();
    }, 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-[9998] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`w-full max-w-lg p-6 sm:p-7 rounded-[32px] border shadow-2xl relative overflow-hidden space-y-5 transition-all ${
        isLightMode
          ? 'bg-white text-slate-900 border-blue-500/40 shadow-blue-500/20'
          : 'bg-[#090d18] text-white border-cyan-500/40 shadow-[0_0_80px_rgba(6,182,212,0.25)]'
      }`}>
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Mandatory Badge */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-cyan-500/30 shrink-0">
              <Download className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>MANDATORY COMPANY UPDATE</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  v{updateInfo.version}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-1">
                Firmware &amp; Optical Security Upgrade
              </h2>
            </div>
          </div>
        </div>

        {/* Corporate Policy Notice */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>ENTERPRISE DATA PROTECTION POLICY</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            Official company policy requires all field engineers to maintain current firmware to access confidential FAT terminal records and optical network topologies.
          </p>
          <div className="pt-1 border-t border-white/5 flex items-start gap-2 text-[10.5px] text-amber-300 font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              <strong>Mandatory Firmware Upgrade:</strong> Tap the button below to download and install the official v{updateInfo.version} APK update file directly.
            </span>
          </div>
        </div>

        {/* Action Button: Download & Install APK Update */}
        <div className="space-y-2 relative z-10 pt-1">
          <button
            onClick={handleDownloadAndInstall}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-black text-sm font-mono flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/30 cursor-pointer active:scale-95 transition-all"
          >
            <Download className="w-5 h-5 stroke-[2.5]" />
            <span>{isDownloading ? 'Downloading v' + updateInfo.version + ' APK...' : 'Download & Install v' + updateInfo.version + ' APK Update'}</span>
            <ExternalLink className="w-4 h-4 text-slate-900" />
          </button>
        </div>

        {/* Release Notes Summary */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5 text-xs relative z-10">
          <div className="text-cyan-300 font-mono font-bold text-[10px] uppercase tracking-wider">
            Changelog &middot; {updateInfo.build}
          </div>
          <p className="text-[11px] font-mono text-slate-200">{updateInfo.releaseNotes}</p>
        </div>

        {/* Lockout Warning */}
        <div className="text-center text-[10.5px] font-mono text-slate-400 pt-1 relative z-10">
          Lockout Enforcement: Access to fiber coordinates is locked until update verification completes.
        </div>
      </div>
    </div>
  );
};
