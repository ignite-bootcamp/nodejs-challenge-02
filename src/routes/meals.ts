import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
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

  app.post('/', async (request, reply) => {
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
  })
}
