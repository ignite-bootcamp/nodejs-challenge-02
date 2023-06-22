import { FastifyInstance } from 'fastify'
import { prisma } from '../database/prisma'
import { checkIfSessionExist } from '../middlewares/checkIfSessionExist'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkIfSessionExist],
    },
    async (request) => {
      const { userId } = request.cookies

      const meals = await prisma.meal.findMany({
        where: {
          userId,
        },
      })

      return {
        meals,
      }
    },
  )
}
