import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

export async function deleteById(request: FastifyRequest, reply: FastifyReply) {
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
}
