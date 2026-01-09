
// Port of thelang.py logic
const DIACRITICS = [
  ...Array.from({ length: 0x034F - 0x0300 }, (_, i) => String.fromCharCode(0x0300 + i)),
  ...Array.from({ length: 0x0363 - 0x0350 }, (_, i) => String.fromCharCode(0x0350 + i))
];

const BASE_WORD = "the";

// Simple deterministic hash function (FNV-1a variant) for string to number array
// We need bytes like sha256 digest. 
// Python: hashlib.sha256(word.encode("utf-8")).digest()
// We'll simulate a 32-byte digest using a simple PRNG seeded by the string
function pseudoSha256(str: string): number[] {
  let h = 0x811c9dc5;
  const bytes: number[] = [];
  
  // Mix string into hash
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }

  // Generate 32 "bytes" using a simple LCGs seeded by the hash
  let seed = h;
  for (let i = 0; i < 32; i++) {
    seed = Math.imul(seed, 1664525) + 1013904223;
    bytes.push((seed >>> 24) & 0xFF);
  }
  return bytes;
}

export function normalize(text: string): string {
  return text.normalize("NFD");
}

export function wordToThe(word: string): string {
  word = word.toLowerCase();
  
  // In the web app, we might not have the full map pre-built in memory synchronously
  // unless we fetch it. But the logic determines the "The" form from the word hash.
  // The Python script built maps to handle collisions/memoization, but the core logic
  // was: hash -> diacritics.
  // We will assume no collisions for simplicity in the UI or fetch from DB if strict.
  // Given the collision fix (5-12 diacritics), algorithmic generation is safe-ish.
  
  const h = pseudoSha256(word);
  const n = DIACRITICS.length;
  
  // r = 5 + h[0] % 8
  const r = 5 + (h[0] % 8);
  
  let diacs = "";
  for (let i = 0; i < r; i++) {
    diacs += DIACRITICS[h[i + 1] % n];
  }
  
  return normalize(BASE_WORD + diacs);
}

export function translateEnglishSentence(sentence: string, dictionary: Set<string>): string {
  const parts = sentence.split(/(\s+|[^\w\s']+)/); // Split keeping delimiters
  let out = "";
  
  // We need to track index for capitalization logic
  let wordIndex = 0;
  let lastWasPunctuation = true; // Start of sentence counts as after punctuation
  
  for (const part of parts) {
    if (!part.trim()) {
      out += part;
      continue;
    }
    
    // Check if it's punctuation
    if (/^[^\w\s]+$/.test(part)) {
      out += part;
      if (/[.?!]/.test(part)) {
        lastWasPunctuation = true;
      }
      continue;
    }
    
    // It's a word
    const core = part.replace(/[^\w]/g, ""); // simple strip
    // If we want to support "word's", etc.
    
    const lowerCore = core.toLowerCase();
    
    // Logic: if word is in dictionary (or we just generate it?)
    // Python script: `if core:` check. Python script adds ALL words to dict?
    // User said "words are in the dictionary". 
    // We will assume valid English words are translated.
    
    const theWord = wordToThe(lowerCore);
    let finalWord = theWord;
    
    if (lastWasPunctuation) {
      finalWord = finalWord.charAt(0).toUpperCase() + finalWord.slice(1);
      lastWasPunctuation = false;
    }
    
    out += finalWord;
  }
  
  return out;
}

// For reverse translation, we need the map.
// On the client, we might need to fetch the full word list to build the map,
// or send to backend.
// Sending to backend is safer for a large dictionary.
