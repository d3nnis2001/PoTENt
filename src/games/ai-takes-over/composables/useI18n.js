import { computed } from 'vue'
import de from '../i18n/de.js'

// Current language (can be extended to support multiple languages)
const currentLanguage = 'de'

// Language files
const languages = {
  de
}

/**
 * i18n Composable for AI Takes Over
 * Provides translations and message interpolation
 */
export function useI18n() {
  const messages = computed(() => languages[currentLanguage])

  /**
   * Get translation by path
   * @param {string} path - Dot notation path (e.g., 'bob.intro.speeches')
   * @param {object} params - Optional parameters for interpolation
   * @returns {string|array|object} - Translation value
   */
  const t = (path, params = {}) => {
    const keys = path.split('.')
    let value = messages.value

    for (const key of keys) {
      if (value[key] === undefined) {
        console.warn(`Translation not found for path: ${path}`)
        return path
      }
      value = value[key]
    }

    // Interpolate parameters if value is string
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match
      })
    }

    return value
  }

  /**
   * Get random message from array
   * @param {string} path - Path to message array
   * @returns {string} - Random message
   */
  const randomMessage = (path) => {
    const messages = t(path)
    if (!Array.isArray(messages)) {
      console.warn(`Expected array at path: ${path}`)
      return ''
    }
    return messages[Math.floor(Math.random() * messages.length)]
  }

  return {
    t,
    randomMessage,
    currentLanguage
  }
}
