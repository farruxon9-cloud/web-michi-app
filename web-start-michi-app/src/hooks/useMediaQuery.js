import { useState, useEffect } from 'react';

/**
 * Custom hook to detect CSS media query matches (e.g. screen sizes)
 * @param {string} query - CSS media query string, e.g. '(min-width: 768px)'
 * @returns {boolean} matches - true if screen matches query
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    const listener = (e) => setMatches(e.matches);

    // Modern matchMedia API
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      media.addListener(listener);
    }

    setMatches(media.matches);

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

export default useMediaQuery;
