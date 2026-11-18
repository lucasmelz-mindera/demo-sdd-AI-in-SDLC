import { useSyncExternalStore } from 'react'

export type Route = { name: 'home' } | { name: 'room'; id: string }

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

const getHash = () => window.location.hash

export function parseHash(hash: string): Route {
  const match = /^#\/room\/([^/]+)$/.exec(hash)
  if (!match) return { name: 'home' }
  try {
    return { name: 'room', id: decodeURIComponent(match[1]) }
  } catch {
    return { name: 'home' }
  }
}

export function useHashRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash)
  // Parse on every render is cheap; returning a new object is fine since callers compare fields, not identity.
  return parseHash(hash)
}

export function goToRoom(id: string): void {
  window.location.hash = `/room/${encodeURIComponent(id)}`
}

export function goHome(): void {
  window.location.hash = '/'
}
