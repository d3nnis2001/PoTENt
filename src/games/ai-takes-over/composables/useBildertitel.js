import { ref, computed } from 'vue'
import { getBildertitelImages, getImagesForRound, assignPlayersToImages } from '../data/bildertitelImages'

/**
 * Composable for Bildertitel discipline game logic
 */
export function useBildertitel() {
  // Game configuration
  const TOTAL_ROUNDS = 3
  const TITLE_TIME_LIMIT = 60 // seconds
  const VOTE_TIME_LIMIT = 30 // seconds per image

  // State
  const allImages = ref(getBildertitelImages())
  const currentRound = ref(0)
  const phase = ref('waiting') // waiting, writing, reveal, voting, results
  const roundImages = ref([])
  const playerAssignments = ref({}) // { imageId: [playerIds] }
  const submissions = ref({}) // { playerId: { imageId, title } }
  const votes = ref({}) // { visibleImageId: { voterId: titleOwnerId } }
  const scores = ref({}) // { playerId: points }
  const currentRevealIndex = ref(0)
  const timeRemaining = ref(0)

  // Timer
  let timerInterval = null

  // Computed
  const currentImage = computed(() => {
    if (phase.value === 'reveal' || phase.value === 'voting') {
      return roundImages.value[currentRevealIndex.value]
    }
    return null
  })

  const titlesForCurrentImage = computed(() => {
    if (!currentImage.value) return []
    const imageId = currentImage.value.id
    const playerIds = playerAssignments.value[imageId] || []

    return playerIds
      .filter(playerId => submissions.value[playerId])
      .map(playerId => ({
        playerId,
        title: submissions.value[playerId].title,
        votes: countVotesForPlayer(playerId)
      }))
  })

  const submissionCount = computed(() => Object.keys(submissions.value).length)

  const allSubmitted = computed(() => {
    const totalPlayers = Object.values(playerAssignments.value).flat().length
    return submissionCount.value >= totalPlayers
  })

  // Methods
  const initializeRound = (players) => {
    const images = getImagesForRound(players.length, currentRound.value, allImages.value)
    roundImages.value = images
    playerAssignments.value = assignPlayersToImages(players, images)
    submissions.value = {}
    votes.value = {}
    currentRevealIndex.value = 0
    phase.value = 'writing'
    startTimer(TITLE_TIME_LIMIT)
  }

  const submitTitle = (playerId, title) => {
    // Find which image this player was assigned
    let assignedImageId = null
    for (const [imageId, playerIds] of Object.entries(playerAssignments.value)) {
      if (playerIds.includes(playerId)) {
        assignedImageId = imageId
        break
      }
    }

    if (assignedImageId) {
      submissions.value[playerId] = {
        imageId: assignedImageId,
        title: title.trim()
      }
    }

    return allSubmitted.value
  }

  const startReveal = () => {
    stopTimer()
    phase.value = 'reveal'
    currentRevealIndex.value = 0
  }

  const showNextImage = () => {
    if (currentRevealIndex.value < roundImages.value.length - 1) {
      currentRevealIndex.value++
      return true
    }
    return false
  }

  const startVoting = () => {
    phase.value = 'voting'
    votes.value[currentImage.value.id] = {}
    startTimer(VOTE_TIME_LIMIT)
  }

  const submitVote = (voterId, titleOwnerId, imageId) => {
    // Players can't vote on their own title
    const voterAssignment = Object.entries(playerAssignments.value)
      .find(([, playerIds]) => playerIds.includes(voterId))

    if (voterAssignment && voterAssignment[0] === imageId) {
      return false // Can't vote on image you wrote title for
    }

    if (!votes.value[imageId]) {
      votes.value[imageId] = {}
    }
    votes.value[imageId][voterId] = titleOwnerId
    return true
  }

  const countVotesForPlayer = (playerId) => {
    let voteCount = 0
    for (const imageVotes of Object.values(votes.value)) {
      for (const votedFor of Object.values(imageVotes)) {
        if (votedFor === playerId) voteCount++
      }
    }
    return voteCount
  }

  const calculateRoundScores = () => {
    // Each vote = 1 point
    for (const [playerId] of Object.entries(submissions.value)) {
      const voteCount = countVotesForPlayer(playerId)
      if (!scores.value[playerId]) {
        scores.value[playerId] = 0
      }
      scores.value[playerId] += voteCount
    }
  }

  const finishImageVoting = () => {
    stopTimer()

    // Move to next image or finish round
    if (currentRevealIndex.value < roundImages.value.length - 1) {
      currentRevealIndex.value++
      phase.value = 'reveal'
    } else {
      calculateRoundScores()
      phase.value = 'results'
    }
  }

  const nextRound = () => {
    if (currentRound.value < TOTAL_ROUNDS - 1) {
      currentRound.value++
      return true
    }
    return false // Game finished
  }

  const startTimer = (seconds) => {
    stopTimer()
    timeRemaining.value = seconds
    timerInterval = setInterval(() => {
      timeRemaining.value--
      if (timeRemaining.value <= 0) {
        stopTimer()
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  const getPlayerImage = (playerId) => {
    for (const [imageId, playerIds] of Object.entries(playerAssignments.value)) {
      if (playerIds.includes(playerId)) {
        return roundImages.value.find(img => img.id === imageId)
      }
    }
    return null
  }

  const canPlayerVote = (playerId, imageId) => {
    // Check if player was assigned to this image (they can't vote on their own)
    const assignedPlayers = playerAssignments.value[imageId] || []
    return !assignedPlayers.includes(playerId)
  }

  const reset = () => {
    currentRound.value = 0
    phase.value = 'waiting'
    roundImages.value = []
    playerAssignments.value = {}
    submissions.value = {}
    votes.value = {}
    scores.value = {}
    currentRevealIndex.value = 0
    timeRemaining.value = 0
    stopTimer()
  }

  return {
    // Config
    TOTAL_ROUNDS,
    TITLE_TIME_LIMIT,
    VOTE_TIME_LIMIT,

    // State
    allImages,
    currentRound,
    phase,
    roundImages,
    playerAssignments,
    submissions,
    votes,
    scores,
    currentRevealIndex,
    timeRemaining,

    // Computed
    currentImage,
    titlesForCurrentImage,
    submissionCount,
    allSubmitted,

    // Methods
    initializeRound,
    submitTitle,
    startReveal,
    showNextImage,
    startVoting,
    submitVote,
    countVotesForPlayer,
    finishImageVoting,
    nextRound,
    getPlayerImage,
    canPlayerVote,
    reset
  }
}
