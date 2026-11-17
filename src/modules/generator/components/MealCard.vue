<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ImageOff, RotateCw } from '@lucide/vue'
import type { Meal } from '../api'

const { meal, showRegenerate = true } = defineProps<{ meal: Meal; showRegenerate?: boolean }>()
const imagePath = computed(() => meal.image_path?.trim())
const imageFailed = ref(false)

watch(imagePath, () => {
  imageFailed.value = false
})

function regenerateMeal() {
  window.alert('Regenerating a single meal is not available yet.')
}
</script>

<template>
  <article class="meal-card">
    <div class="meal-image">
      <img
        v-if="imagePath && !imageFailed"
        :key="imagePath"
        :src="imagePath"
        :alt="meal.name"
        loading="lazy"
        decoding="async"
        @error="imageFailed = true"
      />
      <ImageOff v-else :size="32" :stroke-width="1.5" aria-hidden="true" />
    </div>

    <div class="meal-body">
      <div class="meal-header">
        <span class="meal-type">{{ meal.meal_type }}</span>
        <button
          v-if="showRegenerate"
          class="regenerate"
          type="button"
          :aria-label="`Regenerate ${meal.meal_type}`"
          @click="regenerateMeal"
        >
          Regenerate <RotateCw :size="12" aria-hidden="true" />
        </button>
      </div>

      <h3 class="meal-name">{{ meal.name }}</h3>

      <ul class="meal-meta" role="list">
        <li>{{ meal.cooking_time }} min</li>
        <li>{{ meal.difficulty }}</li>
        <li>{{ meal.servings }} {{ meal.servings === 1 ? 'serving' : 'servings' }}</li>
        <li>{{ meal.calories }} kcal</li>
      </ul>

      <p v-if="meal.ingredients.length" class="ingredients">{{ meal.ingredients.join(' · ') }}</p>

      <p class="recipe-preview">{{ meal.recipe }}</p>
      <details class="method">
        <summary class="method-toggle">
          View full method
          <span class="method-icon" aria-hidden="true"></span>
        </summary>
        <p class="recipe">{{ meal.recipe }}</p>
      </details>
    </div>
  </article>
</template>

<style scoped>
.meal-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  border: 1px solid var(--bg__skeleton);
  background: var(--color__secondary);
  color: var(--color__primary);
}

.meal-image {
  position: relative;
  display: grid;
  aspect-ratio: 5 / 3;
  place-items: center;
  overflow: hidden;
  background: var(--bg__primary);
  color: var(--color__muted);
}

.meal-image img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.meal-image svg {
  width: 32px;
  height: 32px;
}

.meal-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  padding: clamp(16px, 2vw, 24px);
  overflow-wrap: anywhere;
}

.meal-header,
.meal-meta,
.regenerate,
.method-toggle {
  display: flex;
  align-items: center;
}

.meal-header {
  flex-wrap: wrap;
  gap: 4px 12px;
  justify-content: space-between;
}

.meal-type,
.regenerate,
.method-toggle {
  font-size: 11px;
  font-weight: var(--font__bold);
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.regenerate {
  gap: 5px;
  min-height: 44px;
  color: var(--color__muted);
}

.regenerate svg {
  width: 12px;
  height: 12px;
}

.meal-name {
  font-size: clamp(22px, 2.15vw, 32px);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.meal-meta {
  flex-wrap: wrap;
  gap: 6px 14px;
  color: var(--color__muted);
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.ingredients,
.recipe-preview,
.recipe {
  font-size: 14px;
  line-height: 1.5;
}

.recipe-preview,
.recipe {
  color: var(--color__muted);
  white-space: pre-line;
}

.recipe-preview {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.meal-body:has(.method[open]) .recipe-preview {
  display: none;
}

.method {
  margin-top: auto;
  border-top: 1px solid var(--bg__skeleton);
}

.method-toggle {
  justify-content: space-between;
  gap: 8px;
  min-height: 44px;
  list-style: none;
  cursor: pointer;
}

.method-toggle::-webkit-details-marker {
  display: none;
}

.method-icon::before {
  content: '+';
  font-size: 20px;
  font-weight: 400;
}

.method[open] .method-icon::before {
  content: '−';
}

.regenerate:hover,
.method-toggle:hover {
  text-decoration: underline;
}

.regenerate:focus-visible,
.method-toggle:focus-visible {
  outline: 2px solid var(--bg__secondary);
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .meal-image {
    aspect-ratio: 16 / 9;
    max-height: 200px;
  }

  .meal-body {
    gap: 12px;
    padding: 16px;
  }

  .meal-meta {
    gap: 4px 10px;
  }
}
</style>
