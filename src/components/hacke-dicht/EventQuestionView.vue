<template>
  <div class="h-[75vh] flex justify-center items-center relative overflow-hidden">
    <!-- Background Lightning Effect -->
    <div class="absolute inset-0 bg-yellow-400/10 animate-pulse"></div>
    <div class="absolute inset-0 opacity-30">
      <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-600/20 via-transparent to-yellow-600/20 animate-pulse"></div>
      <!-- Lightning Bolts -->
      <LightningBolt class="absolute top-10 left-10 w-16 h-16 text-yellow-400 animate-bounce" />
      <LightningBolt class="absolute top-20 right-20 w-12 h-12 text-yellow-300 animate-pulse" />
      <LightningBolt class="absolute bottom-20 left-20 w-20 h-20 text-yellow-500 animate-bounce" />
      <LightningBolt class="absolute bottom-10 right-10 w-14 h-14 text-yellow-400 animate-pulse" />
    </div>

    <!-- Event Content -->
    <div class="relative z-10 bg-gradient-to-br from-yellow-600/30 to-yellow-700/30 backdrop-blur-lg rounded-xl p-8 border-2 border-yellow-400/50 max-w-4xl shadow-2xl">
      <EventHeader />
      <EventContent :text="eventQuestion.text" />
      <EventActions @continue="$emit('continue')" />
    </div>
  </div>
</template>

<script>
import LightningBolt from './LightningBolt.vue'
import EventHeader from './EventHeader.vue'
import EventContent from './EventContent.vue'
import EventActions from './EventActions.vue'

export default {
  name: 'EventQuestionView',
  components: {
    LightningBolt,
    EventHeader,
    EventContent,
    EventActions
  },
  props: {
    eventQuestion: {
      type: Object,
      required: true
    }
  },
  emits: ['continue']
}
</script>