import { describe, expect, it } from 'vitest'
import { normalizeName } from './profile'

describe('normalizeName', () => {
  it('trims whitespace', () => {
    expect(normalizeName('  Ana  ')).toBe('Ana')
  })

  it('caps the name at 20 characters', () => {
    expect(normalizeName('abcdefghijklmnopqrstuvwxyz')).toBe('abcdefghijklmnopqrst')
  })

  it('does not split an emoji when capping', () => {
    expect(normalizeName('😀'.repeat(25))).toBe('😀'.repeat(20))
  })

  it('turns an empty or blank name into "Player"', () => {
    expect(normalizeName('')).toBe('Player')
    expect(normalizeName('   ')).toBe('Player')
  })
})
