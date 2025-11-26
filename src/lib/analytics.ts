import { onCLS, onFCP, onLCP, onINP, onTTFB, Metric } from 'web-vitals';
import { measurePerformance } from './monitoring';

// Core Web Vitals metrics
const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

interface AnalyticsOptions {
  analyticsId?: string;
  debug?: boolean;
}

// Send metrics to analytics endpoint
function sendToAnalytics(metric: Metric, options: AnalyticsOptions) {
  const { analyticsId, debug } = options;
  
  const body = {
    dsn: analyticsId,
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
  };

  if (debug) {
    console.log('[Web Vitals]', metric.name, metric.value, metric);
  }

  // Send to Sentry
  measurePerformance(metric.name, metric.value);

  // Send to custom analytics if configured
  if (analyticsId && navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
    navigator.sendBeacon(vitalsUrl, blob);
  }
}

// Get connection speed
function getConnectionSpeed() {
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  return connection?.effectiveType || 'unknown';
}

// Initialize Web Vitals tracking
export function initWebVitals(options: AnalyticsOptions = {}) {
  try {
    onFCP((metric: Metric) => sendToAnalytics(metric, options));
    onLCP((metric: Metric) => sendToAnalytics(metric, options));
    onCLS((metric: Metric) => sendToAnalytics(metric, options));
    onINP((metric: Metric) => sendToAnalytics(metric, options));
    onTTFB((metric: Metric) => sendToAnalytics(metric, options));
  } catch (err) {
    console.error('Failed to initialize Web Vitals', err);
  }
}

// Custom performance marks
export function markPerformance(name: string) {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(name);
  }
}

export function measureMark(startMark: string, endMark: string, measureName: string) {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];
      if (measure) {
        measurePerformance(measureName, measure.duration);
      }
    } catch (err) {
      console.error('Performance measurement failed', err);
    }
  }
}

// Track page load time using modern Performance API
export function trackPageLoad() {
  // Use modern Navigation Timing API (Level 2)
  const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  
  if (entries.length > 0) {
    const navEntry = entries[0];
    const pageLoadTime = navEntry.loadEventEnd - navEntry.startTime;
    const domReadyTime = navEntry.domContentLoadedEventEnd - navEntry.startTime;
    
    // Only report if values are valid (positive and reasonable)
    if (pageLoadTime > 0 && pageLoadTime < 60000) {
      measurePerformance('page_load', pageLoadTime);
    }
    if (domReadyTime > 0 && domReadyTime < 60000) {
      measurePerformance('dom_ready', domReadyTime);
    }
  }
}

// Track API response time
export function trackApiResponse(endpoint: string, duration: number, status: number) {
  measurePerformance(`api_${endpoint}`, duration);
  
  if (status >= 400) {
    console.warn(`API Error [${endpoint}]:`, status, duration, 'ms');
  }
}
