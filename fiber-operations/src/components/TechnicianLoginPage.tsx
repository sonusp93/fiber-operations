import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Radio, 
  UserCheck, 
  Github, 
  AlertTriangle, 
  CheckCircle2, 
  Key,
  Lock
} from 'lucide-react';
import { 
  CompanySecurityService, 
  CompanyEmployee, 
  UserAuthProfile 
} from '../services/companySecurityService';

export type { UserAuthProfile, CompanyEmployee };

interface TechnicianLoginPageProps {
  onLoginSuccess: (profile: UserAuthProfile) => void;
  isLightMode?: boolean;
}

export const TechnicianLoginPage: React.FC<TechnicianLoginPageProps> = ({
  onLoginSuccess,
  isLightMode = false
}) => {
  const [employeeIdentifier, setEmployeeIdentifier] = useState('');
  const [fieldPasscode, setFieldPasscode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [githubSyncMsg, setGithubSyncMsg] = useState<string | null>(null);
  const [showGithubConfig, setShowGithubConfig] = useState(false);
  const [githubUrl, setGithubUrl] = useState(() => CompanySecurityService.getGitHubManifestUrl());
  const [isDeviceMismatchState, setIsDeviceMismatchState] = useState(false);

  // Auto-sync with GitHub on mount (non-blocking)
  useEffect(() => {
    CompanySecurityService.syncWithGitHubPolicy();
  }, []);

  // Handle Form Submission: 1-Device Hardware Locked Verification
  const handleLoginSubmit = async (e?: React.FormEvent, forceDeviceRelock = false) => {
    if (e) e.preventDefault();
    if (!employeeIdentifier.trim()) {
      setErrorMsg('Please enter your Employee ID or Name');
      return;
    }

    setErrorMsg(null);
    setIsVerifying(true);
    setIsDeviceMismatchState(false);

    try {
      const deviceId = await CompanySecurityService.getDeviceHardwareId();
      const result = await CompanySecurityService.verifyEmployee(
        employeeIdentifier,
        fieldPasscode,
        deviceId,
        forceDeviceRelock
      );

      if (result.isRevoked) {
        setIsVerifying(false);
        setErrorMsg(result.error || 'Access Denied: Resigned Employee ID');
        CompanySecurityService.executeCompanyDataWipe('Resigned employee separation detected during credential check', {
          technicianId: employeeIdentifier,
          technicianName: 'Resigned Personnel',
          phoneNumber: '',
          loginTimestamp: Date.now()
        });
        return;
      }

      if (result.isDeviceMismatch) {
        setIsVerifying(false);
        setIsDeviceMismatchState(true);
        setErrorMsg(result.error || 'Device lock mismatch.');
        return;
      }

      if (result.success && result.employee) {
        const emp = result.employee;
        const profile: UserAuthProfile = {
          technicianId: emp.employeeId,
          technicianName: emp.name,
          phoneNumber: emp.phone,
          role: emp.role,
          loginTimestamp: Date.now(),
          githubVerified: true,
          registeredDeviceId: emp.registeredDeviceId || deviceId
        };

        try {
          if ('vibrate' in navigator) {
            navigator.vibrate([35, 45, 35]);
          }
        } catch {}

        onLoginSuccess(profile);
      } else {
        setIsVerifying(false);
        setErrorMsg(result.error || 'Invalid credentials.');
      }
    } catch {
      setIsVerifying(false);
      setErrorMsg('Error verifying credentials. Please try again.');
    }
  };

  // Sync with Company GitHub Repository
  const handleSyncGithub = async () => {
    setIsSyncingGithub(true);
    setGithubSyncMsg(null);
    setErrorMsg(null);

    CompanySecurityService.setGitHubManifestUrl(githubUrl);
    const res = await CompanySecurityService.syncWithGitHubPolicy();

    setIsSyncingGithub(false);
    setGithubSyncMsg(res.message);
    setTimeout(() => setGithubSyncMsg(null), 5000);
  };

  return (
    <div className={`relative w-full h-screen min-h-screen flex flex-col justify-between overflow-y-auto p-4 sm:p-6 transition-colors duration-300 select-none ${
      isLightMode ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#05070f] text-white'
    }`}>
      {/* Background Cyber Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[550px] rounded-full blur-[140px] opacity-25 ${
          isLightMode ? 'bg-blue-400' : 'bg-cyan-600'
        }`} />
        <div className={`absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[130px] opacity-20 ${
          isLightMode ? 'bg-emerald-300' : 'bg-blue-600'
        }`} />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-md mx-auto pt-2 sm:pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <Radio className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight font-mono">LOCFINDER PRO</span>
              <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                FIELD OS
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">Telecom Field Operations</p>
          </div>
        </div>

        {/* GitHub Managed Badge */}
        <div className={`px-3 py-1.5 rounded-full border text-[11px] font-mono flex items-center gap-1.5 shadow-sm ${
          isLightMode
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-white/10 border-white/15 text-cyan-300'
        }`}>
          <Github className="w-3.5 h-3.5" />
          <span>GitHub Synced</span>
        </div>
      </header>

      {/* Center Authentication Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-4 sm:py-6">
        <div className={`p-6 sm:p-7 rounded-[32px] border shadow-2xl backdrop-blur-3xl transition-all duration-300 space-y-5 ${
          isLightMode
            ? 'bg-white/95 border-slate-200 text-slate-900 shadow-xl shadow-blue-500/5'
            : 'bg-gradient-to-b from-[#0e1220]/95 to-[#080a14]/95 border-cyan-500/30 text-white shadow-[0_20px_60px_rgba(0,0,0,0.85)]'
        }`}>
          {/* Header Description */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight">
                  Field Engineer Sign-In
                </h1>
                <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Direct employee login &middot; No OTP required
                </p>
              </div>
            </div>

            {/* Architecture Banner */}
            <div className={`p-3 rounded-2xl border text-[11px] flex items-center gap-2.5 ${
              isLightMode ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Official Access:</strong> Synchronized with company GitHub security roster.
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl border border-red-500/50 bg-red-500/10 text-red-300 text-xs flex flex-col gap-2.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              {isDeviceMismatchState && (
                <button
                  type="button"
                  onClick={() => handleLoginSubmit(undefined, true)}
                  disabled={isVerifying}
                  className="mt-1 w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>Reset & Activate On This Device</span>
                </button>
              )}
            </div>
          )}

          {/* GitHub Sync Message */}
          {githubSyncMsg && (
            <div className="p-3.5 rounded-2xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{githubSyncMsg}</span>
            </div>
          )}

          {/* FOCUSED LOGIN FORM FOR THE FIELD ENGINEER */}
          <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className={`text-xs font-mono font-bold block ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                Employee ID or Technician Name <span className="text-cyan-400">*</span>
              </label>
              <div className={`h-12 rounded-2xl border px-3 flex items-center gap-2.5 transition-all ${
                isLightMode 
                  ? 'bg-slate-50 border-slate-300 focus-within:border-blue-500 focus-within:bg-white' 
                  : 'bg-white/5 border-white/10 focus-within:border-cyan-400 focus-within:bg-white/[0.08]'
              }`}>
                <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  name="emp_id_no_autofill"
                  autoComplete="off"
                  value={employeeIdentifier}
                  onChange={(e) => {
                    setEmployeeIdentifier(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="e.g. EMP001 or Sonu S Pushpan"
                  className="w-full bg-transparent text-sm font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-mono font-bold block ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                  Field Passcode
                </label>
                <span className="text-[10.5px] font-mono text-slate-400">Default: 1234</span>
              </div>
              <div className={`h-12 rounded-2xl border px-3 flex items-center gap-2.5 transition-all ${
                isLightMode 
                  ? 'bg-slate-50 border-slate-300 focus-within:border-blue-500 focus-within:bg-white' 
                  : 'bg-white/5 border-white/10 focus-within:border-cyan-400 focus-within:bg-white/[0.08]'
              }`}>
                <Key className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  type="password"
                  name="pass_no_autofill"
                  autoComplete="new-password"
                  value={fieldPasscode}
                  onChange={(e) => setFieldPasscode(e.target.value)}
                  placeholder="Enter 4-digit passcode"
                  maxLength={8}
                  className="w-full bg-transparent text-sm font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isVerifying}
              className={`w-full h-12 rounded-2xl font-mono font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg active:scale-98 ${
                isVerifying
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : isLightMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
              }`}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Log In &amp; Enter Field Ops</span>
                </>
              )}
            </button>
          </form>

          {/* GITHUB REPOSITORY MANIFEST CONTROLS (EXPANDABLE) */}
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowGithubConfig(!showGithubConfig)}
              className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5" />
                <span>Company GitHub Roster Source</span>
              </span>
              <span>{showGithubConfig ? '▲ Hide' : '▼ Configure'}</span>
            </button>

            {showGithubConfig && (
              <div className="mt-2.5 p-3 rounded-2xl border border-white/10 bg-black/30 space-y-2 animate-in fade-in duration-150">
                <p className="text-[10px] text-slate-400">
                  Company GitHub raw URL for security roster:
                </p>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://raw.githubusercontent.com/.../employees.json"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10.5px] font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={handleSyncGithub}
                    disabled={isSyncingGithub}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-[10.5px] font-bold flex items-center gap-1 cursor-pointer hover:bg-cyan-500/30"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncingGithub ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 w-full max-w-md mx-auto pb-2 text-center text-[10.5px] font-mono text-slate-500">
        LocFinder Telecom Field Suite &middot; GitHub OTA Corporate Security
      </footer>
    </div>
  );
};
