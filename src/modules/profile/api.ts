import { supabase } from '@/lib/supabase'

const avatarBucket = 'images'

export const avatarTypes = ['image/jpeg', 'image/png', 'image/webp']
export const maxAvatarSize = 5 * 1024 * 1024

function avatarPath(userId: string) {
  return `avatars/${userId}/avatar`
}

export async function resolveAvatarUrl(userId: string, value: string | null) {
  if (value !== avatarPath(userId)) return value

  const { data } = await supabase.storage.from(avatarBucket).createSignedUrl(value, 3600)
  return data?.signedUrl ?? null
}

export async function saveDisplayName(userId: string, name: string) {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: name,
    })
    .eq('id', userId)
    .select('id, display_name')
    .single()

  if (error) throw error
}

export async function saveAvatar(userId: string, file: File) {
  const path = avatarPath(userId)
  const { error: uploadError } = await supabase.storage.from(avatarBucket).upload(path, file, {
    cacheControl: '0',
    contentType: file.type,
    upsert: true,
  })

  if (uploadError) {
    throw new Error(`Could not upload the avatar to Storage. ${uploadError.message}`, {
      cause: uploadError,
    })
  }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: path })
    .eq('id', userId)
    .select('id')
    .single()

  if (error) {
    throw new Error(`Could not save the avatar path to your profile. ${error.message}`, {
      cause: error,
    })
  }

  return resolveAvatarUrl(userId, path)
}
