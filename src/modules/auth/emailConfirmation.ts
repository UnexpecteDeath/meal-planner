import { initialAuthUrl, supabase } from '@/lib/supabase'

export type EmailConfirmation = {
  status: 'success' | 'pending' | 'error' | 'info'
  message: string
}

const errorKeys = ['error', 'error_code', 'error_description']
const firstConfirmation = 'Confirmation link accepted.'
const emailChangeKey = (userId: string) => `plate:pending-email:${userId}`

export function rememberRequestedEmail(userId: string, email: string) {
  try {
    if (email) window.localStorage.setItem(emailChangeKey(userId), email.toLowerCase())
    else window.localStorage.removeItem(emailChangeKey(userId))
  } catch {
    // Email confirmation still works if the browser blocks local storage.
  }
}

function getRequestedEmail(userId: string) {
  try {
    return window.localStorage.getItem(emailChangeKey(userId))
  } catch {
    return null
  }
}

async function getEmailChangeConfirmation(
  codeExchanged: boolean,
): Promise<EmailConfirmation | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user?.email) {
    return codeExchanged
      ? {
          status: 'error',
          message: 'Could not read your current email. Reopen your profile to check it.',
        }
      : null
  }

  const requestedEmail = getRequestedEmail(user.id)
  if (requestedEmail === user.email.toLowerCase() && !user.new_email) {
    rememberRequestedEmail(user.id, '')
    return { status: 'success', message: 'Your sign-in email was updated.' }
  }

  if (!codeExchanged) return null

  if (user.new_email) {
    return {
      status: 'pending',
      message: 'The email change is still pending. Check both inboxes for confirmation links.',
    }
  }

  if (requestedEmail) {
    return {
      status: 'error',
      message:
        'Your sign-in email has not changed. Check that the link is for your latest email change.',
    }
  }

  return { status: 'info', message: `Current sign-in email: ${user.email}.` }
}

export async function getEmailConfirmation(): Promise<EmailConfirmation | null> {
  const query = initialAuthUrl.searchParams
  const fragment = new URLSearchParams(initialAuthUrl.hash.slice(1))
  const fragmentError = errorKeys.some((key) => fragment.has(key))
  const hasError = fragmentError || errorKeys.some((key) => query.has(key))
  const firstLinkInQuery = query.get('message')?.startsWith(firstConfirmation)
  const firstLinkInFragment = fragment.get('message')?.startsWith(firstConfirmation)
  const waitingForSecondLink = firstLinkInQuery || firstLinkInFragment
  const hasCode = query.has('code')
  if (!hasError && !waitingForSecondLink && !hasCode) return null

  try {
    let codeExchanged = false
    if (hasCode && !hasError && !waitingForSecondLink) {
      // The browser client exchanges the code and saves the session in cookies.
      const { error } = await supabase.auth.initialize()
      codeExchanged = !error && !new URL(window.location.href).searchParams.has('code')
    }

    if (/\/profile\/edit\/?$/.test(initialAuthUrl.pathname)) {
      const confirmation = await getEmailChangeConfirmation(codeExchanged)
      if (confirmation) return confirmation
    }

    if (hasError) {
      const errorCode = query.get('error_code') ?? fragment.get('error_code')
      return {
        status: 'error',
        message:
          errorCode === 'otp_expired' || errorCode === 'flow_state_expired'
            ? 'This confirmation link expired or was already used. Request a new link if needed.'
            : 'The confirmation link could not be verified. Please try a new link.',
      }
    }

    if (waitingForSecondLink) {
      return {
        status: 'pending',
        message: 'One address is confirmed. Open the link sent to the other email address.',
      }
    }

    if (!codeExchanged) {
      return {
        status: 'error',
        message:
          'Could not finish signing in. Use the browser that requested the link or try signing in again.',
      }
    }

    return { status: 'success', message: 'Your email address is confirmed.' }
  } catch {
    return {
      status: 'error',
      message: 'Could not finish email confirmation. Try signing in again.',
    }
  } finally {
    const url = new URL(window.location.href)
    for (const key of ['code', 'sb_flow_id', ...errorKeys]) url.searchParams.delete(key)

    if (firstLinkInQuery) url.searchParams.delete('message')
    if (fragmentError || firstLinkInFragment) url.hash = ''

    if (url.href !== window.location.href) {
      window.history.replaceState(window.history.state, '', url)
    }
  }
}
