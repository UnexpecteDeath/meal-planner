import { supabase } from '@/lib/supabase.ts'

export type Difficulty = 'easy' | 'medium' | 'hard'
type MealType = 'breakfast' | 'lunch' | 'dinner'

type GeneratePlanPayload = {
  planDate: string
  allergies: string[]
  wantedIngredients: string[]
  dislikedIngredients: string[]
  difficulty: Difficulty | 'any'
  servings: number
}

export type Meal<T extends MealType = MealType> = {
  id: string
  name: string
  recipe: string
  calories: number
  servings: number
  allergens: string[]
  meal_type: T
  created_at: string
  difficulty: Difficulty
  image_path: string | null
  ingredients: string[]
  cooking_time: number
}

export type GenerateDayPlanResponse = {
  breakfast: Meal<'breakfast'>
  lunch: Meal<'lunch'>
  dinner: Meal<'dinner'>
  plan_date: string
  history_id: string
}

export type Filters = {
  allergies: string[]
  whatIWantToEat: string[]
  whatIDontWantToEat: string[]
  cookingDifficulty: Difficulty
}

export type ListFilterKey = Exclude<keyof Filters, 'cookingDifficulty'>

export type FilterChange =
  | [key: ListFilterKey, value: string]
  | [key: 'cookingDifficulty', value: Filters['cookingDifficulty']]

export async function generateDayPlan(
  payload: GeneratePlanPayload,
): Promise<GenerateDayPlanResponse> {
  const { data, error } = await supabase.functions.invoke<GenerateDayPlanResponse>(
    'generate-day-plan',
    { body: payload },
  )

  if (error) {
    throw error
  }

  if (data === null) {
    throw new Error('The day plan response is empty.')
  }

  return data
}
