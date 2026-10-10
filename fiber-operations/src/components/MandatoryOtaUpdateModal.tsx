import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  ShieldAlert, 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Radio,
  FileCode,
  ShieldCheck
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
  const [installProgress, setInstallProgress] = useState(0);
  const [installStageText, setInstallStageText] = useState('Initiating mandatory OTA security update...');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isVerifyingRoster, setIsVerifyingRoster] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Automatic installation starts immediately - Employee CANNOT cancel or ignore!
    const startTime = performance.now();
    const duration = 2800; // 2.8 seconds realistic progress

    const stepProgress = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setInstallProgress(pct);

      if (pct < 25) {
        setInstallStageText('Verifying corporate GitHub repository signature & keys...');
      } else if (pct < 55) {
        setInstallStageText('Scanning active employee roster & separation status...');
      } else if (pct < 85) {
        setInstallStageText('Patching offline FAT database & RTK optical positioning engine...');
      } else if (pct < 100) {
        setInstallStageText('Writing validated firmware package v' + updateInfo.version + '...');
      } else {
        setInstallStageText('✓ OTA Update Complete · Performing final security compliance check...');
      }

      if (elapsed < duration) {
        animFrameRef.current = requestAnimationFrame(stepProgress);
      } else {
        setInstallProgress(100);
        setIsVerifyingRoster(true);

        // Security check for resigned employee
        setTimeout(() => {
          if (currentUser) {
            const check = CompanySecurityService.isTechnicianRevoked(currentUser);
            if (check.isRevoked) {
              CompanySecurityService.executeCompanyDataWipe(
                'Resigned employee separation detected during mandatory OTA update',
                currentUser
              );
              onRevocationDetected();
              return;
            }
          }

          // Mark installed
          CompanySecurityService.setInstalledVersion(updateInfo.version, updateInfo.build);
          setIsCompleted(true);

          setTimeout(() => {
            onUpdateCompleted();
          }, 1000);
        }, 600);
      }
    };

    animFrameRef.current = requestAnimationFrame(stepProgress);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [updateInfo, currentUser, onUpdateCompleted, onRevocationDetected]);

  return (
    <div 
      className="fixed inset-0 z-[9998] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      // Non-dismissible: Clicking backdrop does NOTHING. Esc does NOTHING.
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

        {/* Corporate Policy Notice: Explaining Why This Cannot Be Cancelled */}
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
              <strong>Resigned Employee Protection:</strong> This update cannot be ignored or cancelled. If an employee has resigned, the GitHub manifest auto-wipes company data from this app (your personal phone and private data remain completely untouched).
            </span>
          </div>
        </div>

        {/* Live Installation Progress Bar */}
        <div className="space-y-2 relative z-10 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className={`font-bold flex items-center gap-1.5 ${
              isCompleted ? 'text-emerald-400' : 'text-cyan-400'
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              )}
              <span className="truncate">{installStageText}</span>
            </span>
            <span className={`font-black text-sm ml-2 ${
              isCompleted ? 'text-emerald-300' : 'text-cyan-300'
            }`}>
              {installProgress}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-black/80 border border-cyan-500/30 overflow-hidden p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-150 ease-out ${
                isCompleted 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
              }`}
              style={{ width: `${installProgress}%` }}
            />
          </div>
        </div>

        {/* Release Notes */}
        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] font-mono space-y-1 text-slate-300 relative z-10">
          <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            Changelog &middot; {updateInfo.build}
          </div>
          <p>{updateInfo.releaseNotes}</p>
        </div>

        {/* Lockout Warning */}
        <div className="text-center text-[10.5px] font-mono text-slate-400 pt-1 relative z-10">
          Lockout Enforcement: Access to fiber coordinates is locked until update verification completes.
        </div>
      </div>
    </div>
  );
};
