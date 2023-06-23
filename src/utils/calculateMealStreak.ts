import { Meal } from '@prisma/client'

export async function calculateMealStreak(meals: Meal[]) {
  let currentStreak = 0

  return meals.reduce((streak, meal) => {
    if (meal.isOnDiet) {
      currentStreak += 1
      streak = Math.max(streak, currentStreak)
    } else {
      currentStreak = 0
    }

    return streak
  }, 0)
}
