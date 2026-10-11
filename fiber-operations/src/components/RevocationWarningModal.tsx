import React from 'react';
import { AlertOctagon, ShieldAlert, LogOut, Check } from 'lucide-react';

interface RevocationWarningModalProps {
  technicianName?: string;
  technicianId?: string;
  reason?: string;
  onAcknowledge: () => void;
  isLightMode?: boolean;
}

export const RevocationWarningModal: React.FC<RevocationWarningModalProps> = ({
  technicianName = 'Active Technician',
  technicianId = 'EMP001',
  reason = 'Deauthorized in official corporate GitHub roster',
  onAcknowledge,
  isLightMode = false
}) => {
  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className={`w-full max-w-md p-6 sm:p-7 rounded-[32px] border shadow-[0_25px_60px_rgba(239,68,68,0.3)] relative overflow-hidden space-y-5 text-center transition-all ${
        isLightMode
          ? 'bg-white text-slate-900 border-red-500/50'
          : 'bg-[#180a0c] text-white border-red-500/50'
      }`}>
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Warning Icon Badge */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/30 animate-pulse">
          <AlertOctagon className="w-8 h-8 stroke-[2.2]" />
        </div>

        {/* Title */}
        <div className="space-y-1.5 relative z-10">
          <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 inline-flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            <span>SECURITY REVOCATION DETECTED</span>
          </span>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-red-400">
            Access Rights Terminated
          </h2>
        </div>

        {/* Alert Details Card */}
        <div className="p-4 rounded-2xl bg-black/50 border border-red-500/30 text-left space-y-2 font-mono text-xs relative z-10">
          <div className="text-slate-300 font-bold flex items-center justify-between border-b border-white/10 pb-2">
            <span>Employee ID: <b className="text-red-400">{technicianId}</b></span>
            <span className="text-[10px] text-slate-400">{technicianName}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300 pt-1">
            Real-time GitHub corporate roster background sync has verified that your employee credentials have been revoked.
          </p>
          <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-[10.5px] text-red-300">
            <strong>Reason:</strong> {reason}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-mono relative z-10">
          Your active session has been automatically terminated and local company cache has been securely wiped.
        </p>

        {/* Acknowledge Button */}
        <button
          onClick={onAcknowledge}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-mono font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer active:scale-95 transition-all relative z-10"
        >
          <LogOut className="w-4 h-4" />
          <span>Acknowledge &amp; Return to Login</span>
        </button>
      </div>
    </div>
  );
};
