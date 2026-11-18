import type { GameId, PlayerIndex } from '../games/types'
import type { Profile } from '../profile/profile'
import { playerMarks } from './games/marks'
import styles from './PlayerBar.module.css'

interface Props {
  players: [Profile | null, Profile | null]
  you: PlayerIndex
  gameId?: GameId
}

export function PlayerBar({ players, you, gameId }: Props) {
  return (
    <ul className={styles.bar}>
      {players.map((player, seat) => (
        <li key={seat} className={styles.player}>
          <span className={styles.emoji}>{player?.emoji ?? '…'}</span>
          <span className={styles.name}>{player?.name ?? 'Waiting…'}</span>
          {seat === you && <span className={styles.you}>(you)</span>}
          {gameId && <span className={styles.mark}>{playerMarks[gameId][seat]}</span>}
        </li>
      ))}
    </ul>
  )
}
