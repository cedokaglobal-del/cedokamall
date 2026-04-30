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
    try {
      return await factory();
    } catch (error) {
      if (retriesLeft <= 0) {
        throw error;
      }
      
      await new Promise((resolve) => setTimeout(resolve, interval));
      return safeLazy(factory, retriesLeft - 1, interval * 2) as any;
    }
  });
}
