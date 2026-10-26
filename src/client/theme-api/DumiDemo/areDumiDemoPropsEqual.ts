export function areDumiDemoPropsEqual<T>(prev: T, next: T) {
  // Ignore loader function identity while still detecting serializable demo updates.
  return JSON.stringify(prev) === JSON.stringify(next);
}
