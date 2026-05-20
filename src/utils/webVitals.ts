/**
 * Performance monitoring and analytics utilities
 * Tracks Core Web Vitals and custom performance metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  id: number;
}

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  cls?: number; // Cumulative Layout Shift
  fid?: number; // First Input Delay
  ttfb?: number; // Time to First Byte
  customMetrics: Record<string, number>;
}

const metrics: PerformanceMetrics = {
  customMetrics: {},
};

/**
 * Report Web Vitals to analytics
 */
export const reportWebVitals = (metric: PerformanceMetric) => {
  if (typeof window === 'undefined') return;

  const { name, value, id } = metric;
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${name}]: ${value}ms (${id})`);
  }

  // Track key metrics
  switch (name) {
    case 'FCP':
      metrics.fcp = value;
      break;
    case 'LCP':
      metrics.lcp = value;
      break;
    case 'CLS':
      metrics.cls = value;
      break;
    case 'FID':
      metrics.fid = value;
      break;
    case 'TTFB':
      metrics.ttfb = value;
      break;
  }

  // Send to analytics endpoint if configured
  if (window.__ANALYTICS_ENDPOINT__) {
    try {
      navigator.sendBeacon(window.__ANALYTICS_ENDPOINT__, JSON.stringify({
        metric: name,
        value: Math.round(value),
        timestamp: new Date().toISOString(),
      }));
    } catch (err) {
      console.debug('Failed to send analytics:', err);
    }
  }
};

/**
 * Mark custom performance event
 */
export const markPerformance = (label: string) => {
  if (typeof window === 'undefined' || !window.performance?.mark) return;
  
  try {
    window.performance.mark(label);
  } catch (err) {
    console.debug('Performance mark failed:', err);
  }
};

/**
 * Measure time between two marks
 */
export const measurePerformance = (label: string, startMark: string, endMark: string) => {
  if (typeof window === 'undefined' || !window.performance?.measure) return;

  try {
    window.performance.measure(label, startMark, endMark);
    const measures = window.performance.getEntriesByName(label);
    if (measures.length > 0) {
      const duration = measures[measures.length - 1].duration;
      metrics.customMetrics[label] = duration;
      console.debug(`[${label}]: ${Math.round(duration)}ms`);
    }
  } catch (err) {
    console.debug('Performance measure failed:', err);
  }
};

/**
 * Get current metrics snapshot
 */
export const getMetrics = (): PerformanceMetrics => metrics;

/**
 * Initialize Core Web Vitals monitoring
 */
export const initWebVitals = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  let observer: PerformanceObserver | null = null;

  // Use PerformanceObserver to track metrics
  try {
    observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const metric: PerformanceMetric = {
          name: entry.name,
          value: entry.duration || (entry as Record<string, number>).value || 0,
          id: entry.startTime,
        };
        reportWebVitals(metric);
      }
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] });
  } catch (err) {
    console.debug('Web Vitals observer setup failed:', err);
  }

  return () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };
};

/**
 * Log Core Web Vitals summary
 */
export const logMetricsSummary = () => {
  const fcpValue = metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A';
  const lcpValue = metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A';
  const clsValue = metrics.cls ? `${metrics.cls.toFixed(4)}` : 'N/A';
  const fidValue = metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A';
  const ttfbValue = metrics.ttfb ? `${metrics.ttfb.toFixed(2)}ms` : 'N/A';

  console.table({
    'First Contentful Paint': fcpValue,
    'Largest Contentful Paint': lcpValue,
    'Cumulative Layout Shift': clsValue,
    'First Input Delay': fidValue,
    'Time to First Byte': ttfbValue,
  });
};

declare global {
  interface Window {
    __ANALYTICS_ENDPOINT__?: string;
  }
}
