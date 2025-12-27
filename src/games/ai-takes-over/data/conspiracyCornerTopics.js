/**
 * Conspiracy Corner - Topics Data
 * Players invent conspiracy theories about given topics
 */

// Topic categories
export const topicCategories = {
  EVERYDAY: 'everyday',       // Alltägliche Dinge
  TECHNOLOGY: 'technology',   // Technologie
  FOOD: 'food',               // Essen & Trinken
  SOCIETY: 'society',         // Gesellschaft
  NATURE: 'nature',           // Natur & Tiere
  HISTORY: 'history'          // Geschichte & Ereignisse
}

// All conspiracy topics
export const allTopics = [
  // EVERYDAY - Alltägliche Dinge
  { id: 'ev-1', category: 'everyday', topic: 'Warum verschwinden immer einzelne Socken in der Waschmaschine?' },
  { id: 'ev-2', category: 'everyday', topic: 'Was passiert wirklich mit dem Gepäck am Flughafen?' },
  { id: 'ev-3', category: 'everyday', topic: 'Warum sind Drucker immer genau dann kaputt, wenn man sie braucht?' },
  { id: 'ev-4', category: 'everyday', topic: 'Wohin verschwinden alle Kugelschreiber?' },
  { id: 'ev-5', category: 'everyday', topic: 'Warum kommen Busse immer zu dritt?' },
  { id: 'ev-6', category: 'everyday', topic: 'Was machen Supermarkt-Mitarbeiter wirklich im Lager?' },
  { id: 'ev-7', category: 'everyday', topic: 'Warum ist die andere Kassenschlange immer schneller?' },
  { id: 'ev-8', category: 'everyday', topic: 'Was passiert mit den Münzen, die im Sofa verschwinden?' },

  // TECHNOLOGY - Technologie
  { id: 'tech-1', category: 'technology', topic: 'Warum wird der Handyakku immer genau vor wichtigen Anrufen leer?' },
  { id: 'tech-2', category: 'technology', topic: 'Was macht das WLAN wirklich, wenn es "verbunden, kein Internet" zeigt?' },
  { id: 'tech-3', category: 'technology', topic: 'Warum brauchen Updates immer genau dann, wenn du los musst?' },
  { id: 'tech-4', category: 'technology', topic: 'Was passiert wirklich beim "Cookies akzeptieren"?' },
  { id: 'tech-5', category: 'technology', topic: 'Warum funktioniert Technik, sobald der IT-Support kommt?' },
  { id: 'tech-6', category: 'technology', topic: 'Was macht die Kamera wirklich, wenn das grüne Licht aus ist?' },
  { id: 'tech-7', category: 'technology', topic: 'Wohin gehen gelöschte Dateien wirklich?' },
  { id: 'tech-8', category: 'technology', topic: 'Warum wissen Algorithmen, worüber du gerade gesprochen hast?' },

  // FOOD - Essen & Trinken
  { id: 'food-1', category: 'food', topic: 'Was ist wirklich in Hot Dogs?' },
  { id: 'food-2', category: 'food', topic: 'Warum schmeckt Essen im Flugzeug anders?' },
  { id: 'food-3', category: 'food', topic: 'Was passiert mit dem Essen, das Restaurants nicht verkaufen?' },
  { id: 'food-4', category: 'food', topic: 'Warum ist Bubble Tea plötzlich überall aufgetaucht?' },
  { id: 'food-5', category: 'food', topic: 'Was macht die Geheimzutat in Cola wirklich?' },
  { id: 'food-6', category: 'food', topic: 'Warum sieht Fast Food auf Werbung anders aus als in echt?' },
  { id: 'food-7', category: 'food', topic: 'Was ist das echte Geheimnis der IKEA-Hotdogs?' },
  { id: 'food-8', category: 'food', topic: 'Warum macht Döner um 3 Uhr nachts glücklicher?' },

  // SOCIETY - Gesellschaft
  { id: 'soc-1', category: 'society', topic: 'Warum sehen alle Passfotos furchtbar aus?' },
  { id: 'soc-2', category: 'society', topic: 'Was machen Politiker wirklich im Bundestag?' },
  { id: 'soc-3', category: 'society', topic: 'Warum gibt es so viele Baustellen, aber nie Arbeiter?' },
  { id: 'soc-4', category: 'society', topic: 'Was passiert wirklich bei geschlossenen Türen in Meetings?' },
  { id: 'soc-5', category: 'society', topic: 'Warum sind alle Nachbarn komisch?' },
  { id: 'soc-6', category: 'society', topic: 'Was machen Lehrer im Lehrerzimmer?' },
  { id: 'soc-7', category: 'society', topic: 'Warum ist Montag der schlimmste Tag?' },
  { id: 'soc-8', category: 'society', topic: 'Was passiert mit all den Prospekten, die keiner liest?' },

  // NATURE - Natur & Tiere
  { id: 'nat-1', category: 'nature', topic: 'Was machen Katzen wirklich, wenn sie dich anstarren?' },
  { id: 'nat-2', category: 'nature', topic: 'Warum kommen Spinnen immer in die Wohnung?' },
  { id: 'nat-3', category: 'nature', topic: 'Was planen Tauben in der Stadt?' },
  { id: 'nat-4', category: 'nature', topic: 'Warum wachen Hähne so früh auf?' },
  { id: 'nat-5', category: 'nature', topic: 'Was wissen Delfine, das wir nicht wissen?' },
  { id: 'nat-6', category: 'nature', topic: 'Warum verschwinden Bienen?' },
  { id: 'nat-7', category: 'nature', topic: 'Was machen Fische nachts im Aquarium?' },
  { id: 'nat-8', category: 'nature', topic: 'Warum gehen Vögel nie in Telefonzellen?' },

  // HISTORY - Geschichte & Ereignisse
  { id: 'hist-1', category: 'history', topic: 'Was ist wirklich in Area 51?' },
  { id: 'hist-2', category: 'history', topic: 'Wer hat wirklich die Pyramiden gebaut?' },
  { id: 'hist-3', category: 'history', topic: 'Was ist das Bermuda-Dreieck wirklich?' },
  { id: 'hist-4', category: 'history', topic: 'Warum sind Dinosaurier wirklich ausgestorben?' },
  { id: 'hist-5', category: 'history', topic: 'Was ist auf der Rückseite des Mondes?' },
  { id: 'hist-6', category: 'history', topic: 'Wer kontrolliert wirklich das Internet?' },
  { id: 'hist-7', category: 'history', topic: 'Was ist mit Atlantis passiert?' },
  { id: 'hist-8', category: 'history', topic: 'Warum wurde der Pluto degradiert?' }
]

/**
 * Get random topics for a game
 * @param {number} count - Number of topics needed
 * @returns {Array} Array of topic objects
 */
export const getRandomTopics = (count = 4) => {
  const shuffled = [...allTopics].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Get topics by category
 * @param {string} category - Category name
 * @returns {Array} Array of topics in that category
 */
export const getTopicsByCategory = (category) => {
  return allTopics.filter(t => t.category === category)
}

/**
 * Get a balanced selection of topics (one from each category if possible)
 * @param {number} count - Number of topics needed
 * @returns {Array} Array of topic objects
 */
export const getBalancedTopics = (count = 4) => {
  const categories = Object.values(topicCategories)
  const selected = []

  // First, get one from each category
  const shuffledCategories = [...categories].sort(() => Math.random() - 0.5)
  for (const category of shuffledCategories) {
    if (selected.length >= count) break
    const categoryTopics = getTopicsByCategory(category)
    const randomTopic = categoryTopics[Math.floor(Math.random() * categoryTopics.length)]
    if (randomTopic && !selected.find(t => t.id === randomTopic.id)) {
      selected.push(randomTopic)
    }
  }

  // If we need more, add random ones
  while (selected.length < count) {
    const remainingTopics = allTopics.filter(t => !selected.find(s => s.id === t.id))
    if (remainingTopics.length === 0) break
    const randomTopic = remainingTopics[Math.floor(Math.random() * remainingTopics.length)]
    selected.push(randomTopic)
  }

  return selected
}

export default {
  topicCategories,
  allTopics,
  getRandomTopics,
  getTopicsByCategory,
  getBalancedTopics
}
