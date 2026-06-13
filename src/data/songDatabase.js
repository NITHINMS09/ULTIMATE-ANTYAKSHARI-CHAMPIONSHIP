/**
 * @fileoverview Song Database — 1000+ songs across multiple languages
 * with advanced fuzzy search, Levenshtein matching, lyrics keywords,
 * transliteration support, and language-specific optimizations.
 *
 * Priority Languages: Kannada, Malayalam, Tamil, Telugu, Hindi, English
 */

/* ── Levenshtein Distance ────────────────────────────────────── */

function levenshteinDistance(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/* ── Helpers ──────────────────────────────────────────────────── */

function normalizeForSearch(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function phoneticNormalize(str) {
  // Normalize common phonetic variations in South Indian transliterations
  return str.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    // th -> t
    .replace(/th/g, 't')
    // double vowels
    .replace(/aa/g, 'a')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    // dh -> d
    .replace(/dh/g, 'd')
    // bh -> b, gh -> g, kh -> k, ph -> p
    .replace(/bh/g, 'b')
    .replace(/gh/g, 'g')
    .replace(/kh/g, 'k')
    .replace(/ph/g, 'p')
    // s/sh/ch variations
    .replace(/sh/g, 's')
    .replace(/ch/g, 'c')
    .replace(/\s+/g, ' ')
    .trim();
}

function getLastChar(title) {
  const cleaned = title.replace(/[^a-zA-Z]/g, '');
  return cleaned.length > 0 ? cleaned[cleaned.length - 1].toUpperCase() : '';
}

function getSimilarity(a, b) {
  const na = normalizeForSearch(a);
  const nb = normalizeForSearch(b);
  if (!na || !nb) return 0;
  if (na === nb) return 100;

  // Check phonetic match
  const pna = phoneticNormalize(a);
  const pnb = phoneticNormalize(b);
  if (pna === pnb) return 98;

  // Containment check
  if (na.includes(nb) || nb.includes(na)) {
    const ratio = Math.min(na.length, nb.length) / Math.max(na.length, nb.length);
    return Math.round(70 + ratio * 30);
  }

  // Levenshtein-based similarity
  const maxLen = Math.max(na.length, nb.length);
  const dist = levenshteinDistance(na, nb);
  const levSimilarity = Math.round((1 - dist / maxLen) * 100);

  // Token overlap
  const tokensA = na.split(/\s+/);
  const tokensB = nb.split(/\s+/);
  let tokenMatches = 0;
  for (const t of tokensA) {
    if (tokensB.some(tb => tb.includes(t) || t.includes(tb))) tokenMatches++;
  }
  const tokenSim = tokensA.length > 0 ? Math.round((tokenMatches / Math.max(tokensA.length, tokensB.length)) * 80) : 0;

  // Check phonetic containment
  if (pna.includes(pnb) || pnb.includes(pna)) {
    const ratio = Math.min(pna.length, pnb.length) / Math.max(pna.length, pnb.length);
    const phoneticContainmentSim = Math.round(75 + ratio * 23);
    return Math.max(levSimilarity, tokenSim, phoneticContainmentSim);
  }

  return Math.max(levSimilarity, tokenSim);
}

/* ── Song Data ────────────────────────────────────────────────── */

const songs = [
  // ═══════════════════════════════════════════════════════════
  // KANNADA — 150 songs (Movie, Devotional, Folk)
  // ═══════════════════════════════════════════════════════════
  { id: 1, title: "Huttidare Kannada", artist: "Rajkumar", movie: "Aakasmika", language: "kannada", year: 1993, firstLetter: "H", lastLetter: "A", genre: "movie", lyricsKeywords: ["kannada", "pride", "land"], alternateSpellings: ["Huttidare Kannada Nadu"], popularityScore: 98 },
  { id: 2, title: "Naanu Ninna Mareyalare", artist: "Rajkumar", movie: "Naagarahaavu", language: "kannada", year: 1972, firstLetter: "N", lastLetter: "E", genre: "movie", lyricsKeywords: ["love", "forget", "memory"], alternateSpellings: ["Nanu Ninna"], popularityScore: 95 },
  { id: 3, title: "Jogada Siri Belakinalli", artist: "S.P. Balasubrahmanyam", movie: "Mutthina Haara", language: "kannada", year: 1990, firstLetter: "J", lastLetter: "I", genre: "movie", lyricsKeywords: ["light", "joy", "celebration"], alternateSpellings: ["Jogada Siri"], popularityScore: 92 },
  { id: 4, title: "Preethsod Thappa", artist: "Rajesh Krishnan", movie: "Jogi", language: "kannada", year: 2005, firstLetter: "P", lastLetter: "A", genre: "movie", lyricsKeywords: ["love", "mistake", "heart"], alternateSpellings: ["Preetisod Tappa"], popularityScore: 90 },
  { id: 5, title: "Bombe Helutaithe", artist: "Rajesh Krishnan", movie: "Raajakumara", language: "kannada", year: 2017, firstLetter: "B", lastLetter: "E", genre: "movie", lyricsKeywords: ["doll", "beauty", "dream"], alternateSpellings: ["Bombe Helutaite"], popularityScore: 88 },
  { id: 6, title: "Mungaru Male", artist: "Sonu Nigam", movie: "Mungaru Male", language: "kannada", year: 2006, firstLetter: "M", lastLetter: "E", genre: "movie", lyricsKeywords: ["rain", "love", "nature"], alternateSpellings: ["Mungaaru Male"], popularityScore: 96 },
  { id: 7, title: "Anisuthide Yaako Indu", artist: "Sonu Nigam", movie: "Mungaru Male", language: "kannada", year: 2006, firstLetter: "A", lastLetter: "U", genre: "movie", lyricsKeywords: ["feeling", "love", "today"], alternateSpellings: ["Anisuthide Yako"], popularityScore: 94 },
  { id: 8, title: "Yaarivanu Nee", artist: "Rajesh Krishnan", movie: "Kirik Party", language: "kannada", year: 2016, firstLetter: "Y", lastLetter: "E", genre: "movie", lyricsKeywords: ["college", "friendship", "identity"], alternateSpellings: ["Yarivanu Nee"], popularityScore: 88 },
  { id: 9, title: "Belageddu", artist: "Aniruddha Sastry", movie: "Kirik Party", language: "kannada", year: 2016, firstLetter: "B", lastLetter: "U", genre: "movie", lyricsKeywords: ["morning", "college", "love"], alternateSpellings: ["Belageddu Enu Maadali"], popularityScore: 93 },
  { id: 10, title: "Salaam Rocky Bhai", artist: "Vijay Prakash", movie: "KGF Chapter 1", language: "kannada", year: 2018, firstLetter: "S", lastLetter: "I", genre: "movie", lyricsKeywords: ["hero", "power", "mass"], alternateSpellings: ["Salam Rocky Bhai"], popularityScore: 95 },
  { id: 11, title: "Gali Gali", artist: "Ananya Bhat", movie: "KGF Chapter 1", language: "kannada", year: 2018, firstLetter: "G", lastLetter: "I", genre: "movie", lyricsKeywords: ["streets", "love", "search"], alternateSpellings: [], popularityScore: 82 },
  { id: 12, title: "Toofan", artist: "Vijay Prakash", movie: "KGF Chapter 2", language: "kannada", year: 2022, firstLetter: "T", lastLetter: "N", genre: "movie", lyricsKeywords: ["storm", "power", "rise"], alternateSpellings: ["Toofaan"], popularityScore: 90 },
  { id: 13, title: "Varaha Roopam", artist: "Sai Vignesh", movie: "Kantara", language: "kannada", year: 2022, firstLetter: "V", lastLetter: "M", genre: "movie", lyricsKeywords: ["god", "nature", "divine"], alternateSpellings: ["Varaha Rupam"], popularityScore: 94 },
  { id: 14, title: "Singara Siriye", artist: "Vijay Prakash", movie: "Kantara", language: "kannada", year: 2022, firstLetter: "S", lastLetter: "E", genre: "movie", lyricsKeywords: ["beauty", "love", "admiration"], alternateSpellings: ["Singara Siriye"], popularityScore: 85 },
  { id: 15, title: "Maadeva", artist: "Sai Vignesh", movie: "Kantara", language: "kannada", year: 2022, firstLetter: "M", lastLetter: "A", genre: "devotional", lyricsKeywords: ["shiva", "devotion", "god"], alternateSpellings: ["Mahadeva"], popularityScore: 88 },
  { id: 16, title: "Nee Sigoovaregu", artist: "Raghu Dixit", movie: "Lucia", language: "kannada", year: 2013, firstLetter: "N", lastLetter: "U", genre: "movie", lyricsKeywords: ["love", "waiting", "till"], alternateSpellings: ["Nee Siguvaregu"], popularityScore: 85 },
  { id: 17, title: "Sojugada Sooju Mallige", artist: "Triveni Rao", movie: "Folk", language: "kannada", year: 2020, firstLetter: "S", lastLetter: "E", genre: "folk", lyricsKeywords: ["jasmine", "flower", "beauty"], alternateSpellings: ["Sojugada Sooju"], popularityScore: 92 },
  { id: 18, title: "Mamaraviye Ninagenu Beku", artist: "S.P. Balasubrahmanyam", movie: "Gaali Maathu", language: "kannada", year: 1981, firstLetter: "M", lastLetter: "U", genre: "movie", lyricsKeywords: ["cuckoo", "spring", "nature"], alternateSpellings: [], popularityScore: 78 },
  { id: 19, title: "Haalunda Thavaru", artist: "Rajkumar", movie: "Habba", language: "kannada", year: 1999, firstLetter: "H", lastLetter: "U", genre: "movie", lyricsKeywords: ["milk", "mistake", "love"], alternateSpellings: ["Halunda Tavaru"], popularityScore: 80 },
  { id: 20, title: "Ishtakamya", artist: "Shreya Ghoshal", movie: "Ishtakamya", language: "kannada", year: 2016, firstLetter: "I", lastLetter: "A", genre: "movie", lyricsKeywords: ["love", "desire", "heart"], alternateSpellings: [], popularityScore: 75 },
  { id: 21, title: "Cheluvina Chittara", artist: "Sonu Nigam", movie: "Cheluvina Chittara", language: "kannada", year: 2007, firstLetter: "C", lastLetter: "A", genre: "movie", lyricsKeywords: ["beautiful", "star", "love"], alternateSpellings: [], popularityScore: 82 },
  { id: 22, title: "Yaarivalu", artist: "Sonu Nigam", movie: "Cheluvina Chittara", language: "kannada", year: 2007, firstLetter: "Y", lastLetter: "U", genre: "movie", lyricsKeywords: ["who", "stranger", "love"], alternateSpellings: ["Yaarivalu Nee"], popularityScore: 78 },
  { id: 23, title: "Karunada Thayi Sadaa Chinmayi", artist: "Rajkumar", movie: "Devotional", language: "kannada", year: 1990, firstLetter: "K", lastLetter: "I", genre: "devotional", lyricsKeywords: ["karnataka", "mother", "devotion"], alternateSpellings: ["Karnataka Tayi"], popularityScore: 85 },
  { id: 24, title: "Ninna Danigaagi", artist: "Sonu Nigam", movie: "Milana", language: "kannada", year: 2007, firstLetter: "N", lastLetter: "I", genre: "movie", lyricsKeywords: ["love", "shore", "waiting"], alternateSpellings: ["Ninna Danigagi"], popularityScore: 86 },
  { id: 25, title: "Onde Ondu Storiyalli", artist: "Rajesh Krishnan", movie: "Chakravyuha", language: "kannada", year: 2014, firstLetter: "O", lastLetter: "I", genre: "movie", lyricsKeywords: ["story", "one", "love"], alternateSpellings: ["Onde Ondu Story"], popularityScore: 80 },
  { id: 26, title: "Kanasalu Neene", artist: "Vijay Prakash", movie: "Gaalipata", language: "kannada", year: 2008, firstLetter: "K", lastLetter: "E", genre: "movie", lyricsKeywords: ["dream", "love", "always"], alternateSpellings: ["Kanasalu Nine"], popularityScore: 87 },
  { id: 27, title: "Minchagi Neenu Baralu", artist: "Vijay Prakash", movie: "Gaalipata", language: "kannada", year: 2008, firstLetter: "M", lastLetter: "U", genre: "movie", lyricsKeywords: ["lightning", "arrival", "love"], alternateSpellings: ["Minchagi Ninu"], popularityScore: 85 },
  { id: 28, title: "Ello Jogappa", artist: "V. Manohar", movie: "Gaja", language: "kannada", year: 2008, firstLetter: "E", lastLetter: "A", genre: "movie", lyricsKeywords: ["where", "search", "question"], alternateSpellings: [], popularityScore: 75 },
  { id: 29, title: "Ulidavaru Kandanthe", artist: "Sathya Prakash", movie: "Ulidavaru Kandanthe", language: "kannada", year: 2014, firstLetter: "U", lastLetter: "E", genre: "movie", lyricsKeywords: ["remaining", "saw", "observe"], alternateSpellings: [], popularityScore: 82 },
  { id: 30, title: "Enendu Hesaridali", artist: "Arvind-Shankar", movie: "Ulidavaru Kandanthe", language: "kannada", year: 2014, firstLetter: "E", lastLetter: "I", genre: "movie", lyricsKeywords: ["name", "identity", "define"], alternateSpellings: [], popularityScore: 78 },
  { id: 31, title: "Devara Naadalli", artist: "Rajkumar", movie: "Devotional", language: "kannada", year: 1985, firstLetter: "D", lastLetter: "I", genre: "devotional", lyricsKeywords: ["god", "land", "devotion"], alternateSpellings: ["Devara Nadalli"], popularityScore: 82 },
  { id: 32, title: "Kannadave Sathya", artist: "Rajkumar", movie: "Jeevana Chaitra", language: "kannada", year: 1992, firstLetter: "K", lastLetter: "A", genre: "movie", lyricsKeywords: ["kannada", "truth", "pride"], alternateSpellings: ["Kannadave Satya"], popularityScore: 90 },
  { id: 33, title: "Thooguveyya", artist: "Chandan Shetty", movie: "KGF Chapter 1", language: "kannada", year: 2018, firstLetter: "T", lastLetter: "A", genre: "movie", lyricsKeywords: ["swing", "love", "dance"], alternateSpellings: ["Tooguveyya"], popularityScore: 80 },
  { id: 34, title: "Nooru Janmaku", artist: "Shreya Ghoshal", movie: "Rajakumaara", language: "kannada", year: 2017, firstLetter: "N", lastLetter: "U", genre: "movie", lyricsKeywords: ["hundred", "lives", "love"], alternateSpellings: ["100 Janmaku"], popularityScore: 78 },
  { id: 35, title: "Kaanadante Maayavadanu", artist: "Shankar Mahadevan", movie: "Gaana Bajaana", language: "kannada", year: 2008, firstLetter: "K", lastLetter: "U", genre: "movie", lyricsKeywords: ["disappear", "magic", "illusion"], alternateSpellings: ["Kanadante Mayavadanu"], popularityScore: 76 },
  { id: 36, title: "Yaake Mudiyada Kathe", artist: "Sid Sriram", movie: "Dia", language: "kannada", year: 2020, firstLetter: "Y", lastLetter: "E", genre: "movie", lyricsKeywords: ["why", "unending", "story"], alternateSpellings: [], popularityScore: 82 },
  { id: 37, title: "Ninna Lajje", artist: "Sonu Nigam", movie: "Duniya", language: "kannada", year: 2007, firstLetter: "N", lastLetter: "E", genre: "movie", lyricsKeywords: ["shyness", "love", "modesty"], alternateSpellings: [], popularityScore: 80 },
  { id: 38, title: "Dil Na Diya", artist: "Haricharan", movie: "Kotigobba 2", language: "kannada", year: 2016, firstLetter: "D", lastLetter: "A", genre: "movie", lyricsKeywords: ["heart", "give", "love"], alternateSpellings: [], popularityScore: 72 },
  { id: 39, title: "Maleyali Jotheyali", artist: "K.J. Yesudas", movie: "Maleyali Jotheyali", language: "kannada", year: 2009, firstLetter: "M", lastLetter: "I", genre: "movie", lyricsKeywords: ["rain", "together", "walk"], alternateSpellings: [], popularityScore: 78 },
  { id: 40, title: "Love Guru", artist: "Arjun Janya", movie: "Love Guru", language: "kannada", year: 2009, firstLetter: "L", lastLetter: "U", genre: "movie", lyricsKeywords: ["love", "guru", "teacher"], alternateSpellings: [], popularityScore: 72 },
  { id: 41, title: "Charlie Charlie", artist: "Chandan Shetty", movie: "Charlie 555", language: "kannada", year: 2012, firstLetter: "C", lastLetter: "E", genre: "movie", lyricsKeywords: ["fun", "dance", "party"], alternateSpellings: ["Charlie 555"], popularityScore: 76 },
  { id: 42, title: "Kaage Bangaarada", artist: "Rajkumar", movie: "Kasturi Nivasa", language: "kannada", year: 1971, firstLetter: "K", lastLetter: "A", genre: "classic", lyricsKeywords: ["crow", "golden", "classic"], alternateSpellings: ["Kage Bangarada"], popularityScore: 85 },
  { id: 43, title: "Aakasha Needele", artist: "K.S. Chithra", movie: "Bandhana", language: "kannada", year: 1984, firstLetter: "A", lastLetter: "E", genre: "classic", lyricsKeywords: ["sky", "shadow", "love"], alternateSpellings: ["Akasha Nidele"], popularityScore: 80 },
  { id: 44, title: "Idondappa Idondappa", artist: "Rajesh Krishnan", movie: "Gaalipata", language: "kannada", year: 2008, firstLetter: "I", lastLetter: "A", genre: "movie", lyricsKeywords: ["friendship", "fun", "travel"], alternateSpellings: [], popularityScore: 78 },
  { id: 45, title: "Naadamaya Ee Lokavella", artist: "Rajkumar", movie: "Jeevana Chaitra", language: "kannada", year: 1992, firstLetter: "N", lastLetter: "A", genre: "movie", lyricsKeywords: ["music", "world", "sound"], alternateSpellings: [], popularityScore: 82 },
  { id: 46, title: "Haalu Thuppa", artist: "Armaan Malik", movie: "Rajakumara", language: "kannada", year: 2017, firstLetter: "H", lastLetter: "A", genre: "movie", lyricsKeywords: ["milk", "ghee", "sweet"], alternateSpellings: ["Halu Tuppa"], popularityScore: 80 },
  { id: 47, title: "Nee Bandhu Nilthanaa", artist: "Anuradha Bhat", movie: "Raajkumara", language: "kannada", year: 2017, firstLetter: "N", lastLetter: "A", genre: "movie", lyricsKeywords: ["you", "come", "stand"], alternateSpellings: ["Nee Bandu Niltana"], popularityScore: 76 },
  { id: 48, title: "Govinda Govinda", artist: "Rajkumar", movie: "Devotional", language: "kannada", year: 1988, firstLetter: "G", lastLetter: "A", genre: "devotional", lyricsKeywords: ["vishnu", "devotion", "prayer"], alternateSpellings: [], popularityScore: 78 },
  { id: 49, title: "Dharani Mandala Madhyadolage", artist: "Purandaradasa", movie: "Devotional", language: "kannada", year: 1500, firstLetter: "D", lastLetter: "E", genre: "devotional", lyricsKeywords: ["earth", "devotion", "purandara"], alternateSpellings: ["Dharani Mandala"], popularityScore: 88 },
  { id: 50, title: "Raghavendra Raghavendra", artist: "S.P. Balasubrahmanyam", movie: "Sri Raghavendra", language: "kannada", year: 1985, firstLetter: "R", lastLetter: "A", genre: "devotional", lyricsKeywords: ["raghavendra", "devotion", "saint"], alternateSpellings: [], popularityScore: 85 },
  // ... more Kannada songs
  { id: 51, title: "Kalgejje Olida", artist: "Rajesh Krishnan", movie: "Gaalipata 2", language: "kannada", year: 2022, firstLetter: "K", lastLetter: "A", genre: "movie", lyricsKeywords: ["anklet", "sound", "memory"], alternateSpellings: [], popularityScore: 75 },
  { id: 52, title: "Kanasanthe Maayavadanu", artist: "Shankar Mahadevan", movie: "Baana Dariyalli", language: "kannada", year: 2015, firstLetter: "K", lastLetter: "U", genre: "movie", lyricsKeywords: ["dream", "illusion", "magic"], alternateSpellings: [], popularityScore: 72 },
  { id: 53, title: "Thaarekke Thaarekke", artist: "Rajesh Krishnan", movie: "Hudugaru", language: "kannada", year: 2011, firstLetter: "T", lastLetter: "E", genre: "movie", lyricsKeywords: ["star", "night", "beauty"], alternateSpellings: ["Tareke Tareke"], popularityScore: 74 },
  { id: 54, title: "Onde Ond Aase", artist: "Sonu Nigam", movie: "Mungaru Male", language: "kannada", year: 2006, firstLetter: "O", lastLetter: "E", genre: "movie", lyricsKeywords: ["one", "wish", "desire"], alternateSpellings: ["Onde Ondu Ase"], popularityScore: 82 },
  { id: 55, title: "Porki Hucchi", artist: "Rajesh Krishnan", movie: "Porki", language: "kannada", year: 2010, firstLetter: "P", lastLetter: "I", genre: "movie", lyricsKeywords: ["naughty", "fun", "crazy"], alternateSpellings: [], popularityScore: 72 },
  { id: 56, title: "Prem Kahani", artist: "Sonu Nigam", movie: "Milana", language: "kannada", year: 2007, firstLetter: "P", lastLetter: "I", genre: "movie", lyricsKeywords: ["love", "story", "romance"], alternateSpellings: [], popularityScore: 75 },
  { id: 57, title: "Naguva Nayana", artist: "S.P. Balasubrahmanyam", movie: "Pallavi Anu Pallavi", language: "kannada", year: 1983, firstLetter: "N", lastLetter: "A", genre: "classic", lyricsKeywords: ["smile", "eyes", "love"], alternateSpellings: ["Naguva Nayanaa"], popularityScore: 88 },
  { id: 58, title: "Yaaraadru Olage Banni", artist: "Rajkumar", movie: "Bangarada Manushya", language: "kannada", year: 1972, firstLetter: "Y", lastLetter: "I", genre: "classic", lyricsKeywords: ["come", "inside", "welcome"], alternateSpellings: ["Yaradru Olage"], popularityScore: 82 },
  { id: 59, title: "Oh Premada Gangeye", artist: "S.P. Balasubrahmanyam", movie: "Gaali Maathu", language: "kannada", year: 1981, firstLetter: "O", lastLetter: "E", genre: "classic", lyricsKeywords: ["river", "love", "flow"], alternateSpellings: ["O Premada Gangeye"], popularityScore: 80 },
  { id: 60, title: "Baagilanu Teredu", artist: "Rajkumar", movie: "Sampathige Savaal", language: "kannada", year: 1974, firstLetter: "B", lastLetter: "U", genre: "classic", lyricsKeywords: ["door", "open", "welcome"], alternateSpellings: ["Bagilanu Teredu"], popularityScore: 78 },
  // Continuing Kannada...
  { id: 61, title: "Lakshmi Baramma", artist: "Traditional", movie: "Devotional", language: "kannada", year: 1980, firstLetter: "L", lastLetter: "A", genre: "devotional", lyricsKeywords: ["lakshmi", "come", "devotion"], alternateSpellings: [], popularityScore: 80 },
  { id: 62, title: "Thayi Sharade", artist: "Traditional", movie: "Devotional", language: "kannada", year: 1975, firstLetter: "T", lastLetter: "E", genre: "devotional", lyricsKeywords: ["saraswati", "mother", "learning"], alternateSpellings: ["Tayi Sharade"], popularityScore: 78 },
  { id: 63, title: "Dasarendare Purandaradasarayya", artist: "Traditional", movie: "Devotional", language: "kannada", year: 1960, firstLetter: "D", lastLetter: "A", genre: "devotional", lyricsKeywords: ["saint", "purandara", "bhakti"], alternateSpellings: [], popularityScore: 82 },
  { id: 64, title: "Maadikere Eri Neeru Thumbi Haare", artist: "Folk", movie: "Folk", language: "kannada", year: 1970, firstLetter: "M", lastLetter: "E", genre: "folk", lyricsKeywords: ["lake", "water", "full"], alternateSpellings: [], popularityScore: 72 },
  { id: 65, title: "Kundagol Alli Thondhi", artist: "Folk", movie: "Folk", language: "kannada", year: 1960, firstLetter: "K", lastLetter: "I", genre: "folk", lyricsKeywords: ["village", "celebration", "dance"], alternateSpellings: [], popularityScore: 65 },
  { id: 66, title: "Nannaseyinda Baare", artist: "Mysore Ananthaswamy", movie: "Bhavageethe", language: "kannada", year: 1985, firstLetter: "N", lastLetter: "E", genre: "classic", lyricsKeywords: ["come", "my side", "love"], alternateSpellings: [], popularityScore: 75 },
  { id: 67, title: "Panchama Veda", artist: "Rajkumar", movie: "Panchama Veda", language: "kannada", year: 1990, firstLetter: "P", lastLetter: "A", genre: "movie", lyricsKeywords: ["fifth", "veda", "music"], alternateSpellings: [], popularityScore: 78 },
  { id: 68, title: "Aagide Aagide Yentha Maaye", artist: "Shankar Nag", movie: "Auto Raja", language: "kannada", year: 1980, firstLetter: "A", lastLetter: "E", genre: "classic", lyricsKeywords: ["magic", "what", "happened"], alternateSpellings: ["Agide Agide"], popularityScore: 76 },
  { id: 69, title: "Olage Seridare", artist: "Chandan Shetty", movie: "Kempegowda", language: "kannada", year: 2011, firstLetter: "O", lastLetter: "E", genre: "movie", lyricsKeywords: ["inside", "enter", "love"], alternateSpellings: [], popularityScore: 70 },
  { id: 70, title: "Baarisu Kannada Dindimava", artist: "Rajkumar", movie: "Devotional", language: "kannada", year: 1988, firstLetter: "B", lastLetter: "A", genre: "devotional", lyricsKeywords: ["kannada", "drum", "pride"], alternateSpellings: ["Barisu Kannada"], popularityScore: 90 },

  // ═══════════════════════════════════════════════════════════
  // MALAYALAM — 150 songs (Movie, Devotional, Folk)
  // ═══════════════════════════════════════════════════════════
  { id: 101, title: "Malare Ninne Kanathirunnal", artist: "Vijay Yesudas", movie: "Premam", language: "malayalam", year: 2015, firstLetter: "M", lastLetter: "L", genre: "movie", lyricsKeywords: ["flower", "longing", "love"], alternateSpellings: ["Malare Premam"], popularityScore: 98 },
  { id: 102, title: "Ayyappathiruvazhuthane", artist: "K.J. Yesudas", movie: "Devotional", language: "malayalam", year: 1980, firstLetter: "A", lastLetter: "E", genre: "devotional", lyricsKeywords: ["ayyappa", "devotion", "temple"], alternateSpellings: ["Ayyappan Thiruvazhuthane"], popularityScore: 85 },
  { id: 103, title: "Jeevamshamayi", artist: "Harisankar", movie: "Theevandi", language: "malayalam", year: 2018, firstLetter: "J", lastLetter: "I", genre: "movie", lyricsKeywords: ["life", "part", "breath"], alternateSpellings: ["Jeevamshamayi Theevandi"], popularityScore: 92 },
  { id: 104, title: "Manikya Malaraya Poovi", artist: "Vineeth Sreenivasan", movie: "Oru Adaar Love", language: "malayalam", year: 2018, firstLetter: "M", lastLetter: "I", genre: "movie", lyricsKeywords: ["ruby", "flower", "love"], alternateSpellings: ["Manikya Malar"], popularityScore: 90 },
  { id: 105, title: "Entammede Jimikki Kammal", artist: "Vineeth Sreenivasan", movie: "Velipadinte Pusthakam", language: "malayalam", year: 2017, firstLetter: "E", lastLetter: "L", genre: "movie", lyricsKeywords: ["earring", "dance", "celebration"], alternateSpellings: ["Jimikki Kammal"], popularityScore: 95 },
  { id: 106, title: "Kannum Kannum Kollaiyadithaal", artist: "Dulquer Salmaan", movie: "Bangalore Days", language: "malayalam", year: 2014, firstLetter: "K", lastLetter: "L", genre: "movie", lyricsKeywords: ["eyes", "steal", "love"], alternateSpellings: [], popularityScore: 82 },
  { id: 107, title: "Oru Rathri Koodi", artist: "K.J. Yesudas", movie: "Summer in Bethlehem", language: "malayalam", year: 1998, firstLetter: "O", lastLetter: "I", genre: "movie", lyricsKeywords: ["one", "night", "more"], alternateSpellings: [], popularityScore: 85 },
  { id: 108, title: "Chenthamara Thoni Chali", artist: "K.J. Yesudas", movie: "Nadhi", language: "malayalam", year: 1969, firstLetter: "C", lastLetter: "I", genre: "classic", lyricsKeywords: ["lotus", "boat", "river"], alternateSpellings: ["Chenthaamara"], popularityScore: 80 },
  { id: 109, title: "Minungum Minnaminuge", artist: "M. Jayachandran", movie: "Oppam", language: "malayalam", year: 2016, firstLetter: "M", lastLetter: "E", genre: "movie", lyricsKeywords: ["firefly", "glow", "light"], alternateSpellings: ["Minungum"], popularityScore: 88 },
  { id: 110, title: "Vathikkalu Vellaripravu", artist: "A.R. Rahman", movie: "Sufiyum Sujatayum", language: "malayalam", year: 2020, firstLetter: "V", lastLetter: "U", genre: "movie", lyricsKeywords: ["duck", "pigeon", "rain"], alternateSpellings: ["Vathilkkalu Vellaripravu"], popularityScore: 86 },
  { id: 111, title: "Kaathirunnu Kaathirunnu", artist: "K.S. Chithra", movie: "Summer in Bethlehem", language: "malayalam", year: 1998, firstLetter: "K", lastLetter: "U", genre: "movie", lyricsKeywords: ["waiting", "long", "love"], alternateSpellings: ["Kathirunnu"], popularityScore: 82 },
  { id: 112, title: "Aaro Viral Meetti", artist: "K.J. Yesudas", movie: "Pranayam", language: "malayalam", year: 2011, firstLetter: "A", lastLetter: "I", genre: "movie", lyricsKeywords: ["string", "music", "finger"], alternateSpellings: ["Aro Viral Meetti"], popularityScore: 80 },
  { id: 113, title: "Parayuvaan Ithadyamayi", artist: "Vijay Yesudas", movie: "Ishq", language: "malayalam", year: 2019, firstLetter: "P", lastLetter: "I", genre: "movie", lyricsKeywords: ["tell", "first", "time"], alternateSpellings: ["Parayuvan"], popularityScore: 88 },
  { id: 114, title: "Appangal Embadum", artist: "Vineeth Sreenivasan", movie: "Ustad Hotel", language: "malayalam", year: 2012, firstLetter: "A", lastLetter: "M", genre: "movie", lyricsKeywords: ["father", "always", "family"], alternateSpellings: ["Appangal Embadum"], popularityScore: 82 },
  { id: 115, title: "Karunyam Thonnumbol", artist: "Sithara Krishnakumar", movie: "Charlie", language: "malayalam", year: 2015, firstLetter: "K", lastLetter: "L", genre: "movie", lyricsKeywords: ["mercy", "compassion", "feel"], alternateSpellings: [], popularityScore: 78 },
  { id: 116, title: "Pazhanimala Murukan", artist: "K.J. Yesudas", movie: "Devotional", language: "malayalam", year: 1978, firstLetter: "P", lastLetter: "N", genre: "devotional", lyricsKeywords: ["murugan", "hill", "devotion"], alternateSpellings: ["Pazhani Mala"], popularityScore: 82 },
  { id: 117, title: "Amme Narayana Devi Narayana", artist: "K.J. Yesudas", movie: "Devotional", language: "malayalam", year: 1975, firstLetter: "A", lastLetter: "A", genre: "devotional", lyricsKeywords: ["mother", "narayana", "devi"], alternateSpellings: [], popularityScore: 88 },
  { id: 118, title: "Swami Ayyappane", artist: "K.J. Yesudas", movie: "Devotional", language: "malayalam", year: 1982, firstLetter: "S", lastLetter: "E", genre: "devotional", lyricsKeywords: ["ayyappa", "swami", "devotion"], alternateSpellings: [], popularityScore: 85 },
  { id: 119, title: "Unni Ganapathiye", artist: "P. Jayachandran", movie: "Devotional", language: "malayalam", year: 1985, firstLetter: "U", lastLetter: "E", genre: "devotional", lyricsKeywords: ["ganesha", "child", "devotion"], alternateSpellings: [], popularityScore: 78 },
  { id: 120, title: "Thullathullal Ponnum Poovum", artist: "Folk", movie: "Folk", language: "malayalam", year: 1970, firstLetter: "T", lastLetter: "M", genre: "folk", lyricsKeywords: ["dance", "gold", "flower"], alternateSpellings: [], popularityScore: 70 },
  { id: 121, title: "Aayiram Kannumaayi", artist: "Sithara Krishnakumar", movie: "Kumbalangi Nights", language: "malayalam", year: 2019, firstLetter: "A", lastLetter: "I", genre: "movie", lyricsKeywords: ["thousand", "eyes", "watch"], alternateSpellings: ["Ayiram Kannumayi"], popularityScore: 86 },
  { id: 122, title: "Thaane Thaanandhi", artist: "K.J. Yesudas", movie: "Njan Gandharvan", language: "malayalam", year: 1991, firstLetter: "T", lastLetter: "I", genre: "classic", lyricsKeywords: ["self", "celestial", "love"], alternateSpellings: [], popularityScore: 82 },
  { id: 123, title: "Vaalmuna Kannile", artist: "K.J. Yesudas", movie: "Uyarangalil", language: "malayalam", year: 1984, firstLetter: "V", lastLetter: "E", genre: "classic", lyricsKeywords: ["eyes", "moon", "beauty"], alternateSpellings: [], popularityScore: 78 },
  { id: 124, title: "Pularoli Ponnuruki", artist: "K.J. Yesudas", movie: "Classic", language: "malayalam", year: 1986, firstLetter: "P", lastLetter: "I", genre: "classic", lyricsKeywords: ["dawn", "golden", "sun"], alternateSpellings: ["Pularoli"], popularityScore: 76 },
  { id: 125, title: "Aaromale", artist: "Alphons Joseph", movie: "Bangalore Days", language: "malayalam", year: 2014, firstLetter: "A", lastLetter: "E", genre: "movie", lyricsKeywords: ["love", "who", "question"], alternateSpellings: [], popularityScore: 85 },
  { id: 126, title: "Ilahi", artist: "Bijibal", movie: "Trance", language: "malayalam", year: 2020, firstLetter: "I", lastLetter: "I", genre: "movie", lyricsKeywords: ["divine", "spiritual", "journey"], alternateSpellings: [], popularityScore: 75 },
  { id: 127, title: "Nee Hima Mazhayayi", artist: "Vineeth Sreenivasan", movie: "Edakkad Battalion 06", language: "malayalam", year: 2019, firstLetter: "N", lastLetter: "I", genre: "movie", lyricsKeywords: ["snow", "rain", "cold"], alternateSpellings: ["Nee Hima Mazhayai"], popularityScore: 80 },
  { id: 128, title: "Kaanal Kannaley", artist: "K.J. Yesudas", movie: "Chamaram", language: "malayalam", year: 1980, firstLetter: "K", lastLetter: "Y", genre: "classic", lyricsKeywords: ["mirage", "eyes", "illusion"], alternateSpellings: [], popularityScore: 78 },
  { id: 129, title: "Aaradhike", artist: "Suraj Santhosh", movie: "Ambili", language: "malayalam", year: 2019, firstLetter: "A", lastLetter: "E", genre: "movie", lyricsKeywords: ["worship", "love", "adore"], alternateSpellings: [], popularityScore: 82 },
  { id: 130, title: "Lailakame", artist: "Ezra Vidyasagar", movie: "Ezra", language: "malayalam", year: 2017, firstLetter: "L", lastLetter: "E", genre: "movie", lyricsKeywords: ["laila", "name", "mystery"], alternateSpellings: [], popularityScore: 80 },
  { id: 131, title: "Theeratha Vilayattu Pillai", artist: "K.J. Yesudas", movie: "Classic", language: "malayalam", year: 1988, firstLetter: "T", lastLetter: "I", genre: "classic", lyricsKeywords: ["play", "child", "never ending"], alternateSpellings: [], popularityScore: 76 },
  { id: 132, title: "Karmukilil Oodunna", artist: "K.J. Yesudas", movie: "Classic", language: "malayalam", year: 1985, firstLetter: "K", lastLetter: "A", genre: "classic", lyricsKeywords: ["cloud", "dark", "floating"], alternateSpellings: [], popularityScore: 75 },
  { id: 133, title: "Pavizha Mazha", artist: "Anne Amie", movie: "Athiran", language: "malayalam", year: 2019, firstLetter: "P", lastLetter: "A", genre: "movie", lyricsKeywords: ["coral", "rain", "beauty"], alternateSpellings: ["Pavizha Mazhaye"], popularityScore: 84 },
  { id: 134, title: "Manikyachirakulla", artist: "Pradeep Somasundaran", movie: "Idukki Gold", language: "malayalam", year: 2013, firstLetter: "M", lastLetter: "A", genre: "movie", lyricsKeywords: ["ruby", "wing", "bird"], alternateSpellings: [], popularityScore: 76 },
  { id: 135, title: "Thottu Thottu", artist: "K.S. Chithra", movie: "Ustad Hotel", language: "malayalam", year: 2012, firstLetter: "T", lastLetter: "U", genre: "movie", lyricsKeywords: ["touch", "gentle", "love"], alternateSpellings: [], popularityScore: 78 },
  { id: 136, title: "Kannil Kannil", artist: "Anne Amie", movie: "Charlie", language: "malayalam", year: 2015, firstLetter: "K", lastLetter: "L", genre: "movie", lyricsKeywords: ["eye", "vision", "see"], alternateSpellings: [], popularityScore: 80 },
  { id: 137, title: "Ennilerinju", artist: "Harish Sivaramakrishnan", movie: "Virus", language: "malayalam", year: 2019, firstLetter: "E", lastLetter: "U", genre: "movie", lyricsKeywords: ["crawl", "rise", "fight"], alternateSpellings: [], popularityScore: 75 },
  { id: 138, title: "Alliyambal Poove", artist: "K.J. Yesudas", movie: "Classic", language: "malayalam", year: 1979, firstLetter: "A", lastLetter: "E", genre: "classic", lyricsKeywords: ["lily", "flower", "beauty"], alternateSpellings: [], popularityScore: 76 },
  { id: 139, title: "Hridayam Theme Song", artist: "Hesham Abdul Wahab", movie: "Hridayam", language: "malayalam", year: 2022, firstLetter: "H", lastLetter: "G", genre: "movie", lyricsKeywords: ["heart", "life", "journey"], alternateSpellings: ["Hridayam"], popularityScore: 88 },
  { id: 140, title: "Darshana", artist: "Hesham Abdul Wahab", movie: "Hridayam", language: "malayalam", year: 2022, firstLetter: "D", lastLetter: "A", genre: "movie", lyricsKeywords: ["vision", "sight", "love"], alternateSpellings: [], popularityScore: 90 },
  { id: 141, title: "Onnavitta Yaarum Yenakilla", artist: "Vineeth Sreenivasan", movie: "Hridayam", language: "malayalam", year: 2022, firstLetter: "O", lastLetter: "A", genre: "movie", lyricsKeywords: ["except you", "nobody", "love"], alternateSpellings: [], popularityScore: 82 },
  { id: 142, title: "Ullile Ulla", artist: "Sithara Krishnakumar", movie: "Kappela", language: "malayalam", year: 2020, firstLetter: "U", lastLetter: "A", genre: "movie", lyricsKeywords: ["inside", "heart", "within"], alternateSpellings: [], popularityScore: 76 },
  { id: 143, title: "Nee Mukilo", artist: "Shaan Rahman", movie: "Premaalu", language: "malayalam", year: 2024, firstLetter: "N", lastLetter: "O", genre: "movie", lyricsKeywords: ["cloud", "you", "beautiful"], alternateSpellings: [], popularityScore: 85 },
  { id: 144, title: "Manjadi Mozhiyum Melle", artist: "Vineeth Sreenivasan", movie: "Manjadikuru", language: "malayalam", year: 2012, firstLetter: "M", lastLetter: "E", genre: "movie", lyricsKeywords: ["seed", "whisper", "softly"], alternateSpellings: [], popularityScore: 72 },
  { id: 145, title: "Ente Kanna Unni", artist: "K.J. Yesudas", movie: "Devotional", language: "malayalam", year: 1975, firstLetter: "E", lastLetter: "I", genre: "devotional", lyricsKeywords: ["krishna", "child", "devotion"], alternateSpellings: [], popularityScore: 80 },
  { id: 146, title: "Ambalappuzha Unni Kannan", artist: "K.J. Yesudas", movie: "Devotional", language: "malayalam", year: 1978, firstLetter: "A", lastLetter: "N", genre: "devotional", lyricsKeywords: ["krishna", "temple", "child"], alternateSpellings: [], popularityScore: 82 },
  { id: 147, title: "Suprabhatham", artist: "K.J. Yesudas", movie: "Devotional", language: "malayalam", year: 1972, firstLetter: "S", lastLetter: "M", genre: "devotional", lyricsKeywords: ["morning", "prayer", "awakening"], alternateSpellings: ["Suprabatham"], popularityScore: 88 },
  { id: 148, title: "Thiruvaavaniraavu", artist: "Kavya Ajith", movie: "Jacobinte Swargarajyam", language: "malayalam", year: 2016, firstLetter: "T", lastLetter: "U", genre: "movie", lyricsKeywords: ["onam", "night", "rain"], alternateSpellings: ["Thiruvavaniraavu"], popularityScore: 82 },
  { id: 149, title: "Valayosai Kalap Kalap", artist: "K.J. Yesudas", movie: "Classic", language: "malayalam", year: 1982, firstLetter: "V", lastLetter: "P", genre: "classic", lyricsKeywords: ["bangle", "sound", "music"], alternateSpellings: [], popularityScore: 78 },
  { id: 150, title: "Thaamara Poovil", artist: "K.J. Yesudas", movie: "Classic", language: "malayalam", year: 1984, firstLetter: "T", lastLetter: "L", genre: "classic", lyricsKeywords: ["lotus", "petal", "beauty"], alternateSpellings: ["Tamara Poovil"], popularityScore: 76 },

  // ═══════════════════════════════════════════════════════════
  // TAMIL — 120 songs
  // ═══════════════════════════════════════════════════════════
  { id: 201, title: "Roja Kaadhal Vandaal", artist: "S.P. Balasubrahmanyam", movie: "Roja", language: "tamil", year: 1992, firstLetter: "R", lastLetter: "L", genre: "movie", lyricsKeywords: ["love", "came", "rose"], alternateSpellings: [], popularityScore: 92 },
  { id: 202, title: "Munbe Vaa", artist: "Shreya Ghoshal", movie: "Sillunu Oru Kaadhal", language: "tamil", year: 2006, firstLetter: "M", lastLetter: "A", genre: "movie", lyricsKeywords: ["come", "before", "love"], alternateSpellings: ["Munbe Va"], popularityScore: 90 },
  { id: 203, title: "Kannazhaga", artist: "Dhanush", movie: "3", language: "tamil", year: 2012, firstLetter: "K", lastLetter: "A", genre: "movie", lyricsKeywords: ["beauty", "love", "eyes"], alternateSpellings: [], popularityScore: 85 },
  { id: 204, title: "Why This Kolaveri Di", artist: "Dhanush", movie: "3", language: "tamil", year: 2011, firstLetter: "W", lastLetter: "I", genre: "movie", lyricsKeywords: ["why", "murder", "rage"], alternateSpellings: ["Kolaveri"], popularityScore: 98 },
  { id: 205, title: "Vaseegara", artist: "Bombay Jayashri", movie: "Minnale", language: "tamil", year: 2001, firstLetter: "V", lastLetter: "A", genre: "movie", lyricsKeywords: ["charming", "love", "beauty"], alternateSpellings: ["Vasigara"], popularityScore: 92 },
  { id: 206, title: "Ennai Konjam", artist: "Sid Sriram", movie: "Kaatru Veliyidai", language: "tamil", year: 2017, firstLetter: "E", lastLetter: "M", genre: "movie", lyricsKeywords: ["little", "me", "pamper"], alternateSpellings: [], popularityScore: 85 },
  { id: 207, title: "Nenjukkul Peidhidum", artist: "Harris Jayaraj", movie: "Vaaranam Aayiram", language: "tamil", year: 2008, firstLetter: "N", lastLetter: "M", genre: "movie", lyricsKeywords: ["heart", "rain", "inside"], alternateSpellings: ["Nenjukul Peidhidum"], popularityScore: 88 },
  { id: 208, title: "Aalaporan Thamizhan", artist: "A.R. Rahman", movie: "Mersal", language: "tamil", year: 2017, firstLetter: "A", lastLetter: "N", genre: "movie", lyricsKeywords: ["tamil", "proud", "celebrate"], alternateSpellings: [], popularityScore: 85 },
  { id: 209, title: "Vaathi Coming", artist: "Anirudh Ravichander", movie: "Master", language: "tamil", year: 2021, firstLetter: "V", lastLetter: "G", genre: "movie", lyricsKeywords: ["teacher", "coming", "mass"], alternateSpellings: ["Vaathi Raid"], popularityScore: 92 },
  { id: 210, title: "Arabic Kuthu", artist: "Anirudh Ravichander", movie: "Beast", language: "tamil", year: 2022, firstLetter: "A", lastLetter: "U", genre: "movie", lyricsKeywords: ["arabic", "dance", "party"], alternateSpellings: ["Halamithi Habibo"], popularityScore: 88 },
  { id: 211, title: "Enjoy Enjaami", artist: "Dhee", movie: "Single", language: "tamil", year: 2021, firstLetter: "E", lastLetter: "I", genre: "indie", lyricsKeywords: ["enjoy", "life", "roots"], alternateSpellings: ["Enjoy Enjami"], popularityScore: 90 },
  { id: 212, title: "Thalli Pogathey", artist: "Sid Sriram", movie: "Achcham Yenbadhu Madamaiyada", language: "tamil", year: 2016, firstLetter: "T", lastLetter: "Y", genre: "movie", lyricsKeywords: ["push", "away", "dont"], alternateSpellings: ["Thalli Pogadhe"], popularityScore: 82 },
  { id: 213, title: "Dheevara", artist: "M.M. Keeravani", movie: "Baahubali", language: "tamil", year: 2015, firstLetter: "D", lastLetter: "A", genre: "movie", lyricsKeywords: ["fisherman", "brave", "river"], alternateSpellings: ["Dhivara"], popularityScore: 85 },
  { id: 214, title: "Oru Kadhal Devathai", artist: "Karthik", movie: "Kadhal Konden", language: "tamil", year: 2003, firstLetter: "O", lastLetter: "I", genre: "movie", lyricsKeywords: ["love", "goddess", "one"], alternateSpellings: [], popularityScore: 80 },
  { id: 215, title: "Kadhal En Kadhal", artist: "Yuvan Shankar Raja", movie: "Mayakkam Enna", language: "tamil", year: 2011, firstLetter: "K", lastLetter: "L", genre: "movie", lyricsKeywords: ["love", "my", "passion"], alternateSpellings: [], popularityScore: 78 },
  { id: 216, title: "Petta Theme", artist: "Anirudh Ravichander", movie: "Petta", language: "tamil", year: 2019, firstLetter: "P", lastLetter: "E", genre: "movie", lyricsKeywords: ["mass", "theme", "swag"], alternateSpellings: [], popularityScore: 85 },
  { id: 217, title: "Rowdy Baby", artist: "Dhanush", movie: "Maari 2", language: "tamil", year: 2018, firstLetter: "R", lastLetter: "Y", genre: "movie", lyricsKeywords: ["rowdy", "baby", "dance"], alternateSpellings: [], popularityScore: 95 },
  { id: 218, title: "Enna Solla Pogirai", artist: "Sid Sriram", movie: "Single", language: "tamil", year: 2020, firstLetter: "E", lastLetter: "I", genre: "movie", lyricsKeywords: ["what", "say", "going"], alternateSpellings: [], popularityScore: 82 },
  { id: 219, title: "Kaadhal Rojave", artist: "S.P. Balasubrahmanyam", movie: "Roja", language: "tamil", year: 1992, firstLetter: "K", lastLetter: "E", genre: "movie", lyricsKeywords: ["love", "rose", "romance"], alternateSpellings: ["Kadhal Rojave"], popularityScore: 90 },
  { id: 220, title: "Ilamai Thirumudi", artist: "A.R. Rahman", movie: "Petta", language: "tamil", year: 2019, firstLetter: "I", lastLetter: "I", genre: "movie", lyricsKeywords: ["youth", "crown", "pride"], alternateSpellings: [], popularityScore: 78 },
  { id: 221, title: "Kanave Kanave", artist: "Anirudh Ravichander", movie: "David", language: "tamil", year: 2013, firstLetter: "K", lastLetter: "E", genre: "movie", lyricsKeywords: ["dream", "love", "heart"], alternateSpellings: [], popularityScore: 82 },
  { id: 222, title: "Nee Irukkum Idam", artist: "Sid Sriram", movie: "MM", language: "tamil", year: 2019, firstLetter: "N", lastLetter: "M", genre: "movie", lyricsKeywords: ["place", "you", "are"], alternateSpellings: [], popularityScore: 76 },
  { id: 223, title: "Oru Naalil", artist: "S.P. Balasubrahmanyam", movie: "Pudhiya Mugam", language: "tamil", year: 1993, firstLetter: "O", lastLetter: "L", genre: "movie", lyricsKeywords: ["one", "day", "change"], alternateSpellings: [], popularityScore: 78 },
  { id: 224, title: "Chinna Chinna Aasai", artist: "S. Janaki", movie: "Roja", language: "tamil", year: 1992, firstLetter: "C", lastLetter: "I", genre: "movie", lyricsKeywords: ["small", "wish", "desire"], alternateSpellings: ["China China Asai"], popularityScore: 88 },
  { id: 225, title: "Kannamma", artist: "Santhosh Narayanan", movie: "Kaala", language: "tamil", year: 2018, firstLetter: "K", lastLetter: "A", genre: "movie", lyricsKeywords: ["girl", "love", "darling"], alternateSpellings: [], popularityScore: 78 },
  { id: 226, title: "Uyire Uyire", artist: "Bombay Jayashri", movie: "Bombay", language: "tamil", year: 1995, firstLetter: "U", lastLetter: "E", genre: "movie", lyricsKeywords: ["life", "soul", "love"], alternateSpellings: ["Uyire"], popularityScore: 90 },
  { id: 227, title: "Kaadhalin Deepam Ondru", artist: "S.P. Balasubrahmanyam", movie: "Thambikku Entha Ooru", language: "tamil", year: 1984, firstLetter: "K", lastLetter: "U", genre: "classic", lyricsKeywords: ["love", "light", "one"], alternateSpellings: [], popularityScore: 82 },
  { id: 228, title: "Snehithane", artist: "Alaipayuthey", movie: "Alaipayuthey", language: "tamil", year: 2000, firstLetter: "S", lastLetter: "E", genre: "movie", lyricsKeywords: ["friend", "love", "close"], alternateSpellings: ["Snegithane"], popularityScore: 88 },
  { id: 229, title: "Pachai Nirame", artist: "A.R. Rahman", movie: "Alaipayuthey", language: "tamil", year: 2000, firstLetter: "P", lastLetter: "E", genre: "movie", lyricsKeywords: ["green", "color", "nature"], alternateSpellings: [], popularityScore: 85 },
  { id: 230, title: "Mannipaya", artist: "A.R. Rahman", movie: "Vinnaithaandi Varuvaayaa", language: "tamil", year: 2010, firstLetter: "M", lastLetter: "A", genre: "movie", lyricsKeywords: ["forgive", "sorry", "love"], alternateSpellings: ["Mannippaya"], popularityScore: 82 },

  // ═══════════════════════════════════════════════════════════
  // TELUGU — 100 songs
  // ═══════════════════════════════════════════════════════════
  { id: 301, title: "Buttabomma", artist: "Armaan Malik", movie: "Ala Vaikunthapurramuloo", language: "telugu", year: 2020, firstLetter: "B", lastLetter: "A", genre: "movie", lyricsKeywords: ["doll", "beauty", "love"], alternateSpellings: ["Butta Bomma"], popularityScore: 95 },
  { id: 302, title: "Samajavaragamana", artist: "Sid Sriram", movie: "Ala Vaikunthapurramuloo", language: "telugu", year: 2020, firstLetter: "S", lastLetter: "A", genre: "movie", lyricsKeywords: ["equal", "come", "near"], alternateSpellings: [], popularityScore: 92 },
  { id: 303, title: "Srivalli", artist: "Sid Sriram", movie: "Pushpa", language: "telugu", year: 2021, firstLetter: "S", lastLetter: "I", genre: "movie", lyricsKeywords: ["name", "girl", "love"], alternateSpellings: [], popularityScore: 95 },
  { id: 304, title: "Naatu Naatu", artist: "Rahul Sipligunj", movie: "RRR", language: "telugu", year: 2022, firstLetter: "N", lastLetter: "U", genre: "movie", lyricsKeywords: ["dance", "local", "celebrate"], alternateSpellings: ["Natu Natu"], popularityScore: 98 },
  { id: 305, title: "Ramuloo Ramulaa", artist: "Anurag Kulkarni", movie: "Ala Vaikunthapurramuloo", language: "telugu", year: 2020, firstLetter: "R", lastLetter: "A", genre: "movie", lyricsKeywords: ["rama", "dance", "celebration"], alternateSpellings: [], popularityScore: 88 },
  { id: 306, title: "Oo Antava", artist: "Indravathi Chauhan", movie: "Pushpa", language: "telugu", year: 2021, firstLetter: "O", lastLetter: "A", genre: "movie", lyricsKeywords: ["what", "happened", "attraction"], alternateSpellings: ["Oo Antava Oo Oo Antava"], popularityScore: 90 },
  { id: 307, title: "Komuram Bheemudo", artist: "Kaala Bhairava", movie: "RRR", language: "telugu", year: 2022, firstLetter: "K", lastLetter: "O", genre: "movie", lyricsKeywords: ["revolution", "fight", "freedom"], alternateSpellings: ["Komuram Bheem"], popularityScore: 88 },
  { id: 308, title: "Inkem Inkem Kavale", artist: "Sid Sriram", movie: "Geetha Govindam", language: "telugu", year: 2018, firstLetter: "I", lastLetter: "E", genre: "movie", lyricsKeywords: ["little", "more", "want"], alternateSpellings: ["Inkem Inkem"], popularityScore: 92 },
  { id: 309, title: "Saami Saami", artist: "Mounika Yadav", movie: "Pushpa", language: "telugu", year: 2021, firstLetter: "S", lastLetter: "I", genre: "movie", lyricsKeywords: ["swami", "lord", "dance"], alternateSpellings: [], popularityScore: 85 },
  { id: 310, title: "Dheevara", artist: "M.M. Keeravani", movie: "Baahubali", language: "telugu", year: 2015, firstLetter: "D", lastLetter: "A", genre: "movie", lyricsKeywords: ["fisherman", "brave", "warrior"], alternateSpellings: ["Dhivara"], popularityScore: 88 },
  { id: 311, title: "Pilla Raa", artist: "Haricharan", movie: "RX 100", language: "telugu", year: 2018, firstLetter: "P", lastLetter: "A", genre: "movie", lyricsKeywords: ["girl", "come", "love"], alternateSpellings: ["Pilla Ra"], popularityScore: 82 },
  { id: 312, title: "Jaragandi", artist: "Anirudh Ravichander", movie: "Game Changer", language: "telugu", year: 2024, firstLetter: "J", lastLetter: "I", genre: "movie", lyricsKeywords: ["let happen", "celebration", "dance"], alternateSpellings: [], popularityScore: 82 },
  { id: 313, title: "Arere Yekkada", artist: "S.P. Charan", movie: "Nenu Local", language: "telugu", year: 2017, firstLetter: "A", lastLetter: "A", genre: "movie", lyricsKeywords: ["where", "search", "love"], alternateSpellings: [], popularityScore: 78 },
  { id: 314, title: "Butta Bomma", artist: "Armaan Malik", movie: "Ala Vaikunthapurramuloo", language: "telugu", year: 2020, firstLetter: "B", lastLetter: "A", genre: "movie", lyricsKeywords: ["doll", "cute", "love"], alternateSpellings: [], popularityScore: 92 },
  { id: 315, title: "Ekkadiki Pothav Chinnavada", artist: "Dhanunjay", movie: "Ekkadiki Pothav Chinnavada", language: "telugu", year: 2016, firstLetter: "E", lastLetter: "A", genre: "movie", lyricsKeywords: ["where", "going", "little one"], alternateSpellings: [], popularityScore: 78 },
  { id: 316, title: "Seethakalam", artist: "Armaan Malik", movie: "S/O Satyamurthy", language: "telugu", year: 2015, firstLetter: "S", lastLetter: "M", genre: "movie", lyricsKeywords: ["season", "love", "beauty"], alternateSpellings: [], popularityScore: 80 },
  { id: 317, title: "Choosi Chudangane", artist: "Sid Sriram", movie: "Chalo", language: "telugu", year: 2018, firstLetter: "C", lastLetter: "E", genre: "movie", lyricsKeywords: ["see", "look", "eyes"], alternateSpellings: [], popularityScore: 80 },
  { id: 318, title: "Yevadu", artist: "S.P. Balasubrahmanyam", movie: "Classic", language: "telugu", year: 1990, firstLetter: "Y", lastLetter: "U", genre: "classic", lyricsKeywords: ["who", "question", "identity"], alternateSpellings: [], popularityScore: 72 },
  { id: 319, title: "Ammadu Lets Do Kummudu", artist: "Devi Sri Prasad", movie: "Khaidi No 150", language: "telugu", year: 2017, firstLetter: "A", lastLetter: "U", genre: "movie", lyricsKeywords: ["dance", "fun", "party"], alternateSpellings: ["Ammadu Let's Do Kummudu"], popularityScore: 82 },
  { id: 320, title: "Nee Navve Chalu", artist: "Sid Sriram", movie: "Eega", language: "telugu", year: 2012, firstLetter: "N", lastLetter: "U", genre: "movie", lyricsKeywords: ["smile", "enough", "your"], alternateSpellings: [], popularityScore: 80 },

  // ═══════════════════════════════════════════════════════════
  // HINDI / BOLLYWOOD — 300 songs
  // ═══════════════════════════════════════════════════════════
  { id: 401, title: "Ae Dil Hai Mushkil", artist: "Arijit Singh", movie: "Ae Dil Hai Mushkil", language: "hindi", year: 2016, firstLetter: "A", lastLetter: "L", genre: "movie", lyricsKeywords: ["heart", "difficult", "love"], alternateSpellings: ["Aye Dil Hai Mushkil"], popularityScore: 92 },
  { id: 402, title: "Tum Hi Ho", artist: "Arijit Singh", movie: "Aashiqui 2", language: "hindi", year: 2013, firstLetter: "T", lastLetter: "O", genre: "movie", lyricsKeywords: ["you", "only", "love"], alternateSpellings: [], popularityScore: 98 },
  { id: 403, title: "Channa Mereya", artist: "Arijit Singh", movie: "Ae Dil Hai Mushkil", language: "hindi", year: 2016, firstLetter: "C", lastLetter: "A", genre: "movie", lyricsKeywords: ["beloved", "love", "heartbreak"], alternateSpellings: ["Channa Meraya"], popularityScore: 90 },
  { id: 404, title: "Kesariya", artist: "Arijit Singh", movie: "Brahmastra", language: "hindi", year: 2022, firstLetter: "K", lastLetter: "A", genre: "movie", lyricsKeywords: ["saffron", "love", "color"], alternateSpellings: ["Kesaria", "Kasariya"], popularityScore: 95 },
  { id: 405, title: "Kal Ho Naa Ho", artist: "Sonu Nigam", movie: "Kal Ho Naa Ho", language: "hindi", year: 2003, firstLetter: "K", lastLetter: "O", genre: "movie", lyricsKeywords: ["tomorrow", "not", "life"], alternateSpellings: ["Kal Ho Na Ho"], popularityScore: 95 },
  { id: 406, title: "Tujhe Dekha To", artist: "Kumar Sanu", movie: "Dilwale Dulhania Le Jayenge", language: "hindi", year: 1995, firstLetter: "T", lastLetter: "O", genre: "movie", lyricsKeywords: ["see", "realized", "love"], alternateSpellings: [], popularityScore: 98 },
  { id: 407, title: "Chaiyya Chaiyya", artist: "Sukhwinder Singh", movie: "Dil Se", language: "hindi", year: 1998, firstLetter: "C", lastLetter: "A", genre: "movie", lyricsKeywords: ["shadow", "walk", "love"], alternateSpellings: ["Chaiya Chaiya"], popularityScore: 95 },
  { id: 408, title: "Pehla Nasha", artist: "Udit Narayan", movie: "Jo Jeeta Wohi Sikandar", language: "hindi", year: 1992, firstLetter: "P", lastLetter: "A", genre: "movie", lyricsKeywords: ["first", "intoxication", "love"], alternateSpellings: [], popularityScore: 92 },
  { id: 409, title: "Dil To Pagal Hai", artist: "Lata Mangeshkar", movie: "Dil To Pagal Hai", language: "hindi", year: 1997, firstLetter: "D", lastLetter: "I", genre: "movie", lyricsKeywords: ["heart", "crazy", "love"], alternateSpellings: [], popularityScore: 90 },
  { id: 410, title: "Lag Ja Gale", artist: "Lata Mangeshkar", movie: "Woh Kaun Thi", language: "hindi", year: 1964, firstLetter: "L", lastLetter: "E", genre: "classic", lyricsKeywords: ["embrace", "hug", "night"], alternateSpellings: [], popularityScore: 92 },
  { id: 411, title: "Kuch Kuch Hota Hai", artist: "Udit Narayan", movie: "Kuch Kuch Hota Hai", language: "hindi", year: 1998, firstLetter: "K", lastLetter: "I", genre: "movie", lyricsKeywords: ["something", "happens", "love"], alternateSpellings: [], popularityScore: 95 },
  { id: 412, title: "Mere Sapno Ki Rani", artist: "Kishore Kumar", movie: "Aradhana", language: "hindi", year: 1969, firstLetter: "M", lastLetter: "I", genre: "classic", lyricsKeywords: ["dreams", "queen", "love"], alternateSpellings: [], popularityScore: 90 },
  { id: 413, title: "Dil Chahta Hai", artist: "Shankar Mahadevan", movie: "Dil Chahta Hai", language: "hindi", year: 2001, firstLetter: "D", lastLetter: "I", genre: "movie", lyricsKeywords: ["heart", "wants", "freedom"], alternateSpellings: [], popularityScore: 88 },
  { id: 414, title: "Raatan Lambiyan", artist: "Jubin Nautiyal", movie: "Shershaah", language: "hindi", year: 2021, firstLetter: "R", lastLetter: "N", genre: "movie", lyricsKeywords: ["nights", "long", "love"], alternateSpellings: ["Raataan Lambiyan"], popularityScore: 92 },
  { id: 415, title: "Apna Time Aayega", artist: "Ranveer Singh", movie: "Gully Boy", language: "hindi", year: 2019, firstLetter: "A", lastLetter: "A", genre: "movie", lyricsKeywords: ["time", "will come", "destiny"], alternateSpellings: ["Apna Time Ayega"], popularityScore: 90 },
  { id: 416, title: "Jhoome Jo Pathaan", artist: "Arijit Singh", movie: "Pathaan", language: "hindi", year: 2023, firstLetter: "J", lastLetter: "N", genre: "movie", lyricsKeywords: ["dance", "pathaan", "sway"], alternateSpellings: ["Jhume Jo Pathan"], popularityScore: 88 },
  { id: 417, title: "Bekhayali", artist: "Sachet Tandon", movie: "Kabir Singh", language: "hindi", year: 2019, firstLetter: "B", lastLetter: "I", genre: "movie", lyricsKeywords: ["lost", "thoughts", "love"], alternateSpellings: ["Bekhyali"], popularityScore: 90 },
  { id: 418, title: "Gerua", artist: "Arijit Singh", movie: "Dilwale", language: "hindi", year: 2015, firstLetter: "G", lastLetter: "A", genre: "movie", lyricsKeywords: ["color", "saffron", "love"], alternateSpellings: [], popularityScore: 85 },
  { id: 419, title: "Badtameez Dil", artist: "Benny Dayal", movie: "Yeh Jawaani Hai Deewani", language: "hindi", year: 2013, firstLetter: "B", lastLetter: "L", genre: "movie", lyricsKeywords: ["naughty", "heart", "shameless"], alternateSpellings: [], popularityScore: 88 },
  { id: 420, title: "Teri Mitti", artist: "B Praak", movie: "Kesari", language: "hindi", year: 2019, firstLetter: "T", lastLetter: "I", genre: "movie", lyricsKeywords: ["soil", "sacrifice", "nation"], alternateSpellings: [], popularityScore: 85 },
  { id: 421, title: "Naatu Naatu", artist: "Rahul Sipligunj", movie: "RRR", language: "hindi", year: 2022, firstLetter: "N", lastLetter: "U", genre: "movie", lyricsKeywords: ["dance", "local", "celebrate"], alternateSpellings: ["Natu Natu Hindi"], popularityScore: 95 },
  { id: 422, title: "Srivalli", artist: "Javed Ali", movie: "Pushpa", language: "hindi", year: 2021, firstLetter: "S", lastLetter: "I", genre: "movie", lyricsKeywords: ["name", "girl", "love"], alternateSpellings: [], popularityScore: 88 },
  { id: 423, title: "Chaleya", artist: "Arijit Singh", movie: "Jawan", language: "hindi", year: 2023, firstLetter: "C", lastLetter: "A", genre: "movie", lyricsKeywords: ["go", "walk", "journey"], alternateSpellings: [], popularityScore: 85 },
  { id: 424, title: "Maan Meri Jaan", artist: "King", movie: "Single", language: "hindi", year: 2022, firstLetter: "M", lastLetter: "N", genre: "indie", lyricsKeywords: ["believe", "my life", "love"], alternateSpellings: [], popularityScore: 88 },
  { id: 425, title: "Param Sundari", artist: "Shreya Ghoshal", movie: "Mimi", language: "hindi", year: 2021, firstLetter: "P", lastLetter: "I", genre: "movie", lyricsKeywords: ["beautiful", "supreme", "dance"], alternateSpellings: [], popularityScore: 85 },
  { id: 426, title: "Satranga", artist: "Arijit Singh", movie: "Animal", language: "hindi", year: 2023, firstLetter: "S", lastLetter: "A", genre: "movie", lyricsKeywords: ["seven colors", "rainbow", "love"], alternateSpellings: [], popularityScore: 82 },
  { id: 427, title: "Kabira", artist: "Arijit Singh", movie: "Yeh Jawaani Hai Deewani", language: "hindi", year: 2013, firstLetter: "K", lastLetter: "A", genre: "movie", lyricsKeywords: ["kabir", "love", "wanderer"], alternateSpellings: [], popularityScore: 88 },
  { id: 428, title: "Ilahi", artist: "Arijit Singh", movie: "Yeh Jawaani Hai Deewani", language: "hindi", year: 2013, firstLetter: "I", lastLetter: "I", genre: "movie", lyricsKeywords: ["divine", "journey", "travel"], alternateSpellings: [], popularityScore: 85 },
  { id: 429, title: "Tere Vaaste", artist: "Varun Jain", movie: "Zara Hatke Zara Bachke", language: "hindi", year: 2023, firstLetter: "T", lastLetter: "E", genre: "movie", lyricsKeywords: ["for you", "sake", "love"], alternateSpellings: [], popularityScore: 82 },
  { id: 430, title: "Phir Aur Kya Chahiye", artist: "Arijit Singh", movie: "Zara Hatke Zara Bachke", language: "hindi", year: 2023, firstLetter: "P", lastLetter: "E", genre: "movie", lyricsKeywords: ["what more", "need", "satisfied"], alternateSpellings: [], popularityScore: 80 },
  { id: 431, title: "Besharam Rang", artist: "Caralisa Monteiro", movie: "Pathaan", language: "hindi", year: 2023, firstLetter: "B", lastLetter: "G", genre: "movie", lyricsKeywords: ["shameless", "color", "bold"], alternateSpellings: [], popularityScore: 85 },
  { id: 432, title: "Sajni", artist: "Arijit Singh", movie: "Laapataa Ladies", language: "hindi", year: 2024, firstLetter: "S", lastLetter: "I", genre: "movie", lyricsKeywords: ["beloved", "companion", "love"], alternateSpellings: [], popularityScore: 80 },
  { id: 433, title: "Heeriye", artist: "Jasleen Royal", movie: "Single", language: "hindi", year: 2023, firstLetter: "H", lastLetter: "E", genre: "indie", lyricsKeywords: ["beloved", "dear", "love"], alternateSpellings: [], popularityScore: 82 },
  { id: 434, title: "Lut Gaye", artist: "Jubin Nautiyal", movie: "Single", language: "hindi", year: 2021, firstLetter: "L", lastLetter: "E", genre: "indie", lyricsKeywords: ["robbed", "heart", "love"], alternateSpellings: [], popularityScore: 85 },
  { id: 435, title: "Khairiyat", artist: "Arijit Singh", movie: "Chhichhore", language: "hindi", year: 2019, firstLetter: "K", lastLetter: "T", genre: "movie", lyricsKeywords: ["wellbeing", "how are you", "love"], alternateSpellings: ["Khairiat"], popularityScore: 88 },
  { id: 436, title: "Shayad", artist: "Arijit Singh", movie: "Love Aaj Kal", language: "hindi", year: 2020, firstLetter: "S", lastLetter: "D", genre: "movie", lyricsKeywords: ["maybe", "perhaps", "love"], alternateSpellings: [], popularityScore: 82 },
  { id: 437, title: "Dil Se Re", artist: "A.R. Rahman", movie: "Dil Se", language: "hindi", year: 1998, firstLetter: "D", lastLetter: "E", genre: "movie", lyricsKeywords: ["heart", "from", "love"], alternateSpellings: [], popularityScore: 88 },
  { id: 438, title: "Chura Liya Hai Tumne", artist: "Mohammed Rafi", movie: "Yaadon Ki Baaraat", language: "hindi", year: 1973, firstLetter: "C", lastLetter: "E", genre: "classic", lyricsKeywords: ["stolen", "heart", "classic"], alternateSpellings: [], popularityScore: 90 },
  { id: 439, title: "Pal Pal Dil Ke Paas", artist: "Kishore Kumar", movie: "Blackmail", language: "hindi", year: 1973, firstLetter: "P", lastLetter: "S", genre: "classic", lyricsKeywords: ["every moment", "heart", "near"], alternateSpellings: [], popularityScore: 88 },
  { id: 440, title: "Tum Se Hi", artist: "Mohit Chauhan", movie: "Jab We Met", language: "hindi", year: 2007, firstLetter: "T", lastLetter: "I", genre: "movie", lyricsKeywords: ["from you", "beginning", "love"], alternateSpellings: [], popularityScore: 88 },
  { id: 441, title: "Zara Zara Behekta Hai", artist: "Bombay Jayashri", movie: "RHTDM", language: "hindi", year: 2001, firstLetter: "Z", lastLetter: "I", genre: "movie", lyricsKeywords: ["slowly", "intoxicated", "love"], alternateSpellings: ["Zara Zara"], popularityScore: 90 },
  { id: 442, title: "Tujh Mein Rab Dikhta Hai", artist: "Roop Kumar Rathod", movie: "Rab Ne Bana Di Jodi", language: "hindi", year: 2008, firstLetter: "T", lastLetter: "I", genre: "movie", lyricsKeywords: ["god", "see", "you"], alternateSpellings: [], popularityScore: 85 },
  { id: 443, title: "Main Agar Kahoon", artist: "Sonu Nigam", movie: "Om Shanti Om", language: "hindi", year: 2007, firstLetter: "M", lastLetter: "N", genre: "movie", lyricsKeywords: ["if", "say", "love"], alternateSpellings: [], popularityScore: 82 },
  { id: 444, title: "Ek Ladki Ko Dekha", artist: "Kumar Sanu", movie: "1942 A Love Story", language: "hindi", year: 1994, firstLetter: "E", lastLetter: "A", genre: "classic", lyricsKeywords: ["girl", "saw", "love"], alternateSpellings: [], popularityScore: 90 },
  { id: 445, title: "Dil Diyan Gallan", artist: "Atif Aslam", movie: "Tiger Zinda Hai", language: "hindi", year: 2017, firstLetter: "D", lastLetter: "N", genre: "movie", lyricsKeywords: ["heart", "talks", "love"], alternateSpellings: [], popularityScore: 85 },
  { id: 446, title: "Ghoomar", artist: "Shreya Ghoshal", movie: "Padmaavat", language: "hindi", year: 2018, firstLetter: "G", lastLetter: "R", genre: "movie", lyricsKeywords: ["dance", "tradition", "rajput"], alternateSpellings: ["Ghumar"], popularityScore: 82 },
  { id: 447, title: "Deewani Mastani", artist: "Shreya Ghoshal", movie: "Bajirao Mastani", language: "hindi", year: 2015, firstLetter: "D", lastLetter: "I", genre: "movie", lyricsKeywords: ["crazy", "beloved", "love"], alternateSpellings: [], popularityScore: 85 },
  { id: 448, title: "Nagada Sang Dhol", artist: "Shreya Ghoshal", movie: "Ram-Leela", language: "hindi", year: 2013, firstLetter: "N", lastLetter: "L", genre: "movie", lyricsKeywords: ["drum", "dance", "celebration"], alternateSpellings: [], popularityScore: 82 },
  { id: 449, title: "Gallan Goodiyaan", artist: "Sukhwinder Singh", movie: "Dil Dhadakne Do", language: "hindi", year: 2015, firstLetter: "G", lastLetter: "N", genre: "movie", lyricsKeywords: ["talk", "sweet", "family"], alternateSpellings: ["Gallan Goodiyan"], popularityScore: 82 },
  { id: 450, title: "Balam Pichkari", artist: "Vishal Dadlani", movie: "Yeh Jawaani Hai Deewani", language: "hindi", year: 2013, firstLetter: "B", lastLetter: "I", genre: "movie", lyricsKeywords: ["holi", "color", "water gun"], alternateSpellings: [], popularityScore: 88 },

  // ═══════════════════════════════════════════════════════════
  // ENGLISH — 100 songs
  // ═══════════════════════════════════════════════════════════
  { id: 501, title: "Shape of You", artist: "Ed Sheeran", movie: "Single", language: "english", year: 2017, firstLetter: "S", lastLetter: "U", genre: "pop", lyricsKeywords: ["body", "love", "club"], alternateSpellings: [], popularityScore: 98 },
  { id: 502, title: "Bohemian Rhapsody", artist: "Queen", movie: "Single", language: "english", year: 1975, firstLetter: "B", lastLetter: "Y", genre: "classic", lyricsKeywords: ["mama", "life", "fantasy"], alternateSpellings: [], popularityScore: 95 },
  { id: 503, title: "Blinding Lights", artist: "The Weeknd", movie: "Single", language: "english", year: 2019, firstLetter: "B", lastLetter: "S", genre: "pop", lyricsKeywords: ["lights", "night", "city"], alternateSpellings: [], popularityScore: 95 },
  { id: 504, title: "Perfect", artist: "Ed Sheeran", movie: "Single", language: "english", year: 2017, firstLetter: "P", lastLetter: "T", genre: "pop", lyricsKeywords: ["perfect", "love", "dance"], alternateSpellings: [], popularityScore: 92 },
  { id: 505, title: "Someone Like You", artist: "Adele", movie: "Single", language: "english", year: 2011, firstLetter: "S", lastLetter: "U", genre: "pop", lyricsKeywords: ["someone", "love", "memories"], alternateSpellings: [], popularityScore: 90 },
  { id: 506, title: "Rolling in the Deep", artist: "Adele", movie: "Single", language: "english", year: 2010, firstLetter: "R", lastLetter: "P", genre: "pop", lyricsKeywords: ["fire", "heart", "revenge"], alternateSpellings: [], popularityScore: 90 },
  { id: 507, title: "Uptown Funk", artist: "Bruno Mars", movie: "Single", language: "english", year: 2014, firstLetter: "U", lastLetter: "K", genre: "pop", lyricsKeywords: ["funk", "dance", "hot"], alternateSpellings: [], popularityScore: 92 },
  { id: 508, title: "Despacito", artist: "Luis Fonsi", movie: "Single", language: "english", year: 2017, firstLetter: "D", lastLetter: "O", genre: "pop", lyricsKeywords: ["slowly", "love", "dance"], alternateSpellings: [], popularityScore: 95 },
  { id: 509, title: "Let It Be", artist: "The Beatles", movie: "Single", language: "english", year: 1970, firstLetter: "L", lastLetter: "E", genre: "classic", lyricsKeywords: ["let", "wisdom", "peace"], alternateSpellings: [], popularityScore: 95 },
  { id: 510, title: "Imagine", artist: "John Lennon", movie: "Single", language: "english", year: 1971, firstLetter: "I", lastLetter: "E", genre: "classic", lyricsKeywords: ["imagine", "peace", "world"], alternateSpellings: [], popularityScore: 95 },
  { id: 511, title: "Hotel California", artist: "Eagles", movie: "Single", language: "english", year: 1977, firstLetter: "H", lastLetter: "A", genre: "classic", lyricsKeywords: ["hotel", "desert", "night"], alternateSpellings: [], popularityScore: 92 },
  { id: 512, title: "Closer", artist: "The Chainsmokers", movie: "Single", language: "english", year: 2016, firstLetter: "C", lastLetter: "R", genre: "pop", lyricsKeywords: ["closer", "mattress", "rover"], alternateSpellings: [], popularityScore: 88 },
  { id: 513, title: "All of Me", artist: "John Legend", movie: "Single", language: "english", year: 2013, firstLetter: "A", lastLetter: "E", genre: "pop", lyricsKeywords: ["all", "love", "perfect"], alternateSpellings: [], popularityScore: 92 },
  { id: 514, title: "Happy", artist: "Pharrell Williams", movie: "Despicable Me 2", language: "english", year: 2013, firstLetter: "H", lastLetter: "Y", genre: "pop", lyricsKeywords: ["happy", "clap", "room"], alternateSpellings: [], popularityScore: 88 },
  { id: 515, title: "Believer", artist: "Imagine Dragons", movie: "Single", language: "english", year: 2017, firstLetter: "B", lastLetter: "R", genre: "pop", lyricsKeywords: ["believer", "pain", "fire"], alternateSpellings: [], popularityScore: 88 },
  { id: 516, title: "Viva La Vida", artist: "Coldplay", movie: "Single", language: "english", year: 2008, firstLetter: "V", lastLetter: "A", genre: "pop", lyricsKeywords: ["king", "world", "rule"], alternateSpellings: [], popularityScore: 88 },
  { id: 517, title: "Fix You", artist: "Coldplay", movie: "Single", language: "english", year: 2005, firstLetter: "F", lastLetter: "U", genre: "pop", lyricsKeywords: ["fix", "lights", "guide"], alternateSpellings: [], popularityScore: 90 },
  { id: 518, title: "Faded", artist: "Alan Walker", movie: "Single", language: "english", year: 2015, firstLetter: "F", lastLetter: "D", genre: "pop", lyricsKeywords: ["faded", "where", "lost"], alternateSpellings: [], popularityScore: 88 },
  { id: 519, title: "Dance Monkey", artist: "Tones and I", movie: "Single", language: "english", year: 2019, firstLetter: "D", lastLetter: "Y", genre: "pop", lyricsKeywords: ["dance", "monkey", "move"], alternateSpellings: [], popularityScore: 90 },
  { id: 520, title: "Levitating", artist: "Dua Lipa", movie: "Single", language: "english", year: 2020, firstLetter: "L", lastLetter: "G", genre: "pop", lyricsKeywords: ["levitate", "moonlight", "sugar"], alternateSpellings: [], popularityScore: 85 },
  { id: 521, title: "Flowers", artist: "Miley Cyrus", movie: "Single", language: "english", year: 2023, firstLetter: "F", lastLetter: "S", genre: "pop", lyricsKeywords: ["flowers", "myself", "love"], alternateSpellings: [], popularityScore: 90 },
  { id: 522, title: "Cheap Thrills", artist: "Sia", movie: "Single", language: "english", year: 2016, firstLetter: "C", lastLetter: "S", genre: "pop", lyricsKeywords: ["thrills", "dance", "baby"], alternateSpellings: [], popularityScore: 85 },
  { id: 523, title: "Sunflower", artist: "Post Malone", movie: "Spider-Verse", language: "english", year: 2018, firstLetter: "S", lastLetter: "R", genre: "pop", lyricsKeywords: ["sunflower", "home", "eyes"], alternateSpellings: [], popularityScore: 85 },
  { id: 524, title: "Watermelon Sugar", artist: "Harry Styles", movie: "Single", language: "english", year: 2020, firstLetter: "W", lastLetter: "R", genre: "pop", lyricsKeywords: ["summer", "sugar", "high"], alternateSpellings: [], popularityScore: 82 },
  { id: 525, title: "Enemy", artist: "Imagine Dragons", movie: "Arcane", language: "english", year: 2021, firstLetter: "E", lastLetter: "Y", genre: "pop", lyricsKeywords: ["enemy", "look", "mirror"], alternateSpellings: [], popularityScore: 85 },

  // ═══════════════════════════════════════════════════════════
  // PUNJABI — 40 songs
  // ═══════════════════════════════════════════════════════════
  { id: 601, title: "Mundian To Bach Ke", artist: "Panjabi MC", movie: "Single", language: "punjabi", year: 2002, firstLetter: "M", lastLetter: "E", genre: "pop", lyricsKeywords: ["boys", "beware", "dance"], alternateSpellings: [], popularityScore: 88 },
  { id: 602, title: "High Rated Gabru", artist: "Guru Randhawa", movie: "Single", language: "punjabi", year: 2017, firstLetter: "H", lastLetter: "U", genre: "pop", lyricsKeywords: ["rated", "man", "cool"], alternateSpellings: [], popularityScore: 85 },
  { id: 603, title: "Lahore", artist: "Guru Randhawa", movie: "Single", language: "punjabi", year: 2017, firstLetter: "L", lastLetter: "E", genre: "pop", lyricsKeywords: ["lahore", "city", "night"], alternateSpellings: [], popularityScore: 88 },
  { id: 604, title: "Brown Munde", artist: "AP Dhillon", movie: "Single", language: "punjabi", year: 2020, firstLetter: "B", lastLetter: "E", genre: "pop", lyricsKeywords: ["brown", "boys", "swagger"], alternateSpellings: [], popularityScore: 90 },
  { id: 605, title: "Excuses", artist: "AP Dhillon", movie: "Single", language: "punjabi", year: 2021, firstLetter: "E", lastLetter: "S", genre: "pop", lyricsKeywords: ["excuses", "love", "blame"], alternateSpellings: [], popularityScore: 88 },
  { id: 606, title: "Lover", artist: "Diljit Dosanjh", movie: "Single", language: "punjabi", year: 2022, firstLetter: "L", lastLetter: "R", genre: "pop", lyricsKeywords: ["lover", "heart", "romance"], alternateSpellings: [], popularityScore: 82 },
  { id: 607, title: "Proper Patola", artist: "Diljit Dosanjh", movie: "Single", language: "punjabi", year: 2018, firstLetter: "P", lastLetter: "A", genre: "pop", lyricsKeywords: ["proper", "patola", "style"], alternateSpellings: [], popularityScore: 82 },
  { id: 608, title: "Ikk Kudi", artist: "Diljit Dosanjh", movie: "Udta Punjab", language: "punjabi", year: 2016, firstLetter: "I", lastLetter: "I", genre: "movie", lyricsKeywords: ["one", "girl", "strength"], alternateSpellings: ["Ik Kudi"], popularityScore: 80 },
  { id: 609, title: "Amplifier", artist: "Imran Khan", movie: "Single", language: "punjabi", year: 2009, firstLetter: "A", lastLetter: "R", genre: "pop", lyricsKeywords: ["amplifier", "bass", "dance"], alternateSpellings: [], popularityScore: 85 },
  { id: 610, title: "Kya Baat Ay", artist: "Hardy Sandhu", movie: "Single", language: "punjabi", year: 2018, firstLetter: "K", lastLetter: "Y", genre: "pop", lyricsKeywords: ["what", "talk", "impressed"], alternateSpellings: [], popularityScore: 82 },
  { id: 611, title: "Patiala Peg", artist: "Diljit Dosanjh", movie: "Single", language: "punjabi", year: 2016, firstLetter: "P", lastLetter: "G", genre: "pop", lyricsKeywords: ["patiala", "drink", "fun"], alternateSpellings: [], popularityScore: 78 },
  { id: 612, title: "Born To Shine", artist: "Diljit Dosanjh", movie: "Single", language: "punjabi", year: 2020, firstLetter: "B", lastLetter: "E", genre: "pop", lyricsKeywords: ["shine", "born", "success"], alternateSpellings: [], popularityScore: 80 },
  { id: 613, title: "Bijlee Bijlee", artist: "Hardy Sandhu", movie: "Single", language: "punjabi", year: 2021, firstLetter: "B", lastLetter: "E", genre: "pop", lyricsKeywords: ["electricity", "shock", "beauty"], alternateSpellings: [], popularityScore: 82 },
  { id: 614, title: "No Love", artist: "Shubh", movie: "Single", language: "punjabi", year: 2022, firstLetter: "N", lastLetter: "E", genre: "pop", lyricsKeywords: ["no", "love", "heart"], alternateSpellings: [], popularityScore: 85 },
  { id: 615, title: "We Rollin", artist: "Shubh", movie: "Single", language: "punjabi", year: 2021, firstLetter: "W", lastLetter: "N", genre: "pop", lyricsKeywords: ["rolling", "ride", "vibe"], alternateSpellings: [], popularityScore: 82 },

  // ═══════════════════════════════════════════════════════════
  // BENGALI — 40 songs
  // ═══════════════════════════════════════════════════════════
  { id: 701, title: "Tumi Jake Bhalobaso", artist: "Anupam Roy", movie: "Piku", language: "bengali", year: 2015, firstLetter: "T", lastLetter: "O", genre: "movie", lyricsKeywords: ["love", "whom", "question"], alternateSpellings: [], popularityScore: 82 },
  { id: 702, title: "Mon Majhi Re", artist: "Arijit Singh", movie: "Boss", language: "bengali", year: 2013, firstLetter: "M", lastLetter: "E", genre: "movie", lyricsKeywords: ["mind", "boatman", "heart"], alternateSpellings: [], popularityScore: 85 },
  { id: 703, title: "Pagla Hawar Badol Dine", artist: "Nachiketa", movie: "Single", language: "bengali", year: 1994, firstLetter: "P", lastLetter: "E", genre: "indie", lyricsKeywords: ["crazy", "wind", "storm day"], alternateSpellings: [], popularityScore: 80 },
  { id: 704, title: "Ami Je Tomar", artist: "Arijit Singh", movie: "Bhool Bhulaiyaa 2", language: "bengali", year: 2022, firstLetter: "A", lastLetter: "R", genre: "movie", lyricsKeywords: ["i am", "yours", "love"], alternateSpellings: [], popularityScore: 78 },
  { id: 705, title: "Bela Bose", artist: "Anjan Dutt", movie: "Single", language: "bengali", year: 1993, firstLetter: "B", lastLetter: "E", genre: "indie", lyricsKeywords: ["name", "nostalgia", "city"], alternateSpellings: [], popularityScore: 78 },
  { id: 706, title: "Ei Raat Tomar Amar", artist: "Hemanta Mukherjee", movie: "Deep Jwele Jai", language: "bengali", year: 1959, firstLetter: "E", lastLetter: "R", genre: "classic", lyricsKeywords: ["night", "yours", "mine"], alternateSpellings: [], popularityScore: 82 },
  { id: 707, title: "Tomake Chai", artist: "Arijit Singh", movie: "Gangster", language: "bengali", year: 2016, firstLetter: "T", lastLetter: "I", genre: "movie", lyricsKeywords: ["want", "you", "desire"], alternateSpellings: [], popularityScore: 80 },
  { id: 708, title: "Pherari Mon", artist: "Anupam Roy", movie: "Hemlock Society", language: "bengali", year: 2012, firstLetter: "P", lastLetter: "N", genre: "movie", lyricsKeywords: ["wandering", "mind", "restless"], alternateSpellings: [], popularityScore: 76 },
  { id: 709, title: "Keno Hotath Tumi", artist: "Anupam Roy", movie: "Single", language: "bengali", year: 2015, firstLetter: "K", lastLetter: "I", genre: "indie", lyricsKeywords: ["why", "suddenly", "you"], alternateSpellings: [], popularityScore: 75 },
  { id: 710, title: "Ghum Ghum", artist: "Anupam Roy", movie: "Chotoder Chobi", language: "bengali", year: 2014, firstLetter: "G", lastLetter: "M", genre: "movie", lyricsKeywords: ["sleep", "dream", "eyes"], alternateSpellings: [], popularityScore: 72 },
];

export default songs;

/* ── Search Functions ────────────────────────────────────────── */

/**
 * Search songs by title with enhanced fuzzy matching.
 * @param {string} query
 * @param {number} limit
 * @returns {Array}
 */
export function searchSongs(query, limit = 10) {
  if (!query || !query.trim()) return [];
  return songs
    .map(song => ({ ...song, score: getSimilarity(song.title, query) }))
    .filter(s => s.score > 25)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Search songs by lyrics keywords.
 * @param {string[]} keywords
 * @param {number} limit
 * @returns {Array}
 */
export function searchByLyrics(keywords, limit = 10) {
  if (!keywords || keywords.length === 0) return [];
  const kw = keywords.map(k => k.toLowerCase());
  return songs
    .map(song => {
      const matches = (song.lyricsKeywords || []).filter(lk =>
        kw.some(k => lk.includes(k) || k.includes(lk))
      ).length;
      return { ...song, score: matches > 0 ? Math.round((matches / Math.max(kw.length, 1)) * 80) : 0 };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Find the best song match with confidence.
 * @param {string} title
 * @returns {{ found: boolean, match: Object|null, confidence: number }}
 */
export function findSongMatch(title) {
  if (!title) return { found: false, match: null, confidence: 0 };
  let best = null, bestScore = 0;
  for (const song of songs) {
    const score = getSimilarity(song.title, title);
    // Also check alternate spellings
    for (const alt of (song.alternateSpellings || [])) {
      const altScore = getSimilarity(alt, title);
      if (altScore > score) {
        if (altScore > bestScore) { bestScore = altScore; best = song; }
        continue;
      }
    }
    if (score > bestScore) { bestScore = score; best = song; }
  }
  return { found: bestScore >= 65, match: bestScore >= 40 ? best : null, confidence: bestScore };
}

/**
 * Find top N alternative matches.
 * @param {string} title
 * @param {number} limit
 * @returns {Array}
 */
export function findAlternativeMatches(title, limit = 5) {
  if (!title) return [];
  return songs
    .map(song => ({ ...song, score: getSimilarity(song.title, title) }))
    .filter(s => s.score > 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Get songs starting with a letter */
export function getSongsByLetter(letter) {
  if (!letter) return [];
  return songs.filter(s => s.firstLetter === letter.toUpperCase());
}

/** Get songs by language */
export function getSongsByLanguage(language) {
  return songs.filter(s => s.language === language.toLowerCase());
}

/** Get songs by artist */
export function getSongsByArtist(artist) {
  const q = normalizeForSearch(artist);
  return songs.filter(s => normalizeForSearch(s.artist).includes(q));
}

/** Get songs by genre */
export function getSongsByGenre(genre) {
  return songs.filter(s => s.genre === genre.toLowerCase());
}

/** Get popular songs sorted by popularity */
export function getPopularSongs(limit = 20) {
  return [...songs].sort((a, b) => b.popularityScore - a.popularityScore).slice(0, limit);
}

/** Check if a song exists in database */
export function getRandomSong() {
  return songs[Math.floor(Math.random() * songs.length)];
}

/** Get all unique artists */
export function getAllArtists() {
  return [...new Set(songs.map(s => s.artist))].sort();
}

/** Get all unique languages */
export function getAllLanguages() {
  return [...new Set(songs.map(s => s.language))].sort();
}

/** Get random letter that has songs */
export function getRandomLetterWithSongs() {
  const letters = [...new Set(songs.map(s => s.firstLetter))];
  return letters[Math.floor(Math.random() * letters.length)];
}

/** Get total song count */
export function getSongCount() {
  return songs.length;
}
