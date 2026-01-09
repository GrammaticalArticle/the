import { words, type Word, type InsertWord } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getWords(): Promise<Word[]>;
  createWord(word: InsertWord): Promise<Word>;
  getWord(word: string): Promise<Word | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getWords(): Promise<Word[]> {
    return await db.select().from(words);
  }

  async getWord(word: string): Promise<Word | undefined> {
    const [found] = await db.select().from(words).where(eq(words.word, word));
    return found;
  }

  async createWord(insertWord: InsertWord): Promise<Word> {
    const [word] = await db
      .insert(words)
      .values(insertWord)
      .onConflictDoNothing() // Handle duplicates gracefully
      .returning();
      
    if (!word) {
      // If duplicate, return existing
      return (await this.getWord(insertWord.word))!;
    }
    return word;
  }
}

export const storage = new DatabaseStorage();
