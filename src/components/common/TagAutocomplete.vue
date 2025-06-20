<template>
  <div class="relative">
    <!-- Text Input with Tag Support -->
    <textarea
      ref="textareaRef"
      v-model="localValue"
      @input="handleInput"
      @keydown="handleKeydown"
      @click="handleCursorChange"
      @keyup="handleCursorChange"
      @focus="handleFocus"
      @blur="handleBlur"
      :placeholder="placeholder"
      :rows="rows"
      :class="inputClass"
    ></textarea>
    
    <!-- Command Palette Style Dropdown -->
    <div
      v-if="showSuggestions && suggestions.length > 0"
      class="absolute bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-hidden"
      :style="dropdownStyle"
    >
      <!-- Header -->
      <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span class="font-medium">📝 Commands</span>
          <span class="text-xs bg-gray-200 px-2 py-1 rounded">{{ suggestions.length }}</span>
        </div>
      </div>
      
      <!-- Categories -->
      <div class="max-h-64 overflow-y-auto">
        <div
          v-for="(category, categoryName) in groupedSuggestions"
          :key="categoryName"
          class="border-b border-gray-100 last:border-b-0"
        >
          <!-- Category Header -->
          <div class="bg-gray-25 px-4 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
            {{ categoryName }}
          </div>
          
          <!-- Commands in Category -->
          <div
            v-for="(suggestion, index) in category"
            :key="suggestion.tag"
            @click="applySuggestion(suggestion)"
            @mouseenter="hoveredIndex = getGlobalIndex(categoryName, index)"
            :class="[
              'px-4 py-3 cursor-pointer transition-all duration-150',
              getGlobalIndex(categoryName, index) === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
            ]"
          >
            <div class="flex items-start gap-3">
              <!-- Icon & Command -->
              <div class="flex-shrink-0">
                <span class="text-lg">{{ suggestion.icon }}</span>
              </div>
              
              <div class="flex-1 min-w-0">
                <!-- Command Name & Syntax -->
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-medium text-gray-900">{{ suggestion.label }}</span>
                  <code class="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-blue-600">
                    {{ suggestion.syntax }}
                  </code>
                </div>
                
                <!-- Description -->
                <p class="text-sm text-gray-600 mb-2">{{ suggestion.description }}</p>
                
                <!-- Parameters -->
                <div v-if="suggestion.parameters && suggestion.parameters.length > 0" class="space-y-1">
                  <div
                    v-for="param in suggestion.parameters"
                    :key="param.name"
                    class="flex items-center gap-2 text-xs"
                  >
                    <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-mono">
                      {{ param.name }}
                    </span>
                    <span class="text-gray-500">{{ param.description }}</span>
                    <span v-if="param.min !== undefined" class="text-gray-400">
                      ({{ param.min }}-{{ param.max }})
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Quick Insert Hint -->
              <div class="flex-shrink-0 text-xs text-gray-400">
                <kbd class="bg-gray-100 px-1.5 py-0.5 rounded text-xs">↵</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>↑↓ Navigate • ↵ Insert • Esc Close</span>
          <button
            @click="showAllCommands = !showAllCommands"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            {{ showAllCommands ? 'Hide' : 'Show All' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Help Panel (Show All Commands) -->
    <div
      v-if="showAllCommands"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
      @click="showAllCommands = false"
    >
      <div
        class="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
        @click.stop
      >
        <!-- Help Header -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold">📘 Available Commands</h2>
              <p class="text-blue-100 text-sm">Complete reference for all available tags</p>
            </div>
            <button
              @click="showAllCommands = false"
              class="text-white/80 hover:text-white"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Help Content -->
        <div class="max-h-[60vh] overflow-y-auto p-6">
          <div
            v-for="(categoryTags, categoryName) in getAllTagsByCategory()"
            :key="categoryName"
            class="mb-8 last:mb-0"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>{{ categoryName }}</span>
              <span class="text-xs bg-gray-200 px-2 py-1 rounded">{{ categoryTags.length }}</span>
            </h3>
            
            <div class="grid gap-4">
              <div
                v-for="tag in categoryTags"
                :key="tag.tag"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-start gap-3">
                  <span class="text-2xl">{{ tag.icon }}</span>
                  
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h4 class="font-medium text-gray-900">{{ tag.label }}</h4>
                      <code class="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-blue-600">
                        {{ tag.syntax }}
                      </code>
                    </div>
                    
                    <p class="text-gray-600 text-sm mb-3">{{ tag.description }}</p>
                    
                    <!-- Examples -->
                    <div v-if="tag.examples && tag.examples.length > 0" class="space-y-2">
                      <h5 class="text-xs font-medium text-gray-700 uppercase tracking-wide">Examples</h5>
                      <div class="space-y-1">
                        <div
                          v-for="example in tag.examples"
                          :key="example.code"
                          class="bg-gray-50 rounded p-2 text-sm"
                        >
                          <div class="flex items-center gap-2 mb-1">
                            <code class="font-mono text-blue-600">{{ example.code }}</code>
                            <span class="text-gray-400">→</span>
                            <span class="text-green-600 font-medium">{{ example.result }}</span>
                          </div>
                          <p class="text-gray-600 text-xs">{{ example.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'
import { useEditorTags } from '../../composables/useEditorTags'

export default {
  name: 'TagAutocomplete',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Schreibe hier... (verwende / für Commands)'
    },
    rows: {
      type: Number,
      default: 4
    },
    inputClass: {
      type: String,
      default: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const textareaRef = ref(null)
    const localValue = ref(props.modelValue)
    const cursorPosition = ref(0)
    const showSuggestions = ref(false)
    const selectedIndex = ref(0)
    const hoveredIndex = ref(-1)
    const dropdownPosition = ref({ top: 0, left: 0 })
    const showAllCommands = ref(false)
    const isFocused = ref(false)
    
    const { getTagAtPosition, getCompletionSuggestions, getTagsByCategory, getAllTags } = useEditorTags()
    
    // Sync with parent
    watch(() => props.modelValue, (newValue) => {
      localValue.value = newValue
    })
    
    watch(localValue, (newValue) => {
      emit('update:modelValue', newValue)
    })
    
    // Compute suggestions based on current cursor position
    const currentTag = computed(() => {
      const tag = getTagAtPosition(localValue.value, cursorPosition.value)
      console.log('🏷️ currentTag computed:', tag)
      return tag
    })
    
    const suggestions = computed(() => {
      if (!currentTag.value) {
        console.log('❌ No currentTag, no suggestions')
        return []
      }
      const sug = getCompletionSuggestions(currentTag.value.text)
      console.log('💡 suggestions computed:', sug)
      return sug
    })
    
    const groupedSuggestions = computed(() => {
      const groups = {}
      suggestions.value.forEach(suggestion => {
        const category = suggestion.category || 'Andere'
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push(suggestion)
      })
      return groups
    })
    
    const dropdownStyle = computed(() => ({
      top: `${dropdownPosition.value.top}px`,
      left: `${dropdownPosition.value.left}px`,
      minWidth: '500px',
      maxWidth: '600px'
    }))
    
    // Helper to get global index for keyboard navigation
    const getGlobalIndex = (categoryName, indexInCategory) => {
      let globalIndex = 0
      const categories = Object.keys(groupedSuggestions.value)
      
      for (const cat of categories) {
        if (cat === categoryName) {
          return globalIndex + indexInCategory
        }
        globalIndex += groupedSuggestions.value[cat].length
      }
      return 0
    }
    
    const getAllTagsByCategory = () => {
      return getTagsByCategory()
    }
    
    // Handle input changes
    const handleInput = (event) => {
      localValue.value = event.target.value
      updateCursorPosition()
      updateSuggestions()
    }
    
    const handleFocus = () => {
      isFocused.value = true
    }
    
    const handleBlur = () => {
      isFocused.value = false
      // Delay hiding suggestions to allow clicks
      setTimeout(() => {
        if (!isFocused.value) {
          showSuggestions.value = false
        }
      }, 150)
    }
    
    const handleCursorChange = () => {
      nextTick(() => {
        updateCursorPosition()
        updateSuggestions()
      })
    }
    
    const updateCursorPosition = () => {
      if (textareaRef.value) {
        cursorPosition.value = textareaRef.value.selectionStart
      }
    }
    
    const updateSuggestions = () => {
      console.log('🔍 updateSuggestions called')
      console.log('currentTag.value:', currentTag.value)
      console.log('suggestions.value:', suggestions.value)
      
      if (currentTag.value && currentTag.value.text.startsWith('/')) {
        console.log('✅ Should show suggestions for:', currentTag.value.text)
        showSuggestions.value = true
        selectedIndex.value = 0
        updateDropdownPosition()
      } else {
        console.log('❌ Not showing suggestions')
        showSuggestions.value = false
      }
    }
    
    const updateDropdownPosition = () => {
      if (!textareaRef.value || !currentTag.value) return
      
      const textarea = textareaRef.value
      const rect = textarea.getBoundingClientRect()
      
      dropdownPosition.value = {
        top: rect.bottom + 5,
        left: rect.left
      }
    }
    
    // Handle keyboard navigation
    const handleKeydown = (event) => {
      if (!showSuggestions.value || suggestions.value.length === 0) {
        // Show help on F1 or Ctrl+/
        if (event.key === 'F1' || (event.ctrlKey && event.key === '/')) {
          event.preventDefault()
          showAllCommands.value = true
        }
        return
      }
      
      const totalSuggestions = suggestions.value.length
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          selectedIndex.value = (selectedIndex.value + 1) % totalSuggestions
          break
        case 'ArrowUp':
          event.preventDefault()
          selectedIndex.value = selectedIndex.value <= 0 
            ? totalSuggestions - 1 
            : selectedIndex.value - 1
          break
        case 'Enter':
        case 'Tab':
          if (suggestions.value[selectedIndex.value]) {
            event.preventDefault()
            applySuggestion(suggestions.value[selectedIndex.value])
          }
          break
        case 'Escape':
          showSuggestions.value = false
          break
        case 'F1':
          event.preventDefault()
          showAllCommands.value = true
          break
      }
    }
    
    // Apply selected suggestion
    const applySuggestion = (suggestion) => {
      if (!currentTag.value) return
      
      const before = localValue.value.substring(0, currentTag.value.start)
      const after = localValue.value.substring(currentTag.value.end)
      const newText = before + suggestion.insertText + after
      
      localValue.value = newText
      showSuggestions.value = false
      
      // Set cursor position after inserted text
      nextTick(() => {
        if (textareaRef.value) {
          const newCursorPos = currentTag.value.start + suggestion.insertText.length
          textareaRef.value.setSelectionRange(newCursorPos, newCursorPos)
          textareaRef.value.focus()
        }
      })
    }
    
    return {
      textareaRef,
      localValue,
      showSuggestions,
      suggestions,
      groupedSuggestions,
      selectedIndex,
      hoveredIndex,
      dropdownStyle,
      showAllCommands,
      handleInput,
      handleKeydown,
      handleCursorChange,
      handleFocus,
      handleBlur,
      applySuggestion,
      getGlobalIndex,
      getAllTagsByCategory
    }
  }
}
</script>

<style scoped>
/* Smooth transitions */
.transition-all {
  transition: all 0.15s ease;
}

/* Custom scrollbar for better UX */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

kbd {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}
</style>