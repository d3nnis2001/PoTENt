/**
 * Bildertitel - Image Data
 * Mock data for development - replace with real images later
 */

// Import all bildertitel images from assets
const importBildertitelImages = () => {
  const images = []
  const modules = import.meta.glob('@/assets/games/ai-takes-over/bildertitel/*.{png,jpg,jpeg,webp}', { eager: true })
  const sortedKeys = Object.keys(modules).sort()
  sortedKeys.forEach((key, index) => {
    const img = modules[key].default || modules[key]
    images.push({
      id: `img-${index + 1}`,
      src: img,
      // Optional: add categories or tags later
    })
  })
  return images
}

// Fallback mock images using placeholder service
const mockImages = [
  { id: 'mock-1', src: 'https://picsum.photos/seed/bob1/800/600', mock: true },
  { id: 'mock-2', src: 'https://picsum.photos/seed/bob2/800/600', mock: true },
  { id: 'mock-3', src: 'https://picsum.photos/seed/bob3/800/600', mock: true },
  { id: 'mock-4', src: 'https://picsum.photos/seed/bob4/800/600', mock: true },
  { id: 'mock-5', src: 'https://picsum.photos/seed/bob5/800/600', mock: true },
  { id: 'mock-6', src: 'https://picsum.photos/seed/bob6/800/600', mock: true },
  { id: 'mock-7', src: 'https://picsum.photos/seed/bob7/800/600', mock: true },
  { id: 'mock-8', src: 'https://picsum.photos/seed/bob8/800/600', mock: true },
  { id: 'mock-9', src: 'https://picsum.photos/seed/bob9/800/600', mock: true },
  { id: 'mock-10', src: 'https://picsum.photos/seed/bob10/800/600', mock: true },
  { id: 'mock-11', src: 'https://picsum.photos/seed/bob11/800/600', mock: true },
  { id: 'mock-12', src: 'https://picsum.photos/seed/bob12/800/600', mock: true },
]

export const getBildertitelImages = () => {
  const assetImages = importBildertitelImages()
  // Use asset images if available, otherwise use mock
  return assetImages.length > 0 ? assetImages : mockImages
}

/**
 * Get images for a round based on player count
 * Distributes players across 2-4 images depending on count
 *
 * @param {number} playerCount - Number of players
 * @param {number} roundIndex - Which round (0, 1, 2, 3)
 * @returns {Array} Array of image objects for this round
 */
export const getImagesForRound = (playerCount, roundIndex, allImages) => {
  // Determine number of images based on player count
  let imageCount
  if (playerCount <= 5) imageCount = 2
  else if (playerCount <= 9) imageCount = 3
  else if (playerCount <= 12) imageCount = 4
  else imageCount = 5

  // Offset to get different images each round
  const startIndex = (roundIndex * imageCount) % allImages.length
  const images = []

  for (let i = 0; i < imageCount; i++) {
    const index = (startIndex + i) % allImages.length
    images.push(allImages[index])
  }

  return images
}

/**
 * Assign players to images for a round
 * Distributes players as evenly as possible
 *
 * @param {Array} players - Array of player objects
 * @param {Array} images - Array of image objects for this round
 * @returns {Object} { imageId: [playerId, playerId, ...], ... }
 */
export const assignPlayersToImages = (players, images) => {
  const assignments = {}
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5)

  // Initialize empty arrays for each image
  images.forEach(img => {
    assignments[img.id] = []
  })

  // Distribute players round-robin style
  shuffledPlayers.forEach((player, index) => {
    const imageIndex = index % images.length
    const imageId = images[imageIndex].id
    assignments[imageId].push(player.id)
  })

  return assignments
}

export default {
  getBildertitelImages,
  getImagesForRound,
  assignPlayersToImages
}
