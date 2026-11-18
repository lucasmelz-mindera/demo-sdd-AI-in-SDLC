import type { GameId } from '../../games/types'

/** How each seat's pieces look, indexed by PlayerIndex. The host is seat 0. */
export const playerMarks: Record<GameId, [string, string]> = {
  tictactoe: ['❌', '⭕'],
  checkers: ['🔴', '⚫'],
}
