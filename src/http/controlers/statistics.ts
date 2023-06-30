import { FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma'
import { calculateMealStreak } from '../../utils/calculateMealStreak'

export async function statistics(request: FastifyRequest) {
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
}
