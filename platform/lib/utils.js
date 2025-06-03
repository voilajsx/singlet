/**
 * @fileoverview Utils integration for Singlet Framework with smart defaults
 * @description Provides utility functions with Singlet-specific configurations
 * @package @voilajsx/singlet
 * @file /platform/lib/utils.js
 */

/**
 * Re-export all appkit utils functions with same names
 */
export {
  // Object utilities
  pick,
  omit,
  deepMerge,
  deepClone,
  get,
  set,
  has,
  flatten,
  unflatten,
  isEqual,
  isEmpty,
  defaults,
  mapKeys,
  mapValues,
  groupBy,
  keyBy,

  // String utilities
  capitalize,
  camelCase,
  snakeCase,
  kebabCase,
  pascalCase,
  titleCase,
  generateId,
  generateUuid,
  slugify,
  truncate,
  padStart,
  padEnd,
  template,
  escapeHtml,
  unescapeHtml,
  escapeRegExp,
  maskString,

  // Date utilities
  formatDate,
  parseDate,
  addDays,
  addMonths,
  addYears,
  subDays,
  subMonths,
  subYears,
  dateDiff,
  startOf,
  endOf,
  isBetween,
  isAfter,
  isBefore,

  // Async utilities
  sleep,
  retry,
  timeout,
  parallel,
  series,
  debounce,
  throttle,
  mapAsync,
  filterAsync,
  allSettled,
  raceWithTimeout,
  deferred,
  createQueue,
} from '@voilajsx/appkit/utils';
