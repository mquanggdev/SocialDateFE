export function validateAuth(email?: string, password?: string) {
  const errors: { email?: string; password?: string } = {};

  // Email validation
  if (!email) {
    errors.email = 'Vui lòng nhập email';
  } else if (email.length > 60) {
    errors.email = 'Email không được vượt quá 60 ký tự';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Email không hợp lệ';
  }

  // Password validation
  if (!password) {
    errors.password = 'Vui lòng nhập mật khẩu';
  } else if (password.length < 8) {
    errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
  } else if (password.length > 30) {
    errors.password = 'Mật khẩu không được vượt quá 30 ký tự';
  } else if (!/[0-9]/.test(password)) {
    errors.password = 'Mật khẩu phải chứa ít nhất một số';
  } else if (!/[a-z]/.test(password)) {
    errors.password = 'Mật khẩu phải chứa ít nhất một chữ cái thường';
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Mật khẩu phải chứa ít nhất một chữ cái in hoa';
  } else if (!/[^A-Za-z0-9]/.test(password)) {
    errors.password = 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt';
  }

  return errors;
}
