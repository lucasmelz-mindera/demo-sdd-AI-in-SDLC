import { describe, expect, it } from 'vitest'
import { tictactoe } from './tictactoe'
import type { PlayerIndex } from './types'

/** Plays the cells in order, alternating from `first`, through the public interface. */
function play(cells: number[], first: PlayerIndex = 0) {
  return cells.reduce((state, cell) => tictactoe.applyMove(state, { cell }), tictactoe.initialState(first))
}

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

/** Moves that give `winner` the `line`, with the loser's moves kept off it and off any other line. */
function winOn(line: number[], winner: PlayerIndex) {
  const loserCells = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((c) => !line.includes(c))
  const moves: number[] = []
  // The winner moves first, so the loser plays one fewer cell than the winner.
  line.forEach((cell, i) => {
    moves.push(cell)
    if (i < 2) moves.push(loserCells[i])
  })
  return play(moves, winner)
}

describe('tictactoe', () => {
  describe('initialState', () => {
    it.each([0, 1] as const)('initialState(%i) is an empty board with that player first', (first) => {
      const state = tictactoe.initialState(first)
      expect(state.board).toEqual(Array(9).fill(null))
      expect(tictactoe.currentPlayer(state)).toBe(first)
      expect(tictactoe.getResult(state)).toBeNull()
    })
  })

  describe('isValidMove', () => {
    it('accepts an empty in-range cell on your turn', () => {
      expect(tictactoe.isValidMove(tictactoe.initialState(0), { cell: 4 }, 0)).toBe(true)
      expect(tictactoe.isValidMove(tictactoe.initialState(1), { cell: 0 }, 1)).toBe(true)
    })

    it('rejects a move out of turn', () => {
      expect(tictactoe.isValidMove(tictactoe.initialState(0), { cell: 4 }, 1)).toBe(false)
      expect(tictactoe.isValidMove(play([4]), { cell: 0 }, 0)).toBe(false)
    })

    it('rejects an occupied cell', () => {
      expect(tictactoe.isValidMove(play([4]), { cell: 4 }, 1)).toBe(false)
    })

    it.each([-1, 9, 1.5, NaN])('rejects out-of-range cell %s', (cell) => {
      expect(tictactoe.isValidMove(tictactoe.initialState(0), { cell }, 0)).toBe(false)
    })

    it('rejects a malformed move', () => {
      const state = tictactoe.initialState(0)
      expect(tictactoe.isValidMove(state, { cell: '4' } as never, 0)).toBe(false)
      expect(tictactoe.isValidMove(state, null as never, 0)).toBe(false)
    })

    it('rejects any move after a win', () => {
      const won = winOn([0, 1, 2], 0)
      expect(tictactoe.getResult(won)).not.toBeNull()
      for (let cell = 0; cell < 9; cell++) {
        expect(tictactoe.isValidMove(won, { cell }, 0)).toBe(false)
        expect(tictactoe.isValidMove(won, { cell }, 1)).toBe(false)
      }
    })

    it('rejects any move after a draw', () => {
      const drawn = play([0, 1, 2, 4, 3, 5, 7, 6, 8])
      expect(tictactoe.getResult(drawn)).toEqual({ draw: true })
      expect(tictactoe.isValidMove(drawn, { cell: 0 }, 0)).toBe(false)
      expect(tictactoe.isValidMove(drawn, { cell: 0 }, 1)).toBe(false)
    })
  })

  describe('applyMove', () => {
    it('places the current player\'s mark and flips the turn', () => {
      const afterX = tictactoe.applyMove(tictactoe.initialState(0), { cell: 4 })
      expect(afterX.board[4]).toBe(0)
      expect(tictactoe.currentPlayer(afterX)).toBe(1)

      const afterO = tictactoe.applyMove(afterX, { cell: 0 })
      expect(afterO.board[0]).toBe(1)
      expect(afterO.board[4]).toBe(0)
      expect(tictactoe.currentPlayer(afterO)).toBe(0)
    })

    it('places O first when player 1 starts', () => {
      const state = tictactoe.applyMove(tictactoe.initialState(1), { cell: 8 })
      expect(state.board[8]).toBe(1)
      expect(tictactoe.currentPlayer(state)).toBe(0)
    })

    it('does not mutate its input', () => {
      const before = play([4, 0])
      const snapshot = structuredClone(before)
      const after = tictactoe.applyMove(before, { cell: 8 })
      expect(before).toEqual(snapshot)
      expect(after).not.toBe(before)
      expect(after.board).not.toBe(before.board)
    })
  })

  describe('getResult', () => {
    it('is null mid-game', () => {
      expect(tictactoe.getResult(play([4, 0, 8]))).toBeNull()
    })

    it.each(LINES.flatMap((line) => ([0, 1] as const).map((winner) => [line, winner] as const)))(
      'finds line %j for player %i',
      (line, winner) => {
        expect(tictactoe.getResult(winOn(line, winner))).toEqual({ winner, line })
      },
    )

    it('finds a full-board draw', () => {
      // X O X / X O O / O X X
      expect(tictactoe.getResult(play([0, 1, 2, 4, 3, 5, 7, 6, 8]))).toEqual({ draw: true })
    })

    it('reports a win on the last cell, not a draw', () => {
      // X O X / O X O / O X X: the ninth move completes 0-4-8.
      expect(tictactoe.getResult(play([0, 1, 2, 3, 4, 5, 7, 6, 8]))).toEqual({ winner: 0, line: [0, 4, 8] })
    })
  })
})
