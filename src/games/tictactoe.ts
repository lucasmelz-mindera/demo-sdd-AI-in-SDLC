import type { GameDefinition, PlayerIndex } from './types'

export interface TicTacToeState {
  board: (PlayerIndex | null)[]
  next: PlayerIndex
}

export interface TicTacToeMove {
  cell: number
}

// Only the opening position for now: move validation, applying moves and
// results arrive with "Play a game of tic-tac-toe" (#9). Until then no move is valid.
export const tictactoe: GameDefinition<TicTacToeState, TicTacToeMove> = {
  id: 'tictactoe',
  name: 'Tic-tac-toe',
  initialState: (firstPlayer) => ({ board: Array(9).fill(null), next: firstPlayer }),
  isValidMove: () => false,
  applyMove: (state) => state,
  currentPlayer: (state) => state.next,
  getResult: () => null,
}
