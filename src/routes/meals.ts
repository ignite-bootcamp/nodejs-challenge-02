import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { checkIfSessionExist } from '../middlewares/checkIfSessionExist'

export async function mealsRoutes(app: FastifyInstance) {
  app.delete(
    '/:id',
    { preHandler: [checkIfSessionExist] },
    async (request, reply) => {
      const deleteMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = deleteMealParamsSchema.parse(request.params)
      const { userId } = request.cookies

      const meal = await prisma.meal.findFirst({
        where: {
          id,
        },
      })

      if (userId !== meal?.userId) {
        return reply.status(401).send({
          error: 'Unauthorized',
        })
      }

      await prisma.meal.delete({
        where: {
          id,
        },
      })

      return reply.status(204).send()
    },
  )
}
