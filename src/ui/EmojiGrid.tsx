import { EMOJIS } from '../profile/profile'
import styles from './EmojiGrid.module.css'

interface Props {
  value: string
  onChange: (emoji: string) => void
}

export function EmojiGrid({ value, onChange }: Props) {
  return (
    <div className={styles.grid} role="radiogroup" aria-label="Avatar">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          role="radio"
          aria-checked={emoji === value}
          className={styles.cell}
          onClick={() => onChange(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
