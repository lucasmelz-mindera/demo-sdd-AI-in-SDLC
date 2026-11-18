import type { ComponentType } from 'react'
import type { GameId } from '../../games/types'
import { TicTacToeBoard } from './TicTacToeBoard'
import type { BoardProps } from './types'

// oxlint-disable-next-line typescript/no-explicit-any -- each board has its own state and move types
type AnyBoard = ComponentType<BoardProps<any, any>>

/** The board for each playable game. Checkers adds its own here. */
export const boards: Partial<Record<GameId, AnyBoard>> = {
  tictactoe: TicTacToeBoard,
}
