import { games, isPlayable } from '../games/registry'
import type { RoomSnapshot, RoomStatus } from '../net/protocol'
import styles from './StatusBanner.module.css'

const MESSAGES: Partial<Record<RoomStatus, string>> = {
  creating: 'Creating room…',
  waiting: 'Waiting for opponent…',
  connecting: 'Connecting…',
  'host-left': 'Host left the room',
  'not-found': 'Room not found',
  'cant-connect': "Couldn't connect",
  'room-full': 'Room is full',
  'create-failed': "Couldn't create a room, try again",
}

/** While playing: whose turn it is, or the result, read from the state through the game definition. */
function playingMessage({ gameId, state, you, players }: RoomSnapshot): string | undefined {
  const game = gameId && games[gameId]
  if (!game || !isPlayable(game) || state === undefined) return undefined
  const result = game.getResult(state)
  if (result && 'draw' in result) return 'Draw'
  if (result) return result.winner === you ? 'You won' : 'You lost'
  const turn = game.currentPlayer(state)
  return turn === you ? 'Your turn' : `${players[turn]?.name ?? 'Opponent'}'s turn`
}

export function StatusBanner({ snapshot }: { snapshot: RoomSnapshot }) {
  const message = snapshot.status === 'playing' ? playingMessage(snapshot) : MESSAGES[snapshot.status]
  if (!message) return null
  return (
    <p className={styles.banner} role="status">
      {message}
    </p>
  )
}
