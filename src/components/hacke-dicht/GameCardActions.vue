<template>
  <div class="flex gap-2">
    <PlayButton 
      :disabled="!isPlayable"
      :is-protected="game.isProtected"
      @play="$emit('play')"
    />
    <EditButton @edit="$emit('edit')" />
  </div>
</template>

<script>
import PlayButton from './PlayButton.vue'
import EditButton from './EditButton.vue'

export default {
  name: 'GameCardActions',
  components: {
    PlayButton,
    EditButton
  },
  props: {
    game: {
      type: Object,
      required: true
    },
    isPlayable: {
      type: Boolean,
      required: true
    }
  },
  emits: ['play', 'edit']
}
</script>