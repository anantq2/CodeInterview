import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";

const app = express();

const __dirname = path.resolve();

// middleware
app.use(express.json());
// credentials:true meaning?? => server allows a browser to include cookies on request
// allow trailing slash or no trailing slash
const clientUrl = ENV.CLIENT_URL.endsWith("/") ? ENV.CLIENT_URL.slice(0, -1) : ENV.CLIENT_URL;
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(clerkMiddleware()); // this adds auth field to request object: req.auth()

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

// make our app ready for deployment
console.log("Allowed CORS Origin:", ENV.CLIENT_URL);

// In production, we don't serve frontend files here because frontend is on Vercel.
// We only serve the API.
if (ENV.NODE_ENV === "production") {
  app.get("/", (req, res) => {
    res.status(200).json({ msg: "API is running. Frontend is deployed separately." });
  });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => console.log("Server is running on port:", ENV.PORT));
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();
