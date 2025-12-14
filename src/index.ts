import express from 'express'
import type {Request,Response} from 'express'
import userRoutes from '../services/user-service/routes/user.routes.js'
const app = express()
const port = 3000
app.use(express.json());
app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})
app.use('/users', userRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
