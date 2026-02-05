/**
 * Material UI theme configuration
 * 
 * @since material-UI-sass--JP
 */
import { Roboto } from 'next/font/google';
import { createTheme, type Theme } from '@mui/material/styles';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const shared = {
  cssVariables: true,
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { severity: 'info' as const },
              style: {
                backgroundColor: '#60a5fa',
              },
            },
          ],
        },
      },
    },
  },
};

export const lightTheme: Theme = createTheme({
  ...shared,
  palette: {
    mode: 'light',
    common: {
      white: '#a6a6a6'
    }
    // TODO: override light palette
    // primary: { main: '#1976d2' },
    // background: { default: '#fafafa', paper: '#fff' },
  },
});

export const darkTheme: Theme = createTheme({
  ...shared,
  palette: {
    mode: 'dark',
    // TODO: override dark palette
    // primary: { main: '#90caf9' },
    // background: { default: '#121212', paper: '#1e1e1e' },
  },
});

export type ThemeMode = 'light' | 'dark';

export function getTheme(mode: ThemeMode): Theme {
  return mode === 'dark' ? darkTheme : lightTheme;
}

export default lightTheme;