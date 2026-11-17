import { supabase } from '@/lib/supabase'
import type { Meal } from '@/modules/generator/api'

type MealHistoryDay = {
  plan_date: string
  breakfast: Meal<'breakfast'> | null
  lunch: Meal<'lunch'> | null
  dinner: Meal<'dinner'> | null
}

const mealColumns =
  'id, name, recipe, calories, servings, allergens, meal_type, created_at, difficulty, image_path, ingredients, cooking_time'
const historyColumns = `
  plan_date,
  breakfast:breakfast_id(${mealColumns}),
  lunch:lunch_id(${mealColumns}),
  dinner:dinner_id(${mealColumns})
`
const pageSize = 100

export async function getMealHistory(userId: string, signal: AbortSignal) {
  const latestByDate = new Map<string, MealHistoryDay>()

  for (let start = 0; ; start += pageSize) {
    const { data, error } = await supabase
      .from('meal_history')
      .select(historyColumns)
      .eq('user_id', userId)
      .order('plan_date', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(start, start + pageSize - 1)
      .abortSignal(signal)
      .overrideTypes<MealHistoryDay[], { merge: false }>()

    if (error) throw error

    for (const plan of data) {
      // The first plan for each date is its most recent generation.
      if (!latestByDate.has(plan.plan_date)) latestByDate.set(plan.plan_date, plan)
    }

    if (data.length < pageSize) return [...latestByDate.values()]
  }
}
