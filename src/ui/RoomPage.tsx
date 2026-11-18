import { useEffect, useRef, useState, type ReactNode } from 'react'
import { games, isPlayable } from '../games/registry'
import { joinRoom, type GuestRoom as GuestRoomHandle } from '../net/guest'
import type { RoomSnapshot, RoomStatus } from '../net/protocol'
import { saveProfile, type Profile } from '../profile/profile'
import { goHome } from '../routing/useHashRoute'
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
  onHostRematch?: () => void
}

export function RoomPage({ roomId, hostSnapshot, onHostMove, onHostRematch }: Props) {
  const [guestProfile, setGuestProfile] = useState<Profile | null>(null)

  if (hostSnapshot) {
    return (
      <RoomView snapshot={hostSnapshot} onMove={onHostMove} onRematch={onHostRematch}>
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

  return (
    snapshot && (
      <RoomView
        snapshot={snapshot}
        onMove={(move) => room.current?.move(move)}
        onRematch={() => room.current?.rematch()}
      />
    )
  )
}

/** Statuses the room never leaves: the only way on is back home. */
const TERMINAL: RoomStatus[] = ['host-left', 'not-found', 'cant-connect', 'room-full', 'create-failed']
/** Terminal statuses reached without ever sitting at the table, so there are no players to show. */
const NEVER_SEATED: RoomStatus[] = ['not-found', 'cant-connect', 'room-full', 'create-failed']

interface RoomViewProps {
  snapshot: RoomSnapshot
  onMove?: (move: unknown) => void
  onRematch?: () => void
  children?: ReactNode
}

function RoomView({ snapshot, onMove, onRematch, children }: RoomViewProps) {
  return (
    <>
      <StatusBanner snapshot={snapshot} />
      {!NEVER_SEATED.includes(snapshot.status) && (
        <PlayerBar players={snapshot.players} you={snapshot.you} gameId={snapshot.gameId} />
      )}
      {snapshot.status === 'playing' && <Board snapshot={snapshot} onMove={onMove} />}
      {onRematch && hasResult(snapshot) && (
        <button type="button" className={styles.action} onClick={onRematch}>
          Rematch
        </button>
      )}
      {children}
      {TERMINAL.includes(snapshot.status) && (
        <button type="button" className={styles.action} onClick={goHome}>
          Back to home
        </button>
      )}
    </>
  )
}

function hasResult({ status, gameId, state }: RoomSnapshot): boolean {
  const game = gameId && games[gameId]
  return status === 'playing' && !!game && isPlayable(game) && state !== undefined && game.getResult(state) !== null
}

function Board({ snapshot, onMove }: { snapshot: RoomSnapshot; onMove?: (move: unknown) => void }) {
  const { gameId, state, you } = snapshot
  const game = gameId && games[gameId]
  const BoardComponent = gameId && boards[gameId]
  if (!game || !isPlayable(game) || !BoardComponent || state === undefined) return null

  const canMove = !!onMove && game.getResult(state) === null && game.currentPlayer(state) === you
  return <BoardComponent state={state} you={you} canMove={canMove} onMove={(move) => onMove?.(move)} />
}
