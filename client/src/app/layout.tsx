/**
 * Root layout (Server Component). Fetches currentUser server-side and passes to Providers.
 * Route-specific layouts handle navbars and shells.
 *
 * @since next-client--JP
 */
import { headers } from 'next/headers';
import { API } from '../lib/api/dicts/API';
import Providers from './Providers';

export default async function RootLayout(props: { children: React.ReactNode }) {
  let initialCurrentUser: { email: string, id: string } | null = null;
  try {
    const ctxHeaders = await headers();
    const cookie = ctxHeaders.get('cookie') ?? '';
    const host = ctxHeaders.get('host') ?? '';
    
    const resp = await API.auth!.getCurrentUser!({
      headers: { Cookie: cookie, Host: host },
    });
    initialCurrentUser = (resp as { currentUser?: { email: string, id: string } })?.currentUser ?? null;
  } catch (error) {
    initialCurrentUser = null;
  }

  return (
    <html lang="en">
      <body>
        <Providers initialCurrentUser={initialCurrentUser}>{props.children}</Providers>
      </body>
    </html>
  );
}
