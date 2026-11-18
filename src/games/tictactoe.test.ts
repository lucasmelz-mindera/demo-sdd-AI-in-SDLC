import { describe, expect, it } from 'vitest'
import { tictactoe } from './tictactoe'

describe('tictactoe', () => {
  it.each([0, 1] as const)('initialState(%i) is an empty board with that player first', (first) => {
    const state = tictactoe.initialState(first)
    expect(state.board).toEqual(Array(9).fill(null))
    expect(tictactoe.currentPlayer(state)).toBe(first)
    expect(tictactoe.getResult(state)).toBeNull()
  })
})
