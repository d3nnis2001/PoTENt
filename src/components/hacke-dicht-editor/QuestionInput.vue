<template>
  <div>
    <label class="block text-white font-medium mb-2">
      Frage
      <span class="text-orange-300 text-xs ml-2">💡 Verwende / für Commands</span>
    </label>
    <TagAutocomplete
      :model-value="question"
      @update:model-value="$emit('update', $event)"
      :rows="2"
      :input-class="'w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none font-mono'"
      :placeholder="`Frage ${questionIndex} eingeben... (verwende /random(x) für zufällige Spieler)`"
    />
  </div>
</template>

<script>
import TagAutocomplete from '../common/TagAutocomplete.vue'

export default {
  name: 'QuestionInput',
  components: {
    TagAutocomplete
  },
  props: {
    question: {
      type: String,
      required: true
    },
    questionIndex: {
      type: Number,
      required: true
    }
  },
  emits: ['update']
}
</script>