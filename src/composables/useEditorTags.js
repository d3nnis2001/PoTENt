import { ref, computed } from 'vue'
import editorTags from '../data/editorTags.json'

export function useEditorTags() {
  const tags = ref(editorTags.tags)
  
  console.log('🏷️ Loaded tags:', tags.value)
  
  // Suche verfügbare Tags basierend auf Input
  const searchTags = (input) => {
    console.log('🔍 searchTags called with:', input)
    if (!input.startsWith('/')) {
      console.log('❌ Input does not start with /')
      return []
    }
    
    const searchTerm = input.toLowerCase()
    const results = tags.value.filter(tag => 
      tag.tag.toLowerCase().includes(searchTerm) ||
      tag.syntax.toLowerCase().includes(searchTerm)
    )
    console.log('📄 searchTags results:', results)
    return results
  }
  
  // Finde Tag an bestimmter Cursor-Position
  const getTagAtPosition = (text, cursorPosition) => {
    console.log('🔎 getTagAtPosition:', { text, cursorPosition })
    
    // Einfachere Logik: Finde das letzte / vor dem Cursor
    const beforeCursor = text.substring(0, cursorPosition)
    const lastSlashIndex = beforeCursor.lastIndexOf('/')
    
    if (lastSlashIndex === -1) {
      console.log('❌ No slash found')
      return null
    }
    
    // Finde das Ende des aktuellen "Worts" nach dem /
    let tagEnd = cursorPosition
    while (tagEnd < text.length && !/\s/.test(text[tagEnd])) {
      tagEnd++
    }
    
    const tagText = text.substring(lastSlashIndex, tagEnd)
    console.log('✅ Found tag:', tagText)
    
    return {
      text: tagText,
      start: lastSlashIndex,
      end: tagEnd
    }
  }
  
  // Parse und ersetze Tags zur Laufzeit
  const parseTags = (text, playerList = []) => {
    if (!text || !playerList.length) return text
    
    let result = text
    
    // /random(x) Tag verarbeiten
    const randomPattern = /\/random\((\d+)\)/g
    result = result.replace(randomPattern, (match, count) => {
      const numPlayers = parseInt(count)
      if (numPlayers <= 0 || numPlayers > playerList.length) {
        return match // Behalte original wenn ungültig
      }
      
      // Zufällige Spieler auswählen
      const shuffled = [...playerList].sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, numPlayers)
      
      return selected.join(', ')
    })
    
    return result
  }
  
  // Validiere Tag-Syntax
  const validateTag = (tagText) => {
    const tag = tags.value.find(t => 
      new RegExp(t.pattern).test(tagText)
    )
    return !!tag
  }
  
  // Extrahiere alle Tags aus Text
  const extractTags = (text) => {
    const foundTags = []
    
    tags.value.forEach(tagDef => {
      const regex = new RegExp(tagDef.pattern, 'g')
      let match
      
      while ((match = regex.exec(text)) !== null) {
        foundTags.push({
          tag: tagDef,
          match: match[0],
          position: match.index,
          params: match.slice(1)
        })
      }
    })
    
    return foundTags
  }
  
  // Generiere Autocompletion-Vorschläge
  const getCompletionSuggestions = (input) => {
    if (!input || !input.startsWith('/')) return []
    
    const matching = searchTags(input)
    
    return matching.map(tag => ({
      ...tag,
      completion: tag.syntax,
      insertText: tag.syntax,
      detail: tag.description,
      sortText: tag.category + tag.tag // Sortierung nach Kategorie dann Tag
    }))
  }
  
  // Gruppiere Tags nach Kategorien
  const getTagsByCategory = () => {
    const categories = {}
    
    tags.value.forEach(tag => {
      const category = tag.category || 'Andere'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(tag)
    })
    
    return categories
  }
  
  // Zeige alle verfügbaren Tags (für Help/Documentation)
  const getAllTags = () => {
    return tags.value.map(tag => ({
      ...tag,
      usage: tag.syntax,
      category: tag.category || 'Andere'
    }))
  }
  
  return {
    tags: computed(() => tags.value),
    searchTags,
    getTagAtPosition,
    parseTags,
    validateTag,
    extractTags,
    getCompletionSuggestions,
    getTagsByCategory,
    getAllTags
  }
}