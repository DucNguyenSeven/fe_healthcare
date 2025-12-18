import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

export function useNavigation() {
  const isMobile = useMediaQuery('(max-width: 768px)'); // md breakpoint
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => {
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMobileAction = (callback?: () => void) => {
    if (callback) {
      callback();
    }
    if (isMobile) {
      closeDrawer();
    }
  };

  return {
    isMobile,
    drawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    handleMobileAction
  };
}
