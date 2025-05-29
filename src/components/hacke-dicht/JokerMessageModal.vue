<template>
  <div 
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" 
    @click="$emit('close')"
  >
    <div 
      class="bg-gradient-to-br from-purple-600/40 to-blue-600/40 backdrop-blur-lg rounded-xl p-8 border-2 border-purple-400/50 max-w-2xl shadow-2xl animate-pulse" 
      @click.stop
    >
      <div class="text-center">
        <div class="mb-4">
          <img 
            v-if="jokerMessage.type === 'fiftyFifty'" 
            :src="joker50" 
            alt="50/50 Joker" 
            class="w-16 h-16 mx-auto" 
          />
          <img 
            v-else-if="jokerMessage.type === 'randomPerson'" 
            :src="jokerrandom" 
            alt="Random Person Joker" 
            class="w-16 h-16 mx-auto" 
          />
          <img 
            v-else-if="jokerMessage.type === 'reveal'" 
            :src="jokerreveal" 
            alt="Reveal Joker" 
            class="w-16 h-16 mx-auto" 
          />
        </div>
        <h3 class="text-2xl font-bold text-white mb-4">{{ jokerMessage.title }}</h3>
        <p class="text-white text-lg leading-relaxed">{{ jokerMessage.text }}</p>
        <button
          @click="$emit('close')"
          class="mt-6 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-all"
        >
          Weiter
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import joker50 from '../../assets/5050.png'
import jokerrandom from '../../assets/RandomPerson.png'
import jokerreveal from '../../assets/RevealJoker.png'

export default {
  name: 'JokerMessageModal',
  props: {
    jokerMessage: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup() {
    return {
      joker50,
      jokerrandom,
      jokerreveal
    }
  }
}
</script>