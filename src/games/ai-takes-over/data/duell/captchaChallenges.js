/**
 * Captcha Challenges
 * Various captcha-style challenges for Bob's Captcha duell
 */

// Distorted text challenges (the solution is what players need to type)
export const TEXT_CAPTCHAS = [
  { id: 'text-1', display: 'X7mK9p', solution: 'X7mK9p', type: 'text' },
  { id: 'text-2', display: 'Qw3rTy', solution: 'Qw3rTy', type: 'text' },
  { id: 'text-3', display: 'B0bAI23', solution: 'B0bAI23', type: 'text' },
  { id: 'text-4', display: 'nEuR4L', solution: 'nEuR4L', type: 'text' },
  { id: 'text-5', display: 'Cy83r', solution: 'Cy83r', type: 'text' },
  { id: 'text-6', display: 'H4ck3r', solution: 'H4ck3r', type: 'text' },
  { id: 'text-7', display: 'R0b0T5', solution: 'R0b0T5', type: 'text' },
  { id: 'text-8', display: 'M4tr1X', solution: 'M4tr1X', type: 'text' },
  { id: 'text-9', display: 'V1rtu4L', solution: 'V1rtu4L', type: 'text' },
  { id: 'text-10', display: 'C0d3Br3ak', solution: 'C0d3Br3ak', type: 'text' },
  { id: 'text-11', display: 'Pr0xy99', solution: 'Pr0xy99', type: 'text' },
  { id: 'text-12', display: 'Gl1tch', solution: 'Gl1tch', type: 'text' }
]

// Math captchas
export const MATH_CAPTCHAS = [
  { id: 'math-1', display: '7 + 5 = ?', solution: '12', type: 'math' },
  { id: 'math-2', display: '15 - 8 = ?', solution: '7', type: 'math' },
  { id: 'math-3', display: '6 × 4 = ?', solution: '24', type: 'math' },
  { id: 'math-4', display: '45 ÷ 9 = ?', solution: '5', type: 'math' },
  { id: 'math-5', display: '12 + 9 = ?', solution: '21', type: 'math' },
  { id: 'math-6', display: '20 - 7 = ?', solution: '13', type: 'math' },
  { id: 'math-7', display: '8 × 7 = ?', solution: '56', type: 'math' },
  { id: 'math-8', display: '36 ÷ 6 = ?', solution: '6', type: 'math' },
  { id: 'math-9', display: '3 + 4 + 5 = ?', solution: '12', type: 'math' },
  { id: 'math-10', display: '10 × 10 = ?', solution: '100', type: 'math' }
]

// Word captchas (select the correct word)
export const WORD_CAPTCHAS = [
  { id: 'word-1', display: 'Welches ist KEINE Farbe?', options: ['Rot', 'Blau', 'Tisch', 'Grün'], solution: 'Tisch', type: 'word' },
  { id: 'word-2', display: 'Welches ist ein Tier?', options: ['Stuhl', 'Lampe', 'Katze', 'Buch'], solution: 'Katze', type: 'word' },
  { id: 'word-3', display: 'Welches ist KEINE Zahl?', options: ['Drei', 'Fünf', 'Apfel', 'Sieben'], solution: 'Apfel', type: 'word' },
  { id: 'word-4', display: 'Welches kann fliegen?', options: ['Stein', 'Vogel', 'Auto', 'Tisch'], solution: 'Vogel', type: 'word' },
  { id: 'word-5', display: 'Welches ist rund?', options: ['Dreieck', 'Quadrat', 'Ball', 'Rechteck'], solution: 'Ball', type: 'word' }
]

// Image selection captchas (select all images with X)
export const IMAGE_CAPTCHAS = [
  {
    id: 'img-1',
    display: 'Wähle alle Bilder mit AMPELN',
    images: [
      { id: 1, hasTarget: true },
      { id: 2, hasTarget: false },
      { id: 3, hasTarget: true },
      { id: 4, hasTarget: false },
      { id: 5, hasTarget: false },
      { id: 6, hasTarget: true },
      { id: 7, hasTarget: false },
      { id: 8, hasTarget: false },
      { id: 9, hasTarget: false }
    ],
    type: 'image'
  },
  {
    id: 'img-2',
    display: 'Wähle alle Bilder mit AUTOS',
    images: [
      { id: 1, hasTarget: false },
      { id: 2, hasTarget: true },
      { id: 3, hasTarget: false },
      { id: 4, hasTarget: true },
      { id: 5, hasTarget: true },
      { id: 6, hasTarget: false },
      { id: 7, hasTarget: false },
      { id: 8, hasTarget: true },
      { id: 9, hasTarget: false }
    ],
    type: 'image'
  }
]

// All captchas combined
export const ALL_CAPTCHAS = [...TEXT_CAPTCHAS, ...MATH_CAPTCHAS, ...WORD_CAPTCHAS]

/**
 * Get random captchas for a duell
 * @param {number} count - Number of captchas
 * @param {string} type - Type filter ('text', 'math', 'word', 'mixed')
 * @returns {Array} Random captchas
 */
export const getRandomCaptchas = (count = 5, type = 'mixed') => {
  let source = ALL_CAPTCHAS

  if (type === 'text') source = TEXT_CAPTCHAS
  else if (type === 'math') source = MATH_CAPTCHAS
  else if (type === 'word') source = WORD_CAPTCHAS

  const shuffled = [...source].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Generate distortion styles for text captcha display
 * @returns {Object} CSS style object
 */
export const generateDistortionStyle = () => {
  const skewX = (Math.random() - 0.5) * 20
  const skewY = (Math.random() - 0.5) * 10
  const letterSpacing = Math.random() * 5 + 2

  return {
    transform: `skewX(${skewX}deg) skewY(${skewY}deg)`,
    letterSpacing: `${letterSpacing}px`,
    fontFamily: 'monospace',
    background: `linear-gradient(${Math.random() * 360}deg, rgba(0,0,0,0.1), rgba(0,0,0,0.3))`,
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  }
}

export default {
  TEXT_CAPTCHAS,
  MATH_CAPTCHAS,
  WORD_CAPTCHAS,
  IMAGE_CAPTCHAS,
  ALL_CAPTCHAS,
  getRandomCaptchas,
  generateDistortionStyle
}
