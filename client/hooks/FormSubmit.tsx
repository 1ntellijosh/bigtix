/**
 * FormSubmit hook, used for submitting forms to the server, with error markup for the form
 *
 * @since next-client--JP
 */
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { APIError } from "@bigtix/common";
import type { ErrorResponseItem } from "@bigtix/common";

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
      <div className="alert alert-danger">
        <h4 className="alert-heading">Oops...</h4>
        <ul className="my-0">
          {errorsList.map((error, i) => (
            <li key={i}>{error.message}</li>
          ))}
        </ul>
      </div>
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
