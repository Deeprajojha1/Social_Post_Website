import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

const configuredOrigins = [
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
  "http://localhost:5173",
]
  .flatMap((value) => (value || "").split(","))
  .map((value) => value.trim())
  .filter(Boolean)
  .map((value) => value.replace(/\/$/, ""));

const vercelPreviewPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (no Origin header), such as health checks.
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");
      const isConfiguredOrigin = configuredOrigins.includes(normalizedOrigin);
      const isVercelPreview = vercelPreviewPattern.test(normalizedOrigin);

      if (isConfiguredOrigin || isVercelPreview) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.use(errorHandler);

export default app;
