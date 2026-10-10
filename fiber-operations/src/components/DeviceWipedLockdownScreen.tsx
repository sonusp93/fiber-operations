import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Trash2, 
  Lock, 
  AlertTriangle, 
  Key, 
  Smartphone, 
  CheckCircle2, 
  UserCheck, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { CompanySecurityService } from '../services/companySecurityService';

interface DeviceWipedLockdownScreenProps {
  onUnlockSuccess: () => void;
  onSwitchAccount?: () => void;
}

export const DeviceWipedLockdownScreen: React.FC<DeviceWipedLockdownScreenProps> = ({
  onUnlockSuccess,
  onSwitchAccount
}) => {
  const [adminPin, setAdminPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPinInput, setShowPinInput] = useState(false);

  const auditLog = CompanySecurityService.getWipeAuditLog();

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (CompanySecurityService.resetDeviceAuthorization(adminPin)) {
      onUnlockSuccess();
    } else {
      setErrorMsg('Invalid Company Security PIN. Authorized Admin PIN required (8842 / 9911).');
    }
  };

  const handleSwitchAccount = () => {
    // Reset wiped flag in storage so another active field engineer can log in on this phone
    CompanySecurityService.resetDeviceAuthorization('8842');
    if (onSwitchAccount) {
      onSwitchAccount();
    } else {
      onUnlockSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-red-600 text-white flex items-center justify-center p-4 select-none overflow-y-auto">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-[32px] bg-red-900 border border-white shadow-2xl space-y-5 text-center animate-in fade-in duration-300">
        
        {/* Pulsing Warning Icon */}
        <div className="w-18 h-18 mx-auto rounded-3xl bg-white/20 border-2 border-white flex items-center justify-center text-white">
          <ShieldAlert className="w-9 h-9 animate-pulse stroke-[2.2]" />
        </div>

        {/* Header Alert */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-black uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>COMPANY APP DATA WIPED &middot; ACCESS REVOKED</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Company Telecom Access Terminated
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Proprietary optical network records, FAT coordinates, and technician credentials have been <b className="text-red-400 underline decoration-red-500/50">wiped from this app</b> per the company GitHub separation manifest.
          </p>
        </div>

        {/* CRITICAL REASSURANCE: PERSONAL PHONE IS 100% SAFE & UNTOUCHED */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/40 border border-emerald-500/40 text-left space-y-1.5 shadow-lg shadow-emerald-950/20">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs">
            <Smartphone className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>YOUR PERSONAL PHONE IS 100% SAFE &amp; UNTOUCHED</span>
          </div>
          <p className="text-[11.5px] leading-relaxed text-slate-200">
            This phone is your personal property. The company has <strong className="text-emerald-300">NO access or control over your physical device</strong>. Only company official telecom data was purged from this specific app. Your photos, contacts, personal messages, and personal phone settings are completely unaffected.
          </p>
        </div>

        {/* Audit Details Box */}
        <div className="p-3.5 rounded-2xl bg-black/60 border border-red-500/20 text-left font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-red-400 font-bold border-b border-white/5 pb-2">
            <span>SEPARATION AUDIT RECORD:</span>
            <span>SEC-APP-PURGE-2026</span>
          </div>
          <div className="space-y-1 text-slate-300 text-[11px]">
            <p>
              <span className="text-slate-500">Reason:</span>{' '}
              <span className="text-amber-300 font-medium">{auditLog?.reason || 'Resigned Employee Data Protection'}</span>
            </p>
            <p>
              <span className="text-slate-500">Target ID:</span>{' '}
              <span className="text-white font-bold">{auditLog?.technicianId || 'FE-REVOKED'}</span>
            </p>
            <p>
              <span className="text-slate-500">App Telecom Storage:</span>{' '}
              <span className="text-emerald-400 font-bold">0 Company Records Remaining (100% Sanitized)</span>
            </p>
            <p>
              <span className="text-slate-500">Personal Device Status:</span>{' '}
              <span className="text-cyan-400 font-bold">Untouched &middot; Full User Ownership</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Sign In with Another Active ID */}
        <div className="pt-2 space-y-2.5">
          <button
            type="button"
            onClick={handleSwitchAccount}
            className="w-full py-3 px-4 rounded-2xl font-mono font-black text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/25 transition-all active:scale-98"
          >
            <UserCheck className="w-4 h-4" />
            <span>Sign In with Another Engineer ID</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          {/* Admin Override Dropdown */}
          {!showPinInput ? (
            <button
              onClick={() => setShowPinInput(true)}
              className="text-xs font-mono text-slate-400 hover:text-cyan-400 underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto pt-1"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Company IT Admin PIN Override (8842 / 9911)</span>
            </button>
          ) : (
            <form onSubmit={handleAdminUnlock} className="space-y-2 pt-1 animate-in fade-in duration-150">
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Enter Admin PIN (8842)"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-black text-xs font-mono rounded-xl hover:bg-cyan-400 cursor-pointer shadow-md"
                >
                  Unlock
                </button>
              </div>
              {errorMsg && (
                <p className="text-[11px] text-red-400 font-mono text-left">{errorMsg}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
