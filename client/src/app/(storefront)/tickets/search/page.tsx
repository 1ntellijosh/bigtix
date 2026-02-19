/**
 * Ticket search page SSR page for initial search results and page load
 *
 * @since ticketmaster-api--JP
 */
import Container from '@mui/material/Container';
import SearchPageContent from './SearchPageContent';
import { API } from '../../../../lib/api/dicts/API';
import { headers } from 'next/headers';
import type { initialSearchProps } from '../../../../components/EventSearch';

export default async function TicketSearchPage({ searchParams }: { searchParams: Promise<{ keywords?: string }> }) {
  const { keywords = '' } = await searchParams;
  const searchQuery = typeof keywords === 'string' ? keywords.trim() : '';

  let initialSearchResults: any[] = [];
  if (searchQuery !== '') {
    const initialSearch = decodeURIComponent(searchQuery);
    try {
      const ctxHeaders = await headers();
      const cookie = ctxHeaders.get('cookie') ?? '';
      const host = ctxHeaders.get('host') ?? '';
      const resp = await API.tick!.searchForEvents!(initialSearch, {
        headers: { Cookie: cookie, Host: host },
      });
      initialSearchResults = (resp as unknown as any[]) ?? [];
    } catch (error) {
      initialSearchResults = [];
    }
  }

  const initialSearchProps: initialSearchProps = {
    keywords: searchQuery,
    initialSearchResults: initialSearchResults,
  }

  return (
    <Container sx={{ minWidth: '100%', height: '100%' }} disableGutters>
      <SearchPageContent initialSearchProps={initialSearchProps} />
    </Container>
  );
}
