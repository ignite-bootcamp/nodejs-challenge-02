import { FastifyReply, FastifyRequest } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createMealSchema = z.object({
    name: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    isOnDiet: z.boolean(),
  })

  const body = createMealSchema.parse(request.body)

  let userId = request.cookies.userId

  if (!userId) {
    userId = randomUUID()
    reply.setCookie('userId', userId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })
  }

  await prisma.meal.create({
    data: {
      userId,
      ...body,
    },
  })

  return reply.status(201).send()
}
