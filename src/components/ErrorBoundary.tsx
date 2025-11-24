import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to error tracking service (e.g., Sentry) in production
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service
      console.error('Production error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  getUserFriendlyMessage(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Connection issue detected. Please check your internet and try again.';
    }
    if (message.includes('timeout')) {
      return 'Request took too long. Please try again.';
    }
    if (message.includes('chunk')) {
      return 'Failed to load resources. Please refresh the page.';
    }
    if (message.includes('api') || message.includes('server')) {
      return 'Service temporarily unavailable. Please try again in a moment.';
    }
    
    return 'Something unexpected happened. Please try again.';
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      const userMessage = this.state.error ? this.getUserFriendlyMessage(this.state.error) : 'An unexpected error occurred.';
      const isDevelopment = import.meta.env.DEV;
      
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900">
          <Card className="glass p-8 max-w-md w-full text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <div className="bg-destructive/20 p-4 rounded-full animate-pulse">
                <AlertTriangle className="w-12 h-12 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Oops! Something went wrong</h2>
              <p className="text-sm text-muted-foreground">
                {userMessage}
              </p>
            </div>

            {isDevelopment && this.state.error && (
              <details className="bg-muted/20 p-3 rounded-md text-left">
                <summary className="text-xs font-semibold cursor-pointer mb-2">
                  Error Details (Dev Only)
                </summary>
                <p className="text-xs font-mono break-all mb-2">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs font-mono overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="flex flex-col gap-3">
              <Button 
                onClick={this.handleReset}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1"
                >
                  Reload Page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
