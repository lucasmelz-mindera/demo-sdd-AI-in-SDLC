import { useEffect, useState } from 'react'
import type { GameId } from './games/types'
import { createHostRoom, type HostRoom } from './net/host'
import type { RoomSnapshot } from './net/protocol'
import { saveProfile, type Profile } from './profile/profile'
import { goToRoom, useHashRoute } from './routing/useHashRoute'
import styles from './App.module.css'
import { CreateFailed } from './ui/CreateFailed'
import { HomePage } from './ui/HomePage'
import { RoomPage } from './ui/RoomPage'

interface HostSession {
  room: HostRoom
  snapshot: RoomSnapshot
}

export default function App() {
  const route = useHashRoute()
  // The host session lives here, not in the room page: a tab that opens a room URL without one is a guest.
  const [host, setHost] = useState<HostSession | null>(null)

  const createRoom = (gameId: GameId, profile: Profile) => {
    saveProfile(profile)
    let navigated = false
    const room = createHostRoom({ gameId, profile }, (snapshot) => {
      setHost({ room, snapshot })
      if (snapshot.roomId && !navigated) {
        navigated = true
        goToRoom(snapshot.roomId)
      }
    })
  }

  // Leaving the hosted room (back to home, or to another room) ends it.
  const hostedId = host?.snapshot.roomId
  const leftHostedRoom = hostedId !== undefined && !(route.name === 'room' && route.id === hostedId)
  if (leftHostedRoom) setHost(null)

  const snapshot = host?.snapshot
  const retryCreate = () => {
    const profile = snapshot?.players[0]
    if (snapshot?.gameId && profile) createRoom(snapshot.gameId, profile)
  }

  const hostRoom = host?.room
  useEffect(() => () => hostRoom?.destroy(), [hostRoom])

  return (
    <main className={styles.app}>
      {route.name === 'room' ? (
        <RoomPage
          key={route.id}
          roomId={route.id}
          hostSnapshot={route.id === hostedId ? host?.snapshot : undefined}
          onHostMove={host?.room.move}
          onHostRematch={host?.room.rematch}
        />
      ) : snapshot?.status === 'create-failed' ? (
        <CreateFailed snapshot={snapshot} onRetry={retryCreate} onHome={() => setHost(null)} />
      ) : (
        <HomePage creating={host?.snapshot.status === 'creating'} onCreate={createRoom} />
      )}
    </main>
  )
}
