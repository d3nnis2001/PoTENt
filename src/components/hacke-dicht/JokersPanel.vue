<template>
  <div class="fixed top-4 left-4 z-40 flex flex-col gap-3">
    <!-- 50/50 Joker -->
    <JokerButton
      :joker="jokers.fiftyFifty"
      :disabled="jokers.fiftyFifty.used || gamePhase !== 'reading'"
      :image="joker50"
      title="50/50 Joker - Entfernt 2 falsche Antworten"
      color-scheme="blue"
      @click="$emit('use-joker', 'fiftyFifty')"
    />

    <!-- Random Person Joker -->
    <JokerButton
      :joker="jokers.randomPerson"
      :disabled="jokers.randomPerson.used || gamePhase !== 'reading'"
      :image="jokerrandom"
      title="Random Person Joker - Wählt zufällig einen Spieler aus"
      color-scheme="purple"
      @click="$emit('use-joker', 'randomPerson')"
    />

    <!-- Reveal Joker -->
    <JokerButton
      :joker="jokers.reveal"
      :disabled="jokers.reveal.used || gamePhase !== 'reading'"
      :image="jokerreveal"
      title="Reveal Joker - Alle müssen ihre Karten aufdecken"
      color-scheme="green"
      @click="$emit('use-joker', 'reveal')"
    />
  </div>
</template>

<script>
import JokerButton from './JokerButton.vue'
import joker50 from '../../assets/5050.png'
import jokerrandom from '../../assets/RandomPerson.png'
import jokerreveal from '../../assets/RevealJoker.png'

export default {
  name: 'JokersPanel',
  components: {
    JokerButton
  },
  props: {
    jokers: {
      type: Object,
      required: true
    },
    gamePhase: {
      type: String,
      required: true
    }
  },
  emits: ['use-joker'],
  setup() {
    return {
      joker50,
      jokerrandom,
      jokerreveal
    }
  }
}
</script>