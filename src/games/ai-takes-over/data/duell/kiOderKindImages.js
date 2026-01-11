/**
 * KI oder Kind? Images
 * Collection of images to guess if made by AI or a child
 * Note: In production, these would be actual image URLs
 * For now, we use descriptions and placeholder URLs
 */

export const KI_ODER_KIND_IMAGES = [
  {
    id: 'dog-rainbow-1',
    description: 'Ein Hund unter einem Regenbogen',
    imageUrl: '/images/duell/ki-kind/dog-rainbow-1.jpg',
    answer: 'child',
    explanation: 'Die ungleichmäßigen Linien und die kreative Farbwahl verraten ein Kind!'
  },
  {
    id: 'space-cat-1',
    description: 'Eine Katze im Weltraum',
    imageUrl: '/images/duell/ki-kind/space-cat-1.jpg',
    answer: 'ai',
    explanation: 'Die perfekten Details und der realistische Stil sind typisch für KI.'
  },
  {
    id: 'family-house-1',
    description: 'Ein Haus mit Familie davor',
    imageUrl: '/images/duell/ki-kind/family-house-1.jpg',
    answer: 'child',
    explanation: 'Das typische Kinderhaus mit Rauch aus dem Schornstein!'
  },
  {
    id: 'dragon-castle-1',
    description: 'Ein Drache über einer Burg',
    imageUrl: '/images/duell/ki-kind/dragon-castle-1.jpg',
    answer: 'ai',
    explanation: 'Die detaillierten Schuppen und der atmosphärische Hintergrund sind KI-typisch.'
  },
  {
    id: 'sun-smile-1',
    description: 'Eine lachende Sonne',
    imageUrl: '/images/duell/ki-kind/sun-smile-1.jpg',
    answer: 'child',
    explanation: 'Die charmant schiefen Strahlen und das Gesicht sind eindeutig von einem Kind!'
  },
  {
    id: 'underwater-1',
    description: 'Unterwasserwelt mit Fischen',
    imageUrl: '/images/duell/ki-kind/underwater-1.jpg',
    answer: 'ai',
    explanation: 'Die realistischen Lichteffekte im Wasser sind typisch für KI-Generierung.'
  },
  {
    id: 'princess-1',
    description: 'Eine Prinzessin mit Krone',
    imageUrl: '/images/duell/ki-kind/princess-1.jpg',
    answer: 'child',
    explanation: 'Die übergroßen Augen und das dreieckige Kleid sind klassische Kinderzeichnungen!'
  },
  {
    id: 'robot-garden-1',
    description: 'Ein Roboter in einem Garten',
    imageUrl: '/images/duell/ki-kind/robot-garden-1.jpg',
    answer: 'ai',
    explanation: 'Die komplexen mechanischen Details verraten die KI.'
  },
  {
    id: 'butterfly-1',
    description: 'Ein bunter Schmetterling',
    imageUrl: '/images/duell/ki-kind/butterfly-1.jpg',
    answer: 'child',
    explanation: 'Die fröhlichen, unsymmetrischen Flügel sind typisch für Kinder!'
  },
  {
    id: 'alien-1',
    description: 'Ein freundlicher Außerirdischer',
    imageUrl: '/images/duell/ki-kind/alien-1.jpg',
    answer: 'ai',
    explanation: 'Die glatte Oberfläche und die präzisen Schatten sind KI-generiert.'
  },
  {
    id: 'dinosaur-1',
    description: 'Ein T-Rex',
    imageUrl: '/images/duell/ki-kind/dinosaur-1.jpg',
    answer: 'child',
    explanation: 'Die liebenswert kurzen Arme und das Zickzack-Gebiss verraten ein Kind!'
  },
  {
    id: 'forest-1',
    description: 'Ein magischer Wald',
    imageUrl: '/images/duell/ki-kind/forest-1.jpg',
    answer: 'ai',
    explanation: 'Die perfekte Tiefenschärfe und Lichtstimmung sind typisch für KI.'
  },
  {
    id: 'car-1',
    description: 'Ein rotes Auto',
    imageUrl: '/images/duell/ki-kind/car-1.jpg',
    answer: 'child',
    explanation: 'Die quadratischen Räder und die Strichmännchen-Passagiere sind von einem Kind!'
  },
  {
    id: 'monster-1',
    description: 'Ein freundliches Monster',
    imageUrl: '/images/duell/ki-kind/monster-1.jpg',
    answer: 'ai',
    explanation: 'Die konsistente Textur und professionellen Schatten verraten die KI.'
  },
  {
    id: 'flower-1',
    description: 'Eine Blume mit Gesicht',
    imageUrl: '/images/duell/ki-kind/flower-1.jpg',
    answer: 'child',
    explanation: 'Der grüne Stiel und die Sonne in der Ecke sind klassische Kindermotive!'
  }
]

/**
 * Get random images for a duell
 * @param {number} count - Number of images
 * @returns {Array} Random images
 */
export const getRandomKiOderKindImages = (count = 5) => {
  const shuffled = [...KI_ODER_KIND_IMAGES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export default {
  KI_ODER_KIND_IMAGES,
  getRandomKiOderKindImages
}
