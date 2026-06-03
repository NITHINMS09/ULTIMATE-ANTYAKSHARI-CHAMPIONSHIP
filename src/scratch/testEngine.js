import { getNextLetter, isValidStartingLetter } from '../engine/LetterEngine.js';
import { GameEngine } from '../engine/GameEngine.js';
import { validateSong } from '../engine/ValidationEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(` ✅ PASS: ${message}`);
  } else {
    failed++;
    console.error(` ❌ FAIL: ${message}`);
  }
}

console.log('=== RUNNING ANTYAKSHARI ENGINE TESTS ===\n');

// ── 1. Letter Extraction Tests ──
console.log('1. Letter Extraction (LetterEngine):');
assert(getNextLetter('Kesariya') === 'A', 'Extracts last letter "A" from "Kesariya"');
assert(getNextLetter('Chaiyya Chaiyya') === 'A', 'Extracts last letter "A" from "Chaiyya Chaiyya"');
assert(getNextLetter('Kal Ho Naa Ho') === 'O', 'Extracts last letter "O" from "Kal Ho Naa Ho"');
assert(getNextLetter('Yesterday!') === 'Y', 'Filters punctuation and extracts "Y" from "Yesterday!"');
assert(getNextLetter('Hello...') === 'O', 'Filters ellipses and extracts "O" from "Hello..."');

// Devanagari Matra filtering check
assert(getNextLetter('केसरिया') === 'य', 'Filters Hindi vowel matra (ा) and extracts "य"');

// ── 2. Starting Letter Validation ──
console.log('\n2. Starting Letter Validation:');
assert(isValidStartingLetter('Kesariya', 'K') === true, 'Accepts "Kesariya" for letter "K"');
assert(isValidStartingLetter('Kesariya', 'k') === true, 'Case-insensitive match accepts "Kesariya" for letter "k"');
assert(isValidStartingLetter('Tum Hi Ho', 'K') === false, 'Rejects "Tum Hi Ho" for letter "K"');

// ── 3. Score Calculation Tests ──
console.log('\n3. Score Calculation (GameEngine):');
const defaultSettings = {
  timePerTurn: 30,
  pointsPerCorrect: 10,
  pointsPerBonus: 5,
  penaltyPoints: -5,
  gameMode: 'classic'
};

// Base correct score: 10 points
const scoreNormal = GameEngine.calculateScore({ songTitle: 'Kesariya' }, 25, defaultSettings);
assert(scoreNormal === 10, `Normal response gives base points: expected 10, got ${scoreNormal}`);

// Speed bonus score: answer in first 25% of time (e.g. 5 seconds of 30) -> 2x multiplier -> 20 points
const scoreFast = GameEngine.calculateScore({ songTitle: 'Kesariya' }, 5, defaultSettings);
assert(scoreFast === 20, `Fast response gives speed multiplier points: expected 20, got ${scoreFast}`);

// Metadata bonus: title + artist + movie -> +5 bonus points
const scoreMeta = GameEngine.calculateScore({
  songTitle: 'Kesariya',
  artist: 'Arijit Singh',
  movie: 'Brahmastra'
}, 25, defaultSettings);
assert(scoreMeta === 15, `Providing extra metadata adds bonus points: expected 15, got ${scoreMeta}`);

// ── 4. Song Validation Tests ──
console.log('\n4. Song Validation (ValidationEngine):');
const emptyVal = validateSong({ songTitle: '' }, 'K', []);
assert(emptyVal.status === 'rejected', 'Rejects empty song title');

const shortVal = validateSong({ songTitle: 'K' }, 'K', []);
assert(shortVal.status === 'rejected', 'Rejects single-letter title');

const correctVal = validateSong({ songTitle: 'Kesariya' }, 'K', []);
assert(correctVal.status === 'approved' && correctVal.confidence >= 75, 'Approves correct song with high confidence');

const duplicateVal = validateSong({ songTitle: 'Kesariya' }, 'K', ['kesariya']);
assert(duplicateVal.status === 'rejected', 'Rejects duplicate song');

console.log(`\n=== TEST RUN COMPLETED: ${passed} PASSED, ${failed} FAILED ===`);
process.exit(failed > 0 ? 1 : 0);
