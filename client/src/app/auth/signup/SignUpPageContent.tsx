/**
 * Regular user sign up page
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

export default function SignUpPageContent({ postSignupRedirect }: { postSignupRedirect: string | null }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bottomMessage, setBottomMessage] = useState('');

  const onSuccessfulSignup = () => {
    setBottomMessage("You're signed up! Redirecting you back...");
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    setTimeout(() => {
      router.replace(postSignupRedirect ?? '/');
    }, 1500);
  }

  const { errors, submitForm, submitMutation } = FormSubmit(
    () => API.auth!.signUpUser!({ email, password }),
    { email, password },
    onSuccessfulSignup,
  );

  return (
    <Container maxWidth="lg">
      <Box component="form" onSubmit={submitForm}>
        <h1>
          Sign Up to
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
            {submitMutation.isPending ? "Signing up..." : "Sign Up"}
          </Button>
        </Box>

        <Box>
          {bottomMessage && <Typography variant="body1">{bottomMessage}</Typography>}
        </Box>
        
        {errors}

        <Typography variant="body1" sx={{ fontSize: '18px', mt: 2 }}>
          Already have an account? <NextLink href={'/auth/signin?redirect=' + postSignupRedirect || '/'} style={{ fontWeight: 600 }}>Sign in</NextLink>
        </Typography>
      </Box>
    </Container>
  );
}
