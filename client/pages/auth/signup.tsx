/**
 * Regular user sign up page
 *
 * @since next-client--JP
 */
import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { API } from '../../lib/api/dicts/API';
import { useRouter } from 'next/router';
import FormSubmit from '../../hooks/FormSubmit';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bottomMessage, setBottomMessage] = useState('');

  const onSuccessfulSignup = () => {
    setBottomMessage("You're signed up! Redirecting you back...");
    setTimeout(() => {
      router.replace('/');
    }, 1500);
  }

  const { errors, submitForm, submitMutation } = FormSubmit(
    () => API.auth!.signUpUser!({ email, password }),
    { email, password },
    onSuccessfulSignup,
  );

  return (
    <Form onSubmit={submitForm}>
      <h1>Sign Up</h1>

      <Form.Group className="mb-3" controlId="email">
        <Form.Label>Email</Form.Label>

        <Form.Control
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="password">
        <Form.Label>Password</Form.Label>

        <Form.Control
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>

      <Button variant="primary" type="submit" disabled={submitMutation.isPending}>
        {submitMutation.isPending ? "Signing up..." : "Sign Up"}
      </Button>

      <div className="mt-3 signup-feedback-msg">{bottomMessage && <p>{bottomMessage}</p>}</div>
      
      {errors}
    </Form>
  );
}
