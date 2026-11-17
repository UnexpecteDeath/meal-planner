<script setup lang="ts">
import { computed } from 'vue'
import signInImage from '../assets/SignIn.png'
import signUpImage from '../assets/SignUp.png'

type Props = {
  type: 'SignIn' | 'SignUp'
}

const { type } = defineProps<Props>()

const imageUrl = computed(() => (type === 'SignIn' ? signInImage : signUpImage))
</script>

<template>
  <section class="banner">
    <div class="content">
      <h1 v-if="type === 'SignUp'">YOUR WEEK. ON A PLATE.</h1>
      <h1 v-else>GOOD FOOD. LESS THINKING.</h1>
      <p v-if="type === 'SignUp'">
        Set your preferences once. Make dinner feel effortless every day.
      </p>
      <p v-else>A daily ritual for two people who would rather cook than decide.</p>
    </div>
    <img :src="imageUrl" alt="banner image" />
  </section>
</template>

<style scoped>
.banner {
  background: var(--bg__secondary);
  padding: clamp(40px, 4.45vw, 112px);
  height: 100svh;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 32px;
}

.banner img {
  display: block;
  width: 100%;
  height: auto;
  min-height: 0;
  max-height: 58%;
  object-fit: cover;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content h1 {
  color: var(--color__secondary);
  font-size: clamp(68px, 4.72vw, 96px);
  letter-spacing: -3px;
  line-height: 90%;
  font-weight: var(--font__extra-bold);
}

.content p {
  color: var(--color__muted);
  font-size: 17px;
  line-height: 145%;
}
</style>
