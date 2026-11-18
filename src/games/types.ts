export type PlayerIndex = 0 | 1

export type GameId = 'tictactoe' | 'checkers'

export type GameResult = null | { winner: PlayerIndex; line?: number[] } | { draw: true }

export interface GameDefinition<S, M> {
  id: GameId
  name: string
  initialState(firstPlayer: PlayerIndex): S
  isValidMove(state: S, move: M, player: PlayerIndex): boolean
  applyMove(state: S, move: M): S
  currentPlayer(state: S): PlayerIndex
  getResult(state: S): GameResult
}

export interface ComingSoonGame {
  id: GameId
  name: string
  comingSoon: true
}
