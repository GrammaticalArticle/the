import { z } from "zod";
import { insertWordSchema, words } from "./schema";

export const api = {
  words: {
    list: {
      method: "GET" as const,
      path: "/api/words",
      responses: {
        200: z.array(z.custom<typeof words.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/words",
      input: insertWordSchema,
      responses: {
        201: z.custom<typeof words.$inferSelect>(),
        400: z.object({ message: z.string() }),
        409: z.object({ message: z.string() }),
      },
    },
  },
};
