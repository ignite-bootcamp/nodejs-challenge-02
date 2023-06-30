import { FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'

export async function listById(request: FastifyRequest) {
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
}
