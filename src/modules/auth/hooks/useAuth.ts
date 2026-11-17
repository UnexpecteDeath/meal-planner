import { supabase } from '@/lib/supabase.ts'

export const useAuth = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error

  return {
    userId: user?.id,
  }
}
