/**
 * Client-side implementation of the "The" language translator logic.
 * This mirrors the logic expected in shared/translator.ts but implemented here
 * because we need to run it in the browser immediately.
 */

const BASE_WORD = "the";

// Common diacritics range 
const DIACRITICS = [
  ...Array.from({ length: 0x034F - 0x0300 }, (_, i) => String.fromCharCode(i + 0x0300)),
  ...Array.from({ length: 0x0363 - 0x0350 }, (_, i) => String.fromCharCode(i + 0x0350))
];

export function normalize(text: string): string {
  return text.normalize("NFD");
}

async function sha256(message: string): Promise<Uint8Array> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return new Uint8Array(hashBuffer);
}

export async function wordToThe(word: string): Promise<string> {
  const lowerWord = word.toLowerCase();
  
  // Deterministic hash
  const hash = await sha256(lowerWord);
  const n = DIACRITICS.length;
  
  // Decide how many diacritics to use (5 to 12) to avoid collisions
  const r = 5 + (hash[0] % 8);
  
  let diacs = "";
  for (let i = 0; i < r; i++) {
    const index = hash[i + 1] % n;
    diacs += DIACRITICS[index];
  }
  
  return normalize(BASE_WORD + diacs);
}

export async function translateEnglishToThe(sentence: string): Promise<string> {
  const parts = sentence.split(/\s+/); // Split by whitespace
  const out: string[] = [];
  
  // We need to preserve original spacing logic roughly, but split/join simplifies.
  // For a better implementation we'd use regex to separate words and punctuation.
  // Simple regex tokenizer:
  const tokens = sentence.match(/[\w']+|[^\w\s]|\s+/g) || [];

  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      out.push(token);
      continue;
    }
    
    // Check if it's a word (contains letters)
    if (/[a-zA-Z]/.test(token)) {
      // It's a word
      const core = token.replace(/^[^\w]+|[^\w]+$/g, ""); // Strip surrounding punctuation if any attached (though regex above splits mostly)
      // Actually with the regex above, punctuation is separate tokens usually, 
      // but let's handle "word." case if logic changes.
      
      if (token.match(/^[a-zA-Z0-9_']+$/)) {
         out.push(await wordToThe(token));
      } else {
         out.push(token);
      }
    } else {
      out.push(token);
    }
  }

  // Join everything back
  let result = out.join("");
  
  // Smart capitalization
  // Capitalize first letter of result
  if (result.length > 0) {
      result = result.charAt(0).toUpperCase() + result.slice(1);
  }
  
  // Capitalize after . ? !
  const sentenceEndings = /[.?!]\s+([a-z])/g;
  result = result.replace(sentenceEndings, (match, letter) => {
      return match.toUpperCase();
  });

  return result;
}
