import { tictactoe } from './tictactoe'
import type { ComingSoonGame, GameDefinition, GameId } from './types'

// oxlint-disable-next-line typescript/no-explicit-any -- each entry has its own state and move types
export type AnyGameDefinition = GameDefinition<any, any>

export const games: Record<GameId, AnyGameDefinition | ComingSoonGame> = {
  tictactoe,
  checkers: { id: 'checkers', name: 'Checkers', comingSoon: true },
}

export function isPlayable(game: AnyGameDefinition | ComingSoonGame): game is AnyGameDefinition {
  return !('comingSoon' in game)
}

export function isGameId(x: unknown): x is GameId {
  return typeof x === 'string' && Object.hasOwn(games, x)
}
