import { describe, expect, it } from 'vitest'
import { newRoomId } from './roomId'

describe('newRoomId', () => {
  it('returns 10 characters from [a-z0-9]', () => {
    for (let i = 0; i < 100; i++) expect(newRoomId()).toMatch(/^[a-z0-9]{10}$/)
  })

  it('returns a different id each time', () => {
    const ids = new Set(Array.from({ length: 100 }, newRoomId))
    expect(ids.size).toBe(100)
  })
})
