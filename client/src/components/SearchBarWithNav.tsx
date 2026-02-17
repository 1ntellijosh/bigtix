/**
 * Client wrapper: SearchBar that navigates to /tickets/search on submit.
 * Use this from server components so the page can stay SSR while search stays client.
 */
'use client';

import { useRouter } from 'next/navigation';
import SearchBar from './SearchBar';

export default function SearchBarWithNav({ placeholder = 'Search for an event' }: { placeholder?: string }) {
  const router = useRouter();

  const onSearch = (keywords: string) => {
    router.push(`/tickets/search?keywords=${encodeURIComponent(keywords)}`);
  };

  return <SearchBar placeholder={placeholder} onSearch={onSearch} />;
}
