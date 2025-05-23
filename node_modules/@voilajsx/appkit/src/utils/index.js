/**
 * @voilajs/appkit - Utility module
 * @module @voilajs/appkit/utils
 */

// Object utilities
export {
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
} from './object.js';

// String utilities
export {
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
} from './string.js';

// Date utilities
export {
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
} from './date.js';

// Async utilities
export {
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
} from './async.js';
