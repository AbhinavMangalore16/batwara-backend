import express from 'express'
import cors from 'cors'
import type {Request,Response} from 'express'
import { toNodeHandler } from "better-auth/node";
import { auth } from "./shared/infra/auth/better-auth.config";
import userRouter from "../src/modules/user/api/user.routes"
import expenseRouter from './modules/expenses/api/expense.routes';

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL].filter(Boolean) as string[], 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
  })
)
app.use(express.json());
const port = Number(process.env.PORT) || 8000;

app.all("/api/auth/{*any}", toNodeHandler(auth)); //allows better auths predefined route paths to actually execute

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})

app.use("/api/users/",userRouter);
app.use("/api/expenses/",expenseRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
