import { lazy, ComponentType } from 'react';

/**
 * A robust wrapper for React.lazy that handles chunk load failures
 * by retrying the import. This is useful for production deployments
 * where old chunks might be cleared from the server.
 */
export function safeLazy<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retriesLeft = 2,
  interval = 1000
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let currentRetries = retriesLeft;
    let currentInterval = interval;
    
    while (true) {
      try {
        return await factory();
      } catch (error) {
        if (currentRetries <= 0) {
          throw error;
        }
        console.warn(`Chunk load failed, retrying in ${currentInterval}ms... (${currentRetries} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, currentInterval));
        currentRetries--;
        currentInterval *= 2;
      }
    }
  });
}
