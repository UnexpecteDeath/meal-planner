<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { MealCard } from '@/modules/generator'
import { Button } from '@/shared'
import { getMealHistory } from '../mealHistory'

const { userId } = defineProps<{ userId: string }>()

const {
  data: days,
  isPending,
  isError,
  isFetching,
  refetch,
} = useQuery(() => ({
  queryKey: ['meal-history', userId] as const,
  queryFn: ({ queryKey: [, id], signal }) => getMealHistory(id, signal),
}))

const mealTypes = ['breakfast', 'lunch', 'dinner'] as const
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' })

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`))
}
</script>

<template>
  <section class="meal-history" aria-labelledby="meal-history-title">
    <h2 id="meal-history-title" class="history-title">MEAL HISTORY</h2>

    <p v-if="isPending" class="status" role="status">Loading your meal history…</p>
    <div v-else-if="isError" class="history-error">
      <p class="status" role="alert">Could not load your meal history.</p>
      <Button variant="outline" :disabled="isFetching" @click="refetch()">Try again</Button>
    </div>
    <p v-else-if="!days?.length" class="status">No meal plans yet.</p>

    <div v-else class="history-days">
      <section v-for="day in days" :key="day.plan_date" class="history-day">
        <h3 class="date">
          <time :datetime="day.plan_date">{{ formatDate(day.plan_date) }}</time>
        </h3>
        <div class="meal-grid">
          <template v-for="mealType in mealTypes" :key="mealType">
            <MealCard v-if="day[mealType]" :meal="day[mealType]" :show-regenerate="false" />
            <div v-else class="unavailable">
              <h4>{{ mealType }}</h4>
              <p>This meal is unavailable.</p>
            </div>
          </template>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.meal-history {
  display: grid;
  gap: 24px;
  padding-block: 36px 48px;
}

.history-title {
  font-size: clamp(24px, 3vw, 36px);
  font-weight: var(--font__extra-bold);
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.history-days {
  display: grid;
  gap: 36px;
}

.history-day {
  display: grid;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--bg__skeleton);
  min-width: 0;
}

.date {
  font-size: 16px;
  font-weight: var(--font__bold);
}

.meal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.status,
.unavailable p {
  color: var(--color__muted);
  font-size: 14px;
  line-height: 1.45;
}

.history-error {
  display: grid;
  justify-items: start;
  gap: 12px;
}

.history-error .status {
  color: var(--color__danger);
}

.unavailable {
  display: grid;
  align-content: start;
  gap: 8px;
  padding: 16px;
  border: 1px solid var(--bg__skeleton);
}

.unavailable h4 {
  font-size: 11px;
  font-weight: var(--font__bold);
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

@media (max-width: 1279px) {
  .meal-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .meal-history {
    padding-block: 28px 32px;
  }

  .history-days {
    gap: 28px;
  }

  .meal-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }
}
</style>
