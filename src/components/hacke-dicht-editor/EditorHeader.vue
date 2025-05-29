<template>
  <div class="flex justify-between items-center mb-8">
    <HeaderContent 
      :is-editing="isEditing"
      @back="$emit('back')"
    />
    <SaveButton 
      :is-game-valid="isGameValid"
      :is-saving="isSaving"
      @save="$emit('save')"
    />
  </div>
</template>

<script>
import HeaderContent from './HeaderContent.vue'
import SaveButton from './SaveButton.vue'

export default {
  name: 'EditorHeader',
  components: {
    HeaderContent,
    SaveButton
  },
  props: {
    isEditing: {
      type: Boolean,
      required: true
    },
    isGameValid: {
      type: Boolean,
      required: true
    },
    isSaving: {
      type: Boolean,
      required: true
    }
  },
  emits: ['back', 'save']
}
</script>