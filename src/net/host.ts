import { Peer, type DataConnection } from 'peerjs'
import { games, isPlayable } from '../games/registry'
import type { GameId } from '../games/types'
import { EMOJIS, normalizeName, type Profile } from '../profile/profile'
import { isMessage, type Message, type RoomSnapshot } from './protocol'
import { newRoomId } from './roomId'

export interface HostRoom {
  destroy(): void
}

export function createHostRoom(
  { gameId, profile }: { gameId: GameId; profile: Profile },
  onEvent: (snapshot: RoomSnapshot) => void,
): HostRoom {
  const game = games[gameId]
  if (!isPlayable(game)) throw new Error(`${gameId} is not playable yet`)

  const roomId = newRoomId()
  const peer = new Peer(roomId)
  let snapshot: RoomSnapshot = {
    status: 'creating',
    you: 0,
    players: [profile, null],
    gameId,
    state: game.initialState(0),
  }
  let guest: DataConnection | null = null

  const emit = (patch: Partial<RoomSnapshot>) => {
    snapshot = { ...snapshot, ...patch }
    onEvent(snapshot)
  }

  const send = (conn: DataConnection, message: Message) => {
    void conn.send(message)
  }

  peer.on('open', () => emit({ status: 'waiting', roomId }))

  peer.on('connection', (conn) => {
    // A second visitor is turned away in "Room error states" (#12); for now they are ignored.
    if (guest) return
    guest = conn
    conn.on('data', (data) => {
      if (!isMessage(data)) return
      if (data.type === 'hello' && snapshot.status === 'waiting') {
        const guestProfile = {
          name: normalizeName(data.name),
          emoji: EMOJIS.includes(data.emoji) ? data.emoji : EMOJIS[0],
        }
        const players: [Profile, Profile] = [profile, guestProfile]
        send(conn, { type: 'welcome', you: 1, players, gameId, state: snapshot.state })
        emit({ status: 'playing', players })
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
