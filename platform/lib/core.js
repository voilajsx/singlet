/**
 * @fileoverview Simplified Singlet core functions
 * @description Essential utilities for ultra-simple development ✨
 * @package @voilajsx/singlet
 * @file /platform/lib/core.js
 */

import { notFoundError, validationError, serverError } from './error.js';

/**
 * Simple validation - supports both Laravel-style and object-style rules
 * @param {Object} data - Data to validate
 * @param {Object} rules - Validation rules (Laravel-style strings or object format)
 * @returns {Object} Validated data
 */
export function validate(data, rules) {
  if (!data) data = {};

  const validated = {};
  const errors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    // Handle Laravel-style string rules (e.g., 'required|string|min:1')
    if (typeof rule === 'string') {
      const ruleArray = rule.split('|');

      // Check required
      if (ruleArray.includes('required')) {
        if (!value || value === '') {
          errors[field] = `${field} is required`;
          continue;
        }
      }

      // Skip if not provided and not required
      if (!value && value !== 0) {
        continue;
      }

      // Type validation
      if (ruleArray.includes('string') && typeof value !== 'string') {
        errors[field] = `${field} must be a string`;
        continue;
      }

      if (ruleArray.includes('number') && typeof value !== 'number') {
        errors[field] = `${field} must be a number`;
        continue;
      }

      // Min length
      const minRule = ruleArray.find((r) => r.startsWith('min:'));
      if (minRule && typeof value === 'string') {
        const min = parseInt(minRule.split(':')[1]);
        if (value.length < min) {
          errors[field] = `${field} must be at least ${min} characters`;
          continue;
        }
      }

      validated[field] = value;
    }
    // Handle object-style rules (compatible with existing validateRequest)
    else if (typeof rule === 'object') {
      // Check required
      if (rule.required && (!value || value === '')) {
        errors[field] = `${field} is required`;
        continue;
      }

      // Skip if not provided and not required
      if (!value && value !== 0 && !rule.required) {
        continue;
      }

      // Type validation
      if (rule.type && typeof value !== rule.type) {
        errors[field] = `${field} must be of type ${rule.type}`;
        continue;
      }

      // Min length
      if (
        rule.minLength &&
        typeof value === 'string' &&
        value.length < rule.minLength
      ) {
        errors[
          field
        ] = `${field} must be at least ${rule.minLength} characters`;
        continue;
      }

      validated[field] = value;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw validationError('Validation failed', errors);
  }

  return validated;
}

/**
 * Simple not found error - just throw notFound()
 * @param {string} message - Error message
 * @returns {Error} Not found error
 */
export function notFound(message) {
  return notFoundError(message);
}

/**
 * Simple server error - just throw serverError()
 * @param {string} message - Error message
 * @returns {Error} Server error
 */
export function error(message) {
  return serverError(message);
}

/**
 * Simple validation error - just throw validationErr()
 * @param {string} message - Error message
 * @param {Object} details - Error details
 * @returns {Error} Validation error
 */
export function validationErr(message, details) {
  return validationError(message, details);
}
