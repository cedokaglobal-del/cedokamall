import type { RealtimeChannel } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface VisitorSession {
  id: string;
  startTime: number;
  lastActive: number;
  duration: number;
}

interface VisitorStats {
  totalVisitors: number;
  totalSessions: number;
  totalDuration: number;
  lastUpdated: number;
}

interface VisitorStore {
  stats: VisitorStats;
  currentSession: VisitorSession | null;
  isRealtimeConnected: boolean;
  startSession: () => Promise<void>;
  updateSession: (options?: { flush?: boolean }) => Promise<void>;
  getAverageStayDuration: () => number;
  syncWithSupabase: (force?: boolean) => Promise<void>;
  subscribeToRealtime: () => () => void;
}

const STORE_KEY = 'cedoka-visitor-stats';
const VISITOR_ID_KEY = 'cedoka-visitor-id';
const VISITOR_SEEN_KEY = 'cedoka-visitor-seen';

let visitorRealtimeChannel: RealtimeChannel | null = null;
let pendingDurationSeconds = 0;
let pendingSyncPromise: Promise<void> | null = null;

const createSessionId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const hasSeenVisitor = () => {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.localStorage.getItem(VISITOR_SEEN_KEY) === 'true';
};

const markVisitorSeen = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(VISITOR_SEEN_KEY, 'true');
};

const mapStatsFromRow = (row: Record<string, unknown>) => ({
  totalVisitors: Number(row.total_visitors ?? row.totalVisitors ?? 0),
  totalSessions: Number(row.total_sessions ?? row.totalSessions ?? 0),
  totalDuration: Number(row.total_duration ?? row.totalDuration ?? 0),
  lastUpdated: row.updated_at
    ? new Date(String(row.updated_at)).getTime()
    : Date.now(),
});

const applyRemoteStats = (row: Record<string, unknown>) => {
  useVisitorStore.setState((state) => ({
    stats: {
      ...state.stats,
      ...mapStatsFromRow(row),
    },
    isRealtimeConnected: true,
  }));
};

const flushPendingDuration = async () => {
  if (pendingDurationSeconds <= 0) {
    return;
  }

  const durationToFlush = pendingDurationSeconds;
  pendingDurationSeconds = 0;

  try {
    await supabase.rpc('increment_visitor_stats', {
      is_new_visitor: false,
      is_new_session: false,
      additional_duration: durationToFlush,
    });
  } catch (error: any) {
    pendingDurationSeconds += durationToFlush;
    // Suppress repetitive 404 errors silently
    if (error?.status !== 404) {
      console.debug('Visitor duration sync unavailable:', error);
    }
  }
};

export const useVisitorStore = create<VisitorStore>()(
  persist(
    (set, get) => ({
      stats: {
        totalVisitors: 0,
        totalSessions: 0,
        totalDuration: 0,
        lastUpdated: Date.now(),
      },
      currentSession: null,
      isRealtimeConnected: false,

      syncWithSupabase: async (force = false) => {
        const { stats } = get();
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

        if (!force && stats.lastUpdated > fiveMinutesAgo && stats.totalSessions > 0) {
          return;
        }

        if (!force && pendingSyncPromise) {
          return pendingSyncPromise;
        }

        pendingSyncPromise = (async () => {
          try {
            const { data, error } = await supabase
              .from('visitor_stats')
              .select('total_visitors,total_sessions,total_duration,updated_at')
              .limit(1)
              .maybeSingle();

            if (error) {
              throw error;
            }

            if (data) {
              applyRemoteStats(data);
            } else {
              set({ isRealtimeConnected: false });
            }
          } catch (error: any) {
            // Suppress repetitive 404 errors silently
            if (error?.status !== 404) {
              console.debug('Supabase visitor sync unavailable:', error);
            }
            set({ isRealtimeConnected: false });
          } finally {
            pendingSyncPromise = null;
          }
        })();

        return pendingSyncPromise;
      },

      subscribeToRealtime: () => {
        if (visitorRealtimeChannel) {
          return () => {
            if (!visitorRealtimeChannel) {
              return;
            }

            supabase.removeChannel(visitorRealtimeChannel);
            visitorRealtimeChannel = null;
            useVisitorStore.setState({ isRealtimeConnected: false });
          };
        }

        visitorRealtimeChannel = supabase
          .channel('visitor-stats-realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'visitor_stats' },
            (payload) => {
              if (payload.new && typeof payload.new === 'object') {
                applyRemoteStats(payload.new as Record<string, unknown>);
              } else {
                void get().syncWithSupabase(true);
              }
            }
          )
          .subscribe((status) => {
            useVisitorStore.setState({
              isRealtimeConnected: status === 'SUBSCRIBED',
            });
          });

        return () => {
          if (!visitorRealtimeChannel) {
            return;
          }

          supabase.removeChannel(visitorRealtimeChannel);
          visitorRealtimeChannel = null;
          useVisitorStore.setState({ isRealtimeConnected: false });
        };
      },

      startSession: async () => {
        const now = Date.now();
        const current = get().currentSession;
        if (current) {
          return;
        }

        if (typeof window !== 'undefined' && !window.localStorage.getItem(VISITOR_ID_KEY)) {
          window.localStorage.setItem(VISITOR_ID_KEY, createSessionId());
        }
        const isNewVisitor = !hasSeenVisitor();

        set((state) => ({
          currentSession: {
            id: createSessionId(),
            startTime: now,
            lastActive: now,
            duration: 0,
          },
          stats: {
            ...state.stats,
            totalVisitors: state.stats.totalVisitors + (isNewVisitor ? 1 : 0),
            totalSessions: state.stats.totalSessions + 1,
            lastUpdated: now,
          },
        }));

        if (isNewVisitor) {
          markVisitorSeen();
        }

        await get().syncWithSupabase();

        try {
          const { data, error } = await supabase.rpc('increment_visitor_stats', {
            is_new_visitor: isNewVisitor,
            is_new_session: true,
            additional_duration: 0,
          });

          if (error) {
            throw error;
          }

          if (data && typeof data === 'object') {
            applyRemoteStats(data as Record<string, unknown>);
          }
        } catch (error) {
          console.debug('Visitor stats RPC unavailable, using local fallback:', error);
        }
      },

      updateSession: async ({ flush = false } = {}) => {
        const { currentSession, stats } = get();
        if (!currentSession) {
          return;
        }

        const now = Date.now();
        const additionalDuration = Math.floor((now - currentSession.lastActive) / 1000);

        if (additionalDuration < 1 && !flush) {
          return;
        }

        const durationDelta = Math.max(additionalDuration, 0);
        pendingDurationSeconds += durationDelta;

        set({
          currentSession: {
            ...currentSession,
            lastActive: now,
            duration: currentSession.duration + durationDelta,
          },
          stats: {
            ...stats,
            totalDuration: stats.totalDuration + durationDelta,
            lastUpdated: now,
          },
        });

        if (flush || pendingDurationSeconds >= 30) {
          await flushPendingDuration();
          await get().syncWithSupabase(true);
        }
      },

      getAverageStayDuration: () => {
        const { stats } = get();
        if (stats.totalSessions === 0) {
          return 0;
        }

        return Math.floor(stats.totalDuration / stats.totalSessions);
      },
    }),
    {
      name: STORE_KEY,
      partialize: (state) => ({
        stats: state.stats,
      }),
    }
  )
);
