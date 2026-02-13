/**
 * Search results list hook
 *
 * @since ticketmaster-api--JP
 */
import { useState } from 'react';
import { APIError } from "@bigtix/common";
import { useMutation } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

export default function ListSearchResults(
  apiSearchMethod: (keyword: string) => Promise<any[]>,
  onSuccess: (items: any[]) => void,
  onFail?: (error: APIError) => void
) {
  const [errors, setErrors] = useState<null | React.ReactNode>(null);

  const onError = (error: APIError) => {
    const errorsList = error instanceof APIError
      ? error.errors
      : [ { message: 'Something went wrong. We\'ll have our team look into it soon! Please try again' } ];
    setErrors(
      <Alert severity="error">
        <AlertTitle sx={{ fontSize: '20px' }}>Oops...</AlertTitle>
        <List dense disablePadding>
          {errorsList.map((error) => (
            <ListItem key={error.message} disablePadding>
              <ListItemText primary={error.message} slotProps={{ primary: { variant: 'body2', fontSize: '15px' } }} />
            </ListItem>
          ))}
        </List>
      </Alert>
    );

    if (onFail) onFail(error);
  }

  const searchMutation = useMutation({
    mutationFn: apiSearchMethod,
    onSuccess,
    onError,
  });

  const submitSearch = (keyword: string) => {
    setErrors(null);
    searchMutation.mutate(keyword);
  }

  return { submitSearch, searchMutation, errors };
}