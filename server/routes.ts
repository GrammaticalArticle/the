import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertWordSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/words", async (req, res) => {
    const words = await storage.getWords();
    res.json(words);
  });

  app.post("/api/words", async (req, res) => {
    try {
      const input = insertWordSchema.parse(req.body);
      const word = await storage.createWord(input);
      res.status(201).json(word);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  return httpServer;
}

// Seed function
async function seed() {
  const commonWords = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "hello", "world", "discord", "copy", "translator", "language", "cursed"
  ];
  
  console.log("Seeding dictionary...");
  for (const w of commonWords) {
    await storage.createWord({ word: w });
  }
  console.log("Seeding complete.");
}

// Call seed on startup (async, don't await)
seed().catch(console.error);
