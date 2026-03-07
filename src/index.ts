import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./shared/infra/auth/better-auth.config";
import userRouter from "../src/modules/user/api/user.routes";
import expenseRouter from "./modules/expenses/api/expense.routes";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",
  "https://batwara-eosin.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error("Not allowed by CORS"))
    },
    credentials: true
  })
)

app.use(express.json());

const port = Number(process.env.PORT) || 8000;

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/users/", userRouter);
app.use("/api/expenses/", expenseRouter);

export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}