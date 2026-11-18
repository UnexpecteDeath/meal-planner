<script setup lang="ts">
import { computed, ref } from 'vue'
import { useIntervalFn, useNow } from '@vueuse/core'
import { RotateCw } from '@lucide/vue'
import { Button } from '@/shared'
import MealCard from '../components/MealCard.vue'
import Preferences from '../components/Preferences.vue'
import { useGenerateDayPlanMutation, useGenerationLimitQuery } from '../api/queries'
import {
  DAILY_GENERATION_LIMIT,
  GENERATION_LIMIT_MESSAGE,
  GenerationLimitError,
  getGenerationDate,
} from '../api'
import type { FilterChange, Filters, GenerateDayPlanResponse } from '../api'

const initialFilters: Filters = {
  allergies: [],
  whatIWantToEat: [],
  whatIDontWantToEat: [],
  cookingDifficulty: 'medium',
}

const { mutate, isPending, error } = useGenerateDayPlanMutation()
const filters = ref<Filters>(initialFilters)
const result = ref<GenerateDayPlanResponse | null>(null)
const today = useNow({ scheduler: (update) => useIntervalFn(update, 1000) })
const generationDate = computed(() => getGenerationDate(today.value))
const {
  data: remaining,
  isPending: isLimitPending,
  isFetching: isLimitFetching,
  error: limitError,
  refetch: refetchLimit,
} = useGenerationLimitQuery(generationDate)
const isLimitReached = computed(
  () =>
    remaining.value === 0 ||
    (error.value instanceof GenerationLimitError &&
      error.value.generationDate === generationDate.value),
)
const isGenerationDisabled = computed(
  () =>
    isPending.value ||
    isLimitPending.value ||
    isLimitFetching.value ||
    Boolean(limitError.value) ||
    isLimitReached.value,
)
const generationMessage = computed(() => {
  if (isLimitReached.value) return GENERATION_LIMIT_MESSAGE
  if (limitError.value) return limitError.value.message
  if (error.value instanceof GenerationLimitError) return ''
  return error.value?.message ?? ''
})
const dateLabel = computed(() =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeZone: 'Europe/Moscow' })
    .format(today.value)
    .replace(',', ' /'),
)
const meals = computed(() => {
  const plan = result.value
  return plan ? [plan.breakfast, plan.lunch, plan.dinner] : []
})

function handleGenerate() {
  if (isGenerationDisabled.value) return

  mutate(
    {
      planDate: generationDate.value,
      allergies: filters.value.allergies,
      wantedIngredients: filters.value.whatIWantToEat,
      dislikedIngredients: filters.value.whatIDontWantToEat,
      difficulty: filters.value.cookingDifficulty,
      servings: 2,
    },
    {
      onSuccess: (plan) => {
        result.value = plan
      },
    },
  )
}

function handleChangeFilter(...[key, value]: FilterChange) {
  if (key === 'cookingDifficulty') {
    filters.value.cookingDifficulty = value
    return
  }

  const selected = filters.value[key]
  if (key !== 'allergies' && selected.length >= 3 && !selected.includes(value)) return

  filters.value[key] = selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value]
}
</script>

<template>
  <section class="generator-page">
    <div class="header">
      <span class="date">{{ dateLabel }}</span>
      <h1 class="title">WHAT ARE WE EATING TODAY?</h1>
    </div>
    <Preferences
      :handleGenerate="handleGenerate"
      :handleChangeFilter="handleChangeFilter"
      :filters="filters"
      :is-generating="isPending"
      :is-generation-disabled="isGenerationDisabled"
    />
    <p v-if="remaining !== undefined && !limitError" class="limit-status" role="status">
      Daily generations remaining: {{ remaining }} / {{ DAILY_GENERATION_LIMIT }}
    </p>
    <p v-if="generationMessage" class="plan-error" role="alert">{{ generationMessage }}</p>
    <Button
      v-if="limitError"
      class="retry-limit"
      variant="outline"
      :disabled="isLimitFetching"
      @click="refetchLimit()"
    >
      {{ isLimitFetching ? 'CHECKING LIMIT…' : 'TRY AGAIN' }}
    </Button>

    <section v-if="result" class="plan" aria-labelledby="plan-title" :aria-busy="isPending">
      <div class="plan-header">
        <h2 id="plan-title" class="plan-title">TODAY'S TABLE</h2>
        <Button
          class="regenerate-all"
          variant="outline"
          :disabled="isGenerationDisabled"
          @click="handleGenerate"
        >
          {{ isPending ? 'REGENERATING…' : 'REGENERATE ALL' }}
          <template #right-icon>
            <RotateCw />
          </template>
        </Button>
      </div>

      <div class="meal-grid">
        <MealCard v-for="meal in meals" :key="`${meal.meal_type}-${meal.id}`" :meal="meal" />
      </div>
    </section>
  </section>
</template>

<style scoped>
.generator-page {
  padding-bottom: 48px;
}

.header {
  padding: 72px 0 52px 0;
}

.date {
  font-size: 12px;
  font-weight: 650;
  color: var(--color__muted);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.title {
  font-size: 78px;
  font-weight: var(--font__extra-bold);
  letter-spacing: -3.5px;
  line-height: 90%;
  max-width: 600px;
}

.limit-status,
.plan-error {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.limit-status {
  color: var(--color__muted);
}

.plan-error {
  color: var(--color__danger);
}

.retry-limit {
  margin-top: 12px;
}

.plan {
  margin-top: 48px;
  padding-top: 40px;
  border-top: 1px solid var(--bg__skeleton);
}

.plan-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.plan-title {
  font-size: clamp(26px, 3vw, 40px);
  font-weight: var(--font__extra-bold);
  letter-spacing: -0.04em;
  line-height: 1;
}

.meal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

@media (max-width: 1279px) {
  .header {
    padding-block: 48px 36px;
  }

  .title {
    margin-top: 8px;
    font-size: 56px;
    letter-spacing: -2.5px;
    text-wrap: balance;
  }

  .meal-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .generator-page {
    padding-bottom: 32px;
  }

  .header {
    padding-block: 28px 24px;
  }

  .date {
    font-size: 11px;
    letter-spacing: 1px;
  }

  .title {
    font-size: clamp(32px, 10vw, 44px);
    letter-spacing: -1.5px;
    line-height: 1;
  }

  .plan {
    margin-top: 32px;
    padding-top: 24px;
  }

  .plan-header {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .plan-header .regenerate-all {
    min-height: 48px;
  }

  .meal-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }
}
</style>
