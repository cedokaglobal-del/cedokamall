import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, componentStack: '' };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack?: string }) {
    console.error('ErrorBoundary caught:', error, errorInfo?.componentStack);
    this.setState({ componentStack: errorInfo?.componentStack || '' });
  }

  reset = () => {
    this.setState({ hasError: false, error: null, componentStack: '' });
  };

  render() {
    if (this.state.hasError) {
      const isChunkError = this.state.error?.message?.includes('dynamically imported module') || 
                          this.state.error?.message?.includes('loading chunk');

      return (
        this.props.fallback || (
          <div className="flex h-screen flex-col items-center justify-center bg-background px-4">
            <div className="text-center space-y-6 max-w-md">
              <div className="flex justify-center">
                <AlertCircle className="w-16 h-16 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {isChunkError ? 'New Update Available' : 'Something went wrong'}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isChunkError 
                    ? 'A new version of the site is available. Please refresh to continue.' 
                    : (this.state.error?.message || 'An unexpected error occurred. Please try again.')}
                </p>
                {this.state.componentStack && (
                  <pre className="mt-4 max-h-48 overflow-auto rounded bg-muted p-3 text-left text-[10px] text-muted-foreground">
                    {this.state.componentStack}
                  </pre>
                )}
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.reload()} className="gap-2 shadow-lg shadow-primary/20">
                  <RefreshCw className="w-4 h-4" />
                  Refresh Page
                </Button>
                {!isChunkError && (
                  <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Go home
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
