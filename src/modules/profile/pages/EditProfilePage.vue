<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import Button from '@/shared/Button.vue'
import EditAvatar from '../components/EditAvatar.vue'
import EditEmail from '../components/EditEmail.vue'
import EditName from '../components/EditName.vue'
import EditPassword from '../components/EditPassword.vue'
import { getErrorMessage } from '../getErrorMessage'
import { useProfile } from '../hooks/useProfile'

type Account = {
  userId: string
  name: string
  avatarUrl: string | null
  email: string
  pendingEmail: string
}

const router = useRouter()
const account = ref<Account | null>(null)
const hasProfile = ref(false)
const isLoading = ref(true)
const loadError = ref('')
const isSigningOut = ref(false)
const signOutError = ref('')

onMounted(async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) throw error
    if (!user) throw new Error('Sign in again to edit your profile.')

    const profile = await useProfile(user.id)
    const fullName: unknown = user.user_metadata.full_name

    hasProfile.value = Boolean(profile)
    account.value = {
      userId: user.id,
      name: profile?.name ?? (typeof fullName === 'string' ? fullName : ''),
      avatarUrl: profile?.avatar_url ?? null,
      email: user.email ?? '',
      pendingEmail: user.new_email ?? '',
    }
  } catch (error) {
    loadError.value = getErrorMessage(error, 'Could not load your account.')
  } finally {
    isLoading.value = false
  }
})

async function signOut() {
  if (isSigningOut.value) return

  isSigningOut.value = true
  signOutError.value = ''

  try {
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) throw error

    await router.replace({ name: 'sign-in' })
  } catch (error) {
    signOutError.value = getErrorMessage(error, 'Could not sign out. Please try again.')
  } finally {
    isSigningOut.value = false
  }
}
</script>

<template>
  <main class="profile-edit">
    <div class="heading">
      <RouterLink class="back-link" :to="{ name: 'profile' }">← BACK TO PROFILE</RouterLink>
      <h1 class="title">EDIT <span>PROFILE.</span></h1>
      <p class="hint">Manage your account details.</p>
    </div>

    <p v-if="isLoading" class="hint" role="status">Loading your account…</p>
    <p v-else-if="loadError" class="error" role="alert">{{ loadError }}</p>

    <div v-else-if="account" class="sections">
      <EditName :user-id="account.userId" :initial-name="account.name" @saved="hasProfile = true" />
      <EditAvatar
        :user-id="account.userId"
        :initial-avatar-url="account.avatarUrl"
        :has-profile="hasProfile"
      />
      <EditEmail
        :user-id="account.userId"
        :initial-email="account.email"
        :initial-pending-email="account.pendingEmail"
      />
      <EditPassword />
    </div>

    <div class="sign-out">
      <Button class="sign-out-button" variant="danger" :disabled="isSigningOut" @click="signOut">
        {{ isSigningOut ? 'SIGNING OUT…' : 'SIGN OUT' }}
      </Button>
      <p v-if="signOutError" class="error" role="alert">{{ signOutError }}</p>
    </div>
  </main>
</template>

<style scoped>
.profile-edit {
  padding-bottom: 48px;
  color: var(--color__primary);
}

.heading {
  display: grid;
  justify-items: start;
  gap: 16px;
  padding-block: 36px 44px;
  border-top: 1px solid var(--bg__skeleton);
}

.back-link {
  font-size: 11px;
  font-weight: var(--font__bold);
  letter-spacing: 0.1em;
}

.back-link:focus-visible {
  outline: 2px solid var(--color__primary);
  outline-offset: 4px;
}

.title {
  font-size: 78px;
  font-weight: var(--font__extra-bold);
  line-height: 0.92;
  letter-spacing: -3.5px;
}

.sections {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 48px;
  align-items: start;
}

.sections :deep(.section) {
  display: grid;
  gap: 16px;
  min-width: 0;
  padding-block: 28px 32px;
  border-top: 1px solid var(--bg__skeleton);
}

.sections :deep(.section h2) {
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 16px;
  font-weight: var(--font__extra-bold);
  letter-spacing: 0.06em;
}

.sections :deep(.section h2 span) {
  color: var(--color__muted);
  font-size: 12px;
  font-weight: var(--font__bold);
}

.hint,
.error,
.sections :deep(:is(.hint, .error, .message)) {
  overflow-wrap: anywhere;
  font-size: 14px;
  line-height: 1.4;
}

.hint,
.sections :deep(.hint) {
  color: var(--color__muted);
}

.error,
.sections :deep(.error) {
  color: var(--color__danger);
}

.sections :deep(.message) {
  padding: 10px 12px;
  background-color: var(--accent__muted);
}

.sign-out {
  display: grid;
  gap: 12px;
  padding-top: 28px;
  border-top: 1px solid var(--bg__skeleton);
}

.sign-out-button,
.sections :deep(.section .action) {
  justify-self: start;
  min-height: 48px;
}

@media (max-width: 1279px) {
  .title {
    font-size: 56px;
    letter-spacing: -2.5px;
  }

  .title span {
    display: block;
  }

  .sections {
    grid-template-columns: minmax(0, 1fr);
  }

  .sign-out-button,
  .sections :deep(.section .action) {
    width: 100%;
  }
}

@media (max-width: 767px) {
  .heading {
    gap: 12px;
    padding-block: 26px 30px;
  }

  .title {
    font-size: 44px;
    letter-spacing: -2px;
  }

  .sections :deep(.section) {
    gap: 14px;
    padding-block: 22px 26px;
  }
}
</style>
