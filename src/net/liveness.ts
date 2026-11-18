import type { DataConnection, Peer } from 'peerjs'
import type { Message } from './protocol'

const PING_EVERY_MS = 2_000
const TIMEOUT_MS = 6_000

/**
 * Calls onLeft once when the other side of `conn` goes away. Detection is layered: the connection's
 * `close`/`error` events, a ping every 2 s with a 6 s timeout that any received message resets, and
 * `conn.close()` on `pagehide` so the other side hears about a closed tab straight away.
 * Returns a stop function that tears all of it down without calling onLeft.
 */
export function watchConnection(conn: DataConnection, onLeft: () => void): () => void {
  let stopped = false
  let timeout: ReturnType<typeof setTimeout> | undefined

  const resetTimeout = () => {
    clearTimeout(timeout)
    timeout = setTimeout(left, TIMEOUT_MS)
  }

  const ping: Message = { type: 'ping' }
  const interval = setInterval(() => void conn.send(ping), PING_EVERY_MS)

  const onPageHide = () => conn.close()

  const stop = () => {
    if (stopped) return
    stopped = true
    clearInterval(interval)
    clearTimeout(timeout)
    window.removeEventListener('pagehide', onPageHide)
    conn.off('data', resetTimeout)
    conn.off('close', left)
    conn.off('error', left)
  }

  function left() {
    if (stopped) return
    stop()
    conn.close()
    onLeft()
  }

  conn.on('data', resetTimeout)
  conn.on('close', left)
  conn.on('error', left)
  window.addEventListener('pagehide', onPageHide)
  resetTimeout()

  return stop
}

/** Reconnects to the broker whenever it drops. Open data connections carry on, so the user is not told. */
export function keepBrokerAlive(peer: Peer): void {
  peer.on('disconnected', () => {
    if (!peer.destroyed) peer.reconnect()
  })
}
