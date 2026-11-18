export function shareUrl(id: string): string {
  return `${window.location.origin}${window.location.pathname}#/room/${encodeURIComponent(id)}`
}
