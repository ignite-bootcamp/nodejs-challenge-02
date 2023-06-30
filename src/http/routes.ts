import { checkIfSessionExist } from '../middlewares/checkIfSessionExist'
import { app } from '../server'
import { list } from './controlers/list'
import { listById } from './controlers/listById'

export async function routes() {
  app.get('/meals', { preHandler: [checkIfSessionExist] }, list)
  app.get('/meals/:id', { preHandler: [checkIfSessionExist] }, listById)
}
