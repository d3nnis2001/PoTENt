<template>
  <div>
    <label class="block text-white font-medium mb-2">Ereignis/Aufgabe</label>
    <textarea
      :value="eventQuestion.text"
      @input="$emit('update', $event.target.value)"
      class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
      rows="2"
      placeholder="z.B. Alle Spieler mit blauen Augen trinken einen Shot..."
      required
    ></textarea>
  </div>
</template>

<script>
export default {
  name: 'EventQuestionInput',
  props: {
    eventQuestion: {
      type: Object,
      required: true
    }
  },
  emits: ['update']
}
</script>