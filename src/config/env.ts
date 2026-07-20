import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  N8N_WEBHOOK_BASE_URL: z.string().url().optional(),
});

export const env = environmentSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
  N8N_WEBHOOK_BASE_URL: process.env.N8N_WEBHOOK_BASE_URL,
});
