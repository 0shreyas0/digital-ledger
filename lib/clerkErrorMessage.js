// const getErrorMessage = (err) => {
//     const msg = err?.errors?.[0]?.longMessage ||
//     err?.errors?.[0]?.message ||
//     err?.message ||
//     "An unknown error occurred";
//     return msg;
// };

// export default getErrorMessage;

export const getSignInErrorMessage = (err) => {
  const code = err?.errors?.[0]?.code;
  const msg =
    err?.errors?.[0]?.longMessage ||
    err?.errors?.[0]?.message ||
    err?.message;

  switch (code) {
    case "form_param_nil":
      return "Username or email and password are required";
    case "form_identifier_not_found":
      return "No account found with this username or email";
    case "form_password_incorrect":
      return "Incorrect password";
    case "form_identifier_invalid":
      return "Enter a valid username or email";
    case "rate_limit_exceeded":
      return "Too many attempts. Please wait";
    default:
      return msg || "An unknown error occurred";
  }
};

export const getSignUpErrorMessage = (err) => {
  const code = err?.errors?.[0]?.code;
  const msg =
    err?.errors?.[0]?.longMessage ||
    err?.errors?.[0]?.message ||
    err?.message;

  switch (code) {
    case "form_param_nil":
      return "All fields are required";
    case "form_identifier_exists":
      return "That username or email is already in use";
    case "form_password_too_short":
    case "form_password_length_too_short":
      return "Password is too short";
    case "form_password_not_strong_enough":
      return "Password is too weak";
    case "form_identifier_invalid":
      return "Enter a valid username and email";
    case "form_username_invalid_character":
      return "Username can only use letters, numbers, underscores, or dashes";
    case "form_username_invalid_length":
      return "Username does not meet the length requirements";
    case "rate_limit_exceeded":
      return "Too many attempts. Please wait";
    default:
      return msg || "An unknown error occurred";
  }
};
