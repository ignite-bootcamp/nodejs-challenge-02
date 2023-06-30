import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const updateMealBodySchema = z.object({
    name: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    isOnDiet: z.boolean(),
  })
  const updateMealParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const body = updateMealBodySchema.parse(request.body)
  const { id } = updateMealParamsSchema.parse(request.params)
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

  await prisma.meal.update({
    data: body,
    where: {
      id,
    },
  })

  return reply.status(201).send()
}
