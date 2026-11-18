import { Peer, PeerErrorType, type DataConnection } from 'peerjs'
import type { Profile } from '../profile/profile'
import { keepBrokerAlive, watchConnection } from './liveness'
import { isMessage, type Message, type RoomSnapshot, type RoomStatus } from './protocol'

/** No welcome, no error, nothing: give up on the room after this long. */
const CONNECT_TIMEOUT_MS = 10_000

export interface GuestRoom {
  /** Sends a move intent. The host decides whether it happens; the board only changes when its state arrives. */
  move(move: unknown): void
  /** Asks the host for the next round. The host ignores it while the game is still in progress. */
  rematch(): void
  destroy(): void
}

export function joinRoom(
  roomId: string,
  profile: Profile,
  onEvent: (snapshot: RoomSnapshot) => void,
): GuestRoom {
  const peer = new Peer()
  keepBrokerAlive(peer)
  let conn: DataConnection | null = null
  let snapshot: RoomSnapshot = { status: 'connecting', roomId, you: 1, players: [null, profile] }
  let stopWatching = () => {}

  const emit = (patch: Partial<RoomSnapshot>) => {
    snapshot = { ...snapshot, ...patch }
    onEvent(snapshot)
  }

  // Every way out of the room ends here, once. There is no reconnect, so the guest's peer goes too.
  const end = (status: Extract<RoomStatus, 'host-left' | 'not-found' | 'cant-connect' | 'room-full'>) => {
    if (peer.destroyed) return
    clearTimeout(timeout)
    stopWatching()
    peer.destroy()
    emit({ status })
  }
  const onHostLeft = () => end('host-left')

  const timeout = setTimeout(() => end('cant-connect'), CONNECT_TIMEOUT_MS)

  // Errors only end a room that is still connecting; once playing, broker trouble is left to keepBrokerAlive.
  peer.on('error', (err) => {
    if (snapshot.status !== 'connecting') return
    end(err.type === PeerErrorType.PeerUnavailable ? 'not-found' : 'cant-connect')
  })

  peer.on('open', () => {
    const c = peer.connect(roomId, { reliable: true, serialization: 'json' })
    conn = c
    c.on('open', () => {
      stopWatching = watchConnection(c, onHostLeft)
      const hello: Message = { type: 'hello', name: profile.name, emoji: profile.emoji }
      void c.send(hello)
    })
    c.on('data', (data) => {
      if (!isMessage(data)) return
      if (data.type === 'room-full') {
        end('room-full')
      } else if (data.type === 'welcome') {
        clearTimeout(timeout)
        emit({ status: 'playing', you: data.you, players: data.players, gameId: data.gameId, state: data.state })
      } else if (data.type === 'state' && snapshot.status === 'playing') {
        emit({ state: data.state })
      }
    })
  })

  // Never call onEvent synchronously, so the caller can hold the returned room before its first snapshot.
  queueMicrotask(() => {
    if (!peer.destroyed) emit({})
  })

  return {
    move: (move) => {
      if (conn?.open && snapshot.status === 'playing') {
        const intent: Message = { type: 'move', move }
        void conn.send(intent)
      }
    },
    rematch: () => {
      if (conn?.open && snapshot.status === 'playing') {
        const intent: Message = { type: 'rematch' }
        void conn.send(intent)
      }
    },
    destroy: () => {
      clearTimeout(timeout)
      stopWatching()
      peer.destroy()
    },
  }
}
