import express from 'express'
import type {Request,Response} from 'express'
import { toNodeHandler } from "better-auth/node";
import { auth } from "./shared/infra/auth/better-auth.config";
import userRouter from "../src/modules/user/api/user.routes"

const app = express()
const port = Number(process.env.PORT) || 8000;

app.all("/api/auth/{*any}", toNodeHandler(auth)); //allows better auths predefined rouet paths to actually execute

app.use(express.json());

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})

app.use("/api/users/",userRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
