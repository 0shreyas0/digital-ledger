export const getSignInErrorMessage = (err) => {
  const code = err?.errors?.[0]?.code
  const msg = err?.errors?.[0]?.message

  switch (code) {
    case "form_param_nil":
      return "Email and password are required";
    case "form_identifier_not_found":
      return "No account found with this email";
    case "form_password_incorrect":
      return "Incorrect password";
    case "form_identifier_invalid":
      return "Invalid email format";
    case "rate_limit_exceeded":
      return "Too many attempts. Please wait";
    default:
      return msg || err?.message || "An unknown error occurred";
  }
};

export const getSignUpErrorMessage = (err) => {
  const code = err?.errors?.[0]?.code;
  const msg = err?.errors?.[0]?.message;

  switch (code) {
    case "form_param_nil":
      return "All fields are required";
    case "form_identifier_exists":
      return "An account with this email already exists";
    case "form_password_too_short":
    case "form_password_length_too_short":
      return "Password is too short";
    case "form_password_not_strong_enough":
      return "Password is too weak";
    case "form_identifier_invalid":
      return "Invalid email format";
    case "rate_limit_exceeded":
      return "Too many attempts. Please wait";
    default:
      return msg || err?.message || "An unknown error occurred";
  }
};
