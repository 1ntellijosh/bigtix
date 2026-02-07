/**
 * Context is shared between all routes (storefront, auth, admin) for currentUser states and changes
 * 
 * @since  material-UI-sass--JP
 */
'use client';

import { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API } from '../lib/api/dicts/API';

export type CurrentUser = { email: string, id: string } | null;

type CurrentUserContextType = {
  currentUser: CurrentUser;
  signOut: () => Promise<void>;
  isInitial: boolean;
};

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined);

async function fetchCurrentUser(): Promise<CurrentUser> {
  const resp = await API.auth!.getCurrentUser!();
  return (resp as { currentUser?: { email: string, id: string } })?.currentUser ?? null;
}

type CurrentUserProviderProps = {
  initialCurrentUser: CurrentUser;
  children: React.ReactNode;
};

/**
 * Provides currentUser from server (initial) + react-query (cache + refetch after signOut).
 * Use useCurrentUser() in any route (storefront, auth, admin).
 */
export function CurrentUserProvider({ initialCurrentUser, children }: CurrentUserProviderProps) {
  const queryClient = useQueryClient();
  const { data: currentUser = initialCurrentUser, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    initialData: initialCurrentUser,
    staleTime: 60 * 1000,
  });
  const isInitial = dataUpdatedAt === 0;

  const signOut = async () => {
    await API.auth!.signOutUser!();
    queryClient.setQueryData(['currentUser'], null);
  };

  return (
    <CurrentUserContext.Provider value={{ currentUser: currentUser ?? null, signOut, isInitial }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (ctx === undefined) {
    throw new Error('useCurrentUser must be used within CurrentUserProvider');
  }
  return ctx;
}
