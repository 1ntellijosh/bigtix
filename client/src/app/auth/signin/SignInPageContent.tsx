/**
 * Regular user sign in page
 *
 * @since next-client--JP
 */
'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { API } from '../../../lib/api/dicts/API';
import { useRouter } from 'next/navigation';
import FormSubmit from '../../../hooks/FormSubmit';
import Container from '@mui/material/Container';
import NextLink from 'next/link';

export default function SignInPageContent({ postSigninRedirect }: { postSigninRedirect: string | null }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bottomMessage, setBottomMessage] = useState('');

  const onSuccessfulSignin = () => {
    setBottomMessage("You're signed in! Redirecting you back...");
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    setTimeout(() => {
      router.replace(postSigninRedirect ?? '/');
    }, 1500);
  }

  const { errors, submitForm, submitMutation } = FormSubmit(
    () => API.auth!.signInUser!({ email, password }),
    { email, password },
    onSuccessfulSignin,
  );

  return (
    <Container maxWidth="lg">
      <Box component="form" onSubmit={submitForm}>
        <h1>
          Sign In to
          <Typography variant="body2" component="span" sx={{ fontFamily: 'oswald', fontSize: '38px' }}>
            <span style={{ fontSize: '38px' }}> B</span>ig<span style={{ marginLeft: '-4px', fontSize: '38px' }}>T</span>ix
          </Typography>
        </h1>

        <Box>
          <TextField
            label="Email"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}   // spacing (like mb-3)
          />
        </Box>

        <Box>
          <TextField
            label="Password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Button variant="contained" type="submit" disabled={submitMutation.isPending}>
            {submitMutation.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </Box>

        <Box>
          {bottomMessage && <Typography variant="body1">{bottomMessage}</Typography>}
        </Box>
        
        {errors}

        <Typography variant="body1" sx={{ fontSize: '18px', mt: 2 }}>
          New to BigTix? <NextLink href={'/auth/signup?redirect=' + postSigninRedirect || '/'} style={{ fontWeight: 600 }}>Sign up</NextLink>
        </Typography>
      </Box>
    </Container>
  );
}
