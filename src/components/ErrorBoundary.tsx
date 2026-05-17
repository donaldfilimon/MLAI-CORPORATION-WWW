import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Send, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
  status: 'idle' | 'reporting' | 'reported';
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    showDetails: false,
    status: 'idle'
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false, status: 'idle' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught system collision:", error, errorInfo);
  }

  private handleReport = async () => {
    this.setState({ status: 'reporting' });
    // Simulate reporting lag
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.setState({ status: 'reported' });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center bg-black/40 backdrop-blur-xl border border-white/5 m-4 rounded-lg industrial-border">
          <div className="relative mb-6">
            <div className="absolute inset-0 blur-2xl bg-red-500/20 rounded-full" />
            <AlertTriangle className="w-16 h-16 text-red-500 relative animate-pulse" />
          </div>

          <h2 className="text-2xl font-display font-bold text-white tracking-tighter mb-2">
            NEURAL_BRIDGE_COLLISION
          </h2>
          
          <p className="text-text-dim max-w-md mx-auto mb-8 text-sm leading-relaxed">
            A fatal exception has interrupted the synchronization protocol. 
            The current system state has been preserved for diagnostic analysis.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="group flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
              Reinitialize_System
            </button>

            <button
              disabled={this.state.status !== 'idle'}
              onClick={this.handleReport}
              className={cn(
                "group flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                this.state.status === 'reported' && "border-accent text-accent"
              )}
            >
              {this.state.status === 'reported' ? (
                <>Report_Transmitted</>
              ) : (
                <>
                  <Send className={cn("w-4 h-4 transition-transform", this.state.status === 'reporting' && "translate-x-10 opacity-0")} />
                  {this.state.status === 'reporting' ? 'Transmitting...' : 'Report_Error'}
                </>
              )}
            </button>
          </div>

          <div className="mt-8 w-full max-w-xl mx-auto border-t border-white/5 pt-6">
            <button
              onClick={() => this.setState({ showDetails: !this.state.showDetails })}
              className="flex items-center gap-2 text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mx-auto hover:text-white/60 transition-colors"
            >
              {this.state.showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {this.state.showDetails ? 'Hide' : 'Show'} Technical_Diagnostic_Log
            </button>

            <AnimatePresence>
              {this.state.showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 p-4 bg-black/60 border border-white/10 text-left overflow-hidden rounded"
                >
                  <div className="flex items-center gap-2 text-red-400 mb-2 font-mono text-[10px] uppercase">
                    <Terminal className="w-3 h-3" />
                    Stack Trace_
                  </div>
                  <pre className="text-[10px] font-mono text-white/60 whitespace-pre-wrap break-all leading-tight max-h-[200px] overflow-y-auto custom-scrollbar">
                    {this.state.error?.stack || this.state.error?.message || "No stack trace available."}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
