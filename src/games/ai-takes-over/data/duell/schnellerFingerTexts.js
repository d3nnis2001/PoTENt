/**
 * Schneller Finger Texts
 * Texts for the typing speed duell
 */

export const SCHNELLER_FINGER_TEXTS = [
  // Short (5-10 words)
  { id: 'short-1', text: 'Die Katze sitzt auf dem Dach.', difficulty: 'short', wordCount: 6 },
  { id: 'short-2', text: 'Ich mag Pizza und Pasta.', difficulty: 'short', wordCount: 5 },
  { id: 'short-3', text: 'Der schnelle Fuchs springt hoch.', difficulty: 'short', wordCount: 5 },
  { id: 'short-4', text: 'Heute scheint die Sonne hell.', difficulty: 'short', wordCount: 5 },
  { id: 'short-5', text: 'Der Ball ist rund und bunt.', difficulty: 'short', wordCount: 6 },
  { id: 'short-6', text: 'Mein Hund heißt Bello.', difficulty: 'short', wordCount: 4 },
  { id: 'short-7', text: 'Die Blumen blühen im Garten.', difficulty: 'short', wordCount: 5 },
  { id: 'short-8', text: 'Kaffee macht mich wach.', difficulty: 'short', wordCount: 4 },

  // Medium (10-20 words)
  { id: 'medium-1', text: 'Der frühe Vogel fängt den Wurm, aber die zweite Maus bekommt den Käse.', difficulty: 'medium', wordCount: 14 },
  { id: 'medium-2', text: 'Programmieren ist wie Kochen: Man braucht die richtigen Zutaten und etwas Geduld.', difficulty: 'medium', wordCount: 12 },
  { id: 'medium-3', text: 'Im Weltraum kann dich niemand schreien hören, aber Tasten tippen schon.', difficulty: 'medium', wordCount: 12 },
  { id: 'medium-4', text: 'Künstliche Intelligenz wird die Welt verändern, aber Menschen bleiben wichtig.', difficulty: 'medium', wordCount: 10 },
  { id: 'medium-5', text: 'Der schnellste Weg zum Erfolg ist harte Arbeit und ein bisschen Glück.', difficulty: 'medium', wordCount: 12 },
  { id: 'medium-6', text: 'Videospiele sind nicht nur Zeitvertreib, sondern auch Kunst und Kultur.', difficulty: 'medium', wordCount: 10 },

  // Long (20+ words)
  { id: 'long-1', text: 'In einer Galaxie weit, weit entfernt lebte einst ein junger Programmierer, der davon träumte, die perfekte App zu erschaffen.', difficulty: 'long', wordCount: 20 },
  { id: 'long-2', text: 'Die beste Zeit, einen Baum zu pflanzen, war vor zwanzig Jahren. Die zweitbeste Zeit ist jetzt. Also fang an zu tippen!', difficulty: 'long', wordCount: 21 },

  // Tech-themed
  { id: 'tech-1', text: 'Hello World ist das erste Programm.', difficulty: 'short', wordCount: 6 },
  { id: 'tech-2', text: 'JavaScript ist überall: im Browser, auf dem Server und sogar auf Toastern.', difficulty: 'medium', wordCount: 12 },
  { id: 'tech-3', text: 'Die Cloud ist nur der Computer von jemand anderem.', difficulty: 'short', wordCount: 8 },

  // Funny
  { id: 'funny-1', text: 'Warum haben Programmierer keinen Rasen? Weil sie alle Bugs im Garten haben.', difficulty: 'medium', wordCount: 12 },
  { id: 'funny-2', text: 'Es gibt 10 Arten von Menschen: Die, die Binär verstehen, und die anderen.', difficulty: 'medium', wordCount: 13 },
  { id: 'funny-3', text: 'Ein Byte hat 8 Bits, aber ein guter Witz ist unbezahlbar.', difficulty: 'medium', wordCount: 11 }
]

/**
 * Get random text for a duell
 * @param {string} difficulty - 'short', 'medium', 'long', or 'random'
 * @returns {Object} Random text object
 */
export const getRandomTypingText = (difficulty = 'medium') => {
  let filtered = SCHNELLER_FINGER_TEXTS

  if (difficulty !== 'random') {
    filtered = SCHNELLER_FINGER_TEXTS.filter(t => t.difficulty === difficulty)
  }

  const index = Math.floor(Math.random() * filtered.length)
  return filtered[index]
}

/**
 * Calculate accuracy percentage
 * @param {string} typed - What was typed
 * @param {string} original - Original text
 * @returns {number} Accuracy 0-100
 */
export const calculateAccuracy = (typed, original) => {
  if (!typed || !original) return 0

  let correct = 0
  const minLength = Math.min(typed.length, original.length)

  for (let i = 0; i < minLength; i++) {
    if (typed[i] === original[i]) correct++
  }

  return Math.round((correct / original.length) * 100)
}

/**
 * Calculate words per minute
 * @param {string} text - Text that was typed
 * @param {number} timeMs - Time in milliseconds
 * @returns {number} WPM
 */
export const calculateWPM = (text, timeMs) => {
  if (!text || timeMs <= 0) return 0

  const words = text.trim().split(/\s+/).length
  const minutes = timeMs / 60000

  return Math.round(words / minutes)
}

export default {
  SCHNELLER_FINGER_TEXTS,
  getRandomTypingText,
  calculateAccuracy,
  calculateWPM
}
