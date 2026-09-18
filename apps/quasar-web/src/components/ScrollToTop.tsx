import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
      return;
    }

    let frame = 0;
    let attempts = 0;
    const scrollToHash = () => {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({
          behavior: 'instant',
          block: 'start',
        });
        return;
      }

      // App Router can publish the pathname before the new route's client
      // content mounts. Keep the hash navigation pending across that window.
      if (attempts++ < 120) frame = window.requestAnimationFrame(scrollToHash);
    };

    frame = window.requestAnimationFrame(scrollToHash);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
