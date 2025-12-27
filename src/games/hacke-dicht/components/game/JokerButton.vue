<template>
  <button
    @click="$emit('click')"
    :disabled="disabled"
    :class="buttonClasses"
    :title="title"
    class="p-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-center"
  >
    <div class="relative">
      <img :src="image" :alt="title" class="w-14 h-14" />
      <!-- Durchstrich wenn benutzt -->
      <div v-if="joker.used" class="absolute inset-0 flex items-center justify-center">
        <div class="w-full h-0.5 bg-red-500 transform rotate-45"></div>
        <div class="absolute w-full h-0.5 bg-red-500 transform -rotate-45"></div>
      </div>
    </div>
  </button>
</template>

<script>
export default {
  name: 'JokerButton',
  props: {
    joker: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    image: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    colorScheme: {
      type: String,
      required: true,
      validator: (value) => ['blue', 'purple', 'green'].includes(value)
    }
  },
  emits: ['click'],
  computed: {
    buttonClasses() {
      if (this.joker.used) {
        return 'bg-gray-600/30 border-gray-400/30 opacity-50 cursor-not-allowed'
      }
      
      const schemes = {
        blue: 'bg-blue-600/30 border-blue-400/50 hover:bg-blue-600/50 cursor-pointer',
        purple: 'bg-purple-600/30 border-purple-400/50 hover:bg-purple-600/50 cursor-pointer',
        green: 'bg-green-600/30 border-green-400/50 hover:bg-green-600/50 cursor-pointer'
      }
      
      return schemes[this.colorScheme]
    }
  }
}
</script>