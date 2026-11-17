<script setup lang="ts">
import { Button, Input } from '@/shared'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase.ts'
import { LoaderCircle, Mail } from '@lucide/vue'

type Errors = {
  email: string | null
  password: string | null
}

const initialErrors = {
  email: null,
  password: null,
}

const email = ref<string>('')
const password = ref<string>('')
const SignInError = ref<string | null>(null)
const errors = ref<Errors>({ ...initialErrors })
const isSubmitting = ref<boolean>(false)
const router = useRouter()

const onSubmit = async () => {
  if (isSubmitting.value) return
  errors.value = { ...initialErrors }
  SignInError.value = null
  if (!email.value.trim()) {
    errors.value = { ...initialErrors, email: 'Enter a valid email' }
    return
  }
  if (!password.value.trim()) {
    errors.value = { ...initialErrors, password: 'Enter your password' }
    return
  }
  try {
    isSubmitting.value = true

    const { error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    })

    if (error) {
      SignInError.value = error.message
      return
    }

    await router.replace({ name: 'home' })
  } catch (error) {
    SignInError.value = error instanceof Error ? error.message : 'Authentication error'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="container">
    <form class="form" @submit.prevent="onSubmit">
      <h3 class="plate">PLATE.</h3>
      <h3 class="title">WELCOME <span>BACK.</span></h3>
      <p class="subtitle">Your table is waiting.</p>
      <Input
        v-model="email"
        label="EMAIL ADDRESS"
        type="email"
        placeholder="alex@example.com"
        :error="errors.email ?? ''"
      >
        <template #icon>
          <Mail />
        </template>
      </Input>
      <Input
        v-model="password"
        label="PASSWORD"
        type="password"
        placeholder="password"
        :error="errors.password ?? ''"
      />
      <Button
        class="submit"
        variant="primary"
        type="submit"
        :disabled="isSubmitting"
        :aria-busy="isSubmitting"
      >
        <LoaderCircle v-if="isSubmitting" class="submit__spinner" :size="14" aria-hidden="true" />
        {{ isSubmitting ? 'SIGNING IN…' : 'SIGN IN →' }}
      </Button>
      <div class="footer">
        <p>DON'T HAVE AN ACCOUNT?</p>
        <RouterLink to="/sign-up">SIGN UP</RouterLink>
      </div>
      <span v-if="SignInError" class="error" role="alert">{{ SignInError }}</span>
    </form>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px clamp(32px, 5vw, 96px);
}
.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  max-width: 430px;
}
.plate {
  font-size: 25px;
  font-weight: var(--font__extra-bold);
  letter-spacing: -1px;
}
.title {
  font-size: 48px;
  font-weight: var(--font__extra-bold);
  letter-spacing: -2.2px;
}

.subtitle {
  display: none;
}

.submit__spinner {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.footer {
  display: flex;
  gap: 8px;
  color: var(--color__muted);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.6px;
}

.error {
  font-size: 12px;
  color: var(--color__danger);
}

@media (max-width: 1279px) {
  .container {
    display: block;
    min-height: 100svh;
    margin-left: 0;
    padding: 44px 44px 64px;
  }

  .form {
    width: 100%;
    max-width: 960px;
    margin-inline: auto;
  }

  .plate {
    align-self: center;
    margin-bottom: 56px;
    line-height: 1.2;
  }

  .title {
    line-height: 0.92;
  }

  .title span {
    display: block;
  }

  .subtitle {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--color__muted);
  }

  .submit {
    min-height: 54px;
  }

  .submit:disabled {
    opacity: 1;
    color: var(--color__muted);
    background-color: var(--bg__skeleton);
  }

  .footer {
    flex-wrap: wrap;
    color: var(--color__primary);
  }
}

@media (max-width: 767px) {
  .container {
    padding: 36px 20px 48px;
  }

  .plate {
    align-self: flex-start;
    margin-bottom: 64px;
    font-size: 22px;
  }

  .title {
    font-size: 44px;
    letter-spacing: -2px;
  }

  .footer {
    gap: 6px;
    font-size: 10px;
    letter-spacing: 0.3px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .submit__spinner {
    animation: none;
  }
}
</style>
