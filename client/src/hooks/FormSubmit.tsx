/**
 * FormSubmit hook, used for submitting forms to the server, with error markup for the form
 *
 * @since next-client--JP
 */
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { APIError } from "@bigtix/common";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

export default (
  apiMethod: () => Promise<Response>,
  body: any,
  onSuccess: () => void,
  onFail?: (error: APIError) => void
) => {
  const [errors, setErrors] = useState<null | React.ReactNode>(null);

  const submitForm = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors(null);
    submitMutation.mutate(body);
  };

  const onError = (error: APIError) => {
    const errorsList = error instanceof APIError
      ? error.errors.filter((error) => error.message !== 'Invalid value') // Filter out 'Invalid value' messages
      : [ { message: 'Something went wrong. Please try again' } ];
    setErrors(
      <Alert severity="error">
        <AlertTitle>Oops...</AlertTitle>
        <List dense disablePadding>
          {errorsList.map((error, i) => (
            <ListItem key={i} disablePadding>
              <ListItemText primary={error.message} />
            </ListItem>
          ))}
        </List>
      </Alert>
    );
    // If optional onFail function is provided, call it as well
    if (onFail) onFail(error);
  };

  const submitMutation = useMutation({
    mutationFn: apiMethod,
    onSuccess,
    onError,
  });

  return { submitForm, submitMutation, errors };
};
