import { lazy, ComponentType } from 'react';

/**
 * A robust wrapper for React.lazy that handles chunk load failures
 * by retrying the import. This is useful for production deployments
 * where old chunks might be cleared from the server.
 */
export function safeLazy<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
  retriesLeft = 2,
  interval = 1000
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let currentRetries = retriesLeft;
    let currentInterval = interval;

    while (currentRetries > 0) {
      try {
        return await factory();
      } catch (error) {
        if (!isChunkLoadError(error)) {
          console.error('Non-chunk load error occurred:', error);
          throw error;
        }

        console.warn(
          `Chunk load failed, retrying in ${currentInterval}ms... (${currentRetries} retries left)`
        );
        await new Promise((resolve) => setTimeout(resolve, currentInterval));
        currentRetries--;
        currentInterval *= 2;
      }
    }

    console.error('All retries failed for lazy-loaded component');
    throw new Error('Failed to load component after multiple retries');
  });
}

function isChunkLoadError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError'))
  );
}
