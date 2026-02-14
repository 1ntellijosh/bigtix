/**
 * List skeleton component, used to display a loading state for a list of items.
 *
 * @since ticketmaster-api--JP
 */
import { Box } from '@mui/material';
import { Skeleton } from '@mui/material';

export default function ListSkeleton({ height, count, marginBottom }: { height: number, count: number, marginBottom: number }) {
  return (
    <Box width="100%">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="rounded" animation="wave" height={height} sx={{ marginBottom }} />
      ))}
    </Box>
  );
}