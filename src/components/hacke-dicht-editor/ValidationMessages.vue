<template>
  <div class="mt-8 p-4 bg-red-600/20 border border-red-400/30 rounded-lg">
    <h3 class="text-red-400 font-semibold mb-2">Fehlende Angaben:</h3>
    <ul class="text-red-300 text-sm space-y-1">
      <li v-if="!gameData.name">• Spielname fehlt</li>
      <li v-if="usePassword && !gameData.password">• Passwort fehlt</li>
      <li v-if="gameData.rewards.some(r => !r.name)">• Alle Belohnungen müssen benannt werden</li>
      <li v-if="gameData.questions.some(q => !q.question)">• Alle Fragen müssen ausgefüllt werden</li>
      <li v-if="gameData.questions.some(q => q.answers.some(a => !a.text))">• Alle Antwortmöglichkeiten müssen ausgefüllt werden</li>
      <li v-if="gameData.questions.some(q => q.correctAnswer === null)">• Für jede Frage muss eine richtige Antwort markiert werden</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'ValidationMessages',
  props: {
    gameData: {
      type: Object,
      required: true
    },
    usePassword: {
      type: Boolean,
      required: true
    }
  }
}
</script>