import express from "express";
import { createServer } from "http";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";
import { setupYjsWebSocket } from "./lib/yjsServer.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import codeExecutionRoutes from "./routes/codeExecutionRoutes.js";

const app = express();

const __dirname = path.resolve();

const normalizeOrigin = (origin) => {
  if (!origin || typeof origin !== "string") return "";
  return origin.trim().replace(/\/$/, "");
};

const configuredOrigins = [ENV.CLIENT_URL, ENV.CLIENT_URLS]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map(normalizeOrigin)
  .filter(Boolean);

const allowVercelPreviews = ENV.ALLOW_VERCEL_PREVIEWS === "true";

const isVercelPreviewOrigin = (origin) =>
  /^https:\/\/codeinterview-[a-z0-9-]+\.vercel\.app$/i.test(origin);

const isAllowedOrigin = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);
  return (
    configuredOrigins.includes(normalizedOrigin) ||
    (allowVercelPreviews && isVercelPreviewOrigin(normalizedOrigin))
  );
};

// middleware
app.use(express.json());
// credentials:true meaning?? => server allows a browser to include cookies on request
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no Origin header)
      if (!origin) return callback(null, true);

      if (isAllowedOrigin(origin)) return callback(null, true);

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(clerkMiddleware()); // this adds auth field to request object: req.auth()

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/code", codeExecutionRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

// make our app ready for deployment
console.log("Allowed CORS Origins:", configuredOrigins);
console.log("Allow Vercel Preview Origins:", allowVercelPreviews);

// Always respond to root with API status
app.get("/", (req, res) => {
  res.status(200).json({ msg: "API is running. Frontend is deployed separately." });
});

const startServer = async () => {
  try {
    await connectDB();

    // Create HTTP server wrapping Express (needed for WebSocket upgrade)
    const httpServer = createServer(app);

    // Attach Yjs WebSocket server for real-time code collaboration
    setupYjsWebSocket(httpServer);

    httpServer.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();
