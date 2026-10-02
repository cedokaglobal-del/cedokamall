import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to the element named by the URL hash after a client-side navigation.
 *
 * The browser only honours a hash on a full page load, so in a SPA a link like
 * `/solar#solar-plans` changes the route without ever moving the viewport. This
 * runs on every location change and scrolls the target into view, retrying
 * briefly because the target often renders in the same tick as the route change.
 */
const ScrollToHash = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const id = hash.replace(/^#/, '');
    if (!id) return;

    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tryScroll = () => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      // Give the route a few frames to mount its content before giving up.
      attempts += 1;
      if (attempts < 20) {
        timer = setTimeout(tryScroll, 50);
      }
    };

    tryScroll();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pathname, hash]);

  return null;
};

export default ScrollToHash;
