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
    large: 1200,
    xlarge: 1800
  },
  quality: {
    webp: 85,
    jpg: 88
  },
  // Responsive breakpoints for images
  breakpoints: {
    mobile: { width: 375, dpr: 2 },
    tablet: { width: 768, dpr: 2 },
    desktop: { width: 1024, dpr: 1 }
  }
};

/**
 * Lazy loading configuration with intersection observer
 */
export const LAZY_LOAD_CONFIG = {
  root: null,
  rootMargin: '100px',
  threshold: [0, 0.1, 0.25]
};

const fallbackImage = '/image.png';

/**
 * Format image URL for optimization with responsive sizing
 */
export function getOptimizedImageUrl(
  url: string,
  width: number,
  height?: number,
  quality: number = 85
): string {
  if (!url) return fallbackImage;
  
  // If URL is from Unsplash, use their API for optimization
  if (url.includes('unsplash.com')) {
    const params = new URLSearchParams();
    params.set('w', width.toString());
    params.set('q', quality.toString());
    params.set('fit', 'crop');
    params.set('auto', 'format');
    
    if (height) {
      params.set('h', height.toString());
    }
    
    return `${url}?${params.toString()}`;
  }

  // Handle Supabase Storage URLs
  if (url.includes('.supabase.co/storage/v1/object/public/')) {
    const params = new URLSearchParams();
    params.set('width', width.toString());
    params.set('quality', quality.toString());
    if (height) params.set('height', height.toString());
    params.set('resize', 'contain');
    
    return url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + `?${params.toString()}`;
  }

  return url;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  url: string,
  sizes: number[] = [300, 600, 1200],
  quality: number = 85
): string {
  if (url.includes('unsplash.com')) {
    return sizes
      .map(size => `${getOptimizedImageUrl(url, size, undefined, quality)} ${size}w`)
      .join(', ');
  }
  return url;
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(context: 'hero' | 'product' | 'thumbnail' | 'banner'): string {
  const sizeMap = {
    hero: '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw',
    product: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw',
    thumbnail: '(max-width: 640px) 100px, (max-width: 1024px) 120px, 150px',
    banner: '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw'
  };
  
  return sizeMap[context];
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

  return result;
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
  private readonly maxAge: number = 5 * 60 * 1000;

  set(key: string, value: unknown): void {
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
export function prefetchAsset(url: string, as: 'image' | 'script' | 'style' = 'image'): void {
  if (typeof document === 'undefined') return;
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = as;
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Preload critical resources
 */
export function preloadAsset(url: string, as: 'image' | 'script' | 'style' = 'image'): void {
  if (typeof document === 'undefined') return;
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
  if (typeof document === 'undefined') return;
  const hints = [
    { rel: 'dns-prefetch', href: 'https://images.unsplash.com' },
    { rel: 'dns-prefetch', href: 'https://rxpyehmubnzdshncpqbw.supabase.co' },
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

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      const routes = ['/shop', '/cart'];
      routes.forEach(route => prefetchAsset(route));
    });
  }
}
