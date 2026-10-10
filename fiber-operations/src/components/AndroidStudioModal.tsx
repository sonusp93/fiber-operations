import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Terminal, 
  Check, 
  Copy, 
  Download, 
  ExternalLink, 
  FolderCheck, 
  Layers, 
  Cpu, 
  Sparkles as LucideSparkles,
  Code2, 
  FileCode, 
  ShieldCheck,
  Play,
  Hammer
} from 'lucide-react';
import { KOTLIN_PROJECT_FILES, KotlinFile } from '../data/kotlinCodeSnippets';

const Sparkles = LucideSparkles || ((props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
));

interface AndroidStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
}

export const AndroidStudioModal: React.FC<AndroidStudioModalProps> = ({
  isOpen,
  onClose,
  isLightMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'CONFIG' | 'KOTLIN'>('GUIDE');
  const [selectedFile, setSelectedFile] = useState<KotlinFile>(KOTLIN_PROJECT_FILES[0]);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleDownloadKotlinFile = (file: KotlinFile) => {
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-3xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${
          isLightMode 
            ? 'bg-white border-slate-200 text-slate-900 shadow-2xl ring-1 ring-slate-900/10' 
            : 'bg-[#0e1220] border-cyan-500/30 text-white shadow-[0_25px_60px_rgba(0,0,0,0.95)] ring-1 ring-cyan-500/20'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
          isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-[#121629] border-white/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white">
              <Smartphone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Android Studio Desktop Workspace
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" />
                  <span>CONVERTED</span>
                </span>
              </div>
              <p className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Native Android project generated at <code className="font-mono text-cyan-400 font-bold">./android</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLightMode ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-slate-400 hover:text-white'
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS SELECTOR */}
        <div className={`flex border-b px-4 sm:px-5 gap-2 shrink-0 ${
          isLightMode ? 'bg-slate-100/60 border-slate-200' : 'bg-black/30 border-white/5'
        }`}>
          {[
            { id: 'GUIDE', label: '1. Android Studio Setup', icon: Hammer },
            { id: 'CONFIG', label: '2. Project Config & APK', icon: Cpu },
            { id: 'KOTLIN', label: '3. Jetpack Compose Code', icon: FileCode }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: ANDROID STUDIO SETUP GUIDE */}
        {activeTab === 'GUIDE' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className={`p-4 rounded-2xl border ${
              isLightMode ? 'bg-emerald-50/70 border-emerald-200 text-slate-900' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs sm:text-sm">
                <FolderCheck className="w-4 h-4 shrink-0" />
                <span>Your Android Studio project is ready inside the repository!</span>
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                The complete native Android project has been generated in the <code className="font-mono font-bold text-cyan-400">./android</code> folder with Gradle 8, AndroidManifest permissions, and web assets bundled.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Step-by-Step Instructions:
              </h3>

              {/* Step 1 */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">1</span>
                    <span>Open in Android Studio Desktop</span>
                  </div>
                </div>
                <p className={`text-xs leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  Launch <strong>Android Studio</strong> on your computer. In the menu, go to <strong>File → Open...</strong> and select the <strong><code>android</code></strong> directory of this repository:
                </p>
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-cyan-300 flex items-center justify-between">
                  <span>path/to/project/android</span>
                  <button 
                    onClick={() => handleCopyText('android', 'path')}
                    className="p-1 hover:text-white transition-colors"
                    title="Copy path"
                  >
                    {copiedSnippet === 'path' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">2</span>
                  <span>Sync Gradle &amp; Build</span>
                </div>
                <p className={`text-xs leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  Android Studio will detect the project structure and run <strong>Gradle Sync</strong>. If prompted, click <em>Install missing platform(s) and sync project</em>.
                </p>
              </div>

              {/* Step 3 */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">3</span>
                  <span>Run on Real Phone or Emulator</span>
                </div>
                <p className={`text-xs leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  Connect your Android device via USB (enable <em>USB Debugging</em> in Developer Options) or start an Android Virtual Device (AVD). Press the green <strong>Run ▶</strong> button (or <code>Shift + F10</code>).
                </p>
              </div>

              {/* Step 4 */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">4</span>
                  <span>Generate Signed APK for Installation</span>
                </div>
                <p className={`text-xs leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  In Android Studio top menu: <strong>Build → Build Bundle(s) / APK(s) → Build APK(s)</strong>. The output APK will be saved to:
                </p>
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-cyan-300">
                  android/app/build/outputs/apk/debug/app-debug.apk
                </div>
              </div>
            </div>

            {/* SYNC COMMAND */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-cyan-950/40 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-300">
                  Dual-Sync Script (when editing UI):
                </span>
                <button
                  onClick={() => handleCopyText('npm run android:build', 'cmd')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-mono text-xs cursor-pointer"
                >
                  {copiedSnippet === 'cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet === 'cmd' ? 'Copied' : 'Copy Command'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-300 font-mono bg-black/50 p-2.5 rounded-xl border border-white/10">
                npm run android:build
              </p>
              <p className="text-[11px] text-slate-400">
                Running this automatically re-compiles the app and syncs all changes directly into the Android Studio assets folder.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: CONFIG & APK SPECS */}
        {activeTab === 'CONFIG' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Application ID', value: 'com.vka.telecom.operations' },
                { label: 'App Name', value: 'LocFinder Pro' },
                { label: 'Target SDK', value: 'Android 14 / 15 (API 34/35)' },
                { label: 'Minimum SDK', value: 'Android 5.1 (API 22)' },
                { label: 'Gradle Plugin', value: 'com.android.application 8.x' },
                { label: 'Bridge Framework', value: '@capacitor/android 8.5' }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-2xl border ${
                    isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{item.label}</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-cyan-400 mt-1">{item.value}</div>
                </div>
              ))}
            </div>

            <div className={`p-4 rounded-2xl border space-y-3 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
            }`}>
              <div className="flex items-center gap-2 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Configured Android Manifest Permissions:</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {[
                  { perm: 'ACCESS_FINE_LOCATION', desc: 'Real-time GPS RTK high-accuracy satellite location' },
                  { perm: 'ACCESS_COARSE_LOCATION', desc: 'Cellular network tower positioning' },
                  { perm: 'INTERNET', desc: 'Google Maps tiles, live telemetry, and GitHub sync' },
                  { perm: 'ACCESS_NETWORK_STATE', desc: 'Optical link status detection' },
                  { perm: 'VIBRATE', desc: 'Haptic feedback on technician tap & proximity alerts' }
                ].map((p, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-cyan-300 font-bold">{p.perm}</span>
                    <span className="text-slate-400 text-[10px]">{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: JETPACK COMPOSE SOURCE CODE */}
        {activeTab === 'KOTLIN' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* FILE PICKER BAR */}
            <div className={`p-3 border-b flex items-center justify-between gap-2 overflow-x-auto shrink-0 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/10'
            }`}>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {KOTLIN_PROJECT_FILES.map((f) => (
                  <button
                    key={f.filename}
                    onClick={() => setSelectedFile(f)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      selectedFile.filename === f.filename
                        ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                        : isLightMode 
                        ? 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200' 
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {f.filename}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopyText(selectedFile.code, 'kotlin-code')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 font-mono text-xs font-bold cursor-pointer transition-all active:scale-95"
                >
                  {copiedSnippet === 'kotlin-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet === 'kotlin-code' ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => handleDownloadKotlinFile(selectedFile)}
                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                    isLightMode ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                  }`}
                  title="Download .kt File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* FILE METADATA */}
            <div className="px-4 py-2 border-b bg-black/20 text-[11px] font-mono text-slate-400 flex items-center justify-between shrink-0">
              <span>{selectedFile.description}</span>
              <span className="text-purple-400 font-bold">{selectedFile.category}</span>
            </div>

            {/* CODE VIEWER */}
            <div className="flex-1 overflow-auto p-4 bg-[#07090e] font-mono text-xs leading-relaxed select-text">
              <pre className="text-slate-300">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        )}

        {/* MODAL FOOTER */}
        <div className={`p-4 border-t flex items-center justify-between shrink-0 ${
          isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-[#121629] border-white/10'
        }`}>
          <div className="text-xs font-mono text-slate-400">
            Full documentation in <code className="text-cyan-400 font-bold">README_ANDROID_STUDIO.md</code>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-emerald-500/20 transition-all active:scale-95 font-mono"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
