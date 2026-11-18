import { isGameId } from '../games/registry'
import type { GameId, PlayerIndex } from '../games/types'
import type { Profile } from '../profile/profile'

// Every message is plain JSON. Game states and moves are opaque here: the game definition owns their shape.
export type Message =
  // guest -> host
  | { type: 'hello'; name: string; emoji: string }
  | { type: 'move'; move: unknown }
  // host -> guest
  | { type: 'welcome'; you: PlayerIndex; players: [Profile, Profile]; gameId: GameId; state: unknown }
  | { type: 'state'; state: unknown }
  | { type: 'room-full' }
  // both
  | { type: 'rematch' }
  | { type: 'ping' }

export type RoomStatus =
  | 'creating'
  | 'waiting'
  | 'connecting'
  | 'playing'
  | 'host-left'
  | 'not-found'
  | 'cant-connect'
  | 'room-full'
  | 'create-failed'

/** What host.ts and guest.ts emit to the UI. Seats are indexed by PlayerIndex; an empty seat is null. */
export interface RoomSnapshot {
  status: RoomStatus
  roomId?: string
  you: PlayerIndex
  players: [Profile | null, Profile | null]
  gameId?: GameId
  state?: unknown
}

type Fields = Record<string, unknown>

const isObject = (x: unknown): x is Fields => typeof x === 'object' && x !== null

const isProfile = (x: unknown): x is Profile =>
  isObject(x) && typeof x.name === 'string' && typeof x.emoji === 'string'

const isPlayerIndex = (x: unknown): x is PlayerIndex => x === 0 || x === 1

const validators: Record<Message['type'], (m: Fields) => boolean> = {
  hello: (m) => isProfile(m),
  move: (m) => 'move' in m,
  welcome: (m) =>
    isPlayerIndex(m.you) &&
    Array.isArray(m.players) &&
    m.players.length === 2 &&
    m.players.every(isProfile) &&
    isGameId(m.gameId) &&
    'state' in m,
  state: (m) => 'state' in m,
  'room-full': () => true,
  rematch: () => true,
  ping: () => true,
}

export function isMessage(x: unknown): x is Message {
  return isObject(x) && typeof x.type === 'string' && Object.hasOwn(validators, x.type)
    && validators[x.type as Message['type']](x)
}
