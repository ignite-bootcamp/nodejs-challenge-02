import { checkIfSessionExist } from '../middlewares/checkIfSessionExist'
import { app } from '../server'
import { create } from './controlers/create'
import { list } from './controlers/list'
import { listById } from './controlers/listById'
import { statistics } from './controlers/statistics'
import { update } from './controlers/update'

export async function routes() {
  app.get('/meals', { preHandler: [checkIfSessionExist] }, list)
  app.get('/meals/:id', { preHandler: [checkIfSessionExist] }, listById)
  app.get(
    '/meals/statistics',
    { preHandler: [checkIfSessionExist] },
    statistics,
  )
  app.post('/meals', create)
  app.put('/meals/:id', { preHandler: [checkIfSessionExist] }, update)
}
