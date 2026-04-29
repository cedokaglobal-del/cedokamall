import { supabase } from '@/lib/supabase';

export interface SupabaseHealthCheck {
  isConnected: boolean;
  responseTime: number;
  error: string | null;
  timestamp: string;
}

/**
 * Check if Supabase connection is healthy
 * Returns response time in milliseconds
 */
export const checkSupabaseHealth = async (): Promise<SupabaseHealthCheck> => {
  const startTime = performance.now();
  
  try {
    const { error } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    const responseTime = Math.round(performance.now() - startTime);

    if (error) {
      return {
        isConnected: false,
        responseTime,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      isConnected: true,
      responseTime,
      error: null,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const responseTime = Math.round(performance.now() - startTime);
    return {
      isConnected: false,
      responseTime,
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Periodically check Supabase health and log results
 * Useful for monitoring in production
 */
export const startHealthCheck = (intervalMs = 60000) => {
  const performCheck = async () => {
    const health = await checkSupabaseHealth();
    console.log(
      `[Supabase Health] Connected: ${health.isConnected}, Response: ${health.responseTime}ms`,
      health.error ? `Error: ${health.error}` : ''
    );
  };

  performCheck(); // Run immediately
  return setInterval(performCheck, intervalMs);
};
