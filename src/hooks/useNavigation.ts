import { useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

export function useNavigation() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
