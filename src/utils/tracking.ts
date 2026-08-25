// Simple on-site analytics tracking (localStorage-based)
import { useVisitorStore } from '@/store/visitorStore';

const TRACK_KEY = 'cedoka.tracking.log.v1';

interface TrackEvent {
  type: 'search' | 'pageview' | 'referrer';
  value: string;
  timestamp: number;
}

interface TrackStore {
  searches: { term: string; count: number; lastSearched: number }[];
  pageViews: { path: string; count: number; lastViewed: number }[];
  referrers: { source: string; count: number; firstVisit: number }[];
}

const getStore = (): TrackStore => {
  try {
    const raw = localStorage.getItem(TRACK_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    return { searches: [], pageViews: [], referrers: [] };
  }
  return { searches: [], pageViews: [], referrers: [] };
};

const saveStore = (s: TrackStore) => {
  try {
    localStorage.setItem(TRACK_KEY, JSON.stringify(s));
  } catch {
    return;
  }
};

export const trackSearch = (term: string) => {
  if (!term.trim()) return;
  const store = getStore();
  const existing = store.searches.find(s => s.term.toLowerCase() === term.toLowerCase());
  if (existing) {
    existing.count++;
    existing.lastSearched = Date.now();
  } else {
    store.searches.push({ term, count: 1, lastSearched: Date.now() });
  }
  store.searches.sort((a, b) => b.count - a.count);
  if (store.searches.length > 50) store.searches.length = 50;
  saveStore(store);
};

export const trackPageView = (path: string) => {
  const store = getStore();
  const existing = store.pageViews.find(p => p.path === path);
  if (existing) {
    existing.count++;
    existing.lastViewed = Date.now();
  } else {
    store.pageViews.push({ path, count: 1, lastViewed: Date.now() });
  }
  store.pageViews.sort((a, b) => b.count - a.count);
  if (store.pageViews.length > 30) store.pageViews.length = 30;
  saveStore(store);
};

export const trackReferrer = () => {
  if (typeof document === 'undefined') return;
  const store = getStore();
  if (store.referrers.length > 0) return; // Only capture once per device
  const ref = document.referrer || 'Direct';
  const source = ref === 'Direct' ? 'Direct' : new URL(ref).hostname.replace('www.', '');
  store.referrers.push({ source, count: 1, firstVisit: Date.now() });
  saveStore(store);
};

export const getTrackingData = (): TrackStore => getStore();
