/**
 * Home page (storefront). Server-rendered; links and search use client components where needed.
 *
 * @since material-UI-sass--JP
 */
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { API } from '../../lib/api/dicts/API';
import { headers } from 'next/headers';
import HomeClientContentWrapper from '../../components/HomeClientContentWrapper';

export default async function Home() {
  let allTickets: SavedTicketDoc[] | null = null;
  try {
    const ctxHeaders = await headers();
    const cookie = ctxHeaders.get('cookie') ?? '';
    const host = ctxHeaders.get('host') ?? '';
    
    const resp = await API.tick!.getAllTickets!({
      headers: { Cookie: cookie, Host: host },
    });
    allTickets = (resp as unknown as SavedTicketDoc[]) ?? null;
  } catch (error) {
    allTickets = null;
  }

  return (
    <Container maxWidth="lg" disableGutters>
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" component="h2" sx={{ mb: 2, fontSize: '56px', fontWeight: 400 }}>
        <span style={{ fontSize: '57.5px' }}>B</span>ig<span style={{ marginLeft: '-4px', fontSize: '57.5px' }}>T</span>ix

          <Typography variant="body2" component="p" sx={{ fontSize: '17px', ml: '71px', mt: '-14px' }}>Buy and sell tickets to events</Typography>
        </Typography>

        <Box sx={{
          my: 2,
          width: '100%',
          // Set a max-width that increases at specific breakpoints
          maxWidth: {
            xs: '400px', // max-width on extra-small screens
            md: '900px', // max-width on medium screens
            lg: '1200px', // max-width on large screens
          },
        }}>
          <HomeClientContentWrapper allTickets={allTickets} />
        </Box>
      </Box>
    </Container>
  );
}
