import { ref, onUnmounted } from 'vue'

/**
 * Composable to track used character indexes in a lobby
 * Useful for character selection to show which characters are taken
 */
export function useCharacterListener() {
  const usedCharacters = ref([])
  let playersListener = null

  const setupListener = async (lobbyCode) => {
    try {
      const { ref: dbRef, onValue, get } = await import('firebase/database')
      const { realtimeDb } = await import('@/firebase/config')

      // First check if lobby exists
      const lobbyRef = dbRef(realtimeDb, `lobbies/${lobbyCode}`)
      const snapshot = await get(lobbyRef)

      if (!snapshot.exists()) {
        throw new Error('Lobby nicht gefunden')
      }

      // Setup listener for player changes
      const playersRef = dbRef(realtimeDb, `lobbies/${lobbyCode}/players`)

      playersListener = onValue(playersRef, (snapshot) => {
        const usedIndexes = []

        if (snapshot.exists()) {
          const playersData = snapshot.val()
          Object.values(playersData).forEach(player => {
            if (player.isOnline && player.iconIndex !== undefined) {
              usedIndexes.push(player.iconIndex)
            }
          })
        }

        usedCharacters.value = usedIndexes
      })

      return true
    } catch (error) {
      throw error
    }
  }

  const cleanup = () => {
    if (playersListener) {
      playersListener()
      playersListener = null
    }
  }

  onUnmounted(cleanup)

  return {
    usedCharacters,
    setupListener,
    cleanup
  }
}
