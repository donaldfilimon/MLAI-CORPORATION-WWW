import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  props!: Props;
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
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-black/90">
          <h2 className="text-2xl font-bold text-red-500 mb-4">CRITICAL SYSTEM ERROR</h2>
          <p className="text-text-dim mb-6">
            A fatal exception has occurred in the neural bridge. Please contact support to resolve this issue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-cyan-900 border border-cyan-500 text-cyan-400 font-mono hover:bg-cyan-800 transition-colors"
          >
            REINITIALIZE_SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
