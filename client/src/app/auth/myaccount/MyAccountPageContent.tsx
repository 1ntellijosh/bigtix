/**
 * My account page where a user can view their account information and settings.
 *
 * @since buy-tickets--JP
 */
'use client';

import Container from '@mui/material/Container';
import { useCurrentUser } from '../../CurrentUserContext';

export default function MyAccountPageContent() {
  const { currentUser } = useCurrentUser();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      My Account page
    </Container>
  );
}