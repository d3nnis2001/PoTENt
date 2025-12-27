/**
 * Autocomplete Chaos - Satzanfänge für die Disziplin
 * Spieler müssen die Sätze lustig vervollständigen
 */

export const allPrompts = [
  // AI & Tech themed
  { id: 'ai-1', category: 'ai', prompt: 'Die KI hat mir geraten, dass ich...' },
  { id: 'ai-2', category: 'ai', prompt: 'Siri hat mich gefragt, ob ich...' },
  { id: 'ai-3', category: 'ai', prompt: 'Mein Roboter-Staubsauger hat beschlossen...' },
  { id: 'ai-4', category: 'ai', prompt: 'ChatGPT hat mir erklärt, warum...' },
  { id: 'ai-5', category: 'ai', prompt: 'In der Zukunft werden Menschen...' },
  { id: 'ai-6', category: 'ai', prompt: 'Die Maschinen werden uns niemals...' },
  { id: 'ai-7', category: 'ai', prompt: 'Mein Smart-Home hat um 3 Uhr nachts...' },
  { id: 'ai-8', category: 'ai', prompt: 'Alexa hat heimlich...' },
  { id: 'ai-9', category: 'ai', prompt: 'Der Algorithmus denkt, dass ich...' },
  { id: 'ai-10', category: 'ai', prompt: 'Wenn Roboter Gefühle hätten, würden sie...' },

  // Absurd & Funny
  { id: 'absurd-1', category: 'absurd', prompt: 'Meine Oma hat im Internet...' },
  { id: 'absurd-2', category: 'absurd', prompt: 'Der Grund warum ich gefeuert wurde ist...' },
  { id: 'absurd-3', category: 'absurd', prompt: 'Beim ersten Date sollte man niemals...' },
  { id: 'absurd-4', category: 'absurd', prompt: 'Mein Nachbar ist komisch, weil er immer...' },
  { id: 'absurd-5', category: 'absurd', prompt: 'Das Geheimnis meines Erfolgs ist...' },
  { id: 'absurd-6', category: 'absurd', prompt: 'Wenn niemand hinschaut, dann...' },
  { id: 'absurd-7', category: 'absurd', prompt: 'Der peinlichste Moment meines Lebens war als...' },
  { id: 'absurd-8', category: 'absurd', prompt: 'Mein Tinder-Profil sagt, dass ich...' },
  { id: 'absurd-9', category: 'absurd', prompt: 'Im Bewerbungsgespräch habe ich gesagt...' },
  { id: 'absurd-10', category: 'absurd', prompt: 'Die Polizei hat mich angehalten weil...' },

  // Life & Relatable
  { id: 'life-1', category: 'life', prompt: 'Montags denke ich immer...' },
  { id: 'life-2', category: 'life', prompt: 'Mein Therapeut sagt, ich sollte aufhören...' },
  { id: 'life-3', category: 'life', prompt: 'Um 3 Uhr nachts google ich...' },
  { id: 'life-4', category: 'life', prompt: 'Meine Eltern wissen nicht, dass ich...' },
  { id: 'life-5', category: 'life', prompt: 'Der wahre Grund warum ich Single bin ist...' },
  { id: 'life-6', category: 'life', prompt: 'Wenn ich Millionär wäre, würde ich...' },
  { id: 'life-7', category: 'life', prompt: 'Mein Ex hat mir mal gesagt...' },
  { id: 'life-8', category: 'life', prompt: 'Das Schlimmste am Erwachsensein ist...' },
  { id: 'life-9', category: 'life', prompt: 'Mein Browser-Verlauf zeigt, dass...' },
  { id: 'life-10', category: 'life', prompt: 'Ich vertraue niemandem der...' },

  // Hypothetical & Wild
  { id: 'hypo-1', category: 'hypothetical', prompt: 'Wenn ich unsichtbar wäre, würde ich...' },
  { id: 'hypo-2', category: 'hypothetical', prompt: 'Mit einer Zeitmaschine würde ich...' },
  { id: 'hypo-3', category: 'hypothetical', prompt: 'Wenn ich Präsident wäre, würde ich sofort...' },
  { id: 'hypo-4', category: 'hypothetical', prompt: 'Mein letztes Wort auf dem Sterbebett wird...' },
  { id: 'hypo-5', category: 'hypothetical', prompt: 'Wenn Tiere sprechen könnten, würde mein Haustier sagen...' },
  { id: 'hypo-6', category: 'hypothetical', prompt: 'Für eine Million Euro würde ich...' },
  { id: 'hypo-7', category: 'hypothetical', prompt: 'Wenn ich meinen Chef für einen Tag wäre...' },
  { id: 'hypo-8', category: 'hypothetical', prompt: 'Die Welt wäre besser wenn...' },
  { id: 'hypo-9', category: 'hypothetical', prompt: 'Mein Superhelden-Name wäre...' },
  { id: 'hypo-10', category: 'hypothetical', prompt: 'Wenn Bob die Weltherrschaft übernimmt, wird er...' },

  // Social Media & Internet
  { id: 'social-1', category: 'social', prompt: 'Influencer sind eigentlich nur...' },
  { id: 'social-2', category: 'social', prompt: 'Mein TikTok-Algorithmus denkt, ich bin...' },
  { id: 'social-3', category: 'social', prompt: 'LinkedIn-Leute posten immer...' },
  { id: 'social-4', category: 'social', prompt: 'Twitter war besser als...' },
  { id: 'social-5', category: 'social', prompt: 'Das Internet hat mich gelehrt...' },
  { id: 'social-6', category: 'social', prompt: 'Mein WLAN-Passwort ist...' },
  { id: 'social-7', category: 'social', prompt: 'Leute die kein Instagram haben sind...' },
  { id: 'social-8', category: 'social', prompt: 'Die beste Ausrede für keine Antwort ist...' },

  // Work & School
  { id: 'work-1', category: 'work', prompt: 'In Meetings denke ich immer an...' },
  { id: 'work-2', category: 'work', prompt: 'Mein Lebenslauf verschweigt, dass...' },
  { id: 'work-3', category: 'work', prompt: 'Home Office bedeutet eigentlich...' },
  { id: 'work-4', category: 'work', prompt: 'Der Praktikant hat aus Versehen...' },
  { id: 'work-5', category: 'work', prompt: 'In der Schule habe ich gelernt, dass...' },
  { id: 'work-6', category: 'work', prompt: 'Mein Chef glaubt, ich arbeite, aber eigentlich...' }
]

/**
 * Get random prompts for the game
 * @param {number} count - Number of prompts needed
 * @returns {Array} Array of random prompts
 */
export const getRandomPrompts = (count) => {
  const shuffled = [...allPrompts].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Get prompts balanced by category
 * @param {number} count - Number of prompts needed
 * @returns {Array} Array of balanced prompts
 */
export const getBalancedPrompts = (count) => {
  const categories = ['ai', 'absurd', 'life', 'hypothetical', 'social', 'work']
  const promptsByCategory = {}

  categories.forEach(cat => {
    promptsByCategory[cat] = allPrompts
      .filter(p => p.category === cat)
      .sort(() => Math.random() - 0.5)
  })

  const result = []
  let catIndex = 0

  while (result.length < count) {
    const cat = categories[catIndex % categories.length]
    if (promptsByCategory[cat].length > 0) {
      result.push(promptsByCategory[cat].pop())
    }
    catIndex++
  }

  return result.sort(() => Math.random() - 0.5)
}

export default {
  allPrompts,
  getRandomPrompts,
  getBalancedPrompts
}
