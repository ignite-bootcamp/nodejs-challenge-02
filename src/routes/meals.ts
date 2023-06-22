import { FastifyInstance } from 'fastify'
import { prisma } from '../database/prisma'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const { userId } = request.cookies

    const meals = await prisma.meal.findMany({
      where: {
        userId,
      },
    })

    return {
      meals,
    }
  })
}
