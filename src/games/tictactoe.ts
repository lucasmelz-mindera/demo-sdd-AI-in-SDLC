import type { GameDefinition, GameResult, PlayerIndex } from './types'

export interface TicTacToeState {
  board: (PlayerIndex | null)[]
  next: PlayerIndex
}

export interface TicTacToeMove {
  cell: number
}

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

function getResult({ board }: TicTacToeState): GameResult {
  for (const line of LINES) {
    const [a, b, c] = line
    const mark = board[a]
    if (mark !== null && mark === board[b] && mark === board[c]) return { winner: mark, line }
  }
  return board.every((cell) => cell !== null) ? { draw: true } : null
}

export const tictactoe: GameDefinition<TicTacToeState, TicTacToeMove> = {
  id: 'tictactoe',
  name: 'Tic-tac-toe',
  initialState: (firstPlayer) => ({ board: Array(9).fill(null), next: firstPlayer }),
  isValidMove: (state, move, player) =>
    typeof move?.cell === 'number' &&
    Number.isInteger(move.cell) &&
    move.cell >= 0 &&
    move.cell < 9 &&
    player === state.next &&
    state.board[move.cell] === null &&
    getResult(state) === null,
  applyMove: (state, { cell }) => ({
    board: state.board.map((mark, i) => (i === cell ? state.next : mark)),
    next: state.next === 0 ? 1 : 0,
  }),
  currentPlayer: (state) => state.next,
  getResult,
}
