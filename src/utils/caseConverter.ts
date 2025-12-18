/**
 * Utility functions for converting object keys between naming conventions
 * Used for transforming API responses from snake_case (Python backend) to camelCase (TypeScript frontend)
 */

/**
 * Convert a snake_case string to camelCase
 * @param str - String in snake_case format
 * @returns String in camelCase format
 * @example
 * snakeToCamelString('stage_previous') // returns 'stagePrevious'
 * snakeToCamelString('confidence_change') // returns 'confidenceChange'
 */
function snakeToCamelString(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursively convert all keys in an object from snake_case to camelCase
 * Handles nested objects, arrays, and null values
 *
 * @param obj - Object with snake_case keys
 * @returns New object with camelCase keys
 *
 * @example
 * snakeToCamel({
 *   stage_previous: 2,
 *   confidence_change: 3.0,
 *   metric_comparisons: [{ previous_value: 75 }]
 * })
 * // Returns:
 * // {
 * //   stagePrevious: 2,
 * //   confidenceChange: 3.0,
 * //   metricComparisons: [{ previousValue: 75 }]
 * // }
 */
export function snakeToCamel<T = any>(obj: any): T {
  // Handle null, undefined, or non-object values
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays - recursively convert each element
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item)) as T;
  }

  // Handle objects - convert keys and recursively convert values
  const converted: any = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = snakeToCamelString(key);
      const value = obj[key];

      // Recursively convert nested objects/arrays
      converted[camelKey] = snakeToCamel(value);
    }
  }

  return converted as T;
}

/**
 * Convert a camelCase string to snake_case
 * @param str - String in camelCase format
 * @returns String in snake_case format
 * @example
 * camelToSnakeString('stagePrevious') // returns 'stage_previous'
 * camelToSnakeString('confidenceChange') // returns 'confidence_change'
 */
function camelToSnakeString(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Recursively convert all keys in an object from camelCase to snake_case
 * Useful for sending data to Python backend
 *
 * @param obj - Object with camelCase keys
 * @returns New object with snake_case keys
 */
export function camelToSnake<T = any>(obj: any): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake(item)) as T;
  }

  const converted: any = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = camelToSnakeString(key);
      const value = obj[key];

      converted[snakeKey] = camelToSnake(value);
    }
  }

  return converted as T;
}
