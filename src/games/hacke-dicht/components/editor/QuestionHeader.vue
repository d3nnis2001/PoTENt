<template>
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-lg font-bold text-white flex items-center gap-2">
      <span class="bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 rounded-full text-sm">
        Frage {{ questionIndex }}
      </span>
      <span class="text-orange-200 text-sm">
        ({{ rewardName }})
      </span>
    </h3>
    
    <!-- Add Event Question Button -->
    <button
      @click="$emit('add-event-question')"
      type="button"
      class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
      Ereignisfrage
    </button>
  </div>
</template>

<script>
export default {
  name: 'QuestionHeader',
  props: {
    questionIndex: {
      type: Number,
      required: true
    },
    rewardName: {
      type: String,
      required: true
    }
  },
  emits: ['add-event-question']
}
</script>