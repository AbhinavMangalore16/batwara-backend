import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./shared/infra/auth/better-auth.config";
import userRouter from "../src/modules/user/api/user.routes";
import expenseRouter from "./modules/expenses/api/expense.routes";

if (!process.env.BETTER_AUTH_URL) {
  console.error("CRITICAL: BETTER_AUTH_URL is not defined!");
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",
  "https://batwara-eosin.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Clean the origin by removing any trailing slash for the check
      const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
      
      if (allowedOrigins.includes(cleanOrigin)) {
        callback(null, true);
      } else {
        console.error(`CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type", 
      "Authorization", 
      "Accept", 
      "auth_token", 
      "ngrok-skip-browser-warning"
    ],
  })
);

app.use(express.json());

const port = Number(process.env.PORT) || 8000;

// ✅ Fix: Express uses '*' for wildcards, not '{*any}'
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.get("/", (req: Request, res: Response) => {
  res.send("Batwara API is running!");
});

app.use("/api/users", userRouter);
app.use("/api/expenses", expenseRouter);

export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}