import { FastifyInstance } from 'fastify'
import { z } from 'zod'
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

  app.get('/:id', { preHandler: [checkIfSessionExist] }, async (request) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)
    const { userId } = request.cookies

    const meal = await prisma.meal.findFirst({
      where: {
        id,
        userId,
      },
    })

    return {
      meal,
    }
  })
}
