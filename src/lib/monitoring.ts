import * as Sentry from '@sentry/react';

export const initMonitoring = () => {
  // Only initialize Sentry in production
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: 0.1, // Capture 10% of transactions
      
      // Session Replay
      replaysSessionSampleRate: 0.1, // Sample 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
      
      // Environment
      environment: import.meta.env.MODE,
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION,
      
      // Error filtering
      beforeSend(event, hint) {
        // Don't send errors in development
        if (import.meta.env.DEV) {
          return null;
        }
        
        // Filter out network errors from ad blockers
        const error = hint.originalException;
        if (error && typeof error === 'object' && 'message' in error) {
          const message = (error as Error).message;
          if (message?.includes('blocked') || message?.includes('adblock')) {
            return null;
          }
        }
        
        return event;
      },
    });
  }
};

// Custom error logging function
export const logError = (error: Error, context?: Record<string, unknown>) => {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error('Error:', error, context);
  }
};

// Custom event tracking
export const trackEvent = (eventName: string, data?: Record<string, unknown>) => {
  if (import.meta.env.PROD) {
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: eventName,
      data,
      level: 'info',
    });
  } else {
    console.log('Event:', eventName, data);
  }
};

// Performance monitoring
export const measurePerformance = (metricName: string, value: number) => {
  if (import.meta.env.PROD) {
    Sentry.metrics.distribution(metricName, value, {
      unit: 'millisecond',
    });
  } else {
    console.log(`Performance [${metricName}]:`, value, 'ms');
  }
};

// User identification
export const identifyUser = (userId: string, userData?: Record<string, unknown>) => {
  if (import.meta.env.PROD) {
    Sentry.setUser({
      id: userId,
      ...userData,
    });
  }
};

// Clear user on logout
export const clearUser = () => {
  if (import.meta.env.PROD) {
    Sentry.setUser(null);
  }
};
