import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900">
          <Card className="glass p-8 max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-destructive/20 p-4 rounded-full">
                <AlertTriangle className="w-12 h-12 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Something went wrong</h2>
              <p className="text-sm text-muted-foreground">
                We encountered an unexpected error. Don't worry, we've logged it and will fix it soon.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-muted/20 p-3 rounded-md">
                <p className="text-xs font-mono text-left break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <Button 
              onClick={this.handleReset}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
