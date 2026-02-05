/**
 * AppLink component
 * 
 * @since  material-UI-sass--JP
 */
'use client';

import MaterialUILink from '@mui/material/Link';
import NextLink from 'next/link';
import type { LinkProps as MuiLinkProps } from '@mui/material/Link';
import type { LinkProps as NextLinkProps } from 'next/link';

type AppLinkProps = Omit<MuiLinkProps, 'component'> &
  Pick<NextLinkProps, 'href' | 'prefetch'>;

export default function AppLink(props: AppLinkProps) {
  return <MaterialUILink component={NextLink} {...(props as any)} />;
}
