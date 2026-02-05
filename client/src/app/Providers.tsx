'use client';

import { useState, useEffect } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { getTheme, type ThemeMode } from './theme';
import { LS_KEYS, LocalStore } from '../lib/localstorage/LocalStore';
import { CurrentUserProvider } from './CurrentUserContext';

const queryClient = new QueryClient();

type ProvidersProps = {
  initialCurrentUser: { email: string, id: string } | null;
  children: React.ReactNode;
};

/**
 * Client-only wrapper: theme state, theme toggle (all routes), and core providers.
 * currentUser is fetched server-side and provided via CurrentUserContext to all routes.
 */
export default function Providers({ initialCurrentUser, children }: ProvidersProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    let storedTheme = LocalStore.getItem(LS_KEYS.THEME_MODE) as ThemeMode | null;
    if (!storedTheme) {
      storedTheme = 'light';
      LocalStore.setItem(LS_KEYS.THEME_MODE, storedTheme);
    }
    setCurrentTheme(storedTheme);
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(next);
    LocalStore.setItem(LS_KEYS.THEME_MODE, next);
  };

  const theme = getTheme(currentTheme);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <CurrentUserProvider initialCurrentUser={initialCurrentUser}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box component="main" sx={{ position: 'relative', minHeight: '100vh' }}>
              {children}
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={currentTheme === 'dark'}
                  onChange={toggleTheme}
                  color="default"
                  aria-label="toggle dark mode"
                />
              }
              label={currentTheme === 'dark' ? 'Dark' : 'Light'}
              sx={{ position: 'fixed', bottom: 20, right: 10, zIndex: 1 }}
            />
          </ThemeProvider>
        </CurrentUserProvider>
      </AppRouterCacheProvider>
    </QueryClientProvider>
  );
}
