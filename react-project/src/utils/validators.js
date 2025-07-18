export const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

// Password: 8-20 chars, at least one letter, one number, one allowed special char, only allowed symbols
export const isValidPassword = (password) => {
  const lengthValid = password.length >= 8 && password.length <= 20;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[~.!@#$%^&*<>]/.test(password);
  const onlyAllowed = /^[a-zA-Z0-9~.!@#$%^&*<>]+$/.test(password);
  return lengthValid && hasLetter && hasNumber && hasSpecial && onlyAllowed;
};
