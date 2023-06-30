import { FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma'

export async function list(request: FastifyRequest) {
  const { userId } = request.cookies

  const meals = await prisma.meal.findMany({
    where: {
      userId,
    },
  })

  return {
    meals,
  }
}
