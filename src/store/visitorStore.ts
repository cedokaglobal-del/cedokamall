import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface VisitorSession {
  id: string;
  startTime: number;
  lastActive: number;
  duration: number; // in seconds
}

interface VisitorStats {
  totalVisitors: number;
  totalSessions: number;
  totalDuration: number; // total duration across all sessions in seconds
  lastUpdated: number;
}

interface VisitorStore {
  stats: VisitorStats;
  currentSession: VisitorSession | null;
  startSession: () => Promise<void>;
  updateSession: () => Promise<void>;
  getAverageStayDuration: () => number; // in seconds
  syncWithSupabase: (force?: boolean) => Promise<void>;
}

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

      syncWithSupabase: async (force = false) => {
        const { stats } = get();
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

        if (!force && stats.lastUpdated > fiveMinutesAgo && stats.totalSessions > 0) {
          return;
        }

        try {
          // Attempt to get global stats from Supabase
          const { data, error } = await supabase
            .from('visitor_stats')
            .select('*')
            .single();

          if (!error && data) {
            set((state) => ({
              stats: {
                ...state.stats,
                totalVisitors: Math.max(state.stats.totalVisitors, data.total_visitors || 0),
                totalSessions: Math.max(state.stats.totalSessions, data.total_sessions || 0),
                totalDuration: Math.max(state.stats.totalDuration, data.total_duration || 0),
                lastUpdated: Date.now(),
              }
            }));
          }
        } catch (e) {
          console.debug('Supabase visitor sync not available');
        }
      },

      startSession: async () => {
        const { stats } = get();
        const sessionId = Math.random().toString(36).substring(7);
        const now = Date.now();
        
        const isNewVisitor = stats.totalVisitors === 0;
        
        const newStats = {
          ...stats,
          totalVisitors: isNewVisitor ? stats.totalVisitors + 1 : stats.totalVisitors,
          totalSessions: stats.totalSessions + 1,
          lastUpdated: now,
        };

        set({
          currentSession: {
            id: sessionId,
            startTime: now,
            lastActive: now,
            duration: 0,
          },
          stats: newStats
        });

        // Try to update global stats in Supabase (disabled to prevent 404 errors)
        /*
        try {
          await supabase.rpc('increment_visitor_stats', {
            is_new_visitor: isNewVisitor,
            is_new_session: true,
            additional_duration: 0
          });
        } catch (e) {
          // Ignore if RPC doesn't exist
        }
        */
      },

      updateSession: async () => {
        const { currentSession, stats } = get();
        if (!currentSession) return;

        const now = Date.now();
        const additionalDuration = Math.floor((now - currentSession.lastActive) / 1000);
        
        if (additionalDuration < 1) return;

        const newStats = {
          ...stats,
          totalDuration: stats.totalDuration + additionalDuration,
          lastUpdated: now,
        };

        set({
          currentSession: {
            ...currentSession,
            lastActive: now,
            duration: currentSession.duration + additionalDuration,
          },
          stats: newStats
        });

        // Try to update global stats in Supabase (disabled to prevent 404 errors)
        /*
        try {
          await supabase.rpc('increment_visitor_stats', {
            is_new_visitor: false,
            is_new_session: false,
            additional_duration: additionalDuration
          });
        } catch (e) {
          // Ignore
        }
        */
      },

      getAverageStayDuration: () => {
        const { stats } = get();
        if (stats.totalSessions === 0) return 0;
        return Math.floor(stats.totalDuration / stats.totalSessions);
      },
    }),
    {
      name: 'cedoka-visitor-stats',
    }
  )
);
