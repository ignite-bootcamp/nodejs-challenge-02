import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { prisma } from '../database/prisma'
import { checkIfSessionExist } from '../middlewares/checkIfSessionExist'
import { calculateMealStreak } from '../utils/calculateMealStreak'

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

  app.get(
    '/statistics',
    { preHandler: [checkIfSessionExist] },
    async (request) => {
      const { userId } = request.cookies

      const totalMeals = await prisma.meal.count({
        where: { userId },
      })
      const totalMealsOnDiet = await prisma.meal.count({
        where: { userId, isOnDiet: true },
      })
      const totalMealsOffDiet = await prisma.meal.count({
        where: { userId, isOnDiet: false },
      })
      const mealsOnDiet = await prisma.meal.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
      })

      const mealsOnDietStreak = await calculateMealStreak(mealsOnDiet)

      return {
        totalMeals,
        totalMealsOnDiet,
        totalMealsOffDiet,
        mealsOnDietStreak,
      }
    },
  )

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

  app.put(
    '/:id',
    { preHandler: [checkIfSessionExist] },
    async (request, reply) => {
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
    },
  )

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
