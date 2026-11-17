import { useAuth } from '@/modules/auth'
import { supabase } from '@/lib/supabase.ts'
import { resolveAvatarUrl } from '../api'

export type Profile = {
  id: string
  name: string | null
  avatar_url: string | null
  created_at: string | null
}

export const useProfile = async (userId?: string): Promise<Profile | null> => {
  const id = userId ?? (await useAuth()).userId
  if (!id) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, created_at, avatar_url')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    id: data.id,
    name: data.display_name,
    created_at: data.created_at,
    avatar_url: await resolveAvatarUrl(id, data.avatar_url),
  }
}
