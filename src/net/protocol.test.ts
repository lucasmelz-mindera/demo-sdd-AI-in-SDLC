import { describe, expect, it } from 'vitest'
import { isMessage } from './protocol'

const profile = { name: 'Ana', emoji: '😀' }

describe('isMessage', () => {
  it.each([
    { type: 'hello', name: 'Ana', emoji: '😀' },
    { type: 'move', move: { cell: 4 } },
    { type: 'welcome', you: 1, players: [profile, profile], gameId: 'tictactoe', state: {} },
    { type: 'state', state: { board: [] } },
    { type: 'room-full' },
    { type: 'rematch' },
    { type: 'ping' },
  ])('accepts $type', (msg) => {
    expect(isMessage(msg)).toBe(true)
  })

  it.each([
    null,
    'hello',
    { type: 'unknown' },
    { type: 'hello', name: 'Ana' },
    { type: 'hello', name: 3, emoji: '😀' },
    { type: 'move' },
    { type: 'welcome', you: 2, players: [profile, profile], gameId: 'tictactoe', state: {} },
    { type: 'welcome', you: 1, players: [profile], gameId: 'tictactoe', state: {} },
    { type: 'welcome', you: 1, players: [profile, profile], gameId: 'chess', state: {} },
    { type: 'state' },
  ])('rejects %j', (msg) => {
    expect(isMessage(msg)).toBe(false)
  })
})
