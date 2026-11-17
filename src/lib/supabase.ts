import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local')
}

// The auth client removes the PKCE code from the URL after exchanging it.
export const initialAuthUrl = new URL(window.location.href)

export const supabase = createBrowserClient(supabaseUrl, supabasePublishableKey, {
  cookieOptions: {
    path: '/',
    sameSite: 'lax',
    secure: window.location.protocol === 'https:',
  },
})
