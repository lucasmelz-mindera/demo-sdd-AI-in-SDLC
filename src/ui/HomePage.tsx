import { useState } from 'react'
import { games, isPlayable } from '../games/registry'
import type { GameId } from '../games/types'
import type { Profile } from '../profile/profile'
import styles from './HomePage.module.css'
import { ProfileForm } from './ProfileForm'

interface Props {
  creating: boolean
  onCreate: (gameId: GameId, profile: Profile) => void
}

export function HomePage({ creating, onCreate }: Props) {
  const [gameId, setGameId] = useState<GameId>('tictactoe')

  return (
    <>
      <header className={styles.header}>
        <h1>Play with a friend</h1>
        <p>Pick a game, create a room and send the link. No sign-up, no install.</p>
      </header>
      <section className={styles.cards} role="radiogroup" aria-label="Game">
        {Object.values(games).map((game) => {
          const playable = isPlayable(game)
          return (
            <button
              key={game.id}
              type="button"
              role="radio"
              aria-checked={game.id === gameId}
              disabled={!playable}
              className={styles.card}
              onClick={() => setGameId(game.id)}
            >
              <span className={styles.cardName}>{game.name}</span>
              {!playable && <span className={styles.badge}>Coming soon</span>}
            </button>
          )
        })}
      </section>
      <ProfileForm
        submitLabel="Create room"
        busy={creating}
        onSubmit={(profile) => onCreate(gameId, profile)}
      />
    </>
  )
}
