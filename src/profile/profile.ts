export interface Profile {
  name: string
  emoji: string
}

export const EMOJIS = [
  '😀', '😎', '🤓', '🥳',
  '🤖', '👻', '👽', '🎃',
  '🐱', '🐶', '🦊', '🐼',
  '🐸', '🦄', '🐙', '🦖',
]

const STORAGE_KEY = 'p2p-games:profile'
const MAX_NAME_LENGTH = 20

export function normalizeName(raw: string): string {
  // Cap by code points so an emoji in the name is never cut in half.
  const capped = Array.from(raw.trim()).slice(0, MAX_NAME_LENGTH).join('').trim()
  return capped || 'Player'
}

export function loadProfile(): Profile {
  const fallback = { name: '', emoji: EMOJIS[0] }
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (typeof stored !== 'object' || stored === null) return fallback
    const { name, emoji } = stored as Record<string, unknown>
    return {
      name: typeof name === 'string' ? name : fallback.name,
      emoji: typeof emoji === 'string' && EMOJIS.includes(emoji) ? emoji : fallback.emoji,
    }
  } catch {
    return fallback
  }
}

export function saveProfile(profile: Profile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch {
    // Storage blocked (private mode, quota): the profile just isn't remembered.
  }
}
