import { supabase } from '@/lib/supabase.ts'
import { FunctionsHttpError } from '@supabase/supabase-js'

export const DAILY_GENERATION_LIMIT = 3
export const GENERATION_LIMIT_MESSAGE =
  'You have used all 3 generations for today. Try again tomorrow. The limit resets at midnight Moscow time.'

export function getGenerationDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export class GenerationLimitError extends Error {
  constructor(public readonly generationDate: string) {
    super(GENERATION_LIMIT_MESSAGE)
    this.name = 'GenerationLimitError'
  }
}

export async function getRemainingGenerations(generationDate: string) {
  const { data, error } = await supabase
    .from('meal_generation_limits')
    .select('generation_count')
    .eq('generation_date', generationDate)
    .maybeSingle<{ generation_count: number }>()

  if (error) {
    throw new Error('Could not check your daily generation limit. Please try again.', {
      cause: error,
    })
  }

  return Math.max(0, DAILY_GENERATION_LIMIT - (data?.generation_count ?? 0))
}

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
  const generationDate = getGenerationDate()
  const remaining = await getRemainingGenerations(generationDate)
  if (remaining === 0) throw new GenerationLimitError(generationDate)

  const { data, error } = await supabase.functions.invoke<GenerateDayPlanResponse>(
    'generate-day-plan',
    { body: payload },
  )

  if (error) {
    if (error instanceof FunctionsHttpError && error.context.status === 429) {
      throw new GenerationLimitError(generationDate)
    }

    throw error
  }

  if (data === null) {
    throw new Error('The day plan response is empty.')
  }

  return data
}
