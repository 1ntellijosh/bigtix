/**
 * Storefront layout: includes TopNavBar.
 * 
 * @since  material-UI-sass--JP
 */
'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TopNavBar from '../../components/TopNavBar';
/**
 * Storefront layout: includes TopNavBar. Theme toggle and currentUser live in root.
 */
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <TopNavBar />
      <Container>
        {children}
      </Container>
    </Box>
  );
}
