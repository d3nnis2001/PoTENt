<template>
  <div class="p-4 bg-gray-100 rounded">
    <h3 class="font-bold mb-2">Tag System Test</h3>
    <textarea
      v-model="testText"
      @input="handleInput"
      class="w-full p-2 border rounded"
      rows="3"
      placeholder="Schreibe / um Tags zu testen..."
    ></textarea>
    
    <div v-if="showDebug" class="mt-2 text-xs">
      <div><strong>Text:</strong> "{{ testText }}"</div>
      <div><strong>Cursor:</strong> {{ cursorPos }}</div>
      <div><strong>Current Tag:</strong> {{ currentTag }}</div>
      <div><strong>Suggestions:</strong> {{ suggestions.length }}</div>
    </div>
    
    <div v-if="suggestions.length > 0" class="mt-2 border rounded bg-white">
      <div class="font-bold p-2 bg-gray-50">Suggestions:</div>
      <div
        v-for="suggestion in suggestions"
        :key="suggestion.tag"
        class="p-2 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
        @click="insertTag(suggestion)"
      >
        {{ suggestion.icon }} {{ suggestion.syntax }} - {{ suggestion.description }}
      </div>
    </div>
    
    <button @click="showDebug = !showDebug" class="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
      {{ showDebug ? 'Hide' : 'Show' }} Debug
    </button>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useEditorTags } from '../../composables/useEditorTags'

export default {
  name: 'SimpleTagTest',
  setup() {
    const testText = ref('')
    const cursorPos = ref(0)
    const showDebug = ref(true)
    
    const { getTagAtPosition, getCompletionSuggestions } = useEditorTags()
    
    const currentTag = computed(() => {
      return getTagAtPosition(testText.value, cursorPos.value)
    })
    
    const suggestions = computed(() => {
      if (!currentTag.value) return []
      return getCompletionSuggestions(currentTag.value.text)
    })
    
    const handleInput = (event) => {
      testText.value = event.target.value
      cursorPos.value = event.target.selectionStart
    }
    
    const insertTag = (suggestion) => {
      if (!currentTag.value) return
      
      const before = testText.value.substring(0, currentTag.value.start)
      const after = testText.value.substring(currentTag.value.end)
      testText.value = before + suggestion.syntax + after
    }
    
    return {
      testText,
      cursorPos,
      showDebug,
      currentTag,
      suggestions,
      handleInput,
      insertTag
    }
  }
}
</script>