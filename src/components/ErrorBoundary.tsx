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
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex h-screen flex-col items-center justify-center bg-background px-4">
            <div className="text-center space-y-6 max-w-md">
              <div className="flex justify-center">
                <AlertCircle className="w-16 h-16 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                <p className="text-muted-foreground text-sm">
                  {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={this.reset} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try again
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Go home
                </Button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
