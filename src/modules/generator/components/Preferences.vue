<script lang="ts" setup>
import { ref, useId } from 'vue'
import { ChevronDown } from '@lucide/vue'
import { Button } from '@/shared'
import type { Difficulty, FilterChange, Filters, ListFilterKey } from '../api'

type Preference = { title: string } & (
  | { id: ListFilterKey; items: string[]; collapsible?: boolean }
  | { id: 'cookingDifficulty'; items: Difficulty[]; collapsible?: false }
)

const ingredients = [
  'chicken',
  'beef',
  'pork',
  'turkey',
  'fish',
  'seafood',
  'rice',
  'buckwheat',
  'pasta',
  'potatoes',
  'oatmeal',
  'bulgur',
  'mushrooms',
  'tomatoes',
  'broccoli',
  'zucchini',
  'bell_pepper',
  'cabbage',
  'eggs',
  'cheese',
  'cottage_cheese',
  'beans',
  'lentils',
  'avocado',
]

const preferences: Preference[] = [
  {
    id: 'allergies',
    title: 'ALLERGIES',
    items: ['milk', 'egg', 'peanut', 'tree_nuts', 'fish', 'shellfish', 'soy', 'wheat', 'sesame'],
  },
  {
    id: 'whatIWantToEat',
    title: 'WHAT I WANT TO EAT',
    items: ingredients,
    collapsible: true,
  },
  {
    id: 'whatIDontWantToEat',
    title: "WHAT I DON'T WANT TO EAT",
    collapsible: true,
    items: [
      ...ingredients,
      'onion',
      'garlic',
      'carrot',
      'eggplant',
      'cucumber',
      'liver',
      'olives',
      'cilantro',
      'raisins',
      'mayonnaise',
    ],
  },
  {
    id: 'cookingDifficulty',
    title: 'COOKING DIFFICULTY',
    items: ['easy', 'medium', 'hard'],
  },
]

type Props = {
  handleGenerate: () => void
  handleChangeFilter: (...change: FilterChange) => void
  filters: Filters
  isGenerating: boolean
}

const { handleGenerate, handleChangeFilter, filters, isGenerating } = defineProps<Props>()

const groupId = useId()
const expandedGroups = ref<ListFilterKey[]>([])

function toggleGroup(id: ListFilterKey) {
  expandedGroups.value = expandedGroups.value.includes(id)
    ? expandedGroups.value.filter((group) => group !== id)
    : [...expandedGroups.value, id]
}

function isSelected(id: Preference['id'], item: string) {
  return id === 'cookingDifficulty'
    ? filters.cookingDifficulty === item
    : filters[id].includes(item)
}

function selectPreference(preference: Preference, item: string) {
  if (preference.id === 'cookingDifficulty') {
    const difficulty = preference.items.find((option) => option === item)
    if (difficulty) handleChangeFilter('cookingDifficulty', difficulty)
    return
  }

  handleChangeFilter(preference.id, item)
}
</script>

<template>
  <div class="container">
    <h2 class="title">TODAY'S PREFERENCES</h2>
    <div class="preferences">
      <div
        v-for="preference in preferences"
        :key="preference.id"
        class="preference"
        :class="{ 'preference--collapsible': preference.collapsible }"
      >
        <h3 class="preference_name">{{ preference.title }}</h3>
        <button
          v-if="preference.collapsible"
          class="group-toggle"
          type="button"
          :aria-controls="`${groupId}-${preference.id}`"
          :aria-expanded="expandedGroups.includes(preference.id)"
          @click="toggleGroup(preference.id)"
        >
          <span>{{ preference.title }}</span>
          <span class="group-toggle-end">
            <span v-if="filters[preference.id].length" class="selection-count">
              {{ filters[preference.id].length }} selected
            </span>
            <ChevronDown :size="16" aria-hidden="true" />
          </span>
        </button>
        <div
          :id="`${groupId}-${preference.id}`"
          class="preference_value"
          :class="{
            'preference_value--collapsed':
              preference.collapsible && !expandedGroups.includes(preference.id),
          }"
        >
          <Button
            v-for="item in preference.items"
            :key="item"
            class="preference-button"
            :variant="isSelected(preference.id, item) ? 'secondary' : 'outline'"
            :aria-pressed="isSelected(preference.id, item)"
            type="button"
            @click="selectPreference(preference, item)"
          >
            {{ item }}
          </Button>
        </div>
      </div>
    </div>
    <Button
      class="generate-button"
      :disabled="isGenerating"
      :aria-busy="isGenerating"
      @click="handleGenerate"
    >
      {{ isGenerating ? 'GENERATING…' : 'GENERATE MY DAY →' }}
    </Button>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.title {
  font-size: 12px;
  letter-spacing: 1.4px;
  font-weight: var(--font__bold);
  color: var(--color__primary);
}

.preferences {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preference {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preference_name {
  font-size: 10px;
  font-weight: var(--font__bold);
  color: var(--color__muted);
  letter-spacing: 1.1px;
}

.preference_value {
  display: flex;
  gap: 8px;
  max-width: 100%;
  flex-wrap: wrap;
}

.group-toggle {
  display: none;
}

@media (max-width: 1279px) {
  .container .generate-button {
    min-height: 52px;
  }
}

@media (max-width: 767px) {
  .container {
    gap: 20px;
  }

  .title {
    font-size: 14px;
  }

  .preferences {
    gap: 20px;
  }

  .preference--collapsible {
    gap: 0;
  }

  .preference--collapsible .preference_name,
  .preference_value--collapsed {
    display: none;
  }

  .group-toggle {
    display: flex;
    width: 100%;
    min-height: 48px;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid var(--bg__skeleton);
    color: var(--color__primary);
    font-size: 11px;
    font-weight: var(--font__bold);
    letter-spacing: 0.06em;
    text-align: left;
  }

  .group-toggle:focus-visible {
    outline: 2px solid var(--bg__secondary);
    outline-offset: 2px;
  }

  .group-toggle-end {
    display: flex;
    flex: none;
    align-items: center;
    gap: 6px;
  }

  .selection-count {
    color: var(--color__muted);
    font-weight: var(--font__normal);
    letter-spacing: normal;
  }

  .group-toggle svg {
    width: 16px;
    height: 16px;
  }

  .group-toggle[aria-expanded='true'] svg {
    transform: rotate(180deg);
  }

  .preference--collapsible .preference_value {
    margin-top: 8px;
  }

  .preference_value {
    gap: 6px;
  }

  .preference_value .preference-button {
    max-width: 100%;
    padding-inline: 12px;
    overflow-wrap: anywhere;
  }
}
</style>
