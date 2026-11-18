import type { RoomStatus } from '../net/protocol'
import styles from './StatusBanner.module.css'

const MESSAGES: Partial<Record<RoomStatus, string>> = {
  creating: 'Creating room…',
  waiting: 'Waiting for opponent…',
  connecting: 'Connecting…',
}

export function StatusBanner({ status }: { status: RoomStatus }) {
  const message = MESSAGES[status]
  if (!message) return null
  return (
    <p className={styles.banner} role="status">
      {message}
    </p>
  )
}
