const validator = require('validator');

/**
 * Sanitization utility to replace mongo-sanitize functionality
 * Provides secure input sanitization for MongoDB queries
 */

/**
 * Sanitizes a string input to prevent NoSQL injection
 * @param {any} input - The input to sanitize
 * @returns {any} - Sanitized input
 */
const sanitizeInput = (input) => {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    // Escape special characters that could be used for NoSQL injection
    return validator.escape(input);
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
};

/**
 * Sanitizes MongoDB query operators and values
 * @param {any} input - The input to sanitize
 * @returns {any} - Sanitized input safe for MongoDB queries
 */
const sanitizeForMongo = (input) => {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    // Remove MongoDB operators that could be injected
    const sanitized = input.replace(/[$.\[\]]/g, '');
    return validator.escape(sanitized);
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeForMongo);
  }

  if (typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      // Skip MongoDB operator keys for security
      if (key.startsWith('$')) {
        continue;
      }
      sanitized[key] = sanitizeForMongo(value);
    }
    return sanitized;
  }

  return input;
};

/**
 * Sanitizes user input for search queries
 * @param {string} input - The search input to sanitize
 * @returns {string} - Sanitized search string
 */
const sanitizeSearchInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters and MongoDB operators
  return input.replace(/[$.\[\]{}()^+\-*?\\|]/g, '').trim();
};

/**
 * Sanitizes ObjectId strings
 * @param {string} id - The ObjectId string to validate and sanitize
 * @returns {string|null} - Sanitized ObjectId or null if invalid
 */
const sanitizeObjectId = (id) => {
  if (!id || typeof id !== 'string') {
    return null;
  }

  // Remove any non-hex characters
  const sanitized = id.replace(/[^0-9a-fA-F]/g, '');

  // Check if it's a valid 24-character hex string
  if (sanitized.length === 24 && /^[0-9a-fA-F]{24}$/.test(sanitized)) {
    return sanitized;
  }

  return null;
};

module.exports = {
  sanitizeInput,
  sanitizeForMongo,
  sanitizeSearchInput,
  sanitizeObjectId,
};
