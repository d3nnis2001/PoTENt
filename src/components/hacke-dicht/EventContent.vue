<template>
  <div class="text-center p-6 bg-black/20 rounded-lg mb-8">
    <p class="text-white text-2xl leading-relaxed font-medium">{{ parsedText }}</p>
  </div>
</template>

<script>
import { computed, inject } from 'vue'
import { useEditorTags } from '../../composables/useEditorTags'

export default {
  name: 'EventContent',
  props: {
    text: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { parseTags } = useEditorTags()
    
    // Try to get player list from parent component or context
    const playerList = inject('playerList', [])
    
    const parsedText = computed(() => {
      return parseTags(props.text, playerList.value || playerList)
    })
    
    return {
      parsedText
    }
  }
}
</script>