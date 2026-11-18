import { Peer, type DataConnection } from 'peerjs'
import { games, isPlayable } from '../games/registry'
import type { GameId, PlayerIndex } from '../games/types'
import { EMOJIS, normalizeName, type Profile } from '../profile/profile'
import { keepBrokerAlive, watchConnection } from './liveness'
import { isMessage, type Message, type RoomSnapshot } from './protocol'
import { newRoomId } from './roomId'

export interface HostRoom {
  move(move: unknown): void
  rematch(): void
  destroy(): void
}

export function createHostRoom(
  { gameId, profile }: { gameId: GameId; profile: Profile },
  onEvent: (snapshot: RoomSnapshot) => void,
): HostRoom {
  const game = games[gameId]
  if (!isPlayable(game)) throw new Error(`${gameId} is not playable yet`)

  // Who moves first this round. It flips on every rematch; a new guest starts over with the host first.
  let firstPlayer: PlayerIndex = 0
  const roomId = newRoomId()
  const peer = new Peer(roomId)
  keepBrokerAlive(peer)
  let snapshot: RoomSnapshot = {
    status: 'creating',
    you: 0,
    players: [profile, null],
    gameId,
    state: game.initialState(0),
  }
  let guest: DataConnection | null = null
  let stopWatching = () => {}

  const emit = (patch: Partial<RoomSnapshot>) => {
    snapshot = { ...snapshot, ...patch }
    onEvent(snapshot)
  }

  const send = (conn: DataConnection, message: Message) => {
    void conn.send(message)
  }

  // Every move, the host's own included, goes through here: validate, apply, broadcast the full state.
  const tryMove = (move: unknown, player: PlayerIndex) => {
    if (snapshot.status !== 'playing' || !game.isValidMove(snapshot.state, move, player)) return
    const state = game.applyMove(snapshot.state, move)
    if (guest) send(guest, { type: 'state', state })
    emit({ state })
  }

  // Either player can start the next round, but only once this one has a result.
  const rematch = () => {
    if (snapshot.status !== 'playing' || game.getResult(snapshot.state) === null) return
    firstPlayer = firstPlayer === 0 ? 1 : 0
    const state = game.initialState(firstPlayer)
    if (guest) send(guest, { type: 'state', state })
    emit({ state })
  }

  peer.on('open', () => emit({ status: 'waiting', roomId }))

  peer.on('connection', (conn) => {
    // A second visitor is turned away in "Room error states" (#12); for now they are ignored.
    if (guest) return
    guest = conn
    conn.on('open', () => {
      stopWatching = watchConnection(conn, () => onGuestLeft(conn))
    })
    // Covers a connection that fails before it opens, so the seat isn't held forever.
    conn.on('close', () => onGuestLeft(conn))
    conn.on('error', () => onGuestLeft(conn))
    conn.on('data', (data) => {
      if (!isMessage(data) || conn !== guest) return
      if (data.type === 'hello' && snapshot.status === 'waiting') {
        const guestProfile = {
          name: normalizeName(data.name),
          emoji: EMOJIS.includes(data.emoji) ? data.emoji : EMOJIS[0],
        }
        const players: [Profile, Profile] = [profile, guestProfile]
        send(conn, { type: 'welcome', you: 1, players, gameId, state: snapshot.state })
        emit({ status: 'playing', players })
      } else if (data.type === 'move') {
        tryMove(data.move, 1)
      } else if (data.type === 'rematch') {
        rematch()
      }
    })
  })

  // The seat opens again and the next guest starts a fresh game.
  const onGuestLeft = (conn: DataConnection) => {
    if (conn !== guest) return
    guest = null
    firstPlayer = 0
    emit({ status: 'waiting', players: [profile, null], state: game.initialState(0) })
  }

  // Never call onEvent synchronously, so the caller can hold the returned room before its first snapshot.
  queueMicrotask(() => {
    if (!peer.destroyed) emit({})
  })

  return {
    move: (move) => tryMove(move, 0),
    rematch,
    destroy: () => {
      stopWatching()
      peer.destroy()
    },
  }
}
