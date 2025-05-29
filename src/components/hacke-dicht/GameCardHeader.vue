<template>
  <div class="flex justify-between items-start mb-4">
    <div class="flex-1">
      <div class="flex items-center gap-2 mb-1">
        <h3 class="text-lg font-semibold text-white group-hover:text-orange-200 transition-colors">
          {{ game.name }}
        </h3>
        <!-- Password Protection Indicator -->
        <PasswordIndicator v-if="game.isProtected" />
      </div>
      <p v-if="game.description" class="text-orange-200 text-sm mt-1">
        {{ game.description }}
      </p>
    </div>
    <DeleteButton @delete="$emit('delete')" />
  </div>
</template>

<script>
import PasswordIndicator from './PasswordIndicator.vue'
import DeleteButton from './DeleteButton.vue'

export default {
  name: 'GameCardHeader',
  components: {
    PasswordIndicator,
    DeleteButton
  },
  props: {
    game: {
      type: Object,
      required: true
    }
  },
  emits: ['delete']
}
</script>