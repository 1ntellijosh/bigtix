/**
 * AuthSignedInBanner component, placeholder component for the auth layout showing user they are already logged in
 * 
 * @since  material-UI-sass--JP
 */
'use client';

import { useRouter } from 'next/navigation';
import { useCurrentUser } from '../CurrentUserContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

/**
 * Shown on auth pages when user is already signed in. Offers to log out and switch users.
 */
export default function AuthSignedInBanner() {
  const router = useRouter();
  const { currentUser, signOut } = useCurrentUser();
  if (!currentUser?.email) return null;

  const handleLogOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <Box
      sx={{
        mb: 2,
        p: 1.5,
        borderRadius: 1,
        bgcolor: 'action.hover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      <Typography variant="body2">
        Signed in as <strong>{currentUser.email}</strong>. Want to log out and switch users?
      </Typography>
      <Button size="small" variant="outlined" onClick={handleLogOut}>
        Log out
      </Button>
    </Box>
  );
}
