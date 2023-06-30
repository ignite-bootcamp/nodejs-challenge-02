import { checkIfSessionExist } from '../middlewares/checkIfSessionExist'
import { app } from '../server'
import { list } from './controlers/list'

export async function routes() {
  app.get('/meals', { preHandler: [checkIfSessionExist] }, list)
}
