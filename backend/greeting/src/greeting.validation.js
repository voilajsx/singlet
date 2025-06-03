/**
 * @fileoverview Greeting feature validation schemas
 * @description Request validation schemas for greeting endpoints
 * @package @voilajsx/singlet
 * @file /backend/greeting/src/greeting.validation.js
 */

import { config } from './greeting.config.js';

/**
 * Custom greeting request validation schema
 */
export const customGreetingSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 50,
    },
    language: {
      type: 'string',
      default: config.defaultLanguage,
      maxLength: 20,
    },
  },
};
