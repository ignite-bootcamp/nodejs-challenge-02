import { FastifyInstance } from 'fastify'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', () => {
    return { hello: 'hello from meals routes' }
  })
}
