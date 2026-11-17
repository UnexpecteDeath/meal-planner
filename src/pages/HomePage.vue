<template>
  <main class="home">
    <h1>YOUR MEAL PLAN.</h1>
    <p>Your weekly meal plan will appear here.</p>
  </main>
</template>

<style scoped>
.home {
  display: grid;
  gap: 1rem;
  padding-block: 2rem;
  color: var(--color__primary);
}

.home h1 {
  font-size: 2rem;
  font-weight: var(--font__extra-bold);
}

.home p {
  color: var(--color__muted);
}
</style>
