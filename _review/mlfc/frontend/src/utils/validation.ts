export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateField = (value: any, rules: ValidationRule): string | null => {
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return rules.message || 'This field is required';
  }

  if (value && typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return rules.message || `Minimum length is ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.message || `Maximum length is ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message || 'Invalid format';
    }
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const validateForm = (data: Record<string, any>, rules: Record<string, ValidationRule>): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const fieldValue = data[field];
    const error = validateField(fieldValue, fieldRules);
    
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

// Common validation rules
export const commonRules = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message: message || 'This field is required'
  }),
  
  email: (message?: string): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || 'Please enter a valid email address'
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `Minimum length is ${min} characters`
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message: message || `Maximum length is ${max} characters`
  }),
  
  password: (message?: string): ValidationRule => ({
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    message: message || 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number'
  }),
  
  username: (message?: string): ValidationRule => ({
    pattern: /^[a-zA-Z0-9_]{3,20}$/,
    message: message || 'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
  })
};

// Form validation schemas
export const authValidation = {
  email: commonRules.email(),
  password: commonRules.password(),
  username: commonRules.username(),
  confirmPassword: (password: string): ValidationRule => ({
    custom: (value: string) => {
      if (value !== password) {
        return 'Passwords do not match';
      }
      return null;
    }
  })
};

export const postValidation = {
  title: {
    ...commonRules.required('Title is required'),
    ...commonRules.minLength(3, 'Title must be at least 3 characters'),
    ...commonRules.maxLength(200, 'Title must be less than 200 characters')
  },
  content: {
    ...commonRules.required('Content is required'),
    ...commonRules.minLength(10, 'Content must be at least 10 characters'),
    ...commonRules.maxLength(10000, 'Content must be less than 10000 characters')
  },
  category: commonRules.required('Category is required')
};