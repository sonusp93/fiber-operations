import React, { useState } from 'react';
import { KOTLIN_PROJECT_FILES, KotlinFile } from '../data/kotlinCodeSnippets';
import { Copy, Check, Download, FileCode, Layers, Terminal, Sparkles as LucideSparkles } from 'lucide-react';

const Sparkles = LucideSparkles || ((props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
));

export const KotlinCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<KotlinFile>(KOTLIN_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 overflow-y-auto pb-32">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-neutral-950/90 backdrop-blur-md px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-400 font-semibold tracking-wider uppercase">
            <Sparkles className="w-3 h-3" />
            Android Jetpack Compose
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Kotlin Source Code
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-700/50 text-purple-300 text-xs font-semibold hover:bg-purple-900/60 cursor-pointer min-h-[40px]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownloadFile}
            className="p-2 rounded-xl bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white cursor-pointer"
            title="Download .kt File"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4 max-w-2xl mx-auto w-full">
        {/* Architecture Note */}
        <div className="p-4 rounded-2xl bg-neutral-900/90 border border-purple-500/30 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-white">
            <FileCode className="w-4 h-4 text-purple-400" />
            <span>Target Architecture: Kotlin 2.0 + Jetpack Compose 1.7</span>
          </div>
          <p className="text-neutral-400 leading-relaxed">
            This module provides the complete native Kotlin code implementing the exact screens, sparklines, GIS vector map, hardware switches, and floating frosted pill navigation from the video footage.
          </p>
        </div>

        {/* File Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {KOTLIN_PROJECT_FILES.map((file) => (
            <button
              key={file.filename}
              onClick={() => setSelectedFile(file)}
              className={`px-3 py-2 rounded-xl font-mono text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 min-h-[38px] ${
                selectedFile.filename === file.filename
                  ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-950/50'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-white/5'
              }`}
            >
              {file.filename}
            </button>
          ))}
        </div>

        {/* Selected File Details */}
        <div className="flex justify-between items-center text-xs text-neutral-400 px-1 font-mono">
          <span>{selectedFile.category}</span>
          <span>{selectedFile.description}</span>
        </div>

        {/* Code Block Container */}
        <div className="relative rounded-2xl bg-[#090b10] border border-neutral-800 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-neutral-300 ml-2 font-semibold">
                {selectedFile.filename}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copied to clipboard' : 'Copy snippet'}
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed max-h-[500px]">
            <code>{selectedFile.code}</code>
          </pre>
        </div>

        {/* Android Studio Setup Guide */}
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/5 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>How to run in Android Studio</span>
          </div>
          <ol className="list-decimal list-inside text-neutral-400 space-y-1 font-sans">
            <li>Create a new Project in Android Studio selecting <strong className="text-neutral-200">Empty Activity (Jetpack Compose)</strong>.</li>
            <li>Add <code className="text-cyan-300 bg-neutral-800 px-1 py-0.5 rounded font-mono">androidx.compose.material3:material3</code> to your dependencies.</li>
            <li>Copy the files into your <code className="text-cyan-300 bg-neutral-800 px-1 py-0.5 rounded font-mono">com.vka.telecom.operations</code> package.</li>
            <li>Build and run on your physical Android device or emulator!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
