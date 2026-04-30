import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  startSession: () => void;
  updateSession: () => void;
  getAverageStayDuration: () => number; // in seconds
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

      startSession: () => {
        const { stats } = get();
        const sessionId = Math.random().toString(36).substring(7);
        const now = Date.now();
        
        // If it's a new visitor (no previous stats), increment totalVisitors
        const isNewVisitor = stats.totalVisitors === 0;
        
        set({
          currentSession: {
            id: sessionId,
            startTime: now,
            lastActive: now,
            duration: 0,
          },
          stats: {
            ...stats,
            totalVisitors: isNewVisitor ? stats.totalVisitors + 1 : stats.totalVisitors,
            totalSessions: stats.totalSessions + 1,
            lastUpdated: now,
          }
        });
      },

      updateSession: () => {
        const { currentSession, stats } = get();
        if (!currentSession) return;

        const now = Date.now();
        const additionalDuration = Math.floor((now - currentSession.lastActive) / 1000);
        
        // Only update if at least 1 second has passed
        if (additionalDuration < 1) return;

        set({
          currentSession: {
            ...currentSession,
            lastActive: now,
            duration: currentSession.duration + additionalDuration,
          },
          stats: {
            ...stats,
            totalDuration: stats.totalDuration + additionalDuration,
            lastUpdated: now,
          }
        });
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
