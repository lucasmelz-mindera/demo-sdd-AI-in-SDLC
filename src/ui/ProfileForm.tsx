import { useState, type FormEvent, type ReactNode } from 'react'
import { loadProfile, normalizeName, type Profile } from '../profile/profile'
import { EmojiGrid } from './EmojiGrid'
import styles from './ProfileForm.module.css'

interface Props {
  submitLabel: string
  busy?: boolean
  disabled?: boolean
  onSubmit: (profile: Profile) => void
  /** Rendered between the profile fields and the submit button. */
  children?: ReactNode
}

/** Name and emoji, pre-filled from the saved profile. Used to create a room (home) and to join one (room page). */
export function ProfileForm({ submitLabel, busy, disabled, onSubmit, children }: Props) {
  const [initial] = useState(loadProfile)
  const [name, setName] = useState(initial.name)
  const [emoji, setEmoji] = useState(initial.emoji)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({ name: normalizeName(name), emoji })
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.field}>
        <span className={styles.label}>Your name</span>
        <input
          className={styles.input}
          value={name}
          maxLength={20}
          placeholder="Player"
          autoComplete="nickname"
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <div className={styles.field}>
        <span className={styles.label}>Your avatar</span>
        <EmojiGrid value={emoji} onChange={setEmoji} />
      </div>
      {children}
      <button className={styles.submit} type="submit" disabled={busy || disabled}>
        {busy ? 'Please wait…' : submitLabel}
      </button>
    </form>
  )
}
