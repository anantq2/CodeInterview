import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv v17 — explicitly load and assign to process.env
const result = dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (result.parsed) {
  for (const [key, value] of Object.entries(result.parsed)) {
    process.env[key] = value;
  }
}

export const ENV = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: process.env.CLIENT_URL,
  CLIENT_URLS: process.env.CLIENT_URLS,
  ALLOW_VERCEL_PREVIEWS: process.env.ALLOW_VERCEL_PREVIEWS,
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  STREAM_API_KEY: process.env.STREAM_API_KEY,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET,
  JDOODLE_CLIENT_ID: process.env.JDOODLE_CLIENT_ID,
  JDOODLE_CLIENT_SECRET: process.env.JDOODLE_CLIENT_SECRET,
};
