import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[99999] bg-[#07090f] text-white flex flex-col items-center justify-center p-6 select-none overflow-y-auto">
          <div className="w-full max-w-md p-6 sm:p-7 rounded-[32px] border border-red-500/40 bg-[#0d101a] shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-black tracking-tight text-red-300">
                Application Recovered
              </h1>
              <p className="text-xs text-slate-400">
                UI Render Exception Intercepted
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/30 text-left font-mono text-xs text-red-300 max-h-40 overflow-y-auto break-all">
              {this.state.error?.message || 'Unknown render exception'}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-yellow-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset &amp; Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
