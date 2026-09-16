/**
 * Safely retrieves and parses a JSON item from localStorage.
 * Prevents application crashes from malformed JSON or undefined values.
 * 
 * @param {string} key - The localStorage key to retrieve.
 * @param {any} fallback - Fallback value if retrieval/parsing fails.
 * @returns {any} The parsed value or fallback.
 */
export const getSafeStorageItem = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === "undefined" || item === "null") {
      return fallback;
    }
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Failed to parse localStorage key "${key}":`, error);
    return fallback;
  }
};
