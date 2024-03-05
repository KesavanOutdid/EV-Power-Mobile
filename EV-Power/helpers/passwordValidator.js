// export function passwordValidator(password) {
//   const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/
//   if (!password) return "Email can't be empty."
//   if (!re.test(password)) return 'Ooops! Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one special character, and one number.'
//   return ''
// }
export function passwordValidator(password) {
  const re = /^\d{4}$/
  if (!password) return "Password can't be empty."
  if (!re.test(password)) return 'Ooops! Password must be a 4-digit number.'
  return ''
}