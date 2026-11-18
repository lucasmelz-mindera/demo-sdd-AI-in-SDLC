import { useEffect, useRef, useState, type ReactNode } from 'react'
import { games, isPlayable } from '../games/registry'
import { joinRoom, type GuestRoom as GuestRoomHandle } from '../net/guest'
import type { RoomSnapshot } from '../net/protocol'
import { saveProfile, type Profile } from '../profile/profile'
import { boards } from './games/boards'
import { ProfileForm } from './ProfileForm'
import { PlayerBar } from './PlayerBar'
import styles from './RoomPage.module.css'
import { ShareLink } from './ShareLink'
import { StatusBanner } from './StatusBanner'

interface Props {
  roomId: string
  /** Set when this tab created the room. Without it this tab is a guest. */
  hostSnapshot?: RoomSnapshot
  onHostMove?: (move: unknown) => void
}

export function RoomPage({ roomId, hostSnapshot, onHostMove }: Props) {
  const [guestProfile, setGuestProfile] = useState<Profile | null>(null)

  if (hostSnapshot) {
    return (
      <RoomView snapshot={hostSnapshot} onMove={onHostMove}>
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
  const room = useRef<GuestRoomHandle | null>(null)

  useEffect(() => {
    const joined = joinRoom(roomId, profile, setSnapshot)
    room.current = joined
    return () => joined.destroy()
  }, [roomId, profile])

  return snapshot && <RoomView snapshot={snapshot} onMove={(move) => room.current?.move(move)} />
}

interface RoomViewProps {
  snapshot: RoomSnapshot
  onMove?: (move: unknown) => void
  children?: ReactNode
}

function RoomView({ snapshot, onMove, children }: RoomViewProps) {
  return (
    <>
      <StatusBanner snapshot={snapshot} />
      <PlayerBar players={snapshot.players} you={snapshot.you} gameId={snapshot.gameId} />
      {snapshot.status === 'playing' && <Board snapshot={snapshot} onMove={onMove} />}
      {children}
    </>
  )
}

function Board({ snapshot, onMove }: { snapshot: RoomSnapshot; onMove?: (move: unknown) => void }) {
  const { gameId, state, you } = snapshot
  const game = gameId && games[gameId]
  const BoardComponent = gameId && boards[gameId]
  if (!game || !isPlayable(game) || !BoardComponent || state === undefined) return null

  const canMove = !!onMove && game.getResult(state) === null && game.currentPlayer(state) === you
  return <BoardComponent state={state} you={you} canMove={canMove} onMove={(move) => onMove?.(move)} />
}
