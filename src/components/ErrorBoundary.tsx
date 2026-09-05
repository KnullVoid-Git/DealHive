import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCw, Home, ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { convexClient as supabaseClient } from '../services/convex';

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
    this.setState({ errorInfo });
    
    // Log crash reports automatically to system logs database / localStorage
    try {
      supabaseClient.errorLog.report({
        errorMessage: error.message || 'Unknown react lifecycle error',
        errorStack: error.stack || null,
        componentStack: errorInfo.componentStack || null
      });
    } catch (err) {
      console.error('Failed to dispatch crash report to errorLogService:', err);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden select-none">
          {/* Animated decorative grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-500/5 via-transparent to-transparent opacity-60" />
          
          <div className="w-full max-w-[540px] z-10 animate-stagger-item">
            {/* Frosted Glassmorphism card sweep */}
            <Card variant="standard" className="border border-border/80 bg-surface/30 backdrop-blur-xl p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center space-y-6 relative overflow-hidden">
              
              {/* Premium Glow effect */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-500/10 blur-3xl rounded-full" />
              
              {/* Shield/Alert Icon Badge */}
              <div className="relative w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-lg text-red-500 backdrop-blur-md mb-2 animate-bounce">
                <AlertOctagon className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] bg-red-500/10 border border-red-500/25 text-red-500 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  System Exception Trapped
                </span>
                <h2 className="text-xl md:text-2xl font-black text-text-primary sora-heading leading-tight pt-2">
                  Something broke under the hood
                </h2>
                <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                  We've automatically logged this event to our developer console diagnostics feed. The app remains isolated and secured.
                </p>
              </div>

              {/* Collapsible details for devs */}
              {this.state.error && (
                <div className="w-full text-left bg-surface-2/60 border border-border p-4 rounded-xl max-h-[160px] overflow-y-auto text-[10px] font-mono text-text-secondary leading-normal scrollbar-thin select-text">
                  <div className="font-bold text-red-500 mb-1 flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Error: {this.state.error.message}</span>
                  </div>
                  {this.state.error.stack && (
                    <pre className="whitespace-pre-wrap opacity-80 mt-1">{this.state.error.stack}</pre>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <pre className="whitespace-pre-wrap opacity-70 mt-1">{this.state.errorInfo.componentStack}</pre>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row w-full gap-3 pt-2">
                <Button 
                  variant="secondary" 
                  icon={<Home className="w-4 h-4" />} 
                  onClick={this.handleGoHome}
                  className="flex-1 py-2.5 text-xs font-bold"
                >
                  Return to Dashboard
                </Button>
                <Button 
                  variant="primary" 
                  icon={<RotateCw className="w-4 h-4" />} 
                  onClick={this.handleReload}
                  className="flex-1 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                >
                  Reload Application
                </Button>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;

