import { useEffect, useState, type ReactNode } from 'react'
import { joinRoom } from '../net/guest'
import type { RoomSnapshot } from '../net/protocol'
import { saveProfile, type Profile } from '../profile/profile'
import { ProfileForm } from './ProfileForm'
import { PlayerBar } from './PlayerBar'
import styles from './RoomPage.module.css'
import { ShareLink } from './ShareLink'
import { StatusBanner } from './StatusBanner'

interface Props {
  roomId: string
  /** Set when this tab created the room. Without it this tab is a guest. */
  hostSnapshot?: RoomSnapshot
}

export function RoomPage({ roomId, hostSnapshot }: Props) {
  const [guestProfile, setGuestProfile] = useState<Profile | null>(null)

  if (hostSnapshot) {
    return (
      <RoomView snapshot={hostSnapshot}>
        <ShareLink roomId={roomId} />
      </RoomView>
    )
  }

  if (!guestProfile) {
    return (
      <>
        <header className={styles.header}>
          <h1>Join the room</h1>
          <p>Pick your name and avatar, then join your friend.</p>
        </header>
        <ProfileForm
          submitLabel="Join"
          onSubmit={(profile) => {
            saveProfile(profile)
            setGuestProfile(profile)
          }}
        />
      </>
    )
  }

  return <GuestRoom roomId={roomId} profile={guestProfile} />
}

function GuestRoom({ roomId, profile }: { roomId: string; profile: Profile }) {
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null)

  useEffect(() => {
    const room = joinRoom(roomId, profile, setSnapshot)
    return () => room.destroy()
  }, [roomId, profile])

  return snapshot && <RoomView snapshot={snapshot} />
}

function RoomView({ snapshot, children }: { snapshot: RoomSnapshot; children?: ReactNode }) {
  return (
    <>
      <StatusBanner status={snapshot.status} />
      <PlayerBar players={snapshot.players} you={snapshot.you} gameId={snapshot.gameId} />
      {children}
    </>
  )
}
