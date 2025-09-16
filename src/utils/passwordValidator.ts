export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-4 strength score
  errors: string[];
  suggestions: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Check minimum length (required)
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
    suggestions.push('Add an uppercase letter (A-Z)');
  } else {
    score += 1;
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
    suggestions.push('Add a lowercase letter (a-z)');
  } else {
    score += 1;
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
    suggestions.push('Add a number (0-9)');
  } else {
    score += 1;
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
    suggestions.push('Add a special character (!@#$%^&*...)');
  } else {
    score += 1;
  }

  // Check for common patterns
  const commonPatterns = [
    /(.)\1{2,}/,      // Repeated characters (aaa, 111)
    /123|234|345|456|567|678|789/,  // Sequential numbers
    /abc|bcd|cde|def|efg|fgh|ghi/,  // Sequential letters
    /password|admin|user|login|welcome|qwerty|abc123|123456/i  // Common words
  ];

  commonPatterns.forEach(pattern => {
    if (pattern.test(password)) {
      suggestions.push('Avoid common patterns and sequences');
    }
  });

  // Bonus points for length
  if (password.length >= 12) {
    score += 1;
  }

  return {
    isValid: errors.length === 0,
    score: Math.min(score, 4), // Cap at 4
    errors,
    suggestions
  };
}

export function getPasswordStrength(password: string): 'weak' | 'fair' | 'good' | 'strong' {
  const { score } = validatePassword(password);
  
  if (score <= 1) return 'weak';
  if (score === 2) return 'fair';
  if (score === 3) return 'good';
  return 'strong';
}

export function getPasswordStrengthColor(password: string): string {
  const strength = getPasswordStrength(password);
  
  switch (strength) {
    case 'weak': return '#f44336';    // Red
    case 'fair': return '#ff9800';    // Orange
    case 'good': return '#2196f3';    // Blue
    case 'strong': return '#4caf50';  // Green
    default: return '#9e9e9e';        // Gray
  }
}

export function generatePasswordSuggestion(): string {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let password = '';
  
  // Ensure at least one of each required type
  password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // Fill remaining length with random characters
  const allChars = uppercaseChars + lowercaseChars + numbers + specialChars;
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
} 