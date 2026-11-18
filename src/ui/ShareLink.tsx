import { useEffect, useState } from 'react'
import { shareUrl } from '../routing/shareUrl'
import styles from './ShareLink.module.css'

export function ShareLink({ roomId }: { roomId: string }) {
  const url = shareUrl(roomId)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = () => {
    navigator.clipboard.writeText(url).then(
      () => setCopied(true),
      () => {}, // Clipboard blocked: the URL is still shown below to copy by hand.
    )
  }

  return (
    <div className={styles.share}>
      <button type="button" className={styles.copy} onClick={copy}>
        {copied ? 'Copied!' : 'Copy link'}
      </button>
      <input
        className={styles.url}
        readOnly
        value={url}
        aria-label="Room link"
        onFocus={(e) => e.currentTarget.select()}
      />
    </div>
  )
}
