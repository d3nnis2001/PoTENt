/**
 * Schätz-Duell Questions
 * Questions with numerical answers for estimation game
 */

export const SCHAETZ_DUELL_QUESTIONS = [
  {
    id: 'hair-count',
    question: 'Wie viele Haare hat ein Mensch durchschnittlich auf dem Kopf?',
    answer: 100000,
    unit: 'Haare',
    hint: 'Denk an einen vollen Kopf...',
    category: 'biology'
  },
  {
    id: 'eiffel-height',
    question: 'Wie hoch ist der Eiffelturm in Metern?',
    answer: 330,
    unit: 'Meter',
    hint: 'Ein bekanntes Wahrzeichen...',
    category: 'geography'
  },
  {
    id: 'heartbeats-day',
    question: 'Wie oft schlägt das menschliche Herz pro Tag?',
    answer: 100000,
    unit: 'Schläge',
    hint: 'Etwa 70 Schläge pro Minute...',
    category: 'biology'
  },
  {
    id: 'amazon-length',
    question: 'Wie lang ist der Amazonas in Kilometern?',
    answer: 6992,
    unit: 'km',
    hint: 'Der zweitlängste Fluss der Welt...',
    category: 'geography'
  },
  {
    id: 'google-searches',
    question: 'Wie viele Google-Suchen gibt es pro Sekunde weltweit?',
    answer: 99000,
    unit: 'Suchen',
    hint: 'Sehr, sehr viele...',
    category: 'technology'
  },
  {
    id: 'neurons',
    question: 'Wie viele Neuronen hat das menschliche Gehirn (in Milliarden)?',
    answer: 86,
    unit: 'Milliarden',
    hint: 'Ein komplexes Netzwerk...',
    category: 'biology'
  },
  {
    id: 'earth-age',
    question: 'Wie alt ist die Erde in Milliarden Jahren?',
    answer: 4.5,
    unit: 'Milliarden Jahre',
    hint: 'Sehr, sehr alt...',
    category: 'science'
  },
  {
    id: 'pizza-per-second',
    question: 'Wie viele Pizzen werden weltweit pro Sekunde gegessen?',
    answer: 350,
    unit: 'Pizzen',
    hint: 'Pizza ist sehr beliebt...',
    category: 'food'
  },
  {
    id: 'twitter-tweets',
    question: 'Wie viele Tweets werden pro Tag auf X/Twitter gepostet (in Millionen)?',
    answer: 500,
    unit: 'Millionen',
    hint: 'Sehr viel Gezwitscher...',
    category: 'technology'
  },
  {
    id: 'sun-distance',
    question: 'Wie weit ist die Sonne von der Erde entfernt (in Millionen km)?',
    answer: 150,
    unit: 'Millionen km',
    hint: '8 Lichtminuten...',
    category: 'science'
  },
  {
    id: 'coffee-per-day',
    question: 'Wie viele Tassen Kaffee werden weltweit pro Tag getrunken (in Milliarden)?',
    answer: 2.25,
    unit: 'Milliarden',
    hint: 'Viel Koffein...',
    category: 'food'
  },
  {
    id: 'great-wall-length',
    question: 'Wie lang ist die Chinesische Mauer in Kilometern?',
    answer: 21196,
    unit: 'km',
    hint: 'Sehr, sehr lang...',
    category: 'geography'
  },
  {
    id: 'instagram-photos',
    question: 'Wie viele Fotos werden täglich auf Instagram hochgeladen (in Millionen)?',
    answer: 95,
    unit: 'Millionen',
    hint: 'Viele Selfies...',
    category: 'technology'
  },
  {
    id: 'blood-vessels',
    question: 'Wie viele Kilometer Blutgefäße hat ein erwachsener Mensch?',
    answer: 100000,
    unit: 'km',
    hint: 'Genug um die Erde mehrfach zu umrunden...',
    category: 'biology'
  },
  {
    id: 'languages-world',
    question: 'Wie viele Sprachen werden weltweit gesprochen?',
    answer: 7000,
    unit: 'Sprachen',
    hint: 'Mehr als du denkst...',
    category: 'culture'
  },
  {
    id: 'cells-human',
    question: 'Wie viele Zellen hat der menschliche Körper (in Billionen)?',
    answer: 37,
    unit: 'Billionen',
    hint: 'Sehr viele kleine Bausteine...',
    category: 'biology'
  },
  {
    id: 'steps-lifetime',
    question: 'Wie viele Schritte macht ein Mensch im Durchschnitt in seinem Leben (in Millionen)?',
    answer: 150,
    unit: 'Millionen',
    hint: 'Ein langer Weg...',
    category: 'lifestyle'
  },
  {
    id: 'emails-per-day',
    question: 'Wie viele E-Mails werden weltweit pro Tag verschickt (in Milliarden)?',
    answer: 333,
    unit: 'Milliarden',
    hint: 'Davon viel Spam...',
    category: 'technology'
  },
  {
    id: 'bones-baby',
    question: 'Wie viele Knochen hat ein Baby?',
    answer: 270,
    unit: 'Knochen',
    hint: 'Mehr als ein Erwachsener...',
    category: 'biology'
  },
  {
    id: 'honey-bees-hive',
    question: 'Wie viele Bienen leben in einem durchschnittlichen Bienenstock?',
    answer: 60000,
    unit: 'Bienen',
    hint: 'Eine fleißige Gemeinschaft...',
    category: 'nature'
  }
]

/**
 * Get random questions for a duell
 * @param {number} count - Number of questions
 * @returns {Array} Random questions
 */
export const getRandomSchaetzQuestions = (count = 1) => {
  const shuffled = [...SCHAETZ_DUELL_QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export default {
  SCHAETZ_DUELL_QUESTIONS,
  getRandomSchaetzQuestions
}
