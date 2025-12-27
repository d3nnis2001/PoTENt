<template>
  <div class="bg-yellow-600/20 backdrop-blur-lg rounded-xl p-6 border border-yellow-400/30 ml-8">
    <EventQuestionHeader 
      :question-index="questionIndex"
      @remove="$emit('remove-event-question')"
    />

    <EventQuestionInput 
      :event-question="eventQuestion"
      @update="$emit('update-event-question', questionIndex, eventIndex, $event)"
    />
  </div>
</template>

<script>
import EventQuestionHeader from './EventQuestionHeader.vue'
import EventQuestionInput from './EventQuestionInput.vue'

export default {
  name: 'EventQuestionCard',
  components: {
    EventQuestionHeader,
    EventQuestionInput
  },
  props: {
    questionIndex: {
      type: Number,
      required: true
    },
    eventIndex: {
      type: Number,
      required: true
    },
    eventQuestion: {
      type: Object,
      required: true
    }
  },
  emits: ['update-event-question', 'remove-event-question']
}
</script>