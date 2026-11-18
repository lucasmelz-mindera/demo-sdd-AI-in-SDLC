import type { PlayerIndex } from '../../games/types'

/** What every board component gets. It renders `state` and reports clicks; the host decides what is legal. */
export interface BoardProps<S, M> {
  state: S
  you: PlayerIndex
  canMove: boolean
  onMove(move: M): void
}
