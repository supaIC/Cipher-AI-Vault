// logger.ts
import { throttle } from 'lodash';

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Logs messages to the console only in development mode.
 * Throttled to prevent excessive logs.
 * @param args - The messages or data to log.
 */
export const debugLog = throttle((...args: any[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
}, 1000); // Limits logs to once per second

/**
 * Logs error messages to the console regardless of the environment.
 * @param args - The error messages or data to log.
 */
export const errorLog = (...args: any[]) => {
  console.error(...args);
};
