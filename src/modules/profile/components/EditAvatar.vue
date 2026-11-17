<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, useId } from 'vue'
import { Button } from '@/shared'
import { avatarTypes, maxAvatarSize, saveAvatar } from '../api'
import { getErrorMessage } from '../getErrorMessage'

const { userId, initialAvatarUrl, hasProfile } = defineProps<{
  userId: string
  initialAvatarUrl: string | null
  hasProfile: boolean
}>()

const inputId = useId()
const maxSizeMb = maxAvatarSize / (1024 * 1024)
const avatarUrl = ref(initialAvatarUrl)
const previewUrl = ref<string | null>(null)
const avatarFile = shallowRef<File | null>(null)
const avatarInput = ref<HTMLInputElement | null>(null)
const displayedAvatar = computed(() => previewUrl.value ?? avatarUrl.value)
const isSaving = ref(false)
const error = ref('')
const message = ref('')

function clearSelection() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = null
  avatarFile.value = null
}

onBeforeUnmount(clearSelection)

function selectAvatar(event: Event) {
  const input = event.currentTarget as HTMLInputElement
  const file = input.files?.[0]
  clearSelection()
  error.value = ''
  message.value = ''
  if (!file) return

  if (!avatarTypes.includes(file.type) || !file.size || file.size > maxAvatarSize) {
    input.value = ''
    error.value = `Choose a JPG, PNG or WebP image up to ${maxSizeMb} MB.`
    return
  }

  avatarFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

async function updateAvatar() {
  const file = avatarFile.value
  if (isSaving.value || !file || !hasProfile) return

  isSaving.value = true
  error.value = ''
  message.value = ''

  try {
    avatarUrl.value = await saveAvatar(userId, file)
    clearSelection()
    if (avatarInput.value) avatarInput.value.value = ''
    message.value = 'Avatar saved.'
  } catch (cause) {
    error.value = getErrorMessage(cause, 'Could not save your changes.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <form class="section" :aria-busy="isSaving" @submit.prevent="updateAvatar">
    <h2><span>02</span> AVATAR</h2>
    <div class="avatar-field">
      <img v-if="displayedAvatar" class="avatar" :src="displayedAvatar" alt="Avatar preview" />
      <div v-else class="avatar" aria-hidden="true">PLATE.</div>
      <div class="file-field">
        <label :for="inputId">PROFILE PHOTO</label>
        <input
          :id="inputId"
          ref="avatarInput"
          type="file"
          :accept="avatarTypes.join(',')"
          :disabled="isSaving || !hasProfile"
          :aria-describedby="`${inputId}-hint`"
          @change="selectAvatar"
        />
        <p :id="`${inputId}-hint`" class="hint">
          {{
            hasProfile
              ? `JPG, PNG or WebP. Up to ${maxSizeMb} MB.`
              : 'Save your display name first.'
          }}
        </p>
      </div>
    </div>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-if="message" class="message" role="status">{{ message }}</p>
    <Button class="action" type="submit" :disabled="isSaving || !hasProfile || !avatarFile">
      {{ isSaving ? 'UPLOADING…' : 'SAVE AVATAR' }}
    </Button>
  </form>
</template>

<style scoped>
.avatar-field {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  display: grid;
  place-items: center;
  flex: none;
  width: 76px;
  height: 76px;
  object-fit: cover;
  background-color: var(--bg__secondary);
  color: var(--color__secondary);
  font-size: 14px;
  font-weight: var(--font__extra-bold);
}

.file-field {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.file-field label {
  color: var(--color__muted);
  font-size: 11px;
  font-weight: var(--font__bold);
  letter-spacing: 0.1em;
}

.file-field input {
  width: 100%;
  min-width: 0;
  font-size: 12px;
}

.file-field input:focus-visible {
  outline: 2px solid var(--color__primary);
  outline-offset: 4px;
}

.file-field input::file-selector-button {
  margin-inline-end: 8px;
  padding: 8px;
  border: 1px solid var(--bg__secondary);
  background-color: var(--color__secondary);
  color: var(--color__primary);
  font: inherit;
}

@media (max-width: 767px) {
  .avatar {
    width: 60px;
    height: 60px;
  }
}
</style>
