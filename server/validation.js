// server/validation.js

// Password validation rules
const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters long');
  if (!/(?=.*[a-z])/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/(?=.*[A-Z])/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/(?=.*\d)/.test(password)) errors.push('Password must contain at least one number');
  if (!/(?=.*[@$!%*?&])/.test(password)) errors.push('Password must contain at least one special character');
  return errors;
};

// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Username validation
const validateUsername = (username) => {
  const errors = [];
  if (username.length < 3) errors.push('Username must be at least 3 characters long');
  if (username.length > 20) errors.push('Username must be less than 20 characters');
  if (!/^[a-zA-Z0-9_]+$/.test(username)) errors.push('Username can only contain letters, numbers, and underscores');
  return errors;
};

module.exports = {
  validatePassword,
  validateEmail,
  validateUsername,
};