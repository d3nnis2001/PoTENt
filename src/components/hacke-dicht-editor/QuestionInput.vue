<template>
  <div>
    <label class="block text-white font-medium mb-2">Frage</label>
    <textarea
      :value="question"
      @input="$emit('update', $event.target.value)"
      class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
      rows="2"
      :placeholder="`Frage ${questionIndex} eingeben...`"
      required
    ></textarea>
  </div>
</template>

<script>
export default {
  name: 'QuestionInput',
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