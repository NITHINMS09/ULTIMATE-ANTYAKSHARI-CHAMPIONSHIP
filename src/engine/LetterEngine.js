/**
 * @fileoverview LetterEngine — Utilities for letter extraction and
 * validation in the Antyakshari game.
 *
 * In Antyakshari, the next team must sing a song starting with the
 * last consonant-sound letter of the previous song. This engine
 * handles that logic for both Hindi and English song titles.
 */

/**
 * Hindi vowel matras that should be skipped when finding the
 * "last meaningful letter" of a Hindi/Devanagari title.
 */
const HINDI_VOWEL_MATRAS = new Set([
  'ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ', 'ं', 'ः', 'ँ',
]);

/**
 * Check if a character is a Devanagari letter.
 * @param {string} char
 * @returns {boolean}
 */
function isDevanagari(char) {
  const code = char.charCodeAt(0);
  return code >= 0x0900 && code <= 0x097F;
}

/**
 * Check if a song title starts with the required letter.
 * Case-insensitive for Latin, code-point comparison for Devanagari.
 *
 * @param {string} songTitle
 * @param {string} requiredLetter
 * @returns {boolean}
 */
export function isValidStartingLetter(songTitle, requiredLetter) {
  if (!songTitle || !requiredLetter) return false;

  const title = songTitle.trim();
  if (!title) return false;

  const first = title[0];
  const req = requiredLetter;

  // Latin comparison (case-insensitive)
  if (first.toUpperCase() === req.toUpperCase()) return true;

  // Devanagari exact
  if (first === req) return true;

  return false;
}

/**
 * Extract the next letter from a song title.
 * Uses the last character of the title (skipping trailing spaces,
 * punctuation, and Hindi matras) and returns it uppercased for Latin.
 *
 * @param {string} songTitle
 * @returns {string|null} The extracted letter or null
 */
export function getNextLetter(songTitle) {
  if (!songTitle) return null;

  // Strip trailing whitespace and common punctuation
  const cleaned = songTitle
    .trim()
    .replace(/[.!?,;:'"…\-()[\]{}]+$/g, '')
    .trim();

  if (!cleaned) return null;

  // Walk backward to find a meaningful letter
  for (let i = cleaned.length - 1; i >= 0; i--) {
    const ch = cleaned[i];

    // Skip whitespace
    if (/\s/.test(ch)) continue;

    // Skip Hindi vowel matras
    if (HINDI_VOWEL_MATRAS.has(ch)) continue;

    // Skip digits
    if (/\d/.test(ch)) continue;

    // If Devanagari consonant, return as-is
    if (isDevanagari(ch)) return ch;

    // Latin letter — return uppercased
    if (/[a-zA-Z]/.test(ch)) return ch.toUpperCase();
  }

  // Fallback: return the last character uppercased
  return cleaned[cleaned.length - 1].toUpperCase();
}

/**
 * Wrapper object for backward compatibility with require() usage in gameStore.
 */
export const LetterEngine = { isValidStartingLetter, getNextLetter };

export default LetterEngine;
