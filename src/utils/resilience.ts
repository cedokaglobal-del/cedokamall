/**
 * Resilient Supabase connection with exponential backoff retry logic
 * Ensures maximum reliability and graceful degradation under network issues
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Retry a failed operation with exponential backoff
 * @param operation Async function to retry
 * @param options Retry configuration
 * @returns Result of the operation
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | null = null;
  let delay = config.initialDelayMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === config.maxRetries) {
        break; // Don't wait after last attempt
      }

      console.warn(
        `Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
        lastError.message
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
    }
  }

  throw new Error(
    `Operation failed after ${config.maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`
  );
};

/**
 * Test Supabase connection with timeout
 */
export const testSupabaseConnection = async (timeoutMs = 5000): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch('https://www.google.com', {
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate Supabase configuration
 */
export const validateSupabaseConfig = (): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    errors.push('VITE_SUPABASE_URL is not configured');
  } else if (!url.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must be an HTTPS URL');
  }

  if (!key) {
    errors.push('Supabase Key (ANON or PUBLISHABLE) is not configured');
  } else if (key.length < 20) {
    errors.push('Supabase Key appears invalid');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Circuit breaker pattern for database operations
 * Prevents cascading failures by stopping requests when service is down
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: number | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold = 5,
    private resetTimeoutMs = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (
        this.lastFailureTime &&
        Date.now() - this.lastFailureTime > this.resetTimeoutMs
      ) {
        this.state = 'HALF_OPEN';
        console.log('[CircuitBreaker] Entering HALF_OPEN state');
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log('[CircuitBreaker] Recovered to CLOSED state');
    }
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold && this.state === 'CLOSED') {
      this.state = 'OPEN';
      console.error(
        `[CircuitBreaker] Opened after ${this.failures} failures`
      );
    }
  }

  getState() {
    return this.state;
  }
}

// Global circuit breaker instance for Supabase operations
export const supabaseCircuitBreaker = new CircuitBreaker(5, 60000);
