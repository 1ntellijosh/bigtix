/**
 * My account page where a user can view their account information and settings.
 *
 * @since buy-tickets--JP
 */
'use client';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useCurrentUser } from '../../CurrentUserContext';
import Box from '@mui/material/Box';

export default function MyAccountPage() {
  const { currentUser } = useCurrentUser();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <Container>

    </Container>
  );
}