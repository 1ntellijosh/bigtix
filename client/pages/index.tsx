import { API } from '../lib/api/dicts/API';
import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps<{ currentUser: { email: string } | null; }> = async (context) => {
  const data = await API.auth!.getCurrentUser!({ headers: context.req.headers });

  return { props: { currentUser: (data as any)?.currentUser ?? null } };
};

export default function LandingPage({ currentUser }: { currentUser: { email: string } | null }) {
  return (
    <div>
      <h1>Landing Page</h1>
      <p>Current User: {currentUser?.email || 'Not logged in'}</p>
    </div>
  );
}
