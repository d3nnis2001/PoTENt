/**
 * 3-Wort-Chaos - Prompts Data
 * Players must describe/answer with exactly 3 words
 */

// Categories of prompts
export const promptCategories = {
  DESCRIBE: 'describe',      // Beschreibe X in 3 Wörtern
  EXPLAIN: 'explain',        // Erkläre X in 3 Wörtern
  ANSWER: 'answer',          // Beantworte die Frage in 3 Wörtern
  COMPLETE: 'complete',      // Vervollständige den Satz mit 3 Wörtern
  REVIEW: 'review'           // Bewerte X in 3 Wörtern
}

// All prompts organized by category
export const allPrompts = [
  // DESCRIBE - Beschreibe etwas
  { id: 'desc-1', category: 'describe', prompt: 'Beschreibe deinen Montag in 3 Wörtern' },
  { id: 'desc-2', category: 'describe', prompt: 'Beschreibe Deutschland in 3 Wörtern' },
  { id: 'desc-3', category: 'describe', prompt: 'Beschreibe das Internet in 3 Wörtern' },
  { id: 'desc-4', category: 'describe', prompt: 'Beschreibe Weihnachten in 3 Wörtern' },
  { id: 'desc-5', category: 'describe', prompt: 'Beschreibe deinen Chef in 3 Wörtern' },
  { id: 'desc-6', category: 'describe', prompt: 'Beschreibe einen Kater in 3 Wörtern' },
  { id: 'desc-7', category: 'describe', prompt: 'Beschreibe die Schule in 3 Wörtern' },
  { id: 'desc-8', category: 'describe', prompt: 'Beschreibe Social Media in 3 Wörtern' },
  { id: 'desc-9', category: 'describe', prompt: 'Beschreibe einen Zahnarztbesuch in 3 Wörtern' },
  { id: 'desc-10', category: 'describe', prompt: 'Beschreibe einen Flughafen in 3 Wörtern' },
  { id: 'desc-11', category: 'describe', prompt: 'Beschreibe IKEA in 3 Wörtern' },
  { id: 'desc-12', category: 'describe', prompt: 'Beschreibe einen Familienurlaub in 3 Wörtern' },
  { id: 'desc-13', category: 'describe', prompt: 'Beschreibe Online-Dating in 3 Wörtern' },
  { id: 'desc-14', category: 'describe', prompt: 'Beschreibe die Deutsche Bahn in 3 Wörtern' },
  { id: 'desc-15', category: 'describe', prompt: 'Beschreibe einen Fitnessstudio-Besuch in 3 Wörtern' },

  // EXPLAIN - Erkläre etwas
  { id: 'expl-1', category: 'explain', prompt: 'Erkläre Liebe in 3 Wörtern' },
  { id: 'expl-2', category: 'explain', prompt: 'Erkläre Politik in 3 Wörtern' },
  { id: 'expl-3', category: 'explain', prompt: 'Erkläre Erwachsensein in 3 Wörtern' },
  { id: 'expl-4', category: 'explain', prompt: 'Erkläre Freundschaft in 3 Wörtern' },
  { id: 'expl-5', category: 'explain', prompt: 'Erkläre Erfolg in 3 Wörtern' },
  { id: 'expl-6', category: 'explain', prompt: 'Erkläre Künstliche Intelligenz in 3 Wörtern' },
  { id: 'expl-7', category: 'explain', prompt: 'Erkläre Glück in 3 Wörtern' },
  { id: 'expl-8', category: 'explain', prompt: 'Erkläre das Leben in 3 Wörtern' },

  // ANSWER - Beantworte Fragen
  { id: 'answ-1', category: 'answer', prompt: 'Warum bist du hier? (3 Wörter)' },
  { id: 'answ-2', category: 'answer', prompt: 'Was macht dich glücklich? (3 Wörter)' },
  { id: 'answ-3', category: 'answer', prompt: 'Was würdest du mit 1 Million Euro machen? (3 Wörter)' },
  { id: 'answ-4', category: 'answer', prompt: 'Was ist dein Lebensmotto? (3 Wörter)' },
  { id: 'answ-5', category: 'answer', prompt: 'Was nervt dich am meisten? (3 Wörter)' },
  { id: 'answ-6', category: 'answer', prompt: 'Was ist dein guilty pleasure? (3 Wörter)' },
  { id: 'answ-7', category: 'answer', prompt: 'Was würde auf deinem Grabstein stehen? (3 Wörter)' },
  { id: 'answ-8', category: 'answer', prompt: 'Was ist überbewertet? (3 Wörter)' },

  // COMPLETE - Vervollständige Sätze
  { id: 'comp-1', category: 'complete', prompt: 'Mein Tinder-Profil würde sagen... (3 Wörter)' },
  { id: 'comp-2', category: 'complete', prompt: 'Um 3 Uhr nachts denke ich... (3 Wörter)' },
  { id: 'comp-3', category: 'complete', prompt: 'Meine letzte Google-Suche war... (3 Wörter)' },
  { id: 'comp-4', category: 'complete', prompt: 'Im Kühlschrank ist nur noch... (3 Wörter)' },
  { id: 'comp-5', category: 'complete', prompt: 'Mein Gehirn um Mitternacht sagt... (3 Wörter)' },
  { id: 'comp-6', category: 'complete', prompt: 'Auf meiner Bucket List steht... (3 Wörter)' },
  { id: 'comp-7', category: 'complete', prompt: 'Mein Therapeut würde sagen... (3 Wörter)' },
  { id: 'comp-8', category: 'complete', prompt: 'Bob denkt über Menschen... (3 Wörter)' },

  // REVIEW - Bewerte etwas
  { id: 'rev-1', category: 'review', prompt: 'Bewerte 2024 in 3 Wörtern' },
  { id: 'rev-2', category: 'review', prompt: 'Bewerte dein Liebesleben in 3 Wörtern' },
  { id: 'rev-3', category: 'review', prompt: 'Bewerte deinen Schlafrhythmus in 3 Wörtern' },
  { id: 'rev-4', category: 'review', prompt: 'Bewerte deine Kochkünste in 3 Wörtern' },
  { id: 'rev-5', category: 'review', prompt: 'Bewerte deine Work-Life-Balance in 3 Wörtern' },
  { id: 'rev-6', category: 'review', prompt: 'Bewerte deine Fitness in 3 Wörtern' },
  { id: 'rev-7', category: 'review', prompt: 'Bewerte deine Finanzen in 3 Wörtern' },
  { id: 'rev-8', category: 'review', prompt: 'Bewerte diese Party in 3 Wörtern' }
]

/**
 * Get random prompts for a game
 * @param {number} count - Number of prompts needed
 * @returns {Array} Array of prompt objects
 */
export const getRandomPrompts = (count = 5) => {
  const shuffled = [...allPrompts].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Get prompts for a specific round
 * @param {number} roundIndex - Round number (0-based)
 * @param {number} totalRounds - Total number of rounds
 * @returns {Object} Prompt object for this round
 */
export const getPromptForRound = (roundIndex, totalRounds = 5) => {
  // Ensure we don't repeat prompts within a game
  const startIndex = (roundIndex * 7) % allPrompts.length
  return allPrompts[startIndex]
}

/**
 * Validate that answer has exactly 3 words
 * @param {string} answer - The player's answer
 * @returns {boolean} True if valid
 */
export const validateThreeWords = (answer) => {
  if (!answer || typeof answer !== 'string') return false
  const words = answer.trim().split(/\s+/).filter(w => w.length > 0)
  return words.length === 3
}

/**
 * Count words in answer
 * @param {string} answer - The player's answer
 * @returns {number} Word count
 */
export const countWords = (answer) => {
  if (!answer || typeof answer !== 'string') return 0
  return answer.trim().split(/\s+/).filter(w => w.length > 0).length
}

export default {
  promptCategories,
  allPrompts,
  getRandomPrompts,
  getPromptForRound,
  validateThreeWords,
  countWords
}
