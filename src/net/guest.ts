import { Peer } from 'peerjs'
import type { Profile } from '../profile/profile'
import { isMessage, type Message, type RoomSnapshot } from './protocol'

export interface GuestRoom {
  destroy(): void
}

export function joinRoom(
  roomId: string,
  profile: Profile,
  onEvent: (snapshot: RoomSnapshot) => void,
): GuestRoom {
  const peer = new Peer()
  let snapshot: RoomSnapshot = { status: 'connecting', roomId, you: 1, players: [null, profile] }

  const emit = (patch: Partial<RoomSnapshot>) => {
    snapshot = { ...snapshot, ...patch }
    onEvent(snapshot)
  }

  peer.on('open', () => {
    const conn = peer.connect(roomId, { reliable: true, serialization: 'json' })
    conn.on('open', () => {
      const hello: Message = { type: 'hello', name: profile.name, emoji: profile.emoji }
      void conn.send(hello)
    })
    conn.on('data', (data) => {
      if (!isMessage(data)) return
      if (data.type === 'welcome') {
        emit({ status: 'playing', you: data.you, players: data.players, gameId: data.gameId, state: data.state })
      }
    })
  })

  // Never call onEvent synchronously, so the caller can hold the returned room before its first snapshot.
  queueMicrotask(() => {
    if (!peer.destroyed) emit({})
  })

  return {
    destroy: () => peer.destroy(),
  }
}
