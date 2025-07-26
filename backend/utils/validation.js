// Validation utilities for the application

const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};

const validateStudentId = (studentId) => {
  // Example: should be alphanumeric, 6-12 characters
  const studentIdRegex = /^[A-Za-z0-9]{6,12}$/;
  return studentIdRegex.test(studentId);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateTodo = (todoData) => {
  const errors = [];
  
  if (!todoData.title || todoData.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (todoData.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  if (todoData.description && todoData.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }
  
  if (todoData.priority && !['low', 'medium', 'high', 'urgent'].includes(todoData.priority)) {
    errors.push('Invalid priority level');
  }
  
  if (todoData.deadline && new Date(todoData.deadline) < new Date()) {
    errors.push('Deadline cannot be in the past');
  }
  
  if (todoData.adminNotes && todoData.adminNotes.length > 500) {
    errors.push('Admin notes must be less than 500 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateTodoUpdate = (todoData) => {
  const errors = [];
  
  if (todoData.title !== undefined) {
    if (!todoData.title || todoData.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (todoData.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }
  }
  
  if (todoData.description !== undefined && todoData.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }
  
  if (todoData.priority !== undefined && !['low', 'medium', 'high', 'urgent'].includes(todoData.priority)) {
    errors.push('Invalid priority level');
  }
  
  if (todoData.deadline !== undefined && todoData.deadline && new Date(todoData.deadline) < new Date()) {
    errors.push('Deadline cannot be in the past');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateUserData = (userData) => {
  const errors = [];
  
  if (!userData.username || userData.username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  } else if (userData.username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  
  if (!userData.email || !validateEmail(userData.email)) {
    errors.push('Valid email is required');
  }
  
  if (!userData.firstName || userData.firstName.trim().length === 0) {
    errors.push('First name is required');
  } else if (userData.firstName.length > 50) {
    errors.push('First name must be less than 50 characters');
  }
  
  if (!userData.lastName || userData.lastName.trim().length === 0) {
    errors.push('Last name is required');
  } else if (userData.lastName.length > 50) {
    errors.push('Last name must be less than 50 characters');
  }
  
  if (userData.phoneNumber && !validatePhoneNumber(userData.phoneNumber)) {
    errors.push('Invalid phone number format');
  }
  
  if (userData.role === 'student') {
    if (!userData.studentId || !validateStudentId(userData.studentId)) {
      errors.push('Valid student ID is required for students');
    }
    
    if (!userData.faculty || userData.faculty.trim().length === 0) {
      errors.push('Faculty is required for students');
    }
    
    if (!userData.course || userData.course < 1 || userData.course > 6) {
      errors.push('Course must be between 1 and 6');
    }
    
    if (!userData.specialization || userData.specialization.trim().length === 0) {
      errors.push('Specialization is required for students');
    }
  }
  
  if (userData.gender === 'other' && (!userData.customGender || userData.customGender.trim().length === 0)) {
    errors.push('Custom gender is required when gender is "other"');
  }
  
  if (!userData.dateOfBirth) {
    errors.push('Date of birth is required');
  } else {
    const birthDate = new Date(userData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 16 || age > 100) {
      errors.push('Age must be between 16 and 100 years');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateUserUpdate = (userData) => {
  const errors = [];
  
  if (userData.username !== undefined) {
    if (!userData.username || userData.username.trim().length < 3) {
      errors.push('Username must be at least 3 characters long');
    } else if (userData.username.length > 30) {
      errors.push('Username must be less than 30 characters');
    }
  }
  
  if (userData.email !== undefined && (!userData.email || !validateEmail(userData.email))) {
    errors.push('Valid email is required');
  }
  
  if (userData.firstName !== undefined) {
    if (!userData.firstName || userData.firstName.trim().length === 0) {
      errors.push('First name cannot be empty');
    } else if (userData.firstName.length > 50) {
      errors.push('First name must be less than 50 characters');
    }
  }
  
  if (userData.lastName !== undefined) {
    if (!userData.lastName || userData.lastName.trim().length === 0) {
      errors.push('Last name cannot be empty');
    } else if (userData.lastName.length > 50) {
      errors.push('Last name must be less than 50 characters');
    }
  }
  
  if (userData.phoneNumber !== undefined && userData.phoneNumber && !validatePhoneNumber(userData.phoneNumber)) {
    errors.push('Invalid phone number format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

module.exports = {
  validateEmail,
  validatePhoneNumber,
  validateStudentId,
  validatePassword,
  validateTodo,
  validateTodoUpdate,
  validateUserData,
  validateUserUpdate,
  sanitizeInput,
  sanitizeObject
};