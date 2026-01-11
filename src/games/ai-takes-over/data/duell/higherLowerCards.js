/**
 * Higher Lower Cards
 * Cards/items for the Higher Lower game with popularity/search volume data
 */

export const HIGHER_LOWER_ITEMS = [
  { id: 'taylor-swift', name: 'Taylor Swift', category: 'celebrity', searchVolume: 22200000, image: 'taylor-swift.jpg' },
  { id: 'elon-musk', name: 'Elon Musk', category: 'celebrity', searchVolume: 18100000, image: 'elon-musk.jpg' },
  { id: 'pizza', name: 'Pizza', category: 'food', searchVolume: 13600000, image: 'pizza.jpg' },
  { id: 'bitcoin', name: 'Bitcoin', category: 'crypto', searchVolume: 11100000, image: 'bitcoin.jpg' },
  { id: 'netflix', name: 'Netflix', category: 'entertainment', searchVolume: 9900000, image: 'netflix.jpg' },
  { id: 'iphone', name: 'iPhone', category: 'tech', searchVolume: 9100000, image: 'iphone.jpg' },
  { id: 'yoga', name: 'Yoga', category: 'lifestyle', searchVolume: 7500000, image: 'yoga.jpg' },
  { id: 'burger', name: 'Burger', category: 'food', searchVolume: 6800000, image: 'burger.jpg' },
  { id: 'minecraft', name: 'Minecraft', category: 'gaming', searchVolume: 6100000, image: 'minecraft.jpg' },
  { id: 'sushi', name: 'Sushi', category: 'food', searchVolume: 5500000, image: 'sushi.jpg' },
  { id: 'meditation', name: 'Meditation', category: 'lifestyle', searchVolume: 4500000, image: 'meditation.jpg' },
  { id: 'pasta', name: 'Pasta', category: 'food', searchVolume: 4100000, image: 'pasta.jpg' },
  { id: 'fortnite', name: 'Fortnite', category: 'gaming', searchVolume: 3700000, image: 'fortnite.jpg' },
  { id: 'coffee', name: 'Coffee', category: 'food', searchVolume: 3300000, image: 'coffee.jpg' },
  { id: 'tesla', name: 'Tesla', category: 'car', searchVolume: 3000000, image: 'tesla.jpg' },
  { id: 'tiktok', name: 'TikTok', category: 'social', searchVolume: 2800000, image: 'tiktok.jpg' },
  { id: 'roblox', name: 'Roblox', category: 'gaming', searchVolume: 2500000, image: 'roblox.jpg' },
  { id: 'chocolate', name: 'Chocolate', category: 'food', searchVolume: 2200000, image: 'chocolate.jpg' },
  { id: 'spotify', name: 'Spotify', category: 'entertainment', searchVolume: 2000000, image: 'spotify.jpg' },
  { id: 'salad', name: 'Salat', category: 'food', searchVolume: 1800000, image: 'salad.jpg' },
  { id: 'pilates', name: 'Pilates', category: 'lifestyle', searchVolume: 1500000, image: 'pilates.jpg' },
  { id: 'tacos', name: 'Tacos', category: 'food', searchVolume: 1350000, image: 'tacos.jpg' },
  { id: 'running', name: 'Running', category: 'sport', searchVolume: 1200000, image: 'running.jpg' },
  { id: 'ice-cream', name: 'Eis', category: 'food', searchVolume: 1100000, image: 'ice-cream.jpg' },
  { id: 'chess', name: 'Schach', category: 'gaming', searchVolume: 1000000, image: 'chess.jpg' },
  { id: 'vegan', name: 'Vegan', category: 'lifestyle', searchVolume: 900000, image: 'vegan.jpg' },
  { id: 'crossfit', name: 'CrossFit', category: 'sport', searchVolume: 800000, image: 'crossfit.jpg' },
  { id: 'curry', name: 'Curry', category: 'food', searchVolume: 700000, image: 'curry.jpg' },
  { id: 'gardening', name: 'Gardening', category: 'lifestyle', searchVolume: 600000, image: 'gardening.jpg' },
  { id: 'origami', name: 'Origami', category: 'hobby', searchVolume: 500000, image: 'origami.jpg' }
]

/**
 * Generate a sequence of cards for a game
 * @param {number} count - Number of cards
 * @returns {Array} Card sequence
 */
export const generateHigherLowerSequence = (count = 10) => {
  const shuffled = [...HIGHER_LOWER_ITEMS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Format search volume for display
 * @param {number} volume - Search volume
 * @returns {string} Formatted string
 */
export const formatSearchVolume = (volume) => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(0)}K`
  }
  return volume.toString()
}

export default {
  HIGHER_LOWER_ITEMS,
  generateHigherLowerSequence,
  formatSearchVolume
}
