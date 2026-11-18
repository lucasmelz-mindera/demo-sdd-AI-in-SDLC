import { tictactoe, type TicTacToeMove, type TicTacToeState } from '../../games/tictactoe'
import { playerMarks } from './marks'
import styles from './TicTacToeBoard.module.css'
import type { BoardProps } from './types'

export function TicTacToeBoard({ state, canMove, onMove }: BoardProps<TicTacToeState, TicTacToeMove>) {
  const result = tictactoe.getResult(state)
  const winningLine = result && 'winner' in result ? (result.line ?? []) : []

  return (
    <div className={styles.board} aria-label="Tic-tac-toe board">
      {state.board.map((mark, cell) => (
        <button
          key={cell}
          type="button"
          className={winningLine.includes(cell) ? `${styles.cell} ${styles.winning}` : styles.cell}
          disabled={!canMove || mark !== null}
          aria-label={`Square ${cell + 1}${mark === null ? '' : `, ${playerMarks.tictactoe[mark]}`}`}
          onClick={() => onMove({ cell })}
        >
          {mark === null ? '' : playerMarks.tictactoe[mark]}
        </button>
      ))}
    </div>
  )
}
