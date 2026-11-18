import { Peer, type DataConnection } from 'peerjs'
import type { Profile } from '../profile/profile'
import { isMessage, type Message, type RoomSnapshot } from './protocol'

export interface GuestRoom {
  /** Sends a move intent. The host decides whether it happens; the board only changes when its state arrives. */
  move(move: unknown): void
  destroy(): void
}

export function joinRoom(
  roomId: string,
  profile: Profile,
  onEvent: (snapshot: RoomSnapshot) => void,
): GuestRoom {
  const peer = new Peer()
  let conn: DataConnection | null = null
  let snapshot: RoomSnapshot = { status: 'connecting', roomId, you: 1, players: [null, profile] }

  const emit = (patch: Partial<RoomSnapshot>) => {
    snapshot = { ...snapshot, ...patch }
    onEvent(snapshot)
  }

  peer.on('open', () => {
    conn = peer.connect(roomId, { reliable: true, serialization: 'json' })
    conn.on('open', () => {
      const hello: Message = { type: 'hello', name: profile.name, emoji: profile.emoji }
      void conn?.send(hello)
    })
    conn.on('data', (data) => {
      if (!isMessage(data)) return
      if (data.type === 'welcome') {
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
    destroy: () => peer.destroy(),
  }
}
