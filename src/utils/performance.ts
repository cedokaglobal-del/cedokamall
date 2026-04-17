/**
 * Performance Optimization Utilities
 * Measures and improves application performance
 */

/**
 * Image optimization options
 */
export const IMAGE_OPTIMIZATION = {
  formats: ['webp', 'jpg'],
  sizes: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1200
  },
  quality: {
    webp: 80,
    jpg: 85
  }
};

/**
 * Lazy loading configuration
 */
export const LAZY_LOAD_CONFIG = {
  root: null,
  rootMargin: '50px',
  threshold: 0.1
};

/**
 * Format image URL for optimization
 * Returns optimized URL with proper sizing and format
 */
export function getOptimizedImageUrl(
  url: string,
  width: number,
  height?: number,
  quality: number = 80
): string {
  // If URL is from Unsplash, use their API for optimization
  if (url.includes('unsplash.com')) {
    const params = new URLSearchParams();
    params.set('w', width.toString());
    params.set('q', quality.toString());
    params.set('fit', 'max');
    
    return `${url}?${params.toString()}`;
  }

  // For other sources, return the original URL
  // In production, implement proper image optimization via CDN
  return url;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(url: string, sizes: number[] = [300, 600, 1200]): string {
  if (url.includes('unsplash.com')) {
    return sizes.map(size => `${getOptimizedImageUrl(url, size)} ${size}w`).join(', ');
  }
  return url;
}

/**
 * Performance metrics collection
 */
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
}

const metrics: PerformanceMetric[] = [];

/**
 * Measure function execution time
 */
export function measurePerformance<T>(
  fn: () => T,
  label: string
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  const duration = end - start;
  metrics.push({
    name: label,
    value: duration,
    unit: 'ms',
    timestamp: new Date()
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Get collected performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetric[] {
  return [...metrics];
}

/**
 * Clear performance metrics
 */
export function clearPerformanceMetrics(): void {
  metrics.length = 0;
}

/**
 * Report Web Vitals to analytics
 */
interface WebVitalsMetric {
  name: string;
  value: number;
  rating?: string;
  delta?: number;
  id?: string;
  [key: string]: unknown;
}

export function reportWebVitals(metric: WebVitalsMetric): void {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    const body = JSON.stringify(metric);
    // Use sendBeacon if available for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/vitals', body);
    }
  }
}

/**
 * Cache layer for expensive computations
 */
interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly maxAge: number = 5 * 60 * 1000; // 5 minutes default

  set(key: string, value: unknown, maxAge?: number): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  get(key: string, maxAge?: number): unknown | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const age = Date.now() - item.timestamp;
    const maxAgeMs = maxAge || this.maxAge;

    if (age > maxAgeMs) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

export const cacheManager = new CacheManager();

/**
 * Request deduplication
 */
const pendingRequests: Map<string, Promise<unknown>> = new Map();

export async function deduplicatedFetch(
  key: string,
  fetcher: () => Promise<unknown>
): Promise<unknown> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = fetcher().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * Prefetch resources
 */
export function prefetchResource(url: string, as: 'image' | 'script' | 'style' = 'image'): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = as;
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Preload critical resources
 */
export function preloadResource(url: string, as: 'image' | 'script' | 'style' = 'image'): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = url;
  if (as === 'script' || as === 'style') {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}

/**
 * Connection optimization hints
 */
export function addConnectionHints(): void {
  const hints = [
    { rel: 'dns-prefetch', href: 'https://images.unsplash.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    if ('crossOrigin' in hint) {
      link.setAttribute('crossOrigin', hint.crossOrigin);
    }
    document.head.appendChild(link);
  });
}
