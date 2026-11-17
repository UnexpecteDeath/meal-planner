<script setup lang="ts">
import { computed, ref } from 'vue'
import { RotateCw } from '@lucide/vue'
import { Button } from '@/shared'
import MealCard from '../components/MealCard.vue'
import Preferences from '../components/Preferences.vue'
import { useGenerateDayPlanMutation } from '../api/queries'
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
const today = ref(new Date())
const dateLabel = computed(() =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(today.value).replace(',', ' /'),
)
const meals = computed(() => {
  const plan = result.value
  return plan ? [plan.breakfast, plan.lunch, plan.dinner] : []
})

function handleGenerate() {
  if (isPending.value) return

  const now = new Date()
  today.value = now
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  mutate(
    {
      planDate: `${now.getFullYear()}-${month}-${day}`,
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
    />
    <p v-if="error" class="plan-error" role="alert">{{ error.message }}</p>

    <section v-if="result" class="plan" aria-labelledby="plan-title" :aria-busy="isPending">
      <div class="plan-header">
        <h2 id="plan-title" class="plan-title">TODAY'S TABLE</h2>
        <Button
          class="regenerate-all"
          variant="outline"
          :disabled="isPending"
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

.plan-error {
  margin-top: 12px;
  color: var(--color__danger);
  font-size: 14px;
  overflow-wrap: anywhere;
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
