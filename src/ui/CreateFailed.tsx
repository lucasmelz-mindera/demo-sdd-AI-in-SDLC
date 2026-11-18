import type { RoomSnapshot } from '../net/protocol'
import styles from './CreateFailed.module.css'
import { StatusBanner } from './StatusBanner'

interface Props {
  snapshot: RoomSnapshot
  onRetry: () => void
  onHome: () => void
}

/** Shown on the home URL: the room never got an ID, so there is no room page to send the creator to. */
export function CreateFailed({ snapshot, onRetry, onHome }: Props) {
  return (
    <>
      <StatusBanner snapshot={snapshot} />
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onRetry}>
          Try again
        </button>
        <button type="button" className={styles.secondary} onClick={onHome}>
          Back to home
        </button>
      </div>
    </>
  )
}
