import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-bg">
          <div className="max-w-md mx-auto space-y-8">
            <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-display font-bold text-white">
                Something went wrong
              </h2>
              <p className="text-text-dim leading-relaxed">
                An unexpected error occurred while rendering the application.
                Our team has been notified. Please try refreshing the page.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                <p className="text-xs font-mono text-red-400/80 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <Button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 mx-auto px-8"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
