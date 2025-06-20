<template>
  <div>
    <label class="block text-white font-medium mb-2">
      Ereignis/Aufgabe
      <span class="text-yellow-300 text-xs ml-2">💡 Verwende /random(x) für zufällige Spieler</span>
    </label>
    
    <!-- Test Component -->
    <SimpleTagTest />
    
    <TagAutocomplete
      :model-value="eventQuestion.text"
      @update:model-value="$emit('update', $event)"
      :rows="2"
      :input-class="'w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none font-mono'"
      placeholder="z.B. /random(2) müssen einen Shot trinken..."
    />
  </div>
</template>

<script>
import TagAutocomplete from '../common/TagAutocomplete.vue'
import SimpleTagTest from '../common/SimpleTagTest.vue'

export default {
  name: 'EventQuestionInput',
  components: {
    TagAutocomplete,
    SimpleTagTest
  },
  props: {
    eventQuestion: {
      type: Object,
      required: true
    }
  },
  emits: ['update']
}
</script>